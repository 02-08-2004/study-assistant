\# Data Schema



\## Flashcards

{

&#x20; "type": "flashcards",

&#x20; "topic": "string",

&#x20; "cards": \[

&#x20;   { "question": "string", "answer": "string" }

&#x20; ]

}



\## Quiz

{

&#x20; "type": "quiz",

&#x20; "topic": "string",

&#x20; "questions": \[

&#x20;   {

&#x20;     "question": "string",

&#x20;     "options": \["string", "string", "string", "string"],

&#x20;     "correctIndex": 0

&#x20;   }

&#x20; ]

}



\## Rules

\- type is always "flashcards" or "quiz"

\- cards/questions always arrays, even if length 1

\- options always exactly 4 strings

\- correctIndex is a number (0-3), not the answer text

\- Model must return raw JSON only — no markdown fences, no extra text

