/***********************************************
 * src/screens/WasteManagement.js (Scope3W.js)
 * Screen for displaying Waste Management KPIs
 ***********************************************/

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
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from 'recharts';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import Sidebar from '../Component/sidebar.js';
import TopBar from '../Component/topbar.js';

const WasteManagement = () => {
  const [kpiData, setKpiData] = useState({
    totalWaste: 0,
    totalCO2e: 0,
    diversionRate: 0,
    wasteByType: [],
    wasteTrendData: [],
    carbonFootprintData: [],
  });
  const [startDate, setStartDate] = useState(new Date('2024-01-01'));
  const [endDate, setEndDate] = useState(new Date());
  const [error, setError] = useState(null);

  // Hardcode userId for now; replace with dynamic userId if needed
  const userId = 1;

  useEffect(() => {
    const fetchKpiData = async () => {
      try {
        const url = `http://localhost:5000/api/waste/kpis?userId=${userId}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
        console.log('Fetching KPI data from:', url);

        const response = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        console.log('Response status:', response.status);
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Response error:', errorText);
          throw new Error(`Failed to fetch KPI data: ${errorText}`);
        }

        const data = await response.json();
        console.log('Fetched KPI data:', data);
        setKpiData(data);
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
          <TopBar title="Waste Management" showDropdown={false} />
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
        <TopBar title="Waste Management" showDropdown={false} />
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
            {/* Total Waste Generated - Line Chart */}
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3, height: '400px' }}>
                <Typography variant="h6" sx={{ mb: 2, color: '#0D7377' }}>
                  Total Waste Generated: {kpiData.totalWaste} kg
                </Typography>
                <ResponsiveContainer width="100%" height="80%">
                  <LineChart data={kpiData.wasteTrendData}>
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
                  Waste Diversion Rate: {kpiData.diversionRate}%
                </Typography>
                <ResponsiveContainer width="100%" height="80%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Diverted', value: kpiData.diversionRate, color: '#0D7377' },
                        { name: 'Landfilled', value: 100 - kpiData.diversionRate, color: '#FF5252' },
                      ]}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      label
                    >
                      {[
                        { name: 'Diverted', value: kpiData.diversionRate, color: '#0D7377' },
                        { name: 'Landfilled', value: 100 - kpiData.diversionRate, color: '#FF5252' },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Waste by Type - Bar Chart */}
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3, height: '400px' }}>
                <Typography variant="h6" sx={{ mb: 2, color: '#0D7377' }}>
                  Waste by Type
                </Typography>
                <ResponsiveContainer width="100%" height="80%">
                  <BarChart data={kpiData.wasteByType}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#0D7377">
                      {kpiData.wasteByType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Carbon Footprint - Area Chart */}
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3, height: '400px' }}>
                <Typography variant="h6" sx={{ mb: 2, color: '#0D7377' }}>
                  Carbon Footprint: {kpiData.totalCO2e} kg CO2e
                </Typography>
                <ResponsiveContainer width="100%" height="80%">
                  <AreaChart data={kpiData.carbonFootprintData}>
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
