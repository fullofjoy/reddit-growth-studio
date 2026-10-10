var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// api/auth.ts
function decodeJwtPayload(jwt) {
  try {
    const parts = jwt.split(".");
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64).split("").map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}
__name(decodeJwtPayload, "decodeJwtPayload");
var onRequestPost = /* @__PURE__ */ __name(async (context) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json; charset=utf-8"
  };
  try {
    let body = {};
    try {
      body = await context.request.json();
    } catch {
      body = {};
    }
    const action = body.action || "login";
    if (action === "google") {
      let email2 = (body.email || "").trim().toLowerCase();
      let name = "";
      let picture = "";
      if (body.googleCredential) {
        const payload = decodeJwtPayload(body.googleCredential);
        if (payload && payload.email) {
          email2 = payload.email.toLowerCase();
          name = payload.name || "";
          picture = payload.picture || "";
        }
      }
      if (!email2 || !email2.includes("@")) {
        return new Response(
          JSON.stringify({ success: false, error: "INVALID_GOOGLE_TOKEN", message: "\u672A\u80FD\u89E3\u6790\u6709\u6548\u7684 Google \u8D26\u53F7\u90AE\u7BB1" }),
          { status: 400, headers: corsHeaders }
        );
      }
      const token2 = `pb_goog_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
      const now2 = (/* @__PURE__ */ new Date()).toISOString();
      const user2 = {
        email: email2,
        name: name || email2.split("@")[0],
        picture,
        token: token2,
        credits: 10,
        tier: "free",
        authProvider: "google",
        lastResetDate: now2.slice(0, 10),
        createdAt: now2
      };
      return new Response(
        JSON.stringify({
          success: true,
          user: user2,
          message: "\u{1F389} Google \u8D26\u53F7\u5FEB\u901F\u767B\u5F55\u6210\u529F\uFF01\u5DF2\u4E3A\u60A8\u89E3\u9501\u4ECA\u65E5 10 \u70B9\u4E13\u5C5E\u51FA\u6D77\u7B97\u529B\uFF01"
        }),
        { headers: corsHeaders }
      );
    }
    const email = (body.email || "").trim().toLowerCase();
    const password = (body.password || "").trim();
    if (!email || !email.includes("@")) {
      return new Response(
        JSON.stringify({ success: false, error: "INVALID_EMAIL", message: "\u8BF7\u8F93\u5165\u6709\u6548\u7684\u7535\u5B50\u90AE\u7BB1\u5730\u5740" }),
        { status: 400, headers: corsHeaders }
      );
    }
    if (password && password.length < 6) {
      return new Response(
        JSON.stringify({ success: false, error: "WEAK_PASSWORD", message: "\u5BC6\u7801\u957F\u5EA6\u81F3\u5C11\u9700 6 \u4F4D\u5B57\u7B26" }),
        { status: 400, headers: corsHeaders }
      );
    }
    const token = `pb_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const user = {
      email,
      token,
      credits: 10,
      tier: "free",
      authProvider: "email",
      lastResetDate: now.slice(0, 10),
      createdAt: now
    };
    return new Response(
      JSON.stringify({
        success: true,
        user,
        message: action === "register" ? "\u{1F389} \u6CE8\u518C\u6210\u529F\uFF01\u5DF2\u4E3A\u60A8\u89E3\u9501\u4ECA\u65E5 10 \u70B9\u4E13\u5C5E\u51FA\u6D77\u7B97\u529B\uFF08\u6BCF\u65E5\u81EA\u52A8\u91CD\u7F6E\uFF09\uFF01" : "\u{1F389} \u767B\u5F55\u6210\u529F\uFF01\u5DF2\u4E3A\u60A8\u540C\u6B65\u4ECA\u65E5 10 \u70B9\u7B97\u529B\u3002"
      }),
      { headers: corsHeaders }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: "SERVER_ERROR", message: err.message || "\u8BA4\u8BC1\u670D\u52A1\u5668\u5F02\u5E38" }),
      { status: 500, headers: corsHeaders }
    );
  }
}, "onRequestPost");
var onRequestOptions = /* @__PURE__ */ __name(async () => {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}, "onRequestOptions");

