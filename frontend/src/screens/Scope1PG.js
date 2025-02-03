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
  Settings as SettingsIcon,
  HelpOutline as HelpIcon,
  Notifications as NotificationsIcon,
  AccountCircle as ProfileIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

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
  const [selectedSection, setSelectedSection] = useState('dashboard');
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

  const handleSectionNavigation = (section) => {
    setSelectedSection(section);
    const routes = {
      dashboard: '/dashboard',
      emissions: '/GHGEmissions',
      waste: '/WasteManagement',
      'data-entry': '/Scope1SC',
      reports: '/Reports',
      analytics: '/analytics',
      // settings: '/Settings',
    };
    navigate(routes[section]);
  };

  // const theme = createTheme({
  //   palette: {
  //     primary: { main: '#0D7377' },
  //     secondary: { main: '#14FFEC' },
  //   },
  //   typography: { h6: { fontWeight: 'bold' } },
  // });

  const unitOptions = ['Liters', 'Kilograms', 'Cubic meters'];
  const sidebarSections = [
    { label: 'Dashboard', icon: <DashboardIcon />, section: 'dashboard' },
    { label: 'GHG Emissions', icon: <EmissionsIcon />, section: 'emissions' },
    { label: 'Waste Management', icon: <WasteIcon />, section: 'waste' },
    { label: 'Data Entry', icon: <DataEntryIcon />, section: 'data-entry' },
    { label: 'Reports', icon: <ReportsIcon />, section: 'reports' },
    { label: 'Analytics', icon: <AnalyticsIcon />, section: 'analytics' },
    // { label: 'Settings', icon: <SettingsIcon />, section: 'settings' },
  ];

  return (
    // <ThemeProvider theme={theme}>
    //   <CssBaseline />
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
          <AppBar position="fixed" color="transparent" elevation={0} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Toolbar>
              <Typography variant="h6" sx={{ flexGrow: 1, color: '#0D7377' }}></Typography>
              <IconButton color="inherit"><NotificationsIcon /></IconButton>
              <IconButton color="inherit"><HelpIcon /></IconButton>
              <IconButton color="inherit">
                <ProfileIcon />
              </IconButton>
              <Avatar sx={{ ml: 2, bgcolor: '#0D7377' }}>JD</Avatar>
            </Toolbar>
          </AppBar>

          <Typography variant="h2" gutterBottom sx={{ mt: 8 }}>Scope 1</Typography>

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
                {/* <TextField
                  label="Unit Capacity"
                  name="unitCapacity"
                  type="number"
                  value={formValues.unitCapacity}
                  onChange={handleInputChange}
                  variant="outlined"
                /> */}
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
                    {/*<TableCell>Unit Capacity</TableCell>*/}
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
                      {/* <TableCell>{row.unitCapacity}</TableCell> */}
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
    //</ThemeProvider>
  );
};

export default PurchasedGasesPage;
