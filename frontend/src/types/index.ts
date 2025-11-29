// User
export interface User {
  id: string;
  username: string;
  email?: string;
  nativeLanguage: string;
  learningLanguage: string;
  createdAt: Date;
}

// Conversation
export interface Conversation {
  id: string;
  userId: string;
  topic: string; // daily, business, travel, technology, custom
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  languagePair: string; // e.g., "en-ja"
  createdAt: Date;
  updatedAt: Date;
}

// Message
export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  translation?: string; // translated to native language
  audioUrl?: string;
  createdAt: Date;
}

// Settings
export interface Settings {
  userId: string;
  darkMode: boolean;
  soundEnabled: boolean;
  autoTranslate: boolean;
  playbackSpeed: number; // 0.5 - 2.0
  volume: number; // 0 - 100
}

// Feedback
export interface Feedback {
  type: 'pronunciation' | 'grammar' | 'vocabulary';
  score: number; // 0-100
  message: string;
  details?: string;
  suggestions?: string[];
}

// Analytics
export interface Analytics {
  userId: string;
  totalLearningTime: number; // in minutes
  conversationsCompleted: number;
  averageScore: number;
  vocabularyLearned: number;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
