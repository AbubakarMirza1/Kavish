/***********************************************
 * src/screens/Emissions/Scope3Emissions.js
 * Screen for displaying Scope 3 KPIs (Business Travel)
 ***********************************************/
import TopBar from '../../Component/topbar.js'; // Adjusted path
import Sidebar from '../../Component/sidebar.js'; // Adjusted path
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  Paper,
  TextField,
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
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  AreaChart,
  Area,
} from 'recharts';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import axios from 'axios';

const Scope3Emissions = () => {
  const [kpiData, setKpiData] = useState({
    totalCO2e: 0,
    emissionsPerMile: 0,
    emissionsByVehicleType: [],
    emissionsTrendData: [],
    emissionsBreakdown: [], // For CO2, CH4, N2O breakdown
  });
  const [startDate, setStartDate] = useState(new Date('2024-01-01'));
  const [endDate, setEndDate] = useState(new Date());
  const [error, setError] = useState(null);

  // Hardcode userId for now; replace with dynamic userId if needed
  const userId = 1;

  useEffect(() => {
    const fetchKpiData = async () => {
      try {
        const url = `http://localhost:5000/api/scope3/kpis?userId=${userId}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
        console.log('Fetching KPI data from:', url);

        const response = await axios.get(url, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        console.log('Response status:', response.status);
        if (response.status !== 200) {
          const errorText = await response.text();
          console.error('Response error:', errorText);
          throw new Error(`Failed to fetch KPI data: ${errorText}`);
        }

        const data = await response.data;
        console.log('Fetched KPI data:', data);

        // Calculate emissions breakdown (CO2, CH4, N2O) - placeholder for now
        const totalCO2e = data.totalCO2e || 0;
        const emissionsBreakdown = [
          { name: 'CO2', value: totalCO2e * 0.8, color: '#0D7377' }, // 80% CO2
          { name: 'CH4', value: totalCO2e * 0.15, color: '#FF5252' }, // 15% CH4
          { name: 'N2O', value: totalCO2e * 0.05, color: '#FFD700' }, // 5% N2O
        ];

        // Update emissionsByVehicleType with consistent colors
        const updatedEmissionsByVehicleType = data.emissionsByVehicleType.map((entry, index) => ({
          ...entry,
          color: '#0D7377', // Match WasteManagement color
        }));

        setKpiData({
          ...data,
          emissionsByVehicleType: updatedEmissionsByVehicleType,
          emissionsBreakdown,
        });
        setError(null);
      } catch (error) {
        console.error('Error fetching KPI data:', error.message);
        setError(`Unable to load KPI data: ${error.message}. Please try again later.`);
      }
    };
    fetchKpiData();
  }, [startDate, endDate]);

  if (error) {
    return (
      <Box sx={{ display: 'flex' }}>
        <Sidebar />
        <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: '#f9f9f9' }}>
          <TopBar title="Scope 3 Emissions (Business Travel)" showDropdown={false} />
          <Container maxWidth="xl" sx={{ mt: 4 }}>
            <Typography color="error">{error}</Typography>
          </Container>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: '#f9f9f9' }}>
        <TopBar title="Scope 3 Emissions (Business Travel)" showDropdown={false} />
        <Container maxWidth="xl" sx={{ mt: 4 }}>
          {/* Date Range Picker */}
          <Box sx={{ mb: 4, display: 'flex', gap: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                renderInput={(params) => <TextField {...params} />}
              />
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                renderInput={(params) => <TextField {...params} />}
              />
            </LocalizationProvider>
          </Box>

          <Grid container spacing={3}>
            {/* Total CO2e Emissions - Line Chart (like Total Waste Generated) */}
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3, height: '400px' }}>
                <Typography variant="h6" sx={{ mb: 2, color: '#0D7377' }}>
                  Total CO2e Emissions: {kpiData.totalCO2e} kg CO2e
                </Typography>
                <ResponsiveContainer width="100%" height="80%">
                  <LineChart data={kpiData.emissionsTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="emissions" stroke="#0D7377" name="Emissions (kg CO2e)" />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Emissions Breakdown - Pie Chart (like Waste Diversion Rate) */}
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3, height: '400px' }}>
                <Typography variant="h6" sx={{ mb: 2, color: '#0D7377' }}>
                  Emissions Breakdown
                </Typography>
                <ResponsiveContainer width="100%" height="80%">
                  <PieChart>
                    <Pie
                      data={kpiData.emissionsBreakdown}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      label
                    >
                      {kpiData.emissionsBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Emissions by Vehicle Type - Bar Chart (like Waste by Type) */}
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3, height: '400px' }}>
                <Typography variant="h6" sx={{ mb: 2, color: '#0D7377' }}>
                  Emissions by Vehicle Type
                </Typography>
                <ResponsiveContainer width="100%" height="80%">
                  <BarChart data={kpiData.emissionsByVehicleType}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="vehicleType" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="emissions" fill="#0D7377" name="Emissions by Vehicle Type (kg CO2e)">
                      {kpiData.emissionsByVehicleType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Emissions per Mile - Area Chart (like Carbon Footprint) */}
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3, height: '400px' }}>
                <Typography variant="h6" sx={{ mb: 2, color: '#0D7377' }}>
                  Emissions per Mile: {kpiData.emissionsPerMile} kg CO2e/mile
                </Typography>
                <ResponsiveContainer width="100%" height="80%">
                  <AreaChart data={kpiData.emissionsTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="emissions" stroke="#0D7377" fill="#0D737750" name="Emissions (kg CO2e)" />
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

export default Scope3Emissions;
