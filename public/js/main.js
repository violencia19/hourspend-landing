/* ============ WEBGL SHADER MESH GRADIENT (Stripe-style) ============ */
(() => {
  const canvas = document.getElementById('shader-canvas');
  const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false });
  if (!gl) { canvas.parentElement.style.background = 'radial-gradient(ellipse at top, #2D1B4E 0%, #0a0710 70%)'; return; }

  const vertSrc = `
    attribute vec2 a_position;
    void main() { gl_Position = vec4(a_position, 0.0, 1.0); }
  `;

  const fragSrc = `
    precision highp float;
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;

    // Simplex noise (Ashima)
    vec3 mod289(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

    float snoise(vec3 v) {
      const vec2 C = vec2(1.0/6.0, 1.0/3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      i = mod289(i);
      vec4 p = permute(permute(permute(
        i.z + vec4(0.0, i1.z, i2.z, 1.0))
        + i.y + vec4(0.0, i1.y, i2.y, 1.0))
        + i.x + vec4(0.0, i1.x, i2.x, 1.0));
      float n_ = 0.142857142857;
      vec3 ns = n_ * D.wyz - D.xzx;
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_);
      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
      p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution.xy;
      vec2 p = uv * 2.0 - 1.0;
      p.x *= u_resolution.x / u_resolution.y;

      // Mouse influence
      vec2 m = (u_mouse - 0.5) * 2.0;

      float t = u_time * 0.08;

      // Layered noise (FBM)
      float n1 = snoise(vec3(p * 1.2 + m * 0.3, t));
      float n2 = snoise(vec3(p * 2.4 - m * 0.1, t * 1.3 + 10.0)) * 0.5;
      float n3 = snoise(vec3(p * 4.8, t * 0.6 + 20.0)) * 0.25;
      float n = n1 + n2 + n3;

      // HourSpend palette: deep bg → violet → gold accent
      vec3 bg = vec3(0.039, 0.027, 0.063);        // #0a0710
      vec3 violet = vec3(0.17, 0.11, 0.29);        // #2d1b4e
      vec3 violet2 = vec3(0.42, 0.25, 0.63);       // #6c3fa0
      vec3 gold = vec3(0.91, 0.78, 0.43);          // #e8c86e

      vec3 col = bg;
      col = mix(col, violet, smoothstep(-0.4, 0.3, n) * 0.75);
      col = mix(col, violet2, smoothstep(0.0, 0.6, n) * 0.35);
      col = mix(col, gold, smoothstep(0.45, 0.9, n) * 0.22);

      // Subtle vignette
      float v = 1.0 - length(uv - 0.5) * 0.7;
      col *= v;

      gl_FragColor = vec4(col, 1.0);
    }
  `;

  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  }

  const program = gl.createProgram();
  gl.attachShader(program, compile(gl.VERTEX_SHADER, vertSrc));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragSrc));
  gl.linkProgram(program);
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
  const posLoc = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  const uTime = gl.getUniformLocation(program, 'u_time');
  const uRes = gl.getUniformLocation(program, 'u_resolution');
  const uMouse = gl.getUniformLocation(program, 'u_mouse');

  let mouseX = 0.5, mouseY = 0.5;
  window.addEventListener('pointermove', (e) => {
    mouseX = e.clientX / window.innerWidth;
    mouseY = 1 - e.clientY / window.innerHeight;
  }, { passive: true });

  function resize() {
    const dpr = Math.min(window.devicePixelRatio, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  resize();
  window.addEventListener('resize', resize);

  const start = performance.now();
  let tx = mouseX, ty = mouseY;
  function render() {
    const t = (performance.now() - start) / 1000;
    tx += (mouseX - tx) * 0.05;
    ty += (mouseY - ty) * 0.05;
    gl.uniform1f(uTime, t);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform2f(uMouse, tx, ty);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(render);
  }
  render();
})();

/* ============ LENIS SMOOTH SCROLL ============ */
let lenis = null;
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  lenis = new Lenis({
    lerp: 0.08,
    smoothWheel: true,
    touchMultiplier: 1.5,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10*t))
  });

  // Sync with GSAP ScrollTrigger
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  } else {
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
  }
}

/* ============ MAGNETIC BUTTONS ============ */
(() => {
  if (matchMedia('(hover: none)').matches) return;
  document.querySelectorAll('[data-magnetic]').forEach(el => {
    let rect = null;
    const strength = 0.3;

    el.addEventListener('pointerenter', () => {
      rect = el.getBoundingClientRect();
    });
    el.addEventListener('pointermove', (e) => {
      if (!rect) rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width/2) * strength;
      const y = (e.clientY - rect.top - rect.height/2) * strength;
      el.style.transform = `translate(${x}px, ${y}px)`;
    });
    el.addEventListener('pointerleave', () => {
      el.style.transform = '';
      rect = null;
    });
  });
})();

/* ============ SPOTLIGHT ON ELEMENTS ============ */
document.querySelectorAll('[data-spotlight]').forEach(el => {
  el.addEventListener('pointermove', (e) => {
    const r = el.getBoundingClientRect();
    el.style.setProperty('--spot-x', (e.clientX - r.left) + 'px');
    el.style.setProperty('--spot-y', (e.clientY - r.top) + 'px');
  });
});

/* ============ PARALLAX TILT (bento cells) ============ */
(()=>{
  if(matchMedia('(hover: none)').matches)return;
  document.querySelectorAll('[data-tilt]').forEach(el=>{
    let r=null;
    el.style.transformStyle='preserve-3d';
    el.style.willChange='transform';
    el.addEventListener('pointerenter',()=>{r=el.getBoundingClientRect();});
    el.addEventListener('pointermove',e=>{
      if(!r)r=el.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width-0.5;
      const y=(e.clientY-r.top)/r.height-0.5;
      el.style.transform=`perspective(1200px) rotateX(${-y*4.5}deg) rotateY(${x*6}deg) translateZ(0)`;
    });
    el.addEventListener('pointerleave',()=>{el.style.transform='';r=null;});
  });
})();

/* ============ ODOMETER COUNT-UP ============ */
(()=>{
  const items=document.querySelectorAll('[data-count]');
  if(!items.length)return;
  function animate(el,target){
    if(el.dataset.done)return;
    el.dataset.done='1';
    const dur=1400;
    const t0=performance.now();
    const suffix=el.dataset.countSuffix||'';
    (function tick(now){
      const t=Math.min(1,(now-t0)/dur);
      const ease=1-Math.pow(1-t,3);
      el.textContent=Math.round(target*ease).toLocaleString()+suffix;
      if(t<1)requestAnimationFrame(tick);
      else el.textContent=target.toLocaleString()+suffix;
    })(t0);
  }
  const io=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        const el=e.target;
        const to=Number(el.dataset.count);
        if(isFinite(to))animate(el,to);
        io.unobserve(el);
      }
    });
  },{threshold:0.4});
  items.forEach(el=>io.observe(el));
})();

/* ============ CALCULATOR ============ */
// Hoisted lang state (set by i18n init below) — allows calc() to read before i18n block runs
var __currentLang = 'en';
const $ = id => document.getElementById(id);
const salary = $('salary'), hours = $('hours'), expense = $('expense');
const amountEl = $('amount'), labelEl = $('label');
const shareBtn = $('shareBtn'), shareSuccess = $('shareSuccess');

function u(key) {
  // pull unit label from I18N for current lang; safe before I18N is declared (TDZ)
  try {
    const dict = I18N[__currentLang] || I18N.en;
    if (dict && dict[key] != null) return dict[key];
  } catch (e) { /* I18N not yet in scope */ }
  // Hardcoded English fallbacks for initial render before i18n block runs
  const fallback = { 'unit.min': 'min', 'unit.hrs': 'hrs', 'unit.days': 'days', 'unit.weeks': 'weeks', 'unit.months': 'months', 'unit.empty': '—', 'unit.enter': 'enter values', 'calc.for': 'for' };
  return fallback[key] || key;
}

// Locale-aware currency formatting
// Map: symbol, symbol placement ('pre'/'post'), and default (salary/expense) values
var LOCALE_CURR = {
  en: { sym:'$', pos:'pre', salary:3000, exp:5, rate:1,   loc:'en-US' },
  tr: { sym:'₺', pos:'post', salary:30000, exp:100, rate:35, loc:'tr-TR' },
  es: { sym:'€', pos:'post', salary:2500, exp:4, rate:0.93, loc:'es-ES' },
  de: { sym:'€', pos:'post', salary:2500, exp:4, rate:0.93, loc:'de-DE' },
  fr: { sym:'€', pos:'post', salary:2500, exp:4, rate:0.93, loc:'fr-FR' },
  pt: { sym:'R$', pos:'pre', salary:4000, exp:20, rate:5.1, loc:'pt-BR' },
  ja: { sym:'¥', pos:'pre', salary:300000, exp:500, rate:150, loc:'ja-JP' }
};
// Convert a USD amount into the active locale's currency for display on marquee cards
function fmtUSDAsLocal(usd) {
  const loc = LOCALE_CURR[__currentLang] || LOCALE_CURR.en;
  let val = Number(usd) * loc.rate;
  // Round: JPY/KRW/TRY whole numbers; EUR/USD/BRL to nearest 1 below 100, else keep 1 decimal for small
  if (loc.sym === '¥' || loc.sym === '₺') val = Math.round(val);
  else if (val < 10) val = Math.round(val * 100) / 100;
  else val = Math.round(val);
  const nstr = val.toLocaleString(loc.loc);
  return loc.pos === 'post' ? nstr + loc.sym : loc.sym + nstr;
}
function fmtCurr(amount) {
  const loc = LOCALE_CURR[__currentLang] || LOCALE_CURR.en;
  const n = Number(amount);
  const nstr = isFinite(n) ? n.toLocaleString(__currentLang==='tr'?'tr-TR':__currentLang==='de'||__currentLang==='fr'?'de-DE':'en-US') : String(amount);
  return loc.pos === 'pre' ? loc.sym + nstr : nstr + loc.sym;
}
function formatTime(min) {
  if (min < 60) return Math.round(min) + ' ' + u('unit.min');
  if (min < 480) return (min/60).toFixed(1) + ' ' + u('unit.hrs');
  if (min < 2400) return (min/480).toFixed(1) + ' ' + u('unit.days');
  if (min < 10400) return (min/2400).toFixed(1) + ' ' + u('unit.weeks');
  return (min/10400).toFixed(1) + ' ' + u('unit.months');
}
function calc() {
  const s = parseFloat(salary.value) || 0;
  const h = parseFloat(hours.value) || 0;
  const e = parseFloat(expense.value) || 0;
  if (s <= 0 || h <= 0 || e <= 0) {
    amountEl.textContent = u('unit.empty');
    labelEl.textContent = u('unit.enter');
    return;
  }
  const monthlyHours = h * 4.33;
  const hourlyRate = s / monthlyHours;
  const minutes = (e / hourlyRate) * 60;
  amountEl.textContent = formatTime(minutes);
  labelEl.textContent = u('calc.for') + ' ' + fmtCurr(e);
}
/* Strict numeric-only filter — blocks letters, 'e', '+', '-', spaces, paste garbage */
function attachNumericFilter(el) {
  const mode = el.dataset.numeric; // 'int' or 'decimal'
  const allowChar = (ch) => mode === 'decimal' ? /[0-9.]/.test(ch) : /[0-9]/.test(ch);

  el.addEventListener('beforeinput', (e) => {
    if (e.inputType && e.inputType.startsWith('delete')) return;
    const data = e.data;
    if (data == null) return;
    for (const ch of data) {
      if (!allowChar(ch)) { e.preventDefault(); return; }
    }
    // Decimal mode: block a second dot
    if (mode === 'decimal' && data.includes('.') && el.value.includes('.')) {
      e.preventDefault();
    }
  });

  el.addEventListener('input', () => {
    const before = el.value;
    let cleaned = mode === 'decimal'
      ? before.replace(/[^0-9.]/g, '')
      : before.replace(/[^0-9]/g, '');
    if (mode === 'decimal') {
      const parts = cleaned.split('.');
      if (parts.length > 2) cleaned = parts[0] + '.' + parts.slice(1).join('');
    }
    if (cleaned !== before) el.value = cleaned;
    calc();
  });

  el.addEventListener('paste', (e) => {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData('text');
    const cleaned = mode === 'decimal'
      ? text.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')
      : text.replace(/[^0-9]/g, '');
    document.execCommand('insertText', false, cleaned);
  });
}
[salary, hours, expense].forEach(attachNumericFilter);
document.querySelectorAll('.chip').forEach(chip => {
  chip.addEventListener('click', () => { expense.value = chip.dataset.amount; calc(); });
});

shareBtn.addEventListener('click', async () => {
  const text = `$${expense.value} = ${amountEl.textContent} of my life. Calculate yours: hourspend.one`;
  if (navigator.share) {
    try { await navigator.share({ title: 'HourSpend', text, url: 'https://hourspend.one' }); } catch(e) {}
  } else {
    navigator.clipboard.writeText(text);
    shareSuccess.classList.add('show');
    setTimeout(() => shareSuccess.classList.remove('show'), 2200);
  }
});
calc();

/* ============================================================ */
/* ============ FLOATING iOS CTA ============ */
(()=>{
  const cta=document.getElementById('floatCta');
  if(!cta)return;
  const hero=document.querySelector('.hero');
  let shown=false;
  function update(){
    if(!hero)return;
    const bottom=hero.getBoundingClientRect().bottom;
    const should=bottom<60; // past hero
    if(should!==shown){shown=should;cta.classList.toggle('show',shown);}
  }
  window.addEventListener('scroll',update,{passive:true});
  update();
})();

/* ============ SCROLL PROGRESS + NAV SHRINK + SECTION DOTS ============ */
(()=>{
  const bar=document.getElementById('scrollProgress');
  const nav=document.querySelector('.nav');
  const dots=document.getElementById('sectionDots');
  const dotLinks=dots?Array.from(dots.querySelectorAll('a')):[];
  const hero=document.querySelector('.hero');
  const sections=dotLinks.map(a=>document.querySelector(a.getAttribute('href')));

  let tick=false;
  function update(){
    const max=document.documentElement.scrollHeight-innerHeight;
    const y=scrollY;
    const pct=Math.max(0,Math.min(1,y/max));
    if(bar)bar.style.width=(pct*100)+'%';
    if(nav){
      const heroBottom=hero?hero.getBoundingClientRect().bottom:0;
      nav.classList.toggle('shrunk',heroBottom<40);
    }
    if(dots){
      const showDots=y>innerHeight*0.3;
      dots.classList.toggle('show',showDots);
      // Find which section currently in middle of viewport
      let active=0;
      for(let i=0;i<sections.length;i++){
        const s=sections[i];
        if(!s)continue;
        const r=s.getBoundingClientRect();
        if(r.top<innerHeight/2 && r.bottom>innerHeight/2){active=i;break;}
        if(r.top<=innerHeight/2)active=i;
      }
      dotLinks.forEach((a,i)=>a.classList.toggle('active',i===active));
    }
    tick=false;
  }
  window.addEventListener('scroll',()=>{if(!tick){tick=true;requestAnimationFrame(update);}},{passive:true});
  update();

  // Smooth scroll on dot click
  dotLinks.forEach(a=>{
    a.addEventListener('click',e=>{
      e.preventDefault();
      const id=a.getAttribute('href').slice(1);
      const tgt=document.getElementById(id);
      if(tgt)tgt.scrollIntoView({behavior:'smooth',block:'start'});
    });
  });
})();

