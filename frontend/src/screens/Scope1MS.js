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
  Alert,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  QueryStats as EmissionsIcon,
  Delete as WasteIcon,
  CloudUpload as DataEntryIcon,
  Assessment as ReportsIcon,
  Analytics as AnalyticsIcon,
  Notifications as NotificationsIcon,
  HelpOutline as HelpIcon,
  AccountCircle as ProfileIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import useScope1Store from '../store/scope1Store'; // Import the Zustand store
import Sidebar from '../Component/sidebar.js'; // Import the Sidebar component

const initialData = [
  { id: 1, sourceId: '001', description: 'Vehicle A', vehicleType: 'Light-Duty Trucks - Gasoline', fuelUsage: 'Petrol', unit: 'KG', milesTravelled: 150 },
  { id: 2, sourceId: '002', description: 'Vehicle B', vehicleType: 'Heavy-Duty Vehicles - Gasoline', fuelUsage: 'Diesel', unit: 'KG', milesTravelled: 300 },
];

const MobileSourcePage = () => {
  const navigate = useNavigate();

  const [formValues, setFormValues] = useState({ 
    sourceId: '', 
    description: '', 
    vehicleType: '', 
    fuelUsage: '', 
    unit: '', 
    milesTravelled: '' 
  });
  
  const [rows, setRows] = useState(initialData);
  const [selectedSection, setSelectedSection] = useState('dashboard');
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // Get data from the store
  const mobileRows = useScope1Store((state) => state.mobileRows);
  const stationaryCombustionRows = useScope1Store((state) => state.stationaryCombustionRows);
  const unitRows = useScope1Store((state) => state.unitRows);

  // Filter active items
  const activeVehicles = mobileRows.filter((row) => row.active); // For vehicle types
  const activeFuels = stationaryCombustionRows.filter((row) => row.active); // For fuel usage
  const activeUnits = unitRows.filter((row) => row.active); // For units

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddRow = () => {
    if (Object.values(formValues).some((value) => value === '')) {
      setOpenSnackbar(true);
      return;
    }
    setRows((prev) => [...prev, { id: prev.length + 1, ...formValues }]);
    setFormValues({ sourceId: '', description: '', vehicleType: '', fuelUsage: '', unit: '', milesTravelled: '' });
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
    setRows((prev) => prev.filter((row) => row.id !== deleteId));
    setOpenDialog(false);
  };

  
  return (
      <Box sx={{ display: 'flex' }}>
        <Sidebar/>
        

      {/* Main Content */}
        
        <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: '#f9f9f9', marginLeft: '240px' }}>
          {/* Top Bar */}
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
              <Avatar sx={{ ml: 2, bgcolor: '#0D7377' }}>JD</Avatar>
            </Toolbar>
          </AppBar>

          <Typography variant="h2" gutterBottom sx={{ mt: 8 }}>
            Scope 1
          </Typography>

          <Container sx={{ mt: 10 }}>
            <Typography variant="h4" gutterBottom>
              Mobile Sources
            </Typography>

            {/* Form */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6">Add New Vehicle Record</Typography>
              <Box component="form" sx={{ display: 'flex', gap: 2, mt: 2 }}>
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
                <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                  <InputLabel>Vehicle Type</InputLabel>
                  <Select name="vehicleType" value={formValues.vehicleType} onChange={handleInputChange} label="Vehicle Type">
                    {activeVehicles.map((vehicle) => (
                      <MenuItem key={vehicle.id} value={vehicle.name}>
                        {vehicle.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                  <InputLabel>Fuel Usage</InputLabel>
                  <Select name="fuelUsage" value={formValues.fuelUsage} onChange={handleInputChange} label="Fuel Usage">
                    {activeFuels.map((fuel) => (
                      <MenuItem key={fuel.id} value={fuel.name}>
                        {fuel.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label="Miles Travelled"
                  name="milesTravelled"
                  type="number"
                  value={formValues.milesTravelled}
                  onChange={handleInputChange}
                  variant="outlined"
                />
                <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                  <InputLabel>Units</InputLabel>
                  <Select name="unit" value={formValues.unit} onChange={handleInputChange} label="Units">
                    {activeUnits.map((unit) => (
                      <MenuItem key={unit.id} value={unit.name}>
                        {unit.name}
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
            <Typography variant="h6">Vehicle Records</Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Source ID</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Vehicle Type</TableCell>
                    <TableCell>Fuel Usage</TableCell>
                    <TableCell>Miles Travelled</TableCell>
                    <TableCell>Units</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.id}</TableCell>
                      <TableCell>{row.sourceId}</TableCell>
                      <TableCell>{row.description}</TableCell>
                      <TableCell>{row.vehicleType}</TableCell>
                      <TableCell>{row.fuelUsage}</TableCell>
                      <TableCell>{row.milesTravelled}</TableCell>
                      <TableCell>{row.unit}</TableCell>
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
              <Button variant="contained" color="primary" onClick={() => navigate('/Scope1SC')}>
                Back to Stationary Combustion
              </Button>
              <Button variant="contained" color="secondary" onClick={() => navigate('/Scope1RA')}>
                Proceed to Refrigeration & AC
              </Button>
            </Box>
          </Container>

          {/* Confirmation Dialog */}
          <Dialog open={openDialog} onClose={handleClose}>
            <DialogTitle>Confirm Deletion</DialogTitle>
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
      </Box>
      
  );
};

export default MobileSourcePage;
