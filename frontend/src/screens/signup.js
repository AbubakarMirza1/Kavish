import React, { useState } from 'react';
import { useAuth } from '../context/authcontext';
import { Box, Button, Checkbox, CssBaseline, Divider, FormControlLabel, 
         FormLabel, FormControl, Link, TextField, Typography, Card } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

// Keep all existing styled components
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

const SignUp = () => {
  const { signup, verifySignupOTP } = useAuth();
  const [isOTPStep, setIsOTPStep] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    companyName: '',
    roleId: ''
  });
  const [errors, setErrors] = useState({});
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (!formData.companyName) newErrors.companyName = 'Company name is required';
    if (!formData.roleId) newErrors.roleId = 'Role is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;
  
    setIsLoading(true);
    try {
      await signup(
        formData.firstName,
        formData.lastName,
        formData.email,
        formData.password,
        formData.companyName,
        Number(formData.roleId)
      );
      setOtp(""); 
      setIsOTPStep(true);
    } catch (error) {
      console.error("Signup Error:", error);
      let errorMessage = "Signup failed. Please try again.";
  
      if (error.response) {
        // Extract detailed error message if available
        errorMessage = error.response.data.message || errorMessage;
      }
  
      setErrors({ email: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleOTPSubmit = async (event) => {
    event.preventDefault();
    if (!otp || otp.length !== 6) {
      setErrors({ otp: 'Please enter a valid 6-digit code' });
      return;
    }
  
    setIsLoading(true);
    try {
      await verifySignupOTP(
        formData.email,
        otp,
        formData.password,
        formData.firstName,
        formData.lastName,
        formData.companyName,
        Number(formData.roleId)
      );
      setOtp("");
      navigate('/dashboard'); // Redirect to the dashboard upon success
    } catch (error) {
      console.error("OTP Verification Error:", error);
      let errorMessage = "OTP verification failed. Please try again.";
  
      if (error.response) {
        // Extract detailed error message from the response
        errorMessage = error.response.data.message || errorMessage;
      }
  
      setErrors({ otp: errorMessage });
    } finally {
      setIsLoading(false);
    }
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
          {isOTPStep ? 'Verify Your Email' : 'Create Your Account'}
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 4 }}>
          {isOTPStep ? `Verification code sent to ${formData.email}` : 'Join us in making a sustainable future'}
        </Typography>

        {isOTPStep ? (
          <Box component="form" onSubmit={handleOTPSubmit} sx={{ width: '100%' }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <FormLabel>Verification Code</FormLabel>
              <TextField
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit code"
                error={!!errors.otp}
                helperText={errors.otp}
                inputProps={{ inputMode: 'numeric' }}
                autoFocus
              />
            </FormControl>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{/* styles */}}
            >
              {isLoading ? 'Verifying...' : 'Verify Account'}
            </Button>

            <Button
              fullWidth
              variant="text"
              onClick={() => setIsOTPStep(false)}
              sx={{ mt: 2, color: '#0D7377' }}
            >
              Back to Signup
            </Button>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <FormControl fullWidth>
                <FormLabel>First Name</FormLabel>
                <TextField
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  error={!!errors.firstName}
                  helperText={errors.firstName}
                />
              </FormControl>

              <FormControl fullWidth>
                <FormLabel>Last Name</FormLabel>
                <TextField
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  error={!!errors.lastName}
                  helperText={errors.lastName}
                />
              </FormControl>
            </Box>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <FormLabel>Email</FormLabel>
              <TextField
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                error={!!errors.email}
                helperText={errors.email}
              />
            </FormControl>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <FormLabel>Password</FormLabel>
              <TextField
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                error={!!errors.password}
                helperText={errors.password}
              />
            </FormControl>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <FormLabel>Company Name</FormLabel>
              <TextField
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                error={!!errors.companyName}
                helperText={errors.companyName}
              />
            </FormControl>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <FormLabel>Role</FormLabel>
              <TextField
                select
                name="roleId"
                value={formData.roleId}
                onChange={handleInputChange}
                SelectProps={{ native: true }}
                error={!!errors.roleId}
                helperText={errors.roleId}
              >
                <option value=""></option>
                <option value="1">Admin</option>
                <option value="2">User</option>
                <option value="3">Manager</option>
              </TextField>
            </FormControl>

            <FormControlLabel
              control={<Checkbox />}
              label="I want to receive updates via email"
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{/* styles */}}
            >
              {isLoading ? 'Sending OTP...' : 'Create Account'}
            </Button>

            <Typography variant="body2" sx={{ mt: 4, textAlign: 'center' }}>
              Already have an account?{' '}
              <Link href="/login" color="secondary">Sign in</Link>
            </Typography>
          </Box>
        )}
      </StyledCard>
    </BackgroundBox>
  );
};

export default SignUp;