use whisper_rs::{WhisperContext, WhisperContextParameters, FullParams, SamplingStrategy};
use std::path::PathBuf;
use rubato::{Resampler, SincFixedIn, SincInterpolationType, SincInterpolationParameters, WindowFunction};
use once_cell::sync::Lazy;
use parking_lot::Mutex;

static WHISPER_CTX: Lazy<Mutex<Option<WhisperContext>>> = Lazy::new(|| Mutex::new(None));

pub async fn initialize_whisper(app_data_dir: PathBuf) -> Result<(), String> {
    let model_path = app_data_dir.join("ggml-base.en.bin");
    
    if !model_path.exists() {
        // Automatically download the whisper model if it doesn't exist
        let url = "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.en.bin";
        println!("Downloading Whisper model to {:?}...", model_path);
        let response = reqwest::get(url).await.map_err(|e| format!("Failed to download model: {}", e))?;
        let bytes = response.bytes().await.map_err(|e| e.to_string())?;
        std::fs::write(&model_path, bytes).map_err(|e| e.to_string())?;
        println!("Download complete.");
    }
    
    let ctx = WhisperContext::new_with_params(
        model_path.to_str().unwrap(),
        WhisperContextParameters::default()
    ).map_err(|e| format!("Failed to load Whisper context: {}", e))?;
    
    *WHISPER_CTX.lock() = Some(ctx);
    Ok(())
}

pub fn transcribe_audio(raw_audio: Vec<f32>, sample_rate: u32, channels: u16) -> Result<String, String> {
    if raw_audio.is_empty() {
        return Ok(String::new());
    }

    let ctx_guard = WHISPER_CTX.lock();
    let ctx = ctx_guard.as_ref().ok_or("Whisper not initialized")?;
    
    // Downmix to mono
    let mono: Vec<f32> = if channels == 2 {
        raw_audio.chunks_exact(2).map(|chunk| (chunk[0] + chunk[1]) / 2.0).collect()
    } else {
        raw_audio
    };
    
    // Resample to 16kHz
    let resampled = if sample_rate != 16000 {
        let params = SincInterpolationParameters {
            sinc_len: 256,
            f_cutoff: 0.95,
            interpolation: SincInterpolationType::Linear,
            oversampling_factor: 256,
            window: WindowFunction::BlackmanHarris2,
        };
        // chunk_size needs to be appropriate. mono.len() can be used for a one-shot resample.
        let chunk_size = mono.len();
        let mut resampler = SincFixedIn::<f32>::new(
            16000.0 / sample_rate as f64,
            2.0,
            params,
            chunk_size,
            1,
        ).map_err(|e| e.to_string())?;
        
        let waves_in = vec![mono];
        let waves_out = resampler.process(&waves_in, None).map_err(|e| e.to_string())?;
        waves_out[0].clone()
    } else {
        mono
    };
    
    let mut state = ctx.create_state().map_err(|e| e.to_string())?;
    
    let mut params = FullParams::new(SamplingStrategy::Greedy { best_of: 1 });
    params.set_language(Some("en"));
    params.set_print_progress(false);
    params.set_print_special(false);
    params.set_print_realtime(false);
    params.set_print_timestamps(false);
    
    state.full(params, &resampled).map_err(|e| e.to_string())?;
    
    let num_segments = state.full_n_segments();
    let mut result = String::new();
    for i in 0..num_segments {
        if let Some(segment) = state.get_segment(i) {
            if let Ok(text) = segment.to_str() {
                result.push_str(text);
            }
        }
    }

    
    Ok(result.trim().to_string())
}
