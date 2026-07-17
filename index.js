require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { getTutorReply } = require('./services/tutor');

const app = express();

app.use(express.json());

app.use(cors({
  origin: process.env.ALLOWED_ORIGIN
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api', limiter);

function requireAppKey(req, res, next) {
  const key = req.header('x-app-key');
  if (key !== process.env.APP_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.use('/api', requireAppKey);

app.post('/api/tutor', async (req, res) => {
  try {
    const { moduleTitle, lessonTitle, question, studentAnswer, stage, history } = req.body;

    if (!question || !question.prompt) {
      return res.status(400).json({ error: 'Missing question context' });
    }

    const reply = await getTutorReply({
      moduleTitle,
      lessonTitle,
      question,
      studentAnswer,
      stage,
      history: history || []
    });

    res.json({ reply });
  } catch (err) {
    console.error('Tutor route error:', err);
    res.status(500).json({ error: 'Failed to get tutor reply' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});