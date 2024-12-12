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

const initialData = [
  { 
    id: 1, 
    sourceId: '200', 
    description: 'Example Steam Usage', 
    sourceArea: 1000, 
    fuelType: 'Natural Gas', 
    boilerEfficiency: 80, 
    steamPurchased: 500, 
    co2EmissionFactor: 0.5, 
    ch4EmissionFactor: 0.1, 
    n2oEmissionFactor: 0.05, 
    co2Emissions: 250, 
    ch4Emissions: 50, 
    n2oEmissions: 25 
  }
];

const SteamPage = () => {
  const [formValues, setFormValues] = useState({
    sourceId: '',
    description: '',
    sourceArea: '',
    fuelType: '',
    boilerEfficiency: '',
    steamPurchased: '',
    co2EmissionFactor: '',
    ch4EmissionFactor: '',
    n2oEmissionFactor: '',
    co2Emissions: '',
    ch4Emissions: '',
    n2oEmissions: ''
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
      sourceArea: '',
      fuelType: '',
      boilerEfficiency: '',
      steamPurchased: '',
      co2EmissionFactor: '',
      ch4EmissionFactor: '',
      n2oEmissionFactor: '',
      co2Emissions: '',
      ch4Emissions: '',
      n2oEmissions: ''
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
  ];  // Sidebar definition that matches the original

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        {/* Sidebar */}
        <Drawer variant="permanent" sx={{ width: 240, flexShrink: 0, ['& .MuiDrawer-paper']: { width: 240, boxSizing: 'border-box', backgroundColor: '#f4f4f4', }, }} >
          <Toolbar>
            <Typography variant="h6" sx={{ color: '#0D7377' }}>
              EcoDash
            </Typography>
          </Toolbar>
          <List>
            {/* Sidebar items */}
            {sidebarSections.map((section) => (
              <ListItem button key={section.section} selected={selectedSection === section.section} onClick={() => setSelectedSection(section.section)} >
                <ListItemIcon>{section.icon}</ListItemIcon>
                <ListItemText primary={section.label} />
              </ListItem>
            ))}
          </List>
        </Drawer>
        {/* Main Content */}
        <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: '#f9f9f9' }}>
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
              <IconButton color="inherit">
                <ProfileIcon />
              </IconButton>
              <Avatar sx={{ ml: 2, bgcolor: '#0D7377' }}>JD</Avatar>
            </Toolbar>
          </AppBar>
          <Typography variant="h2">
            Scope 2
          </Typography>
          <Container sx={{ mt: 10 }}>
            <Typography variant="h4" gutterBottom sx={{ flexGrow: 1, color: '#0D7377' }}>
              Steam
            </Typography>
            {/* Form for adding new records */}
            <Box sx={{ mb: 4 , gap: 2}}>
              <Typography variant="h6">Add New Record</Typography>
              <Box
                component="form" 
                sx={{
                  display: 'flex',
                   //flexDirection: 'column',
                   //flexDirection: 'row', // Change to row for horizontal layout
                  flexWrap: 'wrap',
                  gap: 2,
                  mt: 2,
                  height: 'auto',
                  width: 'auto', // Allow height to adjust automatically
                  overflow: 'auto', // Add scrollbars if content overflows
                }}              >
                <TextField 
                  label="Source ID"
                  name="sourceId"
                  value={formValues.sourceId}
                  onChange={handleInputChange}
                  variant="outlined"
                />
                <TextField 
                  label="Description"
                  name="description"
                  value={formValues.description}
                  onChange={handleInputChange}
                  variant="outlined"
                />
                <TextField 
                  label="Source Area (Kms)"
                  name="sourceArea"
                  type="number"
                  value={formValues.sourceArea}
                  onChange={handleInputChange}
                  variant="outlined"
                />
                <FormControl sx={{ minWidth: 150 }}>
                  <InputLabel id="fuel-type-label">Fuel Type</InputLabel>
                  <Select
                    labelId="fuel-type-label"
                    name="fuelType"
                    value={formValues.fuelType}
                    onChange={handleInputChange}
                    label="Fuel Type"
                  >
                    <MenuItem value="Natural Gas">Natural Gas</MenuItem>
                    <MenuItem value="Coal">Coal</MenuItem>
                    <MenuItem value="Oil">Oil</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="Boiler Efficiency (%)"
                  name="boilerEfficiency"
                  type="number"
                  value={formValues.boilerEfficiency}
                  onChange={handleInputChange}
                  variant="outlined"
                />
                <TextField 
                  label="Steam Purchased (KWH)"
                  name="steamPurchased"
                  type="number"
                  value={formValues.steamPurchased}
                  onChange={handleInputChange}
                  variant="outlined"
                />
                <TextField 
                  label="CO2 Emission factor (kg/KWH)"
                  name="co2EmissionFactor"
                  type="number"
                  value={formValues.co2EmissionFactor}
                  onChange={handleInputChange}
                  variant="outlined"
                />
                <TextField 
                  label="CH4 Emission factor (kg/KWH)"
                  name="ch4EmissionFactor"
                  type="number"
                  value={formValues.ch4EmissionFactor}
                  onChange={handleInputChange}
                  variant="outlined"
                />
                <TextField 
                  label="N2O Emission factor (kg/KWH)"
                  name="n2oEmissionFactor"
                  type="number"
                  value={formValues.n2oEmissionFactor}
                  onChange={handleInputChange}
                  variant="outlined"
                />
                <TextField 
                  label="CO2 emissions(Kg)"
                  name="co2Emissions"
                  type="number"
                  value={formValues.co2Emissions}
                  onChange={handleInputChange}
                  variant="outlined"
                />
                <TextField 
                  label="CH4 emissions(Kg)"
                  name="ch4Emissions"
                  type="number"
                  value={formValues.ch4Emissions}
                  onChange={handleInputChange}
                  variant="outlined"
                />
                <TextField 
                  label="N2O emissions(Kg)"
                  name="n2oEmissions"
                  type="number"
                  value={formValues.n2oEmissions}
                  onChange={handleInputChange}
                  variant="outlined"
                />
                <Button variant="contained" color="primary" onClick={handleAddRow}> Add </Button>
              </Box>
            </Box>
            {/* Table to display records */}
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Source ID</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Source Area (Kms)</TableCell>
                    <TableCell>Fuel Type</TableCell>
                    <TableCell>Boiler Efficiency (%)</TableCell>
                    <TableCell>Steam Purchased (KWH)</TableCell>
                    <TableCell>CO2 Emission factor (kg/KWH)</TableCell>
                    <TableCell>CH4 Emission factor (kg/KWH)</TableCell>
                    <TableCell>N2O Emission factor (kg/KWH)</TableCell>
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
                      <TableCell>{row.sourceArea}</TableCell>
                      <TableCell>{row.fuelType}</TableCell>
                      <TableCell>{row.boilerEfficiency}</TableCell>
                      <TableCell>{row.steamPurchased}</TableCell>
                      <TableCell>{row.co2EmissionFactor}</TableCell>
                      <TableCell>{row.ch4EmissionFactor}</TableCell>
                      <TableCell>{row.n2oEmissionFactor}</TableCell>
                      <TableCell>{row.co2Emissions}</TableCell>
                      <TableCell>{row.ch4Emissions}</TableCell>
                      <TableCell>{row.n2oEmissions}</TableCell>
                      <TableCell>
                        <Button variant="outlined" color="secondary" onClick={() => handleClickOpen(row.id)}> Delete </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Container>
        </Box>
        {/* Confirmation Dialog for deletions */}
        <Dialog open={openDialog} onClose={handleClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description" >
          <DialogTitle id="alert-dialog-title">{"Confirm Deletion"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Are you sure you want to delete this record?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary"> Cancel </Button>
            <Button onClick={handleDeleteRow} color="secondary" autoFocus> Confirm </Button>
          </DialogActions>
        </Dialog>
        {/* Dialogs and Snackbar for error messages */}
        <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleClose}>
          <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
            Please fill in all fields before adding a record.
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};

export default SteamPage;