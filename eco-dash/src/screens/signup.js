import React, { useState } from 'react';
import { Box, Button, Checkbox, CssBaseline, Divider, FormControlLabel, FormLabel, FormControl, Link, TextField, Typography, Card } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

const BackgroundBox = styled(Box)({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundImage: 'url("/bgimg.jpg")',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  position: 'relative',
  padding: '40px 20px',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)'
  }
});

const StyledCard = styled(Card)(({ theme }) => ({
  width: '100%',
  maxWidth: '450px',
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  backgroundColor: 'rgba(255, 255, 255, 0.85)',
  boxShadow: '0px 4px 30px rgba(0, 0, 0, 0.5)',
  borderRadius: '16px',
  position: 'relative',
  zIndex: 1,
}));

const LogoContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '24px',
});

const LogoImage = styled('img')({
  height: '40px',
  width: 'auto',
});

const LogoText = styled(Typography)({
  fontSize: '28px',
  fontWeight: 600,
  background: 'linear-gradient(45deg, #0D7377 30%, #14FFEC 90%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  letterSpacing: '0.5px',
});


const SignUp = () => {
  const [emailError, setEmailError] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
  const navigate = useNavigate();

  const validateInputs = () => {
    const email = document.getElementById('email');
    const password = document.getElementById('password');

    let isValid = true;

    if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
      setEmailError(true);
      setEmailErrorMessage('Please enter a valid company email address.');
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage('');
    }

    if (!password.value || password.value.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage('Password must be at least 6 characters long.');
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }

    return isValid;
  };

  const handleSubmit = (event) => {
    if (emailError || passwordError) {
      event.preventDefault();
      return;
    }
    const data = new FormData(event.currentTarget);
    console.log({
      firstName: data.get('firstName'),
      lastName: data.get('lastName'),
      email: data.get('email'),
      password: data.get('password'),
      companyName: data.get('companyName'),
      industrySector: data.get('industrySector'),
    });
  };

  return (
    <BackgroundBox>
      <CssBaseline />
      <StyledCard>
        <LogoContainer>
          <LogoImage src="/planet-earth.png" alt="EcoDash Logo" />
          <LogoText variant="h4">EcoDash</LogoText>
        </LogoContainer>

        <Typography variant="h5" color="textPrimary" sx={{ mb: 1, fontWeight: 500 }}>
          Create Your Account
        </Typography>
        <Typography 
          variant="body2" 
          color="textSecondary" 
          sx={{ mb: 4, letterSpacing: '0.3px' }}
        >
          Join us in making a sustainable future
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <FormControl fullWidth>
              <FormLabel sx={{ mb: 1, fontSize: '0.875rem' }}>First Name</FormLabel>
              <TextField
                id="firstName"
                name="firstName"
                required
                fullWidth
                placeholder="First Name"
                autoComplete="given-name"
                size="small"
              />
            </FormControl>

            <FormControl fullWidth>
              <FormLabel sx={{ mb: 1, fontSize: '0.875rem' }}>Last Name</FormLabel>
              <TextField
                id="lastName"
                name="lastName"
                required
                fullWidth
                placeholder="Last Name"
                autoComplete="family-name"
                size="small"
              />
            </FormControl>
          </Box>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <FormLabel sx={{ mb: 1, fontSize: '0.875rem' }}>Company Email</FormLabel>
            <TextField
              id="email"
              type="email"
              name="email"
              placeholder="you@company.com"
              required
              fullWidth
              error={emailError}
              helperText={emailErrorMessage}
              autoComplete="email"
              size="small"
            />
          </FormControl>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <FormLabel sx={{ mb: 1, fontSize: '0.875rem' }}>Password</FormLabel>
            <TextField
              id="password"
              type="password"
              name="password"
              placeholder="••••••••"
              required
              fullWidth
              error={passwordError}
              helperText={passwordErrorMessage}
              autoComplete="new-password"
              size="small"
            />
          </FormControl>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <FormLabel sx={{ mb: 1, fontSize: '0.875rem' }}>Company Name</FormLabel>
            <TextField
              id="companyName"
              name="companyName"
              required
              fullWidth
              placeholder="Company Name"
              autoComplete="organization"
              size="small"
            />
          </FormControl>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <FormLabel sx={{ mb: 1, fontSize: '0.875rem' }}>Industry Sector</FormLabel>
            <TextField
              id="industrySector"
              name="industrySector"
              required
              fullWidth
              placeholder="e.g., Technology, Manufacturing"
              size="small"
            />
          </FormControl>

          <FormControlLabel
            control={<Checkbox value="allowExtraEmails" color="primary" size="small" />}
            label={
              <Typography variant="body2">
                I want to receive updates via email
              </Typography>
            }
            sx={{ mb: 3 }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            onClick={validateInputs}
            sx={{
              fontWeight: 600,
              py: 1.5,
              mb: 3,
              backgroundColor: '#0D7377',
              '&:hover': {
                backgroundColor: '#0A595C',
              },
              borderRadius: '8px',
            }}
          >
            Create Account
          </Button>
        </Box>

        <Divider sx={{ width: '100%', mb: 3 }}>
          <Typography variant="body2" color="textSecondary">or</Typography>
        </Divider>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<img src="/google.png" alt="Google" width="20" height="20" />}
            onClick={() => alert('Sign up with Google')}
            sx={{
              borderColor: '#14FFEC',
              color: '#14FFEC',
              '&:hover': {
                borderColor: '#0D7377',
                backgroundColor: 'rgba(20, 255, 236, 0.04)',
              },
            }}
          >
            Sign up with Google
          </Button>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<img src="/facebook.png" alt="Facebook" width="20" height="20" />}
            onClick={() => alert('Sign up with Facebook')}
            sx={{
              borderColor: '#0D7377',
              color: '#0D7377',
              '&:hover': {
                borderColor: '#14FFEC',
                backgroundColor: 'rgba(13, 115, 119, 0.04)',
              },
            }}
          >
            Sign up with Facebook
          </Button>
        </Box>

        <Typography variant="body2" sx={{ mt: 4, textAlign: 'center' }}>
          Already have an account?{' '}
          <Link 
            href="/login" 
            color="secondary" 
            underline="hover"
            sx={{ fontWeight: 500 }}
          >
            Sign in
          </Link>
        </Typography>
      </StyledCard>
    </BackgroundBox>
  );
};

export default SignUp;