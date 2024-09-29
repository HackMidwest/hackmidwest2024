import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Container,
  Paper,
  TextField,
  Typography,
  CircularProgress,
  CssBaseline,
  Grid,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";

export default function Generate() {
  const [flashcards, setFlashcards] = useState([]);
  const [flipped, setFlipped] = useState({});
  const [text, setText] = useState("");
  const [darkMode] = useState(false);
  const [loading, setLoading] = useState(false); // Loading state
  const navigate = useNavigate();

  useEffect(() => {
    const isUserAuthenticated = true; // Placeholder for actual authentication check
    if (!isUserAuthenticated) {
      navigate("/sign-in");
    }
  }, [navigate]);

  const handleSubmit = async () => {
    setLoading(true); // Start loading
    try {
      const response = await fetch("http://localhost:5044/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: text }),
      });

      if (!response.ok) {
        throw new Error("Error generating flashcards");
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const flashcardsData = data.flashcards.map((item, index) => ({
        id: `flashcard-${index}`,
        front: item.question,
        back: item.answer,
      }));

      setFlashcards(flashcardsData);
    } catch (error) {
      console.error("Error generating flashcards:", error);
      alert(`Error generating flashcards: ${error.message}`);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const handleFlip = (id) => {
    setFlipped((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth={false} disableGutters>
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Box
            sx={{
              mb: 6,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography variant="h4" gutterBottom>
              Generate Flashcards
            </Typography>
            <Paper sx={{ p: 4, width: "100%", boxShadow: 3 }}>
              <TextField
                value={text}
                onChange={(e) => setText(e.target.value)}
                label="Enter text"
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                sx={{
                  mb: 2,
                }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                fullWidth
                sx={{
                  py: 1.5,
                  fontSize: "1.1rem",
                }}
                disabled={loading} // Disable the button when loading
              >
                {loading ? <CircularProgress size={24} /> : "Submit"}
              </Button>
            </Paper>
          </Box>

          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {flashcards.length > 0 && !loading && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h5" gutterBottom>
                Flashcards Preview
              </Typography>
              <Grid container spacing={3}>
                {flashcards.map((flashcard, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card sx={{ boxShadow: 3 }}>
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
                                  : "rotateY(0deg)",
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
                                boxSizing: "border-box",
                              },
                              "& > div > div:nth-of-type(2)": {
                                transform: "rotateY(180deg)",
                              },
                            }}
                          >
                            <div>
                              <div>
                                <Typography variant="h5" component="div">
                                  {flipped[index] ? flashcard.back : flashcard.front}
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
            </Box>
          )}
        </Container>
      </Container>
    </ThemeProvider>
  );
}
