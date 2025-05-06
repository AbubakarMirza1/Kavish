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
import { getValidUnitsForFuel } from '../store/fuel_unit'; // Ensure this path and function are correct

const SteamPage = () => {
  const navigate = useNavigate();
  const initialFormValues = {
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
  };
  const [formValues, setFormValues] = useState(initialFormValues);
  const [rows, setRows] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('error');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedSection, setSelectedSection] = useState('dashboard');

  const [selectedFuelType, setSelectedFuelType] = useState("");
  const [availableUnits, setAvailableUnits] = useState([]);

  const fuelTypeRows = useScope2Store((state) => state.fuelTypeRows);
  const activeFuels = fuelTypeRows.filter((row) => row.active);

  useEffect(() => {
    fetchData();
  }, [page, limit]);

  const fetchData = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/scope2/steam?page=${page}&limit=${limit}`);
      const formattedData = res.data.records.map((item) => ({
        id: item.id,
        sourceId: item.scopeTypeId || 'N/A',
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
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error('Error fetching steam data:', error);
      setSnackbarMessage('Failed to fetch steam data. Please try again.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  const handleFuelTypeChange = (e) => {
    const fuelName = e.target.value;
    setSelectedFuelType(fuelName);
    setFormValues((prev) => ({
      ...prev,
      fuelType: fuelName,
      unit: '',
    }));
    const units = getValidUnitsForFuel(fuelName);
    setAvailableUnits(units);
  };

  const descriptionCharLimit = 50;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'description') {
      if (value.replace(/\s+/g, '').length > descriptionCharLimit) {
        setSnackbarMessage(`Description cannot exceed ${descriptionCharLimit} characters.`);
        setSnackbarSeverity('warning');
        setOpenSnackbar(true);
      }
    }
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const {
      description, date, sourceArea, fuelType, boilerEfficiency,
      steamPurchasedKwh, co2Kg, ch4g, n20g, unit
    } = formValues;

    if (!description.trim() || !date || !sourceArea || !fuelType || !boilerEfficiency ||
        !steamPurchasedKwh || !co2Kg || !ch4g || !n20g || !unit) {
      setSnackbarMessage('Please fill in all fields.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return false;
    }
    // Further validations... (length, numeric checks)
    if (description.replace(/\s+/g, '').length > descriptionCharLimit) {
      setSnackbarMessage(`Description cannot exceed ${descriptionCharLimit} characters.`);
      setSnackbarSeverity('error'); setOpenSnackbar(true); return false;
    }
    if (isNaN(parseFloat(sourceArea)) || parseFloat(sourceArea) <= 0) {
      setSnackbarMessage('Source Area must be a number greater than zero.');
      setSnackbarSeverity('error'); setOpenSnackbar(true); return false;
    }
    const efficiencyNum = parseInt(boilerEfficiency, 10);
    if (isNaN(efficiencyNum) || efficiencyNum <= 0 || efficiencyNum > 100) {
      setSnackbarMessage('Boiler Efficiency must be a number between 1 and 100.');
      setSnackbarSeverity('error'); setOpenSnackbar(true); return false;
    }
    if (isNaN(parseFloat(steamPurchasedKwh)) || parseFloat(steamPurchasedKwh) <= 0) {
      setSnackbarMessage('Steam Purchased (kWh) must be a number greater than zero.');
      setSnackbarSeverity('error'); setOpenSnackbar(true); return false;
    }
    if (isNaN(parseFloat(co2Kg)) || parseFloat(co2Kg) < 0) {
      setSnackbarMessage('CO2 Emissions must be a non-negative number.');
      setSnackbarSeverity('error'); setOpenSnackbar(true); return false;
    }
    if (isNaN(parseFloat(ch4g)) || parseFloat(ch4g) < 0) {
      setSnackbarMessage('CH4 Emissions must be a non-negative number.');
      setSnackbarSeverity('error'); setOpenSnackbar(true); return false;
    }
    if (isNaN(parseFloat(n20g)) || parseFloat(n20g) < 0) {
      setSnackbarMessage('N2O Emissions must be a non-negative number.');
      setSnackbarSeverity('error'); setOpenSnackbar(true); return false;
    }
    return true;
  };

  const handleAddRow = async () => {
    if (!validateForm()) return;
    try {
      await axios.post('http://localhost:5000/api/scope2/steam', {
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
      setSnackbarMessage('Steam record added successfully!');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      setPage(1);
      fetchData();
      setFormValues(initialFormValues);
      setSelectedFuelType("");
      setAvailableUnits([]);
    } catch (error) {
      console.error('Error adding steam record:', error);
      setSnackbarMessage(error.response?.data?.message || 'Failed to add the steam record.');
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
      await axios.delete(`http://localhost:5000/api/scope2/steam/${deleteId}`);
      setSnackbarMessage('Record deleted successfully!');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      handleCloseDialog();
      if (rows.length === 1 && page > 1) setPage(page - 1); else fetchData();
    } catch (error) {
      console.error('Error deleting record:', error);
      setSnackbarMessage(error.response?.data?.message || 'Failed to delete the record.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      handleCloseDialog();
    }
  };

  const commonTextFieldProps = {
    variant: "outlined",
    onChange: handleInputChange,
    InputLabelProps: { shrink: true },
    size: "small", // Make text fields compact
  };

  const formItemStyle = {
    flexShrink: 1,
    flexBasis: 'auto', // Let browser decide initial size based on content and min/max
    minWidth: '160px', // Minimum before wrapping or becoming too small
    maxWidth: '260px', // Prevent excessive width on larger screens within a row
  };
  const formItemStyleWider = { // For fields that might naturally need more space
    ...formItemStyle,
    minWidth: '180px',
    maxWidth: '300px',
  };


  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar selectedSection={selectedSection} setSelectedSection={setSelectedSection} />
      <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: '#f9f9f9', overflowX: 'hidden' }}> {/* Prevent main box scroll */}
        <TopBar title="Scope 2" showDropdown={false} />

        <Container maxWidth="lg" sx={{ mt: { xs: 2, md: 4 }, mb: 4 }}> {/* Constrain content width */}
          <Typography variant="h4" gutterBottom sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
            Steam
          </Typography>

          <Paper elevation={3} sx={{ p: { xs: 1.5, sm: 2.5 }, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              Add New Record
            </Typography>
            <Box component="form" noValidate autoComplete="off">
              <TextField
                label="Description"
                name="description"
                value={formValues.description}
                multiline
                minRows={2}
                fullWidth
                sx={{ mb: 1 }}
                {...commonTextFieldProps}
                InputLabelProps={{ shrink: true }}
                size="medium" // Keep description slightly larger
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

              {/* Row 1 */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2, alignItems: 'center' }}>
                <TextField label="Date" name="date" type="date" value={formValues.date} sx={formItemStyle} {...commonTextFieldProps} />
                <TextField label="Source Area (sq ft)" name="sourceArea" type="number" value={formValues.sourceArea} InputProps={{ inputProps: { min: 0 } }} sx={formItemStyle} {...commonTextFieldProps} />
                <FormControl variant="outlined" sx={formItemStyleWider} size="small">
                  <InputLabel id="fuel-type-label">Fuel Type</InputLabel>
                  <Select labelId="fuel-type-label" label="Fuel Type" name="fuelType" value={selectedFuelType} onChange={handleFuelTypeChange}>
                    {activeFuels.map((fuel) => (<MenuItem key={fuel.id} value={fuel.name}>{fuel.name}</MenuItem>))}
                  </Select>
                </FormControl>
                <TextField label="Boiler Efficiency (%)" name="boilerEfficiency" type="number" value={formValues.boilerEfficiency} InputProps={{ inputProps: { min: 0, max: 100 } }} sx={formItemStyle} {...commonTextFieldProps} />
              </Box>

              {/* Row 2 */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2, alignItems: 'center' }}>
                <TextField label="Steam Purchased (kWh)" name="steamPurchasedKwh" type="number" value={formValues.steamPurchasedKwh} InputProps={{ inputProps: { min: 0 } }} sx={formItemStyleWider} {...commonTextFieldProps} />
                <TextField label="CO2 Emissions (kg)" name="co2Kg" type="number" value={formValues.co2Kg} InputProps={{ inputProps: { min: 0 } }} sx={formItemStyle} {...commonTextFieldProps} />
                <TextField label="CH4 Emissions (g)" name="ch4g" type="number" value={formValues.ch4g} InputProps={{ inputProps: { min: 0 } }} sx={formItemStyle} {...commonTextFieldProps} />
                <TextField label="N2O Emissions (g)" name="n20g" type="number" value={formValues.n20g} InputProps={{ inputProps: { min: 0 } }} sx={formItemStyle} {...commonTextFieldProps} />
              {/* </Box> */}

              {/* Row 3 - Units and Button */}
              {/* <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}> */}
                <FormControl variant="outlined" sx={{...formItemStyle, minWidth: '180px'}} size="small"> {/* Ensure it has enough space */}
                  <InputLabel id="unit-label">Units</InputLabel>
                  <Select labelId="unit-label" label="Units" name="unit" value={formValues.unit} onChange={handleInputChange} disabled={!selectedFuelType || availableUnits.length === 0}>
                    {availableUnits.map((unitOption) => (<MenuItem key={unitOption} value={unitOption}>{unitOption}</MenuItem>))}
                  </Select>
                </FormControl>
                <Button variant="contained" color="primary" onClick={handleAddRow} sx={{ height: '40px', px: 3 }}> {/* Match small field height */}
                  Add Record
                </Button>
              </Box>
            </Box>
          </Paper>

          <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>Records</Typography>
          <TableContainer component={Paper} elevation={3} sx={{ width: '100%', overflowX: 'auto' }}>
            <Table stickyHeader aria-label="steam records table" sx={{ minWidth: 1200 }}> {/* Increased minWidth for table */}
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: '4%' }}>ID</TableCell>
                  <TableCell sx={{ width: '7%' }}>Source ID</TableCell>
                  <TableCell sx={{ width: '15%' }}>Description</TableCell>
                  <TableCell sx={{ width: '8%' }}>Date</TableCell>
                  <TableCell sx={{ width: '10%', textAlign: 'right' }}>Source Area</TableCell>
                  <TableCell sx={{ width: '10%' }}>Fuel Type</TableCell>
                  <TableCell sx={{ width: '8%', textAlign: 'right' }}>Boiler Eff.</TableCell>
                  <TableCell sx={{ width: '10%', textAlign: 'right' }}>Steam (kWh)</TableCell>
                  <TableCell sx={{ width: '8%', textAlign: 'right' }}>CO2 (kg)</TableCell>
                  <TableCell sx={{ width: '7%', textAlign: 'right' }}>CH4 (g)</TableCell>
                  <TableCell sx={{ width: '7%', textAlign: 'right' }}>N2O (g)</TableCell>
                  <TableCell sx={{ width: '8%' }}>Units</TableCell>
                  <TableCell sx={{ width: '8%', textAlign: 'center' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow><TableCell colSpan={13} sx={{ textAlign: 'center', py: 3 }}>No records found.</TableCell></TableRow>
                ) : (
                  rows.map((row) => (
                    <TableRow hover key={row.id}>
                      <TableCell>{row.id}</TableCell>
                      <TableCell>{row.sourceId}</TableCell>
                      <TableCell>{row.description}</TableCell>
                      <TableCell>{new Date(row.date).toLocaleDateString()}</TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>{row.sourceArea}</TableCell>
                      <TableCell>{row.fuelType}</TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>{row.boilerEfficiency}</TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>{row.steamPurchasedKwh}</TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>{row.co2Kg}</TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>{row.ch4g}</TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>{row.n20g}</TableCell>
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
              <Button variant="outlined" disabled={page === totalPages} onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))} sx={{ ml: 1 }}>Next</Button>
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button variant="contained" color="primary" onClick={() => navigate('/Scope2E')}>Back to Electricity</Button>
            <Button variant="contained" color="secondary" onClick={() => navigate('/Scope3BT')}>Proceed to Scope 3</Button>
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

export default SteamPage;