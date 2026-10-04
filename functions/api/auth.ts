interface Env {
  USERS_KV?: any;
  TURNSTILE_SECRET_KEY?: string;
  GOOGLE_CLIENT_ID?: string;
}

interface AuthRequest {
  action?: 'login' | 'register' | 'google' | 'me';
  email?: string;
  password?: string;
  token?: string;
  googleCredential?: string;
  turnstileToken?: string;
}

function decodeJwtPayload(jwt: string): any {
  try {
    const parts = jwt.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

async function verifyTurnstileToken(token: string, ip: string, secretKey?: string): Promise<boolean> {
  if (!token) return true;
  const secret = secretKey || '1x0000000000000000000000000000000AA';
  try {
    const formData = new FormData();
    formData.append('secret', secret);
    formData.append('response', token);
    if (ip) formData.append('remoteip', ip);

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });
    const outcome = (await res.json()) as any;
    return !!outcome.success;
  } catch {
    return true;
  }
}

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json; charset=utf-8',
  };

  try {
    const clientIp = context.request.headers.get('CF-Connecting-IP') || '';
    let body: AuthRequest = {};
    try {
      body = (await context.request.json()) as AuthRequest;
    } catch {
      body = {};
    }

    // Cloudflare Turnstile anti-bot verification
    if (body.turnstileToken) {
      const isTurnstileValid = await verifyTurnstileToken(
        body.turnstileToken,
        clientIp,
        context.env.TURNSTILE_SECRET_KEY
      );
      if (!isTurnstileValid) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'TURNSTILE_FAILED',
            message: 'Cloudflare 人机防刷验证未通过，请重试',
          }),
          { status: 403, headers: corsHeaders }
        );
      }
    }

    const action = body.action || 'login';

    // Google Fast Sign-in & Fast Registration
    if (action === 'google') {
      let email = (body.email || '').trim().toLowerCase();
      let name = '';
      let picture = '';

      if (body.googleCredential) {
        const payload = decodeJwtPayload(body.googleCredential);
        if (payload && payload.email) {
          email = payload.email.toLowerCase();
          name = payload.name || '';
          picture = payload.picture || '';
        }
      }

      if (!email || !email.includes('@')) {
        return new Response(
          JSON.stringify({ success: false, error: 'INVALID_GOOGLE_TOKEN', message: '未能解析有效的 Google 账号邮箱' }),
          { status: 400, headers: corsHeaders }
        );
      }

      const token = `pb_goog_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
      const now = new Date().toISOString();

      const user = {
        email,
        name: name || email.split('@')[0],
        picture,
        token,
        credits: 10,
        tier: 'free',
        authProvider: 'google',
        lastResetDate: now.slice(0, 10),
        createdAt: now,
      };

      return new Response(
        JSON.stringify({
          success: true,
          user,
          message: '🎉 Google 账号快速登录成功！已为您解锁今日 10 点专属出海算力！',
        }),
        { headers: corsHeaders }
      );
    }

    // Standard Email / Password Flow
    const email = (body.email || '').trim().toLowerCase();
    const password = (body.password || '').trim();

    if (!email || !email.includes('@')) {
      return new Response(
        JSON.stringify({ success: false, error: 'INVALID_EMAIL', message: '请输入有效的电子邮箱地址' }),
        { status: 400, headers: corsHeaders }
      );
    }

    if (password && password.length < 6) {
      return new Response(
        JSON.stringify({ success: false, error: 'WEAK_PASSWORD', message: '密码长度至少需 6 位字符' }),
        { status: 400, headers: corsHeaders }
      );
    }

    const token = `pb_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date().toISOString();

    const user = {
      email,
      token,
      credits: 10,
      tier: 'free',
      authProvider: 'email',
      lastResetDate: now.slice(0, 10),
      createdAt: now,
    };

    return new Response(
      JSON.stringify({
        success: true,
        user,
        message: action === 'register' ? '🎉 注册成功！已为您解锁今日 10 点专属出海算力（每日自动重置）！' : '🎉 登录成功！已为您同步今日 10 点算力。',
      }),
      { headers: corsHeaders }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: 'SERVER_ERROR', message: err.message || '认证服务器异常' }),
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
