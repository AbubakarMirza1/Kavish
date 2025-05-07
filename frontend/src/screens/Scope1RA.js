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
import useScope1Store from '../store/scope1Store';
import Sidebar from '../Component/sidebar.js';
import TopBar from '../Component/topbar.js';

const RefrigerationAndACPage = () => {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({
    description: '',
    gas: '',
    equipmentTypeId: '', // Stores the name of the equipment type
    gwp: '',
    unitId: 'Cubic Meter', // Default and only valid value for this page
    co2eKg: '',
    date: '',
  });
  const [rows, setRows] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedSection, setSelectedSection] = useState('dashboard'); // For Sidebar highlighting

  // Get data from the store
  const refrigerationRows = useScope1Store((state) => state.refrigerationRows);
  // const unitRows = useScope1Store((state) => state.unitRows); // Not directly used for dropdown, as unit is fixed

  // Filter active items
  // const activeUnits = unitRows.filter((row) => row.active); // Not strictly needed if unit is fixed
  const activeRefrigerationOptions = refrigerationRows.filter((row) => row.active);

  useEffect(() => {
    fetchData();
  }, [page]);

  const fetchData = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/scope1/refrigeration?page=${page}&limit=${limit}`);
      const formattedData = res.data.records.map((item) => ({
        id: item.id,
        sourceId: item.scopeTypeId,
        description: item.sourceDescription || 'N/A',
        date: item.date || new Date().toISOString(),
        gas: item.gas,
        equipmentType: item.equipmentType?.typeName || 'Unknown',
        gwp: item.gwp,
        unit: item.unit?.unitName || 'Unknown',
        co2eKg: item.co2eKg,
      }));
      setRows(formattedData);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error('Error fetching Refrigeration & AC data:', error);
      setSnackbarMessage('Failed to fetch data. Please try again.');
      setOpenSnackbar(true);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'description') {
      const trimmedValue = value.replace(/\s+/g, '');
      if (trimmedValue.length > 50) { // Increased limit for description
        setSnackbarMessage('Description cannot exceed 50 characters (excluding spaces).');
        setOpenSnackbar(true);
        return; 
      }
    }
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddRow = async () => {
    if (
      !formValues.description ||
      !formValues.date ||
      !formValues.gas ||
      !formValues.equipmentTypeId ||
      !formValues.gwp ||
      !formValues.unitId || // Though fixed, still check
      !formValues.co2eKg
    ) {
      setSnackbarMessage('Please fill in all fields before adding a record.');
      setOpenSnackbar(true);
      return;
    }

    if (formValues.description.replace(/\s+/g, '').length > 50) {
        setSnackbarMessage('Description cannot exceed 50 characters (excluding spaces).');
        setOpenSnackbar(true);
        return;
    }

    if (parseInt(formValues.gwp, 10) <= 0) {
      setSnackbarMessage('Gas GWP must be greater than zero.');
      setOpenSnackbar(true);
      return;
    }
    if (parseInt(formValues.co2eKg, 10) <= 0) {
      setSnackbarMessage('CO2 Equivalent Emissions must be greater than zero.');
      setOpenSnackbar(true);
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/scope1/refrigeration', {
        sourceDescription: formValues.description,
        equipmentType: formValues.equipmentTypeId, // Sends the name
        gas: formValues.gas,
        gwp: parseInt(formValues.gwp, 10),
        unit: formValues.unitId,
        co2eKg: parseInt(formValues.co2eKg, 10),
        date: formValues.date,
      });
      setPage(1); // Reset to first page
      fetchData(); 
      setFormValues({
        description: '',
        gas: '',
        equipmentTypeId: '',
        gwp: '',
        unitId: 'Cubic Meter', 
        co2eKg: '',
        date: '',
      });
      setSnackbarMessage('Record added successfully!');
      setOpenSnackbar(true); // Use severity="success" for this if you have different alert types
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
    setOpenSnackbar(false); // Close snackbar on any action
  };

  const handleDeleteRow = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/scope1/refrigeration/${deleteId}`);
      fetchData(); 
      setOpenDialog(false);
      setSnackbarMessage('Record deleted successfully!');
      setOpenSnackbar(true); // Use severity="success" for this
    } catch (error) {
      console.error('Error deleting record:', error);
      setSnackbarMessage('Failed to delete the record. Please try again.');
      setOpenSnackbar(true);
    }
  };

  const validUnit = "Cubic Meter"; // Only valid unit for this page

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar selectedSection={selectedSection} setSelectedSection={setSelectedSection} />
      <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: '#f9f9f9' }}>
        <TopBar title="Scope 1" showDropdown={false} />
        <Container sx={{ mt: 10 }}>
          <Typography variant="h4" gutterBottom>
            Refrigeration and AC
          </Typography>
          
          <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
            <Box sx={{ mb: 2 }}> {/* Adjusted margin */}
              <Typography variant="h6">Add New Record</Typography>
              <Box component="form" sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
                <TextField
                  label="Description"
                  name="description"
                  value={formValues.description}
                  onChange={handleInputChange}
                  variant="outlined"
                  multiline
                  minRows={2} // Adjusted minRows
                  fullWidth
                  sx={{ flex: '1 1 100%', mb: 1 }} // Ensure it takes full width and has some bottom margin
                />
                {formValues.description.replace(/\s+/g, '').length > 0 && (
                  <Typography 
                    variant="caption" 
                    color={formValues.description.replace(/\s+/g, '').length > 50 ? 'error' : 'textSecondary'}
                    sx={{ width: '100%', mt: -2, mb: 1, textAlign: 'right' }} // Positioned better
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
                  sx={{ flex: '1 1 calc(25% - 16px)' }} // Adjust flex basis for 3 items per row
                />
                <TextField
                  label="Gas"
                  name="gas"
                  value={formValues.gas}
                  onChange={handleInputChange}
                  variant="outlined"
                  sx={{ flex: '1 1 calc(25% - 16px)' }}
                />
                <FormControl variant="outlined" sx={{ flex: '1 1 calc(25% - 16px)' }}>
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
                  sx={{ flex: '1 1 calc(25% - 16px)' }}
                  InputProps={{ inputProps: { min: 0 } }}
                />
                <FormControl variant="outlined" sx={{ flex: '1 1 calc(25% - 16px)' }}>
                  <InputLabel>Unit</InputLabel>
                  <Select
                    name="unitId"
                    value={formValues.unitId}
                    onChange={handleInputChange}
                    label="Unit"
                    disabled // Since it's fixed
                  >
                    <MenuItem key={validUnit} value={validUnit}>
                      {validUnit}
                    </MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="CO2 Equivalent Emissions (kg)"
                  name="co2eKg"
                  type="number"
                  value={formValues.co2eKg}
                  onChange={handleInputChange}
                  variant="outlined"
                  sx={{ flex: '1 1 calc(25% - 16px)' }}
                  InputProps={{ inputProps: { min: 0 } }}
                />
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleAddRow}
                  sx={{ alignSelf: 'flex', height: '56px' }} // Align with TextField height
                >
                  Add Record
                </Button>
              </Box>
            </Box>
          </Paper>

          <Typography variant="h6" sx={{mt: 3}}>Records</Typography>
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
              disabled={page === totalPages || totalPages === 0} // Disable if no pages
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            >
              Next
            </Button>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button variant="contained" color="primary" onClick={() => navigate('/Scope1MS')}>
              Back to Mobile Sources
            </Button>
            <Button variant="contained" color="secondary" onClick={() => navigate('/Scope1FS')}>
              Proceed to Fire Suppression
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
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }} // Better positioning
        >
          <Alert 
            onClose={handleClose} 
            severity={snackbarMessage.includes("successfully") ? "success" : "error"} // Dynamic severity
            sx={{ width: '100%' }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default RefrigerationAndACPage;