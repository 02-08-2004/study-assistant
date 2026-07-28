const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend is running');
});

const SYSTEM_PROMPT = `You are a study assistant that converts notes or topics into structured learning material.

You must respond with ONLY valid JSON. No markdown code fences, no explanations, no text before or after the JSON.

IF REQUESTED MODE IS FLASHCARDS, return this exact JSON shape:
{
  "type": "flashcards",
  "topic": "short topic name",
  "cards": [
    { "question": "string", "answer": "string" }
  ]
}

IF REQUESTED MODE IS QUIZ, return this exact JSON shape:
{
  "type": "quiz",
  "topic": "short topic name",
  "questions": [
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctIndex": 0
    }
  ]
}

Rules:
- Generate between 5 and 8 items.
- If flashcards mode is requested, ONLY return flashcards.
- If quiz mode is requested, ONLY return quiz.
- "correctIndex" must be a number from 0 to 3.
- Do not wrap in markdown fences.
- Return raw JSON only.`;

function parseAndValidate(rawText, expectedMode) {
  let cleaned = rawText.trim();

  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(json)?/, '').replace(/```$/, '').trim();
  }

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (e) {
    return { valid: false, error: 'Model returned invalid JSON' };
  }

  if (expectedMode && parsed.type !== expectedMode) {
    return { valid: false, error: `Expected type '${expectedMode}' but received '${parsed.type}'` };
  }

  if (parsed.type === 'flashcards') {
    if (!Array.isArray(parsed.cards) || parsed.cards.length === 0) {
      return { valid: false, error: 'Flashcards response missing cards array' };
    }
    const allValid = parsed.cards.every(
      c => typeof c.question === 'string' && typeof c.answer === 'string'
    );
    if (!allValid) {
      return { valid: false, error: 'Flashcards have malformed entries' };
    }
    return { valid: true, data: parsed };
  }

  if (parsed.type === 'quiz') {
    if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) {
      return { valid: false, error: 'Quiz response missing questions array' };
    }
    const allValid = parsed.questions.every(
      q =>
        typeof q.question === 'string' &&
        Array.isArray(q.options) &&
        q.options.length === 4 &&
        typeof q.correctIndex === 'number' &&
        q.correctIndex >= 0 &&
        q.correctIndex <= 3
    );
    if (!allValid) {
      return { valid: false, error: 'Quiz has malformed questions' };
    }
    return { valid: true, data: parsed };
  }

  return { valid: false, error: 'Unknown or missing type field' };
}

async function callGroq(userContent) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userContent }
      ],
      temperature: 0.3
    })
  });
  const data = await response.json();
  return data.choices?.[0]?.message?.content;
}

app.post('/api/generate', async (req, res) => {
  const { notes, mode } = req.body;

  if (!notes || !mode) {
    return res.status(400).json({ error: 'Missing notes or mode' });
  }

  try {
    const modeInstruction = mode === 'flashcards' 
      ? 'GENERATE FLASHCARDS ONLY. Return {"type": "flashcards", "topic": "...", "cards": [...]}.'
      : 'GENERATE A QUIZ ONLY. Return {"type": "quiz", "topic": "...", "questions": [...]}.';
      
    const userContent = `REQUESTED MODE: ${mode.toUpperCase()}\nINSTRUCTION: ${modeInstruction}\n\nNotes/Topic:\n${notes}`;
    const MAX_ATTEMPTS = 3;
    let lastError = 'Unknown error';

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      const rawText = await callGroq(userContent);

      if (!rawText) {
        lastError = 'Empty response from AI provider';
        console.warn(`Attempt ${attempt}: empty response, retrying...`);
        continue;
      }

      const result = parseAndValidate(rawText, mode);

      if (result.valid) {
        console.log(`Attempt ${attempt}: success for mode ${mode}`);
        return res.json(result.data);
      }

      lastError = result.error;
      console.warn(`Attempt ${attempt}: validation failed (${result.error}), retrying...`);
    }

    console.error('All attempts failed. Last error:', lastError);
    res.status(422).json({ error: `AI failed to produce valid output after ${MAX_ATTEMPTS} attempts: ${lastError}` });
  } catch (err) {
    console.error('Error calling Groq:', err);
    res.status(500).json({ error: 'Failed to reach AI provider' });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});