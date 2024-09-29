import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  Container,
  IconButton,
  CircularProgress,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useAuth, UserButton } from "@clerk/clerk-react"; // Import UserButton from Clerk
import { useNavigate } from "react-router-dom";
import CollectionsIcon from "@mui/icons-material/Collections";
import SummarizeIcon from "@mui/icons-material/Summarize";
import QuizIcon from "@mui/icons-material/Quiz"; // Icon for the quiz button
import MicIcon from "@mui/icons-material/Mic"; // Icon for the microphone button
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import StopIcon from "@mui/icons-material/Stop";

const Dashboard = () => {
  const navigate = useNavigate();
  const { isLoaded, isSignedIn } = useAuth(); // Removed signOut, as UserButton handles sign out
  const [file, setFile] = useState(null);
  const [isSummaryAvailable, setIsSummaryAvailable] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [voiceResponse, setVoiceResponse] = useState("");
  const [mediaRecorder, setMediaRecorder] = useState(null);

  // Upload Document Handler
  const handleUpload = (event) => {
    const uploadedFile = event.target.files[0];

    if (uploadedFile) {
      setFile(uploadedFile);
      setIsSummaryAvailable(true);
      // Handle file upload here (e.g., send to server for processing)
      console.log("Uploaded file:", uploadedFile);
    }
  };

  // Navigate to Flashcards Page
  const handleNavigateToGenerate = () => {
    navigate("/generate");
  };

  // Navigate to Mind Map Page
  const handleNavigateToMindMap = () => {
    navigate("/mindmap");
  };

  // Navigate to Quiz Page
  const handleNavigateToQuiz = () => {
    navigate("/quiz");
  };

  // Handle Stop Recording
  const handleStopRecording = () => {
    console.log("Stopping recording...");
    if (mediaRecorder) {
      mediaRecorder.stop();
    }
  };

  // Handle Voice AI Feature
  const handleVoiceInput = async () => {
    console.log("Voice input activated");
    setIsListening(true);
    setLoading(true);

    try {
      // Use the browser's Web Audio API to record voice input
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const audioChunks = [];

      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });

        // Create a form data object to send the audio file to the backend
        const formData = new FormData();
        formData.append("audio", audioBlob, "voice-input.wav");

        // Send the audio file to the backend using fetch
        try {
          const response = await fetch("http://localhost:5000/voice", {
            method: "POST",
            body: formData,
          });

          if (response.ok) {
            const data = await response.json();
            setVoiceResponse(data.response);
          } else {
            console.error("Error while fetching response from backend");
          }
        } catch (error) {
          console.error("Error while sending audio to backend:", error);
        }

        setLoading(false);
        setIsListening(false);
        setMediaRecorder(null);
      };

      // Start recording and set the MediaRecorder instance
      recorder.start();
      setMediaRecorder(recorder);
    } catch (error) {
      console.error("Error while recording audio:", error);
      setLoading(false);
      setIsListening(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            MindMentor
          </Typography>
          <Button color="inherit" onClick={() => navigate("/")}>
            Home
          </Button>
          <Button color="inherit" onClick={() => navigate("/profile")}>
            Profile
          </Button>
          {isLoaded &&
            (isSignedIn ? (
              <UserButton /> // Use Clerk's UserButton for Sign in, Sign out, and Profile
            ) : (
              <></>
            ))}
        </Toolbar>
      </AppBar>

      {/* Main Dashboard */}
      <Container sx={{ mt: 4 }}>
        <Box container spacing={4}>
          {/* Upload Document Feature */}
          <Box item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Upload Study Materials
                </Typography>
                <Typography variant="body1">
                  Upload your lecture PDFs, and let our AI generate summaries,
                  flashcards, and mind maps for you.
                </Typography>
                <Button
                  variant="contained"
                  component="label"
                  color="primary"
                  startIcon={<UploadFileIcon />}
                  sx={{ mt: 2 }}
                >
                  Upload PDF
                  <input
                    type="file"
                    hidden
                    accept="application/pdf"
                    onChange={handleUpload}
                  />
                </Button>
                {file && (
                  <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
                    <PictureAsPdfIcon color="secondary" sx={{ mr: 1 }} />
                    <Typography variant="body2" color="textSecondary">
                      {file.name}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>

          {/* Flashcard Generation Feature (Always Available) */}
          <Box item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Generate Flashcards
                </Typography>
                <Typography variant="body1">
                  Click below to generate flashcards based on the content.
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<CollectionsIcon />}
                  onClick={handleNavigateToGenerate}
                  sx={{ mt: 2 }}
                >
                  Go to Flashcards
                </Button>
              </CardContent>
            </Card>
          </Box>

          {isSummaryAvailable && (
            <Box item xs={12} md={6} sx={{ mt: 4 }}>
              <Card>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    Generate Summary
                  </Typography>
                  <Typography variant="body1">
                    Click below to generate a mind map based on the uploaded
                    PDF.
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<SummarizeIcon />}
                    onClick={handleNavigateToMindMap}
                    sx={{
                      mt: 2,
                      backgroundColor: "#8B4513", // Dark brown color
                      "&:hover": {
                        backgroundColor: "#5A2C0A" // Even darker shade on hover
                      }
                    }}
                  >
                    Summary
                  </Button>
                </CardContent>
              </Card>
            </Box>
          )}

          {/* Quiz Generation Feature */}
          {isSummaryAvailable && (
            <Box item xs={12} md={6} sx={{ mt: 4 }}>
              <Card>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    Take Quiz
                  </Typography>
                  <Typography variant="body1">
                    Click below to take a quiz based on the uploaded content.
                  </Typography>
                  <Button
                    variant="contained"
                    color="warning"
                    startIcon={<QuizIcon />}
                    onClick={handleNavigateToQuiz}
                    sx={{ mt: 2 }}
                  >
                    Take Quiz
                  </Button>
                </CardContent>
              </Card>
            </Box>
          )}

          {/* Voice AI Feature */}
          <Box item xs={12} md={6} sx={{ mt: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Voice Assist
                </Typography>
                <Typography variant="body1">
                  Click below to activate the voice AI assist feature to help
                  clear your doubts.
                </Typography>
                {isListening ? (
                  <IconButton
                    color="secondary"
                    onClick={handleStopRecording}
                    sx={{ mt: 2 }}
                  >
                    <StopIcon fontSize="large" />
                  </IconButton>
                ) : (
                  <IconButton
                    color="primary"
                    onClick={handleVoiceInput}
                    sx={{ mt: 2 }}
                  >
                    <MicIcon fontSize="large" />
                  </IconButton>
                )}
                {loading && <CircularProgress sx={{ mt: 2 }} />}
                {voiceResponse && (
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{ mt: 2 }}
                  >
                    AI Response: {voiceResponse}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Container>
    </div>
  );
};

export default Dashboard;
