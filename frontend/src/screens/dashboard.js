import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Grid,
  Paper,
} from '@mui/material';
import Sidebar from '../Component/sidebar.js'; // Import the Sidebar component
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  BarChart,
  Bar,
} from 'recharts';
import TopBar from '../Component/topbar.js'; // Import the Sidebar component

// Mock Data for Graphs
const emissionScopeData = [
  { name: 'Scope 1', value: 35, color: '#0D7377' },
  { name: 'Scope 2', value: 45, color: '#14FFEC' },
  { name: 'Scope 3', value: 20, color: '#00C853' },
];

const monthlyEmissionTrend = [
  { month: 'Jan', Scope1: 120, Scope2: 80, Scope3: 50 },
  { month: 'Feb', Scope1: 110, Scope2: 85, Scope3: 55 },
  { month: 'Mar', Scope1: 130, Scope2: 90, Scope3: 60 },
  { month: 'Apr', Scope1: 125, Scope2: 88, Scope3: 58 },
  { month: 'May', Scope1: 135, Scope2: 92, Scope3: 62 },
  { month: 'Jun', Scope1: 140, Scope2: 95, Scope3: 65 },
];

const wasteManagementData = [
  { type: 'Generated', value: 1000 },
  { type: 'Recycled', value: 600 },
  { type: 'Disposed', value: 400 },
];

const SustainabilityDashboard = () => {
  const [setupForm, setSetupForm] = useState('Select Setup Form');
  const navigate = useNavigate();

  
  const handleFormChange = (event) => {
    const selectedValue = event.target.value;
    setSetupForm(selectedValue);

    if (selectedValue === 'Scope 1 Setup Form') navigate('/Setupform1');
    else if (selectedValue === 'Scope 2 Setup Form') navigate('/Setupform2');
    else if (selectedValue === 'Scope 3 Setup Form') navigate('/Setupform3');
  };
  const setupOptions = [
    { label: "Scope 1 Setup Form", route: "/Setupform1" },
    { label: "Scope 2 Setup Form", route: "/Setupform2" },
    { label: "Scope 3 Setup Form", route: "/Setupform3" }
];

  
  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: '#f9f9f9' }}>
        {/* <AppBar position="static" color="transparent" elevation={0}>
          <Toolbar>
            <Typography variant="h5" sx={{ flexGrow: 1, color: '#0D7377' }}>
              Sustainability Dashboard
            </Typography>
            <FormControl sx={{ minWidth: 150, mr: 2 }}>
              <Select value={setupForm} onChange={handleFormChange} displayEmpty sx={{ fontSize: 16, color: '#0D7377' }}>
                <MenuItem value="Select Setup Form" disabled>
                  Select Setup Form
                </MenuItem>
                <MenuItem value="Scope 1 Setup Form">Scope 1 Setup Form</MenuItem>
                <MenuItem value="Scope 2 Setup Form">Scope 2 Setup Form</MenuItem>
                <MenuItem value="Scope 3 Setup Form">Scope 3 Setup Form</MenuItem>
              </Select>
            </FormControl>
            <IconButton>
              <NotificationIcon />
            </IconButton>
            <IconButton>
              <HelpIcon />
            </IconButton>
            <Avatar sx={{ ml: 2, bgcolor: '#0D7377' }}>JD</Avatar>
          </Toolbar>
        </AppBar> */}
        <TopBar 
                title="Sustainability Dashboard" 
                showDropdown={true} 
                setupForm={setupForm} 
                setSetupForm={setSetupForm} 
                setupOptions={setupOptions}
            />


        {/* Dashboard Grid */}
        <Container maxWidth="xl" sx={{ mt: 4 }}>
          {/* KPI Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {[
              {
                title: 'Total Emissions',
                value: '1,245 Metric Tons CO2e',
                trend: 'up',
                color: '#0D7377',
              },
              {
                title: 'Predicted Emissions',
                value: '1,100 Metric Tons CO2e',
                trend: 'down',
                color: '#14FFEC',
              },
              {
                title: 'Reduction Target',
                value: '15% Achieved',
                trend: 'up',
                color: '#00C853',
              },
            ].map((kpi, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    borderLeft: `5px solid ${kpi.color}`,
                    transition: 'transform 0.3s',
                    '&:hover': { transform: 'scale(1.03)' },
                  }}
                >
                  <Typography variant="subtitle2" color="textSecondary">
                    {kpi.title}
                  </Typography>
                  <Typography variant="h5" sx={{ color: kpi.color }}>
                    {kpi.value}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Emissions by Scope Pie Chart */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3, height: '400px' }}>
                <Typography variant="h6" sx={{ mb: 2, color: '#0D7377' }}>
                  Emissions by Scope
                </Typography>
                <ResponsiveContainer width="100%" height="80%">
                  <PieChart>
                    <Pie
                      data={emissionScopeData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      fill="#8884d8"
                      label
                    />
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Monthly Emissions Trend Line Chart */}
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3, height: '400px' }}>
                <Typography variant="h6" sx={{ mb: 2, color: '#0D7377' }}>
                  Monthly Emissions Trend
                </Typography>
                <ResponsiveContainer width="100%" height="80%">
                  <LineChart data={monthlyEmissionTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="Scope1" stroke="#0D7377" />
                    <Line type="monotone" dataKey="Scope2" stroke="#14FFEC" />
                    <Line type="monotone" dataKey="Scope3" stroke="#00C853" />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            
            {/* Waste Management Chart */}
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3, height: '400px' }}>
                <Typography variant="h6" sx={{ mb: 2, color: '#0D7377' }}>
                  Waste Management Overview
                </Typography>
                <ResponsiveContainer width="100%" height="80%">
                  <BarChart data={wasteManagementData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#0D7377" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default SustainabilityDashboard;
