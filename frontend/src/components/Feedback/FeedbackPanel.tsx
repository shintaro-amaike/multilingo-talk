import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Chip,
  Paper,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Grid,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  VolumeUp as VolumeUpIcon,
  School as SchoolIcon,
} from '@mui/icons-material';

interface FeedbackData {
  is_correct?: boolean;
  corrections?: string[];
  explanations?: string[];
  score?: number;
  issues?: string[];
  suggestions?: string[];
}

interface FeedbackPanelProps {
  feedbackType: 'grammar' | 'pronunciation' | 'vocabulary';
  onClose?: () => void;
  className?: string;
}

export const FeedbackPanel: React.FC<FeedbackPanelProps> = ({
  feedbackType,
  onClose,
  className,
}) => {
  const [userInput, setUserInput] = useState('');
  const [feedbackData, setFeedbackData] = useState<FeedbackData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!userInput.trim()) {
      setError('Please enter text to analyze');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Simulate API call - in production, would call actual API
      const mockFeedback: FeedbackData =
        feedbackType === 'grammar'
          ? {
              is_correct: false,
              corrections: ['I am going to school'],
              explanations: [
                "Use 'am' instead of 'is' with first person singular",
              ],
              score: 40,
            }
          : feedbackType === 'pronunciation'
            ? {
                score: 85,
                issues: ["Slightly mispronounced 'r' sound"],
                suggestions: ['Practice the rolled r', 'Listen to native speakers'],
              }
            : {
                score: 75,
                issues: [],
                suggestions: ['Good vocabulary choice'],
              };

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      setFeedbackData(mockFeedback);
    } catch (err) {
      setError('Failed to analyze text');
    } finally {
      setLoading(false);
    }
  };

  const renderGrammarFeedback = (feedback: FeedbackData) => (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {feedback.is_correct ? (
          <CheckIcon sx={{ color: 'success.main', mr: 1 }} />
        ) : (
          <CloseIcon sx={{ color: 'error.main', mr: 1 }} />
        )}
        <Typography variant="subtitle1">
          {feedback.is_correct ? 'Correct!' : 'Needs correction'}
        </Typography>
        {feedback.score !== undefined && (
          <Chip
            label={`${feedback.score}%`}
            color={feedback.score > 70 ? 'success' : 'warning'}
            size="small"
            sx={{ ml: 2 }}
          />
        )}
      </Box>

      {feedback.corrections && feedback.corrections.length > 0 && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: 'info.light' }}>
          <Typography variant="caption" color="textSecondary">
            Correction:
          </Typography>
          <Typography variant="body2">{feedback.corrections[0]}</Typography>
        </Paper>
      )}

      {feedback.explanations && feedback.explanations.length > 0 && (
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <SchoolIcon sx={{ mr: 1 }} />
            <Typography>Explanation</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              {feedback.explanations.map((exp, idx) => (
                <Typography key={idx} variant="body2" sx={{ mb: 1 }}>
                  • {exp}
                </Typography>
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>
      )}
    </Box>
  );

  const renderPronunciationFeedback = (feedback: FeedbackData) => (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <VolumeUpIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="subtitle1">Pronunciation Score</Typography>
        {feedback.score !== undefined && (
          <Chip
            label={`${feedback.score}%`}
            color={feedback.score > 80 ? 'success' : feedback.score > 60 ? 'warning' : 'error'}
            size="small"
            sx={{ ml: 2 }}
          />
        )}
      </Box>

      {feedback.score !== undefined && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="textSecondary">
            Accuracy
          </Typography>
          <LinearProgress
            variant="determinate"
            value={feedback.score}
            sx={{ mt: 0.5, height: 8, borderRadius: 1 }}
          />
        </Box>
      )}

      {feedback.issues && feedback.issues.length > 0 && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: 'warning.light' }}>
          <Typography variant="caption" color="textSecondary">
            Issues:
          </Typography>
          {feedback.issues.map((issue, idx) => (
            <Typography key={idx} variant="body2">
              • {issue}
            </Typography>
          ))}
        </Paper>
      )}

      {feedback.suggestions && feedback.suggestions.length > 0 && (
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Suggestions</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              {feedback.suggestions.map((sugg, idx) => (
                <Typography key={idx} variant="body2" sx={{ mb: 1 }}>
                  • {sugg}
                </Typography>
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>
      )}
    </Box>
  );

  return (
    <Card className={className}>
      <CardHeader
        title={
          feedbackType === 'grammar'
            ? '✏️ Grammar Check'
            : feedbackType === 'pronunciation'
              ? '🎤 Pronunciation Analysis'
              : '📚 Vocabulary'
        }
        action={
          onClose && (
            <Button size="small" onClick={onClose}>
              Close
            </Button>
          )
        }
      />
      <CardContent>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          {feedbackType === 'grammar'
            ? 'Get feedback on your grammar and sentence structure'
            : feedbackType === 'pronunciation'
              ? 'Check your pronunciation accuracy'
              : 'Learn more about vocabulary'}
        </Typography>

        <TextField
          fullWidth
          multiline
          rows={3}
          placeholder={
            feedbackType === 'grammar'
              ? 'Enter text to check grammar...'
              : feedbackType === 'pronunciation'
                ? 'Enter the text you spoke...'
                : 'Enter a word to learn...'
          }
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          disabled={loading}
          sx={{ mb: 2 }}
          size="small"
        />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Button
          variant="contained"
          fullWidth
          onClick={handleSubmit}
          disabled={loading || !userInput.trim()}
          sx={{ mb: 2 }}
        >
          {loading ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Analyzing...
            </>
          ) : (
            'Analyze'
          )}
        </Button>

        {feedbackData &&
          (feedbackType === 'grammar'
            ? renderGrammarFeedback(feedbackData)
            : renderPronunciationFeedback(feedbackData))}
      </CardContent>
    </Card>
  );
};

export default FeedbackPanel;
