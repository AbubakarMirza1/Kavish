import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
  Checkbox,
  //Link, 
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
  { id: 1, name: 'John Doe', active: true },
  { id: 2, name: 'Jane Smith', active: false },
];

const SingleColumnTablePage = () => {
  const [formValue, setFormValue] = useState('');
  const [rows, setRows] = useState(initialData);
  const [selectedSection, setSelectedSection] = useState('dashboard');

  const handleInputChange = (e) => {
    setFormValue(e.target.value);
  };

  const handleAddRow = () => {
    if (formValue.trim() === '') return;
    setRows((prev) => [
      ...prev,
      { id: prev.length + 1, name: formValue, active: false },
    ]);
    setFormValue(''); // Reset form
  };

  const handleDeleteRow = (id) => {
    setRows((prev) => prev.filter((row) => row.id !== id));
  };

  const handleToggleActive = (id) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, active: !row.active } : row
      )
    );
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

  const sidebarSections = [
    { label: 'Dashboard', icon: <DashboardIcon />, section: 'dashboard' },
    { label: 'GHG Emissions', icon: <EmissionsIcon />, section: 'emissions' },
    { label: 'Waste Management', icon: <WasteIcon />, section: 'waste' },
    { label: 'Data Entry', icon: <DataEntryIcon />, section: 'data-entry' },
    { label: 'Reports', icon: <ReportsIcon />, section: 'reports' },
    { label: 'Analytics', icon: <AnalyticsIcon />, section: 'analytics' },
    { label: 'Settings', icon: <SettingsIcon />, section: 'settings' },
    // Other sections can be added here
  ];

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
                selected={selectedSection === section.section}
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
            <Typography variant="h4" gutterBottom>
              Waste Records
            </Typography>

            {/* Form */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6">Add New Waste Item</Typography>
              <Box
                component="form"
                sx={{
                  display: 'flex',
                  gap: 2,
                  mt: 2,
                }}
              >
                <TextField
                  label="Item Name"
                  value={formValue}
                  onChange={handleInputChange}
                  variant="outlined"
                />
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
                    <TableCell>Item Name</TableCell>
                    <TableCell>Active</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>
                        <Checkbox
                          checked={row.active}
                          onChange={() => handleToggleActive(row.id)}
                        />
                      </TableCell>
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
            <Box sx={{position: 'fixed', // Fixes the position on the screen    
                    bottom: 20,        // Distance from the bottom of the screen
                    left: 250,          // Distance from the left side of the screen
                    mt: 10,
                    zIndex:1000,   
                    backgroundColor: 'lightblue',
                    padding: '8px',
                    border: '2px solid blue',          // Removes the top margin (optional)
                    }}>
                    <Link to="/dashboard2" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: '#0D7377' }}>
                    <span style={{ marginRight: '8px' }}>←</span> {/* Back arrow */}
                    Go back to the main page
                    </Link>
            </Box>
    </ThemeProvider>
  );
};

export default SingleColumnTablePage;