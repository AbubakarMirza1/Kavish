import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
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
  CssBaseline,
  IconButton,
  Avatar,
  createTheme,
  ThemeProvider,
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
import {
  Dashboard as DashboardIcon,
  QueryStats as EmissionsIcon,
  Delete as WasteIcon,
  CloudUpload as DataEntryIcon,
  Assessment as ReportsIcon,
  Analytics as AnalyticsIcon,
  Notifications as NotificationsIcon,
  HelpOutline as HelpIcon,
  AccountCircle as ProfileIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import useScope1Store from '../store/scope1Store'; // Import Zustand store

const initialData = [
  { id: 1, sourceId: '001', description: 'Refrigeration A', gas: 'R134a', equipmentType: 'Stand-Alone Commercial', gasGWP: 1430, unitCharge: 10, co2Emissions: 14.3 },
  { id: 2, sourceId: '002', description: 'Refrigeration B', gas: 'R410A', equipmentType: 'Medium/Large Commercial', gasGWP: 2088, unitCharge: 15, co2Emissions: 31.32 },
];

const RefrigerationAndACPage = () => {
  const navigate = useNavigate();

  const [formValues, setFormValues] = useState({
    sourceId: '',
    description: '',
    gas: '',
    equipmentType: '',
    gasGWP: '',
    unitCharge: '',
    co2Emissions: '',
  });

  const [rows, setRows] = useState(initialData);
  const [selectedSection, setSelectedSection] = useState('dashboard');
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // Import refrigerationRows from the store
  const refrigerationRows = useScope1Store((state) => state.refrigerationRows);

  // Filter only active refrigeration types for the dropdown
  const activeRefrigerationOptions = refrigerationRows.filter((row) => row.active);

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
      gas: '',
      equipmentType: '',
      gasGWP: '',
      unitCharge: '',
      co2Emissions: '',
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

  const handleSectionNavigation = (section) => {
    setSelectedSection(section);
    const routes = {
      dashboard: '/dashboard',
      emissions: '/GHGEmissions',
      waste: '/WasteManagement',
      'data-entry': '/Scope1SC',
      reports: '/Reports',
      analytics: '/analytics',
    };
    navigate(routes[section]);
  };

  const theme = createTheme({
    palette: {
      primary: { main: '#0D7377' },
      secondary: { main: '#14FFEC' },
    },
    typography: { h6: { fontWeight: 'bold' } },
  });

  const gasOptions = ['R134a', 'R410A', 'R22', 'R744'];

  const sidebarSections = [
    { label: 'Dashboard', icon: <DashboardIcon />, section: 'dashboard' },
    { label: 'GHG Emissions', icon: <EmissionsIcon />, section: 'emissions' },
    { label: 'Waste Management', icon: <WasteIcon />, section: 'waste' },
    { label: 'Data Entry', icon: <DataEntryIcon />, section: 'data-entry' },
    { label: 'Reports', icon: <ReportsIcon />, section: 'reports' },
    { label: 'Analytics', icon: <AnalyticsIcon />, section: 'analytics' },
  ];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        {/* Sidebar */}
        <Drawer
          variant="permanent"
          sx={{
            width: 240,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: 240,
              boxSizing: 'border-box',
              backgroundColor: '#f4f4f4',
            },
          }}
        >
          <Toolbar>
            <Typography variant="h6" sx={{ color: '#0D7377' }}>
              EcoDash
            </Typography>
          </Toolbar>
          <List>
            {sidebarSections.map(({ label, icon, section }) => (
              <ListItem
                button
                key={section}
                selected={selectedSection === section}
                onClick={() => handleSectionNavigation(section)}
              >
                <ListItemIcon>{icon}</ListItemIcon>
                <ListItemText primary={label} />
              </ListItem>
            ))}
          </List>
        </Drawer>

        {/* Main Content */}
        <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: '#f9f9f9' }}>
          {/* Top Bar */}
          <AppBar position="fixed" color="transparent" elevation={0} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Toolbar>
              <Typography variant="h6" sx={{ flexGrow: 1, color: '#0D7377' }}></Typography>
              <IconButton color="inherit"><NotificationsIcon /></IconButton>
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
            Scope 1
          </Typography>

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
                  <Select name="equipmentType" value={formValues.equipmentType} onChange={handleInputChange} label="Type of Equipment">
                    {activeRefrigerationOptions.map((option) => (
                      <MenuItem key={option.id} value={option.name}>
                        {option.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label="Gas GWP"
                  name="gasGWP"
                  type="number"
                  value={formValues.gasGWP}
                  onChange={handleInputChange}
                  variant="outlined"
                />
                <TextField
                  label="Unit Charge (kg)"
                  name="unitCharge"
                  type="number"
                  value={formValues.unitCharge}
                  onChange={handleInputChange}
                  variant="outlined"
                />
                <TextField
                  label="CO2 Equivalent Emissions (kg)"
                  name="co2Emissions"
                  type="number"
                  value={formValues.co2Emissions}
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
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Source ID</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Gas</TableCell>
                    <TableCell>Type of Equipment</TableCell>
                    <TableCell>Gas GWP</TableCell>
                    <TableCell>Unit Charge (kg)</TableCell>
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
                      <TableCell>{row.gas}</TableCell>
                      <TableCell>{row.equipmentType}</TableCell>
                      <TableCell>{row.gasGWP}</TableCell>
                      <TableCell>{row.unitCharge}</TableCell>
                      <TableCell>{row.co2Emissions}</TableCell>
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
              Please fill in all fields before adding a record.
            </Alert>
          </Snackbar>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default RefrigerationAndACPage;
