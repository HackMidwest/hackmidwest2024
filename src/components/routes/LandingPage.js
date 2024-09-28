import React from 'react';
import { AppBar, Toolbar, Typography, Button, Container, Grid, Box, Card, CardContent } from '@mui/material';
import { styled } from '@mui/system';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react'; // Import useAuth hook from Clerk
import SchoolIcon from '@mui/icons-material/School';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import ChatIcon from '@mui/icons-material/Chat';

const HeroSection = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '70vh',
  backgroundImage: 'url(https://images.unsplash.com/photo-1496200186974-4293800e2c20)',
  backgroundSize: 'cover',
  color: '#fff',
  textAlign: 'center',
  padding: '2rem',
});

const LandingPage = () => {
  const navigate = useNavigate();
  const { isLoaded, isSignedIn, signOut } = useAuth(); // Destructure the authentication state and signOut function

  const handleRegister = () => {
    navigate('/register');
  };

  const handleGetStarted = () => {
    navigate('/dashboard');
  }

  const handleLogin = () => {
    navigate('/login');
  };

  const handleLogout = async () => {
    await signOut(); // Sign out the user
    navigate('/'); // Redirect to home after logout
  };

  return (
    <>
      {/* Header */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            MindMentor
          </Typography>
          <Button color="inherit" onClick={() => navigate('/')}>Home</Button>

          {/* Conditionally render Login/Register or Logout based on the authentication state */}
          {isLoaded && (
            isSignedIn ? (
              <Button color="inherit" onClick={handleLogout}>Logout</Button>
            ) : (
              <>
                <Button color="inherit" onClick={handleLogin}>Login</Button>
                <Button color="inherit" onClick={handleRegister}>Register</Button>
              </>
            )
          )}
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <HeroSection>
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom>
            Elevate Your Learning with MindMentor
          </Typography>
          <Typography variant="h5" paragraph>
            Personalized, AI-powered learning to help you achieve your academic goals faster.
          </Typography>
          <Button variant="contained" color="primary" size="large" onClick={handleGetStarted}>
            Get Started
          </Button>
        </Container>
      </HeroSection>

      {/* Features Section */}
      <Container sx={{ py: 6 }}>
        <Typography variant="h4" component="h2" align="center" gutterBottom>
          Key Features
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <FlashOnIcon color="primary" fontSize="large" />
                <Typography variant="h6" component="h3" gutterBottom>
                  AI-Generated Flashcards
                </Typography>
                <Typography>
                  Automatically generate flashcards from your uploaded study materials to enhance memory retention.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <SchoolIcon color="secondary" fontSize="large" />
                <Typography variant="h6" component="h3" gutterBottom>
                  Personalized Learning Paths
                </Typography>
                <Typography>
                  Tailored study paths based on your strengths and weaknesses to optimize your learning experience.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <ChatIcon color="success" fontSize="large" />
                <Typography variant="h6" component="h3" gutterBottom>
                  AI Tutor Chat
                </Typography>
                <Typography>
                  Get instant answers to your questions with our AI-powered chat tutor to guide you through your studies.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Call to Action */}
      <Box sx={{ py: 6, textAlign: 'center' }}>
        <Button variant="contained" color="primary" size="large" onClick={handleRegister}>
          Start Your Learning Journey Today
        </Button>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 4, backgroundColor: '#333', color: '#fff', textAlign: 'center' }}>
        <Typography variant="body2">
          &copy; {new Date().getFullYear()} MindMentor. All rights reserved.
        </Typography>
        <Typography variant="body2">
          <Button color="inherit" size="small">About</Button> | <Button color="inherit" size="small">Contact</Button> | <Button color="inherit" size="small">Privacy Policy</Button>
        </Typography>
      </Box>
    </>
  );
};

export default LandingPage;
