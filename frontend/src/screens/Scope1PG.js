import React, { useState } from 'react';
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
import Sidebar from '../Component/sidebar.js'; // Import the Sidebar component
import useScope1Store from '../store/scope1Store'; // Import the Zustand store
import TopBar from '../Component/topbar.js'; // Import the Sidebar component

const initialData = [
  {
    id: 1,
    sourceId: '200',
    description: 'Example Gas Purchase',
    date: '2024-12-01',
    purchasedAmount: 500,
    unit: 'Kilograms',
    unitCapacity: '500',
  },
];

const PurchasedGasesPage = () => {
  const navigate = useNavigate();

  const [formValues, setFormValues] = useState({
    sourceId: '',
    description: '',
    date: '',
    purchasedAmount: '',
    unit: '',
    unitCapacity: '',
  });

  const [rows, setRows] = useState(initialData);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);

   // Get data from the store
   const mobileRows = useScope1Store((state) => state.mobileRows);
   const stationaryCombustionRows = useScope1Store((state) => state.stationaryCombustionRows);
   const unitRows = useScope1Store((state) => state.unitRows);
 
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddRow = () => {
    if (Object.values(formValues).some((value) => value === '')) {
      setOpenSnackbar(true);
      return;
    }
    setRows((prev) => [...prev, { id: prev.length + 1, ...formValues }]);
    setFormValues({
      sourceId: '',
      description: '',
      date: '',
      purchasedAmount: '',
      unit: '',
      unitCapacity: '',
    });
  };

  const handleClickOpen = (id) => {
    setOpenDialog(true);
    setDeleteId(id);
  };

  const handleClose = () => {
    setOpenDialog(false);
    setOpenSnackbar(false);
  };

  const handleDeleteRow = () => {
    setRows((prev) => prev.filter((row) => row.id !== deleteId));
    setOpenDialog(false);
  };


  const unitOptions = ['Liters', 'Kilograms', 'Cubic meters'];

  return (
      <Box sx={{ display: 'flex' }}>
        < Sidebar />

        {/* Main Content */}
        <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: '#f9f9f9' }}>
        <TopBar 
                title="Scope 1" 
                showDropdown={false}
            />

          <Container sx={{ mt: 10 }}>
            <Typography variant="h4" gutterBottom>
              Purchased Gases
            </Typography>

            {/* Form */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6">Add New Record</Typography>
              <Box
                component="form"
                sx={{
                  display: 'flex',
                  gap: 2,
                  mt: 2,
                }}
              >
                <TextField
                  label="Source ID"
                  name="sourceId"
                  value={formValues.sourceId}
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
                  label="Purchased Amount"
                  name="purchasedAmount"
                  type="number"
                  value={formValues.purchasedAmount}
                  onChange={handleInputChange}
                  variant="outlined"
                />
                <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                  <InputLabel>Unit</InputLabel>
                  <Select
                    name="unit"
                    value={formValues.unit}
                    onChange={handleInputChange}
                    label="Unit"
                  >
                    {unitOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
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
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Source ID</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Purchased Amount</TableCell>
                    <TableCell>Unit</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.id}</TableCell>
                      <TableCell>{row.sourceId}</TableCell>
                      <TableCell>{row.date}</TableCell>
                      <TableCell>{row.purchasedAmount}</TableCell>
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
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/Scope1FS')}
              >
                Back to Fire Suppression
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => navigate('/Scope2E')}
              >
                Proceed to Scope 2
              </Button>
            </Box>
          </Container>
        </Box>

        {/* Confirmation Dialog */}
        <Dialog open={openDialog} onClose={handleClose}>
          <DialogTitle>{"Confirm Deletion"}</DialogTitle>
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
            Please fill in all fields before adding a record.
          </Alert>
        </Snackbar>
      </Box>
  );
};

export default PurchasedGasesPage;
