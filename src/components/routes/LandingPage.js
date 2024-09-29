import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Grid,
  Box,
  Card,
  CardContent
} from "@mui/material";
import { styled } from "@mui/system";
import { useNavigate } from "react-router-dom";
import { useAuth, UserButton } from "@clerk/clerk-react"; // Import UserButton from Clerk
import SchoolIcon from "@mui/icons-material/School";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import ChatIcon from "@mui/icons-material/Chat";

// Hero Section styling with new background image
const HeroSection = styled(Box)({
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "60vh",
  width: "100%",
  backgroundImage: "url(/learning.jpg)", // New background image
  backgroundSize: "cover",
  backgroundPosition: "center",
  color: "#fff",
  textAlign: "center",
  padding: "2rem",
});

const ContentWrapper = styled(Box)({
  position: "relative",
  padding: "2rem",
  textAlign: "center",
});

const FeaturesSection = styled(Box)({
  backgroundColor: "#fff", // White background for key features section
  color: "#000",
  padding: "4rem 0",
  textAlign: "center",
});

const LandingPage = () => {
  const navigate = useNavigate();
  const { isLoaded, isSignedIn } = useAuth(); // Removed signOut, as UserButton handles sign out

  const handleRegister = () => {
    navigate("/register");
  };

  const handleGetStarted = () => {
    if (isSignedIn) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            MindMentor
          </Typography>
          <Button color="inherit" onClick={() => navigate("/")}>
            Home
          </Button>
          {isLoaded && (
            isSignedIn ? (
              <UserButton /> // Clerk's UserButton will provide profile, sign-in, and sign-out options
            ) : (
              <>
                <Button color="inherit" onClick={() => navigate("/login")}>
                  Login
                </Button>
                <Button color="inherit" onClick={handleRegister}>
                  Register
                </Button>
              </>
            )
          )}
        </Toolbar>
      </AppBar>

      {/* Hero Section with New Static Background Image */}
      <HeroSection>
        <ContentWrapper>
          <Container maxWidth="md">
            <Typography
              variant="h2"
              component="h1"
              gutterBottom
              sx={{
                fontFamily: "Roboto, sans-serif",
                fontWeight: "700",
                textShadow: "2px 2px 4px rgba(0, 0, 0, 0.7)",
              }}
            >
              Elevate Your Learning with MindMentor
            </Typography>
            <Typography
              variant="h5"
              paragraph
              sx={{
                fontFamily: "Arial, sans-serif",
                fontWeight: "400",
                textShadow: "1px 1px 2px rgba(0, 0, 0, 0.5)",
              }}
            >
              Personalized, AI-powered learning to help you achieve your academic
              goals faster.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleGetStarted}
            >
              Get Started
            </Button>
          </Container>
        </ContentWrapper>
      </HeroSection>

      {/* Features Section */}
      <FeaturesSection>
        <Container>
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
                    Automatically generate flashcards from your uploaded study
                    materials to enhance memory retention.
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
                    Tailored study paths based on your strengths and weaknesses to
                    optimize your learning experience.
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
                    Get instant answers to your questions with our AI-powered chat
                    tutor to guide you through your studies.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </FeaturesSection>

      {/* Call to Action */}
      <Box sx={{ py: 6, textAlign: "center" }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={handleRegister}
        >
          Start Your Learning Journey Today
        </Button>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          py: 4,
          backgroundColor: "#333",
          color: "#fff",
          textAlign: "center",
        }}
      >
        <Typography variant="body2">
          &copy; {new Date().getFullYear()} MindMentor. All rights reserved.
        </Typography>
        <Typography variant="body2">
          <Button color="inherit" size="small">
            About
          </Button>{" "}
          |{" "}
          <Button color="inherit" size="small">
            Contact
          </Button>{" "}
          |{" "}
          <Button color="inherit" size="small">
            Privacy Policy
          </Button>
        </Typography>
      </Box>
    </>
  );
};

export default LandingPage;
