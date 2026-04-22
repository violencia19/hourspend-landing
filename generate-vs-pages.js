#!/usr/bin/env node
//
// Generates /vs/{competitor}/ comparison pages.
// Each page is a structured, honest comparison — HourSpend's time-first angle
// vs the competitor's positioning. Aimed at long-tail "alternative" and "vs"
// search intent: "YNAB alternative", "Mint vs YNAB", "Copilot Money vs...".
//

const fs = require('fs');
const path = require('path');

const OUT_DIR = path.resolve(__dirname, 'public', 'vs');

const COMPETITORS = [
  {
    slug: 'ynab',
    name: 'YNAB',
    fullName: 'YNAB (You Need A Budget)',
    tagline: 'Envelope-style zero-based budgeting, paid subscription.',
    price: '$14.99/mo or $109/yr',
    pricing: 'Paid only, 34-day free trial',
    platform: 'iOS, Android, Web',
    founded: 2004,
    feedbackSite: 'https://www.ynab.com/',
    positioning: 'Zero-based budgeting — give every dollar a job before the month starts.',
    strengths: [
      'Rigorous zero-based budget methodology with a loyal teaching community',
      'Strong goal-tracking per envelope',
      'Excellent educational content (YNAB University, podcasts)',
      'Cross-platform sync (Web + mobile + desktop)',
    ],
    weaknesses: [
      'Paid-only — the steepest price in the category',
      'Steep learning curve for new users',
      'Dollar-centric — no "hours of life" framing',
      'Requires active bank-feed connection (aggregation issues common)',
    ],
    comparison: [
      { aspect: 'Free tier',              hourspend: 'Yes, core tracking + calculator',       competitor: 'No (34-day trial)' },
      { aspect: 'Time-value framing',     hourspend: 'Yes — every expense shown in hours',    competitor: 'No — dollars only' },
      { aspect: 'Manual vs bank feeds',   hourspend: 'Manual entry by design',                competitor: 'Bank aggregation required' },
      { aspect: 'Budgeting method',       hourspend: 'Observation-first, frame-based',        competitor: 'Zero-based envelopes' },
      { aspect: 'AI assistant',           hourspend: 'Vanti (pocket watch persona)',          competitor: 'No' },
      { aspect: 'Platforms',              hourspend: 'iOS (Android roadmap)',                 competitor: 'iOS, Android, Web' },
      { aspect: 'Price',                  hourspend: 'Free; Premium ~$3/mo',                  competitor: '$14.99/mo or $109/yr' },
    ],
    verdict: "YNAB is the right answer if you want a highly-disciplined zero-based budget and you're willing to pay $100+ per year for the teaching and tooling. HourSpend is the right answer if you don't want to be taught a methodology — you want to look at a coffee and feel, in your body, that it was twenty-three minutes of your Tuesday.",
  },
  {
    slug: 'mint',
    name: 'Mint',
    fullName: 'Mint (Intuit)',
    tagline: 'Free aggregator, acquired and sunset by Intuit in 2024.',
    price: 'Defunct — users migrated to Credit Karma',
    pricing: 'Was free, ad-supported',
    platform: 'iOS, Android, Web (historical)',
    founded: 2006,
    feedbackSite: 'https://mint.intuit.com/',
    positioning: 'Free personal-finance aggregator with categorization and credit monitoring. Discontinued March 2024.',
    strengths: [
      'Free to use (ad-supported)',
      'Strong bank aggregation coverage',
      'Credit score tracking integrated',
      'Huge user base (pre-sunset)',
    ],
    weaknesses: [
      'Product shut down March 2024 — no longer an option',
      'Ad-heavy UX during its lifetime',
      'Dollar-only categorization — no life-energy framing',
      'Intuit migrated users to Credit Karma (different product)',
    ],
    comparison: [
      { aspect: 'Currently available',    hourspend: 'Yes',                                   competitor: 'No (sunset 2024)' },
      { aspect: 'Free tier',              hourspend: 'Yes, core tracking + calculator',       competitor: 'Was free (ad-supported)' },
      { aspect: 'Time-value framing',     hourspend: 'Yes — every expense shown in hours',    competitor: 'No — dollars only' },
      { aspect: 'Manual vs bank feeds',   hourspend: 'Manual entry by design',                competitor: 'Bank aggregation required' },
      { aspect: 'Ads',                    hourspend: 'None',                                  competitor: 'Heavy (pre-sunset)' },
      { aspect: 'AI assistant',           hourspend: 'Vanti (pocket watch persona)',          competitor: 'No' },
      { aspect: 'Platforms',              hourspend: 'iOS',                                   competitor: 'Discontinued' },
    ],
    verdict: 'Mint is gone. Intuit shut it down in March 2024 and redirected users to Credit Karma, which is not a budgeting tool in the same sense. If you were looking for "Mint but actually maintained," HourSpend is one option — it is free like Mint was, with no ads ever, and it adds the hours-of-life frame Mint never had.',
  },
  {
    slug: 'copilot-money',
    name: 'Copilot Money',
    fullName: 'Copilot Money',
    tagline: 'iOS-native finance app with AI categorization, paid subscription.',
    price: '$13/mo or $95/yr',
    pricing: 'Paid only, free trial',
    platform: 'iOS, macOS',
    founded: 2020,
    feedbackSite: 'https://copilot.money/',
    positioning: 'Beautifully designed iOS-native finance aggregator with AI-powered categorization and investment tracking.',
    strengths: [
      'Genuinely beautiful, polished iOS design',
      'Strong AI-powered transaction categorization',
      'Apple ecosystem integration (widgets, Shortcuts, macOS app)',
      'Investment tracking built in',
    ],
    weaknesses: [
      'Paid-only — $95+/year',
      'Apple-only (no Android, no web)',
      'Dollar-centric — no hours-of-life framing',
      'Requires Plaid/bank-feed aggregation',
    ],
    comparison: [
      { aspect: 'Free tier',              hourspend: 'Yes, core tracking + calculator',       competitor: 'No (free trial only)' },
      { aspect: 'Time-value framing',     hourspend: 'Yes — every expense shown in hours',    competitor: 'No — dollars only' },
      { aspect: 'Manual vs bank feeds',   hourspend: 'Manual entry by design',                competitor: 'Bank aggregation' },
      { aspect: 'AI assistant',           hourspend: 'Vanti (pocket watch persona)',          competitor: 'Categorization AI, no chat' },
      { aspect: 'iOS polish',             hourspend: 'Liquid Glass, iOS 17+',                 competitor: 'Excellent — strong point' },
      { aspect: 'Investment tracking',    hourspend: 'Yes',                                   competitor: 'Yes' },
      { aspect: 'Platforms',              hourspend: 'iOS (Android roadmap)',                 competitor: 'iOS + macOS only' },
      { aspect: 'Price',                  hourspend: 'Free; Premium ~$3/mo',                  competitor: '$13/mo or $95/yr' },
    ],
    verdict: 'Copilot Money is, design-wise, the benchmark in the category. If you are an Apple-ecosystem user, love polished apps, and are comfortable paying $95/year for bank-aggregated categorization, Copilot is excellent. HourSpend is a different trade: free, no bank feeds, and instead of AI categorization it asks you to do the noticing yourself — with the hours-of-life frame as the reward.',
  },
  {
    slug: 'monarch-money',
    name: 'Monarch Money',
    fullName: 'Monarch Money',
    tagline: 'Family / couples finance app, paid subscription.',
    price: '$14.99/mo or $99.99/yr',
    pricing: 'Paid only, 7-day free trial',
    platform: 'iOS, Android, Web',
    founded: 2019,
    feedbackSite: 'https://www.monarchmoney.com/',
    positioning: 'Household budgeting for couples and families — shared accounts, goals, and net worth tracking.',
    strengths: [
      'Excellent for couples / shared finances',
      'Strong net-worth and investment tracking',
      'Cross-platform (iOS, Android, Web)',
      'Post-Mint migration destination of choice for many users',
    ],
    weaknesses: [
      'Paid-only — $100/year',
      'Dollar-centric — no hours-of-life framing',
      'Requires bank aggregation (Plaid)',
      'Feature-heavy, can feel overwhelming for single users',
    ],
    comparison: [
      { aspect: 'Free tier',              hourspend: 'Yes, core tracking + calculator',       competitor: 'No (7-day trial)' },
      { aspect: 'Time-value framing',     hourspend: 'Yes — every expense shown in hours',    competitor: 'No — dollars only' },
      { aspect: 'Manual vs bank feeds',   hourspend: 'Manual entry by design',                competitor: 'Bank aggregation' },
      { aspect: 'Shared accounts',        hourspend: 'Single-user (couples roadmap)',         competitor: 'Yes — strong point' },
      { aspect: 'AI assistant',           hourspend: 'Vanti (pocket watch persona)',          competitor: 'No' },
      { aspect: 'Net worth tracking',     hourspend: 'Basic',                                 competitor: 'Advanced' },
      { aspect: 'Platforms',              hourspend: 'iOS',                                   competitor: 'iOS, Android, Web' },
      { aspect: 'Price',                  hourspend: 'Free; Premium ~$3/mo',                  competitor: '$14.99/mo or $99.99/yr' },
    ],
    verdict: 'Monarch is the pragmatic YNAB/Copilot alternative for couples who want a shared household budget and don\'t mind paying for it. HourSpend is for a different problem: the one person deciding, at the register, whether this coffee is worth the twenty-three minutes of work it represents. Different category, different frame, different price.',
  },
];