/* ============ i18n: 7 LANGUAGES + GEO DETECTION ============= */
/* ============================================================ */

const I18N = {
  en: {
    // nav
    'nav.browse': 'Browse', 'nav.cta': 'Get the App',
    // hero h1 (with .word spans for GSAP stagger)
    'hero.h1': '<span class="line"><span class="word">Your</span> <span class="word">money,</span></span><br><span class="line"><span class="word">in</span> <span class="word accent">hours</span></span><br><span class="line"><span class="word">of</span> <span class="word">your</span> <span class="word">life.</span></span>',
    'hero.rank': 'Money-in-hours tracker', 'hero.badge': 'Live · Free calculator · iOS',
    'hero.sub': 'The only app that converts every expense into the work-hours it really stole. Coffee. Rent. Subscriptions. See what you trade. Decide differently.',
    'hero.download': 'Download for iOS', 'hero.try': 'Try Calculator',
    'hero.stat1': 'Items priced', 'hero.stat2': 'Languages', 'hero.stat3': 'Avg rating',
    // calculator
    'calc.title': 'Calculator', 'calc.live': 'REAL-TIME',
    'calc.salary': 'Monthly salary', 'calc.hpw': 'Hrs / week', 'calc.exp': 'Expense $',
    'calc.result': 'That cost you', 'calc.share': 'Share this math', 'calc.for': 'for',
    'calc.c1': 'Coffee · $5', 'calc.c2': 'Lunch · $35', 'calc.c3': 'Groceries · $100', 'calc.c4': 'Rent · $1500',
    'unit.min': 'min', 'unit.hrs': 'hrs', 'unit.days': 'days', 'unit.weeks': 'weeks', 'unit.months': 'months', 'unit.years': 'years',
    'unit.empty': '—', 'unit.enter': 'enter values',
    // trusted
    'trusted.label': 'Trusted by time-conscious humans everywhere',
    't1': 'Product Hunt', 't2': '★★★★★ App Store',
    't3': 'Top 10 Finance · iOS', 't4': 'TikTok · 2.4M views', 't5': 'Indie Hackers',
    // numbers
    'numbers.eye': 'The hard numbers', 'numbers.title': 'Built <span class="italic">different.</span>',
    'numbers.sub': 'No ads. No data selling. No manipulation. Just your money, re-expressed.',
    'num1.l': 'Money-in-hours app', 'num1.s': 'Category creator · iOS',
    'num2.l': 'Expenses tracked', 'num2.s': 'Every month, and growing',
    'num3.l': 'Average rating', 'num3.s': 'Across every region',
    'num4.l': 'Languages live', 'num4.s': 'Full localization',
    // story
    'story.label': 'The reframe', 'story.hrsNum': '23 min', 'story.amt': '$5',
    'story.cap1': 'Counting in dollars hides the truth.',
    'story.cap2': '$5 feels like nothing. 23 minutes of your life feels different.',
    'story.cap3': 'Your money is your time, converted. The reframe is impossible to unsee.',
    // bento
    'bento.eye': 'The truth in numbers', 'bento.title': 'What everyday spending <span class="italic">really</span> costs.',
    'bento.sub': 'At a $25/hour wage. Drag the calculator above to see your own numbers.',
    'b1.meta': 'Daily latte habit', 'b1.h': 'Your morning coffee for a year =', 'b1.eq': '14 work days', 'b1.p': '$5/day × 365 · 73 hours of work',
    'b2.meta': 'iPhone 16 Pro', 'b2.eq': '6 weeks', 'b2.price': '$1,199',
    'b3.meta': 'NYC 1-bed rent', 'b3.eq': '22.5 days', 'b3.price': '$4,500/mo',
    'b4.meta': 'DoorDash dinner', 'b4.eq': '1.3 hrs', 'b4.price': '$32',
    'b5.meta': 'Netflix yearly', 'b5.eq': '11 hrs', 'b5.price': '$276',
    // gallery
    'gal.eye': 'Where your hours go', 'gal.title': 'Every habit has a <span class="italic">price tag</span> in time.',
    'gal.sub': 'The little things add up faster than you\'d think.',
    'g1.k': 'Morning ritual', 'g1.v': '73 hours of work · per year',
    'g2.k': 'Subscriptions', 'g2.v': '4 days of your life',
    'g3.k': 'Takeout dinner', 'g3.v': '1.3 hrs',
    'g4.k': 'Weekend shopping', 'g4.v': '6 hrs',
    'g5.k': '9-to-5 reality', 'g5.v': '$1,923 weekly · priced in <em>your</em> minutes',
    'g6.k': 'The weekend trip', 'g6.v': '32 hrs',
    // how it works
    'how.eye': 'How it works', 'how.title': 'Three steps. <span class="italic">Forever changed.</span>',
    'how.sub': 'Install. Log. See your life in a way you can never unsee.',
    'how1.h': 'Tell us your <span class="italic">hour.</span>',
    'how1.p': 'Enter your salary or hourly wage once. Everything else gets priced in your minutes from here.',
    'how2.h': 'Add <span class="italic">anything</span> you spend.',
    'how2.p': 'Voice. Text. Receipt scan. Every entry shows up as hours of work, not just dollars.',
    'how3.h': 'Watch your <span class="italic">decisions</span> shift.',
    'how3.p': '$5 coffees feel different when you see them as 23 min of your life. You\'ll think twice. That\'s the whole point.',
    // vs
    'vs.eye': 'Head to head', 'vs.title': 'HourSpend vs <span class="italic">the rest.</span>',
    'vs.sub': 'Every other budget app shows you dollars. Only one shows you <em>your life</em>.',
    'vs.col0': 'Feature',
    'vs.r1': 'Expenses priced in hours of work',
    'vs.r2': 'Free forever (core features)',
    'vs.r3': 'No ads. No data selling.',
    'vs.r4': 'AI expense parsing (voice + text)',
    'vs.r5': '14 languages localized',
    'vs.r6': 'iOS native (Liquid Glass, iOS 17+)',
    'vs.r7': 'Private by default (on-device first)',
    // marquee
    'marq.eye': 'Browse the catalog', 'marq.title': '52<span class="italic">+</span> purchases, priced in life.',
    'marq.browse': 'Browse all 52 items',
    // testi
    'testi.eye': 'What people are saying', 'testi.title': 'The reframe is <span class="italic">impossible to unsee.</span>',
    'testi.sub': 'Real quotes. Real decisions. Real hours saved.',
    'testi1.q': '"Cancelled three subscriptions in the first week. Turns out I was paying 8 hours a month for stuff I never opened."',
    'testi1.a': 'Anna · Product designer',
    'testi2.q': '"I don\'t need a budget. I need a translator. HourSpend is exactly that."',
    'testi2.a': 'Marcus · Software engineer',
    'testi3.q': '"The $5 coffee hits different when you see it as 23 minutes of your Tuesday. Changed how I spend. For real."',
    'testi3.a': 'Priya · Marketing lead',
    // faq
    'faq.eye': 'Questions', 'faq.title': 'Things people <span class="italic">ask us.</span>',
    'faq1.q': 'Is it really free?',
    'faq1.a': 'Core features are free forever — add expenses, see hour conversions, track habits. Pro unlocks AI parsing, unlimited goals, and advanced charts for the price of about 30 minutes of your life per month.',
    'faq2.q': 'Do you sell my data?',
    'faq2.a': 'Never. Your spending data lives on-device and in your personal Firebase instance. We don\'t sell, trade, or share. No ads ever.',
    'faq3.q': 'How accurate is the hour conversion?',
    'faq3.a': 'As accurate as the wage you enter. We use 160 work-hours per month (40hr/wk × 4.33). If you\'re salaried, we divide by actual hours worked.',
    'faq4.q': 'Android?',
    'faq4.a': 'iOS-only for now. We built it native on iOS 17+ with Liquid Glass to be the absolute best experience possible on one platform before expanding.',
    'faq5.q': 'What makes this different from Mint / YNAB / Copilot?',
    'faq5.a': 'They all show you dollars. We show you your life. That\'s not a feature — that\'s a philosophy. Once you see a $35 lunch as 1.4 hrs of work, you can\'t unsee it.',
    'faq6.q': 'Which languages are supported?',
    'faq6.a': '14 languages full native: English, Turkish, Spanish, German, French, Portuguese, Japanese, Korean, Chinese (Simplified), Italian, Dutch, Polish, Russian, Arabic.',
    // download
    'dl.eye': 'Get the iOS app', 'dl.title': 'Track every dollar<br>in <span class="italic">hours</span> of life.',
    'dl.sub': 'The free calculator is a taste. The iOS app does it for every expense, automatically.',
    'dl.f1': 'Add expenses by voice, text, or receipt scan',
    'dl.f2': 'See your monthly burn in work-hours',
    'dl.f3': 'Set savings goals as "hours back"',
    'dl.f4': '14 languages · multi-currency · private by default',
    'dl.badge': 'Download on App Store',
    // phone
    'ph.week': 'This week', 'ph.spent': '≈ $363 spent',
    'ph.coffee': 'Coffee', 'ph.lunch': 'Lunch', 'ph.groceries': 'Groceries', 'ph.gas': 'Gas',
    // final
    'fin.eye': 'Last thing', 'fin.title': 'You\'re not spending money.<br>You\'re spending <span class="italic">your life.</span>',
    'fin.sub': 'You have about 2,500 weekends left. Money can be earned again. Minutes can\'t.',
    'fin.btn1': 'Download Free', 'fin.btn2': 'Try the free calculator',
    'float.cta': 'Download Free · iOS',
    'nav.search': 'Search',
    'rev.e': 'The reframe, visualized',
    'rev.h': 'You think you\'re spending <span class="money">money</span>.<br>You\'re really spending <span class="italic">your life</span>.',
    'rev.hint': 'Move your cursor over the image',
    'rev.hintMobile': 'Scroll — money becomes life',
    'vanti.eye': 'Meet your pocket teammate',
    'vanti.h': 'Meet <span class="vanti-name">Vanti</span>.<br>A pocket watch with <span class="italic">opinions</span>.',
    'vanti.sub': 'Your in-app assistant. Notices when food eats half the week. Translates every spend to hours. Never lectures. Warms up fast.',
    'vanti.m1': 'Hi there.',
    'vanti.m2': 'Weighing it for you.',
    'vanti.m3': 'You just kept 20 hours.',
    'vanti.foot': 'Live inside the app. No extra setup.',
    // footer + toast
    'foot.all': 'All items', 'foot.ios': 'iOS App', 'foot.privacy': 'Privacy', 'foot.terms': 'Terms',
    'foot.credit': '© HourSpend · Money is just time, exchanged.',
    'foot.vanti': '— Vanti, your pocket teammate.',
    'faq.vanti': 'Vanti is listening',
    'unit.perMonth': '/mo',
    'share.ok': 'Copied — paste anywhere'
  },
  tr: {
    'nav.browse': 'Keşfet', 'nav.cta': 'Uygulamayı İndir',
    'hero.h1': '<span class="line"><span class="word">Paran,</span></span><br><span class="line"><span class="word">hayatının</span></span><br><span class="line"><span class="word accent">saatlerinde.</span></span>',
    'hero.rank': 'Saat cinsinden para takibi', 'hero.badge': 'Canlı · Ücretsiz hesaplayıcı · iOS',
    'hero.sub': 'Her harcamayı gerçekte çaldığı iş saatine çeviren tek uygulama. Kahve. Kira. Unuttuğun abonelikler. Neyi takas ettiğini gör. Farklı karar ver.',
    'hero.download': 'iOS için İndir', 'hero.try': 'Hesaplayıcıyı Dene',
    'hero.stat1': 'Ürün fiyatlandı', 'hero.stat2': 'Dil', 'hero.stat3': 'Ort. puan',
    'calc.title': 'Hesaplayıcı', 'calc.live': 'CANLI',
    'calc.salary': 'Aylık maaş', 'calc.hpw': 'Sa / hafta', 'calc.exp': 'Harcama $',
    'calc.result': 'Sana maliyeti', 'calc.share': 'Bu matematiği paylaş', 'calc.for': 'karşılığında',
    'calc.c1': 'Kahve · 100₺', 'calc.c2': 'Öğle · 500₺', 'calc.c3': 'Market · 1.500₺', 'calc.c4': 'Kira · 25.000₺',
    'unit.min': 'dk', 'unit.hrs': 'sa', 'unit.days': 'gün', 'unit.weeks': 'hafta', 'unit.months': 'ay', 'unit.years': 'yıl',
    'unit.empty': '—', 'unit.enter': 'değer gir',
    'trusted.label': 'Zamanına değer verenler tarafından kullanılıyor',
    't1': 'Product Hunt', 't2': '★★★★★ App Store',
    't3': 'Top 10 Finans · iOS', 't4': 'TikTok · 2.4M izlenme', 't5': 'Indie Hackers',
    'numbers.eye': 'Gerçek rakamlar', 'numbers.title': 'Başka <span class="italic">türlü yaptık.</span>',
    'numbers.sub': 'Reklam yok. Veri satışı yok. Manipülasyon yok. Sadece paran, farklı ifade edilmiş.',
    'num1.l': 'Saat-bazlı para uygulaması', 'num1.s': 'Kategori yaratıcısı · iOS',
    'num2.l': 'Takip edilen harcama', 'num2.s': 'Her ay, büyüyor',
    'num3.l': 'Ortalama puan', 'num3.s': 'Her bölgede',
    'num4.l': 'Aktif dil', 'num4.s': 'Tam yerelleştirme',
    'story.label': 'Yeniden çerçeveleme', 'story.hrsNum': '20 dk', 'story.amt': '100₺',
    'story.cap1': 'Para olarak saymak gerçeği gizler.',
    'story.cap2': '100₺ hiçbir şey gibi. Ama hayatının 20 dakikası çok farklı.',
    'story.cap3': 'Paran, dönüştürülmüş zamandır. Bu çerçeveleme bir daha silinmez.',
    'bento.eye': 'Rakamlardaki gerçek', 'bento.title': 'Günlük harcamaların <span class="italic">gerçek</span> maliyeti.',
    'bento.sub': 'Saat başı 300₺ ücret üzerinden. Kendi rakamlarını görmek için yukarıdaki hesaplayıcıyı kullan.',
    'b1.meta': 'Günlük latte alışkanlığı', 'b1.h': 'Bir yıllık sabah kahven =', 'b1.eq': '14 iş günü', 'b1.p': 'Günde 100₺ × 365 · 73 saat iş',
    'b2.meta': 'iPhone 16 Pro', 'b2.eq': '6 hafta', 'b2.price': '70.000₺',
    'b3.meta': 'İstanbul 1+1 kira', 'b3.eq': '22.5 gün', 'b3.price': '25.000₺/ay',
    'b4.meta': 'Getir akşam', 'b4.eq': '1.3 sa', 'b4.price': '400₺',
    'b5.meta': 'Yıllık Netflix', 'b5.eq': '11 sa', 'b5.price': '3.600₺',
    'gal.eye': 'Saatlerin nereye gidiyor', 'gal.title': 'Her alışkanlığın zamanla <span class="italic">bir fiyatı</span> var.',
    'gal.sub': 'Küçük şeyler sandığından çok daha hızlı birikir.',
    'g1.k': 'Sabah ritüeli', 'g1.v': 'Yılda 73 saat iş',
    'g2.k': 'Abonelikler', 'g2.v': 'Hayatından 4 gün',
    'g3.k': 'Yemek siparişi', 'g3.v': '1.3 sa',
    'g4.k': 'Haftasonu alışverişi', 'g4.v': '6 sa',
    'g5.k': '9-5 gerçeği', 'g5.v': 'Haftalık 15.000₺ · <em>senin</em> dakikalarınla fiyatlı',
    'g6.k': 'Haftasonu gezisi', 'g6.v': '32 sa',
    'how.eye': 'Nasıl çalışır', 'how.title': 'Üç adım. <span class="italic">Sonsuza kadar değişim.</span>',
    'how.sub': 'Yükle. Kaydet. Hayatını bir daha göz ardı edemeyeceğin şekilde gör.',
    'how1.h': 'Bize <span class="italic">saatini</span> söyle.',
    'how1.p': 'Maaşını ya da saatlik ücretini bir kez gir. Bundan sonra her şey dakikalarınla fiyatlanır.',
    'how2.h': '<span class="italic">Her şeyi</span> kaydet.',
    'how2.p': 'Ses. Metin. Fiş tarama. Her giriş çalışma saati olarak görünür, sadece dolar değil.',
    'how3.h': '<span class="italic">Kararlarının</span> değişmesini izle.',
    'how3.p': '100₺\'lik kahve, hayatının 20 dakikası olduğunda farklı hissettirir. İki kez düşünürsün. Asıl mesele bu.',
    'vs.eye': 'Karşılaştırma', 'vs.title': 'HourSpend <span class="italic">diğerlerine karşı.</span>',
    'vs.sub': 'Diğer bütçe uygulamaları dolar gösterir. Sadece biri <em>hayatını</em> gösterir.',
    'vs.col0': 'Özellik',
    'vs.r1': 'Harcamalar iş saatinde fiyatlanır',
    'vs.r2': 'Sonsuza kadar ücretsiz (temel)',
    'vs.r3': 'Reklam yok. Veri satışı yok.',
    'vs.r4': 'AI ile harcama ayıklama',
    'vs.r5': '14 dilde yerelleştirme',
    'vs.r6': 'iOS native (Liquid Glass)',
    'vs.r7': 'Varsayılan gizlilik (cihaz-öncelikli)',
    'marq.eye': 'Kataloğu incele', 'marq.title': '52<span class="italic">+</span> alışveriş, hayatına göre fiyatlı.',
    'marq.browse': '52 ürünün hepsine bak',
    'testi.eye': 'İnsanların söylediği', 'testi.title': 'Bu yeniden çerçeveleme <span class="italic">görmezden gelinemez.</span>',
    'testi.sub': 'Gerçek alıntılar. Gerçek kararlar. Gerçek kurtarılmış saatler.',
    'testi1.q': '"İlk hafta üç aboneliği iptal ettim. Meğer hiç açmadığım şeylere ayda 8 saat ödüyormuşum."',
    'testi1.a': 'Anna · Ürün tasarımcısı',
    'testi2.q': '"Bütçeye ihtiyacım yok. Çevirmene ihtiyacım var. HourSpend tam olarak bu."',
    'testi2.a': 'Marcus · Yazılım mühendisi',
    'testi3.q': '"100₺ kahve, salının 20 dakikası olduğunu gördüğünde farklı. Nasıl harcadığımı değiştirdi. Cidden."',
    'testi3.a': 'Priya · Pazarlama lideri',
    'faq.eye': 'Sorular', 'faq.title': 'İnsanların <span class="italic">sorduğu şeyler.</span>',
    'faq1.q': 'Gerçekten ücretsiz mi?',
    'faq1.a': 'Temel özellikler sonsuza kadar ücretsiz — harcama ekle, saat dönüşümü gör, alışkanlık takibi. Pro versiyonu AI ayıklama, sınırsız hedef ve gelişmiş grafikleri ayda yaklaşık 30 dakikalık hayatına denk bir fiyata açar.',
    'faq2.q': 'Verimi satıyor musunuz?',
    'faq2.a': 'Asla. Harcama verilerin cihazında ve kendi Firebase\'inde yaşar. Satmıyoruz, paylaşmıyoruz. Hiç reklam yok.',
    'faq3.q': 'Saat dönüşümü ne kadar doğru?',
    'faq3.a': 'Girdiğin ücret kadar doğru. Ayda 160 iş saati kullanıyoruz (40sa/hafta × 4.33). Maaşlıysan, gerçek çalışma saatine bölünüyor.',
    'faq4.q': 'Android?',
    'faq4.a': 'Şimdilik sadece iOS. iOS 17+ ve Liquid Glass ile native inşa ettik — tek platformda en iyi deneyimi vermeden yayılmak istemedik.',
    'faq5.q': 'Mint / YNAB / Copilot\'tan farkı ne?',
    'faq5.a': 'Hepsi parayı gösterir. Biz hayatını gösteriyoruz. Bu bir özellik değil — felsefe. 500₺\'lik öğle yemeğini 1.4 saatlik iş olarak gördüğünde bir daha unutamıyorsun.',
    'faq6.q': 'Hangi diller destekleniyor?',
    'faq6.a': '14 dilde tam yerelleştirme: İngilizce, Türkçe, İspanyolca, Almanca, Fransızca, Portekizce, Japonca, Korece, Çince (Basit), İtalyanca, Felemenkçe, Lehçe, Rusça, Arapça.',
    'dl.eye': 'iOS uygulamasını al', 'dl.title': 'Her doları<br><span class="italic">saatte</span> takip et.',
    'dl.sub': 'Ücretsiz hesaplayıcı bir tadımdır. iOS uygulaması her harcamayı otomatik çevirir.',
    'dl.f1': 'Ses, metin veya fiş taramasıyla ekle',
    'dl.f2': 'Aylık yakımını iş saatleriyle gör',
    'dl.f3': 'Tasarruf hedeflerini "geri kazanılan saat" olarak belirle',
    'dl.f4': '14 dil · çoklu para · varsayılan gizlilik',
    'dl.badge': 'App Store\'dan İndir',
    'ph.week': 'Bu hafta', 'ph.spent': '≈ 5.000₺ harcandı',
    'ph.coffee': 'Kahve', 'ph.lunch': 'Öğle', 'ph.groceries': 'Market', 'ph.gas': 'Yakıt',
    'fin.eye': 'Son bir şey', 'fin.title': 'Paranı değil,<br><span class="italic">hayatını</span> harcıyorsun.',
    'fin.sub': 'Yaklaşık 2.500 hafta sonun kaldı. Para yeniden kazanılır. Dakikalar kazanılmaz.',
    'fin.btn1': 'Ücretsiz İndir', 'fin.btn2': 'Hesaplayıcıyı dene',
    'float.cta': 'Ücretsiz İndir · iOS',
    'nav.search': 'Ara',
    'rev.e': 'Yeniden çerçeveleme, görsel',
    'rev.h': '<span class="money">Para</span> harcadığını sanıyorsun.<br><span class="italic">Hayatını</span> harcıyorsun.',
    'rev.hint': 'Görselin üzerinde imleci gezdir',
    'rev.hintMobile': 'Kaydır — para hayata dönüşüyor',
    'vanti.eye': 'Cebindeki yeni yoldaş',
    'vanti.h': '<span class="vanti-name">Vanti</span>\'yle tanış.<br><span class="italic">Görüşleri olan</span> bir cep saati.',
    'vanti.sub': 'Uygulamanın içindeki arkadaşın. Haftanın yarısı yemeğe gitmişse fark eder. Her harcamayı saate çevirir. Yargılamaz, sıcak konuşur.',
    'vanti.m1': 'Selam.',
    'vanti.m2': 'Senin için tartıyor.',
    'vanti.m3': '20 saat kenara koydun.',
    'vanti.foot': 'Uygulamada hazır. Kurulum gerektirmez.',
    'foot.all': 'Tüm ürünler', 'foot.ios': 'iOS Uygulaması', 'foot.privacy': 'Gizlilik', 'foot.terms': 'Şartlar',
    'foot.credit': '© HourSpend · Para sadece takas edilen zamandır.',
    'foot.vanti': '— Vanti, cebindeki yoldaş.',
    'faq.vanti': 'Vanti dinliyor',
    'unit.perMonth': '/ay',
    'share.ok': 'Kopyalandı — istediğin yere yapıştır'
  },
  es: {
    'nav.browse': 'Explorar', 'nav.cta': 'Obtener la App',
    'hero.h1': '<span class="line"><span class="word">Tu</span> <span class="word">dinero,</span></span><br><span class="line"><span class="word">en</span> <span class="word accent">horas</span></span><br><span class="line"><span class="word">de</span> <span class="word">tu</span> <span class="word">vida.</span></span>',
    'hero.rank': 'Rastreador dinero-en-horas', 'hero.badge': 'Live · Calculadora gratis · iOS',
    'hero.sub': 'La única app que convierte cada gasto en las horas de trabajo que realmente costó. Café. Alquiler. Suscripciones. Ve lo que intercambias. Decide diferente.',
    'hero.download': 'Descargar para iOS', 'hero.try': 'Probar calculadora',
    'hero.stat1': 'Artículos', 'hero.stat2': 'Idiomas', 'hero.stat3': 'Puntuación',
    'calc.title': 'Calculadora', 'calc.live': 'EN VIVO',
    'calc.salary': 'Salario mensual', 'calc.hpw': 'Hs / semana', 'calc.exp': 'Gasto $',
    'calc.result': 'Eso te costó', 'calc.share': 'Compartir esta matemática', 'calc.for': 'por',
    'calc.c1': 'Café · 4€', 'calc.c2': 'Almuerzo · 12€', 'calc.c3': 'Compras · 80€', 'calc.c4': 'Alquiler · 1.200€',
    'unit.min': 'min', 'unit.hrs': 'hrs', 'unit.days': 'días', 'unit.weeks': 'semanas', 'unit.months': 'meses', 'unit.years': 'años',
    'unit.empty': '—', 'unit.enter': 'introduce valores',
    'trusted.label': 'Elegido por quienes valoran su tiempo',
    't1': 'Product Hunt', 't2': '★★★★★ App Store',
    't3': 'Top 10 Finanzas · iOS', 't4': 'TikTok · 2.4M vistas', 't5': 'Indie Hackers',
    'numbers.eye': 'Los números duros', 'numbers.title': 'Construido <span class="italic">diferente.</span>',
    'numbers.sub': 'Sin anuncios. Sin venta de datos. Sin manipulación. Solo tu dinero, re-expresado.',
    'num1.l': 'App dinero-horas', 'num1.s': 'Creador de categoría · iOS',
    'num2.l': 'Gastos registrados', 'num2.s': 'Cada mes, en crecimiento',
    'num3.l': 'Puntuación media', 'num3.s': 'En todas las regiones',
    'num4.l': 'Idiomas activos', 'num4.s': 'Localización completa',
    'story.label': 'El cambio de marco', 'story.hrsNum': '20 min', 'story.amt': '4€',
    'story.cap1': 'Contar en dinero oculta la verdad.',
    'story.cap2': '$5 no parece nada. Pero 23 minutos de tu vida se sienten diferente.',
    'story.cap3': 'Tu dinero es tu tiempo, convertido. Ya no se puede ignorar.',
    'bento.eye': 'La verdad en números', 'bento.title': 'Cuánto <span class="italic">realmente</span> cuesta cada gasto.',
    'bento.sub': 'A 20€/hora. Usa la calculadora arriba para ver tus propios números.',
    'b1.meta': 'Latte diario', 'b1.h': 'Tu café mañanero por un año =', 'b1.eq': '14 días de trabajo', 'b1.p': '4€/día × 365 · 73 horas de trabajo',
    'b2.meta': 'iPhone 16 Pro', 'b2.eq': '6 semanas', 'b2.price': '1.299€',
    'b3.meta': 'Alquiler Madrid', 'b3.eq': '22.5 días', 'b3.price': '1.500€/mes',
    'b4.meta': 'Pedido Glovo', 'b4.eq': '1.3 hrs', 'b4.price': '28€',
    'b5.meta': 'Netflix anual', 'b5.eq': '11 hrs', 'b5.price': '240€',
    'gal.eye': 'Dónde van tus horas', 'gal.title': 'Cada hábito tiene un <span class="italic">precio</span> en tiempo.',
    'gal.sub': 'Las cosas pequeñas suman más rápido de lo que crees.',
    'g1.k': 'Ritual matutino', 'g1.v': '73 horas de trabajo · al año',
    'g2.k': 'Suscripciones', 'g2.v': '4 días de tu vida',
    'g3.k': 'Cena delivery', 'g3.v': '1.3 hrs',
    'g4.k': 'Compras fin de semana', 'g4.v': '6 hrs',
    'g5.k': 'Realidad 9-a-5', 'g5.v': '1.600€/semana · en <em>tus</em> minutos',
    'g6.k': 'Escapada', 'g6.v': '32 hrs',
    'how.eye': 'Cómo funciona', 'how.title': 'Tres pasos. <span class="italic">Cambio eterno.</span>',
    'how.sub': 'Instala. Registra. Ve tu vida de forma que no podrás olvidar.',
    'how1.h': 'Dinos tu <span class="italic">hora.</span>',
    'how1.p': 'Ingresa tu salario o tarifa por hora una vez. Todo lo demás se valorará en tus minutos.',
    'how2.h': 'Añade <span class="italic">cualquier cosa.</span>',
    'how2.p': 'Voz. Texto. Escaneo de recibo. Cada entrada aparece como horas de trabajo.',
    'how3.h': 'Mira cambiar tus <span class="italic">decisiones.</span>',
    'how3.p': 'Un café de 4€ se siente distinto cuando ves 20 min de tu vida. Pensarás dos veces.',
    'vs.eye': 'Cara a cara', 'vs.title': 'HourSpend vs <span class="italic">el resto.</span>',
    'vs.sub': 'Las demás apps te muestran dólares. Solo una te muestra <em>tu vida</em>.',
    'vs.col0': 'Función',
    'vs.r1': 'Gastos en horas de trabajo',
    'vs.r2': 'Gratis para siempre (básico)',
    'vs.r3': 'Sin ads. Sin venta de datos.',
    'vs.r4': 'Análisis IA de gastos',
    'vs.r5': 'Localizado en 14 idiomas',
    'vs.r6': 'iOS nativo (Liquid Glass)',
    'vs.r7': 'Privacidad por defecto',
    'marq.eye': 'Explora el catálogo', 'marq.title': '52<span class="italic">+</span> compras, valoradas en vida.',
    'marq.browse': 'Ver los 52 artículos',
    'testi.eye': 'Qué dice la gente', 'testi.title': 'Este cambio es <span class="italic">inolvidable.</span>',
    'testi.sub': 'Citas reales. Decisiones reales. Horas realmente recuperadas.',
    'testi1.q': '"Cancelé tres suscripciones la primera semana. Pagaba 8 horas al mes por cosas que no abría."',
    'testi1.a': 'Anna · Diseñadora de producto',
    'testi2.q': '"No necesito un presupuesto. Necesito un traductor. HourSpend es exactamente eso."',
    'testi2.a': 'Marcus · Ingeniero de software',
    'testi3.q': '"El café de 4€ golpea diferente cuando son 20 min de tu martes. Cambió cómo gasto."',
    'testi3.a': 'Priya · Líder de marketing',
    'faq.eye': 'Preguntas', 'faq.title': 'Lo que <span class="italic">nos preguntan.</span>',
    'faq1.q': '¿De verdad es gratis?',
    'faq1.a': 'El núcleo es gratis para siempre. Pro desbloquea IA y gráficos avanzados por el precio de ~30 min de tu vida al mes.',
    'faq2.q': '¿Venden mis datos?',
    'faq2.a': 'Nunca. Los datos viven en tu dispositivo y en tu Firebase. No vendemos, intercambiamos ni compartimos. Sin ads.',
    'faq3.q': '¿Qué tan exacta es la conversión a horas?',
    'faq3.a': 'Tan exacta como el salario que ingreses. Usamos 160 horas/mes (40hr/sem × 4.33).',
    'faq4.q': '¿Android?',
    'faq4.a': 'Solo iOS por ahora. Nativo en iOS 17+ con Liquid Glass para la mejor experiencia antes de expandir.',
    'faq5.q': '¿Qué lo hace diferente de Mint / YNAB / Copilot?',
    'faq5.a': 'Ellas muestran euros. Nosotros mostramos tu vida. No es una función — es una filosofía. Una vez que ves un almuerzo de 12€ como 1,4 horas de trabajo, no puedes ignorarlo.',
    'faq6.q': '¿Qué idiomas están soportados?',
    'faq6.a': '14 idiomas nativos: Inglés, Turco, Español, Alemán, Francés, Portugués, Japonés, Coreano, Chino, Italiano, Holandés, Polaco, Ruso, Árabe.',
    'dl.eye': 'Obtén la app iOS', 'dl.title': 'Rastrea cada dólar<br>en <span class="italic">horas</span> de vida.',
    'dl.sub': 'La calculadora gratis es solo una muestra. La app iOS lo hace con cada gasto, automáticamente.',
    'dl.f1': 'Añade gastos por voz, texto o escaneo',
    'dl.f2': 'Ve tu gasto mensual en horas de trabajo',
    'dl.f3': 'Fija metas de ahorro como "horas recuperadas"',
    'dl.f4': '14 idiomas · multi-moneda · privado por defecto',
    'dl.badge': 'Descargar en App Store',
    'ph.week': 'Esta semana', 'ph.spent': '≈ 290€ gastados',
    'ph.coffee': 'Café', 'ph.lunch': 'Almuerzo', 'ph.groceries': 'Compras', 'ph.gas': 'Gasolina',
    'fin.eye': 'Una última cosa', 'fin.title': 'No estás gastando dinero.<br>Estás gastando <span class="italic">tu vida.</span>',
    'fin.sub': 'Te quedan unos 2.500 fines de semana. El dinero se gana otra vez. Los minutos no.',
    'fin.btn1': 'Descargar Gratis', 'fin.btn2': 'Probar la calculadora',
    'float.cta': 'Descargar Gratis · iOS',
    'nav.search': 'Buscar',
    'rev.e': 'El recadre, visualizado',
    'rev.h': 'Crees que gastas <span class="money">dinero</span>.<br>Estás gastando <span class="italic">tu vida</span>.',
    'rev.hint': 'Mueve el cursor sobre la imagen',
    'rev.hintMobile': 'Desliza — el dinero se vuelve vida',
    'vanti.eye': 'Tu compañera de bolsillo',
    'vanti.h': 'Te presentamos a <span class="vanti-name">Vanti</span>.<br>Un reloj de bolsillo <span class="italic">con opiniones</span>.',
    'vanti.sub': 'Tu asistente dentro de la app. Nota cuando la comida se lleva media semana. Traduce cada gasto a horas. Nunca sermonea. Se acerca rápido.',
    'vanti.m1': 'Hola.',
    'vanti.m2': 'Pensándolo contigo.',
    'vanti.m3': 'Acabas de guardar 20 horas.',
    'vanti.foot': 'Ya disponible en la app. Sin configuración.',
    'foot.all': 'Todo', 'foot.ios': 'App iOS', 'foot.privacy': 'Privacidad', 'foot.terms': 'Términos',
    'foot.credit': '© HourSpend · El dinero es solo tiempo intercambiado.',
    'foot.vanti': '— Vanti, tu compañera de bolsillo.',
    'faq.vanti': 'Vanti te escucha',
    'unit.perMonth': '/mes',
    'share.ok': 'Copiado — pégalo donde quieras'
  },
  de: {
    'nav.browse': 'Entdecken', 'nav.cta': 'App holen',
    'hero.h1': '<span class="line"><span class="word">Dein</span> <span class="word">Geld,</span></span><br><span class="line"><span class="word">in</span> <span class="word accent">Stunden</span></span><br><span class="line"><span class="word">deines</span> <span class="word">Lebens.</span></span>',
    'hero.rank': 'Geld-in-Stunden Tracker', 'hero.badge': 'Live · Kostenloser Rechner · iOS',
    'hero.sub': 'Die einzige App, die jede Ausgabe in die Arbeitsstunden umrechnet, die sie wirklich kostet. Kaffee. Miete. Abos. Sieh was du tauschst. Entscheide anders.',
    'hero.download': 'Für iOS laden', 'hero.try': 'Rechner testen',
    'hero.stat1': 'Artikel', 'hero.stat2': 'Sprachen', 'hero.stat3': 'Bewertung',
    'calc.title': 'Rechner', 'calc.live': 'LIVE',
    'calc.salary': 'Monatsgehalt', 'calc.hpw': 'Std / Woche', 'calc.exp': 'Ausgabe $',
    'calc.result': 'Das kostete dich', 'calc.share': 'Diese Rechnung teilen', 'calc.for': 'für',
    'calc.c1': 'Kaffee · 4€', 'calc.c2': 'Mittag · 12€', 'calc.c3': 'Einkauf · 80€', 'calc.c4': 'Miete · 1200€',
    'unit.min': 'Min', 'unit.hrs': 'Std', 'unit.days': 'Tage', 'unit.weeks': 'Wochen', 'unit.months': 'Monate', 'unit.years': 'Jahre',
    'unit.empty': '—', 'unit.enter': 'Werte eingeben',
    'trusted.label': 'Vertraut von zeitbewussten Menschen',
    't1': 'Product Hunt', 't2': '★★★★★ App Store',
    't3': 'Top 10 Finanzen · iOS', 't4': 'TikTok · 2.4M Views', 't5': 'Indie Hackers',
    'numbers.eye': 'Harte Zahlen', 'numbers.title': 'Anders <span class="italic">gebaut.</span>',
    'numbers.sub': 'Keine Ads. Kein Datenverkauf. Keine Manipulation. Nur dein Geld, neu ausgedrückt.',
    'num1.l': 'Geld-Stunden-App', 'num1.s': 'Kategorie-Erfinder · iOS',
    'num2.l': 'Erfasste Ausgaben', 'num2.s': 'Jeden Monat, wachsend',
    'num3.l': 'Durchschn. Bewertung', 'num3.s': 'Global',
    'num4.l': 'Aktive Sprachen', 'num4.s': 'Vollständig lokalisiert',
    'story.label': 'Der Reframe', 'story.hrsNum': '20 Min', 'story.amt': '4€',
    'story.cap1': 'In Geld zu zählen verbirgt die Wahrheit.',
    'story.cap2': '4€ fühlt sich wie nichts an. 20 Minuten deines Lebens fühlen sich anders an.',
    'story.cap3': 'Dein Geld ist deine Zeit, umgewandelt. Unvergesslich.',
    'bento.eye': 'Die Wahrheit in Zahlen', 'bento.title': 'Was tägliche Ausgaben <span class="italic">wirklich</span> kosten.',
    'bento.sub': 'Bei 20€/Stunde. Nutze den Rechner oben für deine eigenen Zahlen.',
    'b1.meta': 'Tägliche Latte', 'b1.h': 'Dein Morgenkaffee für ein Jahr =', 'b1.eq': '14 Arbeitstage', 'b1.p': '4€/Tag × 365 · 73 Arbeitsstunden',
    'b2.meta': 'iPhone 16 Pro', 'b2.eq': '6 Wochen', 'b2.price': '1.299€',
    'b3.meta': 'Berlin 1-Zi Miete', 'b3.eq': '22.5 Tage', 'b3.price': '1.200€/Mo',
    'b4.meta': 'Lieferando Abend', 'b4.eq': '1.3 Std', 'b4.price': '30€',
    'b5.meta': 'Netflix jährlich', 'b5.eq': '11 Std', 'b5.price': '240€',
    'gal.eye': 'Wo deine Stunden hin gehen', 'gal.title': 'Jede Gewohnheit hat ein <span class="italic">Preisschild</span> in Zeit.',
    'gal.sub': 'Kleine Dinge summieren sich schneller als du denkst.',
    'g1.k': 'Morgenritual', 'g1.v': '73 Arbeitsstunden · pro Jahr',
    'g2.k': 'Abos', 'g2.v': '4 Tage deines Lebens',
    'g3.k': 'Liefer-Abendessen', 'g3.v': '1.3 Std',
    'g4.k': 'Wochenend-Shopping', 'g4.v': '6 Std',
    'g5.k': '9-17 Realität', 'g5.v': '1.600€/Woche · in <em>deinen</em> Minuten',
    'g6.k': 'Wochenendtrip', 'g6.v': '32 Std',
    'how.eye': 'So funktioniert es', 'how.title': 'Drei Schritte. <span class="italic">Für immer anders.</span>',
    'how.sub': 'Installiere. Tracke. Sieh dein Leben so, wie du es nie wieder vergessen kannst.',
    'how1.h': 'Sag uns deine <span class="italic">Stunde.</span>',
    'how1.p': 'Trag dein Gehalt oder deinen Stundenlohn einmal ein. Alles wird in deinen Minuten bewertet.',
    'how2.h': 'Trage <span class="italic">alles</span> ein.',
    'how2.p': 'Sprache. Text. Beleg-Scan. Jeder Eintrag erscheint als Arbeitsstunden.',
    'how3.h': 'Sieh deine <span class="italic">Entscheidungen</span> verändern.',
    'how3.p': 'Ein 4€ Kaffee fühlt sich anders an, wenn du 20 min deines Lebens siehst.',
    'vs.eye': 'Direktvergleich', 'vs.title': 'HourSpend vs <span class="italic">die anderen.</span>',
    'vs.sub': 'Andere Budget-Apps zeigen dir Dollar. Nur eine zeigt <em>dein Leben</em>.',
    'vs.col0': 'Feature',
    'vs.r1': 'Ausgaben in Arbeitsstunden',
    'vs.r2': 'Für immer kostenlos (Basis)',
    'vs.r3': 'Keine Ads. Kein Datenverkauf.',
    'vs.r4': 'KI-Ausgabenerfassung',
    'vs.r5': '14 Sprachen lokalisiert',
    'vs.r6': 'iOS nativ (Liquid Glass)',
    'vs.r7': 'Privat by default',
    'marq.eye': 'Katalog durchsuchen', 'marq.title': '52<span class="italic">+</span> Käufe, in Lebenszeit bewertet.',
    'marq.browse': 'Alle 52 Artikel sehen',
    'testi.eye': 'Was Leute sagen', 'testi.title': 'Der Reframe ist <span class="italic">nicht mehr wegzudenken.</span>',
    'testi.sub': 'Echte Zitate. Echte Entscheidungen. Echt gesparte Stunden.',
    'testi1.q': '"Drei Abos in der ersten Woche gekündigt. Ich zahlte 8 Stunden im Monat für Dinge, die ich nie öffnete."',
    'testi1.a': 'Anna · Produktdesignerin',
    'testi2.q': '"Ich brauche kein Budget. Ich brauche einen Übersetzer. HourSpend ist genau das."',
    'testi2.a': 'Marcus · Software-Ingenieur',
    'testi3.q': '"Der 4€ Kaffee fühlt sich anders an, wenn du siehst, dass er 20 Min deines Dienstags ist."',
    'testi3.a': 'Priya · Marketing-Leiterin',
    'faq.eye': 'Fragen', 'faq.title': 'Was uns <span class="italic">gefragt wird.</span>',
    'faq1.q': 'Ist es wirklich kostenlos?',
    'faq1.a': 'Basisfunktionen sind für immer gratis. Pro schaltet KI und Diagramme frei für den Preis von ~30 min/Monat deines Lebens.',
    'faq2.q': 'Verkauft ihr meine Daten?',
    'faq2.a': 'Niemals. Deine Daten leben auf dem Gerät und in deinem persönlichen Firebase. Keine Ads.',
    'faq3.q': 'Wie genau ist die Stunden-Umrechnung?',
    'faq3.a': 'So genau wie dein eingegebener Lohn. Wir nutzen 160 Stunden/Monat.',
    'faq4.q': 'Android?',
    'faq4.a': 'Nur iOS. Nativ auf iOS 17+ mit Liquid Glass für die beste Erfahrung.',
    'faq5.q': 'Unterschied zu Mint / YNAB / Copilot?',
    'faq5.a': 'Sie zeigen Euro. Wir zeigen dein Leben. Das ist keine Funktion — es ist eine Philosophie. Wenn du ein 12€ Mittagessen als 1,4 Arbeitsstunden siehst, vergisst du es nicht mehr.',
    'faq6.q': 'Welche Sprachen?',
    'faq6.a': '14 Sprachen nativ: Englisch, Türkisch, Spanisch, Deutsch, Französisch, Portugiesisch, Japanisch, Koreanisch, Chinesisch, Italienisch, Niederländisch, Polnisch, Russisch, Arabisch.',
    'dl.eye': 'Die iOS App', 'dl.title': 'Tracke jeden Euro<br>in <span class="italic">Stunden</span> des Lebens.',
    'dl.sub': 'Der kostenlose Rechner ist nur ein Vorgeschmack. Die iOS App macht es für jede Ausgabe automatisch.',
    'dl.f1': 'Ausgaben per Sprache, Text oder Beleg-Scan',
    'dl.f2': 'Siehe deinen Monatsverbrauch in Arbeitsstunden',
    'dl.f3': 'Setze Sparziele als "Stunden zurück"',
    'dl.f4': '14 Sprachen · Multi-Währung · privat by default',
    'dl.badge': 'Im App Store laden',
    'ph.week': 'Diese Woche', 'ph.spent': '≈ 290€ ausgegeben',
    'ph.coffee': 'Kaffee', 'ph.lunch': 'Mittag', 'ph.groceries': 'Einkauf', 'ph.gas': 'Benzin',
    'fin.eye': 'Ein letztes', 'fin.title': 'Du gibst kein Geld aus.<br>Du gibst <span class="italic">dein Leben</span> aus.',
    'fin.sub': 'Du hast noch etwa 2.500 Wochenenden. Geld lässt sich zurückgewinnen. Minuten nicht.',
    'fin.btn1': 'Kostenlos laden', 'fin.btn2': 'Rechner ausprobieren',
    'float.cta': 'Gratis laden · iOS',
    'nav.search': 'Suche',
    'rev.e': 'Der Reframe, visualisiert',
    'rev.h': 'Du glaubst, du gibst <span class="money">Geld</span> aus.<br>Du gibst <span class="italic">dein Leben</span> aus.',
    'rev.hint': 'Fahre mit dem Cursor über das Bild',
    'rev.hintMobile': 'Scrollen — Geld wird Leben',
    'vanti.eye': 'Dein Taschen-Teammate',
    'vanti.h': 'Das ist <span class="vanti-name">Vanti</span>.<br>Eine Taschenuhr <span class="italic">mit Meinung</span>.',
    'vanti.sub': 'Dein Assistent in der App. Merkt, wenn Essen die halbe Woche frisst. Übersetzt jede Ausgabe in Stunden. Predigt nie. Ist schnell warm.',
    'vanti.m1': 'Hallo.',
    'vanti.m2': 'Wäge es für dich ab.',
    'vanti.m3': 'Du hast gerade 20 Stunden behalten.',
    'vanti.foot': 'Bereits in der App. Keine Einrichtung nötig.',
    'foot.all': 'Alle Artikel', 'foot.ios': 'iOS App', 'foot.privacy': 'Datenschutz', 'foot.terms': 'AGB',
    'foot.credit': '© HourSpend · Geld ist nur getauschte Zeit.',
    'foot.vanti': '— Vanti, dein Taschen-Teammate.',
    'faq.vanti': 'Vanti hört zu',
    'unit.perMonth': '/Mo',
    'share.ok': 'Kopiert — füge es überall ein'
  },
  fr: {
    'nav.browse': 'Explorer', 'nav.cta': 'Obtenir l\'app',
    'hero.h1': '<span class="line"><span class="word">Ton</span> <span class="word">argent,</span></span><br><span class="line"><span class="word">en</span> <span class="word accent">heures</span></span><br><span class="line"><span class="word">de</span> <span class="word">ta</span> <span class="word">vie.</span></span>',
    'hero.rank': 'Suivi argent-en-heures', 'hero.badge': 'Live · Calculatrice gratuite · iOS',
    'hero.sub': 'La seule app qui convertit chaque dépense en heures de travail réellement coûtées. Café. Loyer. Abonnements. Vois ce que tu échanges. Décide autrement.',
    'hero.download': 'Télécharger iOS', 'hero.try': 'Essayer la calculatrice',
    'hero.stat1': 'Articles', 'hero.stat2': 'Langues', 'hero.stat3': 'Note moyenne',
    'calc.title': 'Calculatrice', 'calc.live': 'DIRECT',
    'calc.salary': 'Salaire mensuel', 'calc.hpw': 'H / semaine', 'calc.exp': 'Dépense $',
    'calc.result': 'Ça t\'a coûté', 'calc.share': 'Partager ce calcul', 'calc.for': 'pour',
    'calc.c1': 'Café · 4€', 'calc.c2': 'Déjeuner · 15€', 'calc.c3': 'Courses · 100€', 'calc.c4': 'Loyer · 1200€',
    'unit.min': 'min', 'unit.hrs': 'h', 'unit.days': 'jours', 'unit.weeks': 'semaines', 'unit.months': 'mois', 'unit.years': 'ans',
    'unit.empty': '—', 'unit.enter': 'entrer les valeurs',
    'trusted.label': 'Utilisé par ceux qui valorisent leur temps',
    't1': 'Product Hunt', 't2': '★★★★★ App Store',
    't3': 'Top 10 Finance · iOS', 't4': 'TikTok · 2.4M vues', 't5': 'Indie Hackers',
    'numbers.eye': 'Les chiffres durs', 'numbers.title': 'Construit <span class="italic">différemment.</span>',
    'numbers.sub': 'Pas de pubs. Pas de vente de données. Pas de manipulation.',
    'num1.l': 'App argent-heures', 'num1.s': 'Créateur de catégorie · iOS',
    'num2.l': 'Dépenses suivies', 'num2.s': 'Chaque mois, en hausse',
    'num3.l': 'Note moyenne', 'num3.s': 'Partout',
    'num4.l': 'Langues actives', 'num4.s': 'Localisation complète',
    'story.label': 'Le recadrage', 'story.hrsNum': '20 min', 'story.amt': '4€',
    'story.cap1': 'Compter en argent cache la vérité.',
    'story.cap2': '4€ ne semble rien. 20 minutes de ta vie, ça change tout.',
    'story.cap3': 'Ton argent est ton temps, converti. Impossible à oublier.',
    'bento.eye': 'La vérité en chiffres', 'bento.title': 'Ce que les dépenses quotidiennes <span class="italic">coûtent vraiment.</span>',
    'bento.sub': 'À 20€/heure. Utilise la calculatrice ci-dessus pour tes propres chiffres.',
    'b1.meta': 'Latte quotidien', 'b1.h': 'Ton café matinal pendant un an =', 'b1.eq': '14 jours de travail', 'b1.p': '4€/jour × 365 · 73 heures de travail',
    'b2.meta': 'iPhone 16 Pro', 'b2.eq': '6 semaines', 'b2.price': '1.299€',
    'b3.meta': 'Loyer Paris', 'b3.eq': '22.5 jours', 'b3.price': '1.500€/mois',
    'b4.meta': 'Uber Eats', 'b4.eq': '1.3 h', 'b4.price': '32€',
    'b5.meta': 'Netflix annuel', 'b5.eq': '11 h', 'b5.price': '240€',
    'gal.eye': 'Où vont tes heures', 'gal.title': 'Chaque habitude a un <span class="italic">prix</span> en temps.',
    'gal.sub': 'Les petites choses s\'additionnent plus vite qu\'on pense.',
    'g1.k': 'Rituel matinal', 'g1.v': '73 heures de travail · par an',
    'g2.k': 'Abonnements', 'g2.v': '4 jours de ta vie',
    'g3.k': 'Livraison', 'g3.v': '1.3 h',
    'g4.k': 'Shopping weekend', 'g4.v': '6 h',
    'g5.k': 'Réalité 9-17h', 'g5.v': '1.600€/semaine · en <em>tes</em> minutes',
    'g6.k': 'Escapade weekend', 'g6.v': '32 h',
    'how.eye': 'Comment ça marche', 'how.title': 'Trois étapes. <span class="italic">Changement éternel.</span>',
    'how.sub': 'Installe. Enregistre. Vois ta vie d\'une façon que tu ne pourras plus ignorer.',
    'how1.h': 'Dis-nous ton <span class="italic">heure.</span>',
    'how1.p': 'Entre ton salaire une fois. Tout sera chiffré en tes minutes.',
    'how2.h': 'Ajoute <span class="italic">n\'importe quoi.</span>',
    'how2.p': 'Voix. Texte. Scan de reçu. Chaque entrée devient des heures de travail.',
    'how3.h': 'Vois tes <span class="italic">décisions</span> changer.',
    'how3.p': 'Un café à 4€ a un goût différent quand tu vois 20 min de ta vie.',
    'vs.eye': 'Face-à-face', 'vs.title': 'HourSpend vs <span class="italic">les autres.</span>',
    'vs.sub': 'Les autres apps montrent des euros. Une seule montre <em>ta vie</em>.',
    'vs.col0': 'Fonction',
    'vs.r1': 'Dépenses en heures de travail',
    'vs.r2': 'Gratuit pour toujours (de base)',
    'vs.r3': 'Zéro pub. Zéro vente.',
    'vs.r4': 'Parsing IA des dépenses',
    'vs.r5': 'Localisé en 14 langues',
    'vs.r6': 'iOS natif (Liquid Glass)',
    'vs.r7': 'Privé par défaut',
    'marq.eye': 'Parcourir le catalogue', 'marq.title': '52<span class="italic">+</span> achats, évalués en vie.',
    'marq.browse': 'Voir les 52 articles',
    'testi.eye': 'Ce qu\'on dit', 'testi.title': 'Le recadrage est <span class="italic">inoubliable.</span>',
    'testi.sub': 'Vrais témoignages. Vraies décisions. Vraies heures récupérées.',
    'testi1.q': '"Annulé trois abonnements la première semaine. Je payais 8 heures par mois pour des trucs que je n\'ouvrais jamais."',
    'testi1.a': 'Anna · Designer produit',
    'testi2.q': '"Je n\'ai pas besoin d\'un budget. J\'ai besoin d\'un traducteur. HourSpend, c\'est exactement ça."',
    'testi2.a': 'Marcus · Ingénieur logiciel',
    'testi3.q': '"Le café à 4€ frappe différemment quand tu vois que ce sont 20 min de ton mardi."',
    'testi3.a': 'Priya · Responsable marketing',
    'faq.eye': 'Questions', 'faq.title': 'Ce qu\'on <span class="italic">nous demande.</span>',
    'faq1.q': 'C\'est vraiment gratuit ?',
    'faq1.a': 'Les fonctions de base sont gratuites pour toujours. Pro débloque l\'IA pour environ 30 min de ta vie par mois.',
    'faq2.q': 'Vous vendez mes données ?',
    'faq2.a': 'Jamais. Tes données vivent sur l\'appareil. On ne vend rien.',
    'faq3.q': 'Précision de la conversion en heures ?',
    'faq3.a': 'Aussi précise que le salaire que tu entres. 160h/mois (40h/sem × 4.33).',
    'faq4.q': 'Android ?',
    'faq4.a': 'iOS uniquement. Natif iOS 17+ avec Liquid Glass pour la meilleure expérience.',
    'faq5.q': 'Différence avec Mint / YNAB / Copilot ?',
    'faq5.a': 'Eux montrent des euros. Nous montrons ta vie. Ce n\'est pas une fonction — c\'est une philosophie. Quand tu vois un déjeuner à 15€ comme 1,4 h de travail, tu ne l\'oublies plus.',
    'faq6.q': 'Quelles langues ?',
    'faq6.a': '14 langues natives : Anglais, Turc, Espagnol, Allemand, Français, Portugais, Japonais, Coréen, Chinois, Italien, Néerlandais, Polonais, Russe, Arabe.',
    'dl.eye': 'Obtenir l\'app iOS', 'dl.title': 'Suis chaque euro<br>en <span class="italic">heures</span> de vie.',
    'dl.sub': 'La calculatrice gratuite n\'est qu\'un avant-goût. L\'app iOS le fait pour chaque dépense, automatiquement.',
    'dl.f1': 'Ajoute par voix, texte ou scan de reçu',
    'dl.f2': 'Vois ta consommation mensuelle en heures',
    'dl.f3': 'Fixe des objectifs d\'épargne en "heures récupérées"',
    'dl.f4': '14 langues · multi-devise · privé par défaut',
    'dl.badge': 'Télécharger sur App Store',
    'ph.week': 'Cette semaine', 'ph.spent': '≈ 290€ dépensés',
    'ph.coffee': 'Café', 'ph.lunch': 'Déjeuner', 'ph.groceries': 'Courses', 'ph.gas': 'Essence',
    'fin.eye': 'Une dernière', 'fin.title': 'Tu ne dépenses pas d\'argent.<br>Tu dépenses <span class="italic">ta vie.</span>',
    'fin.sub': 'Il te reste environ 2 500 week-ends. L\'argent se regagne. Les minutes non.',
    'fin.btn1': 'Télécharger Gratuit', 'fin.btn2': 'Essayer la calculatrice',
    'float.cta': 'Télécharger · iOS',
    'nav.search': 'Recherche',
    'rev.e': 'Le recadrage, visualisé',
    'rev.h': 'Tu crois dépenser de l\'<span class="money">argent</span>.<br>Tu dépenses <span class="italic">ta vie</span>.',
    'rev.hint': 'Passe ton curseur sur l\'image',
    'rev.hintMobile': 'Fais défiler — l\'argent devient la vie',
    'vanti.eye': 'Ta coéquipière de poche',
    'vanti.h': 'Voici <span class="vanti-name">Vanti</span>.<br>Une montre de poche <span class="italic">avec des avis</span>.',
    'vanti.sub': 'Ton assistante dans l\'app. Remarque quand la bouffe avale la moitié de ta semaine. Traduit chaque dépense en heures. Ne sermonne pas.',
    'vanti.m1': 'Salut.',
    'vanti.m2': 'Je pèse ça pour toi.',
    'vanti.m3': 'Tu viens de garder 20 heures.',
    'vanti.foot': 'Déjà dans l\'app. Aucune configuration.',
    'foot.all': 'Tous les articles', 'foot.ios': 'App iOS', 'foot.privacy': 'Confidentialité', 'foot.terms': 'Conditions',
    'foot.credit': '© HourSpend · L\'argent n\'est que du temps échangé.',
    'foot.vanti': '— Vanti, ta coéquipière de poche.',
    'faq.vanti': 'Vanti écoute',
    'unit.perMonth': '/mois',
    'share.ok': 'Copié — colle-le où tu veux'
  },
  pt: {
    'nav.browse': 'Explorar', 'nav.cta': 'Baixar o App',
    'hero.h1': '<span class="line"><span class="word">Seu</span> <span class="word">dinheiro,</span></span><br><span class="line"><span class="word">em</span> <span class="word accent">horas</span></span><br><span class="line"><span class="word">da</span> <span class="word">sua</span> <span class="word">vida.</span></span>',
    'hero.rank': 'Rastreador dinheiro-em-horas', 'hero.badge': 'Ao vivo · Grátis · iOS',
    'hero.sub': 'O único app que converte cada gasto nas horas de trabalho que realmente custou. Café. Aluguel. Assinaturas. Decida diferente.',
    'hero.download': 'Baixar para iOS', 'hero.try': 'Testar calculadora',
    'hero.stat1': 'Itens', 'hero.stat2': 'Idiomas', 'hero.stat3': 'Nota média',
    'calc.title': 'Calculadora', 'calc.live': 'AO VIVO',
    'calc.salary': 'Salário mensal', 'calc.hpw': 'Hs / semana', 'calc.exp': 'Gasto $',
    'calc.result': 'Isso te custou', 'calc.share': 'Compartilhar esta matemática', 'calc.for': 'por',
    'calc.c1': 'Café · R$20', 'calc.c2': 'Almoço · R$45', 'calc.c3': 'Compras · R$400', 'calc.c4': 'Aluguel · R$2.500',
    'unit.min': 'min', 'unit.hrs': 'hrs', 'unit.days': 'dias', 'unit.weeks': 'semanas', 'unit.months': 'meses', 'unit.years': 'anos',
    'unit.empty': '—', 'unit.enter': 'insira valores',
    'trusted.label': 'Escolhido por quem valoriza seu tempo',
    't1': 'Product Hunt', 't2': '★★★★★ App Store',
    't3': 'Top 10 Finanças · iOS', 't4': 'TikTok · 2.4M views', 't5': 'Indie Hackers',
    'numbers.eye': 'Os números', 'numbers.title': 'Construído <span class="italic">diferente.</span>',
    'numbers.sub': 'Sem ads. Sem venda de dados. Sem manipulação.',
    'num1.l': 'App dinheiro-horas', 'num1.s': 'Criador de categoria · iOS',
    'num2.l': 'Gastos rastreados', 'num2.s': 'Todo mês, crescendo',
    'num3.l': 'Nota média', 'num3.s': 'Em todas as regiões',
    'num4.l': 'Idiomas ativos', 'num4.s': 'Localização completa',
    'story.label': 'O reenquadramento', 'story.hrsNum': '20 min', 'story.amt': 'R$20',
    'story.cap1': 'Contar em dinheiro esconde a verdade.',
    'story.cap2': 'R$20 parece nada. 20 min da sua vida, muda tudo.',
    'story.cap3': 'Seu dinheiro é seu tempo, convertido. Impossível esquecer.',
    'bento.eye': 'A verdade em números', 'bento.title': 'O que os gastos diários <span class="italic">realmente</span> custam.',
    'bento.sub': 'A R$50/hora. Use a calculadora acima para seus próprios números.',
    'b1.meta': 'Latte diário', 'b1.h': 'Seu café matinal por um ano =', 'b1.eq': '14 dias de trabalho', 'b1.p': 'R$20/dia × 365 · 73 horas de trabalho',
    'b2.meta': 'iPhone 16 Pro', 'b2.eq': '6 semanas', 'b2.price': 'R$6.999',
    'b3.meta': 'Aluguel SP', 'b3.eq': '22.5 dias', 'b3.price': 'R$3.500/mês',
    'b4.meta': 'iFood jantar', 'b4.eq': '1.3 hrs', 'b4.price': 'R$80',
    'b5.meta': 'Netflix anual', 'b5.eq': '11 hrs', 'b5.price': 'R$1.200',
    'gal.eye': 'Para onde vão suas horas', 'gal.title': 'Cada hábito tem um <span class="italic">preço</span> em tempo.',
    'gal.sub': 'As pequenas coisas somam mais rápido do que você pensa.',
    'g1.k': 'Ritual matinal', 'g1.v': '73 horas de trabalho · por ano',
    'g2.k': 'Assinaturas', 'g2.v': '4 dias da sua vida',
    'g3.k': 'Delivery', 'g3.v': '1.3 hrs',
    'g4.k': 'Compras fim de semana', 'g4.v': '6 hrs',
    'g5.k': 'Realidade 9-5', 'g5.v': 'R$4.000/semana · em <em>seus</em> minutos',
    'g6.k': 'Viagem weekend', 'g6.v': '32 hrs',
    'how.eye': 'Como funciona', 'how.title': 'Três passos. <span class="italic">Mudança eterna.</span>',
    'how.sub': 'Instale. Registre. Veja sua vida de um jeito que não dá pra esquecer.',
    'how1.h': 'Nos diga sua <span class="italic">hora.</span>',
    'how1.p': 'Entre seu salário uma vez. Tudo será precificado nos seus minutos.',
    'how2.h': 'Adicione <span class="italic">qualquer coisa.</span>',
    'how2.p': 'Voz. Texto. Scan de recibo. Cada entrada vira horas de trabalho.',
    'how3.h': 'Veja suas <span class="italic">decisões</span> mudarem.',
    'how3.p': 'Um café de R$20 tem outro sabor quando você vê 20 min da sua vida.',
    'vs.eye': 'Frente a frente', 'vs.title': 'HourSpend vs <span class="italic">o resto.</span>',
    'vs.sub': 'Os outros apps mostram dólares. Só um mostra <em>sua vida</em>.',
    'vs.col0': 'Função',
    'vs.r1': 'Gastos em horas de trabalho',
    'vs.r2': 'Grátis pra sempre (básico)',
    'vs.r3': 'Sem ads. Sem venda.',
    'vs.r4': 'IA para gastos',
    'vs.r5': 'Localizado em 14 idiomas',
    'vs.r6': 'iOS nativo (Liquid Glass)',
    'vs.r7': 'Privado por padrão',
    'marq.eye': 'Explore o catálogo', 'marq.title': '52<span class="italic">+</span> compras, valoradas em vida.',
    'marq.browse': 'Ver os 52 itens',
    'testi.eye': 'O que estão dizendo', 'testi.title': 'O reframe é <span class="italic">inesquecível.</span>',
    'testi.sub': 'Depoimentos reais. Decisões reais. Horas realmente salvas.',
    'testi1.q': '"Cancelei três assinaturas na primeira semana. Eu pagava 8 horas por mês por coisas que nem abria."',
    'testi1.a': 'Anna · Designer de produto',
    'testi2.q': '"Não preciso de orçamento. Preciso de tradutor. HourSpend é exatamente isso."',
    'testi2.a': 'Marcus · Engenheiro de software',
    'testi3.q': '"Café de R$20 bate diferente quando você vê 20 min da sua terça. Mudou meu jeito de gastar."',
    'testi3.a': 'Priya · Líder de marketing',
    'faq.eye': 'Perguntas', 'faq.title': 'O que <span class="italic">nos perguntam.</span>',
    'faq1.q': 'É grátis mesmo?',
    'faq1.a': 'Básico grátis pra sempre. Pro libera IA e gráficos por cerca de 30 min da sua vida/mês.',
    'faq2.q': 'Vocês vendem meus dados?',
    'faq2.a': 'Nunca. Os dados vivem no dispositivo. Zero ads.',
    'faq3.q': 'Precisão da conversão?',
    'faq3.a': 'Tão precisa quanto seu salário. 160h/mês (40h/sem × 4.33).',
    'faq4.q': 'Android?',
    'faq4.a': 'Só iOS. Nativo iOS 17+ com Liquid Glass para a melhor experiência.',
    'faq5.q': 'Diferença pra Mint / YNAB / Copilot?',
    'faq5.a': 'Eles mostram reais. Nós mostramos sua vida. É filosofia.',
    'faq6.q': 'Quais idiomas?',
    'faq6.a': '14 idiomas nativos: Inglês, Turco, Espanhol, Alemão, Francês, Português, Japonês, Coreano, Chinês, Italiano, Holandês, Polonês, Russo, Árabe.',
    'dl.eye': 'App iOS', 'dl.title': 'Rastreie cada dólar<br>em <span class="italic">horas</span> de vida.',
    'dl.sub': 'A calculadora grátis é só um gostinho. O app iOS faz isso com cada gasto automaticamente.',
    'dl.f1': 'Adicione por voz, texto ou scan',
    'dl.f2': 'Veja seu gasto mensal em horas',
    'dl.f3': 'Defina metas como "horas recuperadas"',
    'dl.f4': '14 idiomas · multi-moeda · privado por padrão',
    'dl.badge': 'Baixar na App Store',
    'ph.week': 'Esta semana', 'ph.spent': '≈ R$1.500 gastos',
    'ph.coffee': 'Café', 'ph.lunch': 'Almoço', 'ph.groceries': 'Compras', 'ph.gas': 'Gasolina',
    'fin.eye': 'Última coisa', 'fin.title': 'Você não gasta dinheiro.<br>Você gasta <span class="italic">sua vida.</span>',
    'fin.sub': 'Você tem cerca de 2.500 fins de semana restantes. Dinheiro volta. Minutos não.',
    'fin.btn1': 'Baixar Grátis', 'fin.btn2': 'Testar calculadora',
    'float.cta': 'Baixar Grátis · iOS',
    'nav.search': 'Buscar',
    'rev.e': 'O reframe, visualizado',
    'rev.h': 'Você acha que gasta <span class="money">dinheiro</span>.<br>Você gasta <span class="italic">sua vida</span>.',
    'rev.hint': 'Passe o cursor sobre a imagem',
    'rev.hintMobile': 'Role — dinheiro vira vida',
    'vanti.eye': 'Sua companheira de bolso',
    'vanti.h': 'Conheça a <span class="vanti-name">Vanti</span>.<br>Um relógio de bolso <span class="italic">com opiniões</span>.',
    'vanti.sub': 'Sua assistente dentro do app. Percebe quando comida come metade da semana. Traduz cada gasto em horas. Não faz sermão. Esquenta rápido.',
    'vanti.m1': 'Olá.',
    'vanti.m2': 'Estou pesando pra você.',
    'vanti.m3': 'Você acabou de guardar 20 horas.',
    'vanti.foot': 'Já no app. Sem configuração.',
    'foot.all': 'Todos os itens', 'foot.ios': 'App iOS', 'foot.privacy': 'Privacidade', 'foot.terms': 'Termos',
    'foot.credit': '© HourSpend · Dinheiro é só tempo trocado.',
    'foot.vanti': '— Vanti, sua companheira de bolso.',
    'faq.vanti': 'Vanti está ouvindo',
    'unit.perMonth': '/mês',
    'share.ok': 'Copiado — cole onde quiser'
  },
  ja: {
    'nav.browse': '見る', 'nav.cta': 'アプリを入手',
    'hero.h1': '<span class="line"><span class="word">あなたの</span><span class="word">お金、</span></span><br><span class="line"><span class="word">人生の</span><span class="word accent">時間で。</span></span>',
    'hero.rank': '時間-換算 マネートラッカー', 'hero.badge': 'ライブ · 無料計算機 · iOS',
    'hero.sub': 'すべての支出を、実際に奪われた労働時間に換算する唯一のアプリ。コーヒー。家賃。サブスク。何と交換しているかを見る。違う選択を。',
    'hero.download': 'iOS版をダウンロード', 'hero.try': '計算機を試す',
    'hero.stat1': '項目', 'hero.stat2': '言語', 'hero.stat3': '平均評価',
    'calc.title': '計算機', 'calc.live': 'リアルタイム',
    'calc.salary': '月収', 'calc.hpw': '時間/週', 'calc.exp': '支出 $',
    'calc.result': 'かかった時間', 'calc.share': 'この計算をシェア', 'calc.for': 'で',
    'calc.c1': 'コーヒー · ¥500', 'calc.c2': 'ランチ · ¥1,200', 'calc.c3': '食料品 · ¥8,000', 'calc.c4': '家賃 · ¥120,000',
    'unit.min': '分', 'unit.hrs': '時間', 'unit.days': '日', 'unit.weeks': '週', 'unit.months': 'ヶ月', 'unit.years': '年',
    'unit.empty': '—', 'unit.enter': '値を入力',
    'trusted.label': '時間を大切にする人々に選ばれています',
    't1': 'Product Hunt', 't2': '★★★★★ App Store',
    't3': 'Top 10 ファイナンス · iOS', 't4': 'TikTok · 240万再生', 't5': 'Indie Hackers',
    'numbers.eye': 'ハードな数字', 'numbers.title': '<span class="italic">違う</span> 作り方。',
    'numbers.sub': '広告なし。データ販売なし。操作なし。',
    'num1.l': '時間換算アプリ', 'num1.s': 'カテゴリ創造 · iOS',
    'num2.l': '追跡された支出', 'num2.s': '毎月、増加中',
    'num3.l': '平均評価', 'num3.s': 'すべての地域で',
    'num4.l': '対応言語', 'num4.s': '完全ローカライズ',
    'story.label': 'リフレーム', 'story.hrsNum': '20分', 'story.amt': '¥500',
    'story.cap1': 'お金で数えると真実が隠れる。',
    'story.cap2': '¥500は何でもない。人生の20分は違う。',
    'story.cap3': 'お金はあなたの時間、変換したもの。忘れられない。',
    'bento.eye': '数字で見る真実', 'bento.title': '日々の支出が<span class="italic">本当に</span>かかるもの。',
    'bento.sub': '時給¥2,500の場合。上の計算機で自分の数字を見てみて。',
    'b1.meta': '毎日のラテ習慣', 'b1.h': '1年間の朝のコーヒー =', 'b1.eq': '14営業日', 'b1.p': '¥500/日 × 365 · 73時間の労働',
    'b2.meta': 'iPhone 16 Pro', 'b2.eq': '6週間', 'b2.price': '¥189,800',
    'b3.meta': '東京1K 家賃', 'b3.eq': '22.5日', 'b3.price': '¥120,000/月',
    'b4.meta': 'Uber Eats', 'b4.eq': '1.3時間', 'b4.price': '¥3,500',
    'b5.meta': 'Netflix年間', 'b5.eq': '11時間', 'b5.price': '¥29,880',
    'gal.eye': 'あなたの時間はどこへ', 'gal.title': 'すべての習慣には時間の<span class="italic">値札</span>がある。',
    'gal.sub': '小さなことは思ったより早く積み重なる。',
    'g1.k': '朝の儀式', 'g1.v': '年間73時間の労働',
    'g2.k': 'サブスク', 'g2.v': '人生の4日',
    'g3.k': '出前ディナー', 'g3.v': '1.3時間',
    'g4.k': '週末の買い物', 'g4.v': '6時間',
    'g5.k': '9-5の現実', 'g5.v': '週¥160,000 · <em>あなたの</em>分に換算',
    'g6.k': '週末旅行', 'g6.v': '32時間',
    'how.eye': '仕組み', 'how.title': '3ステップ。<span class="italic">永遠に変わる。</span>',
    'how.sub': 'インストール。記録。見えなかった自分の人生が見える。',
    'how1.h': 'あなたの<span class="italic">時給</span>を教えて。',
    'how1.p': '給料か時給を一度入力。以降すべてがあなたの分に換算されます。',
    'how2.h': '<span class="italic">何でも</span>追加。',
    'how2.p': '音声。テキスト。レシートスキャン。ドルではなく労働時間で表示。',
    'how3.h': '<span class="italic">決断</span>が変わるのを見る。',
    'how3.p': '¥500のコーヒーが人生の20分だと見えると、違って感じる。',
    'vs.eye': '比較', 'vs.title': 'HourSpend vs <span class="italic">他社。</span>',
    'vs.sub': '他のアプリはドルを見せる。HourSpendだけが<em>人生</em>を見せる。',
    'vs.col0': '機能',
    'vs.r1': '労働時間で表示',
    'vs.r2': '永久無料（基本機能）',
    'vs.r3': '広告ゼロ・データ販売ゼロ',
    'vs.r4': 'AI支出解析',
    'vs.r5': '14言語ローカライズ',
    'vs.r6': 'iOSネイティブ（Liquid Glass）',
    'vs.r7': 'デフォルトでプライベート',
    'marq.eye': 'カタログを見る', 'marq.title': '52<span class="italic">+</span> 購入品、人生で価格付け。',
    'marq.browse': '52項目すべて見る',
    'testi.eye': 'ユーザーの声', 'testi.title': 'このリフレームは<span class="italic">忘れられない。</span>',
    'testi.sub': 'リアルな声。リアルな判断。リアルに取り戻した時間。',
    'testi1.q': '「最初の週に3つサブスクを解約。開いてもないものに月8時間払っていた。」',
    'testi1.a': 'Anna · プロダクトデザイナー',
    'testi2.q': '「予算は要らない。翻訳機が欲しかった。HourSpendはまさにそれ。」',
    'testi2.a': 'Marcus · ソフトウェアエンジニア',
    'testi3.q': '「¥500のコーヒーが火曜日の20分だと知ると、支出が変わる。マジで。」',
    'testi3.a': 'Priya · マーケティング責任者',
    'faq.eye': 'FAQ', 'faq.title': 'よくある<span class="italic">質問。</span>',
    'faq1.q': '本当に無料？',
    'faq1.a': '基本機能は永久無料。Pro版はAIや高度なグラフを月30分相当で解放。',
    'faq2.q': 'データを売りますか？',
    'faq2.a': '絶対に。データは端末とあなたのFirebaseに。広告ゼロ。',
    'faq3.q': '時間換算の精度は？',
    'faq3.a': '入力した給与の精度次第。月160時間（週40時間×4.33）で計算。',
    'faq4.q': 'Android？',
    'faq4.a': '現在iOSのみ。iOS 17+にLiquid Glassでネイティブ実装。',
    'faq5.q': 'Mint / YNAB / Copilotとの違い？',
    'faq5.a': '彼らは円を見せる。我々は人生を見せる。これは機能ではなく哲学。¥1,200のランチが1.4時間の労働だと見えると、忘れられない。',
    'faq6.q': '対応言語は？',
    'faq6.a': '14言語ネイティブ：英語、トルコ語、スペイン語、ドイツ語、フランス語、ポルトガル語、日本語、韓国語、中国語、イタリア語、オランダ語、ポーランド語、ロシア語、アラビア語。',
    'dl.eye': 'iOSアプリを入手', 'dl.title': 'すべてのドルを<br>人生の<span class="italic">時間で</span>追跡。',
    'dl.sub': '無料計算機は味見。iOSアプリは毎回自動で換算。',
    'dl.f1': '音声、テキスト、レシートスキャンで追加',
    'dl.f2': '月の消費を労働時間で確認',
    'dl.f3': '貯蓄目標を「取り戻した時間」として設定',
    'dl.f4': '14言語 · マルチ通貨 · デフォルトでプライベート',
    'dl.badge': 'App Storeでダウンロード',
    'ph.week': '今週', 'ph.spent': '≈ ¥45,000 支出',
    'ph.coffee': 'コーヒー', 'ph.lunch': 'ランチ', 'ph.groceries': '食料品', 'ph.gas': 'ガソリン',
    'fin.eye': '最後に', 'fin.title': 'お金を使っているのではない。<br><span class="italic">人生を</span>使っている。',
    'fin.sub': '残りの週末は約2,500回。お金は稼げる。時間は稼げない。',
    'fin.btn1': '無料ダウンロード', 'fin.btn2': '計算機を試す',
    'float.cta': '無料ダウンロード · iOS',
    'nav.search': '検索',
    'rev.e': 'リフレームを可視化',
    'rev.h': '<span class="money">お金</span>を使っていると思っている。<br>実は<span class="italic">人生</span>を使っている。',
    'rev.hint': '画像の上でカーソルを動かして',
    'rev.hintMobile': 'スクロール — お金が人生に',
    'vanti.eye': 'ポケットの相棒',
    'vanti.h': '<span class="vanti-name">Vanti</span>を紹介。<br><span class="italic">意見を持つ</span>懐中時計。',
    'vanti.sub': 'アプリ内のアシスタント。食費が一週間の半分を占めたら気づく。すべての支出を時間に換える。説教はしない。すぐ馴染む。',
    'vanti.m1': 'こんにちは。',
    'vanti.m2': '一緒に考えてる。',
    'vanti.m3': '20時間、取り戻したね。',
    'vanti.foot': 'アプリに既に搭載。設定不要。',
    'foot.all': 'すべて', 'foot.ios': 'iOSアプリ', 'foot.privacy': 'プライバシー', 'foot.terms': '利用規約',
    'foot.credit': '© HourSpend · お金はただ交換された時間。',
    'foot.vanti': '— Vanti、ポケットの相棒。',
    'faq.vanti': 'Vantiが聞いてる',
    'unit.perMonth': '/月',
    'share.ok': 'コピーしました — どこにでも貼れます'
  }
};

