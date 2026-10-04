interface Env {
  USERS_KV?: any;
}

interface AuthRequest {
  action?: 'login' | 'register' | 'me';
  email?: string;
  password?: string;
  token?: string;
}

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };

  try {
    let body: AuthRequest = {};
    try {
      body = (await context.request.json()) as AuthRequest;
    } catch {
      body = {};
    }

    const action = body.action || 'login';
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
      credits: 5,
      tier: 'free',
      lastResetDate: now.slice(0, 10),
      createdAt: now,
    };

    return new Response(
      JSON.stringify({
        success: true,
        user,
        message: action === 'register' ? '注册成功！已为您注入今日 5 点专属出海算力。' : '登录成功！',
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
