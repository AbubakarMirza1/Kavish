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
import Sidebar from '../Component/sidebar.js';
import TopBar from '../Component/topbar.js';
import useScope2Store from '../store/scope2Store'; // Assuming this store is set up for Scope 2 units
// Access the environment variable directly
const API_BASE_URL = process.env.REACT_APP_API_URL;
const ElectricityPage = () => {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({
    description: '',
    date: '',
    areaSqFt: '',
    unit: 'Cubic Meter', // Default and only unit for this page
    co2eKg: '',
    ch4Kg: '',
    n20Kg: '',
  });
  const [rows, setRows] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedSection, setSelectedSection] = useState('dashboard'); // For Sidebar

  // const unitRows = useScope2Store((state) => state.unitRows); // Not needed if unit is fixed
  // const activeUnits = unitRows.filter((row) => row.active); // Not needed for dropdown

  useEffect(() => {
    fetchData();
  }, [page]);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/scope2/electricity?page=${page}&limit=${limit}`);
      const formattedData = res.data.records.map((item) => ({
        id: item.id,
        sourceId: item.scopeTypeId,
        description: item.description || 'N/A', // API uses 'description'
        date: item.date || new Date().toISOString(),
        areaSqFt: item.areaSqFt,
        unit: item.unit?.unitName || 'Unknown',
        co2eKg: item.co2eKg,
        ch4Kg: item.ch4Kg,
        n20Kg: item.n20Kg,
      }));
      setRows(formattedData);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error('Error fetching electricity data:', error);
      setSnackbarMessage('Failed to fetch electricity data. Please try again.');
      setOpenSnackbar(true);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'description') {
      const trimmedValue = value.replace(/\s+/g, '');
      if (trimmedValue.length > 50) { // Character limit for description
        setSnackbarMessage('Description cannot exceed 50 characters (excluding spaces).');
        setOpenSnackbar(true);
        return;
      }
    }
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddRow = async () => {
    const { description, date, areaSqFt, unit, co2eKg, ch4Kg, n20Kg } = formValues;
    if (!description || !date || !areaSqFt || !unit || !co2eKg || !ch4Kg || !n20Kg) {
      setSnackbarMessage('Please fill in all fields before adding a record.');
      setOpenSnackbar(true);
      return;
    }

    if (description.replace(/\s+/g, '').length > 50) {
        setSnackbarMessage('Description cannot exceed 50 characters (excluding spaces).');
        setOpenSnackbar(true);
        return;
    }

    if (parseInt(areaSqFt, 10) <= 0) {
      setSnackbarMessage('Area (sq ft) must be greater than zero.');
      setOpenSnackbar(true);
      return;
    }
    if (parseFloat(co2eKg) <= 0) {
      setSnackbarMessage('CO2 Emissions must be greater than zero.');
      setOpenSnackbar(true);
      return;
    }
    if (parseFloat(ch4Kg) <= 0) {
      setSnackbarMessage('CH4 Emissions must be greater than zero.');
      setOpenSnackbar(true);
      return;
    }
    if (parseFloat(n20Kg) <= 0) {
      setSnackbarMessage('N2O Emissions must be greater than zero.');
      setOpenSnackbar(true);
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/api/scope2/electricity`, {
        description: description,
        areaSqFt: parseInt(areaSqFt, 10),
        unit: unit, // Will be 'Cubic Meters'
        co2eKg: parseFloat(co2eKg),
        ch4Kg: parseFloat(ch4Kg),
        n20Kg: parseFloat(n20Kg),
        date: date,
      });

      setPage(1); // Reset to first page
      fetchData();
      setFormValues({
        description: '',
        date: '',
        areaSqFt: '',
        unit: 'Cubic Meter', // Reset to default
        co2eKg: '',
        ch4Kg: '',
        n20Kg: '',
      });
      setSnackbarMessage('Electricity record added successfully!');
      setOpenSnackbar(true);
    } catch (error) {
      console.error('Error adding electricity record:', error);
      setSnackbarMessage('Failed to add the electricity record. Please try again.');
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
      await axios.delete(`${API_BASE_URL}/api/scope2/electricity/${deleteId}`);
      fetchData();
      setOpenDialog(false);
      setSnackbarMessage('Record deleted successfully!');
      setOpenSnackbar(true);
    } catch (error) {
      console.error('Error deleting record:', error);
      setSnackbarMessage('Failed to delete the record. Please try again.');
      setOpenSnackbar(true);
    }
  };

  const fixedUnit = "Cubic Meter";

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar selectedSection={selectedSection} setSelectedSection={setSelectedSection} />
      <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: '#f9f9f9' }}>
        <TopBar title="Scope 2" showDropdown={false} />

        <Container sx={{ mt: 10 }}>
          <Typography variant="h4" gutterBottom>
            Electricity
          </Typography>

          <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6">Add New Record</Typography>
              <Box component="form" sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 2, mt: 2 }}>
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
                />
                {formValues.description.replace(/\s+/g, '').length > 0 && (
                  <Typography
                    variant="caption"
                    color={formValues.description.replace(/\s+/g, '').length > 50 ? 'error' : 'textSecondary'}
                    sx={{ width: '100%', mt: -2, mb: 1, textAlign: 'right' }}
                  >
                    {formValues.description.replace(/\s+/g, '').length}/50 characters
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
                  sx={{ flex: '1 1 auto', minWidth: '130px' }}
                />
                <TextField
                  label="Area (sq ft)"
                  name="areaSqFt"
                  type="number"
                  value={formValues.areaSqFt}
                  onChange={handleInputChange}
                  variant="outlined"
                  InputProps={{ inputProps: { min: 0 } }}
                  sx={{ flex: '1 1 auto', minWidth: '120px' }}
                />
                <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                  <InputLabel>Units</InputLabel>
                  <Select
                    label="Units"
                    name="unit"
                    value={formValues.unit}
                    onChange={handleInputChange}
                    disabled // Unit is fixed
                  >
                    <MenuItem key={fixedUnit} value={fixedUnit}>
                      {fixedUnit}
                    </MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="CO2 Emissions (kg)"
                  name="co2eKg"
                  type="number"
                  value={formValues.co2eKg}
                  onChange={handleInputChange}
                  variant="outlined"
                  InputProps={{ inputProps: { min: 0 } }}
                  sx={{ flex: '1 1 auto', minWidth: '150px' }}
                />
                <TextField
                  label="CH4 Emissions (kg)"
                  name="ch4Kg"
                  type="number"
                  value={formValues.ch4Kg}
                  onChange={handleInputChange}
                  variant="outlined"
                  InputProps={{ inputProps: { min: 0 } }}
                  sx={{ flex: '1 1 auto', minWidth: '150px' }}
                />
                <TextField
                  label="N2O Emissions (kg)"
                  name="n20Kg"
                  type="number"
                  value={formValues.n20Kg}
                  onChange={handleInputChange}
                  variant="outlined"
                  InputProps={{ inputProps: { min: 0 } }}
                  sx={{ flex: '1 1 auto', minWidth: '150px' }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAddRow}
                  sx={{ height: '56px' }}
                >
                  Add
                </Button>
              </Box>
            </Box>
          </Paper>

          <Typography variant="h6" sx={{ mt: 3 }}>Records</Typography>
          <TableContainer component={Paper} sx={{ maxHeight: 400, overflow: 'auto' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Source ID</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Area (sq ft)</TableCell>
                  <TableCell>Units</TableCell>
                  <TableCell>CO2 Emissions (kg)</TableCell>
                  <TableCell>CH4 Emissions (kg)</TableCell>
                  <TableCell>N2O Emissions (kg)</TableCell>
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
                    <TableCell>{row.areaSqFt}</TableCell>
                    <TableCell>{row.unit}</TableCell>
                    <TableCell>{row.co2eKg}</TableCell>
                    <TableCell>{row.ch4Kg}</TableCell>
                    <TableCell>{row.n20Kg}</TableCell>
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
              disabled={page === totalPages || totalPages === 0}
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            >
              Next
            </Button>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button variant="contained" color="primary" onClick={() => navigate('/Scope1PG')}>
              Back to Scope 1
            </Button>
            <Button variant="contained" color="secondary" onClick={() => navigate('/Scope2S')}>
              Proceed to Steam
            </Button>
          </Box>
        </Container>

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

        <Snackbar
            open={openSnackbar}
            autoHideDuration={6000}
            onClose={handleClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            onClose={handleClose}
            severity={snackbarMessage.includes("successfully") ? "success" : "error"}
            sx={{ width: '100%' }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default ElectricityPage;