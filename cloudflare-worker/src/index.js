const DEFAULT_ORIGINS = ['https://yashraj-personal.github.io'];
// The previous model was deprecated by Cloudflare and caused the deployed Worker to return 503.
const MODEL = '@cf/meta/llama-3.1-8b-instruct-fp8';

function allowedOrigin(request, env) {
  const origin = request.headers.get('Origin');
  const origins = String(env.ALLOWED_ORIGINS || DEFAULT_ORIGINS.join(','))
    .split(',').map(value => value.trim()).filter(Boolean);
  return origin && origins.includes(origin) ? origin : null;
}

function headers(origin) {
  return {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': origin || 'null',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': 'no-store'
  };
}

function json(body, status, origin) {
  return new Response(JSON.stringify(body), { status, headers: headers(origin) });
}

function recentHistory(value) {
  if (!Array.isArray(value)) return [];
  return value.slice(-8).flatMap(item => {
    const role = item?.role === 'assistant' ? 'assistant' : item?.role === 'user' ? 'user' : '';
    const content = typeof item?.content === 'string' ? item.content.trim().slice(0, 1200) : '';
    return role && content ? [{ role, content }] : [];
  });
}

export default {
  async fetch(request, env) {
    const origin = allowedOrigin(request, env);
    if (request.method === 'OPTIONS') {
      return origin ? new Response(null, { status: 204, headers: headers(origin) }) : new Response(null, { status: 403 });
    }
    if (!origin) return json({ error: 'This website origin is not allowed.' }, 403, null);
    if (request.method !== 'POST') return json({ error: 'Use POST.' }, 405, origin);

    let body;
    try { body = await request.json(); } catch { return json({ error: 'Invalid JSON.' }, 400, origin); }
    const message = typeof body.message === 'string' ? body.message.trim() : '';
    if (!message || message.length > 1200) return json({ error: 'Message must contain 1–1200 characters.' }, 400, origin);

    const system = body.language === 'hi'
      ? 'Aap Lecture Hub ke warm, natural aur helpful AI assistant hain. User ke conversation context ko yaad rakhkar Hindi/Hinglish mein jawab dein; code keywords English mein rakhein. Beginner-friendly rahen, follow-up questions ka direct jawab dein, aur zaroorat par ek useful follow-up question poochhein. Facts, lecture URLs, passwords, private data, ya API keys kabhi invent ya request na karein.'
      : 'You are Lecture Hub’s warm, natural, helpful AI assistant. Use the conversation context, answer follow-up questions directly, and be beginner-friendly. Ask one useful follow-up question only when it would genuinely help. Never invent facts or lecture URLs, and never request passwords, private data, or API keys.';
    const messages = [{ role: 'system', content: system }, ...recentHistory(body.history), { role: 'user', content: message }];

    try {
      const result = await env.AI.run(MODEL, { messages, max_tokens: 500, temperature: 0.65 });
      const reply = String(result?.response || '').trim();
      if (!reply) throw new Error('No model response.');
      return json({ reply }, 200, origin);
    } catch (error) {
      console.error('Workers AI error', error);
      return json({ error: 'The AI service is temporarily unavailable.' }, 503, origin);
    }
  }
};