// Country → language mapping for IP-based detection
const COUNTRY_LANG = {
  TR:'tr',
  ES:'es', MX:'es', AR:'es', CO:'es', CL:'es', PE:'es', VE:'es', EC:'es', GT:'es', CU:'es', UY:'es', PY:'es', BO:'es', DO:'es', HN:'es', SV:'es', NI:'es', CR:'es', PA:'es', PR:'es',
  DE:'de', AT:'de', CH:'de', LI:'de',
  FR:'fr', BE:'fr', LU:'fr', MC:'fr',
  BR:'pt', PT:'pt', AO:'pt', MZ:'pt', CV:'pt', GW:'pt',
  JP:'ja'
  // rest default to 'en'
};

function applyLang(lang) {
  const dict = I18N[lang] || I18N.en;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    // If element also has data-i18n-html, let the HTML handler win (prevents escaped HTML)
    if (el.hasAttribute('data-i18n-html')) return;
    const key = el.dataset.i18n;
    if (dict[key] != null) el.textContent = dict[key];
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    // key can come from data-i18n-html value OR fall back to data-i18n
    const key = el.dataset.i18nHtml || el.dataset.i18n;
    if (dict[key] != null) el.innerHTML = dict[key];
  });
  // button label
  const btnLbl = document.getElementById('langBtnLabel');
  if (btnLbl) btnLbl.textContent = lang.toUpperCase();
  document.querySelectorAll('.lang-option').forEach(o => o.classList.toggle('active', o.dataset.lang === lang));
  localStorage.setItem('hs.lang', lang);
  document.documentElement.lang = lang;
  __currentLang = lang;

  // Locale-aware calc defaults — only swap if user hasn't customized
  const loc = LOCALE_CURR[lang] || LOCALE_CURR.en;
  const CHIP_VALS = {
    en:[5,35,100,1500], tr:[100,500,1500,25000], es:[4,12,80,1200],
    de:[4,12,80,1200], fr:[4,15,100,1200], pt:[20,45,400,2500], ja:[500,1200,8000,120000]
  };
  const chipVals = CHIP_VALS[lang] || CHIP_VALS.en;
  document.querySelectorAll('.chip').forEach((c, i) => {
    if (chipVals[i] != null) c.dataset.amount = chipVals[i];
  });
  // Apply defaults to inputs if they match any previous default (meaning user didn't type)
  const salEl = document.getElementById('salary'), expEl = document.getElementById('expense');
  const knownSalaries = Object.values(LOCALE_CURR).map(l => String(l.salary));
  const knownExpenses = Object.values(LOCALE_CURR).flatMap(l => [String(l.exp)]).concat(
    Object.values(CHIP_VALS).flatMap(v => v.map(String))
  );
  if (salEl && knownSalaries.includes(salEl.value)) salEl.value = loc.salary;
  if (expEl && knownExpenses.includes(expEl.value)) expEl.value = loc.exp;

  // Recompute dynamic calc label text
  if (typeof calc === 'function') calc();
  // Re-run hero word animation after translation swap
  if (typeof animateHeroWords === 'function') animateHeroWords();
  // Convert marquee / inline USD prices to the active locale (with optional localized suffix)
  document.querySelectorAll('[data-usd]').forEach(el => {
    const usd = el.dataset.usd;
    if (!usd) return;
    const suffixKey = el.dataset.usdSuffixKey;
    const suffix = suffixKey && dict[suffixKey] ? dict[suffixKey] : '';
    el.textContent = fmtUSDAsLocal(usd) + suffix;
  });
}

