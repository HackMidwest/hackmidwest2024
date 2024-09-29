import React, { useState } from 'react';
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
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { useAuth, UserButton } from '@clerk/clerk-react'; // Import UserButton from Clerk
import { useNavigate } from 'react-router-dom';
import CollectionsIcon from '@mui/icons-material/Collections';
import SummarizeIcon from '@mui/icons-material/Summarize';
import AccountTreeIcon from '@mui/icons-material/AccountTree';

const Dashboard = () => {
  const navigate = useNavigate();
  const { isLoaded, isSignedIn } = useAuth(); // Removed signOut, as UserButton handles sign out
  const [file, setFile] = useState(null);
  const [isSummaryAvailable, setIsSummaryAvailable] = useState(false);

  // Upload Document Handler
  const handleUpload = (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setIsSummaryAvailable(true);
      // Handle file upload here (e.g., send to server for processing)
      console.log('Uploaded file:', uploadedFile);
    }
  };

  // Navigate to Flashcards Page
  const handleNavigateToGenerate = () => {
    navigate('/generate');
  };

  // Navigate to Mind Map Page
  const handleNavigateToMindMap = () => {
    navigate('/mindmap');
  };

  // Handle Summary Generation
  const handleGenerateSummary = () => {
    if (file) {
      // Call your backend or API to generate the summary from the uploaded PDF
      console.log('Generating summary for:', file.name);
      // Implement the actual summary generation logic here.
    } else {
      console.error('No file available for summary generation.');
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
          <Button color="inherit" onClick={() => navigate('/')}>Home</Button>
          <Button color="inherit" onClick={() => navigate('/profile')}>Profile</Button>
          {isLoaded && (
            isSignedIn ? (
              <UserButton /> // Use Clerk's UserButton for Sign in, Sign out, and Profile
            ) : (
              <></>
            )
          )}
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
                  Upload Lecture PDFs
                </Typography>
                <Typography variant="body1">
                  Upload your lecture PDFs, and let our AI generate summaries for you.
                </Typography>

                {!file ? (
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
                ) : (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      <IconButton>
                        <PictureAsPdfIcon color="action" />
                      </IconButton>
                      {file.name}
                    </Typography>
                    <Button
                      variant="contained"
                      component="label"
                      color="primary"
                      startIcon={<UploadFileIcon />}
                      sx={{ mt: 1, mr: 2 }}
                    >
                      Upload New PDF
                      <input
                        type="file"
                        hidden
                        accept="application/pdf"
                        onChange={handleUpload}
                      />
                    </Button>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<AccountTreeIcon />}
                      onClick={handleNavigateToMindMap}
                      sx={{ mt: 1 }}
                    >
                      Generate Summary Mind Map
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>

          {/* Flashcard Generation Feature */}
          <Box item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Generate Flashcards
                </Typography>
                <Typography variant="body1">
                  Click below to generate flashcards based on the uploaded content.
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

          {/* Summary Generation Feature
          {isSummaryAvailable && (
            <Box item xs={12} md={6} sx={{ mt: 4 }}>
              <Card>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    Generate Summary
                  </Typography>
                  <Typography variant="body1">
                    Click below to generate a summary from the uploaded PDF.
                  </Typography>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<SummarizeIcon />}
                    onClick={handleGenerateSummary}
                    sx={{ mt: 2 }}
                  >
                    Generate Summary
                  </Button>
                </CardContent>
              </Card>
            </Box>
          )} */}
        </Box>
      </Container>
    </div>
  );
};

export default Dashboard;
