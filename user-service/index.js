const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('User Service: Connected to MongoDB'))
  .catch(err => console.error('User Service: MongoDB connection error:', err));

// Routes
app.use('/', userRoutes);

// Error Handling
app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
    console.log(`User Service is running on port ${PORT}`);
});
