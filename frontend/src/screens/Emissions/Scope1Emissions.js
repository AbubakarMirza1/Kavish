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
// Access the environment variable directly
const API_BASE_URL = process.env.REACT_APP_API_URL;
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

// Trend Chart Color Palette
const colorPalette = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#A133FF', '#33FFA1', '#FF8C33', '#33FFF5', '#FF33F5', '#33A1FF'];

const Scope1Emissions = () => {
  const userId = 3;
  const [breakdown, setBreakdown] = useState({});
  const [totalEmissions, setTotalEmissions] = useState(0);
  const [trendData, setTrendData] = useState({ trend: [], regression: [] });
  const [trendPeriod, setTrendPeriod] = useState('month');
  const [topSources, setTopSources] = useState([]);
  const [fuelEmissions, setFuelEmissions] = useState([]);
  const [vehicleEmissions, setVehicleEmissions] = useState([]);
  const [gasEmissions, setGasEmissions] = useState([]);
  const [sourceTrendData, setSourceTrendData] = useState([]);
  const [fuelTrendData, setFuelTrendData] = useState([]);
  const [vehicleTrendData, setVehicleTrendData] = useState([]);
  const [gasTrendData, setGasTrendData] = useState([]);
  const [change, setChange] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [viewMode, setViewMode] = useState('total'); // 'total' or 'trend'

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
    const response = await axios.get(`${API_BASE_URL}/api/scope1-kpi/breakdown?userId=${userId}`);
    const data = response.data;
    setBreakdown(data.breakdown);
    setTotalEmissions(data.totalScope1Emissions);
  };

  const fetchTrend = async (period) => {
    const response = await axios.get(`${API_BASE_URL}/api/scope1-kpi/trend?userId=${userId}&period=${period}`);
    setTrendData(response.data.trend);
  };

  const fetchTopSources = async () => {
    const response = await axios.get(`${API_BASE_URL}/api/scope1-kpi/top?userId=${userId}`);
    setTopSources(response.data.topSources);
  };

  const fetchFuelEmissions = async () => {
    const response = await axios.get(`${API_BASE_URL}/api/scope1-kpi/fuel?userId=${userId}`);
    setFuelEmissions(response.data.fuelTypeEmissions);
  };

  const fetchVehicleEmissions = async () => {
    const response = await axios.get(`${API_BASE_URL}/api/scope1-kpi/vehicle?userId=${userId}`);
    setVehicleEmissions(response.data.vehicleTypeEmissions);
  };

  const fetchGasEmissions = async () => {
    const response = await axios.get(`${API_BASE_URL}/api/scope1-kpi/gas?userId=${userId}`);
    setGasEmissions(response.data.gasTypeEmissions);
  };

  const fetchSourceTrend = async (period) => {
    const response = await axios.get(`${API_BASE_URL}/api/scope1-kpi/trend-by-source?userId=${userId}&period=${period}`);
    setSourceTrendData(response.data.trendBySource);
  };

  const fetchFuelTrend = async (period) => {
    const response = await axios.get(`${API_BASE_URL}/api/scope1-kpi/trend-by-fuel?userId=${userId}&period=${period}`);
    setFuelTrendData(response.data.trendByFuel);
  };

  const fetchVehicleTrend = async (period) => {
    const response = await axios.get(`${API_BASE_URL}/api/scope1-kpi/trend-by-vehicle?userId=${userId}&period=${period}`);
    setVehicleTrendData(response.data.trendByVehicle);
  };

  const fetchGasTrend = async (period) => {
    const response = await axios.get(`${API_BASE_URL}/api/scope1-kpi/trend-by-gas?userId=${userId}&period=${period}`);
    setGasTrendData(response.data.trendByGas);
  };

  useEffect(() => {
    if (trendData.trend && trendData.trend.length >= 2) {
      const last = trendData.trend[trendData.trend.length - 1].emissions;
      const prev = trendData.trend[trendData.trend.length - 2].emissions;
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

  useEffect(() => {
    if (viewMode === 'trend') {
      if (activeTab === 0) fetchSourceTrend(trendPeriod);
      else if (activeTab === 1) fetchFuelTrend(trendPeriod);
      else if (activeTab === 2) fetchVehicleTrend(trendPeriod);
      else if (activeTab === 3) fetchGasTrend(trendPeriod);
    }
  }, [activeTab, viewMode, trendPeriod]);

  // Helper function to convert period to timestamp
  const periodToTimestamp = (period) => {
    if (trendPeriod === 'month') {
      const [year, month] = period.split('-');
      return new Date(year, month - 1, 1).getTime();
    } else {
      return new Date(period, 0, 1).getTime();
    }
  };

  // Chart Configurations
  const trendOptions = {
    chart: { type: 'line', animations: { enabled: true, easing: 'easeinout', speed: 800 } },
    colors: [COLORS.primary, COLORS.secondary],
    xaxis: {
      type: 'datetime',
      labels: {
        formatter: (val) => {
          const date = new Date(val);
          return trendPeriod === 'month'
            ? date.toLocaleString('default', { month: 'short', year: 'numeric' })
            : date.getFullYear();
        },
      },
    },
    yaxis: { labels: { formatter: (val) => `${formatNumber(val)} kg CO2e` } },
    tooltip: { y: { formatter: (val) => `${formatNumber(val)} kg CO2e` } },
    dataLabels: { enabled: false },
    legend: { position: 'top', fontFamily: 'Poppins, sans-serif' },
    grid: { borderColor: '#E0E0E0' },
    stroke: { width: [2, 2], dashArray: [0, 5] },
    title: { text: 'Total Scope 1 Emissions Trend', align: 'center', style: { fontSize: '18px', fontWeight: 600 } },
  };

  const trendSeries = [
    { name: 'Historical Emissions', data: trendData.trend.map((d) => ({ x: periodToTimestamp(d.period), y: d.emissions })) },
    { name: 'Predicted Emissions', data: trendData.regression.map((d) => ({ x: periodToTimestamp(d.period), y: d.predictedValue })) },
  ];

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
    title: { text: 'Top Emission Sources', align: 'center', style: { fontSize: '18px', fontWeight: 600 } },
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
    title: { text: 'Emissions by Fuel Type', align: 'center', style: { fontSize: '18px', fontWeight: 600 } },
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
    title: { text: 'Emissions by Vehicle Type', align: 'center', style: { fontSize: '18px', fontWeight: 600 } },
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
    title: { text: 'Emissions by Gas Type', align: 'center', style: { fontSize: '18px', fontWeight: 600 } },
  };

  const gasSeries = gasEmissions.map((g) => g.emissions);

  // Helper to generate trend chart options and series
  const generateTrendChart = (trendData, title, typeKey) => {
    if (!trendData || trendData.length === 0) return { options: {}, series: [] };

    const series = trendData.flatMap((item, index) => {
      const color = colorPalette[index % colorPalette.length];
      return [
        {
          name: `${item[typeKey]} - Historical`,
          data: item.trend.map((d) => ({ x: periodToTimestamp(d.period), y: d.emissions })),
          color: color,
          type: 'line',
        },
        {
          name: `${item[typeKey]} - Prediction`,
          data: item.regression.map((d) => ({ x: periodToTimestamp(d.period), y: d.predictedValue })),
          color: color,
          type: 'line',
          dashArray: 5,
        },
      ];
    });

    const lastHistoricalPeriod = trendData[0]?.trend[trendData[0].trend.length - 1]?.period;
    const lastHistoricalTimestamp = lastHistoricalPeriod ? periodToTimestamp(lastHistoricalPeriod) : null;

    const options = {
      chart: { type: 'line', animations: { enabled: true, easing: 'easeinout', speed: 800 } },
      xaxis: {
        type: 'datetime',
        labels: {
          formatter: (val) => {
            const date = new Date(val);
            return trendPeriod === 'month'
              ? date.toLocaleString('default', { month: 'short', year: 'numeric' })
              : date.getFullYear();
          },
        },
      },
      yaxis: { labels: { formatter: (val) => `${formatNumber(val)} kg CO2e` } },
      tooltip: { y: { formatter: (val) => `${formatNumber(val)} kg CO2e` } },
      legend: { position: 'top', fontFamily: 'Poppins, sans-serif' },
      grid: { borderColor: '#E0E0E0' },
      stroke: { width: 2 },
      title: { text: title, align: 'center', style: { fontSize: '18px', fontWeight: 600 } },
      annotations: lastHistoricalTimestamp
        ? {
            xaxis: [
              {
                x: lastHistoricalTimestamp,
                borderColor: '#999',
                label: {
                  text: 'Prediction Starts',
                  style: { color: '#fff', background: '#999' },
                },
              },
            ],
          }
        : {},
    };

    return { options, series };
  };

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

          {/* Total Emissions Trend Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h3" sx={{ mb: 2, color: COLORS.primary, fontWeight: 700 }}>
              Total Emissions Trend
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
                <Chart options={trendOptions} series={trendSeries} type="line" height="100%" />
              </Paper>
            </Fade>
          </Box>

          {/* Insights Section with Tabs */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h3" sx={{ mb: 2, color: COLORS.primary, fontWeight: 700 }}>
              Insights
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                <Tab label="Top Sources" />
                <Tab label="Fuel Type" />
                <Tab label="Vehicle Type" />
                <Tab label="Gas Type" />
              </Tabs>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(e, newMode) => newMode && setViewMode(newMode)}
              >
                <ToggleButton value="total" sx={{ color: COLORS.primary, '&.Mui-selected': { backgroundColor: COLORS.primary, color: '#FFF' } }}>
                  Total Emissions
                </ToggleButton>
                <ToggleButton value="trend" sx={{ color: COLORS.primary, '&.Mui-selected': { backgroundColor: COLORS.primary, color: '#FFF' } }}>
                  Emissions Trend
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
            <Fade in={!loading} timeout={500}>
              <Paper sx={{ ...glassStyle, p: 3, height: '400px' }}>
                {activeTab === 0 && viewMode === 'total' && (
                  <Chart options={topSourcesOptions} series={topSourcesSeries} type="donut" height="100%" />
                )}
                {activeTab === 0 && viewMode === 'trend' && (
                  <Chart
                    options={generateTrendChart(
                      sourceTrendData.filter((t) => topSources.map((s) => s.name).includes(t.sourceType)),
                      'Emissions Trend for Top Sources',
                      'sourceType'
                    ).options}
                    series={generateTrendChart(
                      sourceTrendData.filter((t) => topSources.map((s) => s.name).includes(t.sourceType)),
                      'Emissions Trend for Top Sources',
                      'sourceType'
                    ).series}
                    type="line"
                    height="100%"
                  />
                )}
                {activeTab === 1 && viewMode === 'total' && (
                  <Chart options={fuelOptions} series={fuelSeries} type="bar" height="100%" />
                )}
                {activeTab === 1 && viewMode === 'trend' && (
                  <Chart
                    options={generateTrendChart(fuelTrendData, 'Emissions Trend by Fuel Type', 'fuelType').options}
                    series={generateTrendChart(fuelTrendData, 'Emissions Trend by Fuel Type', 'fuelType').series}
                    type="line"
                    height="100%"
                  />
                )}
                {activeTab === 2 && viewMode === 'total' && (
                  <Chart options={vehicleOptions} series={vehicleSeries} type="bar" height="100%" />
                )}
                {activeTab === 2 && viewMode === 'trend' && (
                  <Chart
                    options={generateTrendChart(vehicleTrendData, 'Emissions Trend by Vehicle Type', 'vehicleType').options}
                    series={generateTrendChart(vehicleTrendData, 'Emissions Trend by Vehicle Type', 'vehicleType').series}
                    type="line"
                    height="100%"
                  />
                )}
                {activeTab === 3 && viewMode === 'total' && (
                  <Chart options={gasOptions} series={gasSeries} type="pie" height="100%" />
                )}
                {activeTab === 3 && viewMode === 'trend' && (
                  <Chart
                    options={generateTrendChart(gasTrendData, 'Emissions Trend by Gas Type', 'gasType').options}
                    series={generateTrendChart(gasTrendData, 'Emissions Trend by Gas Type', 'gasType').series}
                    type="line"
                    height="100%"
                  />
                )}
              </Paper>
            </Fade>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Scope1Emissions;