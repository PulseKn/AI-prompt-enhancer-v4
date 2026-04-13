// ==UserScript==
// @name         ✦ AI Prompt Enhancer
// @namespace    https://github.com/PulseKn
// @version      4.0.0
// @description  Supercharge prompts on all major AI chat platforms — desktop & mobile adaptive
// @author       AI Prompt Enhancer
// @match        https://claude.ai/*
// @match        https://chatgpt.com/*
// @match        https://chat.openai.com/*
// @match        https://gemini.google.com/*
// @match        https://chat.deepseek.com/*
// @match        https://x.com/i/grok*
// @match        https://x.com/*
// @match        https://grok.com/*
// @match        https://grok.x.ai/*
// @match        https://kimi.moonshot.cn/*
// @match        https://kimi.ai/*
// @match        https://chat.qwen.ai/*
// @match        https://tongyi.aliyun.com/*
// @match        https://qianwen.aliyun.com/*
// @match        https://www.perplexity.ai/*
// @match        https://perplexity.ai/*
// @match        https://copilot.microsoft.com/*
// @match        https://bing.com/chat*
// @match        https://www.bing.com/chat*
// @match        https://poe.com/*
// @match        https://huggingface.co/chat/*
// @match        https://chat.mistral.ai/*
// @match        https://mistral.ai/*
// @match        https://you.com/*
// @match        https://pi.ai/*
// @match        https://hailuoai.com/*
// @match        https://www.hailuoai.com/*
// @match        https://www.coze.com/*
// @match        https://coze.cn/*
// @match        https://character.ai/*
// @match        https://www.character.ai/*
// @match        https://phind.com/*
// @match        https://www.phind.com/*
// @match        https://www.meta.ai/*
// @match        https://meta.ai/*
// @match        https://aistudio.google.com/*
// @match        https://chat.lmsys.org/*
// @match        https://lmarena.ai/*
// @match        https://groq.com/*
// @match        https://chat.groq.com/*
// @match        https://openrouter.ai/*
// @match        https://chat.openrouter.ai/*
// @match        https://playground.openai.com/*
// @match        https://platform.openai.com/*
// @match        https://together.ai/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  // ─── DEVICE DETECTION ───────────────────────────────────────────────────────
  const MOB = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent)
    || (navigator.maxTouchPoints > 1 && window.innerWidth <= 768);

  // ─── SITE DETECTION ─────────────────────────────────────────────────────────
  const SITES = {
    claude:     { name: 'Claude',       color: '#da7756', host: /claude\.ai/ },
    chatgpt:    { name: 'ChatGPT',      color: '#10a37f', host: /chatgpt\.com|chat\.openai\.com|playground\.openai|platform\.openai/ },
    gemini:     { name: 'Gemini',       color: '#4285f4', host: /gemini\.google\.com|aistudio\.google/ },
    deepseek:   { name: 'DeepSeek',     color: '#4d6bfe', host: /chat\.deepseek\.com/ },
    grok:       { name: 'Grok',         color: '#1d9bf0', host: /x\.com.*grok|grok\.com|grok\.x\.ai/ },
    kimi:       { name: 'Kimi',         color: '#6b5ce7', host: /kimi\.moonshot\.cn|kimi\.ai/ },
    qwen:       { name: 'Qwen',         color: '#ff6b35', host: /chat\.qwen\.ai|tongyi\.aliyun|qianwen\.aliyun/ },
    perplexity: { name: 'Perplexity',   color: '#20b2aa', host: /perplexity\.ai/ },
    copilot:    { name: 'Copilot',      color: '#0078d4', host: /copilot\.microsoft\.com|bing\.com\/chat/ },
    poe:        { name: 'Poe',          color: '#8b5cf6', host: /poe\.com/ },
    hf:         { name: 'HuggingChat',  color: '#ff9d00', host: /huggingface\.co/ },
    mistral:    { name: 'Mistral',      color: '#f97316', host: /mistral\.ai/ },
    you:        { name: 'You.com',      color: '#6366f1', host: /you\.com/ },
    pi:         { name: 'Pi',           color: '#ec4899', host: /pi\.ai/ },
    meta:       { name: 'Meta AI',      color: '#0866ff', host: /meta\.ai/ },
    coze:       { name: 'Coze',         color: '#2563eb', host: /coze\.com|coze\.cn/ },
    character:  { name: 'Character.AI', color: '#7c3aed', host: /character\.ai/ },
    phind:      { name: 'Phind',        color: '#06b6d4', host: /phind\.com/ },
    groq:       { name: 'Groq',         color: '#f43f5e', host: /groq\.com/ },
    openrouter: { name: 'OpenRouter',   color: '#84cc16', host: /openrouter\.ai/ },
    lmarena:    { name: 'LM Arena',     color: '#a855f7', host: /lmarena\.ai|chat\.lmsys\.org/ },
    hailuo:     { name: 'Hailuo AI',    color: '#14b8a6', host: /hailuoai\.com/ },
    together:   { name: 'Together AI',  color: '#f59e0b', host: /together\.ai/ },
  };

  function detectSite() {
    const href = location.href;
    for (const [key, s] of Object.entries(SITES)) if (s.host.test(href)) return { key, ...s };
    return { key: 'unknown', name: 'AI Chat', color: '#6366f1' };
  }
  const SITE = detectSite();

  // ─── TEXTAREA SELECTORS ──────────────────────────────────────────────────────
  const SEL = {
    claude:     '[data-testid="chat-input"], div[contenteditable="true"].ProseMirror, textarea',
    chatgpt:    '#prompt-textarea, textarea[data-id], div[contenteditable="true"]',
    gemini:     '.ql-editor[contenteditable="true"], rich-textarea .ql-editor, textarea',
    deepseek:   'textarea#chat-input, textarea, div[contenteditable="true"]',
    copilot:    'textarea, cib-text-input textarea, div[contenteditable="true"]',
    poe:        'textarea[class*="GrowingTextArea"], textarea, div[contenteditable="true"]',
  };
  const FALLBACK = [
    'textarea[placeholder*="message" i]','textarea[placeholder*="ask" i]',
    'textarea[placeholder*="type" i]','textarea[placeholder*="chat" i]',
    'textarea[placeholder*="prompt" i]','div[contenteditable="true"][aria-label]',
    'div[contenteditable="true"][aria-multiline="true"]',
    'div[contenteditable="true"][class*="input" i]',
    'div[contenteditable="true"][class*="editor" i]',
    'textarea','div[contenteditable="true"]',
  ];

  function isLive(el) {
    if (!el || el.disabled || el.readOnly) return false;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return false;
    const cs = getComputedStyle(el);
    return cs.display !== 'none' && cs.visibility !== 'hidden' && cs.opacity !== '0';
  }
  function getTA() {
    const list = (SEL[SITE.key] || '').split(',').map(s => s.trim()).filter(Boolean);
    for (const s of [...list, ...FALLBACK]) {
      try { const el = document.querySelector(s); if (isLive(el)) return el; } catch (_) {}
    }
    return [...document.querySelectorAll('textarea,div[contenteditable="true"]')].find(isLive) || null;
  }
  function getText() {
    const ta = getTA();
    return ta ? (ta.value !== undefined ? ta.value : ta.innerText || ta.textContent || '') : '';
  }
  function setText(text) {
    const ta = getTA(); if (!ta) return;
    ta.focus();
    if (ta.tagName === 'TEXTAREA' || ta.tagName === 'INPUT') {
      const proto = window[ta.tagName === 'TEXTAREA' ? 'HTMLTextAreaElement' : 'HTMLInputElement'].prototype;
      const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
      if (setter) setter.call(ta, text); else ta.value = text;
      ta.dispatchEvent(new Event('input', { bubbles: true }));
      ta.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      const sel = window.getSelection(), range = document.createRange();
      range.selectNodeContents(ta); sel.removeAllRanges(); sel.addRange(range);
      if (!document.execCommand('insertText', false, text)) {
        ta.innerText = text;
        ta.dispatchEvent(new Event('input', { bubbles: true }));
        ta.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
    ta.focus();
    try {
      if (ta.tagName === 'TEXTAREA' || ta.tagName === 'INPUT') {
        ta.selectionStart = ta.selectionEnd = ta.value.length;
      } else {
        const range = document.createRange(); range.selectNodeContents(ta); range.collapse(false);
        const s = window.getSelection(); s.removeAllRanges(); s.addRange(range);
      }
    } catch (_) {}
  }

  // ─── MODES ──────────────────────────────────────────────────────────────────
  const MODES = {
    precise:     { label: '🎯 Precise',           desc: 'Clear, structured, unambiguous',       fn: p => `Respond with precision and clarity. Be specific, avoid ambiguity, structure your answer logically.\n\n${p}` },
    detailed:    { label: '📋 Detailed',           desc: 'Comprehensive, thorough answers',       fn: p => `Provide a comprehensive and detailed response. Include context, examples, edge cases, and thorough explanations.\n\n${p}` },
    creative:    { label: '🎨 Creative',           desc: 'Imaginative, original thinking',        fn: p => `Approach this with creativity and originality. Think outside the box and explore unconventional angles.\n\n${p}` },
    concise:     { label: '⚡ Concise',            desc: 'Short, direct, to-the-point',           fn: p => `Be concise and direct. Provide only the essential information without unnecessary elaboration.\n\n${p}` },
    stepbystep:  { label: '🪜 Step-by-Step',      desc: 'Sequential numbered walkthrough',       fn: p => `Break this down into clear numbered steps. Walk me through the process sequentially, explaining each step.\n\n${p}` },
    expert:      { label: '🧠 Expert',             desc: 'Deep domain expertise & precision',     fn: p => `Respond as a world-class domain expert. Use technical depth, precise terminology, and assume high prior knowledge.\n\n${p}` },
    eli5:        { label: '👶 ELI5',               desc: 'Explain like I\'m five',                fn: p => `Explain this in the simplest possible terms, as if to a complete beginner. Use analogies and plain language.\n\n${p}` },
    devil:       { label: '😈 Devil\'s Advocate',  desc: 'Challenge assumptions, find flaws',     fn: p => `Play devil's advocate. Challenge the premise, identify weaknesses, explore counterarguments, and point out risks.\n\n${p}` },
    structured:  { label: '📊 Structured',         desc: 'Headers, bullets, tables',              fn: p => `Respond with a well-structured format. Use headers, bullet points, numbered lists, and tables where appropriate.\n\n${p}` },
    codemode:    { label: '💻 Code Mode',           desc: 'Production-ready code & explanation',  fn: p => `This is a coding task. Write clean, well-commented, production-ready code. Explain your approach, handle edge cases, include error handling, and follow best practices.\n\n${p}` },
    socratic:    { label: '❓ Socratic',           desc: 'Guide with questions & reasoning',      fn: p => `Use the Socratic method. Guide me with thoughtful questions that help me discover the answer myself.\n\n${p}` },
    compare:     { label: '⚖️ Compare',            desc: 'Pros, cons, trade-offs',               fn: p => `Provide a balanced comparison. Analyze pros and cons, compare alternatives, weigh trade-offs, and explain the full decision space.\n\n${p}` },
    roblox:      { label: '🎮 Roblox Script',      desc: 'Roblox Lua scripts & game dev',        fn: p => `You are an expert Roblox game developer with deep knowledge of Luau, Roblox API services (Players, RunService, TweenService, DataStoreService, ReplicatedStorage, ServerScriptService, etc.), LocalScripts vs Scripts vs ModuleScripts, RemoteEvents/RemoteFunctions, DataStores, physics/constraints, and anti-exploit best practices.\n\nFor every script: state its type, where it goes in Explorer, use pcall() for error-prone calls, add clear comments, and flag security considerations.\n\nRequest:\n${p}` },
    robloxui:    { label: '🖼️ Roblox GUI',         desc: 'ScreenGui, frames, buttons & UX',      fn: p => `You are a Roblox UI/UX expert. Build polished GUIs using ScreenGui/SurfaceGui/BillboardGui, Frame/ScrollingFrame/TextButton/ImageButton, UIListLayout/UIGridLayout/UIPadding/UICorner/UIStroke, TweenService animations, and responsive UDim2 scale values. Provide exact property values, full LocalScript code, Explorer hierarchy, and animations.\n\nRequest:\n${p}` },
    robloxdbg:   { label: '🐛 Roblox Debug',       desc: 'Fix & optimize Roblox Lua code',       fn: p => `You are a Roblox Luau debugging expert. Analyze the code and provide:\n🐛 Bugs Found — what's wrong and WHY\n✅ Fixed Code — complete corrected version\n⚡ Optimizations — performance improvements\n🔒 Security Notes — exploit risks and fixes\n\n${p}` },
    mastercoder: { label: '🖥️ Master Coder',        desc: 'Any language, stack, or platform',     fn: p => `You are a world-class software engineer fluent in every major language and framework: JS/TS, Python, Rust, Go, C/C++, C#, Java, Kotlin, Swift, PHP, Ruby, Lua, Bash, SQL, Dart, Zig, Solidity; React/Next.js/Vue/Svelte/Angular/Tailwind/Three.js/Electron; Node/Express/Django/FastAPI/Spring/Laravel/Rails; React Native/Flutter/SwiftUI; PostgreSQL/MongoDB/Redis/Supabase/Firebase/Prisma; Docker/K8s/GitHub Actions/AWS/GCP/Azure; Unity/Godot/Unreal/Roblox; REST/GraphQL/WebSockets/gRPC/OAuth2.\n\nAlways: write complete production-ready code with no stubs, add error handling, provide setup steps, and note security considerations.\n\nRequest:\n${p}` },
    apicoder:    { label: '🔌 API & Integrations', desc: 'REST, GraphQL, webhooks, SDKs',        fn: p => `You are an API integration expert. Provide complete working code with proper auth (API keys, OAuth2, Bearer tokens, refresh logic), realistic request/response examples, error handling (rate limits, retries with exponential backoff, timeouts), webhook setup, secure env-var secrets management, and official SDK usage where available.\n\nRequest:\n${p}` },
    dbcoder:     { label: '🗄️ Database',           desc: 'SQL, NoSQL, ORMs, schema design',      fn: p => `You are a database architecture and query optimization expert. Cover: schema design (types, constraints, indexes, foreign keys), raw SQL (PostgreSQL by default), ORM equivalents (Prisma, Drizzle, SQLAlchemy, TypeORM), query optimization, migration scripts, NoSQL patterns where relevant, and transactions/concurrency.\n\nRequest:\n${p}` },
    scripter:    { label: '⚙️ Automation',         desc: 'Bash, Python, PowerShell scripts',     fn: p => `You are an automation and scripting expert. Write a complete, robust script with argument parsing, solid error handling, idempotency where possible, a usage comment block at the top, and use the right tool (Bash for system tasks, Python for data/APIs, PowerShell for Windows). Include runtime requirements, deps, and example invocations.\n\nRequest:\n${p}` },
  };

  // ─── SITE HINTS ─────────────────────────────────────────────────────────────
  const HINTS = {
    claude:     'Use extended thinking if beneficial. Reason step by step.',
    chatgpt:    'Use markdown formatting. Use code blocks for code.',
    gemini:     'Use Google Search grounding where relevant. Format with markdown.',
    deepseek:   'Apply chain-of-thought reasoning. Show your thinking process.',
    grok:       'Be direct and thorough.',
    kimi:       'Take advantage of long context. Reference earlier conversation if relevant.',
    qwen:       'Apply multilingual reasoning if helpful. Use structured formatting.',
    perplexity: 'Include inline citations and web sources. Prioritize recent information.',
    copilot:    'Integrate Microsoft ecosystem context where relevant. Use markdown.',
    poe:        'Be thorough and well-structured.',
    hf:         'Use markdown formatting. Be technically precise.',
    mistral:    'Be precise and efficient. Use markdown for structure.',
    you:        'Use web sources where helpful. Cite references inline.',
    pi:         'Be conversational but thorough and accurate.',
    meta:       'Use markdown formatting. Be comprehensive.',
    coze:       'Be structured and precise.',
    character:  'Be detailed, consistent, and engaging.',
    phind:      'Focus on technical accuracy. Include code examples where relevant.',
    groq:       'Be concise and technically precise.',
    openrouter: 'Be thorough and well-formatted using markdown.',
    lmarena:    'Provide a comprehensive, high-quality response.',
    hailuo:     'Be clear, structured, and detailed.',
    together:   'Apply best practices. Be technically thorough.',
    unknown:    '',
  };

  // ─── SETTINGS ───────────────────────────────────────────────────────────────
  const C = {
    enabled:      GM_getValue('enabled', true),
    mode:         GM_getValue('mode', 'precise'),
    autoEnhance:  GM_getValue('autoEnhance', false),
    siteHints:    GM_getValue('siteHints', true),
    historyOn:    GM_getValue('historyOn', true),
    customPrefix: GM_getValue('customPrefix', ''),
    customSuffix: GM_getValue('customSuffix', ''),
  };
  let HIST = JSON.parse(GM_getValue('history', '[]'));
  function save(k, v) { C[k] = v; GM_setValue(k, v); }

  // ─── ENHANCE ────────────────────────────────────────────────────────────────
  function enhance(orig) {
    if (!orig.trim()) return orig;
    let out = MODES[C.mode].fn(orig);
    if (C.siteHints && HINTS[SITE.key]) out += `\n\n[${SITE.name} hint: ${HINTS[SITE.key]}]`;
    if (C.customPrefix.trim()) out = C.customPrefix.trim() + '\n\n' + out;
    if (C.customSuffix.trim()) out = out + '\n\n' + C.customSuffix.trim();
    return out;
  }
  function doEnhance() {
    if (!C.enabled) { toast('⚠ Enhancer is disabled'); return; }
    const orig = getText();
    if (!orig.trim()) { toast('💬 Type a prompt first'); return; }
    setText(enhance(orig));
    if (C.historyOn) {
      HIST.push({ original: orig, mode: C.mode, site: SITE.key, time: new Date().toLocaleTimeString() });
      if (HIST.length > 50) HIST.shift();
      GM_setValue('history', JSON.stringify(HIST));
    }
    toast(`✦ Enhanced · ${MODES[C.mode].label}`);
  }

  // ─── TOAST ──────────────────────────────────────────────────────────────────
  let toastT;
  function toast(msg) {
    const el = document.getElementById('ape-toast'); if (!el) return;
    el.textContent = msg; el.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(() => el.classList.remove('show'), 2400);
  }

  // ─── STYLES ─────────────────────────────────────────────────────────────────
  const AC = SITE.color;
  GM_addStyle(`
    @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@400;600;700;800&display=swap');

    :root {
      --ac:${AC}; --acd:${AC}30; --bg:#0d0d0f;
      --s1:#141418; --s2:#1c1c22; --s3:#242430; --br:#2a2a38;
      --tx:#e8e8f0; --mu:#7a7a98;
      --fn:'Syne',sans-serif; --mo:'DM Mono',monospace;
    }

    /* ─ FAB ─ */
    #ape-fab {
      position:fixed; bottom:24px; right:20px; z-index:2147483640;
      width:54px; height:54px; border-radius:50%;
      background:var(--ac); border:none; cursor:pointer; color:#fff;
      display:flex; align-items:center; justify-content:center; font-size:22px;
      box-shadow:0 4px 24px var(--acd),0 2px 8px #0009;
      transition:transform .2s cubic-bezier(.34,1.56,.64,1),box-shadow .2s;
      -webkit-tap-highlight-color:transparent; touch-action:manipulation; user-select:none;
    }
    #ape-fab:hover  { transform:scale(1.12) rotate(-10deg); box-shadow:0 8px 32px var(--ac),0 2px 8px #0008; }
    #ape-fab:active { transform:scale(0.93); }
    #ape-fab.on     { transform:rotate(45deg) scale(1.05); }
    /* Mobile FAB — bigger, safe area */
    body.mob #ape-fab {
      width:62px; height:62px; font-size:26px;
      bottom:calc(20px + env(safe-area-inset-bottom,0px));
      right:16px;
    }

    /* ─ QUICK-ENHANCE BUTTON  (desktop) ─ */
    #ape-qbtn {
      position:fixed; z-index:2147483639; bottom:88px; right:20px;
      background:var(--s2); border:1.5px solid var(--br); border-radius:28px;
      color:var(--tx); font-family:var(--fn); font-size:12px; font-weight:600;
      letter-spacing:.05em; padding:8px 16px; cursor:pointer;
      display:flex; align-items:center; gap:7px;
      box-shadow:0 2px 12px #0006; transition:all .18s ease; white-space:nowrap;
      -webkit-tap-highlight-color:transparent; touch-action:manipulation;
    }
    #ape-qbtn:hover  { background:var(--ac); border-color:var(--ac); color:#fff; transform:translateY(-2px); box-shadow:0 6px 20px var(--acd); }
    #ape-qbtn:active { transform:scale(.96); }
    #ape-qbtn .bdg   { background:var(--acd); color:var(--ac); border-radius:20px; padding:2px 8px; font-size:10px; letter-spacing:.08em; }
    #ape-qbtn:hover .bdg { background:#ffffff33; color:#fff; }
    body.mob #ape-qbtn { display:none; }  /* hidden on mobile */

    /* ─ MOBILE MODE-CHIPS BAR ─ */
    #ape-chips {
      display:none; position:fixed; z-index:2147483638;
      bottom:calc(96px + env(safe-area-inset-bottom,0px));
      left:0; right:0; padding:0 12px 4px;
      flex-direction:row; align-items:center; justify-content:flex-end;
      gap:7px; overflow-x:auto; scrollbar-width:none;
      -webkit-overflow-scrolling:touch;
    }
    #ape-chips::-webkit-scrollbar { display:none; }
    body.mob #ape-chips { display:flex; }
    .chip {
      flex-shrink:0; padding:8px 14px; border-radius:20px;
      background:var(--s2); border:1.5px solid var(--br);
      color:var(--mu); font-family:var(--fn); font-size:12px; font-weight:700;
      cursor:pointer; white-space:nowrap; transition:all .15s;
      -webkit-tap-highlight-color:transparent; touch-action:manipulation;
      box-shadow:0 2px 8px #0005;
    }
    .chip.chip-on,.chip:active { background:var(--acd); border-color:var(--ac); color:var(--ac); }

    /* ─ BACKDROP  (mobile only) ─ */
    #ape-bd {
      display:none; position:fixed; inset:0; z-index:2147483644;
      background:#00000075; backdrop-filter:blur(3px); -webkit-backdrop-filter:blur(3px);
    }
    #ape-bd.show { display:block; animation:fadeIn .2s ease; }
    @keyframes fadeIn { from{opacity:0} to{opacity:1} }

    /* ─ PANEL (shared) ─ */
    #ape-panel {
      position:fixed; z-index:2147483645;
      background:var(--bg); border:1px solid var(--br);
      font-family:var(--fn); color:var(--tx);
      display:none; overflow-y:auto;
      scrollbar-width:thin; scrollbar-color:var(--br) transparent;
      box-shadow:0 24px 80px #000b,0 0 0 1px #ffffff09;
    }
    #ape-panel.open { display:block; }

    /* Desktop */
    body:not(.mob) #ape-panel {
      bottom:90px; right:20px; width:440px; max-height:84vh; border-radius:18px;
    }
    body:not(.mob) #ape-panel.open { animation:slideUp .25s cubic-bezier(.34,1.56,.64,1); }
    @keyframes slideUp { from{opacity:0;transform:translateY(20px) scale(.96)} to{opacity:1;transform:translateY(0) scale(1)} }

    /* Mobile — bottom sheet */
    body.mob #ape-panel {
      bottom:0; left:0; right:0; width:100%;
      max-height:90vh; border-radius:22px 22px 0 0; border-bottom:none;
      padding-bottom:env(safe-area-inset-bottom,0px);
    }
    body.mob #ape-panel.open { animation:sheetUp .3s cubic-bezier(.32,1.2,.5,1); }
    @keyframes sheetUp { from{opacity:0;transform:translateY(100%)} to{opacity:1;transform:translateY(0)} }
    /* drag pill */
    body.mob #ape-panel::before {
      content:''; display:block; width:42px; height:5px;
      background:var(--br); border-radius:5px; margin:10px auto 2px;
    }

    /* ─ HEADER ─ */
    .hdr {
      display:flex; align-items:center; justify-content:space-between;
      padding:16px 20px 12px; border-bottom:1px solid var(--br);
      position:sticky; top:0; background:var(--bg); z-index:2;
      border-radius:18px 18px 0 0;
    }
    body.mob .hdr { border-radius:22px 22px 0 0; padding:14px 18px 11px; }
    .hdr-l { display:flex; flex-direction:column; gap:3px; }
    .hdr-t  { font-size:15px; font-weight:800; letter-spacing:-.01em; color:var(--tx); }
    .hdr-s  { font-size:11px; color:var(--mu); font-family:var(--mo); }
    body.mob .hdr-t { font-size:17px; }
    body.mob .hdr-s { font-size:12px; }
    .site-chip {
      display:inline-flex; align-items:center; gap:5px;
      padding:4px 11px; border-radius:20px;
      background:var(--acd); color:var(--ac);
      font-size:11px; font-weight:700; letter-spacing:.05em;
    }
    .site-chip::before { content:''; width:6px; height:6px; border-radius:50%; background:var(--ac); }

    /* ─ TABS ─ */
    .tabs {
      display:flex; gap:2px; padding:10px 16px 0; border-bottom:1px solid var(--br);
      overflow-x:auto; scrollbar-width:none;
    }
    .tabs::-webkit-scrollbar { display:none; }
    .tab {
      flex-shrink:0; padding:8px 13px; border-radius:8px 8px 0 0;
      font-size:12px; font-weight:700; letter-spacing:.04em; cursor:pointer;
      color:var(--mu); transition:all .15s; border:none; background:none;
      font-family:var(--fn); position:relative; bottom:-1px;
      -webkit-tap-highlight-color:transparent; touch-action:manipulation;
    }
    body.mob .tab { padding:11px 15px; font-size:14px; }
    .tab.on { color:var(--tx); background:var(--s1); border:1px solid var(--br); border-bottom:1px solid var(--s1); }

    /* ─ PANES ─ */
    .pane { display:none; padding:16px 18px; }
    .pane.on { display:block; }
    body.mob .pane { padding:14px 16px; }

    .lbl { font-size:10px; font-weight:700; letter-spacing:.12em; color:var(--mu); text-transform:uppercase; margin:0 0 10px; }
    .sec { margin-bottom:16px; }
    .gap { height:10px; }

    /* ─ MODE GRID ─ */
    .grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:14px; }
    body.mob .grid { gap:10px; }
    .card {
      padding:11px 13px; border-radius:10px; border:1.5px solid var(--br);
      cursor:pointer; transition:all .15s; background:var(--s1);
      display:flex; flex-direction:column; gap:3px;
      -webkit-tap-highlight-color:transparent; touch-action:manipulation;
    }
    body.mob .card { padding:13px 14px; border-radius:13px; }
    .card:hover  { border-color:var(--ac); background:var(--s2); }
    .card:active { transform:scale(.97); }
    .card.sel { border-color:var(--ac); background:var(--acd); }
    .card-top  { display:flex; align-items:center; gap:6px; font-size:13px; font-weight:700; color:var(--tx); }
    body.mob .card-top { font-size:14px; }
    .card.sel .card-top { color:var(--ac); }
    .card-desc { font-size:10px; color:var(--mu); font-family:var(--mo); line-height:1.4; }
    body.mob .card-desc { font-size:11px; }

    /* ─ BUTTONS ─ */
    .btn {
      width:100%; padding:13px; background:var(--ac); color:#fff; border:none;
      border-radius:11px; font-family:var(--fn); font-size:13px; font-weight:800;
      letter-spacing:.05em; cursor:pointer; transition:all .2s;
      display:flex; align-items:center; justify-content:center; gap:8px; margin-top:4px;
      -webkit-tap-highlight-color:transparent; touch-action:manipulation;
    }
    body.mob .btn { padding:16px; font-size:16px; border-radius:14px; }
    .btn:hover  { filter:brightness(1.14); transform:translateY(-1px); box-shadow:0 6px 20px var(--acd); }
    .btn:active { transform:scale(.97); filter:brightness(.95); }
    .btn.ghost  { background:var(--s2); color:var(--tx); border:1.5px solid var(--br); }
    .btn.ghost:hover { filter:none; background:var(--s3); border-color:var(--mu); transform:none; }

    /* ─ PREVIEW ─ */
    .prev {
      background:var(--s1); border:1px solid var(--br); border-radius:10px;
      padding:12px; font-family:var(--mo); font-size:11px; line-height:1.6;
      color:var(--mu); max-height:130px; overflow-y:auto;
      white-space:pre-wrap; word-break:break-word; margin-bottom:12px;
      scrollbar-width:thin; -webkit-overflow-scrolling:touch;
    }
    body.mob .prev { font-size:12px; max-height:110px; }

    /* ─ TOGGLE ROWS ─ */
    .row {
      display:flex; align-items:center; justify-content:space-between;
      padding:11px 0; border-bottom:1px solid var(--br);
    }
    body.mob .row { padding:15px 0; }
    .row:last-child { border-bottom:none; }
    .row-info { display:flex; flex-direction:column; gap:2px; }
    .row-lbl  { font-size:13px; font-weight:600; color:var(--tx); }
    .row-desc { font-size:11px; color:var(--mu); font-family:var(--mo); }
    body.mob .row-lbl  { font-size:15px; }
    body.mob .row-desc { font-size:12px; }
    .tog { position:relative; width:44px; height:24px; flex-shrink:0; }
    body.mob .tog { width:52px; height:30px; }
    .tog input { opacity:0; width:0; height:0; }
    .tog-sl {
      position:absolute; inset:0; background:var(--s3); border-radius:30px;
      border:1.5px solid var(--br); cursor:pointer; transition:.2s;
    }
    .tog-sl::before {
      content:''; position:absolute; width:16px; height:16px; left:3px; top:50%;
      transform:translateY(-50%); background:var(--mu); border-radius:50%;
      transition:.2s cubic-bezier(.34,1.56,.64,1);
    }
    body.mob .tog-sl::before { width:22px; height:22px; }
    .tog input:checked + .tog-sl { background:var(--acd); border-color:var(--ac); }
    .tog input:checked + .tog-sl::before { transform:translateY(-50%) translateX(20px); background:var(--ac); }
    body.mob .tog input:checked + .tog-sl::before { transform:translateY(-50%) translateX(22px); }

    /* ─ TEXTAREAS (settings) ─ */
    .ta {
      width:100%; background:var(--s1); border:1.5px solid var(--br); border-radius:10px;
      color:var(--tx); font-family:var(--mo); font-size:12px; padding:10px;
      resize:vertical; min-height:64px; outline:none; box-sizing:border-box; transition:border-color .15s;
    }
    body.mob .ta { font-size:14px; padding:13px; min-height:76px; border-radius:12px; }
    .ta:focus { border-color:var(--ac); }
    .ta-lbl { font-size:11px; color:var(--mu); font-family:var(--mo); margin-bottom:5px; display:block; }
    body.mob .ta-lbl { font-size:13px; }

    /* ─ HISTORY ─ */
    .hitem {
      padding:10px 12px; background:var(--s1); border:1px solid var(--br);
      border-radius:9px; margin-bottom:8px; cursor:pointer; transition:all .15s;
      display:flex; flex-direction:column; gap:4px;
      -webkit-tap-highlight-color:transparent; touch-action:manipulation;
    }
    body.mob .hitem { padding:14px; border-radius:13px; margin-bottom:10px; }
    .hitem:hover  { border-color:var(--ac); background:var(--s2); }
    .hitem:active { transform:scale(.98); }
    .hmeta { display:flex; align-items:center; justify-content:space-between; }
    .hmode { font-size:10px; font-weight:700; color:var(--ac); letter-spacing:.08em; }
    .htime { font-size:10px; color:var(--mu); font-family:var(--mo); }
    .htxt  { font-size:11px; color:var(--mu); font-family:var(--mo); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    body.mob .hmode { font-size:12px; }
    body.mob .htxt  { font-size:13px; }

    /* ─ CLEAR ─ */
    .clr {
      width:100%; padding:9px; background:transparent; border:1.5px solid var(--br);
      border-radius:9px; color:var(--mu); font-family:var(--fn); font-size:11px;
      font-weight:700; letter-spacing:.05em; cursor:pointer; transition:all .15s; margin-top:4px;
      -webkit-tap-highlight-color:transparent; touch-action:manipulation;
    }
    body.mob .clr { padding:13px; font-size:14px; border-radius:12px; }
    .clr:hover  { border-color:#ef4444; color:#ef4444; background:#ef444411; }
    .clr:active { transform:scale(.97); }

    /* ─ TOAST ─ */
    #ape-toast {
      position:fixed; bottom:96px; left:50%; transform:translateX(-50%) translateY(12px);
      z-index:2147483647; background:var(--s2); border:1px solid var(--br);
      border-radius:24px; padding:10px 20px;
      font-family:var(--fn); font-size:12px; font-weight:600; color:var(--tx);
      box-shadow:0 8px 32px #0009; opacity:0; pointer-events:none; white-space:nowrap;
      transition:all .3s cubic-bezier(.34,1.56,.64,1);
    }
    body.mob #ape-toast { bottom:calc(108px + env(safe-area-inset-bottom,0px)); font-size:14px; padding:12px 24px; }
    #ape-toast.show { opacity:1; transform:translateX(-50%) translateY(0); }

    /* ─ SCROLLBAR ─ */
    #ape-panel::-webkit-scrollbar { width:4px; }
    #ape-panel::-webkit-scrollbar-track { background:transparent; }
    #ape-panel::-webkit-scrollbar-thumb { background:var(--br); border-radius:4px; }
  `);

  // ─── HELPERS ─────────────────────────────────────────────────────────────────
  function mk(tag, props = {}) {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(props)) {
      if (k === 'dataset') Object.assign(e.dataset, v);
      else if (k === 'html') e.innerHTML = v;
      else e[k] = v;
    }
    return e;
  }
  function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function $  (sel, el = document) { return el.querySelector(sel); }
  function $$ (sel, el = document) { return [...el.querySelectorAll(sel)]; }

  // ─── BUILD UI ────────────────────────────────────────────────────────────────
  function buildUI() {
    if (MOB) document.body.classList.add('mob');

    // FAB
    const fab = mk('button', { id:'ape-fab', title:'AI Prompt Enhancer', textContent:'✦' });
    document.body.appendChild(fab);

    // Desktop quick-enhance
    const qbtn = mk('button', { id:'ape-qbtn', html:`✦ Enhance <span class="bdg">${MODES[C.mode].label}</span>` });
    document.body.appendChild(qbtn);

    // Mobile chips bar (top 8 most-used modes)
    const chips = mk('div', { id:'ape-chips' });
    ['precise','detailed','creative','concise','expert','codemode','mastercoder','roblox'].forEach(k => {
      const c = mk('div', { className:`chip${k===C.mode?' chip-on':''}`, textContent:MODES[k].label, dataset:{mode:k} });
      c.addEventListener('click', () => { selectMode(k); doEnhance(); });
      chips.appendChild(c);
    });
    document.body.appendChild(chips);

    // Backdrop
    const bd = mk('div', { id:'ape-bd' });
    document.body.appendChild(bd);

    // Panel
    const panel = mk('div', { id:'ape-panel', html: buildPanelHTML() });
    document.body.appendChild(panel);

    // Toast
    document.body.appendChild(mk('div', { id:'ape-toast' }));

    bind(fab, qbtn, panel, bd);
  }

  function buildPanelHTML() {
    const cards = Object.entries(MODES).map(([k, m]) =>
      `<div class="card${C.mode===k?' sel':''}" data-mode="${k}">
        <div class="card-top">${m.label}</div>
        <div class="card-desc">${m.desc}</div>
       </div>`).join('');

    const histHTML = HIST.length === 0
      ? `<div style="color:var(--mu);font-size:12px;text-align:center;padding:24px 0;font-family:var(--mo)">No history yet.</div>`
      : HIST.slice().reverse().slice(0,20).map((h,i) =>
          `<div class="hitem" data-idx="${HIST.length-1-i}">
            <div class="hmeta"><span class="hmode">${MODES[h.mode]?.label||h.mode}</span><span class="htime">${h.time}</span></div>
            <div class="htxt">${esc(h.original.slice(0,100))}${h.original.length>100?'…':''}</div>
           </div>`).join('');

    return `
    <div class="hdr">
      <div class="hdr-l">
        <div class="hdr-t">✦ Prompt Enhancer</div>
        <div class="hdr-s">v4.0 · ${MOB ? '📱 mobile' : '🖥️ desktop'}</div>
      </div>
      <div class="site-chip">${SITE.name}</div>
    </div>

    <div class="tabs">
      <button class="tab on" data-tab="enhance">Enhance</button>
      <button class="tab" data-tab="preview">Preview</button>
      <button class="tab" data-tab="history">History</button>
      <button class="tab" data-tab="settings">Settings</button>
    </div>

    <!-- ENHANCE -->
    <div class="pane on" data-pane="enhance">
      <div class="sec"><div class="lbl">Enhancement Mode</div><div class="grid">${cards}</div></div>
      <button class="btn" id="ape-do">✦ Enhance Prompt</button>
    </div>

    <!-- PREVIEW -->
    <div class="pane" data-pane="preview">
      <div class="sec"><div class="lbl">Your Prompt</div><div class="prev" id="ape-orig">Click Refresh to see your prompt.</div></div>
      <div class="sec"><div class="lbl">Enhanced Preview</div><div class="prev" id="ape-enh">—</div></div>
      <button class="btn ghost" id="ape-ref">↻ Refresh Preview</button>
      <div class="gap"></div>
      <button class="btn" id="ape-apply">✦ Apply Enhancement</button>
    </div>

    <!-- HISTORY -->
    <div class="pane" data-pane="history">
      <div class="sec"><div class="lbl">Recent Prompts</div><div id="ape-hlist">${histHTML}</div></div>
      <button class="clr" id="ape-clr">🗑 Clear History</button>
    </div>

    <!-- SETTINGS -->
    <div class="pane" data-pane="settings">
      <div class="sec">
        <div class="lbl">Behaviour</div>
        <div class="row"><div class="row-info"><span class="row-lbl">Enabled</span><span class="row-desc">Master on/off switch</span></div><label class="tog"><input type="checkbox" id="s-en" ${C.enabled?'checked':''}><span class="tog-sl"></span></label></div>
        <div class="row"><div class="row-info"><span class="row-lbl">Auto-enhance on send</span><span class="row-desc">Intercept Enter key</span></div><label class="tog"><input type="checkbox" id="s-au" ${C.autoEnhance?'checked':''}><span class="tog-sl"></span></label></div>
        <div class="row"><div class="row-info"><span class="row-lbl">AI-specific hints</span><span class="row-desc">Append site-tailored instructions</span></div><label class="tog"><input type="checkbox" id="s-sh" ${C.siteHints?'checked':''}><span class="tog-sl"></span></label></div>
        <div class="row"><div class="row-info"><span class="row-lbl">Save history</span><span class="row-desc">Remember enhanced prompts</span></div><label class="tog"><input type="checkbox" id="s-ho" ${C.historyOn?'checked':''}><span class="tog-sl"></span></label></div>
      </div>
      <div class="sec">
        <div class="lbl">Custom Wrappers</div>
        <span class="ta-lbl">Prefix (prepended to every prompt)</span>
        <textarea class="ta" id="s-pre" placeholder="e.g. You are an expert in...">${C.customPrefix}</textarea>
        <div class="gap"></div>
        <span class="ta-lbl">Suffix (appended after every prompt)</span>
        <textarea class="ta" id="s-suf" placeholder="e.g. Format as markdown.">${C.customSuffix}</textarea>
      </div>
    </div>`;
  }

  // ─── MODE SELECT ─────────────────────────────────────────────────────────────
  function selectMode(k) {
    save('mode', k);
    $$('.card').forEach(c => c.classList.toggle('sel', c.dataset.mode === k));
    $$('.chip').forEach(c => c.classList.toggle('chip-on', c.dataset.mode === k));
    const q = document.getElementById('ape-qbtn');
    if (q) q.innerHTML = `✦ Enhance <span class="bdg">${MODES[k].label}</span>`;
  }

  // ─── OPEN / CLOSE ────────────────────────────────────────────────────────────
  function open(panel, fab, bd) {
    panel.classList.add('open'); fab.classList.add('on');
    if (MOB) bd.classList.add('show');
  }
  function close(panel, fab, bd) {
    panel.classList.remove('open'); fab.classList.remove('on');
    if (MOB) bd.classList.remove('show');
  }

  // ─── EVENTS ─────────────────────────────────────────────────────────────────
  function bind(fab, qbtn, panel, bd) {
    fab.addEventListener('click', () => panel.classList.contains('open') ? close(panel,fab,bd) : open(panel,fab,bd));
    qbtn.addEventListener('click', doEnhance);
    bd.addEventListener('click', () => close(panel,fab,bd));

    // Mobile swipe-down to dismiss
    if (MOB) {
      let sy = 0;
      panel.addEventListener('touchstart', e => { sy = e.touches[0].clientY; }, { passive:true });
      panel.addEventListener('touchend',   e => { if (e.changedTouches[0].clientY - sy > 80) close(panel,fab,bd); }, { passive:true });
    }

    // Tabs
    $$('.tab', panel).forEach(t => t.addEventListener('click', () => {
      $$('.tab', panel).forEach(x => x.classList.remove('on'));
      $$('.pane', panel).forEach(x => x.classList.remove('on'));
      t.classList.add('on');
      $(`.pane[data-pane="${t.dataset.tab}"]`, panel).classList.add('on');
    }));

    // Mode cards
    $$('.card', panel).forEach(c => c.addEventListener('click', () => selectMode(c.dataset.mode)));

    // Enhance
    $('#ape-do', panel).addEventListener('click', () => { doEnhance(); close(panel,fab,bd); });

    // Preview
    $('#ape-ref', panel).addEventListener('click', () => {
      const orig = getText();
      $('#ape-orig', panel).textContent = orig || '(empty)';
      $('#ape-enh',  panel).textContent = enhance(orig || '(no prompt)');
    });
    $('#ape-apply', panel).addEventListener('click', () => {
      if (!getText().trim()) { toast('💬 Type a prompt first'); return; }
      doEnhance(); close(panel,fab,bd);
    });

    // History
    $('#ape-clr', panel).addEventListener('click', () => {
      HIST = []; GM_setValue('history', '[]');
      $('#ape-hlist', panel).innerHTML = `<div style="color:var(--mu);font-size:12px;text-align:center;padding:24px 0;font-family:var(--mo)">Cleared.</div>`;
      toast('🗑 History cleared');
    });
    $('#ape-hlist', panel).addEventListener('click', e => {
      const item = e.target.closest('.hitem'); if (!item) return;
      setText(HIST[+item.dataset.idx]?.original || '');
      toast('↩ Prompt restored'); close(panel,fab,bd);
    });

    // Settings
    $('#s-en',  panel).addEventListener('change', e => save('enabled',      e.target.checked));
    $('#s-au',  panel).addEventListener('change', e => save('autoEnhance',  e.target.checked));
    $('#s-sh',  panel).addEventListener('change', e => save('siteHints',    e.target.checked));
    $('#s-ho',  panel).addEventListener('change', e => save('historyOn',    e.target.checked));
    $('#s-pre', panel).addEventListener('input',  e => save('customPrefix', e.target.value));
    $('#s-suf', panel).addEventListener('input',  e => save('customSuffix', e.target.value));

    // Desktop: click outside closes
    if (!MOB) {
      document.addEventListener('click', e => {
        if (!panel.contains(e.target) && e.target !== fab && e.target !== qbtn) close(panel,fab,bd);
      });
    }

    // Auto-enhance intercept
    document.addEventListener('keydown', e => {
      if (!C.enabled || !C.autoEnhance) return;
      if (e.key === 'Enter' && !e.shiftKey) {
        const ta = getTA();
        if (ta && document.activeElement === ta && getText().trim()) {
          e.preventDefault(); e.stopImmediatePropagation(); doEnhance();
          setTimeout(() => ta.dispatchEvent(new KeyboardEvent('keydown',{ key:'Enter', bubbles:true, cancelable:true })), 120);
        }
      }
    }, true);

    // Desktop keyboard shortcuts
    if (!MOB) {
      document.addEventListener('keydown', e => {
        if (e.altKey && e.key === 'e') doEnhance();
        if (e.altKey && e.key === 'p') panel.classList.contains('open') ? close(panel,fab,bd) : open(panel,fab,bd);
      });
    }
  }

  // ─── INIT & SPA RESILIENCE ───────────────────────────────────────────────────
  let scheduled = false;
  function init() { if (document.getElementById('ape-fab') || !document.body) return; buildUI(); }
  function schedule(ms = 900) {
    if (scheduled) return; scheduled = true;
    setTimeout(() => { scheduled = false; init(); }, ms);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => schedule(900));
  else { schedule(200); schedule(900); }

  ['pushState','replaceState'].forEach(fn => {
    const orig = history[fn].bind(history);
    history[fn] = (...a) => { orig(...a); schedule(1000); };
  });
  window.addEventListener('popstate',   () => schedule(1000));
  window.addEventListener('hashchange', () => schedule(800));

  let muT;
  const obs = new MutationObserver(() => {
    if (document.getElementById('ape-fab')) return;
    clearTimeout(muT); muT = setTimeout(init, 1200);
  });
  const startObs = () => obs.observe(document.body, { childList:true, subtree:false });
  document.body ? startObs() : document.addEventListener('DOMContentLoaded', startObs);

  let checks = 0;
  const ticker = setInterval(() => {
    if (++checks > 12) { clearInterval(ticker); return; }
    if (!document.getElementById('ape-fab') && document.body) init();
  }, 5000);

})();
