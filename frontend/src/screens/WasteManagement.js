import React, { useState, useEffect } from 'react';
import TopBar from '../Component/topbar';
import Sidebar from '../Component/sidebar';
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
  Delete as DeleteIcon,
  Recycling as RecyclingIcon,
} from '@mui/icons-material';
import axios from 'axios';

// Access the environment variable directly
const API_BASE_URL = process.env.REACT_APP_API_URL;

// Color Palette (consistent with previous screens)
const COLORS = {
  primary: '#0D7377',
  secondary: '#14FFEC',
  accent1: '#4ECDC4',
  accent2: '#A3D8D6',
  backgroundGradient: 'linear-gradient(135deg, #E0F2F1 0%, #A3D8D6 100%)',
  textPrimary: '#2C3333',
  textSecondary: '#395B64',
};

// Glassmorphism Style (consistent with previous screens)
const glassStyle = {
  background: 'rgba(255, 255, 255, 0.2)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': { transform: 'translateY(-5px)' },
};

// Trend Chart Color Palette for Multiple Series (consistent with Scope1Emissions.js)
const colorPalette = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#A133FF', '#33FFA1', '#FF8C33', '#33FFF5', '#FF33F5', '#33A1FF'];

const WasteEmissions = () => {
  const userId = 1; // Hardcoded for now, matching previous screens
  const [kpis, setKpis] = useState({
    totalWaste: 0,
    totalCO2e: 0,
    diversionRate: 0,
    wasteByType: [],
    wasteTrend: { historical: [], regression: [] },
    carbonFootprintTrend: { historical: [], regression: [] },
    diversionRateTrend: { historical: [], regression: [] },
  });
  const [startDate, setStartDate] = useState(new Date('2023-01-01'));
  const [endDate, setEndDate] = useState(new Date());
  const [trendPeriod, setTrendPeriod] = useState('month');
  const [change, setChange] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  // Number formatting function (consistent with previous screens)
  const formatNumber = (num) =>
    Number(num).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Fetch Waste KPIs from the API
  const fetchKPIs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/waste-kpi/kpis`, {
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

  // Calculate percentage change based on waste trend
  useEffect(() => {
    const { wasteTrend } = kpis;
    if (wasteTrend.historical && wasteTrend.historical.length >= 2) {
      const last = wasteTrend.historical[wasteTrend.historical.length - 1].wasteGenerated;
      const prev = wasteTrend.historical[wasteTrend.historical.length - 2].wasteGenerated;
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

  // Helper function to convert period to timestamp (consistent with previous screens)
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
    tooltip: { y: { formatter: (val) => `${formatNumber(val)} ${activeTab === 2 ? '%' : 'kg'}` } },
    dataLabels: { enabled: false },
    legend: { position: 'top', fontFamily: 'Poppins, sans-serif' },
    grid: { borderColor: '#E0E0E0' },
    stroke: { width: [2, 2], dashArray: [0, 5] }, // Solid for historical, dashed for predicted
  };

  // Waste Trend Chart
  const wasteTrendOptions = {
    ...baseTrendOptions,
    yaxis: { labels: { formatter: (val) => `${formatNumber(val)} kg` } },
    title: { text: 'Waste Generated Trend', align: 'center', style: { fontSize: '18px', fontWeight: 600 } },
    annotations: kpis.wasteTrend.historical.length > 0
      ? {
          xaxis: [
            {
              x: periodToTimestamp(kpis.wasteTrend.historical[kpis.wasteTrend.historical.length - 1].period),
              borderColor: '#999',
              label: { text: 'Prediction Starts', style: { color: '#fff', background: '#999' } },
            },
          ],
        }
      : {},
  };
  const wasteTrendSeries = [
    { name: 'Historical Waste', data: kpis.wasteTrend.historical.map((d) => ({ x: periodToTimestamp(d.period), y: d.wasteGenerated })) },
    { name: 'Predicted Waste', data: kpis.wasteTrend.regression.map((d) => ({ x: periodToTimestamp(d.period), y: d.predictedValue })) },
  ];

  // Carbon Footprint Trend Chart
  const carbonFootprintOptions = {
    ...baseTrendOptions,
    yaxis: { labels: { formatter: (val) => `${formatNumber(val)} kg CO2e` } },
    title: { text: 'Carbon Footprint Trend', align: 'center', style: { fontSize: '18px', fontWeight: 600 } },
    annotations: kpis.carbonFootprintTrend.historical.length > 0
      ? {
          xaxis: [
            {
              x: periodToTimestamp(kpis.carbonFootprintTrend.historical[kpis.carbonFootprintTrend.historical.length - 1].period),
              borderColor: '#999',
              label: { text: 'Prediction Starts', style: { color: '#fff', background: '#999' } },
            },
          ],
        }
      : {},
  };
  const carbonFootprintSeries = [
    { name: 'Historical CO2e', data: kpis.carbonFootprintTrend.historical.map((d) => ({ x: periodToTimestamp(d.period), y: d.emissions })) },
    { name: 'Predicted CO2e', data: kpis.carbonFootprintTrend.regression.map((d) => ({ x: periodToTimestamp(d.period), y: d.predictedValue })) },
  ];

  // Diversion Rate Trend Chart
  const diversionRateOptions = {
    ...baseTrendOptions,
    yaxis: { labels: { formatter: (val) => `${formatNumber(val)} %` } },
    title: { text: 'Waste Diversion Rate Trend', align: 'center', style: { fontSize: '18px', fontWeight: 600 } },
    annotations: kpis.diversionRateTrend.historical.length > 0
      ? {
          xaxis: [
            {
              x: periodToTimestamp(kpis.diversionRateTrend.historical[kpis.diversionRateTrend.historical.length - 1].period),
              borderColor: '#999',
              label: { text: 'Prediction Starts', style: { color: '#fff', background: '#999' } },
            },
          ],
        }
      : {},
  };
  const diversionRateSeries = [
    { name: 'Historical Diversion Rate', data: kpis.diversionRateTrend.historical.map((d) => ({ x: periodToTimestamp(d.period), y: d.diversionRate })) },
    { name: 'Predicted Diversion Rate', data: kpis.diversionRateTrend.regression.map((d) => ({ x: periodToTimestamp(d.period), y: d.predictedValue })) },
  ];

  // Bar Chart for Waste by Type
  const wasteByTypeOptions = {
    chart: { type: 'bar', animations: { enabled: true, easing: 'easeinout', speed: 800 } },
    colors: [COLORS.primary],
    xaxis: { categories: kpis.wasteByType.map((w) => w.name) },
    yaxis: { labels: { formatter: (val) => `${formatNumber(val)} kg` } },
    tooltip: { y: { formatter: (val) => `${formatNumber(val)} kg` } },
    dataLabels: { enabled: false },
    legend: { position: 'top', fontFamily: 'Poppins, sans-serif' },
    title: { text: 'Waste by Type', align: 'center', style: { fontSize: '18px', fontWeight: 600 } },
  };
  const wasteByTypeSeries = [{ name: 'Waste (kg)', data: kpis.wasteByType.map((w) => w.value) }];

  // Icons for waste types (assumed based on context)
  const wasteIcons = {
    Landfill: <DeleteIcon sx={{ fontSize: 40, color: COLORS.primary }} />,
    Recycling: <RecyclingIcon sx={{ fontSize: 40, color: COLORS.accent1 }} />,
  };

  return (
    <Box sx={{ display: 'flex', background: COLORS.backgroundGradient, minHeight: '100vh', p: 4, fontFamily: 'Poppins, sans-serif' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <TopBar title="Waste Emissions" showDropdown={false} />
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

          {/* Total Waste and CO2e Card */}
          <Fade in={!loading} timeout={500}>
            <Card sx={{ ...glassStyle, mb: 4, p: 3, background: COLORS.primary }}>
              <CardContent>
                <Typography variant="h5" sx={{ mb: 1, color: '#FFF' }}>
                  Waste Overview
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, mr: 2, color: '#FFF' }}>
                    Total Waste: {formatNumber(kpis.totalWaste)} kg
                  </Typography>
                  <Typography variant="h5" sx={{ color: COLORS.accent1 }}>
                    CO2e: {formatNumber(kpis.totalCO2e)} kg
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ color: '#FFF' }}>
                  Diversion Rate: {formatNumber(kpis.diversionRate)}%
                </Typography>
                {change !== 0 && (
                  <Typography variant="h6" sx={{ color: change >= 0 ? '#FF6B6B' : '#4ECDC4' }}>
                    {change >= 0 ? '↑' : '↓'} {Math.abs(change)}% (Waste Change)
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Fade>

          {/* Breakdown Cards for Waste by Type */}
          <Grid container spacing={4} sx={{ mb: 4 }}>
            {loading
              ? [...Array(3)].map((_, index) => (
                  <Grid item xs={12} sm={4} key={index}>
                    <Skeleton variant="rectangular" height={150} />
                  </Grid>
                ))
              : kpis.wasteByType.map((waste, index) => (
                  <Grid item xs={12} sm={4} key={index}>
                    <Fade in={!loading} timeout={500}>
                      <Card sx={{ ...glassStyle, p: 2, height: '150px' }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Avatar sx={{ backgroundColor: `${COLORS.primary}20`, mr: 2 }}>
                              {wasteIcons[waste.name] || <DeleteIcon />}
                            </Avatar>
                            <Typography variant="h6" sx={{ color: COLORS.textPrimary }}>
                              {waste.name}
                            </Typography>
                          </Box>
                          <Typography variant="h4" sx={{ color: COLORS.primary, fontWeight: 700 }}>
                            {formatNumber(waste.value)} kg
                          </Typography>
                        </CardContent>
                      </Card>
                    </Fade>
                  </Grid>
                ))}
          </Grid>

          {/* Waste Trend Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h3" sx={{ mb: 2, color: COLORS.primary, fontWeight: 700 }}>
              Waste Trend
            </Typography>
            <Fade in={!loading} timeout={500}>
              <Paper sx={{ ...glassStyle, p: 3, height: '400px' }}>
                <Chart options={wasteTrendOptions} series={wasteTrendSeries} type="line" height="100%" />
              </Paper>
            </Fade>
          </Box>

          {/* Insights Section with Tabs */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h3" sx={{ mb: 2, color: COLORS.primary, fontWeight: 700 }}>
              Insights
            </Typography>
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
              <Tab label="Waste by Type" />
              <Tab label="Carbon Footprint Trend" />
              <Tab label="Diversion Rate Trend" />
            </Tabs>
            <Fade in={!loading} timeout={500}>
              <Paper sx={{ ...glassStyle, p: 3, height: '400px', mt: 2 }}>
                {activeTab === 0 && (
                  <Chart options={wasteByTypeOptions} series={wasteByTypeSeries} type="bar" height="100%" />
                )}
                {activeTab === 1 && (
                  <Chart options={carbonFootprintOptions} series={carbonFootprintSeries} type="line" height="100%" />
                )}
                {activeTab === 2 && (
                  <Chart options={diversionRateOptions} series={diversionRateSeries} type="line" height="100%" />
                )}
              </Paper>
            </Fade>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default WasteEmissions;