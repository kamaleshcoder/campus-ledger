import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/user.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mern_backend';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({
    message: 'Student Attendance & Management API',
    status: 'running',
    endpoints: {
      'GET /': 'Health check',
      'GET /api/users': 'Get all students',
      'GET /api/users/:id': 'Get a single student',
      'POST /api/users': 'Create a new student',
      'PUT /api/users/:id': 'Update student details',
      'DELETE /api/users/:id': 'Delete a student',
    },
  });
});

app.get('/api/users', async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ error: 'Database not connected.' });
  }
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users/:id', async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ error: 'Database not connected.' });
  }
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users', async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ error: 'Database not connected.' });
  }
  try {
    const { role, identifier, password, name, department, attendance, ca1, ca2, semester } = req.body;
    if (!identifier || !name || !department) {
      return res.status(400).json({ error: 'Identifier, name and department are required' });
    }
    const user = new User({ role, identifier, password, name, department, attendance, ca1, ca2, semester });
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'A student with this identifier already exists' });
    }
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ error: 'Database not connected.' });
  }
  try {
    const { role, identifier, password, name, department, attendance, ca1, ca2, semester } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role, identifier, password, name, department, attendance, ca1, ca2, semester },
      { new: true, runValidators: true }
    );
    if (!user) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(user);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'A student with this identifier already exists' });
    }
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ error: 'Database not connected.' });
  }
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

mongoose
  .connect(MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
  })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error.message);
  });

export default app;