# HourSpend Landing Page

Static landing page with viral coffee calculator + 52 programmatic SEO pages.

## Stack
- Pure HTML + CSS + JS (no build step needed)
- Programmatic SEO generator in Node.js
- Hosted on Vercel free tier

## Pages
- `/` — Main landing with calculator
- `/buying/` — Index of all 52+ products
- `/buying/{slug}/` — Individual product page (e.g., `/buying/iphone-16-pro/`)
- `/sitemap.xml` — SEO sitemap
- `/robots.txt`

## Deployment (5 min)

### Option A: Vercel CLI (recommended)
```bash
cd /Users/gencayalla/Documents/HourSpendSwift/hourspend-landing
npm install -g vercel
vercel login
vercel --prod
```

### Option B: GitHub + Vercel auto-deploy
```bash
# Push to GitHub
cd /Users/gencayalla/Documents/HourSpendSwift/hourspend-landing
git init
git add .
git commit -m "Initial landing page"
gh repo create hourspend-landing --public --source=. --push

# Connect on vercel.com → New Project → Import GitHub repo
# Auto-deploy on every push
```

### Option C: Drag & drop
- Visit https://vercel.com/new
- Drag the `public/` folder
- Add custom domain after deploy

## Custom Domain Setup

1. Buy domain (e.g., `hourspend.one` or `gethourspend.com`) — ~$12/year at Namecheap
2. Vercel dashboard → Project → Settings → Domains → Add
3. Update DNS at registrar (Vercel gives instructions)
4. Wait ~1 hour for DNS propagation

## Adding More Products

Edit `generate-pseo.js`, add to `ITEMS` array:
```js
{ slug: 'tesla-cybertruck', name: 'Tesla Cybertruck', price: 79990, emoji: '🚙', category: 'Vehicles' }
```
Then re-run: `node generate-pseo.js`

## SEO Tracking

After deploy, submit sitemap to:
- Google Search Console: https://search.google.com/search-console
- Bing Webmaster Tools: https://www.bing.com/webmasters

Expected rankings: 4-8 weeks for long-tail queries like "how many hours of work for an iPhone 16 Pro"

## Conversion Funnel

```
Google search "how many hours of work for X"
  → Programmatic SEO page (/buying/{slug})
  → Calculator on landing page (/)
  → Click "Download HourSpend" CTA
  → App Store install
  → 7-day free trial
  → Conversion to paid
```

## Analytics

Add Plausible (free for hobby) or Vercel Analytics:
```html
<!-- Add to <head> of all pages -->
<script defer data-domain="hourspend.one" src="https://plausible.io/js/script.js"></script>
```

## Performance

- Lighthouse score target: 95+ (mobile)
- LCP < 1.5s
- Pure HTML = no hydration cost
- Estimated bandwidth: <50KB per page load

## Estimated Traffic (3 months)

| Source | Monthly visits |
|--------|---------------|
| Direct (TikTok shares) | 500-2K |
| Google organic (long-tail) | 200-1K |
| Reddit/HN referrals | 100-500 |
| **Total** | **800-3.5K** |

At 3% App Store CTR + 30% install rate = 7-30 installs/day from landing alone.
