import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Grid,
  Paper,
} from '@mui/material';
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
  AreaChart,
  Area,
} from 'recharts';
import Sidebar from '../Component/sidebar.js'; // Import the Sidebar component
import TopBar from '../Component/topbar.js'; // Import the Sidebar component

// Mock Data for Waste Management Graphs
const wasteTrendData = [
  { month: 'Jan', wasteGenerated: 500 },
  { month: 'Feb', wasteGenerated: 550 },
  { month: 'Mar', wasteGenerated: 530 },
  { month: 'Apr', wasteGenerated: 600 },
  { month: 'May', wasteGenerated: 580 },
  { month: 'Jun', wasteGenerated: 620 },
];

const wasteDiversionData = [
  { name: 'Recycled', value: 45, color: '#0D7377' },
  { name: 'Composted', value: 25, color: '#14FFEC' },
  { name: 'Landfilled', value: 30, color: '#FF5252' },
];

const recyclingRateData = [
  { type: 'Jan', rate: 40 },
  { type: 'Feb', rate: 42 },
  { type: 'Mar', rate: 45 },
  { type: 'Apr', rate: 48 },
  { type: 'May', rate: 50 },
  { type: 'Jun', rate: 52 },
];

const carbonFootprintData = [
  { month: 'Jan', emissions: 200 },
  { month: 'Feb', emissions: 210 },
  { month: 'Mar', emissions: 220 },
  { month: 'Apr', emissions: 215 },
  { month: 'May', emissions: 205 },
  { month: 'Jun', emissions: 190 },
];

const WasteManagement = () => {
  const [setupForm, setSetupForm] = useState('Select Setup Form');
  const navigate = useNavigate();


  const handleFormChange = (event) => {
    const selectedValue = event.target.value;
    setSetupForm(selectedValue);

    if (selectedValue === 'Waste Setup Form') navigate('/WasteSetupForm');
  };


  return (
    <Box sx={{ display: 'flex' }}>
      < Sidebar />

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: '#f9f9f9' }}>
        {/* <AppBar position="sticky" color="transparent" elevation={0}>
          <Toolbar>
            <Typography variant="h5" sx={{ flexGrow: 1, color: '#0D7377' }}>
              Waste Management Dashboard
            </Typography>
            <FormControl sx={{ minWidth: 150, mr: 2 }}>
              <Select value={setupForm} onChange={handleFormChange} displayEmpty sx={{ fontSize: 16, color: '#0D7377' }}>
                <MenuItem value="Select Setup Form" disabled>
                  Select Setup Form
                </MenuItem>
                <MenuItem value="Waste Setup Form">Waste Setup Form</MenuItem>
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
                title="Waste Management" 
                showDropdown={false}
            />

        <Container maxWidth="xl" sx={{ mt: 4 }}>
          <Grid container spacing={3}>
            {/* Total Waste Generated - Line Chart */}
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3, height: '400px' }}>
                <Typography variant="h6" sx={{ mb: 2, color: '#0D7377' }}>
                  Total Waste Generated
                </Typography>
                <ResponsiveContainer width="100%" height="80%">
                  <LineChart data={wasteTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="wasteGenerated" stroke="#0D7377" />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Waste Diversion Rate - Pie Chart */}
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3, height: '400px' }}>
                <Typography variant="h6" sx={{ mb: 2, color: '#0D7377' }}>
                  Waste Diversion Rate
                </Typography>
                <ResponsiveContainer width="100%" height="80%">
                  <PieChart>
                    <Pie
                      data={wasteDiversionData}
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

            {/* Recycling Rate - Bar Chart */}
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3, height: '400px' }}>
                <Typography variant="h6" sx={{ mb: 2, color: '#0D7377' }}>
                  Recycling Rate
                </Typography>
                <ResponsiveContainer width="100%" height="80%">
                  <BarChart data={recyclingRateData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="rate" fill="#0D7377" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Carbon Footprint - Area Chart */}
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3, height: '400px' }}>
                <Typography variant="h6" sx={{ mb: 2, color: '#0D7377' }}>
                  Carbon Footprint
                </Typography>
                <ResponsiveContainer width="100%" height="80%">
                  <AreaChart data={carbonFootprintData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="emissions" stroke="#0D7377" fill="#0D737750" />
                  </AreaChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default WasteManagement;
