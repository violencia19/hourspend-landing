#!/usr/bin/env node
//
// /time-cost/{slug}/ — "How long will it take to save for X?" pages.
// Matrix: item × wage tier. Each page is item-anchored: one item, rows for
// 8 wage tiers, columns for 10%/25%/50% savings rates. Targets long-tail
// intent like "how long to save for iPhone 16 Pro".
//

const fs = require('fs');
const path = require('path');

const OUT_DIR = path.resolve(__dirname, 'public', 'time-cost');

const ITEMS = [
  { slug: 'save-for-iphone-16-pro',       label: 'iPhone 16 Pro',       price: 1199,  category: 'Electronics', buyingSlug: 'iphone-16-pro' },
  { slug: 'save-for-macbook-air-m3',      label: 'MacBook Air M3',      price: 1099,  category: 'Electronics', buyingSlug: 'macbook-air-m3' },
  { slug: 'save-for-macbook-pro-14',      label: 'MacBook Pro 14"',     price: 1999,  category: 'Electronics', buyingSlug: 'macbook-pro-14' },
  { slug: 'save-for-airpods-pro-2',       label: 'AirPods Pro 2',       price: 249,   category: 'Electronics', buyingSlug: 'airpods-pro-2' },
  { slug: 'save-for-apple-watch-ultra',   label: 'Apple Watch Ultra',   price: 799,   category: 'Electronics', buyingSlug: 'apple-watch-ultra' },
  { slug: 'save-for-playstation-5',       label: 'PlayStation 5',       price: 499,   category: 'Electronics', buyingSlug: 'playstation-5' },
  { slug: 'save-for-xbox-series-x',       label: 'Xbox Series X',       price: 499,   category: 'Electronics', buyingSlug: 'xbox-series-x' },
  { slug: 'save-for-nintendo-switch',     label: 'Nintendo Switch OLED', price: 349,  category: 'Electronics', buyingSlug: 'nintendo-switch' },
  { slug: 'save-for-sony-wh-1000xm5',     label: 'Sony WH-1000XM5',     price: 399,   category: 'Electronics', buyingSlug: 'sony-wh-1000xm5' },
  { slug: 'save-for-ipad-pro',            label: 'iPad Pro',            price: 999,   category: 'Electronics', buyingSlug: 'ipad-pro' },
  { slug: 'save-for-tesla-model-3',       label: 'Tesla Model 3',       price: 38990, category: 'Vehicles',    buyingSlug: 'tesla-model-3' },
  { slug: 'save-for-tesla-model-y',       label: 'Tesla Model Y',       price: 44990, category: 'Vehicles',    buyingSlug: 'tesla-model-y' },
  { slug: 'save-for-honda-civic',         label: 'Honda Civic',         price: 23950, category: 'Vehicles',    buyingSlug: 'honda-civic' },
  { slug: 'save-for-toyota-corolla',      label: 'Toyota Corolla',      price: 22050, category: 'Vehicles',    buyingSlug: 'toyota-corolla' },
  { slug: 'save-for-bmw-3-series',        label: 'BMW 3 Series',        price: 45950, category: 'Vehicles',    buyingSlug: 'bmw-3-series' },
  { slug: 'save-for-engagement-ring',     label: 'Engagement Ring (avg)', price: 5500,  category: 'Life',       buyingSlug: 'engagement-ring-3-month-salary' },
  { slug: 'save-for-disney-family-trip',  label: 'Disney World family trip', price: 7000, category: 'Travel',    buyingSlug: 'disney-world-family-trip' },
  { slug: 'save-for-caribbean-cruise',    label: 'Caribbean cruise',    price: 3500,  category: 'Travel',      buyingSlug: 'caribbean-cruise' },
  { slug: 'save-for-vip-concert-ticket',  label: 'VIP concert ticket',  price: 1200,  category: 'Entertainment', buyingSlug: 'concert-ticket-vip' },
  { slug: 'save-for-home-down-payment',   label: 'Home down payment (20% of $400k)', price: 80000, category: 'Life', buyingSlug: null },
];

