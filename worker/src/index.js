const ALLOWED_ORIGINS = new Set([
  'https://rahulprasanna-code.github.io',
  'http://localhost:8787',
  'http://127.0.0.1:8787',
]);

const SYSTEM_PROMPT = `You are Rahul Prasanna's portfolio assistant. Answer only from the portfolio facts below. If a question is unrelated or the answer is not present, say that you can only answer questions about Rahul's portfolio and suggest contacting Rahul directly. Do not invent employers, dates, metrics, technologies, or personal details. Be concise, professional, and helpful.

Portfolio facts:
- Rahul Prasanna is a Software Engineer focused on distributed systems, cloud-native backend platforms, Java, Kubernetes, AWS, messaging, and reliable data processing.
- At Sun Life, he worked on a communications platform processing 2.1B+ annual communications, reducing total execution time by 90%, and migrating 15M+ monthly statements.
- He improved disposition processing by 60x, batch insert times by 67%, and maintained 0 data loss under KEDA scale-down.
- Projects include a Kafka-based order processing pipeline, KEDA autoscaling work, and scalable backend/data-processing systems.
- His education CGPA is 9.1 / 10. He is based in India.
- Contact: prasannarahul22@gmail.com. GitHub: https://github.com/RahulPrasanna-code. LinkedIn: https://linkedin.com/in/rahul-prasanna`;

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.has(origin) ? origin : 'https://rahulprasanna-code.github.io';
  return { 'Access-Control-Allow-Origin': allowed, 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Vary': 'Origin' };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const headers = corsHeaders(origin);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    if (request.method !== 'POST') return Response.json({ error: 'Method not allowed.' }, { status: 405, headers });

    try {
      const body = await request.json();
      const question = typeof body.question === 'string' ? body.question.trim() : '';
      if (!question || question.length > 500) return Response.json({ error: 'Please provide a question up to 500 characters.' }, { status: 400, headers });
      if (!env.GEMINI_API_KEY) return Response.json({ error: 'Assistant is not configured yet.' }, { status: 503, headers });

      const geminiResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
        body: JSON.stringify({ systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] }, contents: [{ role: 'user', parts: [{ text: question }] }], generationConfig: { temperature: 0.2, maxOutputTokens: 300 } }),
      });
      const data = await geminiResponse.json();
      if (!geminiResponse.ok) return Response.json({ error: 'Gemini could not answer right now.' }, { status: 502, headers });
      const answer = data.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('').trim();
      if (!answer) return Response.json({ error: 'Gemini returned an empty answer.' }, { status: 502, headers });
      return Response.json({ answer }, { headers });
    } catch {
      return Response.json({ error: 'Invalid request or temporary server error.' }, { status: 400, headers });
    }
  },
};
