import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './screens/landingPage';
import Login from './screens/login';
import Signup from './screens/signup';
import SustainabilityDashboard from './screens/dashboard'
import Setupform1 from './screens/Setupform1'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<SustainabilityDashboard />} />
        <Route path="/Setupform1" element={<Setupform1 />} />
      </Routes>
    </Router>
  );
}

export default App;
