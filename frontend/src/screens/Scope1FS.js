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

const initialData = [
  {
    id: 1,
    sourceId: '101',
    description: 'System A',
    gas: 'R410A',
    equipmentType: 'AC Unit',
    gasGWP: 2088,
    unitCharge: 5,
    co2Emissions: 10440,
  },
  {
    id: 2,
    sourceId: '102',
    description: 'System B',
    gas: 'R134a',
    equipmentType: 'Refrigerator',
    gasGWP: 1430,
    unitCharge: 3,
    co2Emissions: 4290,
  }
];

const FireSuppressionPage = () => {
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddRow = () => {
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
  };

  const handleDeleteRow = () => {
    setRows((prev) => prev.filter((row) => row.id !== deleteId));
    setOpenDialog(false);
  };

  const theme = createTheme({
    palette: {
      primary: {
        main: '#0D7377',
      },
      secondary: {
        main: '#14FFEC',
      },
    },
    typography: {
      h6: {
        fontWeight: 'bold',
      },
    },
  });

  const gasOptions = ['R134a', 'R410A', 'R22', 'R744'];

  const sidebarSections = [
    { label: 'Dashboard', icon: <DashboardIcon />, section: 'dashboard' },
    { label: 'GHG Emissions', icon: <EmissionsIcon />, section: 'emissions' },
    { label: 'Waste Management', icon: <WasteIcon />, section: 'waste' },
    { label: 'Data Entry', icon: <DataEntryIcon />, section: 'data-entry' },
    { label: 'Reports', icon: <ReportsIcon />, section: 'reports' },
    { label: 'Analytics', icon: <AnalyticsIcon />, section: 'analytics' },
    { label: 'Settings', icon: <SettingsIcon />, section: 'settings' },
  ];  // Sidebar definition that matches the original
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
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
            {sidebarSections.map((section) => (
              <ListItem
                button
                key={section.section}
                selected={selectedSection === section.section}
                onClick={() => setSelectedSection(section.section)}
              >
                <ListItemIcon>{section.icon}</ListItemIcon>
                <ListItemText primary={section.label} />
              </ListItem>
            ))}
          </List>
        </Drawer>
        <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: '#f9f9f9' }}>
          <AppBar position="fixed" color="transparent" elevation={0} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
            <Toolbar>
              <Typography variant="h6" sx={{ flexGrow: 1, color: '#0D7377' }}>
                
              </Typography>
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
          <Typography variant="h2">
            Scope 1
          </Typography>
          <Container sx={{ mt: 10 }}>
            <Typography variant="h4" gutterBottom>
              Fire Suppression
            </Typography>
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
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                <FormControl variant="outlined" sx={{ minWidth: 120 }}>
                  <InputLabel>Gas</InputLabel>
                  <Select
                    name="gas"
                    value={formValues.gas}
                    onChange={handleInputChange}
                    label="Gas"
                  >
                    {gasOptions.map((gas) => (
                      <MenuItem key={gas} value={gas}>
                        {gas}
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
            <Typography variant="h6">Records</Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Source ID</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Gas</TableCell>
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
                      <TableCell>{row.date}</TableCell>
                      <TableCell>{row.gas}</TableCell>
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
          </Container>
        </Box>
        <Dialog
          open={openDialog}
          onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{"Confirm Deletion"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
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
      </Box>
    </ThemeProvider>
  );
};

export default FireSuppressionPage;
