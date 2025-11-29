import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Box,
  Paper,
  TextField,
  IconButton,
  CircularProgress,
  ToggleButton,
  Tooltip,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
} from '@mui/material';
import { Send, Translate, Home as HomeIcon } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store/store';
import { addMessage, setLoading, setError } from '../store/conversationSlice';
import { messageAPI } from '../services/api';
import { RecordButton } from '../components/Voice';
import { LANGUAGES } from '../constants/languages';

const Chat: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const messagesState = useSelector((state: RootState) => state.conversation.messages);
  const currentConversation = useSelector((state: RootState) => state.conversation.currentConversation);
  const isLoading = useSelector((state: RootState) => state.conversation.isLoading);
  const autoTranslate = useSelector((state: RootState) => state.settings.settings?.autoTranslate);

  const [inputText, setInputText] = useState('');
  const [showTranslation, setShowTranslation] = useState(autoTranslate || false);
  const [voiceInputText, setVoiceInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesState]);

  useEffect(() => {
    if (currentConversation) {
      loadMessages();
    }
  }, [currentConversation?.id]);

  const loadMessages = async () => {
    if (!currentConversation) return;
    dispatch(setLoading(true));
    try {
      const response = await messageAPI.list(currentConversation.id);
      // Messages loaded
    } catch (error) {
      dispatch(setError('Failed to load messages'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleSendMessage = async () => {
    const textToSend = voiceInputText || inputText;
    if (!textToSend.trim() || !currentConversation) return;

    const userMessage = {
      id: `user-${new Date().getTime()}`,
      conversationId: currentConversation.id,
      role: 'user' as const,
      content: textToSend,
      createdAt: new Date(),
    };

    dispatch(addMessage(userMessage));
    setInputText('');
    setVoiceInputText('');

    dispatch(setLoading(true));
    try {
      const response = await messageAPI.send(currentConversation.id, {
        text: textToSend,
      });

      if (response.success && response.data?.ai_message) {
        dispatch(addMessage(response.data.ai_message));
      }
    } catch (error) {
      dispatch(setError('Failed to send message'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleVoiceTranscript = (transcript: string) => {
    setVoiceInputText(transcript);
  };

  if (!currentConversation) {
    return (
      <Container>
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            No conversation selected
          </Typography>
          <Button onClick={() => navigate('/')} variant="contained">
            Start a new conversation
          </Button>
        </Box>
      </Container>
    );
  }

  const [learningLang, nativeLang] = currentConversation.language_pair.split('-');
  const learningLanguageInfo = LANGUAGES[learningLang];

  return (
    <Container maxWidth="md" sx={{ py: 2, display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 200px)' }}>
      <Card sx={{ mb: 2, backgroundColor: 'primary.light' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6">
                {learningLanguageInfo?.flag} {learningLanguageInfo?.name} Practice
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Chip label={currentConversation.topic} size="small" variant="outlined" />
                <Chip label={currentConversation.difficulty} size="small" variant="outlined" color="secondary" />
              </Box>
            </Box>
            <Tooltip title="Go home">
              <IconButton onClick={() => navigate('/')}>
                <HomeIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 3, pr: 1 }}>
        {messagesState.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Start a conversation
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Your messages will appear here
              </Typography>
            </CardContent>
          </Card>
        ) : (
          messagesState.map((message) => (
            <Box key={message.id} sx={{ mb: 2, display: 'flex', justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <Paper sx={{ p: 2, maxWidth: '70%', backgroundColor: message.role === 'user' ? 'primary.main' : 'grey.200', color: message.role === 'user' ? 'primary.contrastText' : 'text.primary' }}>
                <Box>{message.content}</Box>
                {showTranslation && message.translation && (
                  <Box sx={{ mt: 1, fontSize: '0.9em', opacity: 0.8 }}>{message.translation}</Box>
                )}
              </Paper>
            </Box>
          ))
        )}
        {isLoading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}><CircularProgress /></Box>}
        <div ref={messagesEndRef} />
      </Box>

      {voiceInputText && (
        <Card sx={{ mb: 2, backgroundColor: 'info.light' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Box><Typography variant="caption">Voice Input:</Typography><Typography variant="body2">{voiceInputText}</Typography></Box>
              <IconButton size="small" onClick={() => setVoiceInputText('')}>x</IconButton>
            </Box>
          </CardContent>
        </Card>
      )}

      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <ToggleButton value="translate" selected={showTranslation} onChange={() => setShowTranslation(!showTranslation)} size="small">
            <Translate />
          </ToggleButton>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <TextField fullWidth placeholder="Type message..." value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }} disabled={isLoading} multiline maxRows={3} size="small" />
          <IconButton color="primary" onClick={handleSendMessage} disabled={!inputText.trim() && !voiceInputText.trim() || isLoading}>
            <Send />
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <RecordButton onTranscript={handleVoiceTranscript} language={learningLanguageInfo?.speechRecognitionCode || 'en-US'} disabled={isLoading} />
          <Typography variant="caption" color="textSecondary">Click microphone to record</Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Chat;
