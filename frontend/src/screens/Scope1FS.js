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
import { getValidUnitsForFuel } from '../store/fuel_unit'; // Import utility function for valid units

const FireSuppressionPage = () => {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({
    description: '',
    date: '',
    fuelType: '',
    unit: '',
    co2eKg: '',
  });
  const [rows, setRows] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Get data from the store
  const fuelTypeRows = useScope1Store((state) => state.stationaryCombustionRows);
  const unitRows = useScope1Store((state) => state.unitRows);

  // Filter active items
  const activeFuels = fuelTypeRows.filter((row) => row.active);
  const activeUnits = unitRows.filter((row) => row.active);

  // State for available units based on selected fuel type
  const [selectedFuelType, setSelectedFuelType] = useState('');
  const [availableUnits, setAvailableUnits] = useState([]);

  // Fetch data from the backend
  useEffect(() => {
    fetchData();
  }, [page]);

  const fetchData = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/scope1/fire?page=${page}&limit=${limit}`);
      const formattedData = res.data.records.map((item) => ({
        id: item.id,
        sourceId: item.scopeTypeId,
        description: item.sourceDescription || 'N/A',
        date: item.date || new Date().toISOString(),
        fuelType: item.fuelType?.typeName || 'Unknown',
        unit: item.unit?.unitName || 'Unknown',
        co2eKg: item.co2eKg,
      }));
      setRows(formattedData);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error('Error fetching fire suppression data:', error);
    }
  };

  // Handle Fuel Type Change
  const handleFuelTypeChange = (e) => {
    const fuel = e.target.value;
    setSelectedFuelType(fuel);
    setFormValues((prev) => ({ ...prev, fuelType: fuel }));

    // Get valid units for the selected fuel type
    const validUnits = getValidUnitsForFuel(fuel);
    setAvailableUnits(validUnits);

    // Clear the unit selection if the current unit is not valid for the new fuel type
    if (formValues.unit && !validUnits.includes(formValues.unit)) {
      setFormValues((prev) => ({ ...prev, unit: '' }));
    }
  };

  // Handle Input Change
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'description') {
      const trimmedValue = value.replace(/\s+/g, '');
      if (trimmedValue.length > 20) {
        setSnackbarMessage('Description cannot exceed 20 characters (excluding spaces).');
        setOpenSnackbar(true);
        return;
      }
    }

    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Add Row
  const handleAddRow = async () => {
    if (Object.values(formValues).some((value) => value === '')) {
      setSnackbarMessage('Please fill in all fields before adding a record.');
      setOpenSnackbar(true);
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/scope1/fire', {
        sourceDescription: formValues.description,
        fuelType: formValues.fuelType,
        unit: formValues.unit,
        co2eKg: parseInt(formValues.co2eKg, 10),
        date: formValues.date,
      });

      const newRow = {
        id: res.data.id,
        sourceId: res.data.scopeTypeId,
        description: res.data.sourceDescription || 'N/A',
        date: res.data.date || new Date().toISOString(),
        fuelType: formValues.fuelType || 'Unknown',
        unit: formValues.unit || 'Unknown',
        co2eKg: res.data.co2eKg,
      };

      setRows((prev) => [...prev, newRow]);
      setFormValues({ description: '', date: '', fuelType: '', unit: '', co2eKg: '' });
      setSelectedFuelType('');
      setAvailableUnits([]);
    } catch (error) {
      console.error('Error adding fire suppression record:', error);
      setSnackbarMessage('Failed to add the record. Please try again.');
      setOpenSnackbar(true);
    }
  };

  // Handle Delete Row
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
      await axios.delete(`http://localhost:5000/api/scope1/fire/${deleteId}`);
      fetchData(); // Refresh data to maintain pagination
      setOpenDialog(false);
    } catch (error) {
      console.error('Error deleting record:', error);
      setSnackbarMessage('Failed to delete the record. Please try again.');
      setOpenSnackbar(true);
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Sidebar */}
      <Sidebar />
      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: '#f9f9f9' }}>
        {/* Top Bar */}
        <TopBar title="Scope 1" showDropdown={false} />
        <Container sx={{ mt: 10 }}>
          <Typography variant="h4" gutterBottom>
            Fire Suppression
          </Typography>
          {/* Form */}
          <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6">Add New Record</Typography>
              <Box component="form" sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
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
                {formValues.description.replace(/\s+/g, '').length > 0 && (
                  <Typography
                    variant="caption"
                    color={
                      formValues.description.replace(/\s+/g, '').length > 20 ? 'error' : 'textSecondary'
                    }
                  >
                    {formValues.description.replace(/\s+/g, '').length}/20 characters used
                  </Typography>
                )}
                <TextField
                  label="Date"
                  name="date"
                  type="date"
                  value={formValues.date}
                  onChange={handleInputChange}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
                <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                  <InputLabel>Fuel Type</InputLabel>
                  <Select
                    label="Fuel Type"
                    name="fuelType"
                    value={selectedFuelType}
                    onChange={handleFuelTypeChange}
                  >
                    {activeFuels.map((fuel) => (
                      <MenuItem key={fuel.id} value={fuel.name}>
                        {fuel.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                  <InputLabel>Unit</InputLabel>
                  <Select
                    label="Unit"
                    name="unit"
                    value={formValues.unit}
                    onChange={handleInputChange}
                    disabled={!selectedFuelType}
                  >
                    {availableUnits.map((unit) => (
                      <MenuItem key={unit} value={unit}>
                        {unit}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label="CO2e (kg)"
                  name="co2eKg"
                  type="number"
                  value={formValues.co2eKg}
                  onChange={handleInputChange}
                  variant="outlined"
                  InputProps={{ inputProps: { min: 0 } }}
                />
                <Button variant="contained" color="primary" onClick={handleAddRow}>
                  Add
                </Button>
              </Box>
            </Box>
          </Paper>
          {/* Table */}
          <Typography variant="h6">Records</Typography>
          <TableContainer component={Paper} sx={{ maxHeight: 400, overflow: 'auto' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Source ID</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Fuel Type</TableCell>
                  <TableCell>Unit</TableCell>
                  <TableCell>CO2e (kg)</TableCell>
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
                    <TableCell>{row.fuelType}</TableCell>
                    <TableCell>{row.unit}</TableCell>
                    <TableCell>{row.co2eKg}</TableCell>
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
            <Button variant="contained" color="primary" onClick={() => navigate('/Scope1RA')}>
              Back to Refrigeration & AC
            </Button>
            <Button variant="contained" color="secondary" onClick={() => navigate('/Scope1PG')}>
              Proceed to Purchased Gases
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

export default FireSuppressionPage;