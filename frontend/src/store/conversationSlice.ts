import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Conversation, Message } from '../types';

interface ConversationState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ConversationState = {
  conversations: [],
  currentConversation: null,
  messages: [],
  isLoading: false,
  error: null,
};

const conversationSlice = createSlice({
  name: 'conversation',
  initialState,
  reducers: {
    setConversations: (state, action: PayloadAction<Conversation[]>) => {
      state.conversations = action.payload;
    },
    addConversation: (state, action: PayloadAction<Conversation>) => {
      state.conversations.push(action.payload);
    },
    setCurrentConversation: (state, action: PayloadAction<Conversation | null>) => {
      state.currentConversation = action.payload;
    },
    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },
    deleteConversation: (state, action: PayloadAction<string>) => {
      state.conversations = state.conversations.filter(
        (conv) => conv.id !== action.payload
      );
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setConversations,
  addConversation,
  setCurrentConversation,
  setMessages,
  addMessage,
  deleteConversation,
  setLoading,
  setError,
} = conversationSlice.actions;

export default conversationSlice.reducer;
