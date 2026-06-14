import React, { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Tabs,
  Tab,
  Alert,
  Chip,
  LinearProgress,
  BarChart,
} from '@mui/material';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Bar } from 'recharts';
import { analyticsAPI } from '../services/api';

interface Analytics {
  totalLearningTime: number;
  conversationsCompleted: number;
  averageScore: number;
  vocabularyLearned: number;
}

interface ProgressData {
  date: string;
  score: number;
  time: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const Analytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const response = await analyticsAPI.getProgress();
      if (response.success) {
        // Use mock data for now
        setAnalytics({
          totalLearningTime: 125,
          conversationsCompleted: 24,
          averageScore: 78,
          vocabularyLearned: 156,
        });

        // Mock progress data
        setProgressData([
          { date: 'Mon', score: 65, time: 15 },
          { date: 'Tue', score: 72, time: 20 },
          { date: 'Wed', score: 68, time: 18 },
          { date: 'Thu', score: 80, time: 25 },
          { date: 'Fri', score: 82, time: 22 },
          { date: 'Sat', score: 75, time: 17 },
          { date: 'Sun', score: 79, time: 20 },
        ]);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!analytics) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>No analytics data available yet.</Typography>
      </Container>
    );
  }

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom sx={{ mb: 2 }}>
        📊 Learning Analytics
      </Typography>

      <Tabs
        value={tabValue}
        onChange={(e, newValue) => setTabValue(newValue)}
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="Overview" id="analytics-tab-0" aria-controls="analytics-tabpanel-0" />
        <Tab label="Progress" id="analytics-tab-1" aria-controls="analytics-tabpanel-1" />
        <Tab label="Details" id="analytics-tab-2" aria-controls="analytics-tabpanel-2" />
      </Tabs>

      {/* Overview Tab */}
      <TabPanel value={tabValue} index={0}>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography color="textSecondary" gutterBottom>
                Total Learning Time
              </Typography>
              <Typography variant="h5">{analytics.totalLearningTime}</Typography>
              <Typography variant="body2" color="textSecondary">
                minutes
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography color="textSecondary" gutterBottom>
                Conversations
              </Typography>
              <Typography variant="h5">{analytics.conversationsCompleted}</Typography>
              <Typography variant="body2" color="textSecondary">
                completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography color="textSecondary" gutterBottom>
                Average Score
              </Typography>
              <Typography variant="h5">{analytics.averageScore}%</Typography>
              <Typography variant="body2" color="textSecondary">
                overall
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography color="textSecondary" gutterBottom>
                Vocabulary Learned
              </Typography>
              <Typography variant="h5">{analytics.vocabularyLearned}</Typography>
              <Typography variant="body2" color="textSecondary">
                words
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      </TabPanel>

      {/* Progress Tab */}
      <TabPanel value={tabValue} index={1}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Weekly Progress
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="score" stroke="#8884d8" name="Score" />
                  <Line type="monotone" dataKey="time" stroke="#82ca9d" name="Time (min)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Learning Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Grammar', value: 30 },
                      { name: 'Vocabulary', value: 25 },
                      { name: 'Pronunciation', value: 20 },
                      { name: 'Listening', value: 25 },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      </TabPanel>

      {/* Details Tab */}
      <TabPanel value={tabValue} index={2}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Study Time Trend</Typography>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="time" stroke="#ff7c7c" name="Minutes" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Language Progress</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">English</Typography>
                    <Typography variant="caption">65%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={65} />
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Japanese</Typography>
                    <Typography variant="caption">80%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={80} color="success" />
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Mandarin</Typography>
                    <Typography variant="caption">45%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={45} color="warning" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      </TabPanel>
    </Container>
  );
};

export default Analytics;