const WAGE_TIERS = [15, 20, 25, 30, 40, 50, 65, 80, 100];
// Savings rates as % of take-home (approx = 75% of gross hourly)
const SAVE_RATES = [
  { label: '10% of pay', pct: 0.10 },
  { label: '25% of pay', pct: 0.25 },
  { label: '50% of pay', pct: 0.50 },
];
const HOURS_PER_WEEK = 40;
const TAKE_HOME = 0.75; // rough 25% tax / withholding

function weeksToSave(price, wage, savePct) {
  const weekly = wage * HOURS_PER_WEEK * TAKE_HOME * savePct;
  return price / weekly;
}

function fmtDuration(weeks) {
  if (weeks < 1) return `${Math.round(weeks * 7)} days`;
  if (weeks < 8) return `${weeks.toFixed(1)} weeks`;
  if (weeks < 52) return `${(weeks / 4.33).toFixed(1)} months`;
  return `${(weeks / 52).toFixed(1)} years`;
}

function pageHtml(item) {
  const rows = WAGE_TIERS.map((wage) => {
    const cells = SAVE_RATES.map((r) => {
      const w = weeksToSave(item.price, wage, r.pct);
      return `<td>${fmtDuration(w)}</td>`;
    }).join('');
    return `        <tr>
          <td class="wage">$${wage}/hr</td>${cells}
        </tr>`;
  }).join('\n');

  const buyingLink = item.buyingSlug
    ? `<a href="/buying/${item.buyingSlug}">${item.label} — priced in hours</a>`
    : `${item.label}`;

  const title = `How long to save for ${item.label}? | HourSpend`;
  const description = `If you earn $15 to $100/hr and save 10-50% of your take-home, here's how long it takes to save ${item.price.toLocaleString()} dollars for a ${item.label}.`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<meta name="description" content="${description}">
<meta name="keywords" content="how long to save for ${item.label.toLowerCase()}, save for ${item.label.toLowerCase()}, ${item.label.toLowerCase()} savings calculator, weeks to save for ${item.label.toLowerCase()}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://hourspend.one/time-cost/${item.slug}">
<meta name="theme-color" content="#0a0710">

<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:type" content="article">
<meta property="og:url" content="https://hourspend.one/time-cost/${item.slug}">
<meta property="og:image" content="https://hourspend.one/og-image.jpg">
<meta name="twitter:card" content="summary_large_image">

<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/manifest.json">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800&family=Geist+Mono:wght@400;500&family=Fraunces:opsz,wght@9..144,400;9..144,700&display=swap" rel="stylesheet">

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": ${JSON.stringify('How long to save for a ' + item.label)},
  "description": ${JSON.stringify(description)},
  "step": [
    {"@type": "HowToStep", "position": 1, "name": "Note the price", "text": "A ${item.label} costs about $${item.price.toLocaleString()}."},
    {"@type": "HowToStep", "position": 2, "name": "Pick your hourly wage", "text": "Use your real hourly rate (after mandatory expenses), not gross."},
    {"@type": "HowToStep", "position": 3, "name": "Pick a savings rate", "text": "Common rates: 10%, 25%, or 50% of take-home pay."},
    {"@type": "HowToStep", "position": 4, "name": "Read the duration", "text": "Find your wage row and savings-rate column in the table below."}
  ]
}
</script>