function pageHtml(c) {
  const rows = c.comparison.map(
    (r) => `        <tr>
          <td class="aspect">${r.aspect}</td>
          <td class="hs">${r.hourspend}</td>
          <td class="other">${r.competitor}</td>
        </tr>`
  ).join('\n');

  const strengths = c.strengths.map((s) => `      <li>${s}</li>`).join('\n');
  const weaknesses = c.weaknesses.map((s) => `      <li>${s}</li>`).join('\n');

  const title = `HourSpend vs ${c.name} — Which Budget App Fits? (2026)`;
  const description = `Honest comparison between HourSpend and ${c.name}. Time-value framing vs ${c.positioning.toLowerCase()} Free vs paid. iOS-first vs cross-platform. Which one you should pick.`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<meta name="description" content="${description}">
<meta name="keywords" content="${c.name} alternative, ${c.name} vs HourSpend, ${c.name.toLowerCase()} review 2026, budget app comparison, time-value budget app">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://hourspend.one/vs/${c.slug}">
<meta name="theme-color" content="#0a0710">

<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:type" content="article">
<meta property="og:url" content="https://hourspend.one/vs/${c.slug}">
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
  "url": "https://hourspend.one/vs/${c.slug}",
  "image": "https://hourspend.one/og-image.jpg",
  "author": { "@type": "Organization", "name": "HourSpend", "url": "https://hourspend.one" },
  "publisher": { "@type": "Organization", "name": "HourSpend", "url": "https://hourspend.one" },
  "datePublished": "2026-04-22",
  "about": [
    {"@type": "SoftwareApplication", "name": "HourSpend", "url": "https://hourspend.one", "operatingSystem": "iOS", "applicationCategory": "FinanceApplication"},
    {"@type": "SoftwareApplication", "name": ${JSON.stringify(c.fullName)}, "url": ${JSON.stringify(c.feedbackSite)}, "applicationCategory": "FinanceApplication"}
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
  --success: #4ade80; --warn: #fbbf24;
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
h1 { font-size: clamp(36px, 5.5vw, 52px); line-height: 1.05; letter-spacing: -1.8px; font-weight: 800; margin: 0 0 12px; }
h1 em { font-family: var(--editorial); font-style: italic; font-weight: 700; background: linear-gradient(135deg, var(--gold-soft), var(--gold)); -webkit-background-clip: text; background-clip: text; color: transparent; }
.lede { font-size: 18px; color: var(--text-muted); margin: 0 0 32px; }
h2 { font-size: 24px; line-height: 1.3; letter-spacing: -0.5px; font-weight: 700; margin: 48px 0 16px; color: var(--text); }
h3 { font-size: 17px; font-weight: 700; margin: 24px 0 10px; }
p { color: var(--text-muted); margin: 0 0 18px; }
strong { color: var(--text); font-weight: 700; }
ul { padding-left: 22px; margin: 0 0 18px; }
li { margin-bottom: 8px; color: var(--text-muted); }
li::marker { color: var(--gold); }

.meta-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
  margin: 32px 0 40px;
}
@media (max-width: 640px) { .meta-grid { grid-template-columns: 1fr 1fr; } }
.meta-cell {
  padding: 14px 16px;
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--line);
  border-radius: 10px;
}
.meta-label {
  font-family: var(--mono); font-size: 10px; letter-spacing: 1.6px;
  text-transform: uppercase; color: var(--text-dim); margin-bottom: 4px;
}
.meta-value { font-size: 15px; font-weight: 600; color: var(--text); }

