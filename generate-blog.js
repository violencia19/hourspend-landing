#!/usr/bin/env node
//
// Blog generator — each post is defined inline as markdown-like content,
// rendered into a consistent article page. Also builds /blog/ hub.
//
// First 3 posts align with the FIRE / mindful-spending SEO niche:
//   1. Real hourly wage (YMOYL step 2, the 30% correction)
//   2. Subscription audit (20-minute exercise, ~4 hours of life back)
//   3. Why $100 feels different than 4 hours (loss-aversion framing)
//

const fs = require('fs');
const path = require('path');

const OUT_DIR = path.resolve(__dirname, 'public', 'blog');

const POSTS = [
  {
    slug: 'real-hourly-wage',
    title: "What's your real hourly wage? (And why you're probably wrong by 30%)",
    summary: "Your gross hourly rate overstates what you actually earn. After taxes, commute, work clothes, and the stress-decompression purchases you wouldn't make otherwise — most white-collar workers take home 30-50% less per hour than they think. Here's how to calculate the real number in 10 minutes, and why it matters for every buying decision.",
    date: '2026-04-22',
    readTime: '7 min',
    keywords: 'real hourly wage, your money or your life, life energy, hourly wage calculator, after-tax hourly rate',
    body: `
<p>There's a small calculation from a 1992 book that most people never do, even though it changes every buying decision for the rest of their lives. It's in the second chapter of <em>Your Money or Your Life</em> by Vicki Robin and Joe Dominguez, and it goes like this:</p>

<p><strong>Your real hourly wage is not what your contract says.</strong></p>

<p>The number on your offer letter — "$30 an hour" or "$85,000 a year" — is a gross rate. It's the top of a long subtraction problem. By the time you're actually handing money over at a store, you've paid for roughly half of what that paper number promised you. The other half got spent to make the paper number possible at all.</p>

<h2>The subtraction</h2>

<p>Walk through it with a real example. Say you earn $30 an hour, 40 hours a week, 50 weeks a year. That's $60,000 gross. Your hourly rate, on paper, is $30.</p>

<p>Now start subtracting.</p>

<p><strong>Federal income tax</strong>, give or take — about 15% effective. <strong>Social Security and Medicare</strong> — 7.65%. <strong>State income tax</strong> — depends, but say 5%. That's 27.65% off the top, so you're down to roughly $43,400 take-home. Your rate is now $21.70 per actual hour you worked.</p>

<p>Now the invisible costs. <strong>Commuting</strong>: say 30 minutes each way, five days a week — that's 5 hours a week of unpaid time you wouldn't spend if you didn't have the job. Plus $100 a month for transit, or $400 a month if you drive (gas + insurance + depreciation attributable to commute). Call it $200/mo blended.</p>

<p><strong>Work clothes, lunches out, coffee to stay awake:</strong> $250/mo easily, often more. <strong>Decompression spending</strong> — the dinner out on Friday because you're wrecked, the streaming subscriptions because you don't have energy to do anything else — another $150/mo.</p>

<p>Now redo the math with those subtractions. Deduct the cash costs from take-home ($43,400 - $7,200 = $36,200). Deduct the unpaid commute hours from the denominator (2,000 + 250 = 2,250 hours spent on work per year). New rate:</p>

<blockquote>$36,200 ÷ 2,250 hours = <em>$16.09 per hour</em>.</blockquote>

<p>That's the real number. A 46% discount from the paper $30. This is not unusual — Robin and Dominguez found the same 30-50% gap across hundreds of readers in the early 90s, and it's held up in every workbook replication since.</p>

<h2>What changes when you use the real number</h2>

<p>Take a <a href="/buying/starbucks-grande-latte">$5.45 Starbucks Grande Latte</a>.</p>

<ul>
  <li>At the paper rate ($30/hr): 11 minutes of work. Fine.</li>
  <li>At the real rate ($16/hr): 20 minutes of work. Different.</li>
</ul>

<p>Or a <a href="/buying/iphone-16-pro">$1,199 iPhone 16 Pro</a>.</p>

<ul>
  <li>At the paper rate: 40 hours. One work week.</li>
  <li>At the real rate: 75 hours. Nearly two work weeks.</li>
</ul>

<p>A pattern emerges. Small purchases get a little more expensive in hours. Large purchases get <em>dramatically</em> more expensive. The $30k car that was "one year of work" becomes nearly two years. The $80k wedding is not six months — it's a year and change. This isn't about being miserly; it's about using the number that matches reality.</p>

<h2>The 10-minute version</h2>

<p>You don't need a spreadsheet. Here's the quickest honest pass:</p>

<ol>
  <li><strong>Take-home pay for last year.</strong> Look at your tax return line — the actual cash that landed in your account. Divide by 12 for monthly.</li>
  <li><strong>Subtract job-related spending.</strong> Commute (money + unpaid time), work clothes, work lunches, work coffee, stress-decompression. Rough is fine.</li>
  <li><strong>Count hours you actually give to the job.</strong> Paid working hours + unpaid overtime + commute + any work-for-tomorrow's-Monday that bleeds into Sunday.</li>
  <li><strong>Divide.</strong> That's your real hourly rate.</li>
</ol>

<p>Write the number somewhere you can see. Tape it to the inside of your wallet, if you still carry one. Before every purchase above $50, divide by that number. The answer is the hours of your life this thing costs — and once you've seen it a few times, you don't really need the wallet card any more.</p>

<h2>Using it in HourSpend</h2>

<p>The <a href="/calculator">free calculator</a> takes your real hourly wage and converts any purchase. The <a href="/">iOS app</a> does it automatically for every expense you log, so the duration is always visible instead of buried. Both are built on the same framework Robin and Dominguez described thirty-three years ago — it still works because the math does not age.</p>

<p>Further reading: <a href="/philosophy">the philosophy page</a> covers why this matters at a life level, not just a budget level.</p>
`,
  },
  {
    slug: 'subscription-audit',
    title: "The subscription audit: 20 minutes that could buy back your Saturday",
    summary: "Most people lose 3-7 hours of life energy every month to subscriptions they've forgotten they're paying for. Here's a 20-minute process to find them all, decide which stay, and reclaim the hours.",
    date: '2026-04-21',
    readTime: '6 min',
    keywords: 'subscription audit, cancel subscriptions, recurring charges review, subscription cleanup, find forgotten subscriptions',
    body: `
<p>Everyone has a number. It's the number of dollars flowing out of your bank account every month into services you meant to cancel. If you're a normal person, it's between $40 and $120. If you were technical once and signed up for a lot of tools, it's $150-300.</p>

<p>At a real hourly wage of $20, $120 a month is <strong>6 hours of work</strong> — the length of a good Saturday afternoon, plus dinner. At $40 an hour, $300 a month is <strong>7.5 hours</strong> — a full workday, every month, for nothing.</p>

<p>The good news is this is the easiest kind of money to get back. Nobody will come after you for cancelling. The service is designed to make you forget, not to punish you for remembering. A 20-minute audit, done once a year, is one of the highest-ROI time investments in personal finance.</p>

<h2>The 20-minute process</h2>

<h3>Minute 0–3: Make a list</h3>

<p>Open two places:</p>

<ul>
  <li><strong>iOS Settings → your name → Subscriptions.</strong> This shows every App Store subscription, including the ones you subscribed to via an app you've deleted.</li>
  <li><strong>Your primary bank and credit-card statement</strong>, last 60 days. Sort by merchant. Scroll for recurring amounts.</li>
</ul>

<p>Write down every subscription you see with the monthly cost. Don't judge yet. Just list.</p>

<h3>Minute 3–10: Categorize</h3>

<p>Go through the list and put each one in one of four buckets:</p>

<ol>
  <li><strong>Keep</strong> — I use this weekly, and the price in hours feels fair.</li>
  <li><strong>Downgrade</strong> — I use this, but the higher tier is more than I need.</li>
  <li><strong>Share / split</strong> — This has a family plan or a friend would split.</li>
  <li><strong>Cancel</strong> — I haven't opened this in a month. Or I forgot it existed.</li>
</ol>

<p>The honest heuristic for Cancel: if you forgot it was charging you, it was not earning its keep.</p>

<h3>Minute 10–20: Cancel</h3>

<p>Go back to iOS Subscriptions, tap the ones in your Cancel bucket, hit Cancel Subscription. Most will finish immediately. For non-App Store subscriptions (anything billed directly by the merchant — Dropbox, Adobe, a lot of SaaS), go to the service's billing page. Expect some to hide the cancel link behind a chat interface — persist, they have to let you cancel by law in most US states.</p>

<p>Do the Downgrade bucket the same way. A $22.99 Netflix account that's used for one person drops to $7.99. A $15.99 Adobe Creative Cloud full plan drops to a $10.99 Photography plan for a hobbyist. These add up.</p>

<h2>The math</h2>

<p>The median subscription pile, per our own data and published industry estimates, is <strong>$79 a month</strong> in services the subscriber can't name without looking. After a good audit, most people cut that to roughly $30. That's a $50/month recurring save.</p>

<p>At $20/hr real: 2.5 hours a month, 30 hours a year. <em>Almost a full work week back.</em></p>

<p>At $35/hr real: 1.5 hours a month, 18 hours a year. Two extra workdays.</p>

<p>And because subscriptions are a compounding drag — every one you keep is ten more years of that same bleed if nothing changes — the ten-year impact of a single good audit is roughly <em>300 hours of work</em> at $20/hr. More than a month of your working life, reclaimed for the cost of twenty minutes one Sunday.</p>

<h2>The subscriptions that pass the audit</h2>

<p>The keepers are usually:</p>

<ul>
  <li>A single streaming service you actually use weekly.</li>
  <li>A password manager. (Security is cheap insurance; skip at your peril.)</li>
  <li>A backup service, if you have meaningful data.</li>
  <li>A cloud storage plan sized to what you actually store.</li>
</ul>

<p>The rest is usually flexible. Music, premium subscriptions you thought you'd use, content services for a hobby you've moved past — all good Cancel candidates the first time around.</p>

<h2>Making it automatic</h2>

<p>The 20-minute audit works once. To keep it working, HourSpend's iOS app tracks each subscription as a recurring expense and shows you, monthly, the total hours they cost. When the line grows past your comfort threshold, you'll notice — and you'll run the audit again, without a calendar reminder, because the number will tell you.</p>

<p>Related: <a href="/blog/real-hourly-wage">Calculate your real hourly wage</a> first — the audit hits differently when you're using the honest number. And if you want to price any specific subscription: <a href="/buying/netflix-monthly">Netflix</a>, <a href="/buying/spotify-monthly">Spotify</a>, <a href="/buying/chatgpt-plus-monthly">ChatGPT Plus</a>, <a href="/buying/apple-music-monthly">Apple Music</a>.</p>
`,
  },
  {
    slug: 'dollar-feels-different-than-hour',
    title: "Why $100 feels different than 4 hours of work — and how to make it not",
    summary: "Money is fungible; hours aren't. A brain that treats a $100 purchase as 'some number' will treat the same purchase as '4 hours I'll never see again' once it's relabeled. Three tricks to make the relabel stick.",
    date: '2026-04-20',
    readTime: '5 min',
    keywords: 'loss aversion money, mental accounting, psychology of spending, time value of money, behavioral finance',
    body: `
<p>A dollar is fungible. One dollar spends identically to another. You don't mourn any specific bill. This is the whole point of currency — it is a unit of exchange <em>precisely because</em> it is interchangeable.</p>

<p>An hour is not fungible. The hour between 2 and 3 PM on Tuesday is not the same hour as 2 to 3 PM on Saturday. And neither is the same as the hour between 2 and 3 PM on the last Saturday of your life, which exists and will arrive.</p>

<p>This asymmetry is the whole reason HourSpend exists. Loss aversion, the cognitive bias that Kahneman and Tversky showed in 1979 where losing $100 feels about 2.5× as bad as gaining $100, turns out to be weirdly <em>dormant</em> when the $100 is abstract money. A phone upgrade feels like "a purchase." A phone upgrade relabeled as "4.5 hours of the life you have left" feels like <em>giving something specific up</em>. That's when the aversion wakes up, and decisions get better without anyone getting nagged.</p>

<h2>Three tricks to make the relabel stick</h2>

<h3>1. Never look at a price in isolation</h3>

<p>Any time you see a price online and you're even slightly torn about the purchase, do the conversion before you tap Buy. The math:</p>

<blockquote>hours = price ÷ your real hourly wage</blockquote>

<p>If you earn $18 an hour real (see <a href="/blog/real-hourly-wage">this post</a> on calculating it), a $72 purchase is 4 hours. The hours number and the decision number get bound together in memory. A week later you don't remember "oh yeah I spent $72"; you remember "oh yeah that cost me half a Saturday." The second memory is actionable.</p>

<h3>2. Keep the tradeoff concrete</h3>

<p>Hours are still abstract until you pin them to something. The trick is asking the second question: <em>what would I actually trade those 4 hours for, if I had them instead?</em></p>

<p>For most people, 4 hours is a long walk with a friend, or a morning of the hobby they keep saying they miss, or a slow breakfast with their kid. Make the comparison real. The purchase either wins against the specific alternative, or it doesn't. "I want the phone more than a morning with my dad" is a fine answer; it's just no longer automatic.</p>

<h3>3. Watch for the frame flip</h3>

<p>The same purchase can be bought impulsively ("I deserved it") or reflectively ("I weighed this against the life-hours it cost"). The difference is not usually the purchase. It's the frame the buyer was in when they decided. One rule: <em>if you can't name the hours, you're in the wrong frame</em>. Wait until you can. If it turns out the number embarrasses you, that's useful information. If the number feels right for what you got, buy without guilt — you did the work.</p>

<h2>The counter-argument</h2>

<p>There's a real objection to all of this: <em>isn't this a recipe for scarcity-thinking? Won't I stop enjoying anything if every latte is a 20-minute calculation?</em></p>

<p>No, and this is important. The goal of hours-framing is not to push every spending decision toward No. It is to make every spending decision <em>visible</em>, so the Yeses you give are real Yeses. A life where you bought the expensive coffee because you thought about it and decided it was worth 20 minutes is a better life than one where you bought the expensive coffee on autopilot because a latte was "only five bucks." The second version is cheaper per day but more expensive per year, because the cumulative unreflective spends drain hours you didn't know you were giving away.</p>

<h2>Practical workflow</h2>

<p>HourSpend codifies this into a three-state decision on every expense — <strong>bought</strong>, <strong>thinking</strong>, <strong>passed</strong>. You can log an expense before you commit, sit with the hours number, and decide. If you pass, the amount goes into a Saved Pool you can later allocate to a goal or investment. If you buy, at least the decision was reflective.</p>

<p>That's it. The whole thesis is one observation: <em>dollars feel different than hours, so show the hours</em>. Everything else is scaffolding.</p>

<p>If you want to try it: <a href="/calculator">the free calculator</a> handles any price you type in. The <a href="/">iOS app</a> does it automatically for every expense you log.</p>
`,
  },
];

