import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './screens/landingPage';
import Login from './screens/login';
import Signup from './screens/signup';
import SustainabilityDashboard from './screens/dashboard'
import Setupform1 from './screens/Setupform1'
import Setupform2 from './screens/Setupform2'
import Setupform3 from './screens/Setupform3'
import Scope1SC from './screens/Scope1SC'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<SustainabilityDashboard />} />
        <Route path="/Setupform1" element={<Setupform1 />} />
        <Route path="/Setupform2" element={<Setupform2 />} />
        <Route path="/Setupform3" element={<Setupform3 />} />
        <Route path="/Scope1SC" element={<Scope1SC />} />
      </Routes>
    </Router>
  );
}

export default App;
