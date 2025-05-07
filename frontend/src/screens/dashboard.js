import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Card,
  Typography,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
  IconButton,
  Fade,
  Collapse,
  useTheme,
  useMediaQuery,
  FormControl,
  MenuItem,
  Select,
  InputLabel,
  Divider,
  Tooltip,
  Badge,
  Avatar,
  Button,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { styled } from '@mui/system';
import {
  Dashboard as DashboardIcon,
  Insights as InsightsIcon,
  TrendingUp as TrendingUpIcon,
  LocalFireDepartment as LocalFireDepartmentIcon,
  ElectricBolt as ElectricBoltIcon,
  Flight as FlightIcon,
  Recycling as RecyclingIcon,
  CalendarMonth as CalendarMonthIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ShowChart as ShowChartIcon,
  FilterAlt as FilterAltIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  FullscreenOutlined as FullscreenIcon,
  InfoOutlined as InfoIcon,
  CloudDownload as DownloadIcon,
  ArrowDropDown as ArrowDropDownIcon,
  NavigateNext as NavigateNextIcon,
  DateRange as DateRangeIcon,
  Public as PublicIcon,
  Spa as SpaIcon,
  Speed as SpeedIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Layers as LayersIcon,
} from '@mui/icons-material';
import Chart from 'react-apexcharts';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { add, format, parse, isAfter, isBefore } from 'date-fns';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useSpring, animated } from 'react-spring';
import TopBar from '../Component/topbar';
import Sidebar from '../Component/sidebar';

// Define the color palette
const COLORS = {
  primary: '#0D7377', // Deep teal
  secondary: '#14FFEC', // Bright cyan/aqua
  accent1: '#4ECDC4', // Medium teal
  accent2: '#A3D8D6', // Light teal
  backgroundGradient: 'linear-gradient(135deg, #E0F2F1 0%, #A3D8D6 100%)',
  textPrimary: '#2C3333', // Dark gray
  textSecondary: '#395B64', // Medium dark blue-gray
};

// Custom styled components with updated colors
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  position: 'relative',
  transition: 'all 0.3s ease',
  overflow: 'hidden',
  height: '100%',
  background: '#FFFFFF', // White background
  boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.1)',
  border: '1px solid #A3D8D6', // Light teal border
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 12px 28px rgba(0, 0, 0, 0.2)',
  },
}));

const AnimatedNumber = ({ value, prefix = '', suffix = '', decimals = 2 }) => {
  const numericValue = typeof value === 'number' ? value : 0;
  const { number } = useSpring({
    from: { number: 0 },
    number: numericValue,
    delay: 200,
    config: { mass: 1, tension: 20, friction: 10 },
  });

  return (
    <animated.span>
      {prefix}
      <animated.span>
        {number.to((n) => n.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ','))}
      </animated.span>
      {suffix}
    </animated.span>
  );
};

const SectionTitle = styled(Typography)(({ theme }) => ({
  position: 'relative',
  display: 'inline-block',
  marginBottom: theme.spacing(3),
  fontWeight: 600,
  color: COLORS.textPrimary,
  '&:after': {
    content: '""',
    position: 'absolute',
    left: 0,
    bottom: -8,
    width: 40,
    height: 4,
    borderRadius: 2,
    background: COLORS.primary,
  },
}));

const CardHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(2),
  borderBottom: `1px solid ${COLORS.accent2}`,
}));

const KPIIndicator = styled(Box)(({ theme, trend = 'neutral' }) => ({
  display: 'flex',
  alignItems: 'center',
  color: trend === 'positive' ? '#4caf50' : trend === 'negative' ? '#f44336' : '#757575',
  fontSize: '0.875rem',
  fontWeight: 500,
}));

const GlowingLayer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: `radial-gradient(circle at 50% -50%, ${COLORS.accent1}15, ${COLORS.accent1}00 70%)`,
  pointerEvents: 'none',
}));

const DateRangeContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 60,
  right: 0,
  zIndex: 1000,
  background: theme.palette.background.paper,
  boxShadow: theme.shadows[3],
  borderRadius: theme.shape.borderRadius,
}));

const Dashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [period, setPeriod] = useState('month');
  const [selectedTab, setSelectedTab] = useState(0);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [chartView, setChartView] = useState('trend');
  const [expandedCard, setExpandedCard] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [openDialog, setOpenDialog] = useState('');

  // Date range state
  const [dateRange, setDateRange] = useState({
    startDate: add(new Date(), { months: -6 }),
    endDate: new Date(),
    key: 'selection',
  });

  // Memoized formatted date strings for API calls
  const formattedDates = useMemo(
    () => ({
      startDate: format(dateRange.startDate, 'yyyy-MM-dd'),
      endDate: format(dateRange.endDate, 'yyyy-MM-dd'),
    }),
    [dateRange]
  );

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const response = await axios.get('http://localhost:5000/api/dashboard-kpi/kpis', {
        params: {
          userId: 1, // Replace with actual user ID
          startDate: formattedDates.startDate,
          endDate: formattedDates.endDate,
          period,
        },
      });
      setDashboardData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchDashboardData();
  }, [formattedDates.startDate, formattedDates.endDate, period]);

  // Toggle date picker visibility
  const handleDatePickerToggle = () => {
    setShowDatePicker(!showDatePicker);
  };

  // Handle date range selection
  const handleDateRangeChange = (ranges) => {
    if (ranges.selection) {
      setDateRange(ranges.selection);
      setShowDatePicker(false);
    }
  };

  // Handle period change
  const handlePeriodChange = (event) => {
    setPeriod(event.target.value);
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  // Handle chart view change
  const handleChartViewChange = (view) => {
    setChartView(view);
  };

  // Handle card expansion
  const handleExpandCard = (cardId) => {
    setExpandedCard(expandedCard === cardId ? null : cardId);
  };

  // Calculate percentage changes for KPIs
  const calculateChange = (trend) => {
    if (!trend || !trend.historical || trend.historical.length < 2) return 0;
    const sortedTrend = [...trend.historical].sort((a, b) => a.period.localeCompare(b.period));
    const latestValue = sortedTrend[sortedTrend.length - 1].emissions;
    const previousValue = sortedTrend[sortedTrend.length - 2].emissions;
    if (previousValue === 0) return 0;
    return ((latestValue - previousValue) / previousValue) * 100;
  };

  // Format number with specified precision
  const formatNumber = (num, precision = 2) => {
    if (num === undefined || num === null) return '0';
    return Number(num).toLocaleString(undefined, {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    });
  };

  // Determine trend direction icon
  const getTrendIcon = (value) => {
    if (value > 0) return <TrendingUpIcon sx={{ color: '#f44336', fontSize: '1rem', ml: 0.5 }} />;
    if (value < 0) return <TrendingUpIcon sx={{ color: '#4caf50', fontSize: '1rem', ml: 0.5, transform: 'rotate(180deg)' }} />;
    return null;
  };

  // Determine trend color
  const getTrendColor = (value, inverse = false) => {
    if (inverse) {
      return value > 0 ? '#4caf50' : value < 0 ? '#f44336' : '#757575';
    }
    return value > 0 ? '#f44336' : value < 0 ? '#4caf50' : '#757575';
  };

  // Mapping of technical source names to readable labels
  const SOURCE_NAME_MAPPING = {
    'Stationary Combustion': 'Facility Heating',
    'Mobile Combustion': 'Fleet Vehicles',
    'Fugitive Emissions': 'Refrigerant Leaks',
    'Purchased Electricity': 'Electricity Usage',
    'Purchased Heating': 'District Heating',
    'Business Travel': 'Corporate Travel',
    'Employee Commuting': 'Staff Commuting',
    'Upstream Transportation': 'Supply Chain Logistics',
    'Waste Generated': 'Operational Waste',
    // Add more mappings as needed
  };

  // Generate chart options and series for overall emissions trend
  const overallEmissionsTrendConfig = useMemo(() => {
    if (!dashboardData || !dashboardData.overallEmissionsTrend) {
      return { options: {}, series: [] };
    }

    const historicalData = dashboardData.overallEmissionsTrend.historical || [];
    const regressionData = dashboardData.overallEmissionsTrend.regression || [];
    const lastHistoricalPeriod = historicalData.length > 0 ? historicalData[historicalData.length - 1].period : null;

    const periodToTimestamp = (periodStr) => {
      if (period === 'month') {
        const [year, month] = periodStr.split('-').map(Number);
        return new Date(year, month - 1, 1).getTime();
      } else {
        return new Date(parseInt(periodStr), 0, 1).getTime();
      }
    };

    const options = {
      chart: {
        id: 'emissions-trend',
        type: 'line',
        toolbar: {
          show: true,
          tools: {
            download: true,
            selection: true,
            zoom: true,
            zoomin: true,
            zoomout: true,
            pan: true,
            reset: true,
          },
          autoSelected: 'zoom',
        },
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800,
          dynamicAnimation: {
            enabled: true,
            speed: 350,
          },
        },
      },
      colors: [COLORS.primary, COLORS.accent1],
      dataLabels: { enabled: false },
      stroke: {
        curve: 'smooth',
        width: [3, 2],
        lineCap: 'round',
        dashArray: [0, 5],
      },
      grid: {
        borderColor: theme.palette.divider,
        row: { colors: [theme.palette.background.default, 'transparent'], opacity: 0.5 },
      },
      markers: {
        size: 4,
        colors: [COLORS.primary, COLORS.accent1],
        strokeWidth: 0,
        hover: { size: 6 },
      },
      xaxis: {
        type: 'datetime',
        labels: {
          format: period === 'month' ? 'MMM yyyy' : 'yyyy',
          style: { colors: COLORS.textSecondary, fontFamily: theme.typography.fontFamily, fontSize: '14px' },
        },
        tooltip: { enabled: false },
      },
      yaxis: {
        title: {
          text: 'Emissions (kg CO₂e)',
          style: { fontSize: '14px', fontWeight: 500, color: COLORS.textPrimary },
        },
        labels: {
          formatter: (val) => formatNumber(val),
          style: { colors: COLORS.textSecondary, fontFamily: theme.typography.fontFamily },
        },
      },
      tooltip: {
        shared: true,
        intersect: false,
        y: { formatter: (val) => `${formatNumber(val)} kg CO₂e` },
        x: {
          formatter: (timestamp) => {
            const date = new Date(timestamp);
            return period === 'month' ? format(date, 'MMMM yyyy') : format(date, 'yyyy');
          },
        },
        theme: theme.palette.mode,
      },
      legend: {
        position: 'top',
        horizontalAlign: 'left',
        fontFamily: theme.typography.fontFamily,
        fontSize: '14px',
        offsetY: 8,
      },
      annotations: lastHistoricalPeriod
        ? {
            xaxis: [
              {
                x: periodToTimestamp(lastHistoricalPeriod),
                borderColor: theme.palette.grey[400],
                borderWidth: 1,
                strokeDashArray: 5,
                label: {
                  text: 'Prediction Starts',
                  orientation: 'horizontal',
                  borderColor: theme.palette.grey[400],
                  style: {
                    background: theme.palette.grey[300],
                    color: COLORS.textPrimary,
                    fontSize: '12px',
                    fontWeight: 400,
                    fontFamily: theme.typography.fontFamily,
                    padding: { left: 8, right: 8, top: 4, bottom: 4 },
                  },
                },
              },
            ],
          }
        : {},
      fill: {
        type: ['gradient', 'gradient'],
        gradient: {
          shade: 'light',
          type: 'vertical',
          shadeIntensity: 0.2,
          opacityFrom: 0.7,
          opacityTo: 0.2,
          stops: [0, 100],
        },
      },
      responsive: [{ breakpoint: 600, options: { legend: { position: 'bottom', offsetY: 0 } } }],
    };

    const series = [
      {
        name: 'Historical Emissions',
        type: 'area',
        data: historicalData.map((d) => ({
          x: periodToTimestamp(d.period),
          y: d.emissions,
        })),
      },
      {
        name: 'Projected Emissions',
        type: 'line',
        data: regressionData.map((d) => ({
          x: periodToTimestamp(d.period),
          y: d.predictedValue,
        })),
      },
    ];

    return { options, series };
  }, [dashboardData, period, theme]);

  // Generate chart options for emissions by scope
  const emissionsByScopeConfig = useMemo(() => {
    if (!dashboardData || !dashboardData.totalEmissionsByScope) {
      return { options: {}, series: [] };
    }

    const { scope1, scope2, scope3 } = dashboardData.totalEmissionsByScope;
    const total = scope1 + scope2 + scope3;

    const options = {
      chart: {
        id: 'emissions-by-scope',
        type: 'donut',
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800,
          dynamicAnimation: { enabled: true, speed: 350 },
        },
      },
      colors: [COLORS.primary, COLORS.accent1, COLORS.accent2],
      labels: ['Scope 1', 'Scope 2', 'Scope 3'],
      legend: {
        position: 'bottom',
        fontSize: '14px',
        fontFamily: theme.typography.fontFamily,
        formatter: function (seriesName, opts) {
          const value = opts.w.globals.series[opts.seriesIndex];
          const percentage = ((value / total) * 100).toFixed(1);
          return `${seriesName}: ${formatNumber(value)} kg CO₂e (${percentage}%)`;
        },
      },
      plotOptions: {
        pie: {
          donut: {
            size: '65%',
            labels: {
              show: true,
              name: {
                show: true,
                fontSize: '16px',
                fontFamily: theme.typography.fontFamily,
                color: COLORS.textPrimary,
              },
              value: {
                show: true,
                fontSize: '20px',
                fontFamily: theme.typography.fontFamily,
                color: COLORS.textPrimary,
                formatter: (val) => `${formatNumber(val)} kg CO₂e`,
              },
              total: {
                show: true,
                label: 'Total Emissions',
                fontSize: '16px',
                fontFamily: theme.typography.fontFamily,
                color: COLORS.textPrimary,
                formatter: () => `${formatNumber(total)} kg CO₂e`,
              },
            },
          },
        },
      },
      dataLabels: { enabled: false },
      responsive: [{ breakpoint: 600, options: { chart: { height: 300 }, legend: { position: 'bottom' } } }],
      tooltip: { y: { formatter: (val) => `${formatNumber(val)} kg CO₂e` }, theme: theme.palette.mode },
    };

    const series = [scope1, scope2, scope3];

    return { options, series };
  }, [dashboardData, theme]);

  // Generate chart for top emission sources
  const topEmissionSourcesConfig = useMemo(() => {
    if (!dashboardData || !dashboardData.topEmissionSources) {
      return { options: {}, series: [] };
    }

    // Filter valid sources and convert emissions to tCO2e
    const validSources = dashboardData.topEmissionSources
      .filter((source) => typeof source.emissions === 'number' && !isNaN(source.emissions))
      .map((source) => ({
        ...source,
        emissions: source.emissions / 1000, // Convert kg CO2e to tCO2e
        displayName: SOURCE_NAME_MAPPING[source.name] || source.name, // Use readable name
      }));

    // Define colors by scope
    const scopeColors = {
      'Scope 1': COLORS.primary,
      'Scope 2': COLORS.accent1,
      'Scope 3': COLORS.accent2,
    };

    const options = {
      chart: {
        id: 'top-emission-sources',
        type: 'bar',
        height: '100%',
        toolbar: {
          show: true,
          tools: {
            download: true,
            selection: true,
            zoom: false,
            zoomin: false,
            zoomout: false,
            pan: false,
            reset: true,
          },
        },
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800,
          animateGradually: { enabled: true, delay: 150 },
          dynamicAnimation: { enabled: true, speed: 350 },
        },
      },
      plotOptions: {
        bar: {
          horizontal: false, // Vertical bars
          columnWidth: '40%', // Slimmer bars for a modern look
          borderRadius: 4, // Rounded bar tops
          dataLabels: {
            position: 'top', // Place labels above bars
          },
        },
      },
      colors: validSources.map((source) => scopeColors[source.scope] || COLORS.accent1),
      dataLabels: {
        enabled: true,
        formatter: (val) => `${val.toFixed(1)} tCO2e`, // Display in tCO2e with 1 decimal
        offsetY: -20, // Position above bars
        style: {
          fontSize: '12px',
          fontFamily: theme.typography.fontFamily,
          colors: [COLORS.textPrimary],
          fontWeight: 600,
        },
      },
      stroke: {
        show: true,
        width: 1,
        colors: ['#fff'], // White outline for bars
      },
      xaxis: {
        categories: validSources.map((source) => source.displayName),
        labels: {
          style: {
            fontSize: '14px',
            fontFamily: theme.typography.fontFamily,
            colors: Array(validSources.length).fill(COLORS.textSecondary),
            fontWeight: 500,
          },
          rotate: -45, // Rotate labels for better readability
          rotateAlways: true,
          offsetY: 5,
        },
        axisBorder: { show: true, color: theme.palette.divider },
        axisTicks: { show: true, color: theme.palette.divider },
      },
      yaxis: {
        title: {
          text: 'Emissions (tCO2e)',
          style: {
            fontSize: '14px',
            fontWeight: 500,
            color: COLORS.textPrimary,
            fontFamily: theme.typography.fontFamily,
          },
        },
        labels: {
          formatter: (val) => val.toFixed(1), // 1 decimal for y-axis
          style: {
            fontSize: '12px',
            fontFamily: theme.typography.fontFamily,
            colors: COLORS.textSecondary,
          },
        },
      },
      grid: {
        borderColor: theme.palette.divider,
        strokeDashArray: 4, // Dashed grid lines for a cleaner look
      },
      tooltip: {
        theme: theme.palette.mode,
        y: {
          formatter: (val, { dataPointIndex }) => {
            const source = validSources[dataPointIndex];
            return `${val.toFixed(1)} tCO2e (${source.scope})`;
          },
        },
        x: {
          formatter: (val, { dataPointIndex }) => validSources[dataPointIndex].displayName,
        },
        style: {
          fontSize: '12px',
          fontFamily: theme.typography.fontFamily,
        },
      },
      legend: {
        position: 'top',
        horizontalAlign: 'left',
        fontFamily: theme.typography.fontFamily,
        fontSize: '14px',
        markers: {
          width: 12,
          height: 12,
          radius: 12,
        },
        labels: {
          colors: COLORS.textPrimary,
        },
        formatter: (seriesName, opts) => {
          const scope = validSources[opts.seriesIndex]?.scope || 'Unknown';
          return `${scope}`;
        },
      },
      fill: {
        type: 'gradient',
        gradient: {
          shade: 'light',
          type: 'vertical',
          shadeIntensity: 0.3,
          opacityFrom: 0.9,
          opacityTo: 0.6,
          stops: [0, 100],
        },
      },
      responsive: [
        {
          breakpoint: 600,
          options: {
            chart: { height: 300 },
            xaxis: { labels: { rotate: -60, style: { fontSize: '12px' } } },
            dataLabels: { enabled: false }, // Hide data labels on small screens
            legend: { position: 'bottom', offsetY: 0 },
          },
        },
      ],
    };

    const series = [
      {
        name: 'Emissions',
        data: validSources.map((source) => source.emissions),
      },
    ];

    return { options, series };
  }, [dashboardData, theme]);

  // Generate waste management chart
  const wasteManagementConfig = useMemo(() => {
    if (!dashboardData || !dashboardData.wasteManagementOverview) {
      return { options: {}, series: [] };
    }

    const { totalWaste, diversionRate } = dashboardData.wasteManagementOverview;
    const diverted = totalWaste * (diversionRate / 100);
    const landfill = totalWaste - diverted;

    const options = {
      chart: {
        id: 'waste-management',
        type: 'donut',
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800,
        },
      },
      colors: ['#4caf50', '#ff9800'],
      labels: ['Diverted Waste', 'Landfill Waste'],
      legend: {
        position: 'bottom',
        fontSize: '14px',
        fontFamily: theme.typography.fontFamily,
        formatter: function (seriesName, opts) {
          const value = opts.w.globals.series[opts.seriesIndex];
          const percentage = ((value / totalWaste) * 100).toFixed(1);
          return `${seriesName}: ${formatNumber(value)} kg (${percentage}%)`;
        },
      },
      plotOptions: {
        pie: {
          donut: {
            size: '65%',
            labels: {
              show: true,
              name: {
                show: true,
                fontSize: '16px',
                fontFamily: theme.typography.fontFamily,
                color: COLORS.textPrimary,
              },
              value: {
                show: true,
                fontSize: '20px',
                fontFamily: theme.typography.fontFamily,
                color: COLORS.textPrimary,
                formatter: (val) => `${formatNumber(val)} kg`,
              },
              total: {
                show: true,
                label: 'Total Waste',
                fontSize: '16px',
                fontFamily: theme.typography.fontFamily,
                color: COLORS.textPrimary,
                formatter: () => `${formatNumber(totalWaste)} kg`,
              },
            },
          },
        },
      },
      dataLabels: { enabled: false },
      responsive: [{ breakpoint: 600, options: { chart: { height: 300 }, legend: { position: 'bottom' } } }],
      tooltip: { y: { formatter: (val) => `${formatNumber(val)} kg` }, theme: theme.palette.mode },
    };

    const series = [diverted, landfill];

    return { options, series };
  }, [dashboardData, theme]);

  // Calculate emissions intensity
  const emissionsIntensity = useMemo(() => {
    if (!dashboardData || !dashboardData.keyMetrics?.totalEmissions) return 0;
    const employeeCount = 100; // Placeholder; fetch from API or User model
    return dashboardData.keyMetrics.totalEmissions / employeeCount;
  }, [dashboardData]);

  // Calculate YoY change
  const yoyChange = useMemo(() => {
    return calculateChange(dashboardData?.overallEmissionsTrend);
  }, [dashboardData]);

  // Render loading spinner
  if (loading && !dashboardData) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          flexDirection: 'column',
          background: COLORS.backgroundGradient,
        }}
      >
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 500, color: COLORS.primary }}>
          Loading Dashboard
        </Typography>
        <CircularProgress size={60} thickness={4} sx={{ color: COLORS.primary }} />
      </Box>
    );
  }

  // Render error message
  if (error && !dashboardData) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          flexDirection: 'column',
          background: COLORS.backgroundGradient,
        }}
      >
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 500, color: '#f44336' }}>
          Error Loading Dashboard
        </Typography>
        <Typography variant="body1" sx={{ color: '#f44336', mb: 3 }}>
          {error}
        </Typography>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={fetchDashboardData}
          sx={{ bgcolor: COLORS.primary, '&:hover': { bgcolor: COLORS.accent1 } }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        background: COLORS.backgroundGradient,
        minHeight: '100vh',
        fontFamily: 'Poppins, sans-serif',
      }}
    >
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1 }}>
        <TopBar title="Sustainability Dashboard" showDropdown={false} />
        <Container maxWidth="xl" sx={{ mt: 3, pb: 8 }}>
          {/* Date Range & Filters Section */}
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <SectionTitle variant="h4" sx={{ mb: 1 }}>
                Sustainability Dashboard
              </SectionTitle>
              <Typography variant="body1" color={COLORS.textSecondary}>
                {format(dateRange.startDate, 'MMM d, yyyy')} - {format(dateRange.endDate, 'MMM d, yyyy')}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, position: 'relative' }}>
              <Button
                variant="outlined"
                startIcon={<DateRangeIcon />}
                endIcon={<ArrowDropDownIcon />}
                onClick={handleDatePickerToggle}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  color: COLORS.primary,
                  borderColor: COLORS.primary,
                  '&:hover': { borderColor: COLORS.accent1, backgroundColor: 'rgba(78, 205, 196, 0.04)' },
                }}
              >
                Date Range
              </Button>
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel id="period-select-label">Period</InputLabel>
                <Select
                  labelId="period-select-label"
                  id="period-select"
                  value={period}
                  label="Period"
                  onChange={handlePeriodChange}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="month">Monthly</MenuItem>
                  <MenuItem value="year">Yearly</MenuItem>
                </Select>
              </FormControl>
              <Tooltip title="Refresh Data">
                <IconButton onClick={fetchDashboardData} disabled={refreshing}>
                  <RefreshIcon sx={{ color: refreshing ? 'text.disabled' : COLORS.primary }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Info">
                <IconButton onClick={() => setOpenDialog('info')}>
                  <InfoIcon sx={{ color: COLORS.primary }} />
                </IconButton>
              </Tooltip>
              {showDatePicker && (
                <DateRangeContainer>
                  <DateRangePicker
                    ranges={[dateRange]}
                    onChange={handleDateRangeChange}
                    moveRangeOnFirstSelection={false}
                    months={isMobile ? 1 : 2}
                    direction="horizontal"
                    showDateDisplay={false}
                  />
                </DateRangeContainer>
              )}
            </Box>
          </Box>

          {/* Key Metrics Summary */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={4}>
                <StyledCard>
                  <GlowingLayer />
                  <CardHeader>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PublicIcon sx={{ color: COLORS.primary }} />
                      <Typography variant="h6" sx={{ color: COLORS.textPrimary, fontWeight: 500 }}>
                        Total Emissions
                      </Typography>
                    </Box>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        sx={{ color: COLORS.primary }}
                        onClick={() => navigate('/emissions')}
                      >
                        <NavigateNextIcon />
                      </IconButton>
                    </Tooltip>
                  </CardHeader>
                  <Box sx={{ p: 3 }}>
                    <Typography variant="h4" sx={{ color: COLORS.textPrimary, fontWeight: 700, mb: 1 }}>
                      <AnimatedNumber
                        value={dashboardData?.keyMetrics?.totalEmissions || 0}
                        suffix=" kg CO₂e"
                      />
                    </Typography>
                    <KPIIndicator trend={yoyChange > 0 ? 'negative' : yoyChange < 0 ? 'positive' : 'neutral'}>
                      YoY Change: {Math.abs(yoyChange).toFixed(1)}% {getTrendIcon(yoyChange)}
                    </KPIIndicator>
                  </Box>
                </StyledCard>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <StyledCard>
                  <GlowingLayer />
                  <CardHeader>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SpaIcon sx={{ color: COLORS.primary }} />
                      <Typography variant="h6" sx={{ color: COLORS.textPrimary, fontWeight: 500 }}>
                        Emissions Intensity
                      </Typography>
                    </Box>
                  </CardHeader>
                  <Box sx={{ p: 3 }}>
                    <Typography variant="h4" sx={{ color: COLORS.textPrimary, fontWeight: 700, mb: 1 }}>
                      <AnimatedNumber value={emissionsIntensity} suffix=" kg/employee" />
                    </Typography>
                    <Typography variant="body2" sx={{ color: COLORS.textSecondary, opacity: 0.8 }}>
                      Per employee emissions
                    </Typography>
                  </Box>
                </StyledCard>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <StyledCard>
                  <GlowingLayer />
                  <CardHeader>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <RecyclingIcon sx={{ color: COLORS.primary }} />
                      <Typography variant="h6" sx={{ color: COLORS.textPrimary, fontWeight: 500 }}>
                        Waste Diversion Rate
                      </Typography>
                    </Box>
                  </CardHeader>
                  <Box sx={{ p: 3 }}>
                    <Typography variant="h4" sx={{ color: COLORS.textPrimary, fontWeight: 700, mb: 1 }}>
                      <AnimatedNumber
                        value={dashboardData?.wasteManagementOverview?.diversionRate || 0}
                        suffix="%"
                        decimals={1}
                      />
                    </Typography>
                    <KPIIndicator
                      trend={
                        dashboardData?.wasteManagementOverview?.diversionRate > 50 ? 'positive' : 'negative'
                      }
                    >
                      {dashboardData?.wasteManagementOverview?.diversionRate > 50
                        ? 'Above Target'
                        : 'Below Target'}{' '}
                      {dashboardData?.wasteManagementOverview?.diversionRate > 50 ? (
                        <CheckCircleIcon sx={{ fontSize: '1rem', ml: 0.5 }} />
                      ) : (
                        <WarningIcon sx={{ fontSize: '1rem', ml: 0.5 }} />
                      )}
                    </KPIIndicator>
                  </Box>
                </StyledCard>
              </Grid>
            </Grid>
          </motion.div>

          {/* Emissions by Scope */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <SectionTitle variant="h5">Emissions by Scope</SectionTitle>
            <StyledCard>
              <CardHeader>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PieChartIcon sx={{ color: COLORS.primary }} />
                  <Typography variant="h6" sx={{ fontWeight: 500, color: COLORS.textPrimary }}>
                    Scope Breakdown
                  </Typography>
                </Box>
                <Box>
                  <Tooltip title="Expand">
                    <IconButton onClick={() => handleExpandCard('scope')}>
                      <FullscreenIcon sx={{ color: COLORS.primary }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardHeader>
              <Box sx={{ p: 3, height: expandedCard === 'scope' ? '600px' : '400px' }}>
                <Chart
                  options={emissionsByScopeConfig.options}
                  series={emissionsByScopeConfig.series}
                  type="donut"
                  height="100%"
                />
              </Box>
            </StyledCard>
          </motion.div>

          {/* Overall Emissions Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <SectionTitle variant="h5">Overall Emissions Trend</SectionTitle>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant={chartView === 'trend' ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => handleChartViewChange('trend')}
                  sx={{ textTransform: 'none', bgcolor: chartView === 'trend' ? COLORS.primary : 'transparent', color: chartView === 'trend' ? '#fff' : COLORS.primary }}
                >
                  Trend
                </Button>
                <Button
                  variant={chartView === 'comparison' ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => handleChartViewChange('comparison')}
                  sx={{ textTransform: 'none', bgcolor: chartView === 'comparison' ? COLORS.primary : 'transparent', color: chartView === 'comparison' ? '#fff' : COLORS.primary }}
                >
                  Comparison
                </Button>
              </Box>
            </Box>
            <StyledCard>
              <CardHeader>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ShowChartIcon sx={{ color: COLORS.primary }} />
                  <Typography variant="h6" sx={{ fontWeight: 500, color: COLORS.textPrimary }}>
                    Emissions Over Time
                  </Typography>
                </Box>
                <Box>
                  <Tooltip title="Expand">
                    <IconButton onClick={() => handleExpandCard('trend')}>
                      <FullscreenIcon sx={{ color: COLORS.primary }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardHeader>
              <Box sx={{ p: 3, height: expandedCard === 'trend' ? '600px' : '400px' }}>
                <Chart
                  options={overallEmissionsTrendConfig.options}
                  series={overallEmissionsTrendConfig.series}
                  type="line"
                  height="100%"
                />
              </Box>
            </StyledCard>
          </motion.div>

          {/* Insights Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <SectionTitle variant="h5">Insights</SectionTitle>
            <Tabs
              value={selectedTab}
              onChange={handleTabChange}
              sx={{
                mb: 2,
                '.MuiTab-root': { textTransform: 'none', fontSize: '1rem' },
                '.Mui-selected': { color: COLORS.primary },
                '.MuiTabs-indicator': { backgroundColor: COLORS.primary },
              }}
            >
              <Tab label="Emission Sources" icon={<BarChartIcon />} iconPosition="start" />
              <Tab label="Waste Management" icon={<RecyclingIcon />} iconPosition="start" />
            </Tabs>
            <StyledCard>
              <CardHeader>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <InsightsIcon sx={{ color: COLORS.primary }} />
                  <Typography variant="h6" sx={{ fontWeight: 500, color: COLORS.textPrimary }}>
                    {selectedTab === 0 ? 'Top Emission Sources' : 'Waste Management Overview'}
                  </Typography>
                </Box>
                <Box>
                  <Tooltip title="Expand">
                    <IconButton onClick={() => handleExpandCard('insights')}>
                      <FullscreenIcon sx={{ color: COLORS.primary }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardHeader>
              <Box sx={{ p: 3, height: expandedCard === 'insights' ? '600px' : '400px' }}>
                {selectedTab === 0 ? (
                  <Chart
                    options={topEmissionSourcesConfig.options}
                    series={topEmissionSourcesConfig.series}
                    type="bar"
                    height="100%"
                  />
                ) : (
                  <Box>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 500, color: COLORS.textPrimary }}>
                      Waste Composition
                    </Typography>
                    <Chart
                      options={wasteManagementConfig.options}
                      series={wasteManagementConfig.series}
                      type="donut"
                      height="300"
                    />
                  </Box>
                )}
              </Box>
            </StyledCard>
          </motion.div>

          {/* Info Dialog */}
          <Dialog open={openDialog === 'info'} onClose={() => setOpenDialog('')}>
            <DialogTitle>About Dashboard</DialogTitle>
            <DialogContent>
              <Typography variant="body1" color={COLORS.textPrimary}>
                This Sustainability Dashboard provides insights into your organization’s carbon footprint,
                emissions by scope, top emission sources, and waste management performance. Use the date
                range picker and period selector to analyze data over different timeframes.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => setOpenDialog('')}
                variant="contained"
                sx={{ bgcolor: COLORS.primary, '&:hover': { bgcolor: COLORS.accent1 } }}
              >
                Close
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      </Box>
    </Box>
  );
};

export default Dashboard;