import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
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
  IconButton,
  Avatar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  HelpOutline as HelpIcon,
  AccountCircle as ProfileIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Component/sidebar.js'; // Import the Sidebar component

const initialData = [
  {
    id: 1,
    sourceId: '200',
    description: 'Example Electricity Usage',
    date: '2024-12-01',
    area: 1000,
    electricityConsumed: 500,
    co2Emissions: 200,
    ch4Emissions: 10,
    n2oEmissions: 5,
  },
];

const ElectricityPage = () => {
  const navigate = useNavigate(); // Use React Router's useNavigate

  const [formValues, setFormValues] = useState({
    sourceId: '',
    description: '',
    date: '',
    area: '',
    electricityConsumed: '',
    co2Emissions: '',
    ch4Emissions: '',
    n2oEmissions: '',
  });

  const [rows, setRows] = useState(initialData);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);

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
      area: '',
      electricityConsumed: '',
      co2Emissions: '',
      ch4Emissions: '',
      n2oEmissions: '',
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


  return (
      <Box sx={{ display: 'flex' }}>
        <Sidebar />

        {/* Main Content */}
        <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: '#f9f9f9' }}>
          <AppBar position="fixed" color="transparent" elevation={0} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Toolbar>
              <Typography variant="h6" sx={{ flexGrow: 1, color: '#0D7377' }}></Typography>
              <IconButton color="inherit">
                <NotificationsIcon />
              </IconButton>
              <IconButton color="inherit">
                <HelpIcon />
              </IconButton>
              <IconButton color="inherit">
                <ProfileIcon />
              </IconButton>
              <Avatar sx={{ ml: 2, bgcolor: '#0D7377' }}>JD</Avatar>
            </Toolbar>
          </AppBar>

          <Typography variant="h2" gutterBottom sx={{ mt: 8 }}>
            Scope 2
          </Typography>

          <Container sx={{ mt: 10 }}>
            <Typography variant="h4" gutterBottom>
              Electricity
            </Typography>

            {/* Form */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6">Add New Record</Typography>
              <Box component="form" sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <TextField label="Source ID" name="sourceId" value={formValues.sourceId} onChange={handleInputChange} variant="outlined" />
                <TextField label="Description" name="description" value={formValues.description} onChange={handleInputChange} variant="outlined" />
                <TextField
                  label="Date"
                  name="date"
                  type="date"
                  value={formValues.date}
                  onChange={handleInputChange}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
                <TextField label="Area (sq ft)" name="area" type="number" value={formValues.area} onChange={handleInputChange} variant="outlined" />
                <TextField
                  label="Electricity Consumed (units)"
                  name="electricityConsumed"
                  type="number"
                  value={formValues.electricityConsumed}
                  onChange={handleInputChange}
                  variant="outlined"
                />
                <TextField label="CO2 Emissions (kgs)" name="co2Emissions" type="number" value={formValues.co2Emissions} onChange={handleInputChange} variant="outlined" />
                <TextField label="CH4 Emissions (kgs)" name="ch4Emissions" type="number" value={formValues.ch4Emissions} onChange={handleInputChange} variant="outlined" />
                <TextField label="N2O Emissions (kgs)" name="n2oEmissions" type="number" value={formValues.n2oEmissions} onChange={handleInputChange} variant="outlined" />
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
                    <TableCell>Description</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Area (sq ft)</TableCell>
                    <TableCell>Electricity Consumed (units)</TableCell>
                    <TableCell>CO2 Emissions (kgs)</TableCell>
                    <TableCell>CH4 Emissions (kgs)</TableCell>
                    <TableCell>N2O Emissions (kgs)</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.id}</TableCell>
                      <TableCell>{row.sourceId}</TableCell>
                      <TableCell>{row.description}</TableCell>
                      <TableCell>{row.date}</TableCell>
                      <TableCell>{row.area}</TableCell>
                      <TableCell>{row.electricityConsumed}</TableCell>
                      <TableCell>{row.co2Emissions}</TableCell>
                      <TableCell>{row.ch4Emissions}</TableCell>
                      <TableCell>{row.n2oEmissions}</TableCell>
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
      </Box>
  );
};

export default ElectricityPage;
