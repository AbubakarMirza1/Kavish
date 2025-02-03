import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  IconButton,
  Avatar,
  Container,
  Grid,
  Paper,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  QueryStats as EmissionsIcon,
  Delete as WasteIcon,
  CloudUpload as DataEntryIcon,
  Assessment as ReportsIcon,
  Analytics as AnalyticsIcon,
  Notifications as NotificationIcon,
  HelpOutline as HelpIcon,
} from "@mui/icons-material";
import axios from "axios";
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
} from "recharts";

const COLORS = ["#0D7377", "#14FFEC", "#8884d8", "#82ca9d", "#ffc658"];

const formatValue = (value) => (typeof value === "number" ? `${value.toFixed(2)} kg CO₂e` : value);
const formatTick = (value) => (typeof value === "number" ? Number(value.toFixed(2)) : value);

const GHGEmissions = ({ scopeType, apiEndpoint }) => {
  const [selectedSection, setSelectedSection] = useState(scopeType);
  const navigate = useNavigate();
  const [kpiData, setKpiData] = useState(null);

  const sidebarSections = [
    { label: "Dashboard", icon: <DashboardIcon />, section: "dashboard" },
    { label: "Scope 1 Emissions", icon: <EmissionsIcon />, section: "scope1" },
    { label: "Scope 2 Emissions", icon: <EmissionsIcon />, section: "scope2" },
    { label: "Scope 3 Emissions", icon: <EmissionsIcon />, section: "scope3" },
    { label: "Waste Management", icon: <WasteIcon />, section: "waste" },
    { label: "Data Entry", icon: <DataEntryIcon />, section: "data-entry" },
    { label: "Reports", icon: <ReportsIcon />, section: "reports" },
    { label: "Analytics", icon: <AnalyticsIcon />, section: "analytics" },
  ];

  const handleSidebarClick = (section) => {
    setSelectedSection(section);
    navigate(`/${section}`);
  };

  useEffect(() => {
    fetchKpis();
  }, []);

  const fetchKpis = async () => {
    try {
      const res = await axios.get(apiEndpoint);
      setKpiData(res.data);
    } catch (error) {
      console.error(`Error fetching ${scopeType} KPIs:`, error);
    }
  };

  if (!kpiData) return <div>Loading KPIs...</div>;

  const { emissionsOverTime, categoryBreakdown, fuelBreakdown } = kpiData;

  return (
    <Box sx={{ display: "flex" }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: 240,
          flexShrink: 0,
          "& .MuiDrawer-paper": { width: 240, boxSizing: "border-box", backgroundColor: "#f4f4f4" },
        }}
      >
        <Toolbar>
          <Typography variant="h6" sx={{ fontWeight: "bold", color: "#0D7377" }}>EcoDash</Typography>
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
      <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: "#f9f9f9" }}>
        <AppBar position="static" color="transparent" elevation={0}>
          <Toolbar>
            <Typography variant="h5" sx={{ flexGrow: 1, color: "#0D7377", fontWeight: "bold" }}>
              {scopeType} Emissions Dashboard
            </Typography>
            <IconButton><NotificationIcon /></IconButton>
            <IconButton><HelpIcon /></IconButton>
            <Avatar sx={{ ml: 2, bgcolor: "#0D7377" }}>JD</Avatar>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ mt: 4 }}>
          <Typography variant="h4" sx={{ mb: 4, color: "#0D7377", fontWeight: "bold" }}>
            Key Performance Indicators
          </Typography>
          <Grid container spacing={4}>
            {/* Emissions Over Time (Line Chart) */}
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: 3, height: "400px" }}>
                <Typography variant="h6" sx={{ mb: 2, color: "#0D7377" }}>
                  Total {scopeType} Emissions Over Time (kg CO₂e)
                </Typography>
                <ResponsiveContainer width="100%" height="80%">
                  <LineChart data={emissionsOverTime} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis tickFormatter={formatTick} />
                    <Tooltip formatter={(value) => formatValue(value)} />
                    <Legend />
                    <Line type="monotone" dataKey="co2e" stroke="#0D7377" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Emissions Breakdown by Category (Pie Chart) */}
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3, height: "400px" }}>
                <Typography variant="h6" sx={{ mb: 2, color: "#0D7377" }}>
                  Emissions Breakdown by Category (kg CO₂e)
                </Typography>
                <ResponsiveContainer width="100%" height="80%">
                  <PieChart>
                    <Pie data={categoryBreakdown} dataKey="value" nameKey="name" cx="50%" cy="45%" outerRadius={100}>
                      {categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatValue(value)} />
                    <Legend layout="horizontal" align="center" verticalAlign="bottom" />
                  </PieChart>
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
