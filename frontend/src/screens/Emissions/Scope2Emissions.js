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
  TextField,
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import Chart from 'react-apexcharts';
import {
  ElectricBolt as ElectricBoltIcon,
  Fireplace as FireplaceIcon,
} from '@mui/icons-material';
import axios from 'axios';

// Color Palette (consistent with Scope1Emissions.js)
const COLORS = {
  primary: '#0D7377',
  secondary: '#14FFEC',
  accent1: '#4ECDC4',
  accent2: '#A3D8D6',
  backgroundGradient: 'linear-gradient(135deg, #E0F2F1 0%, #A3D8D6 100%)',
  textPrimary: '#2C3333',
  textSecondary: '#395B64',
};

// Glassmorphism Style (consistent with Scope1Emissions.js)
const glassStyle = {
  background: 'rgba(255, 255, 255, 0.2)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': { transform: 'translateY(-5px)' },
};
// Access the environment variable directly
const API_BASE_URL = process.env.REACT_APP_API_URL;

const Scope2Emissions = () => {
  const userId = 3; // Hardcoded for now, matching Scope1Emissions.js
  const [kpis, setKpis] = useState({
    totalScope2Emissions: 0,
    emissionsBySource: [],
    emissionsTrend: { historical: [], regression: [] },
    electricityTrend: { historical: [], regression: [] },
    steamTrend: { historical: [], regression: [] },
    emissionsPerAreaTrend: { historical: [], regression: [] },
  });
  const [startDate, setStartDate] = useState(new Date('2023-01-01'));
  const [endDate, setEndDate] = useState(new Date());
  const [trendPeriod, setTrendPeriod] = useState('month');
  const [change, setChange] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  // Number formatting function (consistent with Scope1Emissions.js)
  const formatNumber = (num) =>
    Number(num).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Fetch Scope 2 KPIs from the API
  const fetchKPIs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/scope2-kpi/kpis`, {
        params: {
          userId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          period: trendPeriod,
        },
      });
      setKpis(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Calculate percentage change based on emissions trend
  useEffect(() => {
    const { emissionsTrend } = kpis;
    if (emissionsTrend.historical && emissionsTrend.historical.length >= 2) {
      const last = emissionsTrend.historical[emissionsTrend.historical.length - 1].emissions;
      const prev = emissionsTrend.historical[emissionsTrend.historical.length - 2].emissions;
      const percentageChange = ((last - prev) / prev) * 100;
      setChange(percentageChange.toFixed(2));
    } else {
      setChange(0);
    }
  }, [kpis]);

  // Fetch data when component mounts or when dates/period change
  useEffect(() => {
    fetchKPIs();
  }, [startDate, endDate, trendPeriod]);

  // Helper function to convert period to timestamp (consistent with Scope1Emissions.js)
  const periodToTimestamp = (period) => {
    if (trendPeriod === 'month') {
      const [year, month] = period.split('-');
      return new Date(year, month - 1, 1).getTime();
    } else {
      return new Date(period, 0, 1).getTime();
    }
  };

  // Base trend options for line charts with regression
  const baseTrendOptions = {
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
    stroke: { width: [2, 2], dashArray: [0, 5] }, // Solid for historical, dashed for predicted
  };

  // Total Emissions Trend Chart
  const trendOptions = {
    ...baseTrendOptions,
    title: { text: 'Total Scope 2 Emissions Trend', align: 'center', style: { fontSize: '18px', fontWeight: 600 } },
    annotations: kpis.emissionsTrend.historical.length > 0
      ? {
          xaxis: [
            {
              x: periodToTimestamp(kpis.emissionsTrend.historical[kpis.emissionsTrend.historical.length - 1].period),
              borderColor: '#999',
              label: { text: 'Prediction Starts', style: { color: '#fff', background: '#999' } },
            },
          ],
        }
      : {},
  };
  const trendSeries = [
    { name: 'Historical Emissions', data: kpis.emissionsTrend.historical.map((d) => ({ x: periodToTimestamp(d.period), y: d.emissions })) },
    { name: 'Predicted Emissions', data: kpis.emissionsTrend.regression.map((d) => ({ x: periodToTimestamp(d.period), y: d.predictedValue })) },
  ];

  // Electricity Trend Chart
  const electricityTrendOptions = {
    ...baseTrendOptions,
    title: { text: 'Electricity Emissions Trend', align: 'center', style: { fontSize: '18px', fontWeight: 600 } },
    annotations: kpis.electricityTrend.historical.length > 0
      ? {
          xaxis: [
            {
              x: periodToTimestamp(kpis.electricityTrend.historical[kpis.electricityTrend.historical.length - 1].period),
              borderColor: '#999',
              label: { text: 'Prediction Starts', style: { color: '#fff', background: '#999' } },
            },
          ],
        }
      : {},
  };
  const electricityTrendSeries = [
    { name: 'Historical Emissions', data: kpis.electricityTrend.historical.map((d) => ({ x: periodToTimestamp(d.period), y: d.emissions })) },
    { name: 'Predicted Emissions', data: kpis.electricityTrend.regression.map((d) => ({ x: periodToTimestamp(d.period), y: d.predictedValue })) },
  ];

  // Steam Trend Chart
  const steamTrendOptions = {
    ...baseTrendOptions,
    title: { text: 'Steam Emissions Trend', align: 'center', style: { fontSize: '18px', fontWeight: 600 } },
    annotations: kpis.steamTrend.historical.length > 0
      ? {
          xaxis: [
            {
              x: periodToTimestamp(kpis.steamTrend.historical[kpis.steamTrend.historical.length - 1].period),
              borderColor: '#999',
              label: { text: 'Prediction Starts', style: { color: '#fff', background: '#999' } },
            },
          ],
        }
      : {},
  };
  const steamTrendSeries = [
    { name: 'Historical Emissions', data: kpis.steamTrend.historical.map((d) => ({ x: periodToTimestamp(d.period), y: d.emissions })) },
    { name: 'Predicted Emissions', data: kpis.steamTrend.regression.map((d) => ({ x: periodToTimestamp(d.period), y: d.predictedValue })) },
  ];

  // Emissions per Area Trend Chart
  const emissionsPerAreaOptions = {
    ...baseTrendOptions,
    title: { text: 'Emissions per Area Trend', align: 'center', style: { fontSize: '18px', fontWeight: 600 } },
    yaxis: { labels: { formatter: (val) => `${formatNumber(val)} kg CO2e / sq ft` } },
    tooltip: { y: { formatter: (val) => `${formatNumber(val)} kg CO2e / sq ft` } },
    annotations: kpis.emissionsPerAreaTrend.historical.length > 0
      ? {
          xaxis: [
            {
              x: periodToTimestamp(kpis.emissionsPerAreaTrend.historical[kpis.emissionsPerAreaTrend.historical.length - 1].period),
              borderColor: '#999',
              label: { text: 'Prediction Starts', style: { color: '#fff', background: '#999' } },
            },
          ],
        }
      : {},
  };
  const emissionsPerAreaSeries = [
    { name: 'Historical Emissions per Area', data: kpis.emissionsPerAreaTrend.historical.map((d) => ({ x: periodToTimestamp(d.period), y: d.emissionsPerArea })) },
    { name: 'Predicted Emissions per Area', data: kpis.emissionsPerAreaTrend.regression.map((d) => ({ x: periodToTimestamp(d.period), y: d.predictedValue })) },
  ];

  // Donut Chart for Emissions by Source
  const sourceOptions = {
    chart: { type: 'donut', animations: { enabled: true, easing: 'easeinout', speed: 800 } },
    colors: [COLORS.primary, COLORS.accent1],
    labels: kpis.emissionsBySource.map((s) => s.name),
    dataLabels: {
      enabled: true,
      formatter: (val) => `${val.toFixed(0)}%`,
      style: { fontSize: '14px', fontFamily: 'Poppins, sans-serif', fontWeight: 600 },
    },
    legend: { position: 'bottom', fontFamily: 'Poppins, sans-serif' },
    tooltip: { y: { formatter: (val) => `${formatNumber(val)} kg CO2e` } },
    plotOptions: { pie: { donut: { size: '50%' } } },
    title: { text: 'Emissions by Source', align: 'center', style: { fontSize: '18px', fontWeight: 600 } },
  };
  const sourceSeries = kpis.emissionsBySource.map((s) => s.value);

  return (
    <Box sx={{ display: 'flex', background: COLORS.backgroundGradient, minHeight: '100vh', p: 4, fontFamily: 'Poppins, sans-serif' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <TopBar title="Scope 2 Emissions" showDropdown={false} />
        <Container maxWidth="xl" sx={{ mt: 4 }}>
          {/* Date Range Picker and Period Toggle */}
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
            <ToggleButtonGroup
              value={trendPeriod}
              exclusive
              onChange={(e, newPeriod) => newPeriod && setTrendPeriod(newPeriod)}
            >
              <ToggleButton value="month" sx={{ color: COLORS.primary, '&.Mui-selected': { backgroundColor: COLORS.primary, color: '#FFF' } }}>
                Monthly
              </ToggleButton>
              <ToggleButton value="year" sx={{ color: COLORS.primary, '&.Mui-selected': { backgroundColor: COLORS.primary, color: '#FFF' } }}>
                Yearly
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {error && <Typography color="error">{error}</Typography>}

          {/* Total Emissions Card */}
          <Fade in={!loading} timeout={500}>
            <Card sx={{ ...glassStyle, mb: 4, p: 3, background: COLORS.primary }}>
              <CardContent>
                <Typography variant="h5" sx={{ mb: 1, color: '#FFF' }}>
                  Total Scope 2 Emissions
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="h2" sx={{ fontWeight: 700, mr: 2, color: '#FFF' }}>
                    {formatNumber(kpis.totalScope2Emissions)} kg CO2e
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

          {/* Breakdown Cards for Electricity and Steam */}
          <Grid container spacing={4} sx={{ mb: 4 }}>
            {loading
              ? [...Array(2)].map((_, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Skeleton variant="rectangular" height={150} />
                  </Grid>
                ))
              : kpis.emissionsBySource.map((source, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Fade in={!loading} timeout={500}>
                      <Card sx={{ ...glassStyle, p: 2, height: '150px' }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Avatar sx={{ backgroundColor: `${COLORS.primary}20`, mr: 2 }}>
                              {source.name === 'Electricity' ? <ElectricBoltIcon /> : <FireplaceIcon />}
                            </Avatar>
                            <Typography variant="h6" sx={{ color: COLORS.textPrimary }}>
                              {source.name}
                            </Typography>
                          </Box>
                          <Typography variant="h4" sx={{ color: COLORS.primary, fontWeight: 700 }}>
                            {formatNumber(source.value)} kg CO2e
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
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
              <Tab label="Emissions by Source" />
              <Tab label="Electricity Trend" />
              <Tab label="Steam Trend" />
              <Tab label="Emissions per Area Trend" />
            </Tabs>
            <Fade in={!loading} timeout={500}>
              <Paper sx={{ ...glassStyle, p: 3, height: '400px', mt: 2 }}>
                {activeTab === 0 && (
                  <Chart options={sourceOptions} series={sourceSeries} type="donut" height="100%" />
                )}
                {activeTab === 1 && (
                  <Chart options={electricityTrendOptions} series={electricityTrendSeries} type="line" height="100%" />
                )}
                {activeTab === 2 && (
                  <Chart options={steamTrendOptions} series={steamTrendSeries} type="line" height="100%" />
                )}
                {activeTab === 3 && (
                  <Chart options={emissionsPerAreaOptions} series={emissionsPerAreaSeries} type="line" height="100%" />
                )}
              </Paper>
            </Fade>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Scope2Emissions;