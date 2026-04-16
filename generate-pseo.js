#!/usr/bin/env node
// Programmatic SEO page generator for HourSpend
// Generates /buying-a-{slug}/ pages for top 100 consumer items
// Each page calculates "X hours of work to afford this" for 5 income brackets

const fs = require('fs');
const path = require('path');

const ITEMS = [
  { slug: 'iphone-16-pro', name: 'iPhone 16 Pro', price: 1199, emoji: '📱', category: 'Electronics' },
  { slug: 'iphone-16', name: 'iPhone 16', price: 999, emoji: '📱', category: 'Electronics' },
  { slug: 'macbook-air-m3', name: 'MacBook Air M3', price: 1099, emoji: '💻', category: 'Electronics' },
  { slug: 'macbook-pro-14', name: 'MacBook Pro 14"', price: 1999, emoji: '💻', category: 'Electronics' },
  { slug: 'airpods-pro-2', name: 'AirPods Pro 2', price: 249, emoji: '🎧', category: 'Electronics' },
  { slug: 'apple-watch-ultra', name: 'Apple Watch Ultra', price: 799, emoji: '⌚', category: 'Electronics' },
  { slug: 'ipad-pro', name: 'iPad Pro', price: 999, emoji: '📱', category: 'Electronics' },
  { slug: 'samsung-galaxy-s24', name: 'Samsung Galaxy S24', price: 799, emoji: '📱', category: 'Electronics' },
  { slug: 'sony-wh-1000xm5', name: 'Sony WH-1000XM5', price: 399, emoji: '🎧', category: 'Electronics' },
  { slug: 'playstation-5', name: 'PlayStation 5', price: 499, emoji: '🎮', category: 'Electronics' },
  { slug: 'xbox-series-x', name: 'Xbox Series X', price: 499, emoji: '🎮', category: 'Electronics' },
  { slug: 'nintendo-switch', name: 'Nintendo Switch OLED', price: 349, emoji: '🎮', category: 'Electronics' },
  { slug: 'tesla-model-3', name: 'Tesla Model 3', price: 38990, emoji: '🚗', category: 'Vehicles' },
  { slug: 'tesla-model-y', name: 'Tesla Model Y', price: 44990, emoji: '🚗', category: 'Vehicles' },
  { slug: 'toyota-corolla', name: 'Toyota Corolla', price: 22050, emoji: '🚗', category: 'Vehicles' },
  { slug: 'honda-civic', name: 'Honda Civic', price: 23950, emoji: '🚗', category: 'Vehicles' },
  { slug: 'bmw-3-series', name: 'BMW 3 Series', price: 45950, emoji: '🚗', category: 'Vehicles' },
  { slug: 'starbucks-grande-latte', name: 'Starbucks Grande Latte', price: 5.45, emoji: '☕', category: 'Food' },
  { slug: 'starbucks-venti-latte', name: 'Starbucks Venti Latte', price: 6.15, emoji: '☕', category: 'Food' },
  { slug: 'big-mac-meal', name: 'Big Mac Meal', price: 9.49, emoji: '🍔', category: 'Food' },
  { slug: 'whopper-meal', name: 'Whopper Meal', price: 9.79, emoji: '🍔', category: 'Food' },
  { slug: 'chipotle-burrito', name: 'Chipotle Burrito', price: 11.50, emoji: '🌯', category: 'Food' },
  { slug: 'dominos-large-pizza', name: 'Domino\'s Large Pizza', price: 16.99, emoji: '🍕', category: 'Food' },
  { slug: 'doordash-dinner', name: 'DoorDash Dinner', price: 32, emoji: '🛵', category: 'Food' },
  { slug: 'uber-eats-lunch', name: 'Uber Eats Lunch', price: 25, emoji: '🛵', category: 'Food' },
  { slug: 'whole-foods-grocery-trip', name: 'Whole Foods Weekly Groceries', price: 180, emoji: '🛒', category: 'Food' },
  { slug: 'netflix-monthly', name: 'Netflix Monthly Subscription', price: 22.99, emoji: '📺', category: 'Subscriptions' },
  { slug: 'spotify-monthly', name: 'Spotify Premium Monthly', price: 11.99, emoji: '🎵', category: 'Subscriptions' },
  { slug: 'apple-music-monthly', name: 'Apple Music Monthly', price: 10.99, emoji: '🎵', category: 'Subscriptions' },
  { slug: 'youtube-premium-monthly', name: 'YouTube Premium', price: 13.99, emoji: '📺', category: 'Subscriptions' },
  { slug: 'amazon-prime-yearly', name: 'Amazon Prime Yearly', price: 139, emoji: '📦', category: 'Subscriptions' },
  { slug: 'chatgpt-plus-monthly', name: 'ChatGPT Plus Monthly', price: 20, emoji: '🤖', category: 'Subscriptions' },
  { slug: 'adobe-creative-cloud-monthly', name: 'Adobe Creative Cloud', price: 59.99, emoji: '🎨', category: 'Subscriptions' },
  { slug: 'planet-fitness-yearly', name: 'Planet Fitness Yearly', price: 263, emoji: '💪', category: 'Subscriptions' },
  { slug: 'rent-nyc-1bedroom', name: 'NYC 1-Bedroom Rent (monthly)', price: 4500, emoji: '🏙️', category: 'Housing' },
  { slug: 'rent-sf-studio', name: 'SF Studio Rent (monthly)', price: 2800, emoji: '🌉', category: 'Housing' },
  { slug: 'rent-austin-2bedroom', name: 'Austin 2-Bedroom Rent (monthly)', price: 2200, emoji: '🤠', category: 'Housing' },
  { slug: 'rent-chicago-1bedroom', name: 'Chicago 1-Bedroom Rent (monthly)', price: 2100, emoji: '🌆', category: 'Housing' },
  { slug: 'house-down-payment-100k', name: '$100K House Down Payment', price: 100000, emoji: '🏡', category: 'Housing' },
  { slug: 'wedding-average-cost', name: 'Average Wedding Cost', price: 35000, emoji: '💒', category: 'Lifestyle' },
  { slug: 'engagement-ring-3-month-salary', name: 'Engagement Ring (3-month salary)', price: 7500, emoji: '💍', category: 'Lifestyle' },
  { slug: 'paris-vacation-week', name: 'Week in Paris', price: 3500, emoji: '🗼', category: 'Travel' },
  { slug: 'tokyo-vacation-week', name: 'Week in Tokyo', price: 4200, emoji: '🗾', category: 'Travel' },
  { slug: 'caribbean-cruise', name: 'Caribbean Cruise (7-day)', price: 1500, emoji: '🚢', category: 'Travel' },
  { slug: 'disney-world-family-trip', name: 'Disney World Family Trip', price: 6500, emoji: '🏰', category: 'Travel' },
  { slug: 'gym-membership-yearly', name: 'Gym Membership (yearly)', price: 600, emoji: '🏋️', category: 'Lifestyle' },
  { slug: 'yoga-class-pack-10', name: '10-Class Yoga Pack', price: 220, emoji: '🧘', category: 'Lifestyle' },
  { slug: 'concert-ticket-vip', name: 'Concert Ticket (VIP)', price: 250, emoji: '🎵', category: 'Lifestyle' },
  { slug: 'movie-ticket-imax', name: 'IMAX Movie Ticket', price: 22, emoji: '🎬', category: 'Lifestyle' },
  { slug: 'haircut-mens', name: 'Men\'s Haircut', price: 35, emoji: '💇', category: 'Personal' },
  { slug: 'haircut-womens', name: 'Women\'s Haircut', price: 85, emoji: '💇', category: 'Personal' },
  { slug: 'gas-fillup', name: 'Gas Tank Fill-up', price: 60, emoji: '⛽', category: 'Transport' },
];