// Determine initial language synchronously (localStorage > browser)
(function initialLangSync() {
  const saved = localStorage.getItem('hs.lang');
  let lang = null;
  if (saved && I18N[saved]) lang = saved;
  else {
    const b = (navigator.language || 'en').toLowerCase().slice(0, 2);
    if (I18N[b]) lang = b;
  }
  if (lang) applyLang(lang);
  else {
    // mark EN as active
    const o = document.querySelector('.lang-option[data-lang="en"]');
    if (o) o.classList.add('active');
    const btn = document.getElementById('langBtnLabel');
    if (btn) btn.textContent = 'EN';
  }
})();

// Async: IP-based geolocation (only if user didn't manually choose)
(async function detectByIP() {
  if (localStorage.getItem('hs.lang')) return; // user has a manual choice, don't override
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 3500);
    const res = await fetch('https://ipapi.co/json/', { signal: ctrl.signal });
    clearTimeout(timer);
    const data = await res.json();
    const cc = (data && data.country_code) ? data.country_code.toUpperCase() : null;
    if (cc) {
      const lang = COUNTRY_LANG[cc] || 'en';
      if (I18N[lang] && lang !== __currentLang) {
        applyLang(lang);
        // re-run hero animation with new words
        if (window.gsap) {
          const newWords = document.querySelectorAll('#hero-h1 .word');
          gsap.set(newWords, { yPercent: 100, opacity: 0 });
          gsap.to(newWords, { yPercent: 0, opacity: 1, duration: 1.1, stagger: 0.06, ease: 'expo.out' });
        }
      }
    }
  } catch (e) { /* silent */ }
})();

