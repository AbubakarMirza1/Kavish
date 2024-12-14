require('dotenv').config();
const express = require('express');
const cors = require('cors');
const emissionsRoutes = require('./routes/emissionsRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/emissions', emissionsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