.compare-table {
  width: 100%; border-collapse: collapse;
  margin: 24px 0 32px;
  font-size: 14px;
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--line);
  border-radius: 12px;
  overflow: hidden;
}
.compare-table th {
  text-align: left; padding: 14px 16px;
  font-family: var(--mono); font-size: 11px; font-weight: 600;
  letter-spacing: 1.2px; text-transform: uppercase;
  color: var(--text-dim);
  background: rgba(255,255,255,0.03);
  border-bottom: 1px solid var(--line);
}
.compare-table td {
  padding: 14px 16px;
  vertical-align: top;
  border-bottom: 1px solid var(--line);
}
.compare-table tr:last-child td { border-bottom: 0; }
.compare-table td.aspect { color: var(--text); font-weight: 600; width: 30%; }
.compare-table td.hs    { color: var(--gold-soft); width: 35%; }
.compare-table td.other { color: var(--text-muted); width: 35%; }

.columns {
  display: grid; grid-template-columns: 1fr 1fr; gap: 20px;
  margin: 24px 0 32px;
}
@media (max-width: 640px) { .columns { grid-template-columns: 1fr; } }
.column {
  padding: 20px;
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--line);
  border-radius: 12px;
}
.column h3 { margin-top: 0; }
.column.strengths { border-left: 2px solid var(--success); }
.column.weaknesses { border-left: 2px solid var(--warn); }
.column ul { margin: 0; }
.column li { font-size: 14px; }