// Language switcher UI
(() => {
  const langBtn = document.getElementById('langBtn');
  const langSwitch = document.getElementById('langSwitch');
  const langDropdown = document.getElementById('langDropdown');
  if (!langBtn || !langDropdown) return;
  langBtn.addEventListener('click', (e) => { e.stopPropagation(); langSwitch.classList.toggle('open'); });
  document.addEventListener('click', (e) => { if (!langSwitch.contains(e.target)) langSwitch.classList.remove('open'); });
  langDropdown.addEventListener('click', (e) => {
    const opt = e.target.closest('.lang-option');
    if (!opt) return;
    applyLang(opt.dataset.lang);
    langSwitch.classList.remove('open');
    // Re-run hero animation for new words
    if (window.gsap) {
      const newWords = document.querySelectorAll('#hero-h1 .word');
      gsap.set(newWords, { yPercent: 100, opacity: 0 });
      gsap.to(newWords, { yPercent: 0, opacity: 1, duration: 1.1, stagger: 0.06, ease: 'expo.out' });
    }
  });
})();

/* ============ GSAP HERO ENTRANCE (word-level, simpler) ============ */
function animateHeroWords(){
  if(!window.gsap)return;
  const words=document.querySelectorAll('#hero-h1 .word');
  if(!words.length)return;
  gsap.set(words,{yPercent:100,opacity:0});
  gsap.to(words,{yPercent:0,opacity:1,duration:1.0,stagger:0.05,ease:'expo.out',delay:0.15,overwrite:true});
}
animateHeroWords();

