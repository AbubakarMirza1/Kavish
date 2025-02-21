import React from 'react';
import TopBar from '../Component/topbar.js'; // Import the Sidebar component

import { 
  Typography, 
  Box, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Container 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Component/sidebar.js'; // Import the Sidebar component

const AnalyticsPage = () => {
  
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
        <Box sx={{ display: 'flex' }}>
          < Sidebar />
  
          {/* Main Content */}
          <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: '#f9f9f9' }}>
          <TopBar 
                title="Analytics" 
                showDropdown={false}
            />
  
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
    );
  };
  
  export default AnalyticsPage;
  
