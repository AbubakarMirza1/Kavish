import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Container,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CssBaseline,
  IconButton,
  Avatar,
  createTheme,
  ThemeProvider,
  InputLabel,
  FormControl,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  QueryStats as EmissionsIcon,
  Delete as WasteIcon,
  CloudUpload as DataEntryIcon,
  Assessment as ReportsIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  HelpOutline as HelpIcon,
  Notifications as NotificationsIcon,
  AccountCircle as ProfileIcon,
} from '@mui/icons-material';

const initialData = [
  { id: 1, sourceId: '001', description: 'Source A', date: '2023-01-01', fuel: 'Gasoline', quantity: 100, unit: 'Liters' },
  { id: 2, sourceId: '002', description: 'Source B', date: '2023-01-02', fuel: 'Diesel', quantity: 200, unit: 'Liters' },
];

const DashboardPage = () => {
  const [formValues, setFormValues] = useState({ sourceId: '', description: '', date: '', fuel: '', quantity: '', unit: '' });
  const [rows, setRows] = useState(initialData);
  const [selectedSection, setSelectedSection] = useState('dashboard');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddRow = () => {
    setRows((prev) => [...prev, { id: prev.length + 1, ...formValues }]);
    setFormValues({ sourceId: '', description: '', date: '', fuel: '', quantity: '', unit: '' }); // Reset form
  };

  const theme = createTheme({
    palette: {
      primary: {
        main: '#0D7377',
      },
      secondary: {
        main: '#14FFEC',
      },
    },
    typography: {
      h6: {
        fontWeight: 'bold',
      },
    },
  });

  const fuelOptions = ['Gasoline', 'Diesel', 'Electric', 'Biofuel'];
  const unitOptions = ['Liters', 'Gallons', 'Kilograms', 'Pounds'];

  const sidebarSections = [
    { label: 'Dashboard', icon: <DashboardIcon />, section: 'dashboard' },
    { label: 'GHG Emissions', icon: <EmissionsIcon />, section: 'emissions' },
    { label: 'Waste Management', icon: <WasteIcon />, section: 'waste' },
    { label: 'Data Entry', icon: <DataEntryIcon />, section: 'data-entry' },
    { label: 'Reports', icon: <ReportsIcon />, section: 'reports' },
    { label: 'Analytics', icon: <AnalyticsIcon />, section: 'analytics' },
    { label: 'Settings', icon: <SettingsIcon />, section: 'settings' },
  ];
  const handleDeleteRow = (id) => {
    setRows((prev) => prev.filter((row) => row.id !== id));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
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
            <Typography variant="h6" sx={{ color: '#0D7377' }}>
              EcoDash
            </Typography>
          </Toolbar>
          <List>
            {sidebarSections.map((section) => (
              <ListItem
                button
                key={section.section}
                selected={ selectedSection === section.section}
                onClick={() => setSelectedSection(section.section)}
              >
                <ListItemIcon>{section.icon}</ListItemIcon>
                <ListItemText primary={section.label} />
              </ListItem>
            ))}
          </List>
        </Drawer>

        {/* Main Content */}
        <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: '#f9f9f9' }}>
          {/* Top Bar */}
          <AppBar position="fixed" color="transparent" elevation={0} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Toolbar>
              <Typography variant="h6" sx={{ flexGrow: 1, color: '#0D7377' }}>
                
              </Typography>
              <IconButton color="inherit">
                <NotificationsIcon />
              </IconButton>
              <IconButton color="inherit">
                <HelpIcon />
              </IconButton>
              <Avatar sx={{ ml: 2, bgcolor: '#0D7377' }}>JD</Avatar>
            </Toolbar>
          </AppBar>

          {/* Page Content */}
          <Container sx={{ mt: 10 }}>
            <Typography variant="h1" gutterBottom>
              Scope 1
            </Typography>
            <Typography variant="h3" gutterBottom> {/* Change this line */}
                Stationary Combustion
            </Typography>

            {/* Form */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6">Add New Record</Typography>
              <Box
                component="form"
                sx={{
                  display: 'flex',
                  gap: 2,
                  mt: 2,
                }}
              >
                <TextField
                  label="Source ID"
                  name="sourceId"
                  value={formValues.sourceId}
                  onChange={handleInputChange}
                  variant="outlined"
                />
                <TextField
                  label="Source Description"
                  name="description"
                  value={formValues.description}
                  onChange={handleInputChange}
                  variant="outlined"
                />
                <TextField
                  label="Date"
                  name="date"
                  type="date"
                  value={formValues.date}
                  onChange={handleInputChange}
                  variant="outlined"
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                  <InputLabel>Fuel Combusted</InputLabel>
                  <Select
                    name="fuel"
                    value={formValues.fuel}
                    onChange={handleInputChange}
                    label="Fuel Combusted"
                  >
                    {fuelOptions.map((fuel) => (
                      <MenuItem key={fuel} value={fuel}>
                        {fuel}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label="Quantity"
                  name="quantity"
                  type="number"
                  value={formValues.quantity}
                  onChange={handleInputChange}
                  variant="outlined"
                />
                <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                  <InputLabel>Units</InputLabel>
                  <Select
                    name="unit"
                    value={formValues.unit}
                    onChange={handleInputChange}
                    label="Units"
                  >
                    {unitOptions.map((unit) => (
                      <MenuItem key={unit} value={unit}>
                        {unit}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button variant="contained" color="primary" onClick={handleAddRow}>
                  Add
                </Button>
              </Box>
            </Box>

            {/* Table */}
            <Typography variant="h6">Records</Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Source ID</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Fuel Combusted</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Units</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.id}</TableCell>
                      <TableCell>{row.sourceId}</TableCell>
                      <TableCell>{row.description}</TableCell>
                      <TableCell>{row.date}</TableCell>
                      <TableCell>{row.fuel}</TableCell>
                      <TableCell>{row.quantity}</TableCell>
                      <TableCell>{row.unit}</TableCell>
                      <TableCell>
                        <Button variant="outlined" color="secondary" onClick={() => handleDeleteRow(row.id)}>
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
 
  );
};

export default DashboardPage;
