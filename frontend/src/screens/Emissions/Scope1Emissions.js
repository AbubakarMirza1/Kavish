/*******************************************************
 * src/screens/Emissions/Scope1Emissions.js
 *
 * Elite screen for displaying Scope 1 KPIs with interactive,
 * professional visualizations. Includes the website’s TopBar
 * and Sidebar.
 *******************************************************/
import React, { useState, useEffect } from 'react';
import TopBar from '../../Component/topbar'; // Adjust path as needed
import Sidebar from '../../Component/sidebar'; // Adjust path as needed
import {
  Box,
  Typography,
  Container,
  Grid,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import axios from 'axios';

const Scope1Emissions = () => {
  const userId = 1; // Hardcoded for now; replace with dynamic value if needed

  // KPI state variables
  const [breakdown, setBreakdown] = useState({});
  const [totalEmissions, setTotalEmissions] = useState(0);
  const [trendData, setTrendData] = useState([]);
  const [trendPeriod, setTrendPeriod] = useState('month'); // 'month' or 'year'
  const [topSources, setTopSources] = useState([]);
  const [fuelEmissions, setFuelEmissions] = useState([]);
  const [vehicleEmissions, setVehicleEmissions] = useState([]);
  const [gasEmissions, setGasEmissions] = useState([]);
  const [error, setError] = useState(null);

  // Format numbers to 2 decimals
  const formatNumber = (num) => Number(num).toFixed(2);

  // Fetch Breakdown Data
  const fetchBreakdown = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/scope1-kpi/breakdown?userId=${userId}`);
      const data = response.data;
      setBreakdown(data.breakdown);
      setTotalEmissions(data.totalScope1Emissions);
    } catch (err) {
      setError(err.message);
    }
  };

  // Fetch Trend Data (monthly or yearly)
  const fetchTrend = async (period) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/scope1-kpi/trend?userId=${userId}&period=${period}`);
      setTrendData(response.data.trend);
    } catch (err) {
      setError(err.message);
    }
  };

  // Fetch Top Sources
  const fetchTopSources = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/scope1-kpi/top?userId=${userId}`);
      setTopSources(response.data.topSources);
    } catch (err) {
      setError(err.message);
    }
  };

  // Fetch Emissions by Fuel Type
  const fetchFuelEmissions = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/scope1-kpi/fuel?userId=${userId}`);
      setFuelEmissions(response.data.fuelTypeEmissions);
    } catch (err) {
      setError(err.message);
    }
  };

  // Fetch Emissions by Vehicle Type
  const fetchVehicleEmissions = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/scope1-kpi/vehicle?userId=${userId}`);
      setVehicleEmissions(response.data.vehicleTypeEmissions);
    } catch (err) {
      setError(err.message);
    }
  };

  // Fetch Emissions by Gas Type
  const fetchGasEmissions = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/scope1-kpi/gas?userId=${userId}`);
      setGasEmissions(response.data.gasTypeEmissions);
    } catch (err) {
      setError(err.message);
    }
  };

  // Fetch all KPI data when component mounts or trendPeriod changes
  useEffect(() => {
    fetchBreakdown();
    fetchTrend(trendPeriod);
    fetchTopSources();
    fetchFuelEmissions();
    fetchVehicleEmissions();
    fetchGasEmissions();
  }, [trendPeriod]);

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: '#f9f9f9' }}>
        <TopBar title="Scope 1 Emissions" showDropdown={false} />
        <Container maxWidth="xl" sx={{ mt: 4 }}>
          {error && <Typography color="error">{error}</Typography>}

          {/* KPI Summary Cards */}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" color="primary">
                  Total Scope 1 Emissions
                </Typography>
                <Typography variant="h4" color="secondary">
                  {formatNumber(totalEmissions)} kg CO2e
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" color="primary">
                  Stationary Combustion
                </Typography>
                <Typography variant="h4" color="secondary">
                  {formatNumber(breakdown.stationaryCombustion || 0)} kg CO2e
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" color="primary">
                  Mobile Sources
                </Typography>
                <Typography variant="h4" color="secondary">
                  {formatNumber(breakdown.mobileSources || 0)} kg CO2e
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" color="primary">
                  Refrigeration & AC
                </Typography>
                <Typography variant="h4" color="secondary">
                  {formatNumber(breakdown.refrigerationAndAC || 0)} kg CO2e
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" color="primary">
                  Fire Suppression
                </Typography>
                <Typography variant="h4" color="secondary">
                  {formatNumber(breakdown.fireSuppression || 0)} kg CO2e
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" color="primary">
                  Purchased Gases
                </Typography>
                <Typography variant="h4" color="secondary">
                  {formatNumber(breakdown.purchasedGas || 0)} kg CO2e
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Trend Section */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Emissions Trend
            </Typography>
            <ToggleButtonGroup
              value={trendPeriod}
              exclusive
              onChange={(e, newPeriod) => {
                if (newPeriod) setTrendPeriod(newPeriod);
              }}
              aria-label="Trend Period"
              sx={{ mb: 2 }}
            >
              <ToggleButton value="month" aria-label="Monthly">
                Monthly
              </ToggleButton>
              <ToggleButton value="year" aria-label="Yearly">
                Yearly
              </ToggleButton>
            </ToggleButtonGroup>
            <Paper elevation={3} sx={{ p: 3, height: '400px' }}>
              <ResponsiveContainer width="100%" height="100%">
                {trendPeriod === 'month' ? (
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${formatNumber(value)} kg CO2e`} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="totalEmissions"
                      stroke="#0D7377"
                      strokeWidth={2}
                      name="Emissions (kg CO2e)"
                    />
                  </LineChart>
                ) : (
                  <BarChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${formatNumber(value)} kg CO2e`} />
                    <Legend />
                    <Bar dataKey="totalEmissions" fill="#0D7377" name="Emissions (kg CO2e)">
                      {trendData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill="#0D7377" />
                      ))}
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
            </Paper>
          </Box>

          {/* Top Emission Sources */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Top Emission Sources
            </Typography>
            <Paper elevation={3} sx={{ p: 3, height: '400px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topSources}
                    dataKey="emissions"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    label
                  >
                    {topSources.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.name === 'Stationary Combustion'
                            ? '#0D7377'
                            : entry.name === 'Mobile Sources'
                            ? '#FF8C00'
                            : '#8A2BE2'
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${formatNumber(value)} kg CO2e`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Box>

          {/* Emissions by Fuel Type */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Emissions by Fuel Type
            </Typography>
            <Paper elevation={3} sx={{ p: 3, height: '400px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={fuelEmissions}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fuelType" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${formatNumber(value)} kg CO2e`} />
                  <Legend />
                  <Bar dataKey="emissions" fill="#0D7377" name="Emissions (kg CO2e)">
                    {fuelEmissions.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.fuelType === 'Diesel'
                            ? '#0D7377'
                            : entry.fuelType === 'Natural Gas'
                            ? '#FF8C00'
                            : '#8A2BE2'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Box>

          {/* Emissions by Vehicle Type */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Emissions by Vehicle Type
            </Typography>
            <Paper elevation={3} sx={{ p: 3, height: '400px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={vehicleEmissions}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="vehicleType" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${formatNumber(value)} kg CO2e`} />
                  <Legend />
                  <Bar dataKey="emissions" fill="#0D7377" name="Emissions (kg CO2e)">
                    {vehicleEmissions.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="#0D7377" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Box>

          {/* Emissions by Gas Type */}
          <Box sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Emissions by Gas Type
            </Typography>
            <Paper elevation={3} sx={{ p: 3, height: '400px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={gasEmissions}
                    dataKey="emissions"
                    nameKey="gasType"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    label
                  >
                    {gasEmissions.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.gasType === 'R-134a'
                            ? '#0D7377'
                            : entry.gasType === 'CO2'
                            ? '#FF8C00'
                            : '#8A2BE2'
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${formatNumber(value)} kg CO2e`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Scope1Emissions;