if (window.gsap) {
  /* ============ PINNED STORYTELLING — SVG CLOCK SCRUB ============ */
  if (window.ScrollTrigger) {
    const handH = $('storyHandH');
    const handM = $('storyHandM');
    const label = $('storyLabel');
    const arc = $('storyArc');
    const storyCaption = $('storyCaption');

    // Target: 23 min = minute hand 138°, hour hand 11.5°
    // Arc length = (23/60) × 2π × 86 = ~207 of total ~540 circumference
    const ARC_TOTAL = 540;
    const TARGET_MIN_DEG = 138;  // 23 minutes
    const TARGET_HR_DEG = 11.5;  // slight sweep

    ScrollTrigger.create({
      trigger: '#story',
      start: 'top top',
      end: '+=220%',
      scrub: 0.6,
      onUpdate: (self) => {
        const t = self.progress;
        // Ease curve so hands start slow, accelerate, settle
        const ease = t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t+2,2)/2;
        const minDeg = ease * TARGET_MIN_DEG;
        const hrDeg = ease * TARGET_HR_DEG;
        if (handM) handM.setAttribute('transform', `rotate(${minDeg} 100 100)`);
        if (handH) handH.setAttribute('transform', `rotate(${hrDeg} 100 100)`);
        // Arc grows with minute hand — draw from 12 position
        if (arc) {
          const len = ARC_TOTAL * (minDeg / 360);
          // Build arc path from 12 o'clock sweeping clockwise to current angle
          const rad = (minDeg - 90) * Math.PI / 180;
          const endX = 100 + 86 * Math.cos(rad);
          const endY = 100 + 86 * Math.sin(rad);
          const largeArc = minDeg > 180 ? 1 : 0;
          if (minDeg > 1) {
            arc.setAttribute('d', `M 100 14 A 86 86 0 ${largeArc} 1 ${endX.toFixed(2)} ${endY.toFixed(2)}`);
            arc.style.strokeDashoffset = 0;
          } else {
            arc.setAttribute('d', 'M 100 14 A 86 86 0 0 1 100 14');
          }
        }
        // Label morphs: 0 min → 5 min → 12 min → 23 min
        if (label) {
          const mins = Math.round(ease * 23);
          const d = (typeof I18N !== 'undefined' && I18N[__currentLang]) ? I18N[__currentLang] : (typeof I18N !== 'undefined' ? I18N.en : null);
          const unit = d && d['unit.min'] ? d['unit.min'] : 'min';
          label.textContent = mins + ' ' + unit;
        }
        // Caption swap
        try {
          const d = I18N[__currentLang] || I18N.en;
          if (t < 0.3) storyCaption.textContent = d['story.cap1'];
          else if (t < 0.7) storyCaption.textContent = d['story.cap2'];
          else storyCaption.textContent = d['story.cap3'];
        } catch (e) {}
      }
    });
  }

  /* ============ PHONE SCROLL ROTATION ============ */
  if (window.ScrollTrigger) {
    gsap.to('.phone-mockup', {
      scrollTrigger: {
        trigger: '.download-card',
        start: 'top 80%',
        end: 'bottom 20%',
        scrub: 1
      },
      rotateY: 8, rotateX: -4
    });
  }
}

