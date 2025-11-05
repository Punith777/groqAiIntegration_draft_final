// WARNING: API key exposed in frontend - not secure for production
const GROQ_API_KEY = process.env.GROQ_API_KEY;

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export const callGroq = async (messages: Message[]): Promise<string> => {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
};

const cleanJsonResponse = (response: string): string => {
  // Remove markdown code blocks if present
  let cleaned = response.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
};

export const generateSummary = async (subtitles: string): Promise<{ summary: string; minuteByMinute: string[]; keyPoints: string[] }> => {
  const prompt = `Analyze the following video subtitles and provide:
1. An overall summary of the video (3-5 sentences) that is well-formatted and suitable for studying
2. A minute-by-minute breakdown as an array of strings (each entry like "Minute 0-1: summary content")
3. 6 key points from the entire content

Subtitles:
${subtitles}

Respond in JSON format:
{
  "summary": "A comprehensive overview of the video content in 3-5 well-structured sentences.",
  "minuteByMinute": ["Minute 0-1: content", "Minute 1-2: content", "Minute 2-3: content", ...],
  "keyPoints": ["point 1", "point 2", ...]
}`;

  const response = await callGroq([
    { role: 'system', content: 'You are an educational content analyzer. Always respond with valid JSON containing summary, minuteByMinute array, and keyPoints array.' },
    { role: 'user', content: prompt }
  ]);

  try {
    return JSON.parse(cleanJsonResponse(response));
  } catch {
    return {
      summary: response,
      minuteByMinute: [],
      keyPoints: ['Unable to parse key points']
    };
  }
};

export const answerQuestion = async (subtitles: string, question: string): Promise<string> => {
  const prompt = `Based on the following video subtitles, answer the user's question. 

IMPORTANT: 
- If the user asks about a specific time/minute (e.g., "What did they say at minute 5?"), look for content around that timestamp and provide a detailed summary of what was discussed.
- If the user asks about a topic with a time reference (e.g., "What did they say about AI at minute 10?"), find the relevant section and provide context.
- If the answer is not in the subtitles, respond with "This information was not mentioned in the video."
- Always be specific and quote relevant parts when available.

Subtitles:
${subtitles}

Question: ${question}`;

  return await callGroq([
    { role: 'system', content: 'You are a helpful assistant that answers questions based on video transcripts. You can understand timestamp queries and retrieve specific moments from the transcript.' },
    { role: 'user', content: prompt }
  ]);
};

export const generateAssessment = async (subtitles: string): Promise<{
  mcqs: Array<{ question: string; options: string[]; correct: number; explanation: string }>;
  shortQuestions: Array<{ question: string; answer: string }>;
}> => {
  const prompt = `Based on the following video subtitles, create an assessment:

1. Generate 5 multiple choice questions (MCQs) with 4 options each
2. Generate 3 short answer questions with model answers

IMPORTANT: For each MCQ, provide an explanation that describes why the correct answer is right and why the other options are incorrect.

Subtitles:
${subtitles}

Respond in JSON format:
{
  "mcqs": [
    {
      "question": "question text",
      "options": ["option1", "option2", "option3", "option4"],
      "correct": 0,
      "explanation": "Detailed explanation of why this answer is correct and why others are wrong"
    }
  ],
  "shortQuestions": [
    {
      "question": "question text",
      "answer": "model answer"
    }
  ]
}`;

  const response = await callGroq([
    { role: 'system', content: 'You are an educational assessment creator. Always respond with valid JSON.' },
    { role: 'user', content: prompt }
  ]);

  try {
    return JSON.parse(cleanJsonResponse(response));
  } catch (error) {
    console.error('Failed to parse assessment:', error);
    return {
      mcqs: [],
      shortQuestions: []
    };
  }
};

export const evaluateShortAnswer = async (question: string, modelAnswer: string, userAnswer: string): Promise<{ score: number; feedback: string }> => {
  const prompt = `Evaluate the following answer and provide:
1. A score out of 2:
   - 2 marks: Correct and complete
   - 1.5 marks: Mostly correct with minor issues
   - 1 mark: Partially correct
   - 0.5 marks: Minimal understanding
   - 0 marks: Incorrect or no answer

2. Detailed feedback explaining:
   - What was good about the answer
   - What was missing or incorrect
   - How it compares to the model answer

Question: ${question}
Model Answer: ${modelAnswer}
User Answer: ${userAnswer}

Respond in JSON format:
{
  "score": 1.5,
  "feedback": "Your detailed feedback here"
}`;

  const response = await callGroq([
    { role: 'system', content: 'You are an assessment grader. Always respond with valid JSON containing score and feedback.' },
    { role: 'user', content: prompt }
  ]);

  try {
    const result = JSON.parse(cleanJsonResponse(response));
    return {
      score: Math.min(Math.max(result.score || 0, 0), 2),
      feedback: result.feedback || 'No feedback available'
    };
  } catch {
    return { score: 0, feedback: 'Error evaluating answer' };
  }
};
