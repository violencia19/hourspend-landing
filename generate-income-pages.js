#!/usr/bin/env node
//
// /income/{slug}/ pages — "At $X/hr, here's what these cost in hours."
// 12 common US wage tiers. Each page shows 15 iconic purchases priced in
// hours at that specific wage. Hub at /income/ lists all tiers.
//
// Long-tail SEO target: "$25 an hour budget", "how long to save for iPhone at $15/hr", etc.
//

const fs = require('fs');
const path = require('path');

const OUT_DIR = path.resolve(__dirname, 'public', 'income');
const WORK_HOURS_PER_MONTH = 40 * 52 / 12; // 173.33

const TIERS = [
  { slug: '12-per-hour',   hourly: 12,  label: '$12/hr',  salary: 24960,  note: 'Near US federal-adjacent minimum wage.' },
  { slug: '15-per-hour',   hourly: 15,  label: '$15/hr',  salary: 31200,  note: 'Common entry-level service-industry wage.' },
  { slug: '20-per-hour',   hourly: 20,  label: '$20/hr',  salary: 41600,  note: 'Median retail / early admin / trades entry.' },
  { slug: '25-per-hour',   hourly: 25,  label: '$25/hr',  salary: 52000,  note: 'US median hourly wage, roughly.' },
  { slug: '30-per-hour',   hourly: 30,  label: '$30/hr',  salary: 62400,  note: 'Mid-level office / skilled trade.' },
  { slug: '40-per-hour',   hourly: 40,  label: '$40/hr',  salary: 83200,  note: 'Experienced professional / senior trade.' },
  { slug: '50-per-hour',   hourly: 50,  label: '$50/hr',  salary: 104000, note: 'Six-figure salary threshold.' },
  { slug: '65-per-hour',   hourly: 65,  label: '$65/hr',  salary: 135200, note: 'Senior engineering / mid-manager.' },
  { slug: '80-per-hour',   hourly: 80,  label: '$80/hr',  salary: 166400, note: 'Lead engineer / doctor / lawyer early career.' },
  { slug: '100-per-hour',  hourly: 100, label: '$100/hr', salary: 208000, note: 'Principal engineer / senior specialist / partner track.' },
  { slug: '150-per-hour',  hourly: 150, label: '$150/hr', salary: 312000, note: 'Senior executive / established consultant / attending physician.' },
  { slug: '200-per-hour',  hourly: 200, label: '$200/hr', salary: 416000, note: 'Top-bracket specialist / senior partner / C-suite.' },
];

// Iconic purchase anchors (matches existing /buying/* slugs for linkability)
const ITEMS = [
  { slug: 'starbucks-grande-latte',   label: 'Starbucks Grande Latte',    price: 5.45 },
  { slug: 'big-mac-meal',             label: 'Big Mac meal',              price: 9.49 },
  { slug: 'chipotle-burrito',         label: 'Chipotle burrito',          price: 11.50 },
  { slug: 'netflix-monthly',          label: 'Netflix monthly',           price: 22.99 },
  { slug: 'spotify-monthly',          label: 'Spotify monthly',           price: 11.99 },
  { slug: 'chatgpt-plus-monthly',     label: 'ChatGPT Plus',              price: 20 },
  { slug: 'doordash-dinner',          label: 'DoorDash dinner',           price: 32 },
  { slug: 'gym-membership-yearly',    label: 'Gym membership (yearly)',   price: 600 },
  { slug: 'airpods-pro-2',            label: 'AirPods Pro 2',             price: 249 },
  { slug: 'playstation-5',            label: 'PlayStation 5',             price: 499 },
  { slug: 'iphone-16-pro',            label: 'iPhone 16 Pro',             price: 1199 },
  { slug: 'macbook-air-m3',           label: 'MacBook Air M3',            price: 1099 },
  { slug: 'caribbean-cruise',         label: 'Caribbean cruise (7 nights)', price: 3500 },
  { slug: 'rent-1br-average',         label: 'Rent (1BR, US avg month)',  price: 1713 },
  { slug: 'tesla-model-3',            label: 'Tesla Model 3',             price: 38990 },
];

function formatDuration(hours) {
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  if (hours < 8) return `${hours.toFixed(1)} hr`;
  const days = hours / 8;
  if (days < 5) return `${days.toFixed(1)} days`;
  if (days < 22) return `${Math.round(days)} workdays`;
  const months = days / 22;
  if (months < 12) return `${months.toFixed(1)} months`;
  return `${(months / 12).toFixed(1)} years`;
}

