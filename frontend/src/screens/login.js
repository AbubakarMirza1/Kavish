import React, { useState } from 'react';
import { useEffect } from 'react';
import { useAuth } from '../context/authcontext';
import { Box, Button, Checkbox, CssBaseline, FormControlLabel, Divider, 
         FormLabel, FormControl, Link, TextField, Typography, Card } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

// Styled components (keep all existing styling)
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
  const { login, verifyLoginOTP } = useAuth();
  const [isOTPStep, setIsOTPStep] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    if (isOTPStep) {
      setEmailError(false);
      setPasswordError(false);
      setEmailErrorMessage('');
    }
  }, [isOTPStep]);

  useEffect(() => {
    const savedEmail = localStorage.getItem("otpEmail");
    if (savedEmail) {
      setLoginEmail(savedEmail);
      setIsOTPStep(true); // Show OTP screen
    }
  }, []);

  // Validate email and password inputs
  const validateCredentials = (email, password) => {
    let isValid = true;
    
    // Email validation
    if (!email) {
      setEmailError(true);
      setEmailErrorMessage('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError(true);
      setEmailErrorMessage('Enter a valid email address');
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage('');
    }

    // Password validation
    if (!password) {
      setPasswordError(true);
      setPasswordErrorMessage('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage('Password must be at least 6 characters');
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }

    return isValid;
  };

  // Handle email/password submission
  const handleCredentialsSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = data.get('email');
    const password = data.get('password');

    if (!validateCredentials(email, password)) return;

    setIsLoading(true);
    try {
      // Clear previous errors
      setEmailError(false);
      setPasswordError(false);
      
      // Attempt login (trigger OTP)
      const response = await login(email, password);
      
      // If OTP was sent successfully
      if (response.message && response.message.includes('OTP')) {
        localStorage.setItem("otpEmail", email); // Save email
        setLoginEmail(email);
        setIsOTPStep(true);  // Switch to OTP view
      }
      else {
        throw new Error('Unexpected response from server');
      }
    } catch (error) {
      setEmailError(true);
      setEmailErrorMessage(error.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP submission
  const handleOTPSubmit = async (event) => {
    event.preventDefault();
    
    // Basic OTP validation
    if (!otp || otp.length !== 6) {
      setEmailError(true);
      setEmailErrorMessage('Please enter a 6-digit code');
      return;
    }

    setIsLoading(true);
    try {
      // Verify OTP with backend
      await verifyLoginOTP(loginEmail, otp);
      localStorage.removeItem("otpEmail"); // Cleanup
      navigate('/dashboard');
    } catch (error) {
      setEmailError(true);
      setEmailErrorMessage('Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BackgroundBox>
      <StyledCard>
        <LogoContainer>
          <LogoImage src="/planet-earth.png" alt="EcoDash Logo" />
          <LogoText variant="h4">EcoDash</LogoText>
        </LogoContainer>

        <Typography variant="h5" color="textPrimary" sx={{ mb: 1, fontWeight: 500 }}>
          {isOTPStep ? 'Verify Your Identity' : 'Welcome Back'}
        </Typography>
        
        <Typography variant="body2" color="textSecondary" sx={{ mb: 4, letterSpacing: '0.3px' }}>
          {isOTPStep ? `We sent a 6-digit code to ${loginEmail}` : 'Log in to your account to continue'}
        </Typography>

        {/* Conditional rendering based on OTP step */}
        {isOTPStep ? (
          // OTP Verification Form
          <Box component="form" onSubmit={handleOTPSubmit} sx={{ width: '100%' }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <FormLabel sx={{ mb: 1 }}>Verification Code</FormLabel>
              <TextField
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}  // Only numbers, max 6 digits
                placeholder="Enter 6-digit code"
                variant="outlined"
                size="small"
                autoFocus
                inputProps={{ inputMode: 'numeric' }}
                error={emailError}
                helperText={emailErrorMessage}
              />
            </FormControl>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{
                fontWeight: 600,
                py: 1.5,
                mb: 2,
                backgroundColor: '#0D7377',
                '&:hover': { backgroundColor: '#0A595C' },
                borderRadius: '8px',
              }}
            >
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </Button>

            <Button
              fullWidth
              variant="text"
              onClick={() => {
                setIsOTPStep(false);
                localStorage.removeItem("otpEmail");}
                }
              sx={{ color: '#0D7377' }}
            >
              Back to Login
            </Button>
          </Box>
        ) : (
          // Email/Password Login Form
          <Box component="form" onSubmit={handleCredentialsSubmit} sx={{ width: '100%' }}>
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
              disabled={isLoading}
              sx={{
                fontWeight: 600,
                py: 1.5,
                mb: 3,
                backgroundColor: '#0D7377',
                '&:hover': { backgroundColor: '#0A595C' },
                borderRadius: '8px',
              }}
            >
              {isLoading ? 'Sending OTP...' : 'Sign in'}
            </Button>

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
              {/* Social login buttons remain unchanged */}
            </Box>
          </Box>
        )}

        <Typography variant="body2" sx={{ mt: 4, textAlign: 'center' }}>
          Don't have an account?{' '}
          <Link component="button"
  onClick={() => navigate('/signup')}
   color="secondary" underline="hover" sx={{ fontWeight: 500 }}>
            Sign up
          </Link>
        </Typography>
      </StyledCard>
    </BackgroundBox>
  );
};

export default Login;