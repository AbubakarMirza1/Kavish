import React from 'react';
import { 
  Container, 
  Typography, 
  Button, 
  Box, 
  CssBaseline, 
  Grid, 
  useMediaQuery, 
  useTheme 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/system';
import { Leaf, BarChart2, Cloud } from 'lucide-react';

// Styled video background
const VideoBackground = styled('video')({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  zIndex: -1,
  filter: 'brightness(0.9)', // Keep the focus on the content
});

// Central overlay box
const OverlayBox = styled(Box)(({ theme }) => ({
  backgroundColor: 'rgba(0, 0, 0, 0.65)',
  padding: theme.spacing(6),
  borderRadius: '16px',
  maxWidth: '900px',
  textAlign: 'center',
  color: '#FFFFFF',
  boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.5)',
  zIndex: 1,
}));

// Styled feature box
const FeatureBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(3),
  backgroundColor: 'rgba(255, 255, 255, 0.08)',
  borderRadius: theme.spacing(2),
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.3)',
  },
}));

// Logo container
const LogoContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginBottom: '32px',
});

// Logo image
const LogoImage = styled('img')({
  height: '50px',
  width: 'auto',
});

// Logo text
const LogoText = styled(Typography)({
  fontSize: '28px',
  fontWeight: 600,
  background: 'linear-gradient(45deg, #00bcd4 30%, #009688 90%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  marginTop: '8px',
  letterSpacing: '0.5px',
});

const CTAButton = styled(Button)(({ theme }) => ({
  px: 4,
  py: 1.5,
  fontWeight: 700,
  borderRadius: 8,
  textTransform: 'none',
  fontSize: '1rem',
}));

const LandingPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <>
      <CssBaseline />
      <VideoBackground autoPlay loop muted playsInline>
        <source src="/bgvid.mp4" type="video/mp4" />
      </VideoBackground>

      <Container
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <OverlayBox>
          {/* Logo Section */}
          <LogoContainer>
            <LogoImage src="/planet-earth.png" alt="EcoDash Logo" />
            <LogoText variant="h4">EcoDash</LogoText>
          </LogoContainer>

          {/* Main Title */}
          <Typography 
            variant={isMobile ? "h4" : "h2"} 
            gutterBottom 
            sx={{ 
              fontWeight: 700, 
              background: 'linear-gradient(90deg, #00bcd4, #009688)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 3,
            }}
          >
            Redefining Sustainability
          </Typography>

          {/* Subtitle */}
          <Typography 
            variant="h5" 
            paragraph 
            sx={{ 
              color: 'rgba(255,255,255,0.9)', 
              fontWeight: 300, 
              mb: 4 
            }}
          >
            Your trusted partner in environmental intelligence and sustainability management.
          </Typography>

          {/* Features Section */}
          <Grid container spacing={4} sx={{ mb: 6 }}>
            {[
              { 
                icon: <Leaf size={50} color="#4caf50" />, 
                title: "Comprehensive Emission Tracking",
                description: "Monitor and manage Scope 1, 2 & 3 emissions with precision and ease."
              },
              { 
                icon: <BarChart2 size={50} color="#2196f3" />, 
                title: "Data-Driven Insights",
                description: "Leverage intuitive dashboards for actionable environmental strategies."
              },
              { 
                icon: <Cloud size={50} color="#9c27b0" />, 
                title: "Streamlined Reporting",
                description: "Generate professional, customizable reports for stakeholders."
              }
            ].map((feature, index) => (
              <Grid item xs={12} sm={4} key={index}>
                <FeatureBox>
                  {feature.icon}
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mt: 2, 
                      color: '#ffffff', 
                      fontWeight: 600 
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'rgba(255,255,255,0.7)', 
                      textAlign: 'center' 
                    }}
                  >
                    {feature.description}
                  </Typography>
                </FeatureBox>
              </Grid>
            ))}
          </Grid>

          {/* Call-to-Action Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3 }}>
            <CTAButton
              variant="contained"
              color="primary"
              onClick={() => navigate('/login')}
              sx={{
                background: 'linear-gradient(90deg, #00bcd4, #009688)',
                '&:hover': {
                  background: 'linear-gradient(90deg, #009688, #00bcd4)',
                },
              }}
            >
              Login
            </CTAButton>
            <CTAButton
              variant="outlined"
              onClick={() => navigate('/signup')}
              sx={{
                color: 'white',
                borderColor: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              Sign Up
            </CTAButton>
          </Box>
        </OverlayBox>
      </Container>
    </>
  );
};

export default LandingPage;
