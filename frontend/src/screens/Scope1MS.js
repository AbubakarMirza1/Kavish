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
import { getValidUnitsForVehicle } from '../store/fuel_unit'; // Assuming this is the correct path and function

const MobileSourcePage = () => {
  const navigate = useNavigate();
  const initialFormValues = {
    description: '',
    date: '',
    vehicleType: '',
    fuelUsage: '',
    unit: '',
    milesTravelled: '',
  };
  const [formValues, setFormValues] = useState(initialFormValues);
  const [rows, setRows] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('error'); // For dynamic snackbar types
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedSection, setSelectedSection] = useState('dashboard'); // For Sidebar

  const mobileRows = useScope1Store((state) => state.mobileRows); // For vehicle types
  // const unitRows = useScope1Store((state) => state.unitRows); // Units are now dynamic based on vehicle

  const activeVehicles = mobileRows.filter((row) => row.active);
  const [availableUnits, setAvailableUnits] = useState([]);

  useEffect(() => {
    fetchData();
  }, [page, limit]);

  const fetchData = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/scope1/mobile?page=${page}&limit=${limit}`);
      const formattedData = res.data.records.map((item) => ({
        id: item.id,
        sourceId: item.scopeTypeId || 'N/A',
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
      setSnackbarMessage('Failed to fetch mobile sources data. Please try again.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  const descriptionCharLimit = 50; // Or your preferred limit

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    let newFormValues = { ...formValues, [name]: value };

    if (name === 'description') {
      if (value.replace(/\s+/g, '').length > descriptionCharLimit) {
        setSnackbarMessage(`Description cannot exceed ${descriptionCharLimit} characters.`);
        setSnackbarSeverity('warning');
        setOpenSnackbar(true);
        // Optionally, you might want to prevent the state update if it exceeds the limit
        // or trim the value:
        // newFormValues[name] = value.substring(0, descriptionCharLimit + value.length - value.replace(/\s+/g, '').length);
      }
    }

    if (name === 'vehicleType') {
      const validUnits = getValidUnitsForVehicle(value);
      setAvailableUnits(validUnits);
      // If the currently selected unit is no longer valid for the new vehicle type, clear it.
      if (newFormValues.unit && !validUnits.includes(newFormValues.unit)) {
        newFormValues.unit = '';
      }
    }
    setFormValues(newFormValues);
  };

  const validateForm = () => {
    const { description, date, vehicleType, fuelUsage, unit, milesTravelled } = formValues;
    if (!description.trim() || !date || !vehicleType || !fuelUsage || !unit || !milesTravelled) {
      setSnackbarMessage('Please fill in all fields.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return false;
    }
    if (description.replace(/\s+/g, '').length > descriptionCharLimit) {
      setSnackbarMessage(`Description cannot exceed ${descriptionCharLimit} characters.`);
      setSnackbarSeverity('error'); setOpenSnackbar(true); return false;
    }
    if (isNaN(parseFloat(fuelUsage)) || parseFloat(fuelUsage) <= 0) {
      setSnackbarMessage('Fuel Usage must be a number greater than zero.');
      setSnackbarSeverity('error'); setOpenSnackbar(true); return false;
    }
    if (isNaN(parseFloat(milesTravelled)) || parseFloat(milesTravelled) <= 0) {
      setSnackbarMessage('Miles Travelled must be a number greater than zero.');
      setSnackbarSeverity('error'); setOpenSnackbar(true); return false;
    }
    return true;
  };

  const handleAddRow = async () => {
    if (!validateForm()) return;
    try {
      // No need to create newRow manually, fetchData will refresh
      await axios.post('http://localhost:5000/api/scope1/mobile', {
        sourceDescription: formValues.description,
        vehicleType: formValues.vehicleType, // Send vehicle type name
        fuelUsage: parseFloat(formValues.fuelUsage), // Use parseFloat
        unit: formValues.unit, // Send unit name
        milesTravelled: parseFloat(formValues.milesTravelled), // Use parseFloat
        date: formValues.date,
      });
      setSnackbarMessage('Mobile source record added successfully!');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      setPage(1);
      fetchData();
      setFormValues(initialFormValues);
      setAvailableUnits([]); // Clear available units after adding
    } catch (error) {
      console.error('Error adding mobile source record:', error);
      setSnackbarMessage(error.response?.data?.message || 'Failed to add the record. Please try again.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  const handleClickOpen = (id) => { setOpenDialog(true); setDeleteId(id); };
  const handleCloseDialog = () => { setOpenDialog(false); setDeleteId(null); };
  const handleCloseSnackbar = (event, reason) => { if (reason === 'clickaway') return; setOpenSnackbar(false); };

  const handleDeleteRow = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`http://localhost:5000/api/scope1/mobile/${deleteId}`);
      setSnackbarMessage('Record deleted successfully!');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      handleCloseDialog();
      if (rows.length === 1 && page > 1) setPage(page - 1); else fetchData();
    } catch (error) {
      console.error('Error deleting record:', error);
      setSnackbarMessage(error.response?.data?.message || 'Failed to delete the record. Please try again.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      handleCloseDialog();
    }
  };

  // Using existing layout, so no major changes to commonTextFieldProps or formItemStyle needed unless you want to tweak it
  const commonTextFieldProps = { // Define if you want to apply common props like size="small"
    variant: "outlined",
    onChange: handleInputChange,
    InputLabelProps: { shrink: true },
    // size: "small", // Uncomment if you want smaller fields
  };


  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar selectedSection={selectedSection} setSelectedSection={setSelectedSection} /> {/* Pass props if Sidebar uses them */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: '#f9f9f9', overflowX: 'hidden' }}>
        <TopBar title="Scope 1" showDropdown={false} />
        <Container maxWidth="lg" sx={{ mt: { xs: 2, md: 4 }, mb: 4 }}> {/* Use maxWidth and responsive margin */}
          <Typography variant="h4" gutterBottom sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
            Mobile Sources
          </Typography>

          <Paper elevation={3} sx={{ p: { xs: 1.5, sm: 2.5 }, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              Add New Vehicle Record
            </Typography>
            {/* Keeping your existing form layout structure */}
            <Box component="form" noValidate autoComplete="off" sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
              <TextField
                label="Description"
                name="description"
                value={formValues.description}
                onChange={handleInputChange} // Use specific handler
                variant="outlined"
                multiline
                minRows={2} // Adjusted from 3 for compactness if desired
                fullWidth
                sx={{ flex: '1 1 100%', mb: 1 }} // Ensure it takes full width
                // {...commonTextFieldProps} // Apply if defined and desired
                InputLabelProps={{ shrink: true }}
                // size="medium" // Default size, or "small"
              />
              {formValues.description.length > 0 && (
                <Typography
                  variant="caption"
                  color={formValues.description.replace(/\s+/g, '').length > descriptionCharLimit ? 'error' : 'textSecondary'}
                  sx={{ display: 'block', width: '100%', textAlign: 'right', mb: 2 }}
                >
                  {formValues.description.replace(/\s+/g, '').length}/{descriptionCharLimit}
                </Typography>
              )}

              {/* Row of inputs */}
              <TextField
                label="Date"
                name="date"
                type="date"
                value={formValues.date}
                onChange={handleInputChange}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                sx={{ flex: '1 1 auto', minWidth: '150px' }} // Allow flex behavior
                // {...commonTextFieldProps}
              />
              <FormControl variant="outlined" sx={{ flex: '1 1 auto', minWidth: '180px' }} /*size="small"*/>
                <InputLabel id="vehicle-type-label">Vehicle Type</InputLabel>
                <Select
                  labelId="vehicle-type-label"
                  label="Vehicle Type"
                  name="vehicleType"
                  value={formValues.vehicleType}
                  onChange={handleInputChange} // This triggers unit update
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
                InputProps={{ inputProps: { min: 0 } }}
                sx={{ flex: '1 1 auto', minWidth: '150px' }}
                // {...commonTextFieldProps}
              />
              <FormControl variant="outlined" sx={{ flex: '1 1 auto', minWidth: '150px' }} /*size="small"*/>
                <InputLabel id="unit-label">Units</InputLabel>
                <Select
                  labelId="unit-label"
                  label="Units"
                  name="unit"
                  value={formValues.unit}
                  onChange={handleInputChange}
                  disabled={!formValues.vehicleType || availableUnits.length === 0}
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
                InputProps={{ inputProps: { min: 0 } }}
                sx={{ flex: '1 1 auto', minWidth: '150px' }}
                // {...commonTextFieldProps}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddRow}
                sx={{ height: '56px', alignSelf: 'center', px:3 }} // Standard height, or '40px' if using size="small" on fields
              >
                Add
              </Button>
            </Box>
          </Paper>

          <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>Vehicle Records</Typography>
          <TableContainer component={Paper} elevation={3} sx={{width: '100%', overflowX: 'auto'}}>
            <Table stickyHeader aria-label="mobile sources records table" sx={{minWidth: 900}}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: '5%' }}>ID</TableCell>
                  <TableCell sx={{ width: '10%' }}>Source ID</TableCell>
                  <TableCell sx={{ width: '25%' }}>Description</TableCell>
                  <TableCell sx={{ width: '10%' }}>Date</TableCell>
                  <TableCell sx={{ width: '15%' }}>Vehicle Type</TableCell>
                  <TableCell sx={{ width: '10%', textAlign: 'right' }}>Fuel Usage</TableCell>
                  <TableCell sx={{ width: '10%', textAlign: 'right' }}>Miles</TableCell>
                  <TableCell sx={{ width: '10%' }}>Units</TableCell>
                  <TableCell sx={{ width: '10%', textAlign: 'center' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} sx={{ textAlign: 'center', py: 3 }}>No records found.</TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => (
                    <TableRow hover key={row.id}>
                      <TableCell>{row.id}</TableCell>
                      <TableCell>{row.sourceId}</TableCell>
                      <TableCell>{row.description}</TableCell>
                      <TableCell>{new Date(row.date).toLocaleDateString()}</TableCell>
                      <TableCell>{row.vehicleType}</TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>{row.fuelUsage}</TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>{row.milesTravelled}</TableCell>
                      <TableCell>{row.unit}</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Button variant="outlined" color="secondary" size="small" onClick={() => handleClickOpen(row.id)}>Delete</Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 2 }}>
              <Button variant="outlined" disabled={page === 1} onClick={() => setPage((prev) => Math.max(prev - 1, 1))} sx={{ mr: 1 }}>Previous</Button>
              <Typography variant="body1" sx={{ alignSelf: 'center', mx: 2 }}>Page {page} of {totalPages}</Typography>
              <Button variant="outlined" disabled={page === totalPages || totalPages === 0} onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))} sx={{ ml: 1 }}>Next</Button>
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button variant="contained" color="primary" onClick={() => navigate('/Scope1SC')}>Back to Stationary Combustion</Button>
            <Button variant="contained" color="secondary" onClick={() => navigate('/Scope1RA')}>Proceed to Refrigeration & AC</Button>
          </Box>
        </Container>

        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent><DialogContentText>Are you sure you want to delete this record?</DialogContentText></DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="primary">Cancel</Button>
            <Button onClick={handleDeleteRow} color="error" autoFocus>Confirm Delete</Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }} variant="filled">{snackbarMessage}</Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default MobileSourcePage;