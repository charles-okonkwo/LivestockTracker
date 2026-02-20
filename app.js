const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Initialize database (async, but we'll let it initialize in background)
const db = require('./config/database');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/livestock', require('./routes/livestock'));
app.use('/api/vaccination', require('./routes/vaccination'));

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/vet-portal', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'vet-portal.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

