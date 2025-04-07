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
import useScope2Store from '../store/scope2Store'; // Import the Zustand store

const SteamPage = () => {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({
    description: '',
    date: '',
    sourceArea: '',
    fuelType: '',
    boilerEfficiency: '',
    steamPurchasedKwh: '',
    co2Kg: '',
    ch4g: '',
    n20g: '',
    unit: '',
  });
  const [rows, setRows] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Get data from the store
  const unitRows = useScope2Store((state) => state.unitRows);
  const fuelTypeRows = useScope2Store((state) => state.fuelTypeRows);

  // Filter active items
  const activeUnits = unitRows.filter((row) => row.active); // For units
  const activeFuels = fuelTypeRows.filter((row) => row.active); // For fuel types

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/scope2/steam');
      const formattedData = res.data.map((item) => ({
        id: item.id,
        sourceId: item.scopeTypeId,
        description: item.sourceDescription || 'N/A',
        date: item.date || new Date().toISOString(),
        sourceArea: item.sourceArea,
        fuelType: item.fuelType?.typeName || 'Unknown',
        boilerEfficiency: item.boilerEfficiency,
        steamPurchasedKwh: item.steamPurchasedKwh,
        co2Kg: item.co2Kg,
        ch4g: item.ch4g,
        n20g: item.n20g,
        unit: item.unit?.unitName || 'Unknown',
      }));
      setRows(formattedData);
    } catch (error) {
      console.error('Error fetching steam data:', error);
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
      const res = await axios.post('http://localhost:5000/api/scope2/steam', {
        sourceDescription: formValues.description,
        sourceArea: parseInt(formValues.sourceArea, 10),
        fuelType: formValues.fuelType,
        boilerEfficiency: parseInt(formValues.boilerEfficiency, 10),
        steamPurchasedKwh: parseInt(formValues.steamPurchasedKwh, 10),
        co2Kg: parseFloat(formValues.co2Kg),
        ch4g: parseFloat(formValues.ch4g),
        n20g: parseFloat(formValues.n20g),
        unit: formValues.unit,
        date: formValues.date,
      });

      const newRow = {
        id: res.data.id,
        sourceId: res.data.scopeTypeId,
        description: res.data.sourceDescription || 'N/A',
        date: res.data.date || new Date().toISOString(),
        sourceArea: res.data.sourceArea,
        fuelType: formValues.fuelType || 'Unknown',
        boilerEfficiency: res.data.boilerEfficiency,
        steamPurchasedKwh: res.data.steamPurchasedKwh,
        co2Kg: res.data.co2Kg,
        ch4g: res.data.ch4g,
        n20g: res.data.n20g,
        unit: formValues.unit || 'Unknown',
      };

      setRows((prev) => [...prev, newRow]);
      setFormValues({
        description: '',
        date: '',
        sourceArea: '',
        fuelType: '',
        boilerEfficiency: '',
        steamPurchasedKwh: '',
        co2Kg: '',
        ch4g: '',
        n20g: '',
        unit: '',
      });
    } catch (error) {
      console.error('Error adding steam record:', error);
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
      await axios.delete(`http://localhost:5000/api/scope2/steam/${deleteId}`);
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
        <TopBar title="Scope 2" showDropdown={false} />

        <Container sx={{ mt: 10 }}>
          <Typography variant="h4" gutterBottom>
            Steam
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
              <TextField
                label="Source Area (sq ft)"
                name="sourceArea"
                type="number"
                value={formValues.sourceArea}
                onChange={handleInputChange}
                variant="outlined"
              />
              <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                <InputLabel>Fuel Type</InputLabel>
                <Select
                  label="Fuel Type"
                  name="fuelType"
                  value={formValues.fuelType}
                  onChange={handleInputChange}
                >
                  {activeFuels.map((fuel) => (
                    <MenuItem key={fuel.id} value={fuel.name}>
                      {fuel.name}
                    </MenuItem>
                  ))}
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
                label="Steam Purchased (kWh)"
                name="steamPurchasedKwh"
                type="number"
                value={formValues.steamPurchasedKwh}
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
                  <TableCell>Source Area (sq ft)</TableCell>
                  <TableCell>Fuel Type</TableCell>
                  <TableCell>Boiler Efficiency (%)</TableCell>
                  <TableCell>Steam Purchased (kWh)</TableCell>
                  <TableCell>CO2 Emissions (kg)</TableCell>
                  <TableCell>CH4 Emissions (g)</TableCell>
                  <TableCell>N2O Emissions (g)</TableCell>
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
                    <TableCell>{row.sourceArea}</TableCell>
                    <TableCell>{row.fuelType}</TableCell>
                    <TableCell>{row.boilerEfficiency}</TableCell>
                    <TableCell>{row.steamPurchasedKwh}</TableCell>
                    <TableCell>{row.co2Kg}</TableCell>
                    <TableCell>{row.ch4g}</TableCell>
                    <TableCell>{row.n20g}</TableCell>
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
            <Button variant="contained" color="primary" onClick={() => navigate('/Scope2E')}>
              Back to Electricity
            </Button>
            <Button variant="contained" color="secondary" onClick={() => navigate('/Scope3BT')}>
              Proceed to Scope 3
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

export default SteamPage;
