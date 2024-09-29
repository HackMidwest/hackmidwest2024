import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Container,
  Grid,
  Typography,
  Stack,
  CircularProgress,
  CssBaseline,
  ThemeProvider,
  createTheme,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';

export default function Flashcard() {
  const [flashcards, setFlashcards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();
  const { id: search } = useParams(); // Get the search parameter from URL

  useEffect(() => {
    async function getFlashcards() {
      if (!search) {
        console.error("Missing search parameter.");
        return;
      }

      setLoading(true);
      try {
        // Call your backend API to generate flashcards using AWS Bedrock
        const response = await fetch('http://localhost:5000/flashcard', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt: search }), // Use 'search' as the prompt to generate flashcards
        });

        if (!response.ok) {
          throw new Error('Failed to generate flashcards');
        }

        const data = await response.json();
        const flashcardsData = data.flashcards.map((item, index) => ({
          id: `flashcard-${index}`,
          front: item.question,
          back: item.answer,
        }));

        setFlashcards(flashcardsData);
      } catch (error) {
        console.error("Error fetching flashcards:", error);
        alert("Error generating flashcards.");
      } finally {
        setLoading(false);
      }
    }
    getFlashcards();
  }, [search]);

  const handleFlip = (id) => {
    setFlipped((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleLearnClick = () => {
    if (search) {
      setLoading(true);
      navigate(`/flashcard/test/${search}`);
    } else {
      console.error("No collection ID available for navigation.");
    }
  };

  const handleGoBack = () => {
    setLoading(true);
    navigate("/flashcards");
  };

  const theme = useMemo(() => {
    return createTheme({
      palette: {
        mode: darkMode ? "dark" : "light",
        primary: {
          main: "#2196f3",
        },
      },
    });
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth={false} disableGutters>
        {/* AppBar */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', backgroundColor: '#2196f3', color: '#fff' }}>
          <Typography variant="h6">Flashcards App</Typography>
          <Button variant="text" color="inherit" onClick={toggleDarkMode}>
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </Button>
        </Box>

        <Container maxWidth="lg" sx={{ mt: 4 }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Grid container spacing={2} sx={{ mt: 4 }}>
                {flashcards.map((flashcard, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card>
                      <CardActionArea onClick={() => handleFlip(index)}>
                        <CardContent>
                          <Typography variant="h5" component="div">
                            {flipped[index] ? flashcard.back : flashcard.front}
                          </Typography>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              <Stack
                direction="row"
                justifyContent="center"
                spacing={2}
                sx={{ mt: 4, mb: 4 }}
              >
                <Button variant="contained" onClick={handleGoBack}>
                  Go back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleLearnClick}
                  sx={{
                    backgroundColor: "red",
                    "&:hover": { backgroundColor: "#8B0000" },
                  }}
                >
                  Learn
                </Button>
              </Stack>
            </>
          )}
        </Container>
      </Container>
    </ThemeProvider>
  );
}
