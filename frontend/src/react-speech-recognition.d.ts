declare module 'react-speech-recognition' {
  export interface Command {
    command: string | string[] | RegExp;
    callback: (...args: any[]) => any;
    matchInterim?: boolean;
    isFuzzyMatch?: boolean;
    fuzzyMatchingThreshold?: number;
    bestMatchOnly?: boolean;
  }

  export interface SpeechRecognitionOptions {
    commands?: Command[];
    transcribing?: boolean;
    clearTranscriptOnListen?: boolean;
    continuous?: boolean;
    language?: string;
  }

  export interface SpeechRecognition {
    startListening: (options?: SpeechRecognitionOptions) => void;
    stopListening: () => void;
    abortListening: () => void;
    browserSupportsSpeechRecognition: boolean;
    getRecognition: () => SpeechRecognition;
  }

  export interface UseSpeechRecognitionResult {
    transcript: string;
    interimTranscript: string;
    finalTranscript: string;
    resetTranscript: () => void;
    listening: boolean;
    browserSupportsSpeechRecognition: boolean;
    isMicrophoneAvailable: boolean;
  }

  export function useSpeechRecognition(options?: SpeechRecognitionOptions): UseSpeechRecognitionResult;

  const SpeechRecognition: SpeechRecognition;
  export default SpeechRecognition;
} 