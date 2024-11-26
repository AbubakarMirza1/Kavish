import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './screens/landingPage';
import Login from './screens/login';
import Signup from './screens/signup';
import SustainabilityDashboard from './screens/dashboard'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<SustainabilityDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;