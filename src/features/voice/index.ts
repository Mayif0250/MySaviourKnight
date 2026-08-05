export interface VoiceServiceConfig {
  sampleRate: number;
  autoStop: boolean;
}

export class VoiceService {
  static isSupported(): boolean {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  }
}
