require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();

app.use(express.json());

// CORS — restrict to frontend origin only
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN
}));

// Rate limiting — backup layer against abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api', limiter);

// App-key check
function requireAppKey(req, res, next) {
  const key = req.header('x-app-key');
  if (key !== process.env.APP_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// Health check — no key required
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Enforce app key on all /api routes — MUST come before routes below
app.use('/api', requireAppKey);

// Placeholder for step 5's real route
app.get('/api/ping', (req, res) => {
  res.json({ message: 'pong' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});