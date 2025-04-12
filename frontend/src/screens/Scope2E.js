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
import useScope2Store from '../store/scope2Store';

const ElectricityPage = () => {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({
    description: '',
    date: '',
    areaSqFt: '',
    unit: '',
    co2eKg: '',
    ch4Kg: '',
    n20Kg: '',
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
  const unitRows = useScope2Store((state) => state.unitRows);
  const activeUnits = unitRows.filter((row) => row.active);

  useEffect(() => {
    fetchData();
  }, [page]);

  const fetchData = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/scope2/electricity?page=${page}&limit=${limit}`);
      const formattedData = res.data.records.map((item) => ({
        id: item.id,
        sourceId: item.scopeTypeId,
        description: item.description || 'N/A',
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
      const res = await axios.post('http://localhost:5000/api/scope2/electricity', {
        description: formValues.description,
        areaSqFt: parseInt(formValues.areaSqFt, 10),
        unit: formValues.unit,
        co2eKg: parseFloat(formValues.co2eKg),
        ch4Kg: parseFloat(formValues.ch4Kg),
        n20Kg: parseFloat(formValues.n20Kg),
        date: formValues.date,
      });

      fetchData(); // Refresh data to maintain pagination
      setFormValues({
        description: '',
        date: '',
        areaSqFt: '',
        unit: '',
        co2eKg: '',
        ch4Kg: '',
        n20Kg: '',
      });
    } catch (error) {
      console.error('Error adding electricity record:', error);
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
      await axios.delete(`http://localhost:5000/api/scope2/electricity/${deleteId}`);
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
        <TopBar title="Scope 2" showDropdown={false} />

        <Container sx={{ mt: 10 }}>
          <Typography variant="h4" gutterBottom>
            Electricity
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
                label="Area (sq ft)"
                name="areaSqFt"
                type="number"
                value={formValues.areaSqFt}
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
                label="CO2 Emissions (kg)"
                name="co2eKg"
                type="number"
                value={formValues.co2eKg}
                onChange={handleInputChange}
                variant="outlined"
              />
              <TextField
                label="CH4 Emissions (kg)"
                name="ch4Kg"
                type="number"
                value={formValues.ch4Kg}
                onChange={handleInputChange}
                variant="outlined"
              />
              <TextField
                label="N2O Emissions (kg)"
                name="n20Kg"
                type="number"
                value={formValues.n20Kg}
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
            <Button variant="contained" color="primary" onClick={() => navigate('/Scope1PG')}>
              Back to Scope 1
            </Button>
            <Button variant="contained" color="secondary" onClick={() => navigate('/Scope2S')}>
              Proceed to Steam
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

export default ElectricityPage;