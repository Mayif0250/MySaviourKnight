use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use parking_lot::Mutex;
use std::sync::Arc;
use std::sync::atomic::{AtomicBool, Ordering};
use std::thread;
use once_cell::sync::Lazy;

pub static AUDIO_BUFFER: Lazy<Arc<Mutex<Vec<f32>>>> = Lazy::new(|| Arc::new(Mutex::new(Vec::new())));
pub static RECORDING_CONFIG: Lazy<Arc<Mutex<Option<(u32, u16)>>>> = Lazy::new(|| Arc::new(Mutex::new(None)));
pub static IS_RECORDING: AtomicBool = AtomicBool::new(false);

pub fn start_loopback_recording() -> Result<(), String> {
    if IS_RECORDING.load(Ordering::SeqCst) {
        return Err("Already recording".into());
    }

    AUDIO_BUFFER.lock().clear();
    IS_RECORDING.store(true, Ordering::SeqCst);

    thread::spawn(|| {
        let host = match cpal::host_from_id(cpal::HostId::Wasapi) {
            Ok(h) => h,
            Err(e) => {
                eprintln!("WASAPI not available: {}", e);
                IS_RECORDING.store(false, Ordering::SeqCst);
                return;
            }
        };

        let device = match host.default_output_device() {
            Some(d) => d,
            None => {
                eprintln!("No default output device available");
                IS_RECORDING.store(false, Ordering::SeqCst);
                return;
            }
        };

        let config = match device.default_output_config() {
            Ok(c) => c,
            Err(e) => {
                eprintln!("Failed to get default config: {}", e);
                IS_RECORDING.store(false, Ordering::SeqCst);
                return;
            }
        };

        let err_fn = |err| eprintln!("An error occurred on the audio stream: {}", err);
        let sample_rate = config.sample_rate().0;
        let channels = config.channels();

        *RECORDING_CONFIG.lock() = Some((sample_rate, channels));

        let stream_result = match config.sample_format() {
            cpal::SampleFormat::F32 => {
                device.build_input_stream(
                    &config.into(),
                    move |data: &[f32], _: &cpal::InputCallbackInfo| {
                        let mut buffer = AUDIO_BUFFER.lock();
                        buffer.extend_from_slice(data);
                    },
                    err_fn,
                    None,
                )
            },
            cpal::SampleFormat::I16 => {
                device.build_input_stream(
                    &config.into(),
                    move |data: &[i16], _: &cpal::InputCallbackInfo| {
                        let mut buffer = AUDIO_BUFFER.lock();
                        buffer.extend(data.iter().map(|&s| s as f32 / i16::MAX as f32));
                    },
                    err_fn,
                    None,
                )
            },
            _ => {
                eprintln!("Unsupported sample format");
                IS_RECORDING.store(false, Ordering::SeqCst);
                return;
            }
        };

        let stream = match stream_result {
            Ok(s) => s,
            Err(e) => {
                eprintln!("Failed to build stream: {}", e);
                IS_RECORDING.store(false, Ordering::SeqCst);
                return;
            }
        };

        if let Err(e) = stream.play() {
            eprintln!("Failed to play stream: {}", e);
            IS_RECORDING.store(false, Ordering::SeqCst);
            return;
        }

        while IS_RECORDING.load(Ordering::SeqCst) {
            thread::sleep(std::time::Duration::from_millis(50));
        }
        
        // Stream goes out of scope here and is dropped.
    });
    
    Ok(())
}

pub fn stop_loopback_recording() -> Result<(Vec<f32>, u32, u16), String> {
    IS_RECORDING.store(false, Ordering::SeqCst);
    
    // Give the thread a moment to drop the stream
    thread::sleep(std::time::Duration::from_millis(100));
    
    let config = RECORDING_CONFIG.lock().take().ok_or("No recording config")?;
    let data = AUDIO_BUFFER.lock().clone();
    
    Ok((data, config.0, config.1))
}
