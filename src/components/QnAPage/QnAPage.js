import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@clerk/clerk-react"; // Using Clerk for authentication
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
  createTheme
} from "@mui/material";
import { useNavigate } from "react-router-dom"; // Using React Router for navigation
import SimpleAppBar from "../SimpleAppBar/SimpleAppBar";

const QnAPage = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const [flashcards, setFlashcards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [darkMode, setDarkMode] = useState(false); // Dark mode state
  const navigate = useNavigate();

  // Handle generating flashcards based on the prompt
  const handleGenerateFlashcards = async () => {
    if (!prompt) {
      alert("Please enter a prompt.");
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
      alert('Error generating flashcards.');
    } finally {
      setLoading(false);
    }
  };

  const handleFlip = (id) => {
    setFlipped((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleGoBack = () => {
    setLoading(true); // Start loading animation
    navigate("/dashboard");
  };

  const theme = useMemo(() => {
    return createTheme({
      palette: {
        mode: darkMode ? "dark" : "light",
        primary: {
          main: "#2196f3"
        }
      }
    });
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  if (!isLoaded || !isSignedIn) return <></>;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth={false} disableGutters>
        <SimpleAppBar darkMode={darkMode} setDarkMode={toggleDarkMode} />
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Typography variant="h4" align="center" sx={{ mb: 4 }}>
                Q&A Flashcards
              </Typography>
              <Box sx={{ my: 2 }}>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows="4"
                  style={{ width: '100%', padding: '10px' }}
                  placeholder="Enter the topic or content to generate flashcards..."
                />
              </Box>
              <Button
                variant="contained"
                color="primary"
                onClick={handleGenerateFlashcards}
                disabled={loading}
              >
                {loading ? 'Generating Flashcards...' : 'Generate Flashcards'}
              </Button>

              <Grid container spacing={2} sx={{ mt: 4 }}>
                {flashcards.map((flashcard, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card>
                      <CardActionArea onClick={() => handleFlip(index)}>
                        <CardContent>
                          <Box
                            sx={{
                              perspective: "1000px",
                              "& > div": {
                                transition: "transform 0.6s",
                                transformStyle: "preserve-3d",
                                position: "relative",
                                width: "100%",
                                height: "200px",
                                boxShadow: "0 4px 8px 0 rgba(0,0,0,0.2)",
                                transform: flipped[index]
                                  ? "rotateY(180deg)"
                                  : "rotateY(0deg)"
                              },
                              "& > div > div": {
                                position: "absolute",
                                width: "100%",
                                height: "100%",
                                backfaceVisibility: "hidden",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                padding: 2,
                                boxSizing: "border-box"
                              },
                              "& > div > div:nth-of-type(2)": {
                                transform: "rotateY(180deg)"
                              }
                            }}
                          >
                            <div>
                              <div>
                                <Typography variant="h5" component="div">
                                  {flashcard.front}
                                </Typography>
                              </div>
                              <div>
                                <Typography variant="h5" component="div">
                                  {flashcard.back}
                                </Typography>
                              </div>
                            </div>
                          </Box>
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
                  Go Back
                </Button>
              </Stack>
            </>
          )}
        </Container>
      </Container>
    </ThemeProvider>
  );
};

export default QnAPage;
