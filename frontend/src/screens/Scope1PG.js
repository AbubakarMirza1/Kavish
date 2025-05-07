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
import useScope1Store from '../store/scope1Store'; // Assuming this is the correct store
import TopBar from '../Component/topbar.js';

const PurchasedGasesPage = () => {
  const navigate = useNavigate();
  const fixedUnitValue = "Cubic Meter";
  const initialFormValues = {
    description: '',
    date: '',
    gasType: '',
    purchasedAmount: '',
    unit: fixedUnitValue,
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

  useEffect(() => {
    fetchData();
  }, [page, limit]);

  const fetchData = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/scope1/purchased-gas?page=${page}&limit=${limit}`);
      const formattedData = res.data.records.map((item) => ({
        id: item.Id,
        sourceId: item.scopeTypeId || 'N/A',
        description: item.sourceDescription || 'N/A',
        date: item.date || new Date().toISOString(),
        gasType: item.Gas || 'Unknown',
        purchasedAmount: item.purchasedAmount,
        unit: item.unit?.unitName || 'Unknown',
      }));
      setRows(formattedData);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error('Error fetching purchased gases data:', error);
      setSnackbarMessage('Failed to fetch data. Please try again.');
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
    if (name === 'unit' && value !== fixedUnitValue) {
        return; // Prevent changing fixed unit
    }
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const { description, date, gasType, purchasedAmount, unit } = formValues;
    if (!description.trim() || !date || !gasType.trim() || !purchasedAmount /* || !unit - unit is fixed */) {
      setSnackbarMessage('Please fill in all fields.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return false;
    }
    if (description.replace(/\s+/g, '').length > descriptionCharLimit) {
      setSnackbarMessage(`Description cannot exceed ${descriptionCharLimit} characters.`);
      setSnackbarSeverity('error'); setOpenSnackbar(true); return false;
    }
    if (isNaN(parseFloat(purchasedAmount)) || parseFloat(purchasedAmount) <= 0) {
      setSnackbarMessage('Purchased Amount must be a number greater than zero.');
      setSnackbarSeverity('error'); setOpenSnackbar(true); return false;
    }
    return true;
  };

  const handleAddRow = async () => {
    if (!validateForm()) return;
    try {
      await axios.post('http://localhost:5000/api/scope1/purchased-gas', {
        sourceDescription: formValues.description,
        Gas: formValues.gasType,
        purchasedAmount: parseInt(formValues.purchasedAmount, 10),
        unit: formValues.unit, // Will be fixedUnitValue
        date: formValues.date,
      });
      setSnackbarMessage('Record added successfully!');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      setPage(1);
      fetchData();
      setFormValues(initialFormValues);
    } catch (error) {
      console.error('Error adding purchased gas record:', error);
      setSnackbarMessage(error.response?.data?.message || 'Failed to add the record.');
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
      await axios.delete(`http://localhost:5000/api/scope1/purchased-gas/${deleteId}`);
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
    size: "small",
  };

  const formItemStyle = {
    flexShrink: 1,
    flexBasis: 'auto',
    minWidth: '150px', // Adjusted for fewer fields per row
    maxWidth: '250px',
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar selectedSection={selectedSection} setSelectedSection={setSelectedSection} />
      <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: '#f9f9f9', overflowX: 'hidden' }}>
        <TopBar title="Scope 1" showDropdown={false} />

        <Container maxWidth="lg" sx={{ mt: { xs: 2, md: 4 }, mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
            Purchased Gases
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

              {/* Row for Date, Gas Type, Purchased Amount, Unit, Button */}
              {/* This Box will wrap its children if they don't fit */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                <TextField
                  label="Date"
                  name="date"
                  type="date"
                  value={formValues.date}
                  sx={formItemStyle}
                  {...commonTextFieldProps}
                />
                <TextField
                  label="Gas Type"
                  name="gasType"
                  value={formValues.gasType}
                  sx={formItemStyle}
                  {...commonTextFieldProps}
                />
                <TextField
                  label="Purchased Amount"
                  name="purchasedAmount"
                  type="number"
                  value={formValues.purchasedAmount}
                  InputProps={{ inputProps: { min: 0 } }}
                  sx={formItemStyle}
                  {...commonTextFieldProps}
                />
                <FormControl variant="outlined" sx={{...formItemStyle, minWidth: '120px'}} size="small"> {/* Adjusted minWidth */}
                  <InputLabel id="unit-label">Unit</InputLabel>
                  <Select
                    labelId="unit-label"
                    label="Unit"
                    name="unit"
                    value={formValues.unit} // Will be fixedUnitValue
                    // onChange={handleInputChange} // Not needed for disabled
                    disabled
                  >
                    <MenuItem key={fixedUnitValue} value={fixedUnitValue}>
                      {fixedUnitValue}
                    </MenuItem>
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAddRow}
                  sx={{ height: '40px', px: 3 }} // Match small field height
                >
                  Add
                </Button>
              </Box>
            </Box>
          </Paper>

          <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>
            Records
          </Typography>
          <TableContainer component={Paper} elevation={3} sx={{width: '100%', overflowX: 'auto'}}>
            <Table stickyHeader aria-label="purchased gases records table" sx={{minWidth: 800}}> {/* Adjusted minWidth */}
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: '10%' }}>ID</TableCell>
                  <TableCell sx={{ width: '10%' }}>Source ID</TableCell>
                  <TableCell sx={{ width: '25%' }}>Description</TableCell>
                  <TableCell sx={{ width: '10%' }}>Date</TableCell>
                  <TableCell sx={{ width: '15%' }}>Gas Type</TableCell>
                  <TableCell sx={{ width: '10%', textAlign: 'right' }}>Amount</TableCell>
                  <TableCell sx={{ width: '10%' }}>Unit</TableCell>
                  <TableCell sx={{ width: '10%', textAlign: 'center' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} sx={{ textAlign: 'center', py: 3 }}>
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
                      <TableCell>{row.gasType}</TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>{row.purchasedAmount}</TableCell>
                      <TableCell>{row.unit}</TableCell>
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
              <Button variant="outlined" disabled={page === totalPages || totalPages === 0} onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))} sx={{ ml: 1 }}>
                Next
              </Button>
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button variant="contained" color="primary" onClick={() => navigate('/Scope1FS')}>
              Back to Fire Suppression
            </Button>
            <Button variant="contained" color="secondary" onClick={() => navigate('/Scope2E')}>
              Proceed to Scope 2
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

export default PurchasedGasesPage;