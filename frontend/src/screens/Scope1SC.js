import React, { useState, useEffect } from 'react';
import {
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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
  Typography,
  InputLabel,
  FormControl,
  Select,
  MenuItem,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../Component/sidebar.js';
import useScope1Store from '../store/scope1Store';
import TopBar from '../Component/topbar.js';
import { getValidUnitsForFuel } from '../store/fuel_unit'; // Assuming this is correct

const Scope1SC = () => {
  const navigate = useNavigate();
  const initialFormValues = {
    description: '',
    date: '',
    fuelCombusted: '', // This will store the name of the fuel
    quantity: '',
    units: '',
  };
  const [formValues, setFormValues] = useState(initialFormValues);
  const [rows, setRows] = useState([]);
  const [selectedSection, setSelectedSection] = useState('dashboard');
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('error'); // For dynamic snackbar types

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedFuelType, setSelectedFuelType] = useState(""); // Manages the Fuel Combusted Select
  const [availableUnits, setAvailableUnits] = useState([]);

  const stationaryCombustionRows = useScope1Store((state) => state.stationaryCombustionRows);
  // const unitRows = useScope1Store((state) => state.unitRows); // Units are dynamic

  const activeFuels = stationaryCombustionRows.filter((row) => row.active);

  useEffect(() => {
    fetchData();
  }, [page, limit]); // Added limit to dependency array

  const fetchData = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/scope1/stationary?page=${page}&limit=${limit}`);
      const formattedData = res.data.records.map((item) => ({
        id: item.id,
        sourceId: item.scopeTypeId || 'N/A',
        description: item.sourceDescription || 'N/A',
        date: item.date || new Date().toISOString(),
        fuelCombusted: item.fuelType?.typeName || 'Unknown',
        quantity: item.quantity,
        units: item.unit?.unitName || 'Unknown',
      }));
      setRows(formattedData);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error('Error fetching stationary data:', error);
      setSnackbarMessage('Failed to fetch stationary combustion data.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  const handleFuelTypeChange = (e) => {
    const fuelName = e.target.value;
    setSelectedFuelType(fuelName);
    setFormValues((prev) => ({
      ...prev,
      fuelCombusted: fuelName,
      units: '', // Reset unit when fuel type changes
    }));
    const units = getValidUnitsForFuel(fuelName);
    setAvailableUnits(units);
  };

  // handleUnitChange is not strictly needed if 'units' is part of formValues and handled by handleInputChange
  // const handleUnitChange = (e) => {
  //   const unit = e.target.value;
  //   setFormValues((prev) => ({ ...prev, units: unit }));
  // };

  const descriptionCharLimit = 20;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'description') {
      const trimmedValue = value.replace(/\s+/g, '');
      if (trimmedValue.length > descriptionCharLimit) {
        setSnackbarMessage(`Description cannot exceed ${descriptionCharLimit} characters (excluding spaces).`);
        setSnackbarSeverity('warning');
        setOpenSnackbar(true);
        // To prevent updating state beyond limit:
        // return;
        // Or to trim:
        // setFormValues((prev) => ({ ...prev, [name]: value.substring(0, prev[name].length) })); // A bit complex to get exact trim
        // For simplicity, just show message and let user correct. If strict, prevent update.
      }
    }
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const { description, date, fuelCombusted, quantity, units } = formValues;
    if (!description.trim() || !date || !fuelCombusted || !quantity || !units) {
      setSnackbarMessage('Please fill in all fields.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return false;
    }
    if (description.replace(/\s+/g, '').length > descriptionCharLimit) {
      setSnackbarMessage(`Description cannot exceed ${descriptionCharLimit} characters.`);
      setSnackbarSeverity('error'); setOpenSnackbar(true); return false;
    }
    if (isNaN(parseFloat(quantity)) || parseFloat(quantity) <= 0) {
      setSnackbarMessage('Quantity must be a number greater than zero.');
      setSnackbarSeverity('error'); setOpenSnackbar(true); return false;
    }
    return true;
  };

  const handleAddRow = async () => {
    if (!validateForm()) return;
    try {
      // The backend expects 'fuelType' not 'fuelCombusted' based on your fetchData mapping
      await axios.post('http://localhost:5000/api/scope1/stationary', {
        sourceDescription: formValues.description,
        fuelType: formValues.fuelCombusted, // Send the selected fuel name
        quantity: parseFloat(formValues.quantity), // Use parseFloat for quantity
        unit: formValues.units, // Send selected unit name
        date: formValues.date,
      });
      setSnackbarMessage('Record added successfully!');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      setPage(1);
      fetchData();
      setFormValues(initialFormValues); // Reset form
      setSelectedFuelType(""); // Reset selected fuel type for the dropdown
      setAvailableUnits([]); // Clear available units
    } catch (error) {
      console.error('Error adding stationary combustion record:', error);
      setSnackbarMessage(error.response?.data?.message || 'Failed to add the record. Please try again.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  const handleClickOpen = (id) => { setOpenDialog(true); setDeleteId(id); };
  const handleCloseDialog = () => { setOpenDialog(false); setDeleteId(null); }; // Renamed from handleClose for clarity
  const handleCloseSnackbar = (event, reason) => { if (reason === 'clickaway') return; setOpenSnackbar(false); };

  const handleDeleteRow = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`http://localhost:5000/api/scope1/stationary/${deleteId}`);
      // Instead of manually filtering, refetch data to ensure consistency with backend and pagination
      setSnackbarMessage('Record deleted successfully!');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      handleCloseDialog();
      if (rows.length === 1 && page > 1) { // If last item on a page (not first page) is deleted
        setPage(page - 1); // Go to previous page
      } else {
        fetchData(); // Otherwise, refetch current page
      }
    } catch (error) {
      console.error('Error deleting record:', error);
      setSnackbarMessage(error.response?.data?.message || 'Failed to delete the record. Please try again.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      handleCloseDialog();
    }
  };

  // Define commonTextFieldProps if you want to apply size="small" or other common styles
   const commonTextFieldProps = {
    variant: "outlined",
    onChange: handleInputChange,
    InputLabelProps: { shrink: true },
    // size: "small", // Uncomment to make fields smaller
  };


  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar selectedSection={selectedSection} setSelectedSection={setSelectedSection} />
      <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: '#f9f9f9', overflowX: 'hidden' }}>
        <TopBar title="Scope 1" showDropdown={false} />
        <Container maxWidth="lg" sx={{ mt: { xs: 2, md: 4 }, mb: 4 }}> {/* Use maxWidth and responsive margin */}
          <Typography variant="h4" gutterBottom sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
            Stationary Combustion
          </Typography>
          <Paper elevation={3} sx={{ p: { xs: 1.5, sm: 2.5 }, mb: 3 }}> {/* Adjusted padding */}
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>Add New Record</Typography>
            {/* Your existing form layout is preserved */}
            <Box component="form" noValidate autoComplete="off" sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
              <TextField
                label="Description"
                name="description"
                value={formValues.description}
                onChange={handleInputChange}
                variant="outlined"
                multiline
                minRows={2}
                fullWidth
                sx={{ flex: '1 1 100%', mb: 1 }}
                InputLabelProps={{ shrink: true }} // Ensure label shrinks for multiline
                // size="medium" // Or "small"
              />
              {formValues.description.length > 0 && ( // Show only if there's text
              <Typography variant="caption"
                color={formValues.description.replace(/\s+/g, '').length > descriptionCharLimit ? 'error' : 'textSecondary'}
                sx={{ width: '100%', mt: -1, mb: 2, textAlign: 'right' }} // Adjusted margin
              >
                {formValues.description.replace(/\s+/g, '').length}/{descriptionCharLimit} characters used
              </Typography>)}

              <TextField
                label="Date"
                name="date"
                type="date"
                value={formValues.date}
                onChange={handleInputChange} // Use general input handler
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                sx={{ flex: '1 1 auto', minWidth: '150px' }} // Allow flex behavior
                // {...commonTextFieldProps} // Apply if defined
              />
              <FormControl variant="outlined" sx={{ flex: '1 1 auto', minWidth: '200px' }} /*size="small"*/>
                <InputLabel id="fuel-combusted-label">Fuel Combusted</InputLabel>
                <Select
                  labelId="fuel-combusted-label"
                  label="Fuel Combusted"
                  name="fuelCombusted" // Name matches formValues key
                  value={selectedFuelType} // Controlled by selectedFuelType
                  onChange={handleFuelTypeChange} // Specific handler for dependent dropdown
                  // sx={{ width: '250px' }} // Let flex control width or use minWidth
                >
                  {activeFuels.map((fuel) => (
                    <MenuItem key={fuel.id} value={fuel.name}>
                      {fuel.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Quantity"
                name="quantity"
                type="number"
                value={formValues.quantity}
                onChange={handleInputChange} // Use general input handler
                variant="outlined"
                InputProps={{ inputProps: { min: 0 } }}
                sx={{ flex: '1 1 auto', minWidth: '120px' }}
                // {...commonTextFieldProps}
              />
              <FormControl variant="outlined" sx={{ flex: '1 1 auto', minWidth: '150px' }} /*size="small"*/>
                <InputLabel id="units-label">Units</InputLabel>
                <Select
                  labelId="units-label"
                  label="Units"
                  name="units" // Name matches formValues key
                  value={formValues.units}
                  onChange={handleInputChange} // Use general input handler
                  disabled={!selectedFuelType || availableUnits.length === 0}
                >
                  {availableUnits.map((unit) => (
                    <MenuItem key={unit} value={unit}>
                      {unit}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddRow}
                sx={{ height: '56px', alignSelf: 'center', px: 3 }} // Standard height, or '40px' if using size="small"
              >
                Add
              </Button>
            </Box>
          </Paper>

          <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>Records</Typography>
          <TableContainer component={Paper} elevation={3} sx={{ width: '100%', overflowX: 'auto' }}>
            <Table stickyHeader aria-label="stationary combustion records table" sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: '10%' }}>ID</TableCell>
                  <TableCell sx={{ width: '10%' }}>Source ID</TableCell>
                  <TableCell sx={{ width: '25%' }}>Description</TableCell>
                  <TableCell sx={{ width: '10%' }}>Date</TableCell>
                  <TableCell sx={{ width: '15%' }}>Fuel Combusted</TableCell>
                  <TableCell sx={{ width: '10%', textAlign: 'right' }}>Quantity</TableCell>
                  <TableCell sx={{ width: '10%' }}>Units</TableCell>
                  <TableCell sx={{ width: '10%', textAlign: 'center' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} sx={{ textAlign: 'center', py: 3 }}>No records found.</TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => (
                    <TableRow hover key={row.id}>
                      <TableCell>{row.id}</TableCell>
                      <TableCell>{row.sourceId}</TableCell>
                      <TableCell>{row.description}</TableCell>
                      <TableCell>{new Date(row.date).toLocaleDateString()}</TableCell>
                      <TableCell>{row.fuelCombusted}</TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>{row.quantity}</TableCell>
                      <TableCell>{row.units}</TableCell>
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
            <Button variant="contained" color="primary" onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
            <Button variant="contained" color="secondary" onClick={() => navigate('/Scope1MS')}>Proceed to Mobile Sources</Button>
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

export default Scope1SC;