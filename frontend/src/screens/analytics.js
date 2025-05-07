import React, { useEffect, useState } from 'react';
import TopBar from '../Component/topbar.js';
import Sidebar from '../Component/sidebar.js';
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
// Access the environment variable directly
const API_BASE_URL = process.env.REACT_APP_API_URL;

const AnalyticsPage = () => {
  const [analyticsData, setAnalyticsData] = useState({ recyclingData: [], scopeSuggestions: [], circularEconomyStatus: { status: '' } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/analytics/recycling-recommendations`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetched data:', data); // Debug log
        // Filter out extra fields and ensure arrays/objects
        const formattedData = {
          recyclingData: Array.isArray(data.recyclingData)
            ? data.recyclingData.map(({ material, organization, website }) => ({ material, organization, website }))
            : [],
          scopeSuggestions: Array.isArray(data.scopeSuggestions) ? data.scopeSuggestions : [],
          circularEconomyStatus: data.circularEconomyStatus || { status: 'No status available' },
        };
        console.log('Formatted data:', formattedData); // Debug log
        setAnalyticsData(formattedData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />

      <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: '#f9f9f9' }}>
        <TopBar title="Analytics" showDropdown={false} />

        <Container sx={{ mt: 10 }}>
          <Typography variant="h4" gutterBottom>
            Circular Economy Analytics
          </Typography>

          {/* Loading and Error Handling */}
          {loading && <Typography>Loading data...</Typography>}
          {error && <Typography color="error">{error}</Typography>}

          {!loading && !error && (
            <>
              {/* Circular Economy Status */}
              <Typography variant="h6" sx={{ mb: 2 }}>
                Company Circular Economy Status
              </Typography>
              <Typography variant="body1" sx={{ mb: 4, backgroundColor: '#fff', p: 2, borderRadius: 4 }}>
                {analyticsData.circularEconomyStatus.status || 'No status available'}
              </Typography>

              {/* Recycling Partnerships Table */}
              <Typography variant="h6" sx={{ mb: 2 }}>
                Recycling Partnerships
              </Typography>
              <TableContainer component={Paper} sx={{ mb: 4 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Material</TableCell>
                      <TableCell>Organization</TableCell>
                      <TableCell>Website</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {analyticsData.recyclingData.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>{row.material || 'N/A'}</TableCell>
                        <TableCell>{row.organization || 'Not available'}</TableCell>
                        <TableCell>
                          {row.website ? (
                            <a 
                              href={row.website.startsWith('http') ? row.website : `https://${row.website}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ color: '#007bff', textDecoration: 'underline', cursor: 'pointer' }}
                            >
                              {row.website}
                            </a>
                          ) : (
                            'Not available'
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Suggestions for Emission Reduction */}
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
                    {analyticsData.scopeSuggestions.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>{row.scope || 'N/A'}</TableCell>
                        <TableCell>{row.suggestion || 'Not available'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default AnalyticsPage;
