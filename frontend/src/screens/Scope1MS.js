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
import Sidebar from '../Component/sidebar.js';
import TopBar from '../Component/topbar.js';
import useScope1Store from '../store/scope1Store';
import { vehicleUnitMap, getValidUnitsForVehicle } from '../store/fuel_unit';

const MobileSourcePage = () => {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({
    description: '',
    date: '',
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

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Get data from the store
  const mobileRows = useScope1Store((state) => state.mobileRows);
  const unitRows = useScope1Store((state) => state.unitRows);

  // Filter active items
  const activeVehicles = mobileRows.filter((row) => row.active);
  const activeUnits = unitRows.filter((row) => row.active);
  const [availableUnits, setAvailableUnits] = useState([]);
  // Fetch data from the backend
  useEffect(() => {
    fetchData();
  }, [page]);

  const fetchData = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/scope1/mobile?page=${page}&limit=${limit}`);
      const formattedData = res.data.records.map((item) => ({
        id: item.id,
        sourceId: item.scopeTypeId,
        description: item.sourceDescription || 'N/A',
        date: item.date || new Date().toISOString(),
        vehicleType: item.vehicleType?.typeName || 'Unknown',
        fuelUsage: item.fuelUsage,
        unit: item.unit?.unitName || 'Unknown',
        milesTravelled: item.milesTravelled,
      }));
      setRows(formattedData);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error('Error fetching mobile sources data:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'vehicleType') {
      // Get valid units for the selected vehicle type
      const validUnits = getValidUnitsForVehicle(value);
      setAvailableUnits(validUnits);
  
      // Clear the unit selection if the current unit is not valid for the new vehicle type
      if (formValues.unit && !validUnits.includes(formValues.unit)) {
        setFormValues((prev) => ({ ...prev, unit: '' }));
      }
    }

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
        date: formValues.date,
      });

      const newRow = {
        id: res.data.id,
        sourceId: res.data.scopeTypeId,
        description: res.data.sourceDescription || 'N/A',
        date: res.data.date || new Date().toISOString(),
        vehicleType: formValues.vehicleType || 'Unknown',
        fuelUsage: res.data.fuelUsage,
        unit: formValues.unit || 'Unknown',
        milesTravelled: res.data.milesTravelled,
      };

      setRows((prev) => [...prev, newRow]);
      setFormValues({description: '', date: '', vehicleType: '', fuelUsage: '', unit: '', milesTravelled: '' });
      fetchData(); // Refresh data to maintain pagination consistency
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
      fetchData(); // Refresh data to maintain pagination consistency
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
          <Paper elevation={2} sx={{ p: 2, mb: 2 }}>          
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6">Add New Vehicle Record</Typography>
            <Box component="form" sx={{ display: 'flex',flexWrap: 'wrap', gap: 2, mt: 2 }}>
              <TextField
                label="Description"
                name="description"
                value={formValues.description}
                onChange={handleInputChange}
                variant="outlined"
                multiline
                minRows={3}
                fullWidth
                sx={{ flex: '1 1 100%' }}
              />
              <TextField
                label="Date"
                name="date"
                type="date"
                value={formValues.date}
                onChange={handleInputChange}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
              <FormControl variant="outlined" sx={{ minWidth: 140 }}>
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
                  disabled={!formValues.vehicleType}
                >
                  {availableUnits.map((unit) => (
                    <MenuItem key={unit} value={unit}>
                      {unit}
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
          </Paper>

          {/* Table */}
          <Typography variant="h6">Vehicle Records</Typography>
          <TableContainer component={Paper} sx={{ maxHeight: 400, overflow: 'auto' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Source ID</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Date</TableCell>
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
                    <TableCell>{new Date(row.date).toLocaleDateString()}</TableCell>
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

          {/* Pagination */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, gap: 2 }}>
            <Button
              variant="outlined"
              disabled={page === 1}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            >
              Previous
            </Button>
            <Typography variant="body1" sx={{ alignSelf: 'center' }}>
              Page {page} of {totalPages}
            </Typography>
            <Button
              variant="outlined"
              disabled={page === totalPages}
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            >
              Next
            </Button>
          </Box>

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