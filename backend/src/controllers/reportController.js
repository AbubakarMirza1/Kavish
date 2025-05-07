// Assuming your service logic is in a file named 'reportService.js'
// If it's named differently or located elsewhere, adjust the path accordingly.
const { generateReport } = require('./reportService');

/**
 * Controller function to generate a PDF report and send it as a download.
 * Expects startDate, endDate, and userId in the request body.
 */
const generatePDFReport = async (req, res) => {
  const { startDate, endDate, userId } = req.body;

  try {
    // Minimal input validation - service will handle detailed validation (dates, etc.)
    if (!startDate || !endDate || !userId) {
      return res.status(400).json({ error: 'Start date, end date, and user ID are required.' });
    }

    console.log(`Controller: Received request to generate PDF for User ${userId} from ${startDate} to ${endDate}`);

    // Call the service function to generate the report PDF buffer
    // The service handles all data fetching, calculations, narrative, charts, and PDF creation.
    // Pass isPreview = false to get the raw PDF buffer for download.
    const pdfBuffer = await generateReport(userId, startDate, endDate, false);

    // Set response headers for PDF download
    res.writeHead(200, {
      'Content-Length': Buffer.byteLength(pdfBuffer),
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment;filename=sustainability_report_${startDate}_${endDate}.pdf`,
    });

    // Send the PDF buffer in the response body
    res.end(pdfBuffer);

    console.log(`Controller: Successfully sent PDF report for User ${userId}.`);

  } catch (error) {
    console.error('Controller: Error during PDF report generation:', error);

    // Pass relevant error details back, especially for client-side issues like invalid dates
    if (error.message.includes('Invalid date format') || error.message.includes('End date must be on or after start date')) {
         return res.status(400).json({ error: error.message });
    }
     if (error.message.includes('No data found')) {
         return res.status(404).json({ error: error.message }); // Or 200 with a message depending on desired flow
     }


    // For other errors (e.g., database, AI service, PDF generation failure)
    res.status(500).json({ error: 'Failed to generate PDF report', details: error.message });
  }
  // Note: Prisma disconnect is handled within the service layer.
};

/**
 * Controller function to fetch data for a PDF preview and return it as a base64 string.
 * Expects startDate, endDate, and userId in the request body.
 */
const fetchEmissionsForPreview = async (req, res) => {
  const { startDate, endDate, userId } = req.body;

  try {
    // Minimal input validation - service will handle detailed validation (dates, etc.)
    if (!startDate || !endDate || !userId) {
      return res.status(400).json({ error: 'Start date, end date, and user ID are required.' });
    }

     console.log(`Controller: Received request for PDF preview data for User ${userId} from ${startDate} to ${endDate}`);

    // Call the service function to generate the report data and PDF as base64
    // Pass isPreview = true to get the base64 string within a JSON object.
    const previewResult = await generateReport(userId, startDate, endDate, true);

    // Send the base64 string in a JSON response
    res.json(previewResult); // previewResult is expected to be { pdfBase64: '...' }

    console.log(`Controller: Successfully sent PDF preview data for User ${userId}.`);

  } catch (error) {
    console.error('Controller: Error fetching data for preview:', error);

     // Pass relevant error details back, especially for client-side issues like invalid dates
    if (error.message.includes('Invalid date format') || error.message.includes('End date must be on or after start date')) {
         return res.status(400).json({ error: error.message });
    }
     if (error.message.includes('No data found')) {
         return res.status(404).json({ error: error.message });
     }

    // For other errors (e.g., database, AI service, PDF generation failure)
    res.status(500).json({ error: 'Failed to fetch data for preview', details: error.message });
  }
  // Note: Prisma disconnect is handled within the service layer.
};

// Export the controller functions
module.exports = { generatePDFReport, fetchEmissionsForPreview };
