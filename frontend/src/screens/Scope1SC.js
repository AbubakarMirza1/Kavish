import React, { useState, useEffect } from 'react';
import {  AppBar,  Toolbar,  Box,  Container,  TextField,  Button,  Table,  TableBody,  TableCell,  TableContainer,  TableHead,  TableRow,  Paper,  IconButton,  Avatar,  Dialog,  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
  Typography
} from '@mui/material';
import { Notifications as NotificationsIcon, HelpOutline as HelpIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../Component/sidebar.js'; // Import the Sidebar component

const Scope1SC = () => {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({ sourceId: '', description: '', date: '', fuelCombusted: '', quantity: '', units: '' });
  const [rows, setRows] = useState([]);
  const [selectedSection, setSelectedSection] = useState('dashboard');
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/emissions/stationary');
      setRows(res.data);
    } catch (error) {
      console.error('Error fetching stationary data:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddRow = async () => {
    if (Object.values(formValues).some((value) => value === '')) {
      setOpenSnackbar(true);
      return;
    }

    try {
      const newRecordData = {
        sourceId: formValues.sourceId,
        description: formValues.description,
        date: formValues.date,
        fuelCombusted: formValues.fuelCombusted,
        quantity: formValues.quantity,
        units: formValues.units
      };
      const res = await axios.post('http://localhost:5000/api/emissions/stationary', newRecordData);
      setRows((prev) => [...prev, res.data]);
      setFormValues({ sourceId: '', description: '', date: '', fuelCombusted: '', quantity: '', units: '' });
    } catch (error) {
      console.error('Error adding row:', error);
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
      await axios.delete(`http://localhost:5000/api/emissions/stationary/${deleteId}`);
      setRows((prev) => prev.filter((row) => row.id !== deleteId));
      setOpenDialog(false);
    } catch (error) {
      console.error('Error deleting row:', error);
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Sidebar */}
      <Sidebar selectedSection={selectedSection} setSelectedSection={setSelectedSection} />

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: '#f9f9f9' }}>
        {/* Top Bar */}
        <AppBar position="fixed" color="transparent" elevation={0} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1, color: '#0D7377' }}></Typography>
            <IconButton color="inherit">
              <NotificationsIcon />
            </IconButton>
            <IconButton color="inherit">
              <HelpIcon />
            </IconButton>
            <Avatar sx={{ ml: 2, bgcolor: '#0D7377' }}>JD</Avatar>
          </Toolbar>
        </AppBar>

        {/* Rest of the content */}
        <Typography variant="h2" gutterBottom sx={{ mt: 8 }}>
          Scope 1
        </Typography>

        <Container sx={{ mt: 10 }}>
          <Typography variant="h4" gutterBottom>
            Stationary Combustion
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
                label="Fuel Combusted"
                name="fuelCombusted"
                value={formValues.fuelCombusted}
                onChange={handleInputChange}
                variant="outlined"
              />
              <TextField
                label="Quantity"
                name="quantity"
                type="number"
                value={formValues.quantity}
                onChange={handleInputChange}
                variant="outlined"
              />
              <TextField
                label="Units"
                name="units"
                value={formValues.units}
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
                  <TableCell>Fuel Combusted</TableCell>
                  <TableCell>Quantity</TableCell>
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
                    <TableCell>{row.fuelCombusted}</TableCell>
                    <TableCell>{row.quantity}</TableCell>
                    <TableCell>{row.units}</TableCell>
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
              onClick={() => navigate('/dashboard')}
            >
              Back to Dashboard
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => navigate('/Scope1MS')}
            >
              Proceed to Mobile Sources
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
            Please fill in all fields before adding a record.
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default Scope1SC;