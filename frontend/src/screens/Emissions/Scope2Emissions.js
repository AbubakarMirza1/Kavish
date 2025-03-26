/***********************************************
 * src/screens/Emissions/Scope2Emissions.js
 * Screen for displaying Scope 2 KPIs (Electricity and Steam)
 ***********************************************/
import TopBar from '../../Component/topbar.js';
import Sidebar from '../../Component/sidebar.js';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  Paper,
  TextField,
  CircularProgress,
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

const Scope2Emissions = () => {
  const [kpiData, setKpiData] = useState({
    totalCO2e: 0,
    totalElectricityCO2e: 0,
    totalSteamCO2e: 0,
    emissionsPerSqFt: 0,
    emissionsBreakdown: [],
    emissionsTrendData: [],
  });
  const [startDate, setStartDate] = useState(new Date('2024-01-01'));
  const [endDate, setEndDate] = useState(new Date());
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const userId = 1; // Hardcoded for now, replace with dynamic value if needed

  useEffect(() => {
    const fetchKpiData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/scope2/kpis`, {
          params: {
            userId,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
          }
        });

        if (response.status !== 200) {
          throw new Error(`Failed to fetch KPI data: ${response.statusText}`);
        }

        const data = response.data;
       
        // Format data for consistent visualization
        const formattedEmissionsBreakdown = [
          {
            name: 'Electricity',
            value: data.totalElectricityCO2e,
            color: '#0D7377'
          },
          {
            name: 'Steam',
            value: data.totalSteamCO2e,
            color: '#FF5252'
          }
        ];

        setKpiData({
          ...data,
          emissionsBreakdown: formattedEmissionsBreakdown
        });
        setError(null);
      } catch (error) {
        console.error('Error fetching Scope 2 KPI data:', error);
        setError(`Unable to load Scope 2 data: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
   
    fetchKpiData();
  }, [startDate, endDate, userId]);

  if (error) {
    return (
      <Box sx={{ display: 'flex' }}>
        <Sidebar />
        <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: '#f9f9f9' }}>
          <TopBar title="Scope 2 Emissions" showDropdown={false} />
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
        <TopBar title="Scope 2 Emissions" showDropdown={false} />
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

          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="200px">
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {/* Total CO2e Emissions - Line Chart */}
              <Grid item xs={12} md={6}>
                <Paper elevation={2} sx={{ p: 3, height: '400px' }}>
                  <Typography variant="h6" sx={{ mb: 2, color: '#0D7377' }}>
                    Total CO2e Emissions: {kpiData.totalCO2e.toFixed(2)} kg CO2e
                  </Typography>
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    Electricity: {kpiData.totalElectricityCO2e.toFixed(2)} kg CO2e
                    <br />
                    Steam: {kpiData.totalSteamCO2e.toFixed(2)} kg CO2e
                  </Typography>
                  <ResponsiveContainer width="100%" height="80%">
                    <LineChart data={kpiData.emissionsTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="total"
                        stroke="#0D7377"
                        name="Total Emissions"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="electricity"
                        stroke="#4CAF50"
                        name="Electricity"
                      />
                      <Line
                        type="monotone"
                        dataKey="steam"
                        stroke="#FF5252"
                        name="Steam"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>

              {/* Emissions Breakdown - Pie Chart */}
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
                        outerRadius={100}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {kpiData.emissionsBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} kg CO2e`, 'Emissions']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>

              {/* Electricity Metrics - Area Chart */}
              <Grid item xs={12} md={6}>
                <Paper elevation={2} sx={{ p: 3, height: '400px' }}>
                  <Typography variant="h6" sx={{ mb: 2, color: '#0D7377' }}>
                    Electricity Metrics
                  </Typography>
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    Emissions per Sq Ft: {kpiData.emissionsPerSqFt.toFixed(2)} kg CO2e/sq ft
                  </Typography>
                  <ResponsiveContainer width="100%" height="80%">
                    <AreaChart data={kpiData.emissionsTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="electricity"
                        stroke="#4CAF50"
                        fill="#4CAF5050"
                        name="Electricity Emissions"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>

              {/* Steam Metrics - Bar Chart */}
              <Grid item xs={12} md={6}>
                <Paper elevation={2} sx={{ p: 3, height: '400px' }}>
                  <Typography variant="h6" sx={{ mb: 2, color: '#0D7377' }}>
                    Steam Metrics
                  </Typography>
                  <ResponsiveContainer width="100%" height="80%">
                    <BarChart data={kpiData.emissionsTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="steam" name="Steam Emissions" fill="#FF5252" />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            </Grid>
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default Scope2Emissions;