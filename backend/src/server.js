/***********************************************
 * server.js
 * Main entry point for the Express application
 ***********************************************/
require('dotenv').config(); // Load environment variables if using .env
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());

// Middleware for parsing JSON bodies
app.use(express.json());

// --------------------------------------------
// ROUTE IMPORTS
// --------------------------------------------
const generalCrudRoutes = require('./routes/generalCrudRoutes');
const scope1Routes = require('./routes/scope1Routes');
const scope2Routes = require('./routes/scope2Routes');
const scope3Routes = require('./routes/scope3Routes');
const emissionsRoutes = require('./routes/emissionsRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const authRoutes = require('./routes/authRoutes');  // ✅ Import authentication routes
const analyticsRoutes = require('./routes/analyticsRoutes');
const scope1EmissionsRoutes = require('./routes/scope1EmissionsRoutes'); // ✅ Import the new scope1EmissionsRoutes
const scope2EmissionsRoutes = require('./routes/scope2EmissionsRoute'); // ✅ Import the new scope1EmissionsRoutes
const scope3EmissionsRoutes = require('./routes/Scope3EmissionsRoute'); // ✅ Import the new scope1EmissionsRoutes
const scope3KPIsRoutes = require('./routes/scope3KPIsRoutes');
const wasteKPIsRoutes = require('./routes/wasteKPIsRoutes');
const scope1KPIRoutes = require('./routes/scope1KPIRoutes')


// --------------------------------------------
// REGISTER ROUTES WITH BASE PATHS
// --------------------------------------------
// You can prepend base paths (e.g., /api) if desired

app.use('/api/generic', generalCrudRoutes);  // e.g., /api/generic/user
app.use('/api/scope1', scope1Routes);        // e.g., /api/scope1/stationary
app.use('/api/scope2', scope2Routes);        // e.g., /api/scope2/electricity
app.use('/api/scope3', scope3Routes);        // e.g., /api/scope3/travel
app.use('/emissions', emissionsRoutes);      // e.g., /emissions/total
app.use('/dashboard', dashboardRoutes);      // e.g., /dashboard/kpis
app.use('/api/auth', authRoutes);            // ✅ Register authentication routes (e.g., /api/auth/login)
app.use('/api/analytics', analyticsRoutes);
app.use('/api/scope1-emissions', scope1EmissionsRoutes); // ✅ Register the new scope1EmissionsRoutes
app.use('/api/scope2-emissions', scope2EmissionsRoutes); // ✅ Register the new scope1EmissionsRoutes
app.use('/api/scope3-emissions', scope3EmissionsRoutes); // ✅ Register the new scope1EmissionsRoutes
app.use('/api/scope3/kpis', scope3KPIsRoutes); // Scope 3 KPIs (Business Travel)
app.use('/api/waste/kpis', wasteKPIsRoutes);   // Waste KPIs
app.use('/api/scope1-kpi', scope1KPIRoutes);


// Optional: a simple health check endpoint
app.get('/', (req, res) => {
  res.send('Welcome to the Sustainability Dashboard API!');
});

// --------------------------------------------
// START SERVER
// --------------------------------------------
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}...`);
});
