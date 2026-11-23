# Ultimate Video Editing Bundle (2026) Pro Toolkit — Landing Page

A static, mobile-first landing page. No framework and no build step.

```
index.html   page markup (no links/prices/images hardcoded)
terms.html, privacy-policy.html, refund-policy.html,
delivery-policy.html, disclaimer.html, contact.html   legal pages
styles.css   all styling
script.js    reads config.js and wires everything up
config.js    ← the ONLY file you edit
vercel.json  clean URLs + cache headers
```

## 1. Fill in `config.js`

Open `config.js` and paste your values between the quotes. Anything left as `""` is hidden. Empty image slots show a dashed placeholder instead.

| Key | What it does |
|---|---|
| `BUY_LINK` | Your SuperProfile checkout URL. **Every** Buy button (hero, preview, final CTA, mobile sticky bar) uses it. If it's empty, buttons do nothing and the console shows a warning. |
| `BRAND_NAME` | Shown in the footer, copyright line and legal pages. |
| `CONTACT_EMAIL` | Support email. Shown in the footer, on the Contact page and inside every policy. |
| `TERMS_LINK`, `PRIVACY_LINK`, `REFUND_LINK`, `DELIVERY_LINK`, `DISCLAIMER_LINK`, `CONTACT_LINK` | Footer legal links. They already point to the built-in pages (`/terms`, `/privacy-policy`, `/refund-policy`, `/delivery-policy`, `/disclaimer`, `/contact`). Change one only if you host that page elsewhere; set it to `""` to hide it. |
| `LEGAL_LAST_UPDATED` | The "Last updated" date shown on every legal page. |
| `META_PIXEL_ID` | Optional. When set, the page loads the Meta Pixel and fires `PageView`, `ViewContent` (once, when "What's Inside" is seen) and `InitiateCheckout` (on every Buy click, value from `PRICE`, currency INR). |
| `PRICE` / `MRP` | Fill in every price on the page. |
| `IMAGES.*` | Full image URLs (e.g. `https://…/hero.webp`), or paths to files you add to the repo, e.g. `/images/hero.webp`. |
| `PREVIEW_VIDEO_URL` | Optional. Takes a YouTube link (`youtube.com/embed/ID`, `watch?v=ID` or `youtu.be/ID`) or a direct `.mp4` URL. If it's empty, the whole "See It in Action" section is hidden. YouTube videos use a click-to-load preview, so the page stays fast. |

When you paste a link and redeploy, the page picks it up automatically.

### Legal pages
The legal pages pick up your brand name and support email from `config.js` automatically. They are a sensible starting template for a digital product sold in India. **Read them once and adjust anything that doesn't match how you run your business** (especially the refund conditions and time limits in `refund-policy.html`). This is not legal advice.

## 2. Image sizes

| Slot | Size (px) | Ratio | Notes |
|---|---|---|---|
| `HERO_MOCKUP` | 1080 × 1350 | 4:5 | Main product box. Loads first (not lazy). |
| `AUTO_PROJECTS`, `TRANSITIONS`, `LUTS`, `OVERLAYS`, `SOUND_EFFECTS`, `BEAUTY_BOX`, `FONTS` | 1080 × 810 | 4:3 | Card images (lazy-loaded). |
| `OG_IMAGE` | 1200 × 630 | 1.91:1 | The image shown when the link is shared on social. |
| `LOGO` | 512 × 512 | 1:1 | Square; a transparent PNG/SVG works best. |
| `FAVICON` | 512 × 512 (or 48 × 48) | 1:1 | PNG, SVG or ICO. |

Tips for a good Lighthouse score: use **WebP** (or AVIF) and keep the hero under about 200 KB and each card under about 120 KB.

> **Social preview note:** the page adds `OG_IMAGE` to its tags with JavaScript, and Facebook, WhatsApp and X don't run JavaScript when they read a page. To get a reliable share preview, also paste the full OG image URL into the `og:image` and `twitter:image` `content="…"` attributes in `index.html`. Those are the only two places this applies.

## 3. Deploy to Vercel

1. Push this folder to a GitHub repo.
2. Go to [vercel.com/new](https://vercel.com/new), import the repo, set **Framework Preset: Other**, and leave Build Command and Output Directory empty.
3. Click **Deploy**. That's it.
4. To change a link or image later, edit `config.js`, then commit and push. Vercel redeploys automatically.

You can also deploy from the CLI: `npm i -g vercel && vercel --prod` inside the folder.

### Caching (`vercel.json`)
- Images, fonts and video files are cached for 1 year (`immutable`). If you replace an image, give it a **new filename** so visitors see the new one.
- `styles.css` / `script.js` are cached for 1 day, then refreshed in the background.
- `config.js` is always revalidated, so your link and price changes show up right away.

## Local preview

```
python3 -m http.server 8000
# open http://localhost:8000
```