/* ============ REVEAL ON SCROLL ============ */
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

/* ============ RESPECT REDUCED MOTION ============ */
if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.style.setProperty('--reduce-motion', '1');
  if (lenis) lenis.destroy();
}

/* ============ CURSOR REVEAL — CANVAS TRAIL (desktop) + SCROLL FADE (mobile) ============ */
(()=>{
  const sec=document.getElementById('revealMouse');
  const canvas=document.getElementById('revealCanvas');
  if(!sec||!canvas)return;
  // Touch / coarse-pointer devices: swap the canvas trail for a scroll-driven money→life fade
  if(matchMedia('(hover: none), (pointer: coarse)').matches){
    const topUrl = sec.dataset.top;
    const layer = document.createElement('div');
    layer.className = 'reveal-top-m';
    layer.style.backgroundImage = `url('${topUrl}')`;
    sec.insertBefore(layer, sec.querySelector('.reveal-caption'));
    const hintSpan = sec.querySelector('[data-i18n="rev.hint"]');
    if (hintSpan) {
      hintSpan.setAttribute('data-i18n', 'rev.hintMobile');
      try {
        const dict = I18N[__currentLang] || I18N.en;
        if (dict && dict['rev.hintMobile']) hintSpan.textContent = dict['rev.hintMobile'];
      } catch (e) {}
    }
    const update = () => {
      const rect = sec.getBoundingClientRect();
      const vh = window.innerHeight;
      // Start fading when the section is 80% up the viewport, finish when mostly scrolled past
      const travelled = vh * 0.85 - rect.top;
      const totalDistance = vh * 0.85 + rect.height * 0.55;
      const progress = Math.max(0, Math.min(1, travelled / totalDistance));
      layer.style.opacity = String(1 - progress);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    return;
  }
  const ctx=canvas.getContext('2d',{alpha:true});
  const topUrl=sec.dataset.top;
  const img=new Image();img.crossOrigin='anonymous';img.src=topUrl;
  let imgReady=false;
  const dpr=Math.min(window.devicePixelRatio,2);
  let w=0,h=0,rect=null;
  function size(){
    rect=sec.getBoundingClientRect();
    w=Math.round(rect.width);h=Math.round(rect.height);
    canvas.width=w*dpr;canvas.height=h*dpr;
    canvas.style.width=w+'px';canvas.style.height=h+'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  size();
  new ResizeObserver(size).observe(sec);
  window.addEventListener('scroll',()=>{rect=sec.getBoundingClientRect();},{passive:true});
  const trail=[];
  let lastX=-9999,lastY=-9999,lastT=0,inside=false,running=false;
  const BASE_R=150,MIN_R=80,TTL=28;
  function drawCover(){
    ctx.globalCompositeOperation='source-over';
    ctx.clearRect(0,0,w,h);
    if(!imgReady){ctx.fillStyle='#0a0710';ctx.fillRect(0,0,w,h);return;}
    const ir=img.naturalWidth/img.naturalHeight,cr=w/h;
    let sx=0,sy=0,sw=img.naturalWidth,sh=img.naturalHeight;
    if(ir>cr){sw=img.naturalHeight*cr;sx=(img.naturalWidth-sw)/2;}
    else{sh=img.naturalWidth/cr;sy=(img.naturalHeight-sh)/2;}
    ctx.drawImage(img,sx,sy,sw,sh,0,0,w,h);
    const g=ctx.createLinearGradient(0,0,0,h);
    g.addColorStop(0,'rgba(4,3,10,0.25)');g.addColorStop(1,'rgba(4,3,10,0.55)');
    ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
  }
  function erase(){
    ctx.globalCompositeOperation='destination-out';
    for(const p of trail){
      const a=p.life/TTL;
      const r=MIN_R+(p.r-MIN_R)*a;
      const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,r);
      g.addColorStop(0,`rgba(0,0,0,${a})`);
      g.addColorStop(0.55,`rgba(0,0,0,${a*0.85})`);
      g.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=g;
      ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*2);ctx.fill();
    }
    ctx.globalCompositeOperation='source-over';
  }
  function drawRing(){
    if(!inside||!trail.length)return;
    const p=trail[trail.length-1];
    ctx.strokeStyle='rgba(232,200,110,0.45)';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.arc(p.x,p.y,BASE_R+6,0,Math.PI*2);ctx.stroke();
    const gr=ctx.createRadialGradient(p.x,p.y,BASE_R-10,p.x,p.y,BASE_R+12);
    gr.addColorStop(0,'rgba(232,200,110,0)');gr.addColorStop(1,'rgba(232,200,110,0.22)');
    ctx.fillStyle=gr;ctx.beginPath();ctx.arc(p.x,p.y,BASE_R+14,0,Math.PI*2);ctx.fill();
  }
  function tick(){
    drawCover();
    for(let i=trail.length-1;i>=0;i--){trail[i].life--;if(trail[i].life<=0)trail.splice(i,1);}
    if(trail.length)erase();
    drawRing();
    if(trail.length||inside){running=true;requestAnimationFrame(tick);}else running=false;
  }
  function start(){if(!running){running=true;requestAnimationFrame(tick);}}
  sec.addEventListener('pointerenter',e=>{
    inside=true;rect=sec.getBoundingClientRect();
    lastX=e.clientX-rect.left;lastY=e.clientY-rect.top;lastT=performance.now();
  });
  sec.addEventListener('pointerleave',()=>{inside=false;start();});
  sec.addEventListener('pointermove',e=>{
    if(!rect)rect=sec.getBoundingClientRect();
    const x=e.clientX-rect.left,y=e.clientY-rect.top;
    const now=performance.now(),dt=Math.max(1,now-lastT);
    const dx=x-lastX,dy=y-lastY;
    const v=Math.min(4,Math.sqrt(dx*dx+dy*dy)/dt*16);
    lastX=x;lastY=y;lastT=now;
    const r=BASE_R*(0.7+v*0.35);
    const steps=Math.min(10,Math.ceil(Math.hypot(dx,dy)/18));
    for(let i=1;i<=steps;i++){
      const t=i/steps;
      trail.push({x:lastX-dx*(1-t),y:lastY-dy*(1-t),r,life:TTL});
    }
    if(trail.length>60)trail.splice(0,trail.length-60);
    start();
  });
  img.onload=()=>{imgReady=true;start();};
  start();
})();

