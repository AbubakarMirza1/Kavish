import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import LandingPage from './screens/landingPage';
import Login from './screens/login';
import Signup from './screens/signup';
import SustainabilityDashboard from './screens/dashboard';
import Setupform1 from './screens/Setupform1';
import Setupform2 from './screens/Setupform2';
import Setupform3 from './screens/Setupform3';
import Scope1SC from './screens/Scope1SC';
import Scope1MS from './screens/Scope1MS';
import Scope1RA from './screens/Scope1RA';
import Scope1FS from './screens/Scope1FS';
import Scope1PG from './screens/Scope1PG';
import Scope2E from './screens/Scope2E';
import Scope2S from './screens/Scope2S';
import WasteManagement from './screens/WasteManagement'; // Import the new screen
import GHGEmissions from './screens/GHGEmissions'; // Import the new screen
import Reports from './screens/Reports';
import Scope3BT from './screens/Scope3BT';
import AnalyticsPage from './screens/analytics';
import Scope3W from './screens/Scope3W';

function App() {
  return (
    <ThemeProvider theme={theme}>

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
        <Route path="/Scope1MS" element={<Scope1MS />} />
        <Route path="/Scope1RA" element={<Scope1RA />} />
        <Route path="/Scope1FS" element={<Scope1FS />} />
        <Route path="/Scope1PG" element={<Scope1PG />} />
        <Route path="/Scope2E" element={<Scope2E />} />
        <Route path="/Scope2S" element={<Scope2S />} />
        <Route path="/WasteManagement" element={<WasteManagement />} /> {/* New Route */}
        <Route path="/GHGEmissions" element={<GHGEmissions />} /> {/* Add this route */}
        <Route path="/Reports" element={<Reports />} />
        <Route path="/Scope3BT" element={<Scope3BT />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/Scope3W" element={<Scope3W />} />
      </Routes>
    </Router>
    </ThemeProvider>

  );
}

export default App;
