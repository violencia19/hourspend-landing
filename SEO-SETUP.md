# HourSpend SEO Setup Checklist

All the post-deploy work that can't be done from code. Run through this once.

## 1. Google Search Console

1. Go to https://search.google.com/search-console
2. Add property → **Domain property** (not URL prefix): `hourspend.one`
3. Verify via DNS TXT record (Cloudflare / Namecheap whichever manages DNS)
4. Once verified:
   - **Sitemaps** → Add `sitemap.xml` (Google will crawl 99 URLs)
   - **Removals** → skip
   - **Core Web Vitals** → check in 24h, then weekly
5. Wait 3-5 days for first indexation report

## 2. Bing Webmaster Tools

1. https://www.bing.com/webmasters — sign in with Microsoft account
2. Import from Google Search Console (fastest — one click)
3. Confirm sitemap imported
4. Bing is ~7% of US search but includes ChatGPT web search citations, so it matters

## 3. Plausible Analytics

Already wired into the site. Just confirm:

1. https://plausible.io/hourspend.one — stats dashboard
2. Configure **custom events** for:
   - App Store link click (data-tag on `/` and `/calculator`)
   - Calculator submit
   - Blog post scroll depth (already in Plausible defaults)
3. Weekly digest email → on

## 4. AI Search (llms.txt)

Nothing to do. File is at `https://hourspend.one/llms.txt` and will be
picked up by AI crawlers (Perplexity, Claude, Gemini) automatically on
their next crawl cycle (usually weekly).

Manual pings that accelerate discovery:
- None have a reliable "submit" flow yet as of 2026-04. Let it happen naturally.

## 5. DNS + SSL sanity

Check:
```
curl -I https://hourspend.one
curl -I https://www.hourspend.one    # should redirect to bare domain (verify)
curl -I http://hourspend.one         # should redirect to HTTPS
```

If `www` subdomain is not set up, add it in Vercel DNS → CNAME `www` → `cname.vercel-dns.com`, set redirect to bare `hourspend.one`.

## 6. Schema / structured-data validation

After deploy:
1. Visit https://search.google.com/test/rich-results
2. Test each important page:
   - `/` → expects WebApplication + FAQPage + (OG image renders)
   - `/calculator` → WebApplication + HowTo
   - `/philosophy` → Article + Book mentions
   - `/buying/starbucks-grande-latte` → QAPage (existing pattern)
   - `/vs/ynab` → Article with two SoftwareApplication mentions
   - `/blog/real-hourly-wage` → BlogPosting
3. Any "Errors" or "Warnings" → fix the HTML and redeploy

## 7. Page Speed / Core Web Vitals

Run once post-deploy on:
- https://pagespeed.web.dev/report?url=https%3A%2F%2Fhourspend.one
- https://pagespeed.web.dev/report?url=https%3A%2F%2Fhourspend.one%2Fcalculator
- https://pagespeed.web.dev/report?url=https%3A%2F%2Fhourspend.one%2Fbuying%2Fiphone-16-pro

Target: **Mobile Performance ≥ 80**, **LCP < 2.5s**, **INP < 200ms**, **CLS < 0.1**.

The main landing is the one most at risk — it's a single 200KB+ HTML with big inline JS. If it fails, deferred optimizations:
- Defer the Lenis smooth-scroll JS until after LCP
- Lazy-load the marquee Unsplash images
- Split the main `<script>` block into critical + deferred

Nothing to do preemptively; measure first.

## 8. Backlinks

Drafts prepared in `/Users/gencayalla/Documents/VantagSwift/marketing-assets/launch-drafts/`.

Post order (see `launch-drafts/README.md`):

| Day | Channel | Expected |
|---|---|---|
| 1 | Show HN | 30–200 upvotes if good, ~100 visits to hourspend.one, 1-3 real backlinks from commenters' sites |
| 1 | r/sideproject | 10–50 upvotes, warm feedback, 30 visits |
| 3 | r/personalfinance | if not removed: 50–500 upvotes, 200 visits, 0–2 backlinks |
| 5 | r/financialindependence | 30–200 upvotes, 150 visits, higher-quality users |
| 7 | Product Hunt | 50–300 upvotes, 200 visits, potential badge/mention |
| 10+ | Indie Hackers | 10–50 reactions, 50 visits, network-effect for later posts |
| 14+ | Mad Fientist outreach | 10% chance of mention, worth ~1000 high-quality visits if it lands |

## 9. What to measure week by week

**Week 1** (post-deploy):
- Indexed pages (Google Search Console)
- Core Web Vitals (PageSpeed)
- First click-throughs

**Week 2–3:**
- Position distribution (how many queries in top 50)
- Rich-result impressions (FAQ, HowTo appearances)
- Sitemap pages with impressions

**Week 4–8:**
- Ranking for brand term "HourSpend"
- Long-tail ranking on /buying/* and /income/* pages
- Non-brand organic clicks

**Month 2–3:**
- Target: 500–2000 monthly organic impressions
- Target: 5–20 clicks/day from non-brand queries
- Target: 10+ referring domains (backlinks)

## 10. Things NOT to do

- Don't buy backlinks. Google will find them and de-rank you.
- Don't keyword-stuff /blog content. Write for humans.
- Don't add a "directory of sites" at the footer; it looks like 2012 spam.
- Don't create `/vs/` pages for competitors you haven't actually used (already done for 4 — leave it at that unless you have an opinion on the next one).
- Don't crosspost the same Reddit text. Each sub gets its own draft.
