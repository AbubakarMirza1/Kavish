import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom'; // Not used in this version
import TopBar from '../Component/topbar.js';
import Sidebar from '../Component/sidebar.js';
import {
  Box,
  Typography,
  Container,
  Grid,
  Paper,
  Button,
  TextField,
  CircularProgress,
  Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { saveAs } from 'file-saver';
import axios from 'axios'; // Make sure axios is installed: npm install axios or yarn add axios

// --- CONFIGURATION ---
// TODO: Replace with your actual User ID retrieval logic
const USER_ID = 3; 
// TODO: Adjust if your API is hosted elsewhere or on a different port
//const API_BASE_URL = 'http://localhost:5000/api/reports'; 
// Access the environment variable directly
const API_BASE_URL = process.env.REACT_APP_API_URL;

const Reports = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGeneratePreview = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates.');
      return;
    }
    if (endDate.isBefore(startDate)) {
      setError('End date cannot be before start date.');
      return;
    }

    setIsLoading(true);
    setError('');
    setPdfPreviewUrl('');

    try {
      const response = await axios.post(`${API_BASE_URL}/api/reports/preview`, {
        userId: USER_ID,
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),
      });
      // The backend's /preview endpoint returns: { pdf: 'data:application/pdf;base64,...' }
      setPdfPreviewUrl(response.data.pdf); 
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to generate report preview.';
      setError(errorMessage);
      console.error('Preview generation error:', err.response || err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates to download the report.');
      return;
    }
    if (endDate.isBefore(startDate)) {
      setError('End date cannot be before start date.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_BASE_URL}/api/reports/generate`, {
        userId: USER_ID,
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),
      }, {
        responseType: 'blob', // Crucial for file downloads
      });

      const fileName = `sustainability_report_${startDate.format('YYYY-MM-DD')}_to_${endDate.format('YYYY-MM-DD')}.pdf`;
      saveAs(response.data, fileName);

    } catch (err) {
      let errorMessage = 'Failed to download PDF report.';
      if (err.response && err.response.data instanceof Blob && err.response.data.type === "application/json") {
        // If the server sent a JSON error response despite responseType: 'blob'
        try {
          const errorText = await err.response.data.text();
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorMessage;
        } catch (parseError) {
          console.error('Could not parse error blob:', parseError);
          // Fallback to generic message if blob parsing fails
        }
      } else if (err.response?.data?.error) {
         errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      console.error('PDF download error:', err.response || err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = () => {
    setError('');
    setPdfPreviewUrl('');
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
        <TopBar title="Reports" showDropdown={false} />

        <Container maxWidth="xl" sx={{ mt: 4 }}>
          {/* Date Pickers */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium' }}>Start Date</Typography>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    value={startDate}
                    onChange={(date) => { setStartDate(date); handleDateChange(); }}
                    renderInput={(params) => <TextField {...params} fullWidth variant="outlined" />}
                  />
                </LocalizationProvider>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium' }}>End Date</Typography>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    value={endDate}
                    onChange={(date) => { setEndDate(date); handleDateChange(); }}
                    renderInput={(params) => <TextField {...params} fullWidth variant="outlined" />}
                    minDate={startDate} 
                  />
                </LocalizationProvider>
              </Paper>
            </Grid>
          </Grid>

          {/* Action Buttons & Loading Indicator */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
            <Button
              variant="contained"
              sx={{ 
                bgcolor: '#0D7377', 
                '&:hover': { bgcolor: '#0A5C5F' }, 
                px: 3, py: 1.5, 
                textTransform: 'none', 
                fontSize: '0.95rem' 
              }}
              onClick={handleGeneratePreview}
              disabled={isLoading || !startDate || !endDate}
            >
              Generate Preview
            </Button>
            <Button
              variant="outlined"
              sx={{ 
                borderColor: '#0D7377', 
                color: '#0D7377', 
                '&:hover': { 
                  borderColor: '#0A5C5F', 
                  backgroundColor: 'rgba(13, 115, 119, 0.04)',
                  color: '#0A5C5F'
                }, 
                px: 3, py: 1.5, 
                textTransform: 'none', 
                fontSize: '0.95rem' 
              }}
              onClick={handleDownloadPdf}
              disabled={isLoading || !startDate || !endDate}
            >
              Download PDF Report
            </Button>
            {isLoading && <CircularProgress size={28} sx={{ color: '#0D7377' }} />}
          </Box>

          {/* Error Display */}
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>
          )}

          {/* PDF Preview Area */}
          {pdfPreviewUrl && !isLoading && !error && (
             <Paper 
                elevation={3} 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  borderRadius: 2, 
                  overflow: 'hidden', 
                  height: '75vh', // Adjust as needed
                  minHeight: '600px', // Minimum height for the preview
                  border: '1px solid #ddd'
                }}
            >
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#0D7377', 
                  p: 2, 
                  backgroundColor: '#eef7f7', // Lighter teal shade
                  borderBottom: '1px solid #b2dfdb',
                  flexShrink: 0 
                }}
              >
                Report Preview
              </Typography>
              <Box sx={{ flexGrow: 1, width: '100%', height: '100%' }}>
                <iframe
                  src={pdfPreviewUrl}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  title="Report Preview"
                  // Consider adding sandbox attributes for security if PDFs can come from untrusted sources
                  // sandbox="allow-scripts allow-same-origin" 
                />
              </Box>
            </Paper>
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default Reports;
