import axios, { AxiosInstance } from 'axios';
import { ApiResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Token がある場合は Authorization header に追加
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 認証エラーの場合、localStorage をクリアしてリダイレクト
      localStorage.removeItem('authToken');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Conversation API
export const conversationAPI = {
  // Conversation を作成
  create: (data: {
    topic: string;
    difficulty: string;
    languagePair: string;
  }): Promise<ApiResponse> =>
    api.post('/conversations/create', data).then((res) => res.data),

  // Conversation を取得
  get: (id: string): Promise<ApiResponse> =>
    api.get(`/conversations/${id}`).then((res) => res.data),

  // Conversation 一覧を取得
  list: (): Promise<ApiResponse> =>
    api.get('/conversations').then((res) => res.data),

  // Conversation を削除
  delete: (id: string): Promise<ApiResponse> =>
    api.delete(`/conversations/${id}`).then((res) => res.data),
};

// Message API
export const messageAPI = {
  // メッセージを取得
  list: (conversationId: string): Promise<ApiResponse> =>
    api.get(`/conversations/${conversationId}/messages`).then((res) => res.data),

  // メッセージを送信
  send: (conversationId: string, data: {
    text: string;
    audioUrl?: string;
  }): Promise<ApiResponse> =>
    api.post(`/conversations/${conversationId}/messages`, data).then((res) => res.data),
};

// Speech API
export const speechAPI = {
  // 音声認識
  recognize: (data: FormData): Promise<ApiResponse> =>
    api.post('/speech/recognize', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((res) => res.data),

  // 音声合成
  synthesize: (data: {
    text: string;
    language: string;
    voiceId?: string;
  }): Promise<ApiResponse> =>
    api.post('/speech/synthesize', data).then((res) => res.data),
};

// Feedback API
export const feedbackAPI = {
  // 発音評価
  getPronunciationFeedback: (data: {
    audioUrl: string;
    language: string;
    word: string;
  }): Promise<ApiResponse> =>
    api.post('/feedback/pronunciation', data).then((res) => res.data),

  // 文法チェック
  getGrammarFeedback: (data: {
    text: string;
    language: string;
  }): Promise<ApiResponse> =>
    api.post('/feedback/grammar', data).then((res) => res.data),

  // 語彙提案
  getVocabularySuggestions: (data: {
    text: string;
    language: string;
  }): Promise<ApiResponse> =>
    api.post('/vocabulary/suggestions', data).then((res) => res.data),
};

// Analytics API
export const analyticsAPI = {
  // 進捗を取得
  getProgress: (): Promise<ApiResponse> =>
    api.get('/analytics/progress').then((res) => res.data),

  // 統計を取得
  getStatistics: (): Promise<ApiResponse> =>
    api.get('/analytics/statistics').then((res) => res.data),
};

// User API
export const userAPI = {
  // ユーザープロフィール取得
  getProfile: (): Promise<ApiResponse> =>
    api.get('/users/profile').then((res) => res.data),

  // ユーザー情報を更新
  updateProfile: (data: any): Promise<ApiResponse> =>
    api.put('/users/profile', data).then((res) => res.data),

  // 設定を取得
  getSettings: (): Promise<ApiResponse> =>
    api.get('/users/settings').then((res) => res.data),

  // 設定を更新
  updateSettings: (data: any): Promise<ApiResponse> =>
    api.put('/users/settings', data).then((res) => res.data),
};

export default api;
