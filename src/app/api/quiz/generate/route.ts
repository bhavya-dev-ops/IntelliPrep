import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { subject, topic, difficulty, count } = await request.json();

    const prompt = `Generate a JSON object containing an array of ${count} ${difficulty}-level multiple choice questions for the subject "${subject}" specifically on the topic of "${topic}".
    Return ONLY valid JSON.
    The root object MUST have a "questions" key containing the array.
    Each question object MUST have this exact structure:
    {
      "question": "The question text",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "The exact string from options that is correct",
      "explanation": "A short 1-2 sentence explanation of why it is correct"
    }`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error?.message || 'Groq API Error');
    }

    let content = data.choices[0].message.content;
    const parsed = JSON.parse(content);

    return NextResponse.json(parsed.questions || []);
  } catch (error: any) {
    console.error('Quiz Generation Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate quiz' }, { status: 500 });
  }
}
