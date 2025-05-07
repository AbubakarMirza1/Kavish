const express = require('express');
const router = express.Router();
const reportService = require('../services/reportService');

// Generate PDF report
router.post('/generate', async (req, res) => {
  const { userId, startDate, endDate } = req.body;

  try {
    if (!userId || !startDate || !endDate) {
      return res.status(400).json({ error: 'Missing required fields: userId, startDate, and endDate are required.' });
    }

    const pdfBuffer = await reportService.generateReport(userId, startDate, endDate);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=sustainability_report_${startDate}_${endDate}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Generate Report Error:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to generate report: ' + error.message });
  }
});

// Preview report (base64 for frontend)
router.post('/preview', async (req, res) => {
  const { userId, startDate, endDate } = req.body;

  try {
    if (!userId || !startDate || !endDate) {
      return res.status(400).json({ error: 'Missing required fields: userId, startDate, and endDate are required.' });
    }

    const pdfBuffer = await reportService.generateReport(userId, startDate, endDate);
    const base64 = pdfBuffer.toString('base64');
    res.json({ pdf: `data:application/pdf;base64,${base64}` });
  } catch (error) {
    console.error('Preview Report Error:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to preview report: ' + error.message });
  }
});

module.exports = router;
