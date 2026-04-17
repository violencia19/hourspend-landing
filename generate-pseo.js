#!/usr/bin/env node
// Programmatic SEO page generator for HourSpend
// Generates /buying/{slug}/ pages for 52 consumer items
// Premium landing-matched design: Cabinet Grotesk + Fraunces + Geist Mono,
// WebGL mesh gradient shader, grain overlay, glass nav, Unsplash photos.

const fs = require('fs');
const path = require('path');

const ITEMS = [
  { slug: 'iphone-16-pro', name: 'iPhone 16 Pro', price: 1199, image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1400&q=80&auto=format&fit=crop', category: 'Electronics' },
  { slug: 'iphone-16', name: 'iPhone 16', price: 999, image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=1400&q=80&auto=format&fit=crop', category: 'Electronics' },
  { slug: 'macbook-air-m3', name: 'MacBook Air M3', price: 1099, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1400&q=80&auto=format&fit=crop', category: 'Electronics' },
  { slug: 'macbook-pro-14', name: 'MacBook Pro 14"', price: 1999, image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=1400&q=80&auto=format&fit=crop', category: 'Electronics' },
  { slug: 'airpods-pro-2', name: 'AirPods Pro 2', price: 249, image: 'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=1400&q=80&auto=format&fit=crop', category: 'Electronics' },
  { slug: 'apple-watch-ultra', name: 'Apple Watch Ultra', price: 799, image: 'https://images.unsplash.com/photo-1617625802921-d824424898a9?w=1400&q=80&auto=format&fit=crop', category: 'Electronics' },
  { slug: 'ipad-pro', name: 'iPad Pro', price: 999, image: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=1400&q=80&auto=format&fit=crop', category: 'Electronics' },
  { slug: 'samsung-galaxy-s24', name: 'Samsung Galaxy S24', price: 799, image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=1400&q=80&auto=format&fit=crop', category: 'Electronics' },
  { slug: 'sony-wh-1000xm5', name: 'Sony WH-1000XM5', price: 399, image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=1400&q=80&auto=format&fit=crop', category: 'Electronics' },
  { slug: 'playstation-5', name: 'PlayStation 5', price: 499, image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=1400&q=80&auto=format&fit=crop', category: 'Electronics' },
  { slug: 'xbox-series-x', name: 'Xbox Series X', price: 499, image: 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=1400&q=80&auto=format&fit=crop', category: 'Electronics' },
  { slug: 'nintendo-switch', name: 'Nintendo Switch OLED', price: 349, image: 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=1400&q=80&auto=format&fit=crop', category: 'Electronics' },
  { slug: 'tesla-model-3', name: 'Tesla Model 3', price: 38990, image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=1400&q=80&auto=format&fit=crop', category: 'Vehicles' },
  { slug: 'tesla-model-y', name: 'Tesla Model Y', price: 44990, image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=1400&q=80&auto=format&fit=crop', category: 'Vehicles' },
  { slug: 'toyota-corolla', name: 'Toyota Corolla', price: 22050, image: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=1400&q=80&auto=format&fit=crop', category: 'Vehicles' },
  { slug: 'honda-civic', name: 'Honda Civic', price: 23950, image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=1400&q=80&auto=format&fit=crop', category: 'Vehicles' },
  { slug: 'bmw-3-series', name: 'BMW 3 Series', price: 45950, image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1400&q=80&auto=format&fit=crop', category: 'Vehicles' },
  { slug: 'starbucks-grande-latte', name: 'Starbucks Grande Latte', price: 5.45, image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1400&q=80&auto=format&fit=crop', category: 'Food' },
  { slug: 'starbucks-venti-latte', name: 'Starbucks Venti Latte', price: 6.15, image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=1400&q=80&auto=format&fit=crop', category: 'Food' },
  { slug: 'big-mac-meal', name: 'Big Mac Meal', price: 9.49, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1400&q=80&auto=format&fit=crop', category: 'Food' },
  { slug: 'whopper-meal', name: 'Whopper Meal', price: 9.79, image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=1400&q=80&auto=format&fit=crop', category: 'Food' },
  { slug: 'chipotle-burrito', name: 'Chipotle Burrito', price: 11.50, image: 'https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?w=1400&q=80&auto=format&fit=crop', category: 'Food' },
  { slug: 'dominos-large-pizza', name: 'Domino\'s Large Pizza', price: 16.99, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1400&q=80&auto=format&fit=crop', category: 'Food' },
  { slug: 'doordash-dinner', name: 'DoorDash Dinner', price: 32, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1400&q=80&auto=format&fit=crop', category: 'Food' },
  { slug: 'uber-eats-lunch', name: 'Uber Eats Lunch', price: 25, image: 'https://images.unsplash.com/photo-1547573854-74d2a71d0826?w=1400&q=80&auto=format&fit=crop', category: 'Food' },
  { slug: 'whole-foods-grocery-trip', name: 'Whole Foods Weekly Groceries', price: 180, image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1400&q=80&auto=format&fit=crop', category: 'Food' },
  { slug: 'netflix-monthly', name: 'Netflix Monthly Subscription', price: 22.99, image: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=1400&q=80&auto=format&fit=crop', category: 'Subscriptions' },
  { slug: 'spotify-monthly', name: 'Spotify Premium Monthly', price: 11.99, image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1400&q=80&auto=format&fit=crop', category: 'Subscriptions' },
  { slug: 'apple-music-monthly', name: 'Apple Music Monthly', price: 10.99, image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1400&q=80&auto=format&fit=crop', category: 'Subscriptions' },
  { slug: 'youtube-premium-monthly', name: 'YouTube Premium', price: 13.99, image: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=1400&q=80&auto=format&fit=crop', category: 'Subscriptions' },
  { slug: 'amazon-prime-yearly', name: 'Amazon Prime Yearly', price: 139, image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1400&q=80&auto=format&fit=crop', category: 'Subscriptions' },
  { slug: 'chatgpt-plus-monthly', name: 'ChatGPT Plus Monthly', price: 20, image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1400&q=80&auto=format&fit=crop', category: 'Subscriptions' },
  { slug: 'adobe-creative-cloud-monthly', name: 'Adobe Creative Cloud', price: 59.99, image: 'https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=1400&q=80&auto=format&fit=crop', category: 'Subscriptions' },
  { slug: 'planet-fitness-yearly', name: 'Planet Fitness Yearly', price: 263, image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1400&q=80&auto=format&fit=crop', category: 'Subscriptions' },
  { slug: 'rent-nyc-1bedroom', name: 'NYC 1-Bedroom Rent (monthly)', price: 4500, image: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=1400&q=80&auto=format&fit=crop', category: 'Housing' },
  { slug: 'rent-sf-studio', name: 'SF Studio Rent (monthly)', price: 2800, image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1400&q=80&auto=format&fit=crop', category: 'Housing' },
  { slug: 'rent-austin-2bedroom', name: 'Austin 2-Bedroom Rent (monthly)', price: 2200, image: 'https://images.unsplash.com/photo-1531218614045-d23a60e56cab?w=1400&q=80&auto=format&fit=crop', category: 'Housing' },
  { slug: 'rent-chicago-1bedroom', name: 'Chicago 1-Bedroom Rent (monthly)', price: 2100, image: 'https://images.unsplash.com/photo-1477414348463-c0eb7f1359b6?w=1400&q=80&auto=format&fit=crop', category: 'Housing' },
  { slug: 'house-down-payment-100k', name: '$100K House Down Payment', price: 100000, image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1400&q=80&auto=format&fit=crop', category: 'Housing' },
  { slug: 'wedding-average-cost', name: 'Average Wedding Cost', price: 35000, image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1400&q=80&auto=format&fit=crop', category: 'Lifestyle' },
  { slug: 'engagement-ring-3-month-salary', name: 'Engagement Ring (3-month salary)', price: 7500, image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1400&q=80&auto=format&fit=crop', category: 'Lifestyle' },
  { slug: 'paris-vacation-week', name: 'Week in Paris', price: 3500, image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1400&q=80&auto=format&fit=crop', category: 'Travel' },
  { slug: 'tokyo-vacation-week', name: 'Week in Tokyo', price: 4200, image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1400&q=80&auto=format&fit=crop', category: 'Travel' },
  { slug: 'caribbean-cruise', name: 'Caribbean Cruise (7-day)', price: 1500, image: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?w=1400&q=80&auto=format&fit=crop', category: 'Travel' },
  { slug: 'disney-world-family-trip', name: 'Disney World Family Trip', price: 6500, image: 'https://images.unsplash.com/photo-1569254452220-78abfc16ee18?w=1400&q=80&auto=format&fit=crop', category: 'Travel' },
  { slug: 'gym-membership-yearly', name: 'Gym Membership (yearly)', price: 600, image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1400&q=80&auto=format&fit=crop', category: 'Lifestyle' },
  { slug: 'yoga-class-pack-10', name: '10-Class Yoga Pack', price: 220, image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1400&q=80&auto=format&fit=crop', category: 'Lifestyle' },
  { slug: 'concert-ticket-vip', name: 'Concert Ticket (VIP)', price: 250, image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1400&q=80&auto=format&fit=crop', category: 'Lifestyle' },
  { slug: 'movie-ticket-imax', name: 'IMAX Movie Ticket', price: 22, image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1400&q=80&auto=format&fit=crop', category: 'Lifestyle' },
  { slug: 'haircut-mens', name: 'Men\'s Haircut', price: 35, image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1400&q=80&auto=format&fit=crop', category: 'Personal' },
  { slug: 'haircut-womens', name: 'Women\'s Haircut', price: 85, image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1400&q=80&auto=format&fit=crop', category: 'Personal' },
  { slug: 'gas-fillup', name: 'Gas Tank Fill-up', price: 60, image: 'https://images.unsplash.com/photo-1545459720-aac8509eb02c?w=1400&q=80&auto=format&fit=crop', category: 'Transport' },
];

const INCOME_BRACKETS = [
  { hourly: 15, label: 'Minimum wage', salary: '$15/hr' },
  { hourly: 25, label: 'Median worker', salary: '$25/hr · ~$52K/yr' },
  { hourly: 50, label: 'Senior pro', salary: '$50/hr · ~$104K/yr' },
  { hourly: 100, label: 'Top earner', salary: '$100/hr · ~$208K/yr' },
  { hourly: 200, label: 'Executive', salary: '$200/hr · ~$416K/yr' },
];

function formatHours(hours) {
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  if (hours < 8) return `${hours.toFixed(1)} hrs`;
  if (hours < 40) return `${(hours / 8).toFixed(1)} days`;
  if (hours < 160) return `${(hours / 40).toFixed(1)} weeks`;
  if (hours < 1920) return `${(hours / 160).toFixed(1)} months`;
  return `${(hours / 1920).toFixed(1)} years`;
}

function cardHours(priceInDollars) {
  // compact headline — uses $25/hr median
  return formatHours(priceInDollars / 25);
}

function escHtml(s) {
  return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
}

// Shared head (fonts, shader-ready styles, nav/footer) + head-level SEO customized per page
function sharedHead(title, desc, canonicalPath, extraJsonLd = '') {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escHtml(title)}</title>
<meta name="description" content="${escHtml(desc)}">
<link rel="canonical" href="https://hourspend.one${canonicalPath}">
<meta property="og:title" content="${escHtml(title)}">
<meta property="og:description" content="${escHtml(desc)}">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800;900&family=Geist+Mono:wght@400;500&family=Fraunces:opsz,wght,SOFT@9..144,400;9..144,700;9..144,900&display=swap" rel="stylesheet">
${extraJsonLd}
<style>
:root {
  --bg: #0a0710; --bg-deep: #06040a; --surface: #0f0a18;
  --gold: #e8c86e; --gold-deep: #d4a846; --gold-soft: #f5e6c8;
  --violet: #6c3fa0; --teal: #1abc9c;
  --text: #f5f0e6; --text-muted: #a89cb8; --text-dim: #6e6379;
  --line: rgba(255,255,255,0.07); --line-hi: rgba(255,255,255,0.14);
  --serif: 'Cabinet Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  --editorial: 'Fraunces', Georgia, serif;
  --mono: 'Geist Mono', 'SF Mono', monospace;
}
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { height: auto; }
body {
  font-family: var(--serif); background: var(--bg); color: var(--text);
  -webkit-font-smoothing: antialiased; overflow-x: hidden; min-height: 100dvh;
}
@media (prefers-reduced-motion: reduce) { .mesh-bg, .grain { display: none !important; } }

.mesh-bg { position: fixed; inset: 0; z-index: 0; pointer-events: none; opacity: 0.85; }
.mesh-bg canvas { width: 100% !important; height: 100% !important; display: block; }

.grain {
  position: fixed; inset: 0; z-index: 1; pointer-events: none;
  opacity: 0.04; mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml;utf8,<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/></svg>");
  background-size: 220px 220px;
}

.wrap { position: relative; z-index: 2; }

.nav {
  position: fixed; top: 14px; left: 14px; right: 14px; z-index: 50;
  padding: 14px 24px; background: rgba(15, 10, 24, 0.6);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid var(--line); border-radius: 100px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.08), 0 20px 60px rgba(0,0,0,0.4);
}
.nav-inner { max-width: 1280px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; }
.logo { font-weight: 800; font-size: 16px; letter-spacing: -0.5px; display: flex; align-items: center; gap: 10px; color: var(--text); text-decoration: none; }
.logo .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--gold); box-shadow: 0 0 14px var(--gold), 0 0 4px var(--gold); }
.nav-actions { display: flex; align-items: center; gap: 24px; }
.nav-actions a { color: var(--text-muted); text-decoration: none; font-size: 13px; font-weight: 500; transition: color 0.25s; }
.nav-actions a:hover { color: var(--text); }
.cta-pill {
  background: linear-gradient(135deg, var(--gold-soft), var(--gold)) !important;
  color: #1a0f1f !important; padding: 9px 18px; border-radius: 100px;
  font-weight: 700 !important; font-size: 13px !important;
  box-shadow: 0 8px 20px rgba(232,200,110,0.25);
}

footer { padding: 80px 28px 50px; border-top: 1px solid var(--line); text-align: center; position: relative; margin-top: 80px; }
.footer-inner { max-width: 1280px; margin: 0 auto; }
.footer-logo { display: inline-flex; align-items: center; gap: 10px; font-weight: 800; font-size: 18px; margin-bottom: 32px; }
.footer-logo .dot { width: 7px; height: 7px; border-radius: 50%; background: var(--gold); box-shadow: 0 0 10px var(--gold); }
.footer-links { display: flex; justify-content: center; gap: 36px; margin-bottom: 32px; flex-wrap: wrap; }
.footer-links a { color: var(--text-muted); text-decoration: none; font-size: 14px; transition: color 0.25s; }
.footer-links a:hover { color: var(--text); }
.footer-credit { color: var(--text-dim); font-size: 12px; font-family: var(--mono); letter-spacing: 0.5px; }

.eyebrow { font-size: 11px; color: var(--gold); letter-spacing: 2.5px; text-transform: uppercase; font-weight: 700; font-family: var(--mono); }

::-webkit-scrollbar { width: 0; }
</style>`;
}

// WebGL shader script (inline)
const WEBGL_SHADER = `<script>
(() => {
  const canvas = document.getElementById('shader-canvas');
  if (!canvas) return;
  const gl = canvas.getContext('webgl', { alpha: true });
  if (!gl) { canvas.parentElement.style.background = 'radial-gradient(ellipse at top, #2D1B4E 0%, #0a0710 70%)'; return; }
  const vert = 'attribute vec2 a_position;void main(){gl_Position=vec4(a_position,0.,1.);}';
  const frag = \`precision highp float;uniform float u_time;uniform vec2 u_resolution;
  vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
  float snoise(vec3 v){const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);
    vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
    vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
    vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;i=mod289(i);
    vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
    float n_=0.142857142857;vec3 ns=n_*D.wyz-D.xzx;vec4 j=p-49.0*floor(p*ns.z*ns.z);
    vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;
    vec4 h=1.0-abs(x)-abs(y);vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
    vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;vec4 sh=-step(h,vec4(0.0));
    vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
    vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
    vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
    p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
    vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;
    return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));}
  void main(){vec2 uv=gl_FragCoord.xy/u_resolution.xy;vec2 p=uv*2.0-1.0;p.x*=u_resolution.x/u_resolution.y;
    float t=u_time*0.06;
    float n=snoise(vec3(p*1.2,t))+snoise(vec3(p*2.4,t*1.3+10.0))*0.5+snoise(vec3(p*4.8,t*0.6+20.0))*0.25;
    vec3 bg=vec3(0.039,0.027,0.063);vec3 violet=vec3(0.17,0.11,0.29);
    vec3 violet2=vec3(0.42,0.25,0.63);vec3 gold=vec3(0.91,0.78,0.43);
    vec3 col=bg;col=mix(col,violet,smoothstep(-0.4,0.3,n)*0.75);
    col=mix(col,violet2,smoothstep(0.0,0.6,n)*0.3);col=mix(col,gold,smoothstep(0.5,0.95,n)*0.18);
    col*=1.0-length(uv-0.5)*0.7;gl_FragColor=vec4(col,1.0);}\`;
  function compile(t,s){const sh=gl.createShader(t);gl.shaderSource(sh,s);gl.compileShader(sh);return sh;}
  const pr=gl.createProgram();gl.attachShader(pr,compile(gl.VERTEX_SHADER,vert));gl.attachShader(pr,compile(gl.FRAGMENT_SHADER,frag));
  gl.linkProgram(pr);gl.useProgram(pr);
  const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  const pl=gl.getAttribLocation(pr,'a_position');gl.enableVertexAttribArray(pl);
  gl.vertexAttribPointer(pl,2,gl.FLOAT,false,0,0);
  const uT=gl.getUniformLocation(pr,'u_time'),uR=gl.getUniformLocation(pr,'u_resolution');
  function size(){const d=Math.min(window.devicePixelRatio,2);canvas.width=innerWidth*d;canvas.height=innerHeight*d;gl.viewport(0,0,canvas.width,canvas.height);}
  size();addEventListener('resize',size);const s=performance.now();
  (function r(){gl.uniform1f(uT,(performance.now()-s)/1000);gl.uniform2f(uR,canvas.width,canvas.height);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);requestAnimationFrame(r);})();
})();
</script>`;

function navHtml() {
  return `<nav class="nav">
  <div class="nav-inner">
    <a href="/" class="logo"><span class="dot"></span><span>HourSpend</span></a>
    <div class="nav-actions">
      <a href="/buying">All items</a>
      <a href="https://apps.apple.com/us/app/budget-tracker-money-time/id6758535957" class="cta-pill">Get the App</a>
    </div>
  </div>
</nav>`;
}

function footerHtml() {
  return `<footer>
  <div class="footer-inner">
    <div class="footer-logo"><span class="dot"></span>HourSpend</div>
    <div class="footer-links">
      <a href="/">Home</a>
      <a href="/buying">All items</a>
      <a href="https://apps.apple.com/us/app/budget-tracker-money-time/id6758535957">iOS App</a>
      <a href="https://violencia19.github.io/app-legal/vantag/privacy-en.html">Privacy</a>
    </div>
    <div class="footer-credit">© HourSpend · Money is just time, exchanged.</div>
  </div>
</footer>`;
}

// ============ INDIVIDUAL ITEM PAGE ============
function generatePage(item) {
  const rows = INCOME_BRACKETS.map(b => {
    const hours = item.price / b.hourly;
    return `
      <tr>
        <td><span class="tier">${escHtml(b.label)}</span><span class="sal">${escHtml(b.salary)}</span></td>
        <td><span class="hrs">${formatHours(hours)}</span></td>
      </tr>`;
  }).join('');

  const title = `${item.name} = how many hours of work? | HourSpend`;
  const desc = `${item.name} costs $${item.price.toLocaleString()}. See exactly how many hours of work it really costs — at every income level. Free calculator.`;
  const jsonLd = `<script type="application/ld+json">
{"@context":"https://schema.org","@type":"QAPage","mainEntity":{"@type":"Question","name":"How many hours of work does it take to afford a ${item.name.replace(/"/g,'\\"')}?","acceptedAnswer":{"@type":"Answer","text":"A ${item.name.replace(/"/g,'\\"')} costs $${item.price.toLocaleString()}. At a $25/hour wage, that's ${formatHours(item.price/25)} of work."}}}
</script>`;

  const related = ITEMS
    .filter(i => i.category === item.category && i.slug !== item.slug)
    .slice(0, 6);

  return sharedHead(title, desc, `/buying/${item.slug}`, jsonLd) + `
</head>
<body>
<div class="mesh-bg"><canvas id="shader-canvas"></canvas></div>
<div class="grain"></div>

<div class="wrap">
${navHtml()}

<style>
.detail-hero {
  padding: 140px 28px 60px;
  max-width: 1280px; margin: 0 auto;
  display: grid; grid-template-columns: 1.1fr 1fr;
  gap: 60px; align-items: center;
}
@media (max-width: 900px) { .detail-hero { grid-template-columns: 1fr; padding-top: 120px; gap: 40px; } }
.breadcrumb { font-family: var(--mono); font-size: 11px; color: var(--text-dim); letter-spacing: 1px; text-transform: uppercase; margin-bottom: 28px; }
.breadcrumb a { color: var(--text-muted); text-decoration: none; }
.breadcrumb a:hover { color: var(--gold); }
.breadcrumb .sep { margin: 0 10px; opacity: 0.5; }
.detail-h1 {
  font-size: clamp(40px, 6.5vw, 86px);
  line-height: 0.95; letter-spacing: -3px;
  font-weight: 800; margin-bottom: 24px;
}
.detail-h1 .item {
  font-family: var(--editorial); font-style: italic; font-weight: 700;
  background: linear-gradient(135deg, var(--gold-soft) 0%, var(--gold) 50%, var(--gold-deep) 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text; letter-spacing: -2px;
}
.price-line { font-family: var(--mono); font-size: 18px; color: var(--text-muted); margin-bottom: 40px; }
.price-line .amt { color: var(--text); font-weight: 500; font-variant-numeric: tabular-nums; }
.headline-card {
  padding: 32px 28px;
  background: linear-gradient(135deg, rgba(232,200,110,0.1), rgba(108,63,160,0.08));
  border: 1px solid rgba(232,200,110,0.25);
  border-radius: 24px;
  margin-bottom: 32px;
  position: relative; overflow: hidden;
}
.headline-card::after {
  content: ''; position: absolute; top: 0; right: -10%; width: 300px; height: 300px;
  background: radial-gradient(circle, rgba(232,200,110,0.15), transparent 70%);
  pointer-events: none;
}
.headline-card .k { font-family: var(--mono); font-size: 10px; letter-spacing: 2px; color: var(--gold); text-transform: uppercase; font-weight: 700; margin-bottom: 10px; }
.headline-card .v {
  font-size: clamp(44px, 6vw, 68px); font-weight: 900; letter-spacing: -2.5px;
  background: linear-gradient(135deg, var(--gold-soft), var(--gold));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  font-family: var(--mono); font-variant-numeric: tabular-nums;
  line-height: 1;
}
.headline-card .sub { color: var(--text-muted); font-size: 13px; margin-top: 8px; font-family: var(--editorial); font-style: italic; }

.hero-visual {
  position: relative; aspect-ratio: 1/1; border-radius: 28px; overflow: hidden;
  background-size: cover; background-position: center;
  border: 1px solid var(--line);
  box-shadow: 0 40px 100px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1);
}
.hero-visual::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(180deg, transparent 45%, rgba(10,7,16,0.55) 100%);
  pointer-events: none;
}

.detail-section { max-width: 1100px; margin: 80px auto 0; padding: 0 28px; }
.section-head { text-align: center; margin-bottom: 40px; }
.section-head h2 {
  font-size: clamp(32px, 5vw, 56px); line-height: 1.02; letter-spacing: -2px;
  font-weight: 800; margin: 14px 0 12px;
}
.section-head h2 .italic { font-family: var(--editorial); font-style: italic; font-weight: 700; color: var(--gold-soft); }
.section-head p { color: var(--text-muted); font-size: 16px; }

.income-table {
  background: linear-gradient(180deg, rgba(21,16,32,0.85), rgba(15,10,24,0.85));
  backdrop-filter: blur(20px);
  border: 1px solid var(--line);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 30px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05);
}
.income-table table { width: 100%; border-collapse: collapse; }
.income-table th { text-align: left; padding: 20px 28px; background: rgba(232,200,110,0.05); color: var(--gold); font-family: var(--mono); font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; font-weight: 700; border-bottom: 1px solid var(--line); }
.income-table td { padding: 24px 28px; border-bottom: 1px solid rgba(255,255,255,0.04); vertical-align: middle; }
.income-table tr:last-child td { border-bottom: none; }
.income-table .tier { display: block; color: var(--text); font-weight: 600; font-size: 17px; margin-bottom: 4px; }
.income-table .sal { display: block; color: var(--text-dim); font-family: var(--mono); font-size: 12px; letter-spacing: 0.3px; }
.income-table .hrs {
  font-family: var(--editorial); font-style: italic; font-weight: 700;
  font-size: clamp(22px, 2.8vw, 32px);
  background: linear-gradient(135deg, var(--gold-soft), var(--gold));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  letter-spacing: -0.5px;
}
.income-table tr:hover td { background: rgba(255,255,255,0.02); }

.cta-card {
  margin-top: 80px;
  background: linear-gradient(135deg, rgba(232,200,110,0.08), rgba(108,63,160,0.1));
  backdrop-filter: blur(30px);
  border: 1px solid rgba(232,200,110,0.25);
  border-radius: 32px;
  padding: 60px 48px;
  text-align: center;
  position: relative; overflow: hidden;
  box-shadow: 0 30px 80px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08);
}
.cta-card::before {
  content: ''; position: absolute; top: -30%; right: -10%; width: 500px; height: 500px;
  background: radial-gradient(circle, rgba(232,200,110,0.15), transparent 70%);
  pointer-events: none;
}
.cta-card h2 {
  font-size: clamp(28px, 4vw, 44px); line-height: 1.05; letter-spacing: -1.5px;
  font-weight: 800; margin-bottom: 14px; position: relative; z-index: 1;
}
.cta-card h2 .italic { font-family: var(--editorial); font-style: italic; color: var(--gold-soft); }
.cta-card p { color: var(--text-muted); font-size: 17px; margin-bottom: 32px; max-width: 540px; margin-left: auto; margin-right: auto; line-height: 1.5; position: relative; z-index: 1; }
.cta-card .appstore-badge {
  display: inline-flex; align-items: center; gap: 14px;
  padding: 16px 32px;
  background: var(--text); color: var(--bg);
  border-radius: 100px; text-decoration: none;
  font-weight: 700; font-size: 15px;
  transition: transform 0.25s, box-shadow 0.25s;
  position: relative; z-index: 1;
}
.cta-card .appstore-badge:hover { transform: translateY(-2px); box-shadow: 0 20px 40px rgba(0,0,0,0.3); }

.related-section { margin-top: 80px; }
.related-section h3 { font-size: 14px; font-family: var(--mono); color: var(--text-dim); letter-spacing: 1.5px; text-transform: uppercase; font-weight: 700; margin-bottom: 24px; text-align: center; }
.related-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 14px; }
.related-card {
  background: linear-gradient(180deg, rgba(21,16,32,0.9), rgba(15,10,24,0.9));
  border: 1px solid var(--line);
  border-radius: 18px;
  text-decoration: none; color: var(--text);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.16,1,0.3,1);
}
.related-card:hover { border-color: rgba(232,200,110,0.35); transform: translateY(-3px); }
.related-card .thumb { width: 100%; aspect-ratio: 16/10; background-size: cover; background-position: center; border-bottom: 1px solid var(--line); transition: transform 0.5s; }
.related-card:hover .thumb { transform: scale(1.05); }
.related-card .body { padding: 14px 16px; }
.related-card .name { font-size: 13px; font-weight: 600; margin-bottom: 6px; display: block; }
.related-card .price-row { display: flex; justify-content: space-between; align-items: baseline; }
.related-card .price { font-family: var(--mono); font-size: 11px; color: var(--text-dim); }
.related-card .hours { font-family: var(--editorial); font-style: italic; font-size: 16px; font-weight: 700; color: var(--gold); letter-spacing: -0.3px; }
</style>

<section class="detail-hero">
  <div>
    <div class="breadcrumb">
      <a href="/">HourSpend</a><span class="sep">·</span><a href="/buying">Buying</a><span class="sep">·</span>${escHtml(item.category)}
    </div>
    <h1 class="detail-h1">How many hours<br>for a <span class="item">${escHtml(item.name)}</span>?</h1>
    <p class="price-line">Price <span class="amt">$${item.price.toLocaleString()}</span> · priced in your life</p>

    <div class="headline-card">
      <div class="k">At $25/hr median wage</div>
      <div class="v">${formatHours(item.price / 25)}</div>
      <div class="sub">That's what a ${escHtml(item.name)} really costs.</div>
    </div>
  </div>

  <div class="hero-visual" style="background-image:url('${item.image}&h=1200')"></div>
</section>

<section class="detail-section">
  <div class="section-head">
    <div class="eyebrow">Priced at every income level</div>
    <h2>What it costs <span class="italic">you</span>.</h2>
    <p>Same item. Very different hours depending on what you earn.</p>
  </div>

  <div class="income-table">
    <table>
      <thead><tr><th>Income level</th><th>Hours of work</th></tr></thead>
      <tbody>${rows}
      </tbody>
    </table>
  </div>

  <div class="cta-card">
    <div class="eyebrow">Your wallet in minutes</div>
    <h2>See every expense<br>in <span class="italic">hours</span> of life.</h2>
    <p>HourSpend tracks your real spending in hours you'd have to work — not just dollars. Free on iOS.</p>
    <a href="https://apps.apple.com/us/app/budget-tracker-money-time/id6758535957" class="appstore-badge">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
      Download on App Store
    </a>
  </div>

  <div class="related-section">
    <h3>More in ${escHtml(item.category)}</h3>
    <div class="related-grid">
      ${related.map(r => `<a href="/buying/${r.slug}" class="related-card">
        <div class="thumb" style="background-image:url('${r.image}&w=600')"></div>
        <div class="body">
          <span class="name">${escHtml(r.name)}</span>
          <div class="price-row"><span class="price">$${r.price.toLocaleString()}</span><span class="hours">${cardHours(r.price)}</span></div>
        </div>
      </a>`).join('')}
    </div>
  </div>
</section>

${footerHtml()}

</div><!-- /wrap -->
${WEBGL_SHADER}
</body>
</html>`;
}

// ============ INDEX / CATALOG PAGE ============
function generateIndex() {
  const byCategory = {};
  ITEMS.forEach(item => {
    if (!byCategory[item.category]) byCategory[item.category] = [];
    byCategory[item.category].push(item);
  });

  const categoryOrder = ['Electronics', 'Vehicles', 'Housing', 'Food', 'Subscriptions', 'Travel', 'Lifestyle', 'Personal', 'Transport'];
  const sortedCats = categoryOrder.filter(c => byCategory[c]).concat(Object.keys(byCategory).filter(c => !categoryOrder.includes(c)));

  const categories = sortedCats.map(cat => `
    <section class="cat-section">
      <div class="cat-head">
        <div class="eyebrow">${escHtml(cat)}</div>
        <h2 class="cat-title">${escHtml(cat)} <span class="count">${byCategory[cat].length}</span></h2>
      </div>
      <div class="cat-grid">
        ${byCategory[cat].map(item => `
          <a href="/buying/${item.slug}" class="cat-card">
            <div class="thumb" style="background-image:url('${item.image}&w=700')"></div>
            <div class="body">
              <span class="name">${escHtml(item.name)}</span>
              <div class="price-row">
                <span class="price">$${item.price.toLocaleString()}</span>
                <span class="hours">${cardHours(item.price)}</span>
              </div>
            </div>
          </a>`).join('')}
      </div>
    </section>`).join('');

  const title = `${ITEMS.length}+ purchases priced in hours of your life | HourSpend`;
  const desc = `Free calculator: see how many hours of work ${ITEMS.length}+ common purchases really cost you. iPhone, rent, coffee, vacations, cars — priced in your life.`;

  return sharedHead(title, desc, '/buying') + `
</head>
<body>
<div class="mesh-bg"><canvas id="shader-canvas"></canvas></div>
<div class="grain"></div>

<div class="wrap">
${navHtml()}

<style>
.index-hero {
  padding: 160px 28px 60px;
  max-width: 1100px; margin: 0 auto; text-align: center;
}
.index-hero .hero-badge {
  display: inline-flex; align-items: center; gap: 10px;
  padding: 7px 14px 7px 9px;
  border-radius: 100px;
  background: rgba(232,200,110,0.06);
  border: 1px solid rgba(232,200,110,0.22);
  font-size: 11px; color: var(--gold-soft);
  font-weight: 600; letter-spacing: 0.4px;
  margin-bottom: 28px;
  font-family: var(--mono); text-transform: uppercase;
}
.index-hero .hero-badge .pulse {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--gold); box-shadow: 0 0 8px var(--gold);
}
.index-hero h1 {
  font-size: clamp(48px, 8vw, 96px);
  line-height: 0.95; letter-spacing: -3px;
  font-weight: 800; margin-bottom: 24px;
}
.index-hero h1 .italic {
  font-family: var(--editorial); font-style: italic; font-weight: 700;
  background: linear-gradient(135deg, var(--gold-soft), var(--gold));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  letter-spacing: -2px;
}
.index-hero .sub {
  color: var(--text-muted); font-size: clamp(17px, 2vw, 21px);
  line-height: 1.5; max-width: 640px; margin: 0 auto 32px;
}
.index-hero .stats { display: inline-flex; gap: 48px; margin-top: 16px; flex-wrap: wrap; justify-content: center; }
.index-hero .stat-num { font-family: var(--mono); font-size: 24px; font-weight: 500; color: var(--text); font-variant-numeric: tabular-nums; letter-spacing: -1px; display: block; }
.index-hero .stat-label { font-size: 10px; color: var(--text-dim); letter-spacing: 1.5px; text-transform: uppercase; font-weight: 600; font-family: var(--mono); }

.cat-section { max-width: 1280px; margin: 0 auto; padding: 60px 28px; }
.cat-head { margin-bottom: 32px; display: flex; flex-direction: column; gap: 4px; }
.cat-title {
  font-size: clamp(30px, 4vw, 48px);
  line-height: 1; letter-spacing: -1.5px;
  font-weight: 800;
  display: flex; align-items: baseline; gap: 14px;
}
.cat-title .count {
  font-family: var(--mono); font-size: 16px; color: var(--text-dim);
  font-weight: 500; letter-spacing: -0.5px;
}
.cat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 14px;
}
.cat-card {
  background: linear-gradient(180deg, rgba(21,16,32,0.9), rgba(15,10,24,0.9));
  backdrop-filter: blur(20px);
  border: 1px solid var(--line);
  border-radius: 20px;
  overflow: hidden;
  text-decoration: none; color: var(--text);
  transition: all 0.4s cubic-bezier(0.16,1,0.3,1);
  display: flex; flex-direction: column;
}
.cat-card:hover { border-color: rgba(232,200,110,0.35); transform: translateY(-5px); box-shadow: 0 20px 50px rgba(0,0,0,0.4); }
.cat-card .thumb {
  width: 100%; aspect-ratio: 16/10;
  background-size: cover; background-position: center;
  border-bottom: 1px solid var(--line);
  transition: transform 0.6s cubic-bezier(0.16,1,0.3,1);
}
.cat-card:hover .thumb { transform: scale(1.07); }
.cat-card .body { padding: 18px 20px; display: flex; flex-direction: column; gap: 8px; flex: 1; }
.cat-card .name { font-size: 15px; font-weight: 600; color: var(--text); line-height: 1.25; }
.cat-card .price-row { display: flex; justify-content: space-between; align-items: baseline; margin-top: auto; }
.cat-card .price { font-family: var(--mono); font-size: 12px; color: var(--text-dim); font-variant-numeric: tabular-nums; }
.cat-card .hours {
  font-family: var(--editorial); font-style: italic; font-size: 22px;
  font-weight: 700; letter-spacing: -0.5px;
  background: linear-gradient(135deg, var(--gold-soft), var(--gold));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}

.final-cta {
  max-width: 1100px; margin: 80px auto; padding: 60px 32px;
  background: linear-gradient(135deg, rgba(232,200,110,0.05), rgba(108,63,160,0.08));
  backdrop-filter: blur(30px);
  border: 1px solid rgba(232,200,110,0.2);
  border-radius: 32px;
  text-align: center;
  position: relative; overflow: hidden;
}
.final-cta::before {
  content: ''; position: absolute; top: -30%; right: -10%; width: 500px; height: 500px;
  background: radial-gradient(circle, rgba(232,200,110,0.15), transparent 70%);
  pointer-events: none;
}
.final-cta h2 {
  font-size: clamp(30px, 4vw, 48px); line-height: 1.05; letter-spacing: -1.5px;
  font-weight: 800; margin-bottom: 14px; position: relative; z-index: 1;
}
.final-cta h2 .italic { font-family: var(--editorial); font-style: italic; color: var(--gold-soft); }
.final-cta p { color: var(--text-muted); font-size: 17px; margin-bottom: 32px; position: relative; z-index: 1; }
.final-cta a {
  display: inline-flex; align-items: center; gap: 14px;
  padding: 16px 32px;
  background: var(--text); color: var(--bg);
  border-radius: 100px; text-decoration: none;
  font-weight: 700; font-size: 15px;
  transition: transform 0.25s;
  position: relative; z-index: 1;
}
.final-cta a:hover { transform: translateY(-2px); }
</style>

<section class="index-hero">
  <div class="hero-badge"><span class="pulse"></span><span>Live · 52+ items</span></div>
  <h1>${ITEMS.length}+ purchases,<br>priced in <span class="italic">hours</span>.</h1>
  <p class="sub">See what every expense really costs — in minutes and hours of work, not dollars. Pick any item below.</p>
  <div class="stats">
    <div><span class="stat-num">${ITEMS.length}</span><span class="stat-label">Items priced</span></div>
    <div><span class="stat-num">${Object.keys(byCategory).length}</span><span class="stat-label">Categories</span></div>
    <div><span class="stat-num">$25/hr</span><span class="stat-label">Default wage</span></div>
  </div>
</section>

${categories}

<section>
  <div class="final-cta">
    <div class="eyebrow">Price every expense</div>
    <h2>Track your money<br>in <span class="italic">hours</span>.</h2>
    <p>Free on iOS. Add expenses by voice, text, or receipt scan — see your monthly burn in work-hours.</p>
    <a href="https://apps.apple.com/us/app/budget-tracker-money-time/id6758535957">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
      Download on App Store
    </a>
  </div>
</section>

${footerHtml()}

</div><!-- /wrap -->
${WEBGL_SHADER}
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

fs.writeFileSync(path.join(__dirname, 'public', 'robots.txt'),
  'User-agent: *\nAllow: /\n\nSitemap: https://hourspend.one/sitemap.xml\n');

console.log(`✓ Generated ${ITEMS.length} programmatic SEO pages in /public/buying/`);
console.log(`✓ Sitemap with ${ITEMS.length + 2} URLs`);
