import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  Typography,
  FormControl,
  Select,
  MenuItem,
  IconButton,
  Avatar,
  Container,
  Grid,
  Paper,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  QueryStats as EmissionsIcon,
  Delete as WasteIcon,
  CloudUpload as DataEntryIcon,
  Assessment as ReportsIcon,
  Analytics as AnalyticsIcon,
  Notifications as NotificationIcon,
  HelpOutline as HelpIcon,
} from '@mui/icons-material';
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
  AreaChart,
  Area,
  PieChart,
  Pie,
} from 'recharts';

// Mock Data for GHG Emissions Graphs
const totalEmissionsData = [
  { year: '2018', emissions: 1000 },
  { year: '2019', emissions: 950 },
  { year: '2020', emissions: 900 },
  { year: '2021', emissions: 850 },
  { year: '2022', emissions: 800 },
];

const emissionsBySourceData = [
  { name: 'Landfill', emissions: 300 },
  { name: 'Waste-to-Energy', emissions: 400 },
  { name: 'Recycling', emissions: 200 },
  { name: 'Composting', emissions: 100 },
];

const emissionsByGasData = [
  { name: 'CO2', value: 65 },
  { name: 'CH4', value: 25 },
  { name: 'N2O', value: 10 },
];

const carbonFootprintData = [
  { activity: 'Collection', footprint: 300 },
  { activity: 'Transportation', footprint: 400 },
  { activity: 'Processing', footprint: 500 },
];

const emissionsReductionData = [
  { year: '2018', reduction: 50 },
  { year: '2019', reduction: 100 },
  { year: '2020', reduction: 150 },
  { year: '2021', reduction: 200 },
  { year: '2022', reduction: 250 },
];

const comparativeEmissionsData = [
  { facility: 'Facility A', emissions: 500 },
  { facility: 'Facility B', emissions: 400 },
  { facility: 'Facility C', emissions: 300 },
];

const GHGEmissions = () => {
  const [selectedSection, setSelectedSection] = useState('emissions');
  const navigate = useNavigate();

  const sidebarSections = [
    { label: 'Dashboard', icon: <DashboardIcon />, section: 'dashboard' },
    { label: 'GHG Emissions', icon: <EmissionsIcon />, section: 'emissions' },
    { label: 'Waste Management', icon: <WasteIcon />, section: 'waste' },
    { label: 'Data Entry', icon: <DataEntryIcon />, section: 'data-entry' },
    { label: 'Reports', icon: <ReportsIcon />, section: 'reports' },
    { label: 'Analytics', icon: <AnalyticsIcon />, section: 'analytics' },
  ];

  const handleSidebarClick = (section) => {
    setSelectedSection(section);
    if (section === 'dashboard') navigate('/dashboard');
    if (section === 'emissions') navigate('/GHGEmissions');
    if (section === 'waste') navigate('/WasteManagement');
    if (section === 'data-entry') navigate('/Scope1SC');
    if (section === 'reports') navigate('/Reports');
    if (section === 'analytics') navigate('/analytics');
  };

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: 240,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: 240,
            boxSizing: 'border-box',
            backgroundColor: '#f4f4f4',
          },
        }}
      >
        <Toolbar>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0D7377' }}>
            EcoTrack
          </Typography>
        </Toolbar>
        <List>
          {sidebarSections.map((section) => (
            <ListItem
              button
              key={section.section}
              selected={selectedSection === section.section}
              onClick={() => handleSidebarClick(section.section)} 
            >
              <ListItemIcon>{section.icon}</ListItemIcon>
              <ListItemText primary={section.label} />
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: '#f9f9f9' }}>
        <AppBar position="static" color="transparent" elevation={0}>
          <Toolbar>
            <Typography variant="h5" sx={{ flexGrow: 1, color: '#0D7377' }}>
              GHG Emissions Dashboard
            </Typography>
            <IconButton>
              <NotificationIcon />
            </IconButton>
            <IconButton>
              <HelpIcon />
            </IconButton>
            <Avatar sx={{ ml: 2, bgcolor: '#0D7377' }}>JD</Avatar>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ mt: 4 }}>
          <Grid container spacing={3}>
            {/* Total GHG Emissions Over Time */}
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3, height: '400px' }}>
                <Typography variant="h6" sx={{ mb: 2, color: '#0D7377' }}>
                  Total GHG Emissions Over Time
                </Typography>
                <ResponsiveContainer width="100%" height="80%">
                  <LineChart data={totalEmissionsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="emissions" stroke="#0D7377" />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* GHG Emissions by Source */}
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3, height: '400px' }}>
                <Typography variant="h6" sx={{ mb: 2, color: '#0D7377' }}>
                  GHG Emissions by Source
                </Typography>
                <ResponsiveContainer width="100%" height="80%">
                  <BarChart data={emissionsBySourceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="emissions" stackId="a" fill="#0D7377" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* GHG Emissions by Type of Gas */}
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3, height: '400px' }}>
                <Typography variant="h6" sx={{ mb: 2, color: '#0D7377' }}>
                  GHG Emissions by Type of Gas
                </Typography>
                <ResponsiveContainer width="100%" height="80%">
                  <PieChart>
                    <Pie
                      data={emissionsByGasData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      fill="#8884d8"
                      label
                    />
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Carbon Footprint of Waste Management Activities */}
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3, height: '400px' }}>
                <Typography variant="h6" sx={{ mb: 2, color: '#0D7377' }}>
                  Carbon Footprint of Waste Management Activities
                </Typography>
                <ResponsiveContainer width="100%" height="80%">
                  <AreaChart data={carbonFootprintData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="activity" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="footprint" stroke="#0D7377" fill="#0D737750" />
                  </AreaChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* GHG Emissions Reduction Over Time */}
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3, height: '400px' }}>
                <Typography variant="h6" sx={{ mb: 2, color: '#0D7377' }}>
                  GHG Emissions Reduction Over Time
                </Typography>
                <ResponsiveContainer width="100%" height="80%">
                  <LineChart data={emissionsReductionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="reduction" stroke="#14FFEC" />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Comparative Analysis of GHG Emissions */}
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3, height: '400px' }}>
                <Typography variant="h6" sx={{ mb: 2, color: '#0D7377' }}>
                  Comparative Analysis of GHG Emissions
                </Typography>
                <ResponsiveContainer width="100%" height="80%">
                  <BarChart data={comparativeEmissionsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="facility" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="emissions" fill="#14FFEC" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default GHGEmissions;