function pageHtml(tier) {
  const rows = ITEMS.map((item) => {
    const hours = item.price / tier.hourly;
    return `        <tr>
          <td class="item"><a href="/buying/${item.slug}">${item.label}</a></td>
          <td class="price">$${item.price.toFixed(2)}</td>
          <td class="hours">${formatDuration(hours)}</td>
        </tr>`;
  }).join('\n');

  const title = `At ${tier.label}, how long is a coffee worth? | HourSpend`;
  const description = `If you earn ${tier.label} (≈ $${tier.salary.toLocaleString()}/yr), see what 15 common purchases cost in hours of work — coffee, iPhones, rent, cars. Free calculator.`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<meta name="description" content="${description}">
<meta name="keywords" content="${tier.label} budget, earning ${tier.label}, ${tier.hourly} an hour salary, ${tier.hourly} per hour purchases, time value of money, hourly wage calculator">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://hourspend.one/income/${tier.slug}">
<meta name="theme-color" content="#0a0710">

<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:type" content="article">
<meta property="og:url" content="https://hourspend.one/income/${tier.slug}">
<meta property="og:image" content="https://hourspend.one/og-image.jpg">
<meta name="twitter:card" content="summary_large_image">

<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/manifest.json">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800&family=Geist+Mono:wght@400;500&family=Fraunces:opsz,wght@9..144,400;9..144,700&display=swap" rel="stylesheet">

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": ${JSON.stringify(title)},
  "description": ${JSON.stringify(description)},
  "url": "https://hourspend.one/income/${tier.slug}",
  "image": "https://hourspend.one/og-image.jpg",
  "author": { "@type": "Organization", "name": "HourSpend", "url": "https://hourspend.one" },
  "publisher": { "@type": "Organization", "name": "HourSpend", "url": "https://hourspend.one" },
  "datePublished": "2026-04-22"
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
html { -webkit-text-size-adjust: 100%; }
body {
  margin: 0; font-family: 'Cabinet Grotesk', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(232,200,110,0.08), transparent 65%), var(--bg);
  color: var(--text); line-height: 1.7; font-size: 16px;
  -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;
}
a { color: var(--gold-soft); text-decoration: none; border-bottom: 1px solid rgba(232,200,110,0.3); transition: color 0.2s, border-color 0.2s; }
a:hover { color: var(--gold); border-bottom-color: var(--gold); }
.page-nav { position: sticky; top: 0; z-index: 10; backdrop-filter: saturate(140%) blur(16px); -webkit-backdrop-filter: saturate(140%) blur(16px); background: rgba(10,7,16,0.72); border-bottom: 1px solid var(--line); }
.page-nav-inner { max-width: 860px; margin: 0 auto; padding: 18px 24px; display: flex; align-items: center; justify-content: space-between; }
.logo { display: inline-flex; align-items: center; gap: 10px; font-weight: 800; font-size: 16px; letter-spacing: -0.4px; color: var(--text); border: 0; }
.logo svg { width: 18px; height: 18px; }
.back-link { font-size: 13px; color: var(--text-muted); border: 0; }
.back-link:hover { color: var(--text); }
main { max-width: 820px; margin: 0 auto; padding: 64px 24px 120px; }
.eyebrow { font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: var(--gold); font-weight: 700; font-family: var(--mono); margin-bottom: 18px; }
h1 { font-size: clamp(36px, 5.5vw, 56px); line-height: 1.05; letter-spacing: -1.8px; font-weight: 800; margin: 0 0 12px; }
h1 em { font-family: var(--editorial); font-style: italic; font-weight: 700; background: linear-gradient(135deg, var(--gold-soft), var(--gold)); -webkit-background-clip: text; background-clip: text; color: transparent; }
.lede { font-size: 18px; color: var(--text-muted); margin: 0 0 32px; }

.stat-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
  margin: 0 0 40px;
}
@media (max-width: 640px) { .stat-grid { grid-template-columns: 1fr; } }
.stat-cell {
  padding: 16px 18px;
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--line);
  border-radius: 12px;
}
.stat-label { font-family: var(--mono); font-size: 10px; letter-spacing: 1.6px; text-transform: uppercase; color: var(--text-dim); margin-bottom: 6px; }
.stat-value {
  font-family: var(--editorial); font-style: italic; font-weight: 700;
  font-size: 28px;
  background: linear-gradient(135deg, var(--gold-soft), var(--gold));
  -webkit-background-clip: text; background-clip: text; color: transparent;
}

h2 { font-size: 24px; line-height: 1.3; letter-spacing: -0.5px; font-weight: 700; margin: 48px 0 16px; color: var(--text); }
p { color: var(--text-muted); margin: 0 0 18px; }