.verdict-block {
  margin-top: 40px;
  padding: 28px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-left: 2px solid var(--gold);
  border-radius: 8px;
}
.verdict-block .verdict-label {
  font-family: var(--mono); font-size: 11px; letter-spacing: 2px;
  text-transform: uppercase; color: var(--gold);
  margin-bottom: 10px;
}
.verdict-block p { color: var(--text); margin: 0 0 18px; }
.cta-button {
  display: inline-block;
  padding: 12px 22px; border-radius: 12px;
  background: linear-gradient(135deg, var(--gold-soft), var(--gold));
  color: #1a0b10; font-weight: 700; font-size: 15px;
  border: 0; text-decoration: none;
}
.cta-button:hover { color: #1a0b10; border: 0; }
.related-vs {
  margin-top: 40px;
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;
}
@media (max-width: 640px) { .related-vs { grid-template-columns: 1fr 1fr; } }
.related-vs a {
  display: block; padding: 12px 14px;
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--line);
  border-radius: 10px;
  color: var(--text); font-size: 13px; font-weight: 600;
  border-bottom: 1px solid var(--line);
}
.related-vs a:hover { border-color: rgba(232,200,110,0.4); color: var(--gold-soft); }

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
    <a href="/" class="back-link">← Home</a>
  </div>
</nav>

<main>
  <div class="eyebrow">Comparison</div>
  <h1>HourSpend<br>vs <em>${c.name}</em></h1>
  <p class="lede">${c.positioning}</p>

  <div class="meta-grid">
    <div class="meta-cell">
      <div class="meta-label">Price</div>
      <div class="meta-value">${c.price}</div>
    </div>
    <div class="meta-cell">
      <div class="meta-label">Platforms</div>
      <div class="meta-value">${c.platform}</div>
    </div>
    <div class="meta-cell">
      <div class="meta-label">Founded</div>
      <div class="meta-value">${c.founded}</div>
    </div>
  </div>

  <h2>The honest difference</h2>
  <p>Every app in this category shows you dollars. HourSpend shows you the same number reframed as <strong>the hours of your life it cost to earn that money</strong>. A $5 coffee becomes "23 minutes of your Tuesday." That one change in unit is the whole product. Everything else — categories, goals, AI — is scaffolding around the trick.</p>
  <p>${c.name} does not do that. It's a good app in its category; it's just in a different category. Below is the specific comparison.</p>

  <h2>Side-by-side</h2>
  <table class="compare-table">
    <thead>
      <tr><th>Aspect</th><th>HourSpend</th><th>${c.name}</th></tr>
    </thead>
    <tbody>
${rows}
    </tbody>
  </table>

  <h2>What ${c.name} does well</h2>
  <div class="columns">
    <div class="column strengths">
      <h3>${c.name} strengths</h3>
      <ul>
${strengths}
      </ul>
    </div>
    <div class="column weaknesses">
      <h3>${c.name} weaknesses</h3>
      <ul>
${weaknesses}
      </ul>
    </div>
  </div>

  <h2>Who should pick which</h2>
  <h3>Pick ${c.name} if</h3>
  <p>You want the specific thing ${c.name} is good at (see the strengths column above), you are comfortable with the price, and dollars-as-dollars is the frame you want. ${c.name} has been in this category for years and knows what it is doing.</p>
  <h3>Pick HourSpend if</h3>
  <p>You want your budget app to feel like time, not accounting. You don't want bank feeds rattling in the background. You want free to start. And you want an app that says "23 minutes of work" instead of "$5" — because once you see that, you can't unsee it.</p>

  <div class="verdict-block">
    <div class="verdict-label">Bottom line</div>
    <p>${c.verdict}</p>
    <a href="https://apps.apple.com/us/app/budget-tracker-money-time/id6758535957" class="cta-button">Try HourSpend free</a>
  </div>

  <h2>See other comparisons</h2>
  <div class="related-vs">
    ${COMPETITORS.filter((x) => x.slug !== c.slug).map((x) => `<a href="/vs/${x.slug}">HourSpend vs ${x.name}</a>`).join('\n    ')}
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
  for (const c of COMPETITORS) {
    const dir = path.join(OUT_DIR, c.slug);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const html = pageHtml(c);
    fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf8');
    console.log(`  wrote public/vs/${c.slug}/index.html (${Math.round(html.length / 1024)} KB)`);
  }
  console.log(`  ${COMPETITORS.length} comparison pages generated.`);
}

main();
