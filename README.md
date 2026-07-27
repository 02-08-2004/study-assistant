# Study Assistant

A study tool that takes free-form notes or a topic, sends it to an LLM, and turns
the structured response into interactive flashcards or a quiz — with retest for
wrong answers.

## Setup

**Requirements:** Node.js installed, a free Groq API key (https://console.groq.com).

**1. Backend**

cd backend
npm install

Create a `.env` file in `backend/` with:

GROQ_API_KEY=your_key_here

Run the backend:

npm run dev

Backend runs on http://localhost:5000

**2. Frontend**

cd frontend
npm install
npm run dev

Frontend runs on http://localhost:5173

Open http://localhost:5173 in your browser. Both servers must be running
at the same time (use two terminal tabs).

## How it works

- User pastes notes/topic into a textarea and picks Flashcards or Quiz.
- Frontend sends a POST request to the backend (`/api/generate`) — the API key
  never touches the browser.
- Backend prompts Groq (llama-3.3-70b-versatile) with a strict system prompt
  that forces a specific JSON schema.
- Backend parses and validates the model's response before sending it to the
  frontend. If parsing/validation fails, it retries the model call automatically
  (up to 3 attempts) before returning a clean error.
- Frontend renders the validated JSON as real interactive React components —
  never shown as raw chat text.
- A request-ID guard on the frontend discards stale responses if the user
  submits a new request before an older one finishes.

## AI usage note

I used Claude to help me plan the architecture, write the Express backend
(prompt design, JSON validation, retry logic), and structure the React
components (Flashcards, Quiz, state management for the retest flow). I wrote
this note myself and understand every part of the code — I can walk through
and explain the request flow, the schema validation logic, and the
stale-response guard.

## Known limitations

- Retry logic gives up after 3 failed attempts and shows an error instead of
  a partial result.
- Quiz options are always fixed at 4 choices (matches the enforced schema).
- No persistence yet — refreshing the page loses the current session
  (see stretch goals).
- [add more here as you find them during testing]

## Time spent

- Backend (Express, prompt design, validation, retry): __ hrs
- Frontend (form, Flashcards, Quiz, race condition fix): __ hrs
- Styling / mobile polish: __ hrs
- README / testing / recording demo: __ hrs
- **Total: __ hrs**