const INCOME_BRACKETS = [
  { hourly: 15, label: 'Minimum wage ($15/hr)' },
  { hourly: 25, label: 'Median worker ($25/hr · ~$52K/yr)' },
  { hourly: 50, label: 'Senior pro ($50/hr · ~$104K/yr)' },
  { hourly: 100, label: 'Top earner ($100/hr · ~$208K/yr)' },
  { hourly: 200, label: 'Executive ($200/hr · ~$416K/yr)' },
];

function formatHours(hours) {
  if (hours < 1) return `${Math.round(hours * 60)} minutes`;
  if (hours < 8) return `${hours.toFixed(1)} hours`;
  if (hours < 40) return `${(hours / 8).toFixed(1)} workdays`;
  if (hours < 160) return `${(hours / 40).toFixed(1)} workweeks`;
  if (hours < 1920) return `${(hours / 160).toFixed(1)} months`;
  return `${(hours / 1920).toFixed(1)} years`;
}

function generatePage(item) {
  const rows = INCOME_BRACKETS.map(bracket => {
    const hours = item.price / bracket.hourly;
    return `
        <tr>
          <td>${bracket.label}</td>
          <td><strong>${formatHours(hours)}</strong></td>
        </tr>`;
  }).join('');

  const title = `${item.name} = how many hours of work? | HourSpend`;
  const desc = `${item.name} costs $${item.price.toLocaleString()}. See exactly how many hours of work it costs at every salary level. Free calculator.`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${desc}">
  <link rel="canonical" href="https://hourspend.one/buying/${item.slug}">

  <meta property="og:title" content="${item.name} = how many hours of work?">
  <meta property="og:description" content="${desc}">

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "QAPage",
    "mainEntity": {
      "@type": "Question",
      "name": "How many hours of work does it take to afford a ${item.name}?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A ${item.name} costs $${item.price.toLocaleString()}. At a $25/hour wage, that's ${formatHours(item.price / 25)} of work."
      }
    }
  }
  </script>

  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, sans-serif;
      background: #1A0B2E; color: #F5F5F5;
      min-height: 100vh; padding: 40px 24px;
    }
    .container { max-width: 720px; margin: 0 auto; }
    .breadcrumb { color: #B0A0C8; font-size: 13px; margin-bottom: 24px; }
    .breadcrumb a { color: #D4A846; text-decoration: none; }
    .emoji { font-size: 64px; margin-bottom: 16px; }
    h1 { font-size: clamp(28px, 5vw, 42px); font-weight: 800; line-height: 1.1; margin-bottom: 12px; letter-spacing: -1px; }
    h1 span { color: #D4A846; }
    .price { font-size: 22px; color: #B0A0C8; margin-bottom: 40px; }
    .price strong { color: #F5F5F5; font-weight: 700; }
    table {
      width: 100%; border-collapse: separate; border-spacing: 0;
      background: rgba(45, 27, 78, 0.6);
      border-radius: 20px; overflow: hidden;
      border: 1px solid rgba(255,255,255,0.08);
      backdrop-filter: blur(10px);
    }
    th, td { padding: 18px 20px; text-align: left; }
    th {
      background: rgba(212, 168, 70, 0.1); color: #D4A846;
      font-size: 12px; text-transform: uppercase; letter-spacing: 1px;
    }
    td { border-top: 1px solid rgba(255,255,255,0.05); font-size: 16px; }
    td strong { color: #D4A846; font-weight: 700; font-size: 17px; }
    .cta {
      margin-top: 48px; padding: 32px;
      background: linear-gradient(135deg, rgba(212,168,70,0.15), rgba(26,188,156,0.05));
      border-radius: 20px; text-align: center;
      border: 1px solid rgba(212,168,70,0.3);
    }
    .cta h2 { font-size: 22px; margin-bottom: 8px; }
    .cta p { color: #B0A0C8; margin-bottom: 24px; }
    .cta a {
      display: inline-block; padding: 14px 32px;
      background: #000; color: white;
      border-radius: 14px; text-decoration: none;
      font-weight: 700; transition: all 0.2s;
    }
    .cta a:hover { background: #1a1a1a; }
    .footer { text-align: center; padding: 40px 0; color: #B0A0C8; font-size: 13px; }
    .footer a { color: #D4A846; text-decoration: none; }
    .related {
      margin-top: 48px;
    }
    .related h3 { font-size: 14px; color: #B0A0C8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; }
    .related-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .related-grid a {
      padding: 14px 16px; background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 12px; color: #F5F5F5; text-decoration: none;
      font-size: 14px;
    }
    .related-grid a:hover { border-color: #D4A846; }
  </style>
</head>
<body>
  <div class="container">
    <div class="breadcrumb">
      <a href="/">HourSpend</a> · <a href="/buying">Buying Calculator</a> · ${item.category}
    </div>

    <div class="emoji">${item.emoji}</div>
    <h1>How many hours of work for a <span>${item.name}</span>?</h1>
    <p class="price">${item.name} costs <strong>$${item.price.toLocaleString()}</strong></p>

    <table>
      <thead>
        <tr><th>Income Level</th><th>Hours of Work</th></tr>
      </thead>
      <tbody>${rows}
      </tbody>
    </table>

    <div class="cta">
      <h2>See every expense this way</h2>
      <p>HourSpend tracks your spending in hours of your life — not just dollars.</p>
      <a href="https://apps.apple.com/us/app/budget-tracker-money-time/id6758535957">📱 Download HourSpend for iOS</a>
    </div>

    <div class="related">
      <h3>Similar items in ${item.category}</h3>
      <div class="related-grid">
        ${ITEMS.filter(i => i.category === item.category && i.slug !== item.slug).slice(0, 4).map(i =>
          `<a href="/buying/${i.slug}">${i.emoji} ${i.name}</a>`
        ).join('\n        ')}
      </div>
    </div>
  </div>
  <div class="footer">
    Made by <a href="/">HourSpend</a> · Budget Tracker showing expenses as hours of your life
  </div>
</body>
</html>`;
}

// Generate index of all items
function generateIndex() {
  const byCategory = {};
  ITEMS.forEach(item => {
    if (!byCategory[item.category]) byCategory[item.category] = [];
    byCategory[item.category].push(item);
  });

  const categories = Object.keys(byCategory).map(cat => `
    <section>
      <h2>${cat}</h2>
      <div class="grid">
        ${byCategory[cat].map(item => `
          <a href="/buying/${item.slug}" class="item">
            <span class="emoji">${item.emoji}</span>
            <strong>${item.name}</strong>
            <span class="price">$${item.price.toLocaleString()}</span>
          </a>`).join('')}
      </div>
    </section>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>How Many Hours Do I Work For X? | ${ITEMS.length}+ Items | HourSpend</title>
  <meta name="description" content="Free calculator: see how many hours you must work to afford ${ITEMS.length}+ common purchases at any salary. iPhone, rent, coffee, vacations.">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, sans-serif; background: #1A0B2E; color: #F5F5F5; padding: 40px 24px; }
    .container { max-width: 1100px; margin: 0 auto; }
    h1 { font-size: clamp(32px, 5vw, 48px); font-weight: 800; margin-bottom: 12px; letter-spacing: -1px; }
    h1 span { color: #D4A846; }
    .subtitle { color: #B0A0C8; font-size: 18px; margin-bottom: 48px; }
    section { margin-bottom: 48px; }
    h2 { font-size: 22px; color: #D4A846; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 1px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; }
    .item {
      padding: 20px; background: rgba(45, 27, 78, 0.6); backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.08); border-radius: 16px;
      text-decoration: none; color: #F5F5F5; transition: all 0.2s;
      display: flex; flex-direction: column; gap: 6px;
    }
    .item:hover { border-color: #D4A846; transform: translateY(-2px); }
    .item .emoji { font-size: 32px; }
    .item strong { font-size: 14px; }
    .item .price { font-size: 12px; color: #B0A0C8; }
    .footer { text-align: center; padding: 40px 0; color: #B0A0C8; font-size: 13px; }
    .footer a { color: #D4A846; }
  </style>
</head>
<body>
  <div class="container">
    <h1>How Many Hours Do I Work<br>For <span>X?</span></h1>
    <p class="subtitle">${ITEMS.length} common purchases. See what they cost in your life.</p>
    ${categories}
  </div>
  <div class="footer"><a href="/">← Back to HourSpend</a></div>
</body>
</html>`;
}

// Build all pages
const outDir = path.join(__dirname, 'public', 'buying');
fs.mkdirSync(outDir, { recursive: true });

ITEMS.forEach(item => {
  const itemDir = path.join(outDir, item.slug);
  fs.mkdirSync(itemDir, { recursive: true });
  fs.writeFileSync(path.join(itemDir, 'index.html'), generatePage(item));
});

fs.writeFileSync(path.join(outDir, 'index.html'), generateIndex());

// Sitemap
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://hourspend.one/</loc><priority>1.0</priority></url>
  <url><loc>https://hourspend.one/buying/</loc><priority>0.9</priority></url>
${ITEMS.map(item =>
  `  <url><loc>https://hourspend.one/buying/${item.slug}</loc><priority>0.7</priority></url>`
).join('\n')}
</urlset>`;
fs.writeFileSync(path.join(__dirname, 'public', 'sitemap.xml'), sitemap);

// Robots.txt
fs.writeFileSync(path.join(__dirname, 'public', 'robots.txt'),
  'User-agent: *\nAllow: /\n\nSitemap: https://hourspend.one/sitemap.xml\n');

console.log(`✓ Generated ${ITEMS.length} programmatic SEO pages in /public/buying/`);
console.log(`✓ Sitemap with ${ITEMS.length + 2} URLs`);
console.log(`✓ Robots.txt`);
