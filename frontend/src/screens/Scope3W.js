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
import { useNavigate } from 'react-router-dom';

const initialData = [
  { 
    id: 1, 
    sourceId: '200', 
    description: 'Example Waste Material', 
    wasteMaterial: 'Plastic', 
    disposalMethod: 'Landfill', 
    weight: 100, 
    unit: 'Kg', 
    co2eEmissions: 250 
  }
];

const WastePage = () => {
  const navigate = useNavigate();

  const [formValues, setFormValues] = useState({
    sourceId: '',
    description: '',
    wasteMaterial: '',
    disposalMethod: '',
    weight: '',
    unit: '',
    co2eEmissions: ''
  });

  const [rows, setRows] = useState(initialData);
  const [selectedSection, setSelectedSection] = useState('waste');
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
      wasteMaterial: '',
      disposalMethod: '',
      weight: '',
      unit: '',
      co2eEmissions: ''
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
    { label: 'Dashboard', icon: <DashboardIcon />, section: 'dashboard', path: '/dashboard' },
    { label: 'GHG Emissions', icon: <EmissionsIcon />, section: 'emissions' },
    { label: 'Waste Management', icon: <WasteIcon />, section: 'waste', path: '/WasteManagement' },
    { label: 'Data Entry', icon: <DataEntryIcon />, section: 'data-entry', path: '/Scope1SC' },
    { label: 'Reports', icon: <ReportsIcon />, section: 'reports', path: '/Reports' },
    { label: 'Analytics', icon: <AnalyticsIcon />, section: 'analytics', path: '/analytics' },
    // { label: 'Settings', icon: <SettingsIcon />, section: 'settings' },
  ];

  const handleSidebarClick = (path, section) => {
    if (section === 'dashboard') navigate('/dashboard');
    if (section === 'emissions') navigate('/GHGEmissions');
    if (section === 'waste') navigate('/WasteManagement');
    if (section === 'data-entry') navigate('/Scope1SC');
    if (section === 'reports') navigate('/Reports');
    if (section === 'analytics') navigate('/analytics');
    if (path) navigate(path); // Fall back to path if provided
  };

  const unitOptions = ['Kg', 'Ton', 'Lb'];
  const wasteMaterialOptions = ['Plastic', 'Paper', 'Metal', 'Organic'];

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
              <ListItem 
                button 
                key={section.section} 
                selected={selectedSection === section.section} 
                onClick={() => handleSidebarClick(section.path, section.section)}
              >
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
              Waste Management
            </Typography>

            {/* Form */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ flexGrow: 1, color: '#0D7377' }}>Add New Record</Typography>
              <Box component="form" sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
                {/* Form fields */}
                <TextField label="Source ID" name="sourceId" value={formValues.sourceId} onChange={handleInputChange} variant="outlined" />
                <TextField label="Description" name="description" value={formValues.description} onChange={handleInputChange} variant="outlined" />
                <FormControl sx={{ minWidth: 150 }}>
                  <InputLabel id="waste-material-label">Waste Material</InputLabel>
                  <Select labelId="waste-material-label" name="wasteMaterial" value={formValues.wasteMaterial} onChange={handleInputChange} label="Waste Material">
                    {wasteMaterialOptions.map((material) => (
                      <MenuItem key={material} value={material}>
                        {material}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField label="Disposal Method" name="disposalMethod" value={formValues.disposalMethod} onChange={handleInputChange} variant="outlined" />
                <TextField label="Weight" name="weight" type="number" value={formValues.weight} onChange={handleInputChange} variant="outlined" />
                <FormControl sx={{ minWidth: 150 }}>
                  <InputLabel id="unit-label">Unit</InputLabel>
                  <Select labelId="unit-label" name="unit" value={formValues.unit} onChange={handleInputChange} label="Unit">
                    {unitOptions.map((unit) => (
                      <MenuItem key={unit} value={unit}>
                        {unit}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField label="CO2e Emissions (Kg)" name="co2eEmissions" type="number" value={formValues.co2eEmissions} onChange={handleInputChange} variant="outlined" />
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
                    <TableCell>Waste Material</TableCell>
                    <TableCell>Disposal Method</TableCell>
                    <TableCell>Weight</TableCell>
                    <TableCell>Unit</TableCell>
                    <TableCell>CO2e Emissions (Kg)</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.id}</TableCell>
                      <TableCell>{row.sourceId}</TableCell>
                      <TableCell>{row.description}</TableCell>
                      <TableCell>{row.wasteMaterial}</TableCell>
                      <TableCell>{row.disposalMethod}</TableCell>
                      <TableCell>{row.weight}</TableCell>
                      <TableCell>{row.unit}</TableCell>
                      <TableCell>{row.co2eEmissions}</TableCell>
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
                onClick={() => navigate('/Scope3BT')}
              >
                Back to Travel
              </Button>
              <Button 
              variant="contained" 
              color="secondary"
              onClick={() => navigate('/dashboard')}>
                View Dashboard
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

export default WastePage;
