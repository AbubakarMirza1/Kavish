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
  Container,
  Grid,
  Paper,
  Card,
  CardContent,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Avatar,
  Skeleton,
  Fade,
  Button,
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
import {
  LocalFireDepartment as LocalFireDepartmentIcon,
  DirectionsCar as DirectionsCarIcon,
  AcUnit as AcUnitIcon,
  FireExtinguisher as FireExtinguisherIcon,
  GasMeter as GasMeterIcon,
} from '@mui/icons-material';
import axios from 'axios';

// Color Palette (feel free to adjust)
const COLORS = {
  primary: '#0D7377',      // Teal
  secondary: '#14FFEC',    // Bright Teal
  background: '#E0F2F1',   // Light Teal Background
  cardBackground: '#FFFFFF',
  textPrimary: '#2C3333',
  textSecondary: '#395B64',
};

const Scope1Emissions = () => {
  const userId = 1; // Hardcoded for now; replace with dynamic value if needed

  // State variables
  const [breakdown, setBreakdown] = useState({});
  const [totalEmissions, setTotalEmissions] = useState(0);
  const [trendData, setTrendData] = useState([]);
  const [trendPeriod, setTrendPeriod] = useState('month');
  const [topSources, setTopSources] = useState([]);
  const [fuelEmissions, setFuelEmissions] = useState([]);
  const [vehicleEmissions, setVehicleEmissions] = useState([]);
  const [gasEmissions, setGasEmissions] = useState([]);
  const [change, setChange] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Format numbers with commas and 2 decimals
  const formatNumber = (num) =>
    Number(num).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // Mapping for breakdown keys from API to our display categories
  const breakdownMapping = {
    'Stationary Combustion': 'stationaryCombustion',
    'Mobile Sources': 'mobileSources',
    'Refrigeration & AC': 'refrigerationAndAC',
    'Fire Suppression': 'fireSuppression',
    'Purchased Gases': 'purchasedGas',
  };

  // Category icons for breakdown cards
  const categoryIcons = {
    'Stationary Combustion': (
      <LocalFireDepartmentIcon sx={{ fontSize: 40, color: COLORS.primary }} />
    ),
    'Mobile Sources': (
      <DirectionsCarIcon sx={{ fontSize: 40, color: '#FF6B6B' }} />
    ),
    'Refrigeration & AC': (
      <AcUnitIcon sx={{ fontSize: 40, color: '#4ECDC4' }} />
    ),
    'Fire Suppression': (
      <FireExtinguisherIcon sx={{ fontSize: 40, color: COLORS.primary }} />
    ),
    'Purchased Gases': (
      <GasMeterIcon sx={{ fontSize: 40, color: COLORS.primary }} />
    ),
  };

  // Fetch all KPI data
  const fetchAllData = async () => {
    try {
      await Promise.all([
        fetchBreakdown(),
        fetchTrend(trendPeriod),
        fetchTopSources(),
        fetchFuelEmissions(),
        fetchVehicleEmissions(),
        fetchGasEmissions(),
      ]);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Fetch Breakdown Data
  const fetchBreakdown = async () => {
    const response = await axios.get(
      `http://localhost:5000/api/scope1-kpi/breakdown?userId=${userId}`
    );
    const data = response.data;
    setBreakdown(data.breakdown);
    setTotalEmissions(data.totalScope1Emissions);
  };

  // Fetch Trend Data
  const fetchTrend = async (period) => {
    const response = await axios.get(
      `http://localhost:5000/api/scope1-kpi/trend?userId=${userId}&period=${period}`
    );
    setTrendData(response.data.trend);
  };

  // Fetch Top Sources
  const fetchTopSources = async () => {
    const response = await axios.get(
      `http://localhost:5000/api/scope1-kpi/top?userId=${userId}`
    );
    setTopSources(response.data.topSources);
  };

  // Fetch Emissions by Fuel Type
  const fetchFuelEmissions = async () => {
    const response = await axios.get(
      `http://localhost:5000/api/scope1-kpi/fuel?userId=${userId}`
    );
    setFuelEmissions(response.data.fuelTypeEmissions);
  };

  // Fetch Emissions by Vehicle Type
  const fetchVehicleEmissions = async () => {
    const response = await axios.get(
      `http://localhost:5000/api/scope1-kpi/vehicle?userId=${userId}`
    );
    setVehicleEmissions(response.data.vehicleTypeEmissions);
  };

  // Fetch Emissions by Gas Type
  const fetchGasEmissions = async () => {
    const response = await axios.get(
      `http://localhost:5000/api/scope1-kpi/gas?userId=${userId}`
    );
    setGasEmissions(response.data.gasTypeEmissions);
  };

  // Calculate percentage change for trend
  useEffect(() => {
    if (trendData.length >= 2) {
      const last = trendData[trendData.length - 1].totalEmissions;
      const prev = trendData[trendData.length - 2].totalEmissions;
      const percentageChange = ((last - prev) / prev) * 100;
      setChange(percentageChange.toFixed(2));
    } else {
      setChange(0);
    }
  }, [trendData]);

  // Fetch data on mount or when trendPeriod changes
  useEffect(() => {
    setLoading(true);
    fetchAllData();
  }, [trendPeriod]);

  return (
    <Box sx={{ display: 'flex', backgroundColor: COLORS.background, minHeight: '100vh', p: 4 }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <TopBar title="Scope 1 Emissions" showDropdown={false} />
        <Container maxWidth="xl" sx={{ mt: 4 }}>
          {error && <Typography color="error">{error}</Typography>}

          {/* Total Emissions Card */}
          <Fade in={!loading} timeout={500}>
            <Card
              elevation={3}
              sx={{
                backgroundColor: COLORS.cardBackground,
                borderRadius: 3,
                mb: 4,
              }}
            >
              <CardContent>
                <Typography variant="subtitle1" sx={{ color: COLORS.textSecondary, mb: 1 }}>
                  Total Scope 1 Emissions
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="h3" sx={{ color: COLORS.primary, fontWeight: 700, mr: 2 }}>
                    {formatNumber(totalEmissions)} kg CO2e
                  </Typography>
                  {change !== 0 && (
                    <Typography variant="subtitle1" sx={{ color: change >= 0 ? 'error.main' : 'success.main' }}>
                      {change >= 0 ? '↑' : '↓'} {Math.abs(change)}% from previous month
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Fade>

          {/* Breakdown Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {loading
              ? [...Array(5)].map((_, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Skeleton variant="rectangular" height={120} />
                  </Grid>
                ))
              : Object.keys(breakdownMapping).map((category, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Fade in={!loading} timeout={500}>
                      <Card
                        elevation={3}
                        sx={{
                          backgroundColor: COLORS.cardBackground,
                          borderRadius: 3,
                        }}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Avatar
                              sx={{
                                backgroundColor: `${COLORS.primary}20`,
                                mr: 2,
                              }}
                            >
                              {categoryIcons[category]}
                            </Avatar>
                            <Typography variant="h6" sx={{ color: COLORS.textPrimary }}>
                              {category}
                            </Typography>
                          </Box>
                          <Typography variant="h5" sx={{ color: COLORS.primary, fontWeight: 700 }}>
                            {formatNumber(breakdown[breakdownMapping[category]] || 0)} kg CO2e
                          </Typography>
                        </CardContent>
                      </Card>
                    </Fade>
                  </Grid>
                ))}
          </Grid>


          {/* Trend Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Emissions Trend
            </Typography>
            <ToggleButtonGroup
              value={trendPeriod}
              exclusive
              onChange={(e, newPeriod) => newPeriod && setTrendPeriod(newPeriod)}
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
            <Fade in={!loading} timeout={500}>
              <Paper
                elevation={3}
                sx={{ p: 3, height: '300px', backgroundColor: '#FFFFFF', borderRadius: 2 }}
              >
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
                      <Bar dataKey="totalEmissions" fill="#0D7377" name="Emissions (kg CO2e)" />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </Paper>
            </Fade>
          </Box>

          {/* Paired Charts */}
          <Grid container spacing={3}>
            {/* Top Emission Sources */}
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" sx={{ mb: 2 }}>
                  Top Emission Sources
                </Typography>
                <Fade in={!loading} timeout={500}>
                  <Paper
                    elevation={3}
                    sx={{ p: 3, height: '300px', backgroundColor: '#FFFFFF', borderRadius: 2 }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={topSources}
                          dataKey="emissions"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={({ name, percent }) =>
                            `${name} (${(percent * 100).toFixed(0)}%)`
                          }
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
                </Fade>
              </Box>
            </Grid>

            {/* Emissions by Fuel Type */}
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" sx={{ mb: 2 }}>
                  Emissions by Fuel Type
                </Typography>
                <Fade in={!loading} timeout={500}>
                  <Paper
                    elevation={3}
                    sx={{ p: 3, height: '300px', backgroundColor: '#FFFFFF', borderRadius: 2 }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={fuelEmissions}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="fuelType" />
                        <YAxis />
                        <Tooltip formatter={(value) => `${formatNumber(value)} kg CO2e`} />
                        <Legend />
                        <Bar dataKey="emissions" fill="#0D7377" name="Emissions (kg CO2e)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Paper>
                </Fade>
              </Box>
            </Grid>

            {/* Emissions by Vehicle Type */}
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" sx={{ mb: 2 }}>
                  Emissions by Vehicle Type
                </Typography>
                <Fade in={!loading} timeout={500}>
                  <Paper
                    elevation={3}
                    sx={{ p: 3, height: '300px', backgroundColor: '#FFFFFF', borderRadius: 2 }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={vehicleEmissions}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="vehicleType" />
                        <YAxis />
                        <Tooltip formatter={(value) => `${formatNumber(value)} kg CO2e`} />
                        <Legend />
                        <Bar dataKey="emissions" fill="#0D7377" name="Emissions (kg CO2e)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Paper>
                </Fade>
              </Box>
            </Grid>

            {/* Emissions by Gas Type */}
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 4, pb: 4 }}>
                <Typography variant="h5" sx={{ mb: 2 }}>
                  Emissions by Gas Type
                </Typography>
                <Fade in={!loading} timeout={500}>
                  <Paper
                    elevation={3}
                    sx={{ p: 3, height: '300px', backgroundColor: '#FFFFFF', borderRadius: 2 }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={gasEmissions}
                          dataKey="emissions"
                          nameKey="gasType"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={({ name, percent }) =>
                            `${name} (${(percent * 100).toFixed(0)}%)`
                          }
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
                </Fade>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Scope1Emissions;
