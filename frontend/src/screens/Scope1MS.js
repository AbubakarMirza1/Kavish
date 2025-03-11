import React, { useState, useEffect } from 'react';
import {
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
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../Component/sidebar.js'; // Import the Sidebar component
import TopBar from '../Component/topbar.js'; // Import the TopBar component
import useScope1Store from '../store/scope1Store'; // Import the Zustand store

const MobileSourcePage = () => {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({
    sourceId: '',
    description: '',
    vehicleType: '',
    fuelUsage: '',
    unit: '',
    milesTravelled: '',
  });
  const [rows, setRows] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Get data from the store
  const mobileRows = useScope1Store((state) => state.mobileRows);
  const unitRows = useScope1Store((state) => state.unitRows);

  // Filter active items
  const activeVehicles = mobileRows.filter((row) => row.active); // For vehicle types
  const activeUnits = unitRows.filter((row) => row.active); // For units

  // Fetch data from the backend
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/scope1/mobile');
      const formattedData = res.data.map((item) => ({
        id: item.id,
        sourceId: item.scopeTypeId,
        description: item.sourceDescription || 'N/A',
        vehicleType: item.vehicleType?.typeName || 'Unknown',
        fuelUsage: item.fuelUsage,
        unit: item.unit?.unitName || 'Unknown',
        milesTravelled: item.milesTravelled,
      }));
      setRows(formattedData);
    } catch (error) {
      console.error('Error fetching mobile sources data:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddRow = async () => {
    if (Object.values(formValues).some((value) => value === '')) {
      setSnackbarMessage('Please fill in all fields before adding a record.');
      setOpenSnackbar(true);
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/scope1/mobile', {
        sourceDescription: formValues.description,
        vehicleType: formValues.vehicleType,
        fuelUsage: parseInt(formValues.fuelUsage, 10),
        unit: formValues.unit,
        milesTravelled: parseInt(formValues.milesTravelled, 10),
      });

      const newRow = {
        id: res.data.id,
        sourceId: res.data.scopeTypeId,
        description: res.data.sourceDescription || 'N/A',
        vehicleType: res.data.vehicleType?.typeName || 'Unknown',
        fuelUsage: res.data.fuelUsage,
        unit: res.data.unit?.unitName || 'Unknown',
        milesTravelled: res.data.milesTravelled,
      };

      setRows((prev) => [...prev, newRow]);
      setFormValues({ sourceId: '', description: '', vehicleType: '', fuelUsage: '', unit: '', milesTravelled: '' });
    } catch (error) {
      console.error('Error adding mobile source record:', error);
      setSnackbarMessage('Failed to add the record. Please try again.');
      setOpenSnackbar(true);
    }
  };

  const handleClickOpen = (id) => {
    setOpenDialog(true);
    setDeleteId(id);
  };

  const handleClose = () => {
    setOpenDialog(false);
    setOpenSnackbar(false);
  };

  const handleDeleteRow = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/scope1/mobile/${deleteId}`);
      setRows((prev) => prev.filter((row) => row.id !== deleteId));
      setOpenDialog(false);
    } catch (error) {
      console.error('Error deleting record:', error);
      setSnackbarMessage('Failed to delete the record. Please try again.');
      setOpenSnackbar(true);
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: '#f9f9f9' }}>
        <TopBar title="Scope 1" showDropdown={false} />
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
                <Select
                  label="Vehicle Type"
                  name="vehicleType"
                  value={formValues.vehicleType}
                  onChange={handleInputChange}
                >
                  {activeVehicles.map((vehicle) => (
                    <MenuItem key={vehicle.id} value={vehicle.name}>
                      {vehicle.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Fuel Usage"
                name="fuelUsage"
                type="number"
                value={formValues.fuelUsage}
                onChange={handleInputChange}
                variant="outlined"
              />
              <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                <InputLabel>Units</InputLabel>
                <Select
                  label="Units"
                  name="unit"
                  value={formValues.unit}
                  onChange={handleInputChange}
                >
                  {activeUnits.map((unit) => (
                    <MenuItem key={unit.id} value={unit.name}>
                      {unit.name}
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
              <Button variant="contained" color="primary" onClick={handleAddRow}>
                Add
              </Button>
            </Box>
          </Box>

          {/* Table */}
          <Typography variant="h6">Vehicle Records</Typography>
          <TableContainer component={Paper} sx={{ maxHeight: 400, overflow: 'auto' }}>
            <Table stickyHeader>
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
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default MobileSourcePage;