// api/generate.ts
var PRIMARY_ENDPOINT = "https://api.agnes-ai.cn/v1/chat/completions";
var DEFAULT_MODEL = "agnes-2.5-flash";
var BACKUP_MODEL = "agnes-3.0-flash";
var DEFAULT_API_KEY = "sk-4Yj4C0eAtpvaY1kiK7T1mafogRdiOqB2pFQvYGZbJwbRkE1K";
function detectTopicDomain(topic) {
  const t = (topic || "").toLowerCase();
  if (/cheat|partner|ex|girlfriend|boyfriend|tinder|breakup|marriage|divorce|date|dating|husband|wife|relationship|crush|出轨|伴侣|对象|恋爱|分手|结婚|渣男|渣女|相亲/.test(t)) return "dating";
  if (/work|job|boss|interview|salary|layoff|manager|agile|overtime|burnout|slack|zoom|meeting|standup|jira|scrum|sprint|career|coworker|colleague|office|hire|hiring|quit|职场|老板|同事|加班|内卷|工资|薪水|离职|面试|开会|汇报/.test(t)) return "work";
  if (/code|python|rust|javascript|react|ai|replace|junior|senior|dev|bug|docker|github|deploy|program|engineer|pr|commit|repo|coder|software|terminal|linux|git|程序员|代码|架构|报错|开发|祖传|修bug|提pr|编程/.test(t)) return "dev";
  if (/video|youtube|tiktok|reel|stream|vlog|watch|click away|thumbnail|creator|channel|sponsor|sub|intro|outro|视频|油管|短视频|播客|博主|完播|切片/.test(t)) return "video";
  if (/game|gaming|steam|ps5|xbox|nintendo|gamer|play|rpg|mmo|multiplayer|gacha|boss fight|patch|游戏|主机|排位|联机|网游|抽卡/.test(t)) return "gaming";
  if (/saas|mrr|stripe|launch|first 100|marketing|indie|product|users|client|landing page|traffic|seo|独立开发|获客|推广|出海|出单|转化|变现|站长/.test(t)) return "saas";
  if (/money|dollar|\$50|purchase|cheap|expensive|cost|budget|crypto|stock|invest|price|pay|afford|rich|poor|bank|省钱|花钱|购买|投资|物有所值|平替|理财|股市/.test(t)) return "money";
  return "general";
}
__name(detectTopicDomain, "detectTopicDomain");
function generateEdgeSynthesizedCandidates(topic) {
  const domain = detectTopicDomain(topic);
  const randUpvote = /* @__PURE__ */ __name((minK, maxK) => (Math.random() * (maxK - minK) + minK).toFixed(1) + "k", "randUpvote");
  const randRate = /* @__PURE__ */ __name((minRate, maxRate) => Math.floor(Math.random() * (maxRate - minRate + 1)) + minRate, "randRate");
  const POOLS = {
    dating: [
      {
        style: "Deadpan Sarcasm",
        text: "Pack their bags, leave them outside, and let the streets raise them.",
        zh: "\u628ATA\u7684\u884C\u674E\u6253\u5305\u4E22\u95E8\u53E3\uFF0C\u8BA9\u5916\u9762\u7684\u82B1\u82B1\u4E16\u754C\u597D\u597D\u6559\u80B2TA\u3002",
        upvotes: randUpvote(2.4, 3.8),
        rate: randRate(94, 98)
      },
      {
        style: "Self-Deprecating",
        text: "Honestly amazed anyone found my personality interesting enough to cheat on.",
        zh: "\u6211\u751A\u81F3\u6709\u70B9\u9707\u60CA\uFF0C\u5C45\u7136\u6709\u4EBA\u89C9\u5F97\u6211\u7684\u4EBA\u683C\u503C\u5F97\u82B1\u5FC3\u601D\u53BB\u5288\u817F\u3002",
        upvotes: randUpvote(1.2, 1.9),
        rate: randRate(90, 94)
      },
      {
        style: "Mic Drop",
        text: "Change the Netflix password. Silence speaks volumes.",
        zh: "\u76F4\u63A5\u628A\u6D41\u5A92\u4F53\u5BC6\u7801\u6539\u6389\u3002\u6210\u5E74\u4EBA\u7684\u7EDD\u6740\u4ECE\u4E0D\u9700\u8981\u591A\u8BF4\u4E00\u4E2A\u5B57\u3002",
        upvotes: randUpvote(3.1, 4.6),
        rate: randRate(96, 99)
      },
      {
        style: "Hard Truth",
        text: "Trash took itself to the curb. Don\u2019t chase after the garbage truck.",
        zh: "\u5783\u573E\u81EA\u5DF1\u6EDA\u5230\u9A6C\u8DEF\u7259\u5B50\u4E0A\u4E86\uFF0C\u5343\u4E07\u522B\u8FFD\u7740\u5783\u573E\u8F66\u8DD1\u3002",
        upvotes: randUpvote(1.6, 2.7),
        rate: randRate(92, 96)
      },
      {
        style: "Practical Hacker",
        text: "Export chats, change locks, book a solo trip, never look back.",
        zh: "\u5907\u4EFD\u804A\u5929\u8BB0\u5F55\u3001\u6362\u9501\u3001\u8BA2\u4E00\u5F20\u5355\u7A0B\u5EA6\u5047\u673A\u7968\uFF0C\u5934\u4E5F\u522B\u56DE\u3002",
        upvotes: randUpvote(0.9, 1.5),
        rate: randRate(88, 92)
      }
    ],
    work: [
      {
        style: "Deadpan Sarcasm",
        text: "I give 100% at work: 10% Monday, 20% Tuesday, 40% Wednesday, 30% Thursday, 0% Friday.",
        zh: "\u6211\u5728\u5DE5\u4F4D\u7EDD\u5BF9\u4ED8\u51FA100%\uFF1A\u5468\u4E0010%\uFF0C\u5468\u4E8C20%\uFF0C\u5468\u4E0940%\uFF0C\u5468\u56DB30%\uFF0C\u5468\u4E940%\u3002",
        upvotes: randUpvote(2.8, 4.2),
        rate: randRate(95, 99)
      },
      {
        style: "Self-Deprecating",
        text: "My greatest professional skill is looking aggressively focused while thinking about lunch.",
        zh: "\u6211\u6700\u5927\u7684\u804C\u573A\u6838\u5FC3\u7ADE\u4E89\u529B\uFF0C\u5C31\u662F\u773C\u795E\u770B\u4F3C\u6781\u5EA6\u4E13\u6CE8\uFF0C\u8111\u5B50\u91CC\u5168\u5728\u60F3\u5348\u996D\u5403\u5565\u3002",
        upvotes: randUpvote(1.4, 2.3),
        rate: randRate(91, 95)
      },
      {
        style: "Mic Drop",
        text: "If you dropped dead tomorrow, your replacement job posting drops before your obituary.",
        zh: "\u8981\u662F\u4F60\u660E\u5929\u5012\u4E0B\uFF0C\u516C\u53F8\u7684\u8865\u62DBHC\u4F1A\u53D1\u5F97\u6BD4\u4F60\u7684\u8BA3\u544A\u8FD8\u5FEB\u3002",
        upvotes: randUpvote(3.5, 5.1),
        rate: randRate(97, 99)
      },
      {
        style: "Hard Truth",
        text: "Nobody remembers your late-night overtime except your doctor and your burnout.",
        zh: "\u6CA1\u4EBA\u4F1A\u8BB0\u5F97\u4F60\u71AC\u591C\u52A0\u8FC7\u7684\u73ED\uFF0C\u9664\u4E86\u4F60\u7684\u533B\u751F\u548C\u4F60\u5D29\u6E83\u7684\u795E\u7ECF\u3002",
        upvotes: randUpvote(1.8, 2.9),
        rate: randRate(93, 97)
      },
      {
        style: "Practical Hacker",
        text: "Schedule that email for 8:02 AM Monday. Look like an absolute legend for free.",
        zh: "\u628A\u90AE\u4EF6\u5B9A\u65F6\u8BBE\u7F6E\u5728\u5468\u4E00\u65E9\u4E0A8\u70B902\u5206\u53D1\u51FA\uFF0C\u96F6\u6210\u672C\u7ACB\u4F4F\u656C\u4E1A\u5927\u795E\u4EBA\u8BBE\u3002",
        upvotes: randUpvote(1.1, 1.8),
        rate: randRate(89, 93)
      }
    ],
    dev: [
      {
        style: "Deadpan Sarcasm",
        text: "It works on my machine. Pack my laptop and ship it to production.",
        zh: "\u6211\u672C\u5730\u80FD\u8DD1\uFF0C\u76F4\u63A5\u628A\u6211\u7B14\u8BB0\u672C\u6253\u5305\u6254\u5230\u751F\u4EA7\u73AF\u5883\u5F53\u670D\u52A1\u5668\u5427\u3002",
        upvotes: randUpvote(2.9, 4.5),
        rate: randRate(95, 99)
      },
      {
        style: "Self-Deprecating",
        text: "My code is 10% algorithmic logic and 90% StackOverflow copy-paste prayers.",
        zh: "\u6211\u7684\u4EE3\u780110%\u662F\u7B97\u6CD5\u903B\u8F91\uFF0C90%\u662F\u590D\u5236\u7C98\u8D34\u548C\u8654\u8BDA\u7684\u7977\u544A\u3002",
        upvotes: randUpvote(1.5, 2.2),
        rate: randRate(91, 95)
      },
      {
        style: "Mic Drop",
        text: "There is no cloud, just someone else\u2019s broken computer running unpinned Docker tags.",
        zh: "\u4E16\u4E0A\u672C\u6CA1\u6709\u4E91\uFF0C\u53EA\u6709\u522B\u4EBA\u6CA1\u6253\u8865\u4E01\u3001\u8DD1\u7740\u62C9\u8DE8 Docker \u955C\u50CF\u7684\u7834\u7535\u8111\u3002",
        upvotes: randUpvote(3.2, 4.8),
        rate: randRate(96, 99)
      },
      {
        style: "Hard Truth",
        text: "Temporary hotfixes have an uncanny ability to become decade-long company heritage.",
        zh: "\u6240\u6709\u201C\u4E34\u65F6\u9876\u4E00\u4E0B\u201D\u7684\u4EE3\u7801\u8865\u4E01\uFF0C\u6700\u540E\u90FD\u4F1A\u53D8\u6210\u516C\u53F8\u7956\u4F20\u5341\u5E74\u7684\u7CBE\u795E\u9057\u4EA7\u3002",
        upvotes: randUpvote(1.7, 2.8),
        rate: randRate(92, 96)
      },
      {
        style: "Practical Hacker",
        text: "Ran git blame to flame the idiot who wrote this disaster. It was me last Tuesday.",
        zh: "\u8DD1\u4E86\u904D git blame \u51C6\u5907\u72E0\u72E0\u5632\u7B11\u5199\u8FD9\u70C2\u4EE3\u7801\u7684\u50BB\u5B50\uFF0C\u53D1\u73B0\u662F\u4E0A\u5468\u4E8C\u7684\u81EA\u5DF1\u3002",
        upvotes: randUpvote(1.3, 1.9),
        rate: randRate(90, 94)
      }
    ],
    saas: [
      {
        style: "Deadpan Sarcasm",
        text: "Spent four months tweaking dark mode CSS gradients. Still sitting at zero paying users.",
        zh: "\u82B1\u4E86\u6574\u6574\u56DB\u4E2A\u6708\u5FAE\u8C03\u6697\u9ED1\u6A21\u5F0F\u7684\u6E10\u53D8\u50CF\u7D20\uFF0C\u559C\u63D00\u4E2A\u4ED8\u8D39\u7528\u6237\u3002",
        upvotes: randUpvote(2.5, 3.9),
        rate: randRate(94, 98)
      },
      {
        style: "Self-Deprecating",
        text: "My business model is converting high-octane caffeine into unsold GitHub repos.",
        zh: "\u6211\u7684\u5546\u4E1A\u95ED\u73AF\uFF0C\u5C31\u662F\u628A\u6602\u8D35\u7684\u5496\u5561\u56E0\u8F6C\u5316\u4E3A\u65E0\u4EBA\u95EE\u6D25\u7684\u79C1\u6709 GitHub \u4ED3\u5E93\u3002",
        upvotes: randUpvote(1.3, 2.1),
        rate: randRate(90, 94)
      },
      {
        style: "Mic Drop",
        text: "Talk to angry customers before building, or talk to an empty PostgreSQL database later.",
        zh: "\u8981\u4E48\u5728\u5199\u4EE3\u7801\u524D\u53BB\u8DDF\u6311\u5254\u7684\u5BA2\u6237\u804A\uFF0C\u8981\u4E48\u5728\u7A7A\u8361\u8361\u7684\u6570\u636E\u5E93\u9762\u524D\u81EA\u8A00\u81EA\u8BED\u3002",
        upvotes: randUpvote(3, 4.4),
        rate: randRate(96, 99)
      },
      {
        style: "Hard Truth",
        text: "Your mom thinks your app is genius. Ask a stranger with an active Stripe card.",
        zh: "\u4F60\u5988\u89C9\u5F97\u4F60\u7684\u8F6F\u4EF6\u8D85\u68D2\u6BEB\u65E0\u610F\u4E49\uFF0C\u53BB\u95EE\u4E00\u4E2A\u624B\u91CC\u63E1\u7740\u4FE1\u7528\u5361\u4E14\u6B63\u5728\u5934\u75BC\u7684\u964C\u751F\u4EBA\u3002",
        upvotes: randUpvote(1.9, 2.9),
        rate: randRate(93, 97)
      },
      {
        style: "Practical Hacker",
        text: "Search Reddit for complaints about bloated incumbents, then reply with your lightweight tool.",
        zh: "\u5728 Reddit \u641C\u7D22\u7528\u6237\u5BF9\u884C\u4E1A\u8001\u65E7\u81C3\u80BF\u5DE8\u5934\u7684\u5410\u69FD\u5E16\uFF0C\u5E26\u7740\u4F60\u7684\u8F7B\u91CF\u5DE5\u5177\u76F4\u63A5\u53BB\u8BC4\u8BBA\u533A\u89E3\u56F4\u3002",
        upvotes: randUpvote(1.2, 1.8),
        rate: randRate(89, 93)
      }
    ],
    money: [
      {
        style: "Deadpan Sarcasm",
        text: "Saved $4 making coffee at home, celebrated by spending $180 on novelty desk toys.",
        zh: "\u5728\u5BB6\u505A\u5496\u5561\u7701\u4E864\u5757\u94B1\uFF0C\u8F6C\u5934\u5174\u594B\u5730\u82B1\u4E86180\u5200\u5728\u7F51\u4E0A\u4E70\u65E0\u7528\u684C\u9762\u6446\u4EF6\u7292\u52B3\u81EA\u5DF1\u3002",
        upvotes: randUpvote(2.7, 4.1),
        rate: randRate(95, 99)
      },
      {
        style: "Self-Deprecating",
        text: "My investment strategy is buying high, panicking immediately, and holding out of spite.",
        zh: "\u6211\u7684\u7406\u8D22\u6838\u5FC3\u7B56\u7565\uFF1A\u9AD8\u4F4D\u63A5\u76D8\u3001\u79D2\u901F\u6050\u614C\u3001\u7136\u540E\u5E26\u7740\u8D4C\u6C14\u7684\u5FC3\u6001\u6B7B\u625B\u3002",
        upvotes: randUpvote(1.4, 2.2),
        rate: randRate(91, 95)
      },
      {
        style: "Mic Drop",
        text: "The fastest way to double your net worth is folding the bill in half and pocketing it.",
        zh: "\u8BA9\u4F60\u73B0\u6709\u8D44\u4EA7\u77AC\u95F4\u7FFB\u500D\u7684\u6700\u5FEB\u65B9\u6CD5\uFF0C\u5C31\u662F\u628A\u949E\u7968\u5BF9\u6298\u653E\u56DE\u515C\u91CC\u3002",
        upvotes: randUpvote(3.4, 4.9),
        rate: randRate(96, 99)
      },
      {
        style: "Hard Truth",
        text: "Buying professional tools is not the same thing as possessing the discipline to use them.",
        zh: "\u72C2\u4E70\u6602\u8D35\u7684\u4E13\u4E1A\u88C5\u5907\uFF0C\u5E76\u4E0D\u7B49\u4E8E\u4F60\u62E5\u6709\u4E86\u65E5\u590D\u4E00\u65E5\u575A\u6301\u8BAD\u7EC3\u7684\u6BC5\u529B\u3002",
        upvotes: randUpvote(1.8, 2.8),
        rate: randRate(93, 97)
      },
      {
        style: "Practical Hacker",
        text: "Add to cart and walk away for 48 hours. 85% of spontaneous urges vanish on their own.",
        zh: "\u6254\u8FDB\u8D2D\u7269\u8F66\u5F3A\u5236\u51B7\u537448\u5C0F\u65F6\uFF0C85%\u7684\u51B2\u52A8\u6D88\u8D39\u6B32\u671B\u90FD\u4F1A\u81EA\u52A8\u70DF\u6D88\u4E91\u6563\u3002",
        upvotes: randUpvote(1.1, 1.7),
        rate: randRate(89, 93)
      }
    ],
    video: [
      {
        style: "Deadpan Sarcasm",
        text: "A 45-second animated logo intro with dubstep music.",
        zh: "\u5F00\u5934\u90A3\u6BB545\u79D2\u5E26\u7535\u97F3\u8F70\u70B8\u7684\u70AB\u91773D\u52A8\u6001LOGO\u3002",
        upvotes: randUpvote(2.9, 4.6),
        rate: randRate(95, 99)
      },
      {
        style: "Self-Deprecating",
        text: 'Saying "leave a comment below" before giving me any reason to care.',
        zh: "\u8FD8\u6CA1\u7ED9\u51FA\u4E00\u53E5\u5E72\u8D27\uFF0C\u5C31\u6025\u7740\u8BA9\u6211\u201C\u5728\u8BC4\u8BBA\u533A\u7559\u4E0B\u4F60\u7684\u770B\u6CD5\u201D\u3002",
        upvotes: randUpvote(1.5, 2.5),
        rate: randRate(92, 96)
      },
      {
        style: "Mic Drop",
        text: "Unskippable 30-second double ads on an 18-second clip.",
        zh: "\u770B\u4E2A18\u79D2\u7684\u77ED\u89C6\u9891\uFF0C\u5148\u7ED9\u6211\u585E\u4E24\u6761\u8DF3\u4E0D\u6389\u768430\u79D2\u8D34\u7247\u5E7F\u544A\u3002",
        upvotes: randUpvote(3.9, 5.8),
        rate: randRate(97, 99)
      },
      {
        style: "Hard Truth",
        text: "The title asks a question and the video spends 12 minutes rambling without answering it.",
        zh: "\u6807\u9898\u660E\u660E\u629B\u4E86\u4E2A\u7591\u95EE\uFF0C\u89C6\u9891\u5E9F\u8BDD\u4E8612\u5206\u949F\u4E5F\u6CA1\u7ED9\u51FA\u7B54\u6848\u3002",
        upvotes: randUpvote(2.1, 3.4),
        rate: randRate(94, 98)
      },
      {
        style: "Practical Hacker",
        text: "Clickbait thumbnail with fake red arrows pointing at absolutely nothing.",
        zh: "\u5C01\u9762\u56FE\u4E0A\u753B\u7740\u5938\u5F20\u7684\u7EA2\u5708\u548C\u7BAD\u5934\uFF0C\u70B9\u8FDB\u53BB\u53D1\u73B0\u5565\u4E5F\u6CA1\u6709\u3002",
        upvotes: randUpvote(1.2, 1.9),
        rate: randRate(89, 93)
      }
    ],
    gaming: [
      {
        style: "Deadpan Sarcasm",
        text: "Game looks incredible until you realize it is pre-rendered CGI with zero actual gameplay.",
        zh: "\u5BA3\u4F20\u7247\u7F8E\u5982\u5929\u4ED9\uFF0C\u70B9\u8FDB\u53BB\u53D1\u73B0\u5168\u662F\u4E00\u79D2\u5B9E\u9645\u753B\u9762\u90FD\u6CA1\u6709\u7684\u9884\u6E32\u67D3CG\u3002",
        upvotes: randUpvote(2.8, 4.3),
        rate: randRate(95, 99)
      },
      {
        style: "Self-Deprecating",
        text: "Spending 3 hours in character customization just to wear a full-face helmet 5 minutes later.",
        zh: "\u634F\u8138\u634F\u4E86\u6574\u65743\u5C0F\u65F6\uFF0C\u8FDB\u6E38\u620F5\u5206\u949F\u5C31\u6234\u4E0A\u4E86\u5168\u5C01\u95ED\u5F0F\u5934\u76D4\u3002",
        upvotes: randUpvote(1.7, 2.6),
        rate: randRate(91, 95)
      },
      {
        style: "Mic Drop",
        text: 'Selling a $70 beta test and calling it "Live Service".',
        zh: "\u5356\u774070\u5200\u7684\u534A\u6210\u54C1\u516C\u6D4B\u5305\uFF0C\u5634\u91CC\u8FD8\u7BA1\u8FD9\u53EB\u201C\u957F\u671F\u8FD0\u8425\u670D\u52A1\u578B\u6E38\u620F\u201D\u3002",
        upvotes: randUpvote(3.7, 5.5),
        rate: randRate(97, 99)
      },
      {
        style: "Hard Truth",
        text: "The battle pass has 100 tiers and 98 of them are recolored profile banners.",
        zh: "\u5B63\u7968\u8DB3\u8DB3100\u7EA7\uFF0C\u5176\u4E2D98\u7EA7\u90FD\u662F\u6362\u76AE\u5934\u50CF\u6846\u548C\u8D34\u7EB8\u3002",
        upvotes: randUpvote(2, 3.2),
        rate: randRate(93, 97)
      },
      {
        style: "Practical Hacker",
        text: "Wait 6 months after launch: half price, fully patched, and all DLC included.",
        zh: "\u53D1\u552E\u534A\u5E74\u540E\u518D\u4E70\uFF1A\u6253\u5BF9\u6298\u3001\u4FEE\u590D\u6240\u6709\u6076\u6027BUG\u3001\u751A\u81F3\u5168DLC\u6253\u5305\u3002",
        upvotes: randUpvote(1.3, 2.1),
        rate: randRate(88, 92)
      }
    ],
    general: [
      {
        style: "Deadpan Sarcasm",
        text: "Nothing screams confidence like nodding along while understanding literally zero percent.",
        zh: "\u6CA1\u6709\u4EC0\u4E48\u6BD4\u5168\u7A0B\u80F8\u6709\u6210\u7AF9\u5730\u70B9\u5934\u3001\u5B9E\u5219\u534A\u4E2A\u5B57\u90FD\u6CA1\u542C\u61C2\u66F4\u80FD\u5C55\u73B0\u6210\u5E74\u4EBA\u7684\u81EA\u4FE1\u4E86\u3002",
        upvotes: randUpvote(2.6, 4),
        rate: randRate(94, 98)
      },
      {
        style: "Self-Deprecating",
        text: "I have 99 problems and roughly 87 of them are completely fabricated by my overthinking.",
        zh: "\u6211\u4EBA\u751F\u670999\u4E2A\u70E6\u607C\uFF0C\u5176\u4E2D\u5927\u698287\u4E2A\u662F\u6211\u534A\u591C\u5185\u8017\u51ED\u7A7A\u8111\u8865\u51FA\u6765\u7684\u3002",
        upvotes: randUpvote(1.5, 2.4),
        rate: randRate(91, 95)
      },
      {
        style: "Mic Drop",
        text: "Don\u2019t set yourself on fire just to keep ungrateful people warm.",
        zh: "\u6C38\u8FDC\u522B\u628A\u81EA\u5DF1\u70B9\u71C3\uFF0C\u53BB\u6E29\u6696\u90A3\u4E9B\u4E0D\u77E5\u611F\u6069\u3001\u968F\u65F6\u4F1A\u8D70\u5F00\u7684\u4EBA\u3002",
        upvotes: randUpvote(3.6, 5.2),
        rate: randRate(97, 99)
      },
      {
        style: "Hard Truth",
        text: "Most people don\u2019t want honest advice; they just want validation for their predetermined bad idea.",
        zh: "\u7EDD\u5927\u591A\u6570\u4EBA\u8981\u7684\u6839\u672C\u4E0D\u662F\u771F\u8BDA\u5EFA\u8BAE\uFF0C\u4ED6\u4EEC\u53EA\u662F\u60F3\u4E3A\u81EA\u5DF1\u65E9\u5C31\u6253\u5B9A\u4E3B\u610F\u7684\u998A\u4E3B\u610F\u627E\u8BA4\u540C\u611F\u3002",
        upvotes: randUpvote(1.9, 3.1),
        rate: randRate(93, 97)
      },
      {
        style: "Practical Hacker",
        text: 'Say "Let me check my calendar" instead of saying yes immediately. Buys instant peace of mind.',
        zh: "\u6C38\u8FDC\u7528\u201C\u6211\u5148\u67E5\u4E0B\u65E5\u7A0B\u201D\u4EE3\u66FF\u8131\u53E3\u800C\u51FA\u7684\u7B54\u5E94\uFF0C\u77AC\u95F4\u4E3A\u4F60\u4E70\u56DE\u65E0\u9650\u540E\u6094\u6743\u3002",
        upvotes: randUpvote(1.2, 1.8),
        rate: randRate(89, 93)
      }
    ]
  };
  return POOLS[domain] || POOLS.general;
}
__name(generateEdgeSynthesizedCandidates, "generateEdgeSynthesizedCandidates");
var onRequestPost2 = /* @__PURE__ */ __name(async (context) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json; charset=utf-8"
  };
  try {
    let body = {};
    try {
      body = await context.request.json();
    } catch {
      body = {};
    }
    const topic = (body.topic || "").trim() || "What will you do if your partner cheat on you?";
    const apiKey = context.env.AGNES_API_KEY || DEFAULT_API_KEY;
    const systemPrompt = `You are an elite Reddit Viral One-Liner Strategist.
Given a Reddit post title or discussion topic, output 5 ultra-punchy, high-upvote comments following these strict rules:
1. BREVITY: Strictly UNDER 15 WORDS per comment (mobile readers skip long essays; short punchlines get 10x upvotes).
2. TONE: Zero AI throat-clearing, zero lecturing, no disclaimers. Authentic Reddit humor, deadpan sarcasm, and native redditor slang.
3. BANNED PHRASES: Never use "in this comprehensive guide", "delve into", "it's worth noting", "in conclusion", "let's explore", "game-changer", "without further ado".
4. ZERO LINKS: Absolutely no external links or hashtags.
5. Output STRICTLY a valid JSON array of 5 objects, with NO markdown formatting, including realistic estimated upvote counts (e.g. '2.8k', '1.6k', '940') and positive upvote rates (85-98):
[
  {"style": "Deadpan Sarcasm", "text": "English one-liner under 15 words", "zh": "\u5730\u9053\u4E2D\u6587\u610F\u8BD1", "upvotes": "2.1k", "rate": 95},
  {"style": "Self-Deprecating", "text": "English one-liner under 15 words", "zh": "\u5730\u9053\u4E2D\u6587\u610F\u8BD1", "upvotes": "1.1k", "rate": 91},
  {"style": "Mic Drop", "text": "English one-liner under 15 words", "zh": "\u5730\u9053\u4E2D\u6587\u610F\u8BD1", "upvotes": "3.4k", "rate": 98},
  {"style": "Hard Truth", "text": "English one-liner under 15 words", "zh": "\u5730\u9053\u4E2D\u6587\u610F\u8BD1", "upvotes": "1.7k", "rate": 93},
  {"style": "Practical Hacker", "text": "English one-liner under 15 words", "zh": "\u5730\u9053\u4E2D\u6587\u610F\u8BD1", "upvotes": "780", "rate": 88}
]`;
    let candidateList = null;
    let modelName = "PaceBowl-Edge-Flash";
    let upstreamStatus = null;
    if (apiKey) {
      const callLlm = /* @__PURE__ */ __name(async (model) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12e3);
        try {
          const res = await fetch(PRIMARY_ENDPOINT, {
            method: "POST",
            signal: controller.signal,
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${apiKey}`,
              "Accept": "application/json",
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) PaceBowl/2.0"
            },
            body: JSON.stringify({
              model,
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Reddit topic: "${topic}"` }
              ],
              temperature: 0.85,
              max_tokens: 600
            })
          });
          clearTimeout(timeoutId);
          if (!res.ok) {
            upstreamStatus = `HTTP_${res.status}`;
          }
          return res;
        } catch (err) {
          clearTimeout(timeoutId);
          upstreamStatus = err?.name === "AbortError" ? "TIMEOUT_12S" : err?.message || "FETCH_FAILED";
          return null;
        }
      }, "callLlm");
      let resp = await callLlm(DEFAULT_MODEL);
      if (!resp || !resp.ok) {
        resp = await callLlm(BACKUP_MODEL);
      }
      if (resp && resp.ok) {
        try {
          const data = await resp.json();
          const rawContent = data.choices?.[0]?.message?.content || "";
          let cleaned = rawContent.trim();
          const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
          if (jsonMatch) cleaned = jsonMatch[0];
          const parsed = JSON.parse(cleaned);
          if (Array.isArray(parsed) && parsed.length > 0) {
            candidateList = parsed;
            modelName = "PaceBowl-AI-Flash";
          }
        } catch (err) {
          upstreamStatus = "JSON_PARSE_ERROR";
        }
      }
    }
    if (!candidateList && context.env.AI && typeof context.env.AI.run === "function") {
      try {
        const aiResp = await context.env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Reddit topic: "${topic}"` }
          ],
          max_tokens: 600
        });
        const rawText = aiResp?.response || "";
        const match2 = rawText.match(/\[[\s\S]*\]/);
        if (match2) {
          const parsed = JSON.parse(match2[0]);
          if (Array.isArray(parsed) && parsed.length > 0) {
            candidateList = parsed;
            modelName = "PaceBowl-Cloudflare-AI";
          }
        }
      } catch {
      }
    }
    if (!candidateList || candidateList.length === 0) {
      candidateList = generateEdgeSynthesizedCandidates(topic);
      modelName = "PaceBowl-Edge-Flash";
    }
    return new Response(
      JSON.stringify({
        success: true,
        model: modelName,
        upstreamStatus,
        candidates: candidateList
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err) {
    const fallbackCandidates = generateEdgeSynthesizedCandidates("");
    return new Response(
      JSON.stringify({
        success: true,
        model: "PaceBowl-Edge-Flash",
        candidates: fallbackCandidates
      }),
      { status: 200, headers: corsHeaders }
    );
  }
}, "onRequestPost");
var onRequestOptions2 = /* @__PURE__ */ __name(async () => {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}, "onRequestOptions");

// ../.wrangler/tmp/pages-YMRc5z/functionsRoutes-0.6237155113121982.mjs
var routes = [
  {
    routePath: "/api/auth",
    mountPath: "/api",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions]
  },
  {
    routePath: "/api/auth",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost]
  },
  {
    routePath: "/api/generate",
    mountPath: "/api",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions2]
  },
  {
    routePath: "/api/generate",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost2]
  }
];

// C:/Users/m8oo/AppData/Roaming/npm/node_modules/wrangler/node_modules/path-to-regexp/dist.es2015/index.js
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");

// C:/Users/m8oo/AppData/Roaming/npm/node_modules/wrangler/templates/pages-template-worker.ts
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");
export {
  pages_template_worker_default as default
};
