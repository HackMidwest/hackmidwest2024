import React from 'react';

import { AppBar, Toolbar, Typography, Button, Box, Card, CardContent, Container } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useAuth } from '@clerk/clerk-react';
// import QuizIcon from '@mui/icons-material/Quiz';
import { useNavigate } from 'react-router-dom';
// import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import CollectionsIcon from '@mui/icons-material/Collections';

const Dashboard = () => {
  const navigate = useNavigate();
  const { isLoaded, isSignedIn, signOut } = useAuth();

  // Upload Document Handler
  const handleUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Handle file upload here (e.g., send to server for processing)
      console.log('Uploaded file:', file);
    }
  };

  const handleLogout = async () => {
    await signOut(); // Sign out the user
    navigate('/'); // Redirect to home after logout
  };

  // Navigate to Flashcards Page
  const handleNavigateToGenerate = () => {
    navigate('/generate');
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
              <Button color="inherit" onClick={handleLogout}>Logout</Button>
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
        </Box>
      </Container>
    </div>
  );
};

export default Dashboard;
