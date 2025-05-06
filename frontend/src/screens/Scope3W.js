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

const WastePage = () => {
  const navigate = useNavigate();
  const fixedUnitValue = "Kilogram"; // Define the fixed unit

  // Ensure initialFormValues always has the fixed unit
  const initialFormValues = {
    description: '',
    date: '',
    wasteType: '',
    disposalMethod: '',
    weight: '',
    unit: fixedUnitValue, // CRITICAL: Unit is fixed here
    co2eKg: '',
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

  const wasteTypeRows = useScope3Store((state) => state.wasteMaterials);
  const activeWasteTypes = wasteTypeRows.filter((row) => row.active);

  useEffect(() => {
    fetchData();
  }, [page, limit]);

  const fetchData = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/scope3/waste?page=${page}&limit=${limit}`);
      const formattedData = res.data.records.map((item) => ({
        id: item.id,
        sourceId: item.scopeTypeId || 'N/A',
        description: item.sourceDescription || 'N/A',
        date: item.date || new Date().toISOString(),
        wasteType: item.wasteType?.typeName || 'Unknown',
        disposalMethod: item.disposalMethod || 'N/A',
        weight: item.weight,
        unit: item.unit?.unitName || 'Unknown',
        co2eKg: item.co2eKg,
      }));
      setRows(formattedData);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error('Error fetching waste data:', error);
      setSnackbarMessage('Failed to fetch waste data. Please try again.');
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
    // Prevent unit from being changed from the fixed value if the Select was somehow enabled
    if (name === 'unit' && value !== fixedUnitValue) {
        // This case should ideally not happen with a disabled select
        setFormValues((prev) => ({ ...prev, [name]: fixedUnitValue }));
        return;
    }
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    // Destructure unit but it's mainly for completeness; its value is fixed.
    const { description, date, wasteType, disposalMethod, weight, unit, co2eKg } = formValues;

    // Check each field individually for more specific feedback (optional, but good practice)
    if (!description.trim()) { setSnackbarMessage('Description is required.'); setSnackbarSeverity('error'); setOpenSnackbar(true); return false; }
    if (!date) { setSnackbarMessage('Date is required.'); setSnackbarSeverity('error'); setOpenSnackbar(true); return false; }
    if (!wasteType) { setSnackbarMessage('Waste Type is required.'); setSnackbarSeverity('error'); setOpenSnackbar(true); return false; }
    if (!disposalMethod.trim()) { setSnackbarMessage('Disposal Method is required.'); setSnackbarSeverity('error'); setOpenSnackbar(true); return false; }
    if (!weight) { setSnackbarMessage('Weight is required.'); setSnackbarSeverity('error'); setOpenSnackbar(true); return false; }
    // No need to check !unit because it's fixed and initialized.
    // if (!unit) { setSnackbarMessage('Unit is required.'); setSnackbarSeverity('error'); setOpenSnackbar(true); return false; }
    if (!co2eKg) { setSnackbarMessage('CO2e Emissions (kg) is required.'); setSnackbarSeverity('error'); setOpenSnackbar(true); return false; }


    if (description.replace(/\s+/g, '').length > descriptionCharLimit) {
      setSnackbarMessage(`Description cannot exceed ${descriptionCharLimit} characters.`);
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return false;
    }
    if (isNaN(parseFloat(weight)) || parseFloat(weight) <= 0) {
      setSnackbarMessage('Weight must be a number greater than zero.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return false;
    }
    if (isNaN(parseFloat(co2eKg)) || parseFloat(co2eKg) < 0) {
      setSnackbarMessage('CO2e Emissions must be a non-negative number.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return false;
    }
    return true;
  };

  const handleAddRow = async () => {
    // Ensure formValues.unit is the fixed value before validation, though it should be by design
    const currentFormValues = { ...formValues, unit: fixedUnitValue };
    setFormValues(currentFormValues); // Update state just in case, then validate with this

    // Validate with the potentially corrected form values
    // It's better to validate the state that will be submitted
    // So, the setFormValues above might be redundant if validateForm uses the state directly.
    // Let's ensure validateForm uses the most current state.

    if (!validateForm()) { // validateForm will use the current `formValues` from state
        return;
    }

    try {
      await axios.post('http://localhost:5000/api/scope3/waste', {
        sourceDescription: formValues.description,
        wasteType: formValues.wasteType,
        disposalMethod: formValues.disposalMethod,
        weight: parseFloat(formValues.weight),
        unit: formValues.unit, // This will be fixedUnitValue ("Kilogram")
        co2eKg: parseFloat(formValues.co2eKg),
        date: formValues.date,
      });
      setSnackbarMessage('Waste record added successfully!');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      setPage(1);
      fetchData();
      setFormValues(initialFormValues); // This correctly resets unit to fixedUnitValue
    } catch (error) {
      console.error('Error adding waste record:', error);
      setSnackbarMessage(error.response?.data?.message || 'Failed to add the record.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    }
  };

  // ... (handleClickOpen, handleCloseDialog, handleCloseSnackbar, handleDeleteRow remain the same)
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
      await axios.delete(`http://localhost:5000/api/scope3/waste/${deleteId}`);
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
    size: "small",
  };

  const formItemStyle = {
    flexShrink: 1,
    flexBasis: 'auto',
    minWidth: '180px',
    maxWidth: '280px',
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar selectedSection={selectedSection} setSelectedSection={setSelectedSection} />
      <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: '#f9f9f9', overflowX: 'hidden' }}>
        <TopBar title="Scope 3" showDropdown={false} />

        <Container maxWidth="lg" sx={{ mt: { xs: 2, md: 4 }, mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
            Waste Management
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
                size="medium"
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
                <TextField
                  label="Date"
                  name="date"
                  type="date"
                  value={formValues.date}
                  sx={formItemStyle}
                  {...commonTextFieldProps}
                />
                <FormControl variant="outlined" sx={formItemStyle} size="small">
                  <InputLabel id="waste-type-label">Waste Type</InputLabel>
                  <Select
                    labelId="waste-type-label"
                    label="Waste Type"
                    name="wasteType"
                    value={formValues.wasteType}
                    onChange={handleInputChange}
                  >
                    {activeWasteTypes.map((type) => (
                      <MenuItem key={type.id} value={type.name}>
                        {type.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label="Disposal Method"
                  name="disposalMethod"
                  value={formValues.disposalMethod}
                  sx={formItemStyle}
                  {...commonTextFieldProps}
                />
              </Box>

              {/* Row 2 */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2, alignItems: 'center' }}>
                <TextField
                  label="Weight"
                  name="weight"
                  type="number"
                  value={formValues.weight}
                  InputProps={{ inputProps: { min: 0 } }}
                  sx={formItemStyle}
                  {...commonTextFieldProps}
                />
                <FormControl variant="outlined" sx={formItemStyle} size="small">
                  <InputLabel id="unit-label">Unit</InputLabel>
                  <Select
                    labelId="unit-label"
                    label="Unit"
                    name="unit"
                    value={formValues.unit} // This will be fixedUnitValue
                    // onChange={handleInputChange} // Not strictly needed for a disabled field
                    disabled // Crucial: Disable the dropdown
                  >
                    <MenuItem key={fixedUnitValue} value={fixedUnitValue}>
                      {fixedUnitValue}
                    </MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="CO2e Emissions (kg)"
                  name="co2eKg"
                  type="number"
                  value={formValues.co2eKg}
                  InputProps={{ inputProps: { min: 0 } }}
                  sx={formItemStyle}
                  {...commonTextFieldProps}
                />
              </Box>

              {/* Add Button */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 1 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAddRow}
                  sx={{ height: '40px', px: 3 }}
                >
                  Add Record
                </Button>
              </Box>
            </Box>
          </Paper>

          {/* ... (Table and other components remain the same) ... */}
          <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>
            Records
          </Typography>
          <TableContainer component={Paper} elevation={3} sx={{width: '100%', overflowX: 'auto'}}>
            <Table stickyHeader aria-label="waste records table" sx={{minWidth: 1000}}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: '5%' }}>ID</TableCell>
                  <TableCell sx={{ width: '8%' }}>Source ID</TableCell>
                  <TableCell sx={{ width: '20%' }}>Description</TableCell>
                  <TableCell sx={{ width: '10%' }}>Date</TableCell>
                  <TableCell sx={{ width: '15%' }}>Waste Type</TableCell>
                  <TableCell sx={{ width: '15%' }}>Disposal Method</TableCell>
                  <TableCell sx={{ width: '7%', textAlign: 'right' }}>Weight</TableCell>
                  <TableCell sx={{ width: '7%' }}>Unit</TableCell>
                  <TableCell sx={{ width: '10%', textAlign: 'right' }}>CO2e (kg)</TableCell>
                  <TableCell sx={{ width: '8%', textAlign: 'center' }}>Action</TableCell>
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
                      <TableCell>{row.wasteType}</TableCell>
                      <TableCell>{row.disposalMethod}</TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>{row.weight}</TableCell>
                      <TableCell>{row.unit}</TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>{row.co2eKg}</TableCell>
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
            <Button variant="contained" color="primary" onClick={() => navigate('/Scope3BT')}>
              Back to Business Travel
            </Button>
            <Button variant="contained" color="secondary" onClick={() => navigate('/dashboard')}>
              View Dashboard
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

export default WastePage;