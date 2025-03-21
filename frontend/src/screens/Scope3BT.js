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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
  InputLabel,
  FormControl,
  Select,
  MenuItem,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../Component/sidebar.js'; // Import the Sidebar component
import TopBar from '../Component/topbar.js'; // Import the TopBar component
import useScope3Store from '../store/Scope3Store'; // Import the Zustand store

const BusinessTravelPage = () => {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({
    description: '',
    date: '',
    vehicleType: '',
    vehicleMiles: '',
    co2Kg: '',
    ch4g: '',
    n20g: '',
  });
  const [rows, setRows] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Get data from the store
  const vehicleTypeRows = useScope3Store((state) => state.vehicleTypes);
  const activeVehicles = vehicleTypeRows.filter((row) => row.active); // For vehicle types

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/scope3/travel');
      const formattedData = res.data.map((item) => ({
        id: item.id,
        sourceId: item.scopeTypeId,
        description: item.sourceDescription || 'N/A',
        date: item.date || new Date().toISOString(),
        vehicleType: item.vehicleType?.typeName || 'Unknown',
        vehicleMiles: item.vehicleMiles,
        co2Kg: item.co2Kg,
        ch4g: item.ch4g,
        n20g: item.n20g,
      }));
      setRows(formattedData);
    } catch (error) {
      console.error('Error fetching business travel data:', error);
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
      const res = await axios.post('http://localhost:5000/api/scope3/travel', {
        sourceDescription: formValues.description,
        vehicleType: formValues.vehicleType,
        vehicleMiles: parseInt(formValues.vehicleMiles, 10),
        co2Kg: parseFloat(formValues.co2Kg),
        ch4g: parseFloat(formValues.ch4g),
        n20g: parseFloat(formValues.n20g),
        date: formValues.date,
      });

      const newRow = {
        id: res.data.id,
        sourceId: res.data.scopeTypeId,
        description: res.data.sourceDescription || 'N/A',
        date: res.data.date || new Date().toISOString(),
        vehicleType: res.data.vehicleType?.typeName || 'Unknown',
        vehicleMiles: res.data.vehicleMiles,
        co2Kg: res.data.co2Kg,
        ch4g: res.data.ch4g,
        n20g: res.data.n20g,
      };

      setRows((prev) => [...prev, newRow]);
      setFormValues({
        description: '',
        date: '',
        vehicleType: '',
        vehicleMiles: '',
        co2Kg: '',
        ch4g: '',
        n20g: '',
      });
    } catch (error) {
      console.error('Error adding business travel record:', error);
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
      await axios.delete(`http://localhost:5000/api/scope3/travel/${deleteId}`);
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
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: '#f9f9f9' }}>
        {/* Top Bar */}
        <TopBar title="Scope 3" showDropdown={false} />

        <Container sx={{ mt: 10 }}>
          <Typography variant="h4" gutterBottom>
            Business Travel
          </Typography>

          {/* Form */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6">Add New Record</Typography>
            <Box component="form" sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <TextField
                label="Description"
                name="description"
                value={formValues.description}
                onChange={handleInputChange}
                variant="outlined"
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
                label="Vehicle Miles"
                name="vehicleMiles"
                type="number"
                value={formValues.vehicleMiles}
                onChange={handleInputChange}
                variant="outlined"
              />
              <TextField
                label="CO2 Emissions (kg)"
                name="co2Kg"
                type="number"
                value={formValues.co2Kg}
                onChange={handleInputChange}
                variant="outlined"
              />
              <TextField
                label="CH4 Emissions (g)"
                name="ch4g"
                type="number"
                value={formValues.ch4g}
                onChange={handleInputChange}
                variant="outlined"
              />
              <TextField
                label="N2O Emissions (g)"
                name="n20g"
                type="number"
                value={formValues.n20g}
                onChange={handleInputChange}
                variant="outlined"
              />
              <Button variant="contained" color="primary" onClick={handleAddRow}>
                Add
              </Button>
            </Box>
          </Box>

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
                  <TableCell>Vehicle Type</TableCell>
                  <TableCell>Vehicle Miles</TableCell>
                  <TableCell>CO2 Emissions (kg)</TableCell>
                  <TableCell>CH4 Emissions (g)</TableCell>
                  <TableCell>N2O Emissions (g)</TableCell>
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
                    <TableCell>{row.vehicleMiles}</TableCell>
                    <TableCell>{row.co2Kg}</TableCell>
                    <TableCell>{row.ch4g}</TableCell>
                    <TableCell>{row.n20g}</TableCell>
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
            <Button variant="contained" color="primary" onClick={() => navigate('/Scope2S')}>
              Back to Scope 2
            </Button>
            <Button variant="contained" color="secondary" onClick={() => navigate('/Scope3W')}>
              Proceed to Waste
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

export default BusinessTravelPage;
