import Anthropic from '@anthropic-ai/sdk';
import { ABBY_SYSTEM_PROMPT, ABBY_KNOWLEDGE_BASE } from '@/lib/abbyKnowledge';

// Lazy-initialized to avoid crashing the build when ANTHROPIC_API_KEY is not set.
let _client = null;
function getClient() {
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _client;
}

const SYSTEM = `${ABBY_SYSTEM_PROMPT}\n\n---\nKNOWLEDGE BASE:\n${ABBY_KNOWLEDGE_BASE}`;

// ─── Rate limiting (in-memory, per IP) ───────────────────
// 15 messages per 10-minute window per IP.
// Note: resets on server restart; sufficient for early-stage protection.
const rateStore = new Map(); // ip -> { count: number, resetAt: number }
const RATE_LIMIT    = 15;
const RATE_WINDOW   = 10 * 60 * 1000; // 10 minutes

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateStore.get(ip);

  if (!entry || now > entry.resetAt) {
    rateStore.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }

  if (entry.count >= RATE_LIMIT) return false;

  entry.count++;
  return true;
}

// Prune stale entries every 30 minutes to prevent unbounded growth
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateStore) {
    if (now > entry.resetAt) rateStore.delete(ip);
  }
}, 30 * 60 * 1000);

// ─── Handler ─────────────────────────────────────────────

export async function POST(request) {
  try {
    // Rate limit by IP
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      'unknown';

    if (!checkRateLimit(ip)) {
      return Response.json(
        { reply: "You've sent quite a few messages — take a breather and try again in a few minutes. If you need immediate help, use the Contact Us button above." },
        { status: 429 }
      );
    }

    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: 'Invalid messages' }, { status: 400 });
    }

    // Keep last 10 messages to limit token usage; cap each message at 800 chars
    const recentMessages = messages
      .slice(-10)
      .map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: String(m.content).slice(0, 800),
      }));

    const response = await getClient().messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      system: SYSTEM,
      messages: recentMessages,
    });

    const reply =
      response.content[0]?.text ??
      "I'm having a little trouble right now. Please try again shortly, or reach out to our team directly.";

    return Response.json({ reply });

  } catch (err) {
    console.error('[Abby] Chat error:', err?.message ?? err);
    return Response.json({
      reply:
        "Sorry, I'm having trouble connecting right now. You can reach our team at support@abodecostseg.com or use the contact form.",
    });
  }
}
