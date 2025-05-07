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
import useScope3Store from '../store/Scope3Store';

// Access the environment variable directly
const API_BASE_URL = process.env.REACT_APP_API_URL;
const BusinessTravelPage = () => {
  const navigate = useNavigate();
  const initialFormValues = {
    description: '',
    date: '',
    vehicleType: '',
    vehicleMiles: '',
    co2Kg: '',
    ch4g: '',
    n20g: '',
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

  const vehicleTypeRows = useScope3Store((state) => state.vehicleTypes);
  const activeVehicles = vehicleTypeRows.filter((row) => row.active);

  useEffect(() => {
    fetchData();
  }, [page, limit]);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/scope3/travel?page=${page}&limit=${limit}`);
      const formattedData = res.data.records.map((item) => ({
        id: item.id,
        sourceId: item.scopeTypeId || 'N/A',
        description: item.sourceDescription || 'N/A',
        date: item.date || new Date().toISOString(),
        vehicleType: item.vehicleType?.typeName || 'Unknown',
        vehicleMiles: item.vehicleMiles,
        co2Kg: item.co2Kg,
        ch4g: item.ch4g,
        n20g: item.n20g,
      }));
      setRows(formattedData);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error('Error fetching business travel data:', error);
      setSnackbarMessage('Failed to fetch business travel data. Please try again.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
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
    const { description, date, vehicleType, vehicleMiles, co2Kg, ch4g, n20g } = formValues;
    if (!description || !date || !vehicleType || !vehicleMiles || !co2Kg || !ch4g || !n20g) {
      setSnackbarMessage('Please fill in all fields.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return false;
    }
    if (description.replace(/\s+/g, '').length > descriptionCharLimit) {
      setSnackbarMessage(`Description cannot exceed ${descriptionCharLimit} characters.`);
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return false;
    }
    if (isNaN(parseInt(vehicleMiles, 10)) || parseInt(vehicleMiles, 10) <= 0) {
      setSnackbarMessage('Vehicle Miles must be a number greater than zero.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return false;
    }
    if (isNaN(parseFloat(co2Kg)) || parseFloat(co2Kg) < 0) {
      setSnackbarMessage('CO2 Emissions must be a non-negative number.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return false;
    }
    if (isNaN(parseFloat(ch4g)) || parseFloat(ch4g) < 0) {
      setSnackbarMessage('CH4 Emissions must be a non-negative number.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return false;
    }
    if (isNaN(parseFloat(n20g)) || parseFloat(n20g) < 0) {
      setSnackbarMessage('N2O Emissions must be a non-negative number.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return false;
    }
    return true;
  };

  const handleAddRow = async () => {
    if (!validateForm()) return;
    try {
      await axios.post(`${API_BASE_URL}/api/scope3/travel`, {
        sourceDescription: formValues.description,
        vehicleType: formValues.vehicleType,
        vehicleMiles: parseInt(formValues.vehicleMiles, 10),
        co2Kg: parseFloat(formValues.co2Kg),
        ch4g: parseFloat(formValues.ch4g),
        n20g: parseFloat(formValues.n20g),
        date: formValues.date,
      });
      setSnackbarMessage('Business travel record added successfully!');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      setPage(1);
      fetchData();
      setFormValues(initialFormValues);
    } catch (error) {
      console.error('Error adding business travel record:', error);
      setSnackbarMessage(error.response?.data?.message || 'Failed to add the record.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  const handleClickOpen = (id) => {
    setOpenDialog(true);
    setDeleteId(id);
  };
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setDeleteId(null);
  };
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setOpenSnackbar(false);
  };
  const handleDeleteRow = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/scope3/travel/${deleteId}`);
      setSnackbarMessage('Record deleted successfully!');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      handleCloseDialog();
      if (rows.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        fetchData();
      }
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
    size: "small", // Make text fields a bit smaller
  };

  // Define a style for form items to control their growth and basis
  // We want them to take up space but not force the container to grow excessively
  const formItemStyle = {
    // flexGrow: 1, // Allow to grow to fill space within the row
    flexShrink: 1, // Allow to shrink
    flexBasis: 'auto', // Start with auto basis
    minWidth: '180px', // A reasonable minimum width
    maxWidth: '250px', // Prevent individual fields from becoming too wide
  };
  const formItemStyleNarrower = {
    ...formItemStyle,
    minWidth: '150px',
  };


  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar selectedSection={selectedSection} setSelectedSection={setSelectedSection} />
      <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: '#f9f9f9', overflowX: 'hidden' }}> {/* Prevent horizontal scroll on main content */}
        <TopBar title="Scope 3" showDropdown={false} />

        <Container maxWidth="lg" sx={{ mt: { xs: 2, md: 4 }, mb: 4 }}> {/* Use maxWidth on Container */}
          <Typography variant="h4" gutterBottom sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
            Business Travel
          </Typography>

          {/* The Paper component itself will be constrained by the Container */}
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
                fullWidth // This should be fine as it's on its own line
                sx={{ mb: 1 }}
                {...commonTextFieldProps}
                InputLabelProps={{ shrink: true }}
                size="medium" // Keep description a bit larger
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

              {/* Row 1: Date, Vehicle Type, Vehicle Miles */}
              {/* This Box will wrap its children if they don't fit */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2, alignItems: 'center' }}>
                <TextField
                  label="Date"
                  name="date"
                  type="date"
                  value={formValues.date}
                  sx={formItemStyle}
                  {...commonTextFieldProps}
                />
                <FormControl variant="outlined" sx={formItemStyle} size="small">
                  <InputLabel id="vehicle-type-label">Vehicle Type</InputLabel>
                  <Select
                    labelId="vehicle-type-label"
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
                  InputProps={{ inputProps: { min: 0 } }}
                  sx={formItemStyle}
                  {...commonTextFieldProps}
                />
              </Box>

              {/* Row 2: Emissions CO2, CH4, N2O */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2, alignItems: 'center' }}>
                <TextField
                  label="CO2 Emissions (kg)"
                  name="co2Kg"
                  type="number"
                  value={formValues.co2Kg}
                  InputProps={{ inputProps: { min: 0 } }}
                  sx={formItemStyleNarrower}
                  {...commonTextFieldProps}
                />
                <TextField
                  label="CH4 Emissions (g)"
                  name="ch4g"
                  type="number"
                  value={formValues.ch4g}
                  InputProps={{ inputProps: { min: 0 } }}
                  sx={formItemStyleNarrower}
                  {...commonTextFieldProps}
                />
                <TextField
                  label="N2O Emissions (g)"
                  name="n20g"
                  type="number"
                  value={formValues.n20g}
                  InputProps={{ inputProps: { min: 0 } }}
                  sx={formItemStyleNarrower}
                  {...commonTextFieldProps}
                />
              </Box>

              {/* Add Button */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 1 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAddRow}
                  sx={{ height: '40px', px: 3 }} // Adjusted height to match small TextFields
                >
                  Add Record
                </Button>
              </Box>
            </Box>
          </Paper>

          <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>
            Records
          </Typography>
          {/* TableContainer will handle horizontal scroll for the table if needed */}
          <TableContainer component={Paper} elevation={3} sx={{width: '100%', overflowX: 'auto'}}>
            <Table stickyHeader aria-label="business travel records table" sx={{minWidth: 900}}> {/* Set a minWidth for the table itself */}
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: '5%' }}>ID</TableCell>
                  <TableCell sx={{ width: '10%' }}>Source ID</TableCell>
                  <TableCell sx={{ width: '20%' }}>Description</TableCell>
                  <TableCell sx={{ width: '10%' }}>Date</TableCell>
                  <TableCell sx={{ width: '15%' }}>Vehicle Type</TableCell>
                  <TableCell sx={{ width: '10%', textAlign: 'right' }}>Miles</TableCell>
                  <TableCell sx={{ width: '7%', textAlign: 'right' }}>CO2 (kg)</TableCell>
                  <TableCell sx={{ width: '7%', textAlign: 'right' }}>CH4 (g)</TableCell>
                  <TableCell sx={{ width: '7%', textAlign: 'right' }}>N2O (g)</TableCell>
                  <TableCell sx={{ width: '9%', textAlign: 'center' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} sx={{ textAlign: 'center', py: 3 }}>
                      No records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => (
                    <TableRow hover key={row.id}>
                      <TableCell>{row.id}</TableCell>
                      <TableCell>{row.sourceId}</TableCell>
                      <TableCell>{row.description}</TableCell>
                      <TableCell>{new Date(row.date).toLocaleDateString()}</TableCell>
                      <TableCell>{row.vehicleType}</TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>{row.vehicleMiles}</TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>{row.co2Kg}</TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>{row.ch4g}</TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>{row.n20g}</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Button variant="outlined" color="secondary" size="small" onClick={() => handleClickOpen(row.id)}>
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 2 }}>
              <Button variant="outlined" disabled={page === 1} onClick={() => setPage((prev) => Math.max(prev - 1, 1))} sx={{ mr: 1 }}>
                Previous
              </Button>
              <Typography variant="body1" sx={{ alignSelf: 'center', mx: 2 }}>
                Page {page} of {totalPages}
              </Typography>
              <Button variant="outlined" disabled={page === totalPages} onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))} sx={{ ml: 1 }}>
                Next
              </Button>
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button variant="contained" color="primary" onClick={() => navigate('/Scope2S')}>
              Back to Scope 2
            </Button>
            <Button variant="contained" color="secondary" onClick={() => navigate('/Scope3W')}>
              Proceed to Waste
            </Button>
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
          <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }} variant="filled">
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default BusinessTravelPage;