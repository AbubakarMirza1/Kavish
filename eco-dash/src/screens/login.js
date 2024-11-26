import React, { useState } from 'react';
import { Box, Button, Checkbox, CssBaseline, FormControlLabel, Divider, FormLabel, FormControl, Link, TextField, Typography, Card } from '@mui/material';
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
  padding: theme.spacing(6),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  backgroundColor: 'rgba(255, 255, 255, 0.85)',
  boxShadow: '0px 4px 30px rgba(0, 0, 0, 0.5)',
  borderRadius: '40px',
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

const Login = () => {
  const [emailError, setEmailError] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSignIn = () => {
    // Directly navigate to Dashboard.js without any validation or checks
    navigate('/dashboard');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    console.log({
      email: data.get('email'),
      password: data.get('password'),
    });
  };

  const validateInputs = () => {
    const email = document.getElementById('email');
    const password = document.getElementById('password');

    let isValid = true;

    if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
      setEmailError(true);
      setEmailErrorMessage('Please enter a valid email address.');
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

  return (
    <BackgroundBox>
      <CssBaseline />
      <StyledCard>
        <LogoContainer>
          <LogoImage src="/planet-earth.png" alt="EcoDash Logo" />
          <LogoText variant="h4">EcoDash</LogoText>
        </LogoContainer>

        <Typography variant="h5" color="textPrimary" sx={{ mb: 1, fontWeight: 500 }}>
          Welcome Back
        </Typography>
        <Typography 
          variant="body2" 
          color="textSecondary" 
          sx={{ mb: 4, letterSpacing: '0.3px' }}
        >
          Log in to your account to continue
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <FormLabel sx={{ mb: 1, fontSize: '0.875rem' }}>Email</FormLabel>
            <TextField
              error={emailError}
              helperText={emailErrorMessage}
              id="email"
              type="email"
              name="email"
              placeholder="you@example.com"
              autoComplete="email"
              autoFocus
              required
              variant="outlined"
              size="small"
            />
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <FormLabel sx={{ mb: 1, fontSize: '0.875rem' }}>Password</FormLabel>
            <TextField
              error={passwordError}
              helperText={passwordErrorMessage}
              id="password"
              type="password"
              name="password"
              placeholder="••••••••"
              autoComplete="current-password"
              required
              variant="outlined"
              size="small"
            />
          </FormControl>

          <FormControlLabel
            control={<Checkbox value="remember" color="primary" size="small" />}
            label={<Typography variant="body2">Remember me</Typography>}
            sx={{ mb: 3 }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            onClick={handleSignIn}
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
            Sign in
          </Button>
        </Box>

        <Link
          href="#"
          onClick={() => navigate('/forgot-password')}
          variant="body2"
          color="secondary"
          underline="hover"
          sx={{ mb: 3, fontSize: '0.875rem' }}
        >
          Forgot your password?
        </Link>

        <Divider sx={{ width: '100%', mb: 3 }}>
          <Typography variant="body2" color="textSecondary">or</Typography>
        </Divider>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<img src="/google.png" alt="Google" width="20" height="20" />}
            onClick={() => alert('Sign in with Google')}
            sx={{
              borderColor: '#14FFEC',
              color: '#14FFEC',
              '&:hover': {
                borderColor: '#0D7377',
                backgroundColor: 'rgba(20, 255, 236, 0.04)',
              },
            }}
          >
            Sign in with Google
          </Button>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<img src="/facebook.png" alt="Facebook" width="20" height="20" />}
            onClick={() => alert('Sign in with Facebook')}
            sx={{
              borderColor: '#0D7377',
              color: '#0D7377',
              '&:hover': {
                borderColor: '#14FFEC',
                backgroundColor: 'rgba(13, 115, 119, 0.04)',
              },
            }}
          >
            Sign in with Facebook
          </Button>
        </Box>

        <Typography variant="body2" sx={{ mt: 4, textAlign: 'center' }}>
          Don't have an account?{' '}
          <Link 
            href="/signup" 
            color="secondary" 
            underline="hover"
            sx={{ fontWeight: 500 }}
          >
            Sign up
          </Link>
        </Typography>
      </StyledCard>
    </BackgroundBox>
  );
};

export default Login;