.purchase-table {
  width: 100%; border-collapse: collapse;
  margin: 24px 0 40px;
  font-size: 15px;
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--line);
  border-radius: 12px;
  overflow: hidden;
}
.purchase-table th {
  text-align: left; padding: 14px 16px;
  font-family: var(--mono); font-size: 11px; font-weight: 600;
  letter-spacing: 1.2px; text-transform: uppercase;
  color: var(--text-dim);
  background: rgba(255,255,255,0.03);
  border-bottom: 1px solid var(--line);
}
.purchase-table th:nth-child(2), .purchase-table th:nth-child(3) { text-align: right; }
.purchase-table td { padding: 14px 16px; border-bottom: 1px solid var(--line); }
.purchase-table td:nth-child(2), .purchase-table td:nth-child(3) { text-align: right; }
.purchase-table tr:last-child td { border-bottom: 0; }
.purchase-table td.item a { color: var(--text); border-bottom: 1px solid transparent; }
.purchase-table td.item a:hover { color: var(--gold-soft); border-bottom-color: rgba(232,200,110,0.3); }
.purchase-table td.price { color: var(--text-muted); font-family: var(--mono); font-size: 13px; }
.purchase-table td.hours {
  font-family: var(--editorial); font-style: italic;
  color: var(--gold-soft); font-weight: 600; font-size: 17px;
}

.cta-block {
  margin-top: 40px; padding: 24px;
  background: var(--surface); border: 1px solid var(--line);
  border-left: 2px solid var(--gold); border-radius: 8px;
}
.cta-block p { margin: 0 0 18px; color: var(--text); }
.cta-button {
  display: inline-block;
  padding: 12px 22px; border-radius: 12px;
  background: linear-gradient(135deg, var(--gold-soft), var(--gold));
  color: #1a0b10; font-weight: 700; font-size: 15px;
  border: 0; text-decoration: none;
}
.cta-button:hover { color: #1a0b10; border: 0; }

.related {
  margin-top: 40px;
  display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 8px;
}
.related a {
  display: block; padding: 10px 12px;
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--line);
  border-radius: 10px;
  color: var(--text); font-size: 13px; font-weight: 600;
  border-bottom: 1px solid var(--line);
  text-align: center;
}
.related a:hover { border-color: rgba(232,200,110,0.4); color: var(--gold-soft); }
.related a.current { background: rgba(232,200,110,0.12); border-color: rgba(232,200,110,0.4); color: var(--gold); }

footer.page-footer {
  max-width: 820px; margin: 0 auto; padding: 40px 24px;
  border-top: 1px solid var(--line);
  color: var(--text-dim); font-size: 13px;
  display: flex; justify-content: space-between; flex-wrap: wrap; gap: 16px;
}
footer.page-footer a { color: var(--text-muted); border: 0; }
footer.page-footer a:hover { color: var(--text); }
</style>
</head>
<body>

<nav class="page-nav">
  <div class="page-nav-inner">
    <a href="/" class="logo">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="10" fill="none" stroke="#e8c86e" stroke-width="1.5"/>
        <line x1="12" y1="12" x2="12" y2="7.5" stroke="#d4a846" stroke-width="2" stroke-linecap="round"/>
        <line x1="12" y1="12" x2="18" y2="9" stroke="#e8c86e" stroke-width="1.3" stroke-linecap="round"/>
        <circle cx="12" cy="12" r="1.2" fill="#d4a846"/>
      </svg>
      HourSpend
    </a>
    <a href="/income" class="back-link">← All wages</a>
  </div>
</nav>

<main>
  <div class="eyebrow">At ${tier.label}</div>
  <h1>What does <em>${tier.label}</em><br>look like in hours?</h1>
  <p class="lede">${tier.note} If you earn this, here's what fifteen common purchases actually cost — in hours of your work, not dollars. The numbers assume a 40-hour week; your real-rate-adjusted numbers will be 25-40% worse.</p>

  <div class="stat-grid">
    <div class="stat-cell">
      <div class="stat-label">Hourly</div>
      <div class="stat-value">${tier.label}</div>
    </div>
    <div class="stat-cell">
      <div class="stat-label">Annual (40hr/wk)</div>
      <div class="stat-value">$${(tier.salary/1000).toFixed(0)}k</div>
    </div>
    <div class="stat-cell">
      <div class="stat-label">Per workday</div>
      <div class="stat-value">$${(tier.hourly * 8).toFixed(0)}</div>
    </div>
  </div>

  <h2>15 purchases, priced in your life</h2>
  <table class="purchase-table">
    <thead>
      <tr><th>Purchase</th><th>Price</th><th>Work time</th></tr>
    </thead>
    <tbody>