function pagePre() { return '<!-- HourSpend blog page -->'; }

function postHtml(post, otherPosts) {
  const related = otherPosts.slice(0, 2).map(
    (p) => `      <a href="/blog/${p.slug}" class="related-post">
        <span class="rel-label">Related</span>
        ${p.title}
      </a>`
  ).join('\n');

  const title = `${post.title} | HourSpend`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<meta name="description" content="${post.summary}">
<meta name="keywords" content="${post.keywords}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://hourspend.one/blog/${post.slug}">
<meta name="theme-color" content="#0a0710">

<meta property="og:title" content="${post.title}">
<meta property="og:description" content="${post.summary}">
<meta property="og:type" content="article">
<meta property="og:url" content="https://hourspend.one/blog/${post.slug}">
<meta property="og:image" content="https://hourspend.one/og-image.jpg">
<meta property="article:published_time" content="${post.date}">
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
  "@type": "BlogPosting",
  "headline": ${JSON.stringify(post.title)},
  "description": ${JSON.stringify(post.summary)},
  "url": "https://hourspend.one/blog/${post.slug}",
  "image": "https://hourspend.one/og-image.jpg",
  "datePublished": "${post.date}",
  "dateModified": "${post.date}",
  "author": { "@type": "Organization", "name": "HourSpend", "url": "https://hourspend.one" },
  "publisher": {
    "@type": "Organization",
    "name": "HourSpend",
    "logo": { "@type": "ImageObject", "url": "https://hourspend.one/icon-512.png" }
  },
  "mainEntityOfPage": { "@type": "WebPage", "@id": "https://hourspend.one/blog/${post.slug}" }
}
</script>

