import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Grid,
  Card,
  CardContent,
} from '@mui/material';

const QnAPage = () => {
  const [prompt, setPrompt] = useState("");
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleGenerateFlashcards = async () => {
    if (!prompt) {
      alert("Please enter a prompt first");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5044/qnapage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate flashcards');
      }

      const data = await response.json();
      setFlashcards(data.flashcards);
    } catch (error) {
      console.error('Error generating flashcards:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Box>
        <Typography variant="h4" gutterBottom>
          Generate Q&A Flashcards
        </Typography>
        <Typography variant="body1" gutterBottom>
          Enter a topic, and our AI will generate flashcards in Q&A format to help you learn.
        </Typography>
        <TextField
          label="Enter Topic"
          fullWidth
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          sx={{ mt: 2 }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleGenerateFlashcards}
          sx={{ mt: 2 }}
        >
          Generate Flashcards
        </Button>

        {loading && (
          <Box sx={{ mt: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {flashcards.length > 0 && (
          <Grid container spacing={4} sx={{ mt: 4 }}>
            {flashcards.map((flashcard, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" component="div">
                      Question: {flashcard.question}
                    </Typography>
                    <Typography variant="body1">
                      Answer: {flashcard.answer}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default QnAPage;