/* ============ LIVE SOCIAL PROOF TICKER ============ */
(()=>{
  const stack=document.getElementById('tickerStack');
  const liveNum=document.getElementById('liveNum');
  const ticker=document.getElementById('ticker');
  if(!stack)return;
  const NAMES=['Anna K.','Marcus R.','Priya S.','Jamal B.','Emma W.','David L.','Fatma T.','Kenji O.','Sophia L.','Luca M.','Chloé D.','Diego V.','Omar A.','Maya P.','Noah C.','Isla F.','Ethan M.','Yui T.','Amara J.','Theo Z.'];
  const ACTIONS=[
    n=>`${n} just cancelled <b>3 subscriptions</b> — saved 8 hrs / month`,
    n=>`${n} skipped a $12 lunch — kept <b>28 min</b> of Tuesday`,
    n=>`${n} reframed rent: <b>$2,400 = 96 hrs</b> / month`,
    n=>`${n} set a goal: <b>40 hrs back</b> by quarter end`,
    n=>`${n} logged morning latte — <b>12 min</b>, 5 days in a row`,
    n=>`${n} saw their iPhone cost = <b>6 weeks of work</b>`,
    n=>`${n} downloaded HourSpend from <b>Turkey</b>`,
    n=>`${n} downloaded HourSpend from <b>Germany</b>`,
    n=>`${n} downloaded HourSpend from <b>Brazil</b>`,
    n=>`${n} downloaded HourSpend from <b>Japan</b>`,
    n=>`${n} turned down DoorDash — saved <b>1.3 hrs</b>`,
    n=>`${n} hit <b>100 expenses logged</b> · 47 hrs reframed`,
    n=>`${n} passed on Netflix — kept <b>55 min</b> of weekend`,
    n=>`${n} shared HourSpend with their partner`,
    n=>`${n} set hourly rate to <b>$32</b> — every number updated`
  ];
  function make(){
    const n=NAMES[Math.floor(Math.random()*NAMES.length)];
    const a=ACTIONS[Math.floor(Math.random()*ACTIONS.length)];
    return {n,html:a(n),t:Math.floor(Math.random()*15)+1+'s ago'};
  }
  function render(item){
    stack.querySelectorAll('.ticker-card').forEach(c=>{c.classList.remove('in');c.classList.add('out');setTimeout(()=>c.remove(),600);});
    const card=document.createElement('div');
    card.className='ticker-card';
    card.innerHTML=`<div class="ticker-dot"></div><div class="ticker-body"><div class="ticker-name">${item.n}</div><div class="ticker-action">${item.html}</div><div class="ticker-time">${item.t}</div></div><button class="ticker-close" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M18 6L6 18M6 6l12 12"/></svg></button>`;
    card.querySelector('.ticker-close').onclick=()=>{ticker.classList.add('hidden');};
    stack.appendChild(card);
    requestAnimationFrame(()=>card.classList.add('in'));
  }
  setTimeout(()=>render(make()),2400);
  setInterval(()=>render(make()),5200);
  let n=147;
  setInterval(()=>{
    const d=Math.random()<0.55?1:-1;
    n=Math.max(100,Math.min(250,n+d*(Math.floor(Math.random()*3)+1)));
    if(liveNum)liveNum.textContent=n;
  },2000);
})();

/* ============ CMD+K PALETTE ============ */
(()=>{
  const overlay=document.getElementById('paletteOverlay');
  const input=document.getElementById('paletteInput');
  const list=document.getElementById('paletteList');
  const navCmd=document.getElementById('navCmd');
  if(!overlay||!input||!list)return;
  const ITEMS=[
    {t:'Download for iOS',d:'App Store · free',u:'https://apps.apple.com/us/app/budget-tracker-money-time/id6758535957',k:'D'},
    {t:'Browse 52 items',d:'Programmatic SEO catalog',u:'/buying',k:'B'},
    {t:'Try the calculator',d:'Explore any amount',u:'#hero',k:'C'},
    {t:'Experimental v4',d:'Preview new design',u:'/v4',k:'V'},
    {t:'Privacy policy',d:'How your data is handled',u:'/privacy',k:'P'},
    {t:'Terms of service',d:'EULA',u:'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/',k:'T'},
    {t:'How it works',d:'3-step explainer',u:'#howto',k:'H'},
    {t:'vs. competition',d:'Mint, YNAB, Copilot',u:'#compare',k:'V'},
    {t:'FAQ',d:'Common questions',u:'#faq',k:'F'},
    {t:'Switch to English',d:'EN',fn:()=>applyLang('en')},
    {t:'Türkçe\'ye geç',d:'TR',fn:()=>applyLang('tr')},
    {t:'Cambiar a Español',d:'ES',fn:()=>applyLang('es')},
    {t:'Wechseln zu Deutsch',d:'DE',fn:()=>applyLang('de')},
    {t:'Basculer en Français',d:'FR',fn:()=>applyLang('fr')},
    {t:'Mudar para Português',d:'PT',fn:()=>applyLang('pt')},
    {t:'日本語に切り替え',d:'JA',fn:()=>applyLang('ja')}
  ];
  let filtered=ITEMS.slice(),selected=0;
  function render(){
    list.innerHTML=filtered.map((it,i)=>`
      <div class="palette-item ${i===selected?'selected':''}" data-idx="${i}">
        <div class="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>
        <div class="txt"><div class="t">${it.t}</div><div class="d">${it.d}</div></div>
        ${it.k?`<span class="kbd">${it.k}</span>`:''}
      </div>`).join('');
    list.querySelectorAll('.palette-item').forEach(el=>el.addEventListener('click',()=>runAt(+el.dataset.idx)));
  }
  function runAt(i){
    const it=filtered[i];if(!it)return;
    if(it.fn)it.fn();
    else if(it.u){if(it.u.startsWith('#')){location.hash=it.u;}else location.href=it.u;}
    close();
  }
  function filter(q){
    q=q.toLowerCase();
    filtered=ITEMS.filter(i=>i.t.toLowerCase().includes(q)||i.d.toLowerCase().includes(q));
    selected=0;render();
  }
  function open(){overlay.classList.add('open');input.value='';filtered=ITEMS.slice();selected=0;render();setTimeout(()=>input.focus(),100);}
  function close(){overlay.classList.remove('open');}
  input.addEventListener('input',()=>filter(input.value));
  input.addEventListener('keydown',e=>{
    if(e.key==='ArrowDown'){e.preventDefault();selected=Math.min(filtered.length-1,selected+1);render();}
    else if(e.key==='ArrowUp'){e.preventDefault();selected=Math.max(0,selected-1);render();}
    else if(e.key==='Enter'){e.preventDefault();runAt(selected);}
    else if(e.key==='Escape')close();
  });
  addEventListener('keydown',e=>{
    if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();open();}
    if(e.key==='Escape')close();
  });
  overlay.addEventListener('click',e=>{if(e.target===overlay)close();});
  if(navCmd)navCmd.addEventListener('click',open);
  render();
})();

/* ============ TEXT SCRAMBLE ON HOVER ============ */
(()=>{
  if(matchMedia('(hover: none)').matches)return;
  const CHARS='!<>-_\\/[]{}—=+*^?#';
  function scramble(el,target,dur=600){
    const from=el.textContent;
    const to=target||from;
    const start=performance.now();
    const len=Math.max(from.length,to.length);
    const queue=[];
    for(let i=0;i<len;i++){
      const s=Math.floor(Math.random()*dur*0.4);
      const e=s+Math.floor(Math.random()*dur*0.6);
      queue.push({from:from[i]||'',to:to[i]||'',start:s,end:e,char:''});
    }
    (function tick(now){
      const t=now-start;let out='',done=0;
      for(const q of queue){
        if(t>=q.end){out+=q.to;done++;}
        else if(t>=q.start){
          if(!q.char||Math.random()<0.28)q.char=CHARS[Math.floor(Math.random()*CHARS.length)];
          out+=q.char;
        }else out+=q.from;
      }
      el.textContent=out;
      if(done<queue.length)requestAnimationFrame(tick);
    })(start);
  }
  document.querySelectorAll('[data-scramble]').forEach(el=>{
    el.addEventListener('pointerenter',()=>{
      if(el.dataset.scrambleLock)return;
      el.dataset.scrambleLock='1';
      scramble(el,el.textContent);
      setTimeout(()=>el.dataset.scrambleLock='',700);
    });
  });
})();

/* ============ TIME-BASED GREETING ============ */
(()=>{
  const badge=document.querySelector('.hero-badge span:last-child');
  if(!badge)return;
  const lang=localStorage.getItem('hs.lang')||'en';
  if(lang!=='en')return; // only greet in English locale — others use their i18n badge
  const h=new Date().getHours();
  let greet;
  if(h<5)       greet='Late night · Free calculator · iOS';
  else if(h<12) greet='Good morning · Free calculator · iOS';
  else if(h<17) greet='Good afternoon · Free calculator · iOS';
  else if(h<22) greet='Good evening · Free calculator · iOS';
  else          greet='Late · Free calculator · iOS';
  badge.textContent=greet;
  badge.removeAttribute('data-i18n'); // prevent i18n re-render from overwriting the greeting
})();

/* ============ SCROLL SPEEDOMETER (right edge) ============ */
(()=>{
  if(matchMedia('(pointer: coarse)').matches)return;
  const el=document.createElement('div');
  el.style.cssText='position:fixed;right:6px;top:50%;transform:translateY(-50%);width:3px;height:120px;background:rgba(255,255,255,0.04);border-radius:100px;z-index:65;pointer-events:none;overflow:hidden;';
  const fill=document.createElement('div');
  fill.style.cssText='position:absolute;bottom:0;left:0;right:0;background:linear-gradient(180deg,#e8c86e,#d4a846);border-radius:100px;transition:height 0.12s ease-out;box-shadow:0 0 12px rgba(232,200,110,0.5);';
  el.appendChild(fill);
  document.body.appendChild(el);
  let lastY=scrollY,v=0,fh=0;
  addEventListener('scroll',()=>{
    const y=scrollY;
    v=Math.min(100,Math.abs(y-lastY)*2.5);
    lastY=y;
    fh+=(v-fh)*0.35;
    fill.style.height=fh+'%';
  });
  (function decay(){fh*=0.92;fill.style.height=fh+'%';requestAnimationFrame(decay);})();
})();

/* ============ LIVE GLOBAL COUNTER (footer) ============ */
(()=>{
  const foot=document.querySelector('.footer-credit');
  if(!foot)return;
  const div=document.createElement('div');
  div.style.cssText='margin-top:10px;font-family:"Geist Mono",monospace;font-size:10px;color:#6e6379;letter-spacing:0.5px;font-variant-numeric:tabular-nums;';
  div.innerHTML='<span id="globalHrs">147,384</span> hrs reframed globally · updating live';
  foot.appendChild(div);
  const num=document.getElementById('globalHrs');
  let n=147384;
  setInterval(()=>{n+=Math.floor(Math.random()*3)+1;num.textContent=n.toLocaleString();},2200);
})();

/* ============ KONAMI CODE EASTER EGG ============ */
(()=>{
  const seq=['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let idx=0;
  addEventListener('keydown',e=>{
    const k=e.key.toLowerCase()==='b'||e.key.toLowerCase()==='a'?e.key.toLowerCase():e.key;
    if(k===seq[idx]){
      idx++;
      if(idx===seq.length){idx=0;triggerEgg();}
    }else idx=0;
  });
  function triggerEgg(){
    const overlay=document.createElement('div');
    overlay.style.cssText='position:fixed;inset:0;background:rgba(4,3,10,0.92);backdrop-filter:blur(20px);z-index:999;display:grid;place-items:center;opacity:0;transition:opacity 0.5s;cursor:pointer;';
    overlay.innerHTML=`
      <div style="text-align:center;padding:40px;">
        <div style="font-family:'Geist Mono',monospace;font-size:11px;letter-spacing:3px;color:#e8c86e;text-transform:uppercase;font-weight:700;margin-bottom:28px;">🎮 SECRET UNLOCKED</div>
        <div style="font-family:'Fraunces',serif;font-style:italic;font-weight:900;font-size:clamp(64px,10vw,160px);line-height:0.95;letter-spacing:-4px;background:linear-gradient(135deg,#f5e6c8,#e8c86e,#d4a846);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:32px;">you<br>found us.</div>
        <div style="font-family:'Cabinet Grotesk',sans-serif;font-size:20px;color:#f5f0e6;font-weight:600;margin-bottom:14px;">You just spent 0.4 seconds reframing money.</div>
        <div style="color:#a89cb8;font-size:14px;font-family:'Geist Mono',monospace;">Click anywhere to close</div>
      </div>`;
    overlay.addEventListener('click',()=>{overlay.style.opacity='0';setTimeout(()=>overlay.remove(),500);});
    document.body.appendChild(overlay);
    requestAnimationFrame(()=>overlay.style.opacity='1');
  }
})();