<style>
:root { --bg: #0a0710; --surface: #12091e; --line: rgba(255,255,255,0.08); --gold: #d4a846; --gold-soft: #e8c86e; --text: #f5f0e6; --text-muted: #a59fb3; --text-dim: #6b6478; --editorial: 'Fraunces', Georgia, serif; --mono: 'Geist Mono', ui-monospace, monospace; }
* { box-sizing: border-box; }
body { margin: 0; font-family: 'Cabinet Grotesk', sans-serif; background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(232,200,110,0.08), transparent 65%), var(--bg); color: var(--text); line-height: 1.75; font-size: 17px; }
a { color: var(--gold-soft); text-decoration: none; border-bottom: 1px solid rgba(232,200,110,0.3); }
a:hover { color: var(--gold); border-bottom-color: var(--gold); }
.page-nav { position: sticky; top: 0; z-index: 10; backdrop-filter: blur(16px); background: rgba(10,7,16,0.72); border-bottom: 1px solid var(--line); }
.page-nav-inner { max-width: 760px; margin: 0 auto; padding: 18px 24px; display: flex; justify-content: space-between; align-items: center; }
.logo { display: inline-flex; align-items: center; gap: 10px; font-weight: 800; color: var(--text); border: 0; }
.logo svg { width: 18px; height: 18px; }
.back-link { font-size: 13px; color: var(--text-muted); border: 0; }
main { max-width: 720px; margin: 0 auto; padding: 64px 24px 120px; }
.eyebrow { font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: var(--gold); font-weight: 700; font-family: var(--mono); margin-bottom: 18px; }
h1 { font-size: clamp(36px, 5vw, 48px); line-height: 1.12; letter-spacing: -1.5px; font-weight: 800; margin: 0 0 18px; }
.meta { font-family: var(--mono); font-size: 12px; color: var(--text-dim); letter-spacing: 1.2px; padding-bottom: 32px; border-bottom: 1px solid var(--line); margin-bottom: 40px; }
.article-body h2 { font-size: 26px; line-height: 1.3; letter-spacing: -0.5px; font-weight: 800; margin: 48px 0 18px; color: var(--text); }
.article-body h3 { font-size: 18px; font-weight: 700; margin: 28px 0 10px; color: var(--text); }
.article-body p, .article-body li { color: var(--text-muted); }
.article-body p { margin: 0 0 20px; }
.article-body strong { color: var(--text); font-weight: 700; }
.article-body em { color: var(--text); font-family: var(--editorial); font-style: italic; }
.article-body blockquote { margin: 28px 0; padding: 18px 28px; background: rgba(232,200,110,0.04); border-left: 2px solid var(--gold); border-radius: 0 10px 10px 0; font-family: var(--editorial); font-style: italic; font-size: 19px; line-height: 1.5; color: var(--text); }
.article-body ul, .article-body ol { padding-left: 22px; margin: 0 0 24px; }
.article-body li { margin-bottom: 10px; }
.article-body li::marker { color: var(--gold); }
.cta-block { margin: 48px 0 0; padding: 28px; background: var(--surface); border: 1px solid var(--line); border-left: 2px solid var(--gold); border-radius: 8px; }
.cta-block p { margin: 0 0 18px; color: var(--text); }
.cta-button { display: inline-block; padding: 12px 22px; border-radius: 12px; background: linear-gradient(135deg, var(--gold-soft), var(--gold)); color: #1a0b10; font-weight: 700; font-size: 15px; border: 0; text-decoration: none; }
.cta-button:hover { color: #1a0b10; border: 0; }
.related-grid { margin: 48px 0 0; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
@media (max-width: 640px) { .related-grid { grid-template-columns: 1fr; } }
.related-post { display: block; padding: 18px 20px; background: rgba(255,255,255,0.04); border: 1px solid var(--line); border-radius: 12px; color: var(--text); font-size: 15px; font-weight: 600; line-height: 1.4; border-bottom: 1px solid var(--line); }
.related-post:hover { border-color: rgba(232,200,110,0.4); color: var(--text); }
.related-post .rel-label { display: block; font-family: var(--mono); font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: var(--gold); margin-bottom: 8px; font-weight: 400; }
footer.page-footer { max-width: 720px; margin: 0 auto; padding: 40px 24px; border-top: 1px solid var(--line); color: var(--text-dim); font-size: 13px; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
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
    <a href="/blog" class="back-link">← All posts</a>
  </div>
</nav>

<main>
  <div class="eyebrow">Essay · ${post.readTime} read</div>
  <h1>${post.title}</h1>
  <div class="meta">${post.date} · HourSpend</div>

  <div class="article-body">
${post.body}
  </div>

  <div class="cta-block">
    <p><strong>Try the math for your own numbers.</strong> The calculator is free, no signup. The iOS app logs every expense automatically and shows you the running hour count.</p>
    <a href="https://apps.apple.com/us/app/budget-tracker-money-time/id6758535957" class="cta-button">Get HourSpend</a>
  </div>

  <div class="related-grid">
${related}
  </div>
</main>

<footer class="page-footer">
  <div>© HourSpend · Money is just time, exchanged.</div>
  <div>
    <a href="/">Home</a> ·
    <a href="/calculator">Calculator</a> ·
    <a href="/philosophy">Philosophy</a> ·
    <a href="/blog">Blog</a>
  </div>
</footer>

</body>
</html>
`;
}

function hubHtml() {
  const cards = POSTS.map((p) => `    <a href="/blog/${p.slug}" class="post-card">
      <div class="post-eyebrow">${p.date} · ${p.readTime} read</div>
      <h2>${p.title}</h2>
      <p>${p.summary}</p>
    </a>`).join('\n');

  const title = `The HourSpend Blog — Essays on Time, Money, and the Gap Between`;
  const description = `Essays on personal finance framed in hours of life instead of dollars. Real hourly wage, subscription audits, loss aversion, the FIRE movement — clean, honest writing.`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<meta name="description" content="${description}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://hourspend.one/blog">
<meta name="theme-color" content="#0a0710">

<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:type" content="website">
<meta property="og:url" content="https://hourspend.one/blog">
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
.page-nav-inner { max-width: 760px; margin: 0 auto; padding: 18px 24px; display: flex; justify-content: space-between; align-items: center; }
.logo { display: inline-flex; align-items: center; gap: 10px; font-weight: 800; color: var(--text); border: 0; }
.logo svg { width: 18px; height: 18px; }
.back-link { font-size: 13px; color: var(--text-muted); border: 0; }
main { max-width: 760px; margin: 0 auto; padding: 72px 24px 120px; }
.eyebrow { font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: var(--gold); font-weight: 700; font-family: var(--mono); margin-bottom: 18px; }
h1 { font-size: clamp(40px, 6vw, 60px); line-height: 1.03; letter-spacing: -2px; font-weight: 800; margin: 0 0 12px; }
h1 em { font-family: var(--editorial); font-style: italic; background: linear-gradient(135deg, var(--gold-soft), var(--gold)); -webkit-background-clip: text; background-clip: text; color: transparent; }
.lede { font-size: 19px; color: var(--text-muted); margin: 0 0 56px; max-width: 600px; }
.post-list { display: flex; flex-direction: column; gap: 14px; }
.post-card { display: block; padding: 28px; background: rgba(255,255,255,0.04); border: 1px solid var(--line); border-radius: 16px; color: var(--text); border-bottom: 1px solid var(--line); transition: border-color 0.2s; }
.post-card:hover { border-color: rgba(232,200,110,0.4); color: var(--text); }
.post-card .post-eyebrow { font-family: var(--mono); font-size: 11px; letter-spacing: 1.5px; color: var(--text-dim); margin-bottom: 10px; text-transform: uppercase; }
.post-card h2 { margin: 0 0 12px; font-size: 23px; font-weight: 800; letter-spacing: -0.5px; line-height: 1.25; }
.post-card p { margin: 0; color: var(--text-muted); font-size: 15px; }
footer.page-footer { max-width: 760px; margin: 0 auto; padding: 40px 24px; border-top: 1px solid var(--line); color: var(--text-dim); font-size: 13px; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
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
  <div class="eyebrow">The Blog</div>
  <h1>Essays on <em>time, money</em>,<br>and the gap between.</h1>
  <p class="lede">Short, honest, no filler. Essays on personal finance framed in hours of life instead of dollars — calculating your real hourly wage, auditing subscriptions, the psychology of why a price feels different once you reframe it.</p>
  <div class="post-list">
${cards}
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
  fs.writeFileSync(path.join(OUT_DIR, 'index.html'), hubHtml(), 'utf8');
  console.log('  wrote public/blog/index.html');
  for (const post of POSTS) {
    const dir = path.join(OUT_DIR, post.slug);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const others = POSTS.filter((p) => p.slug !== post.slug);
    fs.writeFileSync(path.join(dir, 'index.html'), postHtml(post, others), 'utf8');
    console.log(`  wrote public/blog/${post.slug}/index.html`);
  }
  console.log(`  ${POSTS.length} blog posts + hub.`);
}

main();
