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
import useScope1Store from '../store/scope1Store'; // Import the Zustand store
import Sidebar from '../Component/sidebar.js'; // Import the Sidebar component
import TopBar from '../Component/topbar.js'; // Import the TopBar component

const RefrigerationAndACPage = () => {
  const navigate = useNavigate();

  const [formValues, setFormValues] = useState({
    sourceId: '',
    description: '',
    gas: '',
    equipmentTypeId: '',
    gwp: '',
    unitId: '',
    co2eKg: '',
    date: '',
  });

  const [rows, setRows] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Get data from the store
  const refrigerationRows = useScope1Store((state) => state.refrigerationRows);
  // const equipmentTypeRows = useScope1Store((state) => state.equipmentTypeRows);
  const unitRows = useScope1Store((state) => state.unitRows);

  // Filter active items
  // const activeEquipmentTypes = equipmentTypeRows.filter((row) => row.active);
  const activeUnits = unitRows.filter((row) => row.active);
  const activeRefrigerationOptions = refrigerationRows.filter((row) => row.active);

  // Fetch data from the backend
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/scope1/refrigeration');
      const formattedData = res.data.map((item) => ({
        id: item.id,
        sourceId: item.scopeTypeId,
        // description: item.sourceDescription || 'N/A',
        date: item.date || new Date().toISOString(),
        gas: item.gas,
        equipmentType: item.equipmentType?.typeName || 'Unknown',
        gwp: item.gwp,
        unit: item.unit?.unitName || 'Unknown',
        co2eKg: item.co2eKg,
      }));
      setRows(formattedData);
    } catch (error) {
      console.error('Error fetching Refrigeration & AC data:', error);
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
      const res = await axios.post('http://localhost:5000/api/scope1/refrigeration', {
        // sourceDescription: formValues.description,
        equipmentTypeId: formValues.equipmentTypeId,
        gas: formValues.gas,
        gwp: parseInt(formValues.gwp, 10),
        unitId: formValues.unitId,
        co2eKg: parseInt(formValues.co2eKg, 10),
        date: formValues.date,
      });

      const newRow = {
        id: res.data.id,
        sourceId: res.data.scopeTypeId,
        // description: res.data.sourceDescription || 'N/A',
        date: res.data.date || new Date().toISOString(),
        gas: res.data.gas,
        equipmentType: res.data.equipmentType?.typeName || 'Unknown',
        gwp: res.data.gwp,
        unit: res.data.unit?.unitName || 'Unknown',
        co2eKg: res.data.co2eKg,
      };

      setRows((prev) => [...prev, newRow]);
      setFormValues({
        sourceId: '',
        description: '',
        gas: '',
        equipmentTypeId: '',
        gwp: '',
        unitId: '',
        co2eKg: '',
        date: '',
      });
    } catch (error) {
      console.error('Error adding Refrigeration & AC record:', error);
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
      await axios.delete(`http://localhost:5000/api/scope1/refrigeration/${deleteId}`);
      setRows((prev) => prev.filter((row) => row.id !== deleteId));
      setOpenDialog(false);
    } catch (error) {
      console.error('Error deleting record:', error);
      setSnackbarMessage('Failed to delete the record. Please try again.');
      setOpenSnackbar(true);
    }
  };

  const gasOptions = ['R134a', 'R410A', 'R22', 'R744'];

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: '#f9f9f9' }}>
        {/* Top Bar */}
        <TopBar title="Scope 1" showDropdown={false} />
        <Container sx={{ mt: 10 }}>
          <Typography variant="h4" gutterBottom>
            Refrigeration and AC
          </Typography>

          {/* Form */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6">Add New Record</Typography>
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
                <InputLabel>Gas</InputLabel>
                <Select name="gas" value={formValues.gas} onChange={handleInputChange} label="Gas">
                  {gasOptions.map((gas) => (
                    <MenuItem key={gas} value={gas}>
                      {gas}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl variant="outlined" sx={{ minWidth: 200 }}>
                <InputLabel>Type of Equipment</InputLabel>
                <Select
                  name="equipmentTypeId"
                  value={formValues.equipmentTypeId}
                  onChange={handleInputChange}
                  label="Type of Equipment"
                >
                  {activeRefrigerationOptions.map((option) => (
                    <MenuItem key={option.id} value={option.name}>
                      {option.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Gas GWP"
                name="gwp"
                type="number"
                value={formValues.gwp}
                onChange={handleInputChange}
                variant="outlined"
              />
              <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                <InputLabel>Unit</InputLabel>
                <Select name="unitId" value={formValues.unitId} onChange={handleInputChange} label="Unit">
                  {activeUnits.map((unit) => (
                    <MenuItem key={unit.id} value={unit.name}>
                      {unit.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="CO2 Equivalent Emissions (kg)"
                name="co2eKg"
                type="number"
                value={formValues.co2eKg}
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
                  <TableCell>Gas</TableCell>
                  <TableCell>Type of Equipment</TableCell>
                  <TableCell>Gas GWP</TableCell>
                  <TableCell>Unit</TableCell>
                  <TableCell>CO2 Equivalent Emissions (kg)</TableCell>
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
                    <TableCell>{row.gas}</TableCell>
                    <TableCell>{row.equipmentType}</TableCell>
                    <TableCell>{row.gwp}</TableCell>
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

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button variant="contained" color="primary" onClick={() => navigate('/Scope1MS')}>
              Back to Mobile Sources
            </Button>
            <Button variant="contained" color="secondary" onClick={() => navigate('/Scope1FS')}>
              Proceed to Fire Suppression
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

export default RefrigerationAndACPage;
