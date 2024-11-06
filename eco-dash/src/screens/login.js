import React, { useState } from 'react';
import { Box, Button, Checkbox, CssBaseline, FormControlLabel, Divider, FormLabel, FormControl, Link, TextField, Typography, Card } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

const BackgroundBox = styled(Box)({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(to right, #0D7377, #14FFEC)',
});

const StyledCard = styled(Card)(({ theme }) => ({
  width: '100%',
  maxWidth: '450px',
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.2)',
  borderRadius: '12px',
}));

const Login = () => {
  const [emailError, setEmailError] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
  const navigate = useNavigate();

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
        <Typography variant="h4" color="textPrimary" gutterBottom>
          Welcome Back to EcoDash
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
          Log in to your account to continue
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <FormLabel>Email</FormLabel>
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
            />
          </FormControl>

          <FormControl fullWidth sx={{ mb: 1 }}>
            <FormLabel>Password</FormLabel>
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
            />
          </FormControl>

          <FormControlLabel
            control={<Checkbox value="remember" color="primary" />}
            label="Remember me"
            sx={{ alignSelf: 'flex-start', mb: 2 }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            onClick={validateInputs}
            sx={{
              fontWeight: 'bold',
              py: 1.5,
              mb: 2,
              backgroundColor: '#0D7377',
              '&:hover': {
                backgroundColor: '#0A595C',
              },
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
          sx={{ mb: 2 }}
        >
          Forgot your password?
        </Link>

        <Divider sx={{ width: '100%', mb: 2 }}>or</Divider>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<img src="/google.png" alt="Google" width="24" height="24" />}
            onClick={() => alert('Sign in with Google')}
            sx={{ borderColor: '#14FFEC', color: '#14FFEC' }}
          >
            Sign in with Google
          </Button>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<img src="/facebook.png" alt="Facebook" width="24" height="24" />}
            onClick={() => alert('Sign in with Facebook')}
            sx={{ borderColor: '#0D7377', color: '#0D7377' }}
          >
            Sign in with Facebook
          </Button>
        </Box>

        <Typography variant="body2" sx={{ mt: 3, textAlign: 'center' }}>
          Don&apos;t have an account?{' '}
          <Link href="/signup" color="secondary" underline="hover">
            Sign up
          </Link>
        </Typography>
      </StyledCard>
    </BackgroundBox>
  );
};

export default Login;
