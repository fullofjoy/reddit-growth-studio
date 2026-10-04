interface Env {
  AGNES_API_KEY?: string;
  DEEPSEEK_API_KEY?: string;
}

interface RequestBody {
  topic?: string;
  apiKey?: string;
  model?: string;
  provider?: string;
}

const AGNES_ENDPOINT = 'https://apihub.agnes-ai.com/v1/chat/completions';
const DEFAULT_MODEL = 'agnes-2.0-flash';

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };

  try {
    let body: RequestBody = {};
    try {
      body = (await context.request.json()) as RequestBody;
    } catch {
      body = {};
    }

    const topic = (body.topic || '').trim() || 'What will you do if your partner cheat on you?';
    const clientKey = (body.apiKey || '').trim();
    const apiKey = clientKey || context.env.AGNES_API_KEY || 'sk-m4ZWPXnPiprv99DnLs62v0LGANSV855EjayDBjpjPGfBtnR7';

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: 'NO_API_KEY',
          message: '未配置 Agnes API Key。请在前端“API配置”中填入您的 Key，或由管理员在 Cloudflare 环境变量中绑定 AGNES_API_KEY。',
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    const systemPrompt = `You are an elite Reddit Viral One-Liner Strategist.
Given a Reddit post title or discussion topic, output 5 ultra-punchy, high-upvote comments following these strict rules:
1. BREVITY: Strictly UNDER 15 WORDS per comment (mobile readers skip long essays; short punchlines get 10x upvotes).
2. TONE: Zero AI throat-clearing, zero lecturing, no disclaimers. Authentic Reddit humor, deadpan sarcasm, and native redditor slang.
3. BANNED PHRASES: Never use "in this comprehensive guide", "delve into", "it's worth noting", "in conclusion", "let's explore", "game-changer", "without further ado".
4. ZERO LINKS: Absolutely no external links or hashtags.
5. Output STRICTLY a valid JSON array of 5 objects, with NO markdown formatting:
[
  {"style": "Deadpan Sarcasm", "text": "English one-liner under 15 words", "zh": "地道中文意译"},
  {"style": "Self-Deprecating", "text": "English one-liner under 15 words", "zh": "地道中文意译"},
  {"style": "Mic Drop", "text": "English one-liner under 15 words", "zh": "地道中文意译"},
  {"style": "Hard Truth", "text": "English one-liner under 15 words", "zh": "地道中文意译"},
  {"style": "Practical Hacker", "text": "English one-liner under 15 words", "zh": "地道中文意译"}
]`;

    const resp = await fetch(AGNES_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Reddit topic: "${topic}"` },
        ],
        temperature: 0.85,
        max_tokens: 600,
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      return new Response(
        JSON.stringify({
          error: 'UPSTREAM_API_ERROR',
          status: resp.status,
          message: errText,
        }),
        { status: resp.status, headers: corsHeaders }
      );
    }

    const data = (await resp.json()) as any;
    const rawContent = data.choices?.[0]?.message?.content || '';
    let cleaned = rawContent.trim();
    const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
    if (jsonMatch) cleaned = jsonMatch[0];

    const parsed = JSON.parse(cleaned);

    return new Response(
      JSON.stringify({
        success: true,
        model: DEFAULT_MODEL,
        candidates: parsed,
      }),
      { headers: corsHeaders }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        error: 'SERVER_ERROR',
        message: err.message || 'Internal proxy error',
      }),
      { status: 500, headers: corsHeaders }
    );
  }
};

export const onRequestOptions = async () => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
};