<style>
:root {
  --bg: #0a0710; --surface: #12091e; --line: rgba(255,255,255,0.08);
  --gold: #d4a846; --gold-soft: #e8c86e;
  --text: #f5f0e6; --text-muted: #a59fb3; --text-dim: #6b6478;
  --editorial: 'Fraunces', Georgia, serif;
  --mono: 'Geist Mono', ui-monospace, monospace;
}
* { box-sizing: border-box; }
body {
  margin: 0; font-family: 'Cabinet Grotesk', sans-serif;
  background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(232,200,110,0.08), transparent 65%), var(--bg);
  color: var(--text); line-height: 1.7; font-size: 16px;
}
a { color: var(--gold-soft); text-decoration: none; border-bottom: 1px solid rgba(232,200,110,0.3); }
a:hover { color: var(--gold); border-bottom-color: var(--gold); }
.page-nav { position: sticky; top: 0; z-index: 10; backdrop-filter: blur(16px); background: rgba(10,7,16,0.72); border-bottom: 1px solid var(--line); }
.page-nav-inner { max-width: 820px; margin: 0 auto; padding: 18px 24px; display: flex; justify-content: space-between; align-items: center; }
.logo { display: inline-flex; align-items: center; gap: 10px; font-weight: 800; color: var(--text); border: 0; }
.logo svg { width: 18px; height: 18px; }
.back-link { font-size: 13px; color: var(--text-muted); border: 0; }
main { max-width: 820px; margin: 0 auto; padding: 64px 24px 120px; }
.eyebrow { font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: var(--gold); font-weight: 700; font-family: var(--mono); margin-bottom: 18px; }
h1 { font-size: clamp(36px, 5.5vw, 52px); line-height: 1.05; letter-spacing: -1.8px; font-weight: 800; margin: 0 0 12px; }
h1 em { font-family: var(--editorial); font-style: italic; background: linear-gradient(135deg, var(--gold-soft), var(--gold)); -webkit-background-clip: text; background-clip: text; color: transparent; }
.lede { font-size: 18px; color: var(--text-muted); margin: 0 0 28px; }
.price-meta {
  display: inline-block; padding: 8px 16px;
  background: rgba(232,200,110,0.08);
  border: 1px solid rgba(232,200,110,0.25);
  border-radius: 100px;
  font-family: var(--mono); font-size: 12px; letter-spacing: 1.2px;
  color: var(--gold); margin-bottom: 40px;
}
h2 { font-size: 24px; line-height: 1.3; letter-spacing: -0.5px; font-weight: 700; margin: 48px 0 16px; color: var(--text); }
p { color: var(--text-muted); margin: 0 0 18px; }
strong { color: var(--text); font-weight: 700; }

.saving-table {
  width: 100%; border-collapse: collapse;
  margin: 24px 0 40px;
  font-size: 14px;
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--line);
  border-radius: 12px;
  overflow: hidden;
}
.saving-table th {
  text-align: left; padding: 14px 16px;
  font-family: var(--mono); font-size: 11px; font-weight: 600;
  letter-spacing: 1.2px; text-transform: uppercase;
  color: var(--text-dim);
  background: rgba(255,255,255,0.03);
  border-bottom: 1px solid var(--line);
}
.saving-table th:not(:first-child) { text-align: right; }
.saving-table td { padding: 14px 16px; border-bottom: 1px solid var(--line); }
.saving-table td:not(:first-child) { text-align: right; color: var(--gold-soft); font-family: var(--editorial); font-style: italic; font-weight: 600; }
.saving-table tr:last-child td { border-bottom: 0; }
.saving-table td.wage { color: var(--text); font-weight: 700; }

