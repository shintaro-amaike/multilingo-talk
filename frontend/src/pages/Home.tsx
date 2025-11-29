import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCurrentConversation } from '../store/conversationSlice';
import { conversationAPI } from '../services/api';
import { LANGUAGE_PAIRS, TOPICS, DIFFICULTIES } from '../constants/languages';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [topic, setTopic] = useState('daily');
  const [difficulty, setDifficulty] = useState('beginner');
  const [languagePair, setLanguagePair] = useState('en-ja');
  const [isLoading, setIsLoading] = useState(false);

  const handleStartConversation = async () => {
    setIsLoading(true);
    try {
      const response = await conversationAPI.create({
        topic,
        difficulty,
        languagePair,
      });

      if (response.success && response.data) {
        dispatch(setCurrentConversation(response.data));
        navigate('/chat');
      }
    } catch (error) {
      console.error('Failed to start conversation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
          Welcome to MultiLingo Talk
        </Typography>

        <Typography variant="body1" sx={{ mb: 4, textAlign: 'center', color: 'text.secondary' }}>
          Practice your language skills through natural conversations with AI
        </Typography>

        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Start a New Conversation
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Language Pair</InputLabel>
                <Select
                  value={languagePair}
                  label="Language Pair"
                  onChange={(e) => setLanguagePair(e.target.value)}
                >
                  {LANGUAGE_PAIRS.map((lang) => (
                    <MenuItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Topic</InputLabel>
                <Select
                  value={topic}
                  label="Topic"
                  onChange={(e) => setTopic(e.target.value)}
                >
                  {TOPICS.map((t) => (
                    <MenuItem key={t.value} value={t.value}>
                      {t.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Difficulty Level</InputLabel>
                <Select
                  value={difficulty}
                  label="Difficulty Level"
                  onChange={(e) => setDifficulty(e.target.value)}
                >
                  {DIFFICULTIES.map((d) => (
                    <MenuItem key={d.value} value={d.value}>
                      {d.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </CardContent>

          <CardActions>
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={handleStartConversation}
              disabled={isLoading}
            >
              {isLoading ? 'Starting...' : 'Start Conversation'}
            </Button>
          </CardActions>
        </Card>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🎤 Voice Practice
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Practice pronunciation with real-time feedback
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📊 Track Progress
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Monitor your learning with detailed analytics
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🌍 Multiple Languages
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Learn from English, Spanish, French and more
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  💡 AI-Powered Learning
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Get personalized feedback and corrections
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Home;
