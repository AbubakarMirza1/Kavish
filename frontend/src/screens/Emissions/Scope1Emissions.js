import React, { useState, useEffect } from 'react';
import TopBar from '../../Component/topbar';
import Sidebar from '../../Component/sidebar';
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
  Tabs,
  Tab,
} from '@mui/material';
import Chart from 'react-apexcharts';
import {
  LocalFireDepartment as LocalFireDepartmentIcon,
  DirectionsCar as DirectionsCarIcon,
  AcUnit as AcUnitIcon,
  FireExtinguisher as FireExtinguisherIcon,
  GasMeter as GasMeterIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import axios from 'axios';

// Color Palette
const COLORS = {
  primary: '#0D7377',
  secondary: '#14FFEC',
  accent1: '#4ECDC4',
  accent2: '#A3D8D6',
  backgroundGradient: 'linear-gradient(135deg, #E0F2F1 0%, #A3D8D6 100%)',
  textPrimary: '#2C3333',
  textSecondary: '#395B64',
};

// Glassmorphism Style
const glassStyle = {
  background: 'rgba(255, 255, 255, 0.2)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': { transform: 'translateY(-5px)' },
};

const Scope1Emissions = () => {
  const userId = 1;
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
  const [activeTab, setActiveTab] = useState(0);

  const formatNumber = (num) =>
    Number(num).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const breakdownMapping = {
    'Stationary Combustion': 'stationaryCombustion',
    'Mobile Sources': 'mobileSources',
    'Refrigeration & AC': 'refrigerationAndAC',
    'Fire Suppression': 'fireSuppression',
    'Purchased Gases': 'purchasedGas',
  };

  const categoryIcons = {
    'Stationary Combustion': <LocalFireDepartmentIcon sx={{ fontSize: 40, color: COLORS.primary }} />,
    'Mobile Sources': <DirectionsCarIcon sx={{ fontSize: 40, color: '#FF6B6B' }} />,
    'Refrigeration & AC': <AcUnitIcon sx={{ fontSize: 40, color: COLORS.accent1 }} />,
    'Fire Suppression': <FireExtinguisherIcon sx={{ fontSize: 40, color: COLORS.primary }} />,
    'Purchased Gases': <GasMeterIcon sx={{ fontSize: 40, color: COLORS.accent2 }} />,
  };

  // Fetch Data Functions
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

  const fetchBreakdown = async () => {
    const response = await axios.get(`http://localhost:5000/api/scope1-kpi/breakdown?userId=${userId}`);
    const data = response.data;
    setBreakdown(data.breakdown);
    setTotalEmissions(data.totalScope1Emissions);
  };

  const fetchTrend = async (period) => {
    const response = await axios.get(`http://localhost:5000/api/scope1-kpi/trend?userId=${userId}&period=${period}`);
    setTrendData(response.data.trend);
  };

  const fetchTopSources = async () => {
    const response = await axios.get(`http://localhost:5000/api/scope1-kpi/top?userId=${userId}`);
    setTopSources(response.data.topSources);
  };

  const fetchFuelEmissions = async () => {
    const response = await axios.get(`http://localhost:5000/api/scope1-kpi/fuel?userId=${userId}`);
    setFuelEmissions(response.data.fuelTypeEmissions);
  };

  const fetchVehicleEmissions = async () => {
    const response = await axios.get(`http://localhost:5000/api/scope1-kpi/vehicle?userId=${userId}`);
    setVehicleEmissions(response.data.vehicleTypeEmissions);
  };

  const fetchGasEmissions = async () => {
    const response = await axios.get(`http://localhost:5000/api/scope1-kpi/gas?userId=${userId}`);
    setGasEmissions(response.data.gasTypeEmissions);
  };

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

  useEffect(() => {
    setLoading(true);
    fetchAllData();
  }, [trendPeriod]);

  // Chart Configurations
  const trendOptions = {
    chart: { type: trendPeriod === 'month' ? 'line' : 'bar', animations: { enabled: true, easing: 'easeinout', speed: 800 } },
    colors: [COLORS.primary],
    xaxis: { categories: trendData.map((d) => d.period) },
    yaxis: { labels: { formatter: (val) => `${formatNumber(val)} kg CO2e` } },
    tooltip: { y: { formatter: (val) => `${formatNumber(val)} kg CO2e` } },
    dataLabels: { enabled: false },
    legend: { position: 'top', fontFamily: 'Poppins, sans-serif' },
    grid: { borderColor: '#E0E0E0' },
  };

  const trendSeries = [{ name: 'Emissions (kg CO2e)', data: trendData.map((d) => d.totalEmissions) }];

  const topSourcesOptions = {
    chart: { type: 'donut', animations: { enabled: true, easing: 'easeinout', speed: 800 } },
    colors: [COLORS.primary, COLORS.accent1, '#FF6B6B'],
    labels: topSources.map((s) => s.name),
    dataLabels: {
      enabled: true,
      formatter: (val) => `${val.toFixed(0)}%`,
      style: { fontSize: '14px', fontFamily: 'Poppins, sans-serif', fontWeight: 600 },
    },
    legend: { position: 'bottom', fontFamily: 'Poppins, sans-serif' },
    tooltip: { y: { formatter: (val) => `${formatNumber(val)} kg CO2e` } },
    plotOptions: { pie: { donut: { size: '50%' } } },
  };

  const topSourcesSeries = topSources.map((s) => s.emissions);

  const fuelOptions = {
    chart: { type: 'bar', animations: { enabled: true, easing: 'easeinout', speed: 800 } },
    colors: [COLORS.primary],
    xaxis: { categories: fuelEmissions.map((f) => f.fuelType) },
    yaxis: { labels: { formatter: (val) => `${formatNumber(val)} kg CO2e` } },
    tooltip: { y: { formatter: (val) => `${formatNumber(val)} kg CO2e` } },
    dataLabels: { enabled: false },
    legend: { position: 'top', fontFamily: 'Poppins, sans-serif' },
  };

  const fuelSeries = [{ name: 'Emissions (kg CO2e)', data: fuelEmissions.map((f) => f.emissions) }];

  const vehicleOptions = {
    chart: { type: 'bar', animations: { enabled: true, easing: 'easeinout', speed: 800 } },
    colors: [COLORS.primary],
    xaxis: { categories: vehicleEmissions.map((v) => v.vehicleType) },
    yaxis: { labels: { formatter: (val) => `${formatNumber(val)} kg CO2e` } },
    tooltip: { y: { formatter: (val) => `${formatNumber(val)} kg CO2e` } },
    dataLabels: { enabled: false },
    legend: { position: 'top', fontFamily: 'Poppins, sans-serif' },
  };

  const vehicleSeries = [{ name: 'Emissions (kg CO2e)', data: vehicleEmissions.map((v) => v.emissions) }];

  const gasOptions = {
    chart: { type: 'pie', animations: { enabled: true, easing: 'easeinout', speed: 800 } },
    colors: [COLORS.primary, COLORS.secondary, COLORS.accent1, '#FF6B6B'],
    labels: gasEmissions.map((g) => g.gasType),
    dataLabels: {
      enabled: true,
      formatter: (val) => `${val.toFixed(0)}%`,
      style: { fontSize: '14px', fontFamily: 'Poppins, sans-serif', fontWeight: 600 },
    },
    legend: { position: 'bottom', fontFamily: 'Poppins, sans-serif' },
    tooltip: { y: { formatter: (val) => `${formatNumber(val)} kg CO2e` } },
  };

  const gasSeries = gasEmissions.map((g) => g.emissions);

  return (
    <Box sx={{ display: 'flex', background: COLORS.backgroundGradient, minHeight: '100vh', p: 4, fontFamily: 'Poppins, sans-serif' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <TopBar title="Scope 1 Emissions" showDropdown={false} />
        <Container maxWidth="xl" sx={{ mt: 4 }}>
          {error && <Typography color="error">{error}</Typography>}

          {/* Total Emissions Card */}
          <Fade in={!loading} timeout={500}>
            <Card sx={{ ...glassStyle, mb: 4, p: 3, background: COLORS.primary }}>
                <CardContent>
                <Typography variant="h5" sx={{ mb: 1, color: '#FFF' }}>
                Total Scope 1 Emissions
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="h2" sx={{ fontWeight: 700, mr: 2, color: '#FFF' }}>
                    {formatNumber(totalEmissions)} kg CO2e
                    </Typography>
                    {change !== 0 && (
                    <Typography variant="h5" sx={{ color: change >= 0 ? '#FF6B6B' : '#4ECDC4' }}>
                        {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
                    </Typography>
                    )}
                </Box>
                </CardContent>
            </Card>
            </Fade>
          {/* Breakdown Cards */}
          <Grid container spacing={4} sx={{ mb: 4 }}>
            {loading
              ? [...Array(5)].map((_, index) => (
                  <Grid item xs={12} sm={6} md={2.4} key={index}>
                    <Skeleton variant="rectangular" height={150} />
                  </Grid>
                ))
              : Object.keys(breakdownMapping).map((category, index) => (
                  <Grid item xs={12} sm={6} md={2.4} key={index}>
                    <Fade in={!loading} timeout={500}>
                      <Card sx={{ ...glassStyle, p: 2, height: '150px' }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Avatar sx={{ backgroundColor: `${COLORS.primary}20`, mr: 2 }}>
                              {categoryIcons[category]}
                            </Avatar>
                            <Typography variant="h6" sx={{ color: COLORS.textPrimary }}>
                              {category}
                            </Typography>
                          </Box>
                          <Typography variant="h4" sx={{ color: COLORS.primary, fontWeight: 700 }}>
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
            <Typography variant="h3" sx={{ mb: 2, color: COLORS.primary, fontWeight: 700 }}>
              Emissions Trend
            </Typography>
            <ToggleButtonGroup
              value={trendPeriod}
              exclusive
              onChange={(e, newPeriod) => newPeriod && setTrendPeriod(newPeriod)}
              sx={{ mb: 2 }}
            >
              <ToggleButton value="month" sx={{ color: COLORS.primary, '&.Mui-selected': { backgroundColor: COLORS.primary, color: '#FFF' } }}>
                Monthly
              </ToggleButton>
              <ToggleButton value="year" sx={{ color: COLORS.primary, '&.Mui-selected': { backgroundColor: COLORS.primary, color: '#FFF' } }}>
                Yearly
              </ToggleButton>
            </ToggleButtonGroup>
            <Fade in={!loading} timeout={500}>
              <Paper sx={{ ...glassStyle, p: 3, height: '400px' }}>
                <Chart options={trendOptions} series={trendSeries} type={trendPeriod === 'month' ? 'line' : 'bar'} height="100%" />
              </Paper>
            </Fade>
          </Box>

          {/* Insights Section with Tabs */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h3" sx={{ mb: 2, color: COLORS.primary, fontWeight: 700 }}>
              Insights
            </Typography>
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 2 }}>
              <Tab label="Top Sources" />
              <Tab label="Fuel Type" />
              <Tab label="Vehicle Type" />
              <Tab label="Gas Type" />
            </Tabs>
            <Fade in={!loading} timeout={500}>
              <Paper sx={{ ...glassStyle, p: 3, height: '400px' }}>
                {activeTab === 0 && <Chart options={topSourcesOptions} series={topSourcesSeries} type="donut" height="100%" />}
                {activeTab === 1 && <Chart options={fuelOptions} series={fuelSeries} type="bar" height="100%" />}
                {activeTab === 2 && <Chart options={vehicleOptions} series={vehicleSeries} type="bar" height="100%" />}
                {activeTab === 3 && <Chart options={gasOptions} series={gasSeries} type="pie" height="100%" />}
              </Paper>
            </Fade>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Scope1Emissions;