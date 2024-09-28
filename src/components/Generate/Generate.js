import React, { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Paper,
  TextField,
  Typography,
  CircularProgress,
  CssBaseline,
  createTheme,
  ThemeProvider,
} from "@mui/material";
import SimpleAppBar from "../SimpleAppBar/SimpleAppBar"; 

export default function Generate() {
  const { user, isLoaded } = useUser();
  const [flashcards, setFlashcards] = useState([]);
  const [flipped, setFlipped] = useState({});
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect to sign-in if the user is not loaded or not signed in
  useEffect(() => {
    if (isLoaded && !user) {
      navigate("/sign-in");
    }
  }, [isLoaded, user, navigate]);

  // Handle submit to generate flashcards
  const handleSubmit = async () => {
    setLoading(true); // Start loading
    fetch("/api/generate", {
      method: "POST",
      body: text,
    })
      .then((res) => res.json())
      .then((data) => {
        setFlashcards(data);
        setLoading(false); // Stop loading
      })
      .catch((error) => {
        console.error("Error generating flashcards:", error);
        setLoading(false); // Stop loading on error
      });
  };

  // Handle flipping a flashcard
  const handleFlip = (id) => {
    setFlipped((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Handle opening the save dialog
  const handleOpen = () => {
    setOpen(true);
  };

  // Handle closing the save dialog
  const handleClose = () => {
    setOpen(false);
  };

  // Save the generated flashcards
  // const saveFlashcards = async () => {
  //   if (!name) {
  //     alert("Please enter a name");
  //     return;
  //   }

  //   if (!user || !user.id) {
  //     alert("User is not authenticated. Please sign in first.");
  //     return;
  //   }

  //   setLoading(true); // Start loading when saving begins
  //   try {
  //     // Replace this part with your logic to save flashcards using Amazon Bedrock or any other backend
  //     await saveUserFlashcards(user.id, name, flashcards);
  //     handleClose();
  //     navigate("/flashcards");
  //   } catch (error) {
  //     console.error("Error saving flashcards:", error);
  //     alert("Failed to save flashcards. Please try again.");
  //   } finally {
  //     setLoading(false); // Stop loading after the save operation is complete
  //   }
  // };

  // Create the theme with light or dark mode based on user selection
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

  // Toggle the dark mode
  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth={false} disableGutters>
        {/* Use the SimpleAppBar component */}
        <SimpleAppBar darkMode={darkMode} setDarkMode={toggleDarkMode} />
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
              <Box
                sx={{
                  mt: 4,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleOpen}
                  sx={{
                    py: 1.5,
                    px: 4,
                    fontSize: "1.1rem",
                  }}
                  disabled={loading} // Disable the button during loading
                >
                  {loading ? <CircularProgress size={24} /> : "Save"}
                </Button>
              </Box>
            </Box>
          )}

          <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Save Flashcards</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Please enter a name for your flashcards collection
              </DialogContentText>
              <TextField
                autoFocus
                margin="dense"
                label="Collection Name"
                type="text"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
                variant="outlined"
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose} disabled={loading}>
                Cancel
              </Button>
              <Button disabled={loading}>
                {loading ? <CircularProgress size={24} /> : "Save"}
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      </Container>
    </ThemeProvider>
  );
}
