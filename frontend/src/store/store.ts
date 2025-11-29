import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import conversationReducer from './conversationSlice';
import settingsReducer from './settingsSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    conversation: conversationReducer,
    settings: settingsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
