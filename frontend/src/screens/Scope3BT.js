import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
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
  IconButton, 
  Avatar, 
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
  Notifications as NotificationsIcon,
  HelpOutline as HelpIcon,
  AccountCircle as ProfileIcon,
} from '@mui/icons-material'; 
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Component/sidebar.js'; // Import the Sidebar component

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

  const vehicleTypeOptions = ['Car', 'Truck', 'Bus', 'Motorcycle'];

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: '#f9f9f9' }}>
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
            <Avatar sx={{ ml: 2, bgcolor: '#0D7377' }}>AB</Avatar>
          </Toolbar>
        </AppBar>

        {/* Rest of the content */}
        <Typography variant="h2" gutterBottom sx={{ mt: 8, color: '#000000' }}>
          Scope 3
        </Typography>

        <Container sx={{ mt: 10 }}>
          <Typography variant="h4" gutterBottom sx={{ color: '#000000' }}>
            Business Travel & Employee Commute & Upstream Transportation and Distribution
          </Typography>

          {/* Form */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ color: '#000000' }}>Add New Record</Typography>
            <Box component="form" sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
              <TextField
                label="Source ID"
                name="sourceId"
                value={formValues.sourceId}
                onChange={handleInputChange}
                variant="outlined"
                sx={{ backgroundColor: '#FFFFFF', color: '#000000' }}
              />
              <TextField
                label="Description"
                name="description"
                value={formValues.description}
                onChange={handleInputChange}
                variant="outlined"
                sx={{ backgroundColor: '#FFFFFF', color: '#000000' }}
              />
              <FormControl variant="outlined" sx={{ minWidth: 150 }}>
                <InputLabel sx={{ color: '#000000' }}>Vehicle Type</InputLabel>
                <Select
                  label="Vehicle Type"
                  name="VehicleType"
                  value={formValues.VehicleType}
                  onChange={handleInputChange}
                  sx={{ backgroundColor: '#FFFFFF', color: '#000000' }}
                >
                  {vehicleTypeOptions.map((type) => (
                    <MenuItem key={type} value={type} sx={{ color: '#000000' }}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Vehicle Kilometers"
                name="VehicleKilometers"
                type="number"
                value={formValues.VehicleKilometers}
                onChange={handleInputChange}
                variant="outlined"
                sx={{ backgroundColor: '#FFFFFF', color: '#000000' }}
              />
              <TextField
                label="CO2 emissions (Kg)"
                name="co2Emissions"
                type="number"
                value={formValues.co2Emissions}
                onChange={handleInputChange}
                variant="outlined"
                sx={{ backgroundColor: '#FFFFFF', color: '#000000' }}
              />
              <TextField
                label="CH4 emissions (Kg)"
                name="ch4Emissions"
                type="number"
                value={formValues.ch4Emissions}
                onChange={handleInputChange}
                variant="outlined"
                sx={{ backgroundColor: '#FFFFFF', color: '#000000' }}
              />
              <TextField
                label="N2O emissions (Kg)"
                name="n2oEmissions"
                type="number"
                value={formValues.n2oEmissions}
                onChange={handleInputChange}
                variant="outlined"
                sx={{ backgroundColor: '#FFFFFF', color: '#000000' }}
              />
              <Button variant="contained" color="primary" onClick={handleAddRow}>
                Add
              </Button>
            </Box>
          </Box>

          {/* Table */}
          <Typography variant="h6" sx={{ color: '#000000' }}>Records</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: '#000000' }}>ID</TableCell>
                  <TableCell sx={{ color: '#000000' }}>Source ID</TableCell>
                  <TableCell sx={{ color: '#000000' }}>Description</TableCell>
                  <TableCell sx={{ color: '#000000' }}>Vehicle Type</TableCell>
                  <TableCell sx={{ color: '#000000' }}>Vehicle Kilometers</TableCell>
                  <TableCell sx={{ color: '#000000' }}>CO2 emissions (Kg)</TableCell>
                  <TableCell sx={{ color: '#000000' }}>CH4 emissions (Kg)</TableCell>
                  <TableCell sx={{ color: '#000000' }}>N2O emissions (Kg)</TableCell>
                  <TableCell sx={{ color: '#000000' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell sx={{ color: '#000000' }}>{row.id}</TableCell>
                    <TableCell sx={{ color: '#000000' }}>{row.sourceId}</TableCell>
                    <TableCell sx={{ color: '#000000' }}>{row.description}</TableCell>
                    <TableCell sx={{ color: '#000000' }}>{row.VehicleType}</TableCell>
                    <TableCell sx={{ color: '#000000' }}>{row.VehicleKilometers}</TableCell>
                    <TableCell sx={{ color: '#000000' }}>{row.co2Emissions}</TableCell>
                    <TableCell sx={{ color: '#000000' }}>{row.ch4Emissions}</TableCell>
                    <TableCell sx={{ color: '#000000' }}>{row.n2oEmissions}</TableCell>
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
            <Button
              variant="contained"
              color="secondary"
              onClick={() => navigate('/Scope3W')}
            >
              Proceed to Waste
            </Button>
          </Box>
        </Container>

        {/* Confirmation Dialog */}
        <Dialog open={openDialog} onClose={handleClose}>
          <DialogTitle sx={{ color: '#000000' }}>Confirm Deletion</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ color: '#000000' }}>
              Are you sure you want to delete this record?
            </DialogContentText>
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

export default BusinessTravelPage;
