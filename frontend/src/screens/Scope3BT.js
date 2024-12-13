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
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle, 
  Snackbar, 
  Alert 
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
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const initialData = [
  { 
    id: 1, 
    sourceId: '200', 
    description: 'Business Travel A', 
    VehicleType: 'Car', 
    VehicleKilometers: 1000, 
    co2Emissions: 500, 
    ch4Emissions: 10, 
    n2oEmissions: 5,
  },
];

const BusinessTravelPage = () => {
  const navigate = useNavigate(); // Initialize navigate

  const [formValues, setFormValues] = useState({
    sourceId: '',
    description: '',
    VehicleType: '',
    VehicleKilometers: '',
    co2Emissions: '',
    ch4Emissions: '',
    n2oEmissions: '',
  });

  const [rows, setRows] = useState(initialData);
  const [selectedSection, setSelectedSection] = useState('dashboard');
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  const handleAddRow = () => {
    if (Object.values(formValues).some(value => value === '')) {
      setOpenSnackbar(true);
      return;
    }
    setRows(prev => [...prev, { id: prev.length + 1, ...formValues }]);
    setFormValues({
      sourceId: '',
      description: '',
      VehicleType: '',
      VehicleKilometers: '',
      co2Emissions: '',
      ch4Emissions: '',
      n2oEmissions: '',
    });
  };

  const handleClickOpen = (id) => {
    setOpenDialog(true);
    setDeleteId(id);
  };

  const handleClose = () => {
    setOpenDialog(false);
    setOpenSnackbar(false);
  };

  const handleDeleteRow = () => {
    setRows(prev => prev.filter(row => row.id !== deleteId));
    setOpenDialog(false);
  };

  const handleSectionNavigation = (section) => {
    setSelectedSection(section);
    const routes = {
      dashboard: '/dashboard',
      emissions: '/GHGEmissions',
      waste: '/WasteManagement',
      'data-entry': '/Scope1SC',
      reports: '/Reports',
      analytics: '/analytics',
      settings: '/Settings',
    };
    if (routes[section]) navigate(routes[section]);
  };

  const theme = createTheme({
    palette: {
      primary: { main: '#0D7377' },
      secondary: { main: '#14FFEC' },
    },
    typography: { h6: { fontWeight: 'bold' } },
  });

  const sidebarSections = [
    { label: 'Dashboard', icon: <DashboardIcon />, section: 'dashboard' },
    { label: 'GHG Emissions', icon: <EmissionsIcon />, section: 'emissions' },
    { label: 'Waste Management', icon: <WasteIcon />, section: 'waste' },
    { label: 'Data Entry', icon: <DataEntryIcon />, section: 'data-entry' },
    { label: 'Reports', icon: <ReportsIcon />, section: 'reports' },
    { label: 'Analytics', icon: <AnalyticsIcon />, section: 'analytics' },
    // { label: 'Settings', icon: <SettingsIcon />, section: 'settings' },
  ];

  const vehicleTypeOptions = ['Car', 'Truck', 'Bus', 'Motorcycle'];

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
            ['& .MuiDrawer-paper']: {
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
            {sidebarSections.map(({ label, icon, section }) => (
              <ListItem
                button
                key={section}
                selected={selectedSection === section}
                onClick={() => handleSectionNavigation(section)}
              >
                <ListItemIcon>{icon}</ListItemIcon>
                <ListItemText primary={label} />
              </ListItem>
            ))}
          </List>
        </Drawer>

        {/* Main Content */}
        <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: '#f9f9f9' }}>
          <AppBar position="fixed" color="transparent" elevation={0} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Toolbar>
              <Typography variant="h6" sx={{ flexGrow: 1, color: '#0D7377' }}></Typography>
              <IconButton color="inherit">
                <NotificationsIcon />
              </IconButton>
              <IconButton color="inherit">
                <HelpIcon />
              </IconButton>
              <IconButton color="inherit">
                <ProfileIcon />
              </IconButton>
              <Avatar sx={{ ml: 2, bgcolor: '#0D7377' }}>AB</Avatar>
            </Toolbar>
          </AppBar>

          <Typography variant="h2" sx={{ flexGrow: 1, color: '#0D7377' }}>Scope 3</Typography>

          <Container sx={{ mt: 10 }}>
            <Typography variant="h4" gutterBottom sx={{ flexGrow: 1, color: '#0D7377' }}>
              Business Travel & Employee Commute & Upstream Transportation and Distribution
            </Typography>

            {/* Form */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ flexGrow: 1, color: '#0D7377' }}>Add New Record</Typography>
              <Box component="form" sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
                <TextField label="Source ID" name="sourceId" value={formValues.sourceId} onChange={handleInputChange} variant="outlined" />
                <TextField label="Description" name="description" value={formValues.description} onChange={handleInputChange} variant="outlined" />
                <FormControl sx={{ minWidth: 150 }}>
                  <InputLabel id="Vehicle-type-label">Vehicle Type</InputLabel>
                  <Select labelId="Vehicle-type-label" name="VehicleType" value={formValues.VehicleType} onChange={handleInputChange} label="Vehicle Type">
                    {vehicleTypeOptions.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField label="Vehicle Kilometers" name="VehicleKilometers" type="number" value={formValues.VehicleKilometers} onChange={handleInputChange} variant="outlined" />
                <TextField label="CO2 emissions(Kg)" name="co2Emissions" type="number" value={formValues.co2Emissions} onChange={handleInputChange} variant="outlined" />
                <TextField label="CH4 emissions(Kg)" name="ch4Emissions" type="number" value={formValues.ch4Emissions} onChange={handleInputChange} variant="outlined" />
                <TextField label="N2O emissions(Kg)" name="n2oEmissions" type="number" value={formValues.n2oEmissions} onChange={handleInputChange} variant="outlined" />
                <Button variant="contained" color="primary" onClick={handleAddRow}>
                  Add
                </Button>
              </Box>
            </Box>

            {/* Table */}
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Source ID</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Vehicle Type</TableCell>
                    <TableCell>Vehicle Kilometers</TableCell>
                    <TableCell>CO2 emissions(Kg)</TableCell>
                    <TableCell>CH4 emissions(Kg)</TableCell>
                    <TableCell>N2O emissions(Kg)</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.id}</TableCell>
                      <TableCell>{row.sourceId}</TableCell>
                      <TableCell>{row.description}</TableCell>
                      <TableCell>{row.VehicleType}</TableCell>
                      <TableCell>{row.VehicleKilometers}</TableCell>
                      <TableCell>{row.co2Emissions}</TableCell>
                      <TableCell>{row.ch4Emissions}</TableCell>
                      <TableCell>{row.n2oEmissions}</TableCell>
                      <TableCell>
                        <Button variant="outlined" color="secondary" onClick={() => handleClickOpen(row.id)}>
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Navigation Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/Scope2S')}
              >
                Back to Scope 2
              </Button>
              <Button variant="contained" 
              color="secondary"
              onClick={() => navigate('/Scope3W')}>
                Proceed to Waste
              </Button>
            </Box>
          </Container>
        </Box>

        {/* Confirmation Dialog */}
        <Dialog open={openDialog} onClose={handleClose}>
          <DialogTitle>{"Confirm Deletion"}</DialogTitle>
          <DialogContent>
            <DialogContentText>Are you sure you want to delete this record?</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Cancel
            </Button>
            <Button onClick={handleDeleteRow} color="secondary" autoFocus>
              Confirm
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleClose}>
          <Alert onClose={handleClose} severity="error">
            Please fill in all fields before adding a record.
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};

export default BusinessTravelPage;
