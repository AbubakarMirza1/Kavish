import React from 'react';
import { Container, Typography, Button, Box, CssBaseline } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/system';

const VideoBackground = styled('video')({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  zIndex: -1,
});

const OverlayBox = styled(Box)({
  backgroundColor: 'rgba(0, 0, 0, 0.6)', // Dark overlay for better text visibility
  padding: '40px',
  borderRadius: '12px',
  maxWidth: '600px',
  textAlign: 'center',
  color: '#FFFFFF',
  zIndex: 1, // Ensures the content is on top of the video
});

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <CssBaseline />
      {/* Video background */}
      <VideoBackground autoPlay loop muted playsInline>
        <source src="/bgvid.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </VideoBackground>

      {/* Overlay content */}
      <Container
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <OverlayBox>
          <Typography variant="h2" gutterBottom>
            Welcome to EcoDash
          </Typography>
          <Typography variant="h5" paragraph>
            Your journey to a sustainable future begins here. EcoDash helps you monitor, manage, and reduce your environmental impact effortlessly.
          </Typography>
          <Typography variant="body1" paragraph>
            Track your carbon footprint, manage waste, and visualize real-time data to make impactful, eco-friendly decisions. Join us in making a greener, more sustainable future.
          </Typography>
          <Box mt={4} display="flex" justifyContent="center" gap={2}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => navigate('/login')}
              sx={{
                fontWeight: 'bold',
                padding: '10px 30px',
                borderRadius: '8px',
                boxShadow: '0px 4px 20px rgba(13, 115, 119, 0.5)',
                '&:hover': {
                  backgroundColor: '#0A595C',
                },
              }}
            >
              Login
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              size="large"
              onClick={() => navigate('/signup')}
              sx={{
                fontWeight: 'bold',
                padding: '10px 30px',
                borderRadius: '8px',
                borderColor: '#14FFEC',
                color: '#14FFEC',
                '&:hover': {
                  backgroundColor: 'rgba(20, 255, 236, 0.1)',
                  borderColor: '#0D7377',
                },
              }}
            >
              Sign Up
            </Button>
          </Box>
        </OverlayBox>
      </Container>
    </>
  );
};

export default LandingPage;
