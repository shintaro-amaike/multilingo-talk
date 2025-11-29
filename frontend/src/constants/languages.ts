/**
 * Language Configuration
 * Top 10 most spoken languages by number of speakers
 */

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  speechRecognitionCode: string;
  textToSpeechCode: string;
  speakers: number; // approximate speakers in millions
  flag: string;
}

export const LANGUAGES: Record<string, Language> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    speechRecognitionCode: 'en-US',
    textToSpeechCode: 'en-US',
    speakers: 1500,
    flag: '🇺🇸',
  },
  zh: {
    code: 'zh',
    name: 'Mandarin Chinese',
    nativeName: '中文 (普通话)',
    speechRecognitionCode: 'zh-CN',
    textToSpeechCode: 'zh-CN',
    speakers: 1120,
    flag: '🇨🇳',
  },
  hi: {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    speechRecognitionCode: 'hi-IN',
    textToSpeechCode: 'hi-IN',
    speakers: 637,
    flag: '🇮🇳',
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    speechRecognitionCode: 'es-ES',
    textToSpeechCode: 'es-ES',
    speakers: 559,
    flag: '🇪🇸',
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    speechRecognitionCode: 'fr-FR',
    textToSpeechCode: 'fr-FR',
    speakers: 280,
    flag: '🇫🇷',
  },
  ar: {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    speechRecognitionCode: 'ar-SA',
    textToSpeechCode: 'ar-SA',
    speakers: 375,
    flag: '🇸🇦',
  },
  pt: {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    speechRecognitionCode: 'pt-BR',
    textToSpeechCode: 'pt-BR',
    speakers: 264,
    flag: '🇧🇷',
  },
  ru: {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    speechRecognitionCode: 'ru-RU',
    textToSpeechCode: 'ru-RU',
    speakers: 258,
    flag: '🇷🇺',
  },
  ja: {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    speechRecognitionCode: 'ja-JP',
    textToSpeechCode: 'ja-JP',
    speakers: 125,
    flag: '🇯🇵',
  },
  ko: {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    speechRecognitionCode: 'ko-KR',
    textToSpeechCode: 'ko-KR',
    speakers: 82,
    flag: '🇰🇷',
  },
};

export const LANGUAGE_CODES = Object.keys(LANGUAGES);

export const LANGUAGE_OPTIONS = LANGUAGE_CODES.map((code) => ({
  value: code,
  label: `${LANGUAGES[code].flag} ${LANGUAGES[code].name}`,
}));

export const NATIVE_LANGUAGE_OPTIONS = LANGUAGE_CODES.map((code) => ({
  value: code,
  label: `${LANGUAGES[code].flag} ${LANGUAGES[code].nativeName}`,
}));

// Language pairs for conversation (learning language -> native language)
export const LANGUAGE_PAIRS = [
  { value: 'en-ja', label: '🇺🇸 English → 🇯🇵 日本語' },
  { value: 'en-zh', label: '🇺🇸 English → 🇨🇳 中文' },
  { value: 'en-es', label: '🇺🇸 English → 🇪🇸 Español' },
  { value: 'en-fr', label: '🇺🇸 English → 🇫🇷 Français' },
  { value: 'en-ko', label: '🇺🇸 English → 🇰🇷 한국어' },
  { value: 'en-ar', label: '🇺🇸 English → 🇸🇦 العربية' },
  { value: 'en-pt', label: '🇺🇸 English → 🇧🇷 Português' },
  { value: 'en-ru', label: '🇺🇸 English → 🇷🇺 Русский' },
  { value: 'en-hi', label: '🇺🇸 English → 🇮🇳 हिन्दी' },

  { value: 'zh-en', label: '🇨🇳 中文 → 🇺🇸 English' },
  { value: 'zh-ja', label: '🇨🇳 中文 → 🇯🇵 日本語' },
  { value: 'zh-es', label: '🇨🇳 中文 → 🇪🇸 Español' },

  { value: 'ja-en', label: '🇯🇵 日本語 → 🇺🇸 English' },
  { value: 'ja-zh', label: '🇯🇵 日本語 → 🇨🇳 中文' },

  { value: 'es-en', label: '🇪🇸 Español → 🇺🇸 English' },
  { value: 'es-fr', label: '🇪🇸 Español → 🇫🇷 Français' },

  { value: 'fr-en', label: '🇫🇷 Français → 🇺🇸 English' },
  { value: 'fr-es', label: '🇫🇷 Français → 🇪🇸 Español' },

  { value: 'ko-en', label: '🇰🇷 한국어 → 🇺🇸 English' },
  { value: 'ko-ja', label: '🇰🇷 한국어 → 🇯🇵 日本語' },

  { value: 'ar-en', label: '🇸🇦 العربية → 🇺🇸 English' },

  { value: 'pt-en', label: '🇧🇷 Português → 🇺🇸 English' },

  { value: 'ru-en', label: '🇷🇺 Русский → 🇺🇸 English' },

  { value: 'hi-en', label: '🇮🇳 हिन्दी → 🇺🇸 English' },
];

export const TOPICS = [
  { value: 'daily', label: '💬 Daily Conversation' },
  { value: 'business', label: '💼 Business' },
  { value: 'travel', label: '✈️ Travel' },
  { value: 'technology', label: '💻 Technology' },
  { value: 'culture', label: '🎭 Culture' },
  { value: 'sports', label: '⚽ Sports' },
  { value: 'food', label: '🍽️ Food & Cuisine' },
  { value: 'health', label: '🏥 Health' },
  { value: 'education', label: '📚 Education' },
  { value: 'entertainment', label: '🎬 Entertainment' },
];

export const DIFFICULTIES = [
  { value: 'beginner', label: '🟢 Beginner (A1-A2)' },
  { value: 'intermediate', label: '🟡 Intermediate (B1-B2)' },
  { value: 'advanced', label: '🔴 Advanced (C1-C2)' },
];
