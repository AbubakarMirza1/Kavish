// src/screens/Login.js
import React from 'react';
import { Container, Typography, TextField, Button, Box } from '@mui/material';

const Login = () => {
  return (
    <Container maxWidth="sm" style={{ textAlign: 'center', padding: '40px' }}>
      <Typography variant="h4" gutterBottom>Login to EcoDash</Typography>
      <Box component="form" noValidate sx={{ mt: 1 }}>
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
          Login
        </Button>
      </Box>
    </Container>
  );
};

export default Login;
