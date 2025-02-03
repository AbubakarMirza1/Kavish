import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Container,
  Grid,
  Paper,
  Button,
  TextField,
} from '@mui/material';
import {
  Notifications as NotificationIcon,
  HelpOutline as HelpIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { saveAs } from 'file-saver';
import Sidebar from '../Component/sidebar.js'; // Import the Sidebar component

const Reports = () => {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [reportData, setReportData] = useState(null);

  const handleGenerateReport = () => {
    if (!startDate || !endDate) {
      alert('Please select both start and end dates.');
      return;
    }

    const data = {
      startDate: startDate.format('YYYY-MM-DD'),
      endDate: endDate.format('YYYY-MM-DD'),
      details: [
        { category: 'Total Emissions', value: '1,245 Metric Tons CO2e' },
        { category: 'Recycled Waste', value: '600 Tons' },
        { category: 'Disposed Waste', value: '400 Tons' },
        { category: 'Reduction Achieved', value: '15%' },
      ],
    };

    setReportData(data);
  };

  const handleDownloadReport = () => {
    if (!reportData) {
      alert('Please generate the report first.');
      return;
    }

    const reportContent = `
      Report from ${reportData.startDate} to ${reportData.endDate}\n\n
      ${reportData.details.map((item) => `${item.category}: ${item.value}`).join('\n')}
    `;

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `Report_${reportData.startDate}_to_${reportData.endDate}.txt`);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      < Sidebar />

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: '#f9f9f9' }}>
        <AppBar position="static" color="transparent" elevation={0}>
          <Toolbar>
            <Typography variant="h5" sx={{ flexGrow: 1, color: '#0D7377' }}>
              Reports
            </Typography>
            <IconButton onClick={handleDownloadReport} disabled={!reportData}>
              <Typography variant="button" sx={{ color: '#0D7377', mr: 1 }}>
                Download Report
              </Typography>
            </IconButton>
            <IconButton>
              <NotificationIcon />
            </IconButton>
            <IconButton>
              <HelpIcon />
            </IconButton>
            <Avatar sx={{ ml: 2, bgcolor: '#0D7377' }}>JD</Avatar>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ mt: 4 }}>
          {/* Date Pickers */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="subtitle1">Start Date</Typography>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    value={startDate}
                    onChange={(date) => setStartDate(date)}
                    renderInput={(props) => <TextField {...props} fullWidth />}
                  />
                </LocalizationProvider>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="subtitle1">End Date</Typography>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    value={endDate}
                    onChange={(date) => setEndDate(date)}
                    renderInput={(props) => <TextField {...props} fullWidth />}
                  />
                </LocalizationProvider>
              </Paper>
            </Grid>
          </Grid>

          {/* Generate Report Button */}
          <Button
            variant="contained"
            sx={{ bgcolor: '#0D7377', px: 4, mb: 4 }}
            onClick={handleGenerateReport}
          >
            Generate Report
          </Button>

          {/* Display Report */}
          {reportData && (
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ color: '#0D7377', mb: 2 }}>
                Report Details
              </Typography>
              <Typography>Date Range: {reportData.startDate} to {reportData.endDate}</Typography>
              <Box sx={{ mt: 2 }}>
                {reportData.details.map((item, index) => (
                  <Typography key={index}>
                    {item.category}: {item.value}
                  </Typography>
                ))}
              </Box>
            </Paper>
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default Reports;
