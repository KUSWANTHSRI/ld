const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const attendanceRoutes = require('./routes/attendanceRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Attendance Service: Connected to MongoDB'))
  .catch(err => console.error('Attendance Service: MongoDB connection error:', err));

app.use('/attendance', attendanceRoutes);
app.use('/enrollments', enrollmentRoutes);

app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Attendance Service is running on port ${PORT}`);
});
