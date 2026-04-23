const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const trainingRoutes = require('./routes/trainingRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Training Service: Connected to MongoDB'))
  .catch(err => console.error('Training Service: MongoDB connection error:', err));

app.use('/', trainingRoutes);
app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Training Service is running on port ${PORT}`);
});
