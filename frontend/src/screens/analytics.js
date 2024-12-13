import React from 'react';
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
  Container 
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
  AccountCircle as ProfileIcon 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const AnalyticsPage = () => {
    const navigate = useNavigate();
    const [selectedSection, setSelectedSection] = React.useState(null);
  
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
  
    const sidebarSections = [
      { label: 'Dashboard', icon: <DashboardIcon />, section: 'dashboard' },
      { label: 'GHG Emissions', icon: <EmissionsIcon />, section: 'emissions' },
      { label: 'Waste Management', icon: <WasteIcon />, section: 'waste' },
      { label: 'Data Entry', icon: <DataEntryIcon />, section: 'data-entry' },
      { label: 'Reports', icon: <ReportsIcon />, section: 'reports' },
      { label: 'Analytics', icon: <AnalyticsIcon />, section: 'analytics' },
    ];
  
    // Updated routing logic
    const handleSidebarClick = (section) => {
      setSelectedSection(section);
      if (section === 'dashboard') navigate('/dashboard');
      if (section === 'emissions') navigate('/GHGEmissions');
      if (section === 'waste') navigate('/WasteManagement');
      if (section === 'data-entry') navigate('/Scope1SC');
      if (section === 'reports') navigate('/Reports');
      if (section === 'analytics') navigate('/analytics');
    };
  
    const recyclingData = [
      { material: 'Plastics', organization: 'EcoPlastics Ltd.', contact: 'info@ecoplastics.com' },
      { material: 'Metals', organization: 'GreenMetals Inc.', contact: 'contact@greenmetals.com' },
      { material: 'Paper', organization: 'RecyclePaper Co.', contact: 'support@recyclepaper.com' },
    ];
  
    const scopeSuggestions = [
      { scope: 'Scope 1', suggestion: 'Switch to electric vehicles and energy-efficient equipment.' },
      { scope: 'Scope 2', suggestion: 'Source energy from renewable sources such as solar or wind.' },
      { scope: 'Scope 3', suggestion: 'Collaborate with suppliers to reduce emissions in the supply chain.' },
    ];
  
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ display: 'flex' }}>
          {/* Sidebar */}
          <Drawer variant="permanent" sx={{ width: 240, flexShrink: 0, ['& .MuiDrawer-paper']: { width: 240, boxSizing: 'border-box', backgroundColor: '#f4f4f4', }, }} >
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
                  onClick={() => handleSidebarClick(section.section)}
                  selected={selectedSection === section.section}
                >
                  <ListItemIcon>{section.icon}</ListItemIcon>
                  <ListItemText primary={section.label} />
                </ListItem>
              ))}
            </List>
          </Drawer>
  
          {/* Main Content */}
          <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: '#f9f9f9' }}>
            <AppBar position="fixed" color="transparent" elevation={0} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
              <Toolbar>
                <Typography variant="h6" sx={{ flexGrow: 1, color: '#0D7377' }}>
                  {/* Analytics */}
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
  
            <Container sx={{ mt: 10 }}>
              <Typography variant="h4" gutterBottom>
                Circular Economy Analytics
              </Typography>
              
              {/* Circular Economy */}
              <Typography variant="h6" sx={{ mb: 2 }}>
                Company Circular Economy Status
              </Typography>
              <Typography variant="body1" sx={{ mb: 4 }}>
                75% of materials used by the company are recycled or reused. This indicates a strong commitment to a circular economy. Further efforts can be made by collaborating with additional recycling partners and reducing single-use materials.
              </Typography>
  
              {/* Recycling Partnerships */}
              <Typography variant="h6" sx={{ mb: 2 }}>
                Recycling Partnerships
              </Typography>
              <TableContainer component={Paper} sx={{ mb: 4 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Material</TableCell>
                      <TableCell>Organization</TableCell>
                      <TableCell>Contact</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recyclingData.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>{row.material}</TableCell>
                        <TableCell>{row.organization}</TableCell>
                        <TableCell>{row.contact}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
  
              {/* Scope Suggestions */}
              <Typography variant="h6" sx={{ mb: 2 }}>
                Suggestions for Emission Reduction
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Scope</TableCell>
                      <TableCell>Suggestion</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {scopeSuggestions.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>{row.scope}</TableCell>
                        <TableCell>{row.suggestion}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Container>
          </Box>
        </Box>
      </ThemeProvider>
    );
  };
  
  export default AnalyticsPage;
  
