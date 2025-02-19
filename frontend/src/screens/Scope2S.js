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
  Alert 
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
    description: 'Example Steam Usage', 
    sourceArea: 1000, 
    fuelType: 'Natural Gas', 
    boilerEfficiency: 80, 
    steamPurchased: 500, 
    co2EmissionFactor: 0.5, 
    ch4EmissionFactor: 0.1, 
    n2oEmissionFactor: 0.05, 
    co2Emissions: 250, 
    ch4Emissions: 50, 
    n2oEmissions: 25 
  }
];

const SteamPage = () => {
  const navigate = useNavigate(); // Initialize navigate

  const [formValues, setFormValues] = useState({
    sourceId: '',
    description: '',
    sourceArea: '',
    fuelType: '',
    boilerEfficiency: '',
    steamPurchased: '',
    co2EmissionFactor: '',
    ch4EmissionFactor: '',
    n2oEmissionFactor: '',
    co2Emissions: '',
    ch4Emissions: '',
    n2oEmissions: ''
  });

  const [rows, setRows] = useState(initialData);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  const handleAddRow = () => {
    if (Object.values(formValues).some(value => value === '')) {
      setOpenSnackbar(true);
      return;
    }
    setRows(prev => [...prev, { id: prev.length + 1, ...formValues }]);
    setFormValues({
      sourceId: '',
      description: '',
      sourceArea: '',
      fuelType: '',
      boilerEfficiency: '',
      steamPurchased: '',
      co2EmissionFactor: '',
      ch4EmissionFactor: '',
      n2oEmissionFactor: '',
      co2Emissions: '',
      ch4Emissions: '',
      n2oEmissions: ''
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
    setRows(prev => prev.filter(row => row.id !== deleteId));
    setOpenDialog(false);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />

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
            <IconButton color="inherit">
              <ProfileIcon />
            </IconButton>
            <Avatar sx={{ ml: 2, bgcolor: '#0D7377' }}>JD</Avatar>
          </Toolbar>
        </AppBar>

        {/* Rest of the content */}
        <Typography variant="h2" gutterBottom sx={{ mt: 8, color: '#000000' }}>
          Scope 2
        </Typography>

        <Container sx={{ mt: 10 }}>
          <Typography variant="h4" gutterBottom sx={{ color: '#000000' }}>
            Steam
          </Typography>

          {/* Form */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ color: '#000000' }}>Add New Record</Typography>
            <Box component="form" sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
              {/* Form fields */}
              <TextField
                label="Source ID"
                name="sourceId"
                value={formValues.sourceId}
                onChange={handleInputChange}
                variant="outlined"
                sx={{ backgroundColor: '#FFFFFF', color: '#000000' }}
              />
              <TextField
                label="Description"
                name="description"
                value={formValues.description}
                onChange={handleInputChange}
                variant="outlined"
                sx={{ backgroundColor: '#FFFFFF', color: '#000000' }}
              />
              <TextField
                label="Source Area (Kms)"
                name="sourceArea"
                type="number"
                value={formValues.sourceArea}
                onChange={handleInputChange}
                variant="outlined"
                sx={{ backgroundColor: '#FFFFFF', color: '#000000' }}
              />
              <FormControl variant="outlined" sx={{ minWidth: 150 }}>
                <InputLabel sx={{ color: '#000000' }}>Fuel Type</InputLabel>
                <Select
                  label="Fuel Type"
                  name="fuelType"
                  value={formValues.fuelType}
                  onChange={handleInputChange}
                  sx={{ backgroundColor: '#FFFFFF', color: '#000000' }}
                >
                  <MenuItem value="Natural Gas" sx={{ color: '#000000' }}>Natural Gas</MenuItem>
                  <MenuItem value="Coal" sx={{ color: '#000000' }}>Coal</MenuItem>
                  <MenuItem value="Oil" sx={{ color: '#000000' }}>Oil</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Boiler Efficiency (%)"
                name="boilerEfficiency"
                type="number"
                value={formValues.boilerEfficiency}
                onChange={handleInputChange}
                variant="outlined"
                sx={{ backgroundColor: '#FFFFFF', color: '#000000' }}
              />
              <TextField
                label="Steam Purchased (KWH)"
                name="steamPurchased"
                type="number"
                value={formValues.steamPurchased}
                onChange={handleInputChange}
                variant="outlined"
                sx={{ backgroundColor: '#FFFFFF', color: '#000000' }}
              />
              <TextField
                label="CO2 emissions (Kg)"
                name="co2Emissions"
                type="number"
                value={formValues.co2Emissions}
                onChange={handleInputChange}
                variant="outlined"
                sx={{ backgroundColor: '#FFFFFF', color: '#000000' }}
              />
              <TextField
                label="CH4 emissions (Kg)"
                name="ch4Emissions"
                type="number"
                value={formValues.ch4Emissions}
                onChange={handleInputChange}
                variant="outlined"
                sx={{ backgroundColor: '#FFFFFF', color: '#000000' }}
              />
              <TextField
                label="N2O emissions (Kg)"
                name="n2oEmissions"
                type="number"
                value={formValues.n2oEmissions}
                onChange={handleInputChange}
                variant="outlined"
                sx={{ backgroundColor: '#FFFFFF', color: '#000000' }}
              />
              <Button variant="contained" color="primary" onClick={handleAddRow}>
                Add
              </Button>
            </Box>
          </Box>

          {/* Table */}
          <Typography variant="h6" sx={{ color: '#000000' }}>Records</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: '#000000' }}>ID</TableCell>
                  <TableCell sx={{ color: '#000000' }}>Source ID</TableCell>
                  <TableCell sx={{ color: '#000000' }}>Description</TableCell>
                  <TableCell sx={{ color: '#000000' }}>Source Area (Kms)</TableCell>
                  <TableCell sx={{ color: '#000000' }}>Fuel Type</TableCell>
                  <TableCell sx={{ color: '#000000' }}>Boiler Efficiency (%)</TableCell>
                  <TableCell sx={{ color: '#000000' }}>Steam Purchased (KWH)</TableCell>
                  <TableCell sx={{ color: '#000000' }}>CO2 emissions (Kg)</TableCell>
                  <TableCell sx={{ color: '#000000' }}>CH4 emissions (Kg)</TableCell>
                  <TableCell sx={{ color: '#000000' }}>N2O emissions (Kg)</TableCell>
                  <TableCell sx={{ color: '#000000' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell sx={{ color: '#000000' }}>{row.id}</TableCell>
                    <TableCell sx={{ color: '#000000' }}>{row.sourceId}</TableCell>
                    <TableCell sx={{ color: '#000000' }}>{row.description}</TableCell>
                    <TableCell sx={{ color: '#000000' }}>{row.sourceArea}</TableCell>
                    <TableCell sx={{ color: '#000000' }}>{row.fuelType}</TableCell>
                    <TableCell sx={{ color: '#000000' }}>{row.boilerEfficiency}</TableCell>
                    <TableCell sx={{ color: '#000000' }}>{row.steamPurchased}</TableCell>
                    <TableCell sx={{ color: '#000000' }}>{row.co2Emissions}</TableCell>
                    <TableCell sx={{ color: '#000000' }}>{row.ch4Emissions}</TableCell>
                    <TableCell sx={{ color: '#000000' }}>{row.n2oEmissions}</TableCell>
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
              onClick={() => navigate('/Scope2E')}
            >
              Back to Electricity
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => navigate('/Scope3BT')}
            >
              Proceed to Scope 3
            </Button>
          </Box>
        </Container>

        {/* Confirmation Dialog */}
        <Dialog open={openDialog} onClose={handleClose}>
          <DialogTitle sx={{ color: '#000000' }}>Confirm Deletion</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ color: '#000000' }}>
              Are you sure you want to delete this record?
            </DialogContentText>
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

export default SteamPage;