${rows}
    </tbody>
  </table>

  <h2>The real hourly rate is lower</h2>
  <p>The numbers above use the raw ${tier.label}. Your <strong>real</strong> hourly rate — after income tax, mandatory expenses, commute time, and all the small costs of having a job — is usually 25-40% lower. If you want the more honest version, re-run the math with your real rate on the <a href="/calculator">calculator</a>.</p>
  <p>For the full backstory on why that correction matters, see <a href="/philosophy">the philosophy page</a>.</p>

  <div class="cta-block">
    <p><strong>Want this math automatically?</strong> The HourSpend iOS app does it on every expense you log. Free to start, no bank feeds required.</p>
    <a href="https://apps.apple.com/us/app/budget-tracker-money-time/id6758535957" class="cta-button">Get HourSpend</a>
  </div>

  <h2>Other wage tiers</h2>
  <div class="related">
    ${TIERS.map((t) => `<a href="/income/${t.slug}" class="${t.slug === tier.slug ? 'current' : ''}">${t.label}</a>`).join('\n    ')}
  </div>
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

function hubHtml() {
  const links = TIERS.map((t) => {
    return `      <a href="/income/${t.slug}" class="tier-card">
        <div class="tier-label">${t.label}</div>
        <div class="tier-salary">$${(t.salary/1000).toFixed(0)}k/yr</div>
        <div class="tier-note">${t.note}</div>
      </a>`;
  }).join('\n');

  const title = `Budgeting by hourly wage — What things cost at every income level | HourSpend`;
  const description = `Pick your hourly wage — $12 to $200/hr — and see what common purchases (coffee, iPhones, rent, cars) cost in hours of work at that tier.`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<meta name="description" content="${description}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://hourspend.one/income">
<meta name="theme-color" content="#0a0710">

<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:type" content="website">
<meta property="og:url" content="https://hourspend.one/income">
<meta property="og:image" content="https://hourspend.one/og-image.jpg">
<meta name="twitter:card" content="summary_large_image">

<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/manifest.json">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800&family=Geist+Mono:wght@400;500&family=Fraunces:opsz,wght@9..144,400;9..144,700&display=swap" rel="stylesheet">

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
.page-nav-inner { max-width: 960px; margin: 0 auto; padding: 18px 24px; display: flex; justify-content: space-between; align-items: center; }
.logo { display: inline-flex; align-items: center; gap: 10px; font-weight: 800; color: var(--text); border: 0; }
.logo svg { width: 18px; height: 18px; }
.back-link { font-size: 13px; color: var(--text-muted); border: 0; }
main { max-width: 960px; margin: 0 auto; padding: 72px 24px 120px; }
.eyebrow { font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: var(--gold); font-weight: 700; font-family: var(--mono); margin-bottom: 18px; }
h1 { font-size: clamp(40px, 6vw, 60px); line-height: 1.03; letter-spacing: -2px; font-weight: 800; margin: 0 0 12px; }
h1 em { font-family: var(--editorial); font-style: italic; background: linear-gradient(135deg, var(--gold-soft), var(--gold)); -webkit-background-clip: text; background-clip: text; color: transparent; }
.lede { font-size: 19px; color: var(--text-muted); margin: 0 0 48px; max-width: 680px; }

.tier-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px;
}
@media (max-width: 720px) { .tier-grid { grid-template-columns: 1fr 1fr; } }
@media (max-width: 480px) { .tier-grid { grid-template-columns: 1fr; } }
.tier-card {
  display: block; padding: 24px 22px;
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--line);
  border-radius: 16px;
  color: var(--text); border-bottom: 1px solid var(--line);
  transition: border-color 0.2s, transform 0.2s;
}
.tier-card:hover { border-color: rgba(232,200,110,0.4); transform: translateY(-2px); color: var(--text); }
.tier-card .tier-label {
  font-family: var(--editorial); font-style: italic; font-weight: 700;
  font-size: 34px; line-height: 1.1;
  background: linear-gradient(135deg, var(--gold-soft), var(--gold));
  -webkit-background-clip: text; background-clip: text; color: transparent;
  margin-bottom: 4px;
}
.tier-card .tier-salary { font-family: var(--mono); font-size: 12px; color: var(--text-dim); letter-spacing: 1.2px; margin-bottom: 12px; }
.tier-card .tier-note { font-size: 13px; color: var(--text-muted); line-height: 1.5; }

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
  <div class="eyebrow">Budgeting by hourly wage</div>
  <h1>Pick your <em>hourly wage</em>.</h1>
  <p class="lede">Fifteen common purchases priced in hours of work, at twelve different income levels. Whether you earn $15 an hour or $200, the question is the same: how many hours of your life did this purchase really cost? Pick a tier below to see the table.</p>
  <div class="tier-grid">
${links}
  </div>
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

  // Hub
  fs.writeFileSync(path.join(OUT_DIR, 'index.html'), hubHtml(), 'utf8');
  console.log(`  wrote public/income/index.html`);

  // Tier pages
  for (const t of TIERS) {
    const dir = path.join(OUT_DIR, t.slug);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), pageHtml(t), 'utf8');
    console.log(`  wrote public/income/${t.slug}/index.html`);
  }

  console.log(`  ${TIERS.length} tier pages + hub.`);
}

main();