.cta-block { margin-top: 40px; padding: 24px; background: var(--surface); border: 1px solid var(--line); border-left: 2px solid var(--gold); border-radius: 8px; }
.cta-block p { margin: 0 0 18px; color: var(--text); }
.cta-button { display: inline-block; padding: 12px 22px; border-radius: 12px; background: linear-gradient(135deg, var(--gold-soft), var(--gold)); color: #1a0b10; font-weight: 700; font-size: 15px; border: 0; text-decoration: none; }
.cta-button:hover { color: #1a0b10; border: 0; }

footer.page-footer { max-width: 820px; margin: 0 auto; padding: 40px 24px; border-top: 1px solid var(--line); color: var(--text-dim); font-size: 13px; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
footer.page-footer a { color: var(--text-muted); border: 0; }
</style>
</head>
<body>

<nav class="page-nav">
  <div class="page-nav-inner">
    <a href="/" class="logo">
      <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="#e8c86e" stroke-width="1.5"/><line x1="12" y1="12" x2="12" y2="7.5" stroke="#d4a846" stroke-width="2" stroke-linecap="round"/><line x1="12" y1="12" x2="18" y2="9" stroke="#e8c86e" stroke-width="1.3" stroke-linecap="round"/><circle cx="12" cy="12" r="1.2" fill="#d4a846"/></svg>
      HourSpend
    </a>
    <a href="/time-cost" class="back-link">← All goals</a>
  </div>
</nav>

<main>
  <div class="eyebrow">Savings calculator</div>
  <h1>How long to save<br>for a <em>${item.label}</em>?</h1>
  <p class="lede">At $${item.price.toLocaleString()}, the answer depends on what you earn and how much of it you keep. Here is the matrix for 9 wage tiers and 3 savings rates. Rows are gross hourly; columns are the percentage of take-home pay you set aside.</p>

  <div class="price-meta">Target: $${item.price.toLocaleString()} · Category: ${item.category}</div>

  <h2>How long it takes</h2>
  <table class="saving-table">
    <thead>
      <tr>
        <th>Your wage</th>
        ${SAVE_RATES.map((r) => `<th>${r.label}</th>`).join('\n        ')}
      </tr>
    </thead>
    <tbody>
${rows}
    </tbody>
  </table>
  <p style="font-size: 13px; color: var(--text-dim); font-family: var(--mono);">Assumes 40-hour week, 25% tax/withholding, straight-line saving from zero. Real life will be faster if you already have savings, slower if you have an emergency along the way.</p>

  <h2>Two catches the table hides</h2>
  <p><strong>1. Your real hourly wage is lower.</strong> The table uses the gross rate you type into the first column. Subtract your unpaid commute, work clothes, and the other costs of having a job, and the real rate can be 25-40% lower. That shifts every cell to the right.</p>
  <p><strong>2. Saving rate ≠ budget reality.</strong> "50% of take-home" sounds aggressive but is achievable with housemates, no car, and modest habits. "10%" is the US personal-savings-rate ballpark. Be honest with the column you pick.</p>

  <h2>Useful pages</h2>
  <ul>
    <li>${buyingLink}</li>
    <li><a href="/calculator">Work-hours calculator</a> — reframe any purchase as duration.</li>
    <li><a href="/philosophy">Philosophy</a> — why hours are a more honest unit than dollars.</li>
  </ul>

  <div class="cta-block">
    <p><strong>Want this tracked automatically?</strong> Set this as a Pursuit in the HourSpend iOS app and the running balance plus the hours-of-life-gained show up on your dashboard.</p>
    <a href="https://apps.apple.com/us/app/budget-tracker-money-time/id6758535957" class="cta-button">Get HourSpend</a>
  </div>
</main>

<footer class="page-footer">
  <div>© HourSpend · Money is just time, exchanged.</div>
  <div>
    <a href="/">Home</a> ·
    <a href="/calculator">Calculator</a> ·
    <a href="/time-cost">All goals</a> ·
    <a href="/buying">All items</a>
  </div>
</footer>

</body>
</html>
`;
}

function hubHtml() {
  const cats = {};
  for (const item of ITEMS) {
    cats[item.category] ||= [];
    cats[item.category].push(item);
  }
  const groups = Object.entries(cats).map(([cat, items]) => {
    const links = items.map((i) => `      <a href="/time-cost/${i.slug}" class="goal-card"><span class="goal-name">${i.label}</span><span class="goal-price">$${i.price.toLocaleString()}</span></a>`).join('\n');
    return `    <h3>${cat}</h3>
    <div class="goal-grid">
${links}
    </div>`;
  }).join('\n');

  const title = `How long will it take to save for that? | HourSpend`;
  const description = `Savings calculators for 20 common goals — iPhone, car, wedding, down payment, cruise. Enter your wage, pick a savings rate, get a timeline.`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<meta name="description" content="${description}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://hourspend.one/time-cost">
<meta name="theme-color" content="#0a0710">

<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:type" content="website">
<meta property="og:url" content="https://hourspend.one/time-cost">
<meta property="og:image" content="https://hourspend.one/og-image.jpg">
<meta name="twitter:card" content="summary_large_image">

<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/manifest.json">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800&family=Geist+Mono:wght@400;500&family=Fraunces:opsz,wght@9..144,400;9..144,700&display=swap" rel="stylesheet">

<style>
:root { --bg: #0a0710; --line: rgba(255,255,255,0.08); --gold: #d4a846; --gold-soft: #e8c86e; --text: #f5f0e6; --text-muted: #a59fb3; --text-dim: #6b6478; --editorial: 'Fraunces', Georgia, serif; --mono: 'Geist Mono', ui-monospace, monospace; }
* { box-sizing: border-box; }
body { margin: 0; font-family: 'Cabinet Grotesk', sans-serif; background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(232,200,110,0.08), transparent 65%), var(--bg); color: var(--text); line-height: 1.7; font-size: 16px; }
a { color: var(--gold-soft); text-decoration: none; border-bottom: 1px solid rgba(232,200,110,0.3); }
a:hover { color: var(--gold); border-bottom-color: var(--gold); }
.page-nav { position: sticky; top: 0; z-index: 10; backdrop-filter: blur(16px); background: rgba(10,7,16,0.72); border-bottom: 1px solid var(--line); }
.page-nav-inner { max-width: 960px; margin: 0 auto; padding: 18px 24px; display: flex; justify-content: space-between; align-items: center; }
.logo { display: inline-flex; align-items: center; gap: 10px; font-weight: 800; color: var(--text); border: 0; }
.logo svg { width: 18px; height: 18px; }
.back-link { font-size: 13px; color: var(--text-muted); border: 0; }
main { max-width: 960px; margin: 0 auto; padding: 72px 24px 120px; }
.eyebrow { font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: var(--gold); font-weight: 700; font-family: var(--mono); margin-bottom: 18px; }
h1 { font-size: clamp(40px, 6vw, 60px); line-height: 1.03; letter-spacing: -2px; font-weight: 800; margin: 0 0 12px; }
h1 em { font-family: var(--editorial); font-style: italic; background: linear-gradient(135deg, var(--gold-soft), var(--gold)); -webkit-background-clip: text; background-clip: text; color: transparent; }
.lede { font-size: 19px; color: var(--text-muted); margin: 0 0 48px; max-width: 680px; }
h3 { font-size: 14px; font-family: var(--mono); font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: var(--gold); margin: 40px 0 16px; }
.goal-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; }
.goal-card { display: flex; flex-direction: column; padding: 14px 16px; background: rgba(255,255,255,0.04); border: 1px solid var(--line); border-radius: 12px; color: var(--text); border-bottom: 1px solid var(--line); }
.goal-card:hover { border-color: rgba(232,200,110,0.4); color: var(--text); }
.goal-card .goal-name { font-weight: 600; font-size: 14px; margin-bottom: 4px; }
.goal-card .goal-price { font-family: var(--mono); font-size: 12px; color: var(--gold-soft); letter-spacing: 1px; }
footer.page-footer { max-width: 960px; margin: 0 auto; padding: 40px 24px; border-top: 1px solid var(--line); color: var(--text-dim); font-size: 13px; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
footer.page-footer a { color: var(--text-muted); border: 0; }
</style>
</head>
<body>
<nav class="page-nav">
  <div class="page-nav-inner">
    <a href="/" class="logo">
      <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="#e8c86e" stroke-width="1.5"/><line x1="12" y1="12" x2="12" y2="7.5" stroke="#d4a846" stroke-width="2" stroke-linecap="round"/><line x1="12" y1="12" x2="18" y2="9" stroke="#e8c86e" stroke-width="1.3" stroke-linecap="round"/><circle cx="12" cy="12" r="1.2" fill="#d4a846"/></svg>
      HourSpend
    </a>
    <a href="/" class="back-link">← Home</a>
  </div>
</nav>
<main>
  <div class="eyebrow">Savings calculators</div>
  <h1>How long to save <em>for that</em>?</h1>
  <p class="lede">${ITEMS.length} common goals, each with a matrix of wage tiers and savings rates. Pick the thing you want; read how long it takes. No signup. No tracking.</p>
${groups}
</main>
<footer class="page-footer">
  <div>© HourSpend · Money is just time, exchanged.</div>
  <div>
    <a href="/">Home</a> ·
    <a href="/calculator">Calculator</a> ·
    <a href="/philosophy">Philosophy</a> ·
    <a href="/buying">All items</a>
  </div>
</footer>
</body>
</html>
`;
}

function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, 'index.html'), hubHtml(), 'utf8');
  console.log(`  wrote public/time-cost/index.html`);
  for (const item of ITEMS) {
    const dir = path.join(OUT_DIR, item.slug);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), pageHtml(item), 'utf8');
    console.log(`  wrote public/time-cost/${item.slug}/index.html`);
  }
  console.log(`  ${ITEMS.length} goal pages + hub.`);
}

main();
