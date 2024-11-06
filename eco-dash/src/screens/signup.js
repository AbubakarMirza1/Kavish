// src/screens/Signup.js
import React from 'react';
import { Container, Typography, TextField, Button, Box } from '@mui/material';

const Signup = () => {
  return (
    <Container maxWidth="sm" style={{ textAlign: 'center', padding: '40px' }}>
      <Typography variant="h4" gutterBottom>Sign Up for EcoDash</Typography>
      <Box component="form" noValidate sx={{ mt: 1 }}>
        <TextField
          fullWidth
          label="Full Name"
          margin="normal"
          variant="outlined"
          required
        />
        <TextField
          fullWidth
          label="Email"
          margin="normal"
          variant="outlined"
          required
        />
        <TextField
          fullWidth
          label="Password"
          type="password"
          margin="normal"
          variant="outlined"
          required
        />
        <Button
          fullWidth
          variant="contained"
          color="primary"
          type="submit"
          sx={{ mt: 3, mb: 2 }}
        >
          Sign Up
        </Button>
      </Box>
    </Container>
  );
};

export default Signup;
