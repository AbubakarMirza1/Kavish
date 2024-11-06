import React, { useState } from 'react';
import { Box, Button, Checkbox, CssBaseline, Divider, FormControlLabel, FormLabel, FormControl, Link, TextField, Typography, Stack, Card } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

const BackgroundBox = styled(Box)({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(to right, #0D7377, #14FFEC)',
  padding: '20px 20px', // Added padding to top and bottom
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
  marginTop: theme.spacing(4), // Adds distance from the top of the container
  marginBottom: theme.spacing(4), // Adds distance from the bottom of the container
}));

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
        <Typography variant="h4" color="textPrimary" gutterBottom>
          Create Your EcoDash Account
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
          Join us in making a sustainable future.
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <FormLabel>First Name</FormLabel>
            <TextField
              id="firstName"
              name="firstName"
              required
              fullWidth
              placeholder="First Name"
              autoComplete="given-name"
            />
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <FormLabel>Last Name</FormLabel>
            <TextField
              id="lastName"
              name="lastName"
              required
              fullWidth
              placeholder="Last Name"
              autoComplete="family-name"
            />
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <FormLabel>Company Email</FormLabel>
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
            />
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <FormLabel>Password</FormLabel>
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
            />
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <FormLabel>Company Name</FormLabel>
            <TextField
              id="companyName"
              name="companyName"
              required
              fullWidth
              placeholder="Company Name"
              autoComplete="organization"
            />
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <FormLabel>Industry Sector</FormLabel>
            <TextField
              id="industrySector"
              name="industrySector"
              required
              fullWidth
              placeholder="e.g., Technology, Manufacturing"
            />
          </FormControl>

          <FormControlLabel
            control={<Checkbox value="allowExtraEmails" color="primary" />}
            label="I want to receive updates via email."
            sx={{ mb: 2 }}
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
            Sign up
          </Button>
        </Box>

        <Divider sx={{ width: '100%', mb: 2 }}>or</Divider>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<img src="/google.png" alt="Google" width="24" height="24" />}
            onClick={() => alert('Sign up with Google')}
            sx={{ borderColor: '#14FFEC', color: '#14FFEC' }}
          >
            Sign up with Google
          </Button>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<img src="/facebook.png" alt="Facebook" width="24" height="24" />}
            onClick={() => alert('Sign up with Facebook')}
            sx={{ borderColor: '#0D7377', color: '#0D7377' }}
          >
            Sign up with Facebook
          </Button>
        </Box>

        <Typography variant="body2" sx={{ mt: 3, textAlign: 'center' }}>
          Already have an account?{' '}
          <Link href="/login" color="secondary" underline="hover">
            Sign in
          </Link>
        </Typography>
      </StyledCard>
    </BackgroundBox>
  );
};

export default SignUp;
