# tylermfgco.com

The Tyler Manufacturing website: plain HTML, CSS and a little JavaScript. No framework. The files in this folder are the whole site, so they can be hosted on GitHub Pages or moved to any other static host.

- Main site (job shop): `/`, `/capabilities/`, `/quality/`, `/about/`, `/contact/`, `/privacy/`
- Shop: `/shop/`, one folder per product (`/shop/<slug>/`), `/shop/shipping/`, `/shop/returns/`, `/shop/thank-you/`
- Not linked anywhere: `/logo-options.html` (pick a logo) and `404.html`

Planning docs, page specs and brand notes are in `docs/`. `CLAUDE.md` holds the rules for Claude Code.

## Preview it on your computer

```
powershell -ExecutionPolicy Bypass -File serve.ps1
```

Then open http://localhost:5180/ in a browser. Press Ctrl+C in that window to stop. (Opening the HTML files directly by double-clicking won't look right: links and styles start at the site root, so they need the little server.)

## The build script (run it after changing content)

Some parts of the pages come from data files: the header and footer, the shop grid, the product pages, the shop teaser on the home page, the shipping rate and cut-off text, the quote form key, and the logo.

After you change anything in `content/`, `partials/` or `templates/`, run:

```
powershell -ExecutionPolicy Bypass -File build.ps1
```

It rewrites the generated parts of the pages in place and prints a "Still to do" list (ASK JOSH items, missing payment links, missing photos, the form key). Commit the changed files; the live site serves them as they are, with no build step on GitHub.

How it works: each page has marked regions like `<!-- BUILD:footer -->` ... `<!-- /BUILD:footer -->`. The build replaces what's between the markers. Edit everything outside the markers by hand as normal; don't edit inside them (your change would be overwritten).

## Add a shop product

1. Copy `content/products/xl-fire-grate.json` to a new file, e.g. `content/products/bottle-opener.json`, and fill it in:
   - `slug`: the web address, lowercase with dashes (`bottle-opener` → `/shop/bottle-opener/`)
   - `name`, `price`, `shortDescription`, `description`, `specs` (any labels you like)
   - `fitsLine` and `trademarkNote`: only for parts that fit another company's product; otherwise delete them or leave them `""`
   - `photos`: see "Product photos" below
   - `paymentLink`: the Stripe Payment Link (`https://buy.stripe.com/...`). Leave `""` and the button shows "Coming soon".
   - `availability`: `in_stock`, `out_of_stock` (button shows "Sold out") or `preorder`
   - `active`: `true` to show it, `false` to hide it
2. Add the file name to `content/products/index.json`, e.g. `{ "products": ["xl-fire-grate.json", "bottle-opener.json"] }`. The order there is the order in the shop; the first active product is the one featured on the home page.
3. Run `build.ps1`. It creates `shop/bottle-opener/index.html` and adds the product to the shop grid.

To hide a product, set `"active": false` and run the build. Its page is removed and it drops out of the grid; the JSON file stays so you can turn it back on.

Each product page includes Product structured data (price, shipping, no-returns policy) for Google Search and Shopping.

## Free-shipping promo banner

In `content/site.json`:

```json
"promoBanner": { "enabled": true, "text": "Free shipping on all shop orders this week." }
```

Run `build.ps1`. The banner appears across the top of every shop page, and the shipping line on product pages shows the promo text. Set `enabled` back to `false` and run the build again when the promo ends. Remember the Stripe side too (switch the Payment Link to the $0 shipping rate; see `docs/stripe-setup.md`).

## Swap a placeholder photo

Put your photos in `assets/photos/`. Use JPG or WebP, about 1600 px on the long side for large slots and 1000 px for tiles and thumbnails.

**Pages written by hand** (home, capabilities, about). Search the page for `PHOTO:`. Each placeholder looks like this:

```html
<!-- PHOTO: Laser cutting head over a sheet -->
<div class="ph ph-3x2" role="img" aria-label="Photo placeholder: Laser cutting head over a sheet"><span>PHOTO: Laser cutting head over a sheet</span></div>
```

Replace both lines with:

```html
<img class="photo" src="/assets/photos/laser-head.jpg" alt="Laser cutting head over a steel sheet" width="1600" height="1067" loading="lazy">
```

Write `alt` as a short description of what's actually in the photo. Set `width` and `height` to the photo's real size (it stops the page jumping while it loads).

**The home page hero** is a background image instead. Add `style="background-image: url('/assets/photos/hero.jpg')"` to `<section class="hero">` and delete the `<div class="ph-hero-label" ...>` line under it. The page darkens the photo so the headline stays readable.

**Product photos** live in the product JSON, not the page:

```json
{ "file": "fire-grate-top.jpg", "alt": "Stainless fire grate on a workbench, top view", "placeholder": false }
```

`file` is the name of the photo in `assets/photos/`. The first photo is the main one (also used in the shop grid and on Google). Run `build.ps1` afterwards.

## Logo

The logo is option 1, the riveted nameplate: `assets/logo/option-1-nameplate.svg`. The build copies it into every page header, so after editing the file, run `build.ps1`. The favicon (`assets/logo/favicon.svg`) is drawn from it. The two options that weren't picked are kept in `assets/logo/` and shown on http://localhost:5180/logo-options.html.

The logo text uses the Oswald font. Before the logo goes on anything printed, have the lettering converted to outlines (any vector editor can do it) so it looks the same everywhere.

## Quote form

The form sends through Web3Forms, which emails each request to sales@tylermfgco.com. Put your Web3Forms access key in `content/site.json` → `web3formsAccessKey` and run the build. Until then the form says it isn't connected yet and points people to the email address.

Each request gets a reference number like `TM-261028-4F7Q`. It's in the email subject and on the thank-you page, and customers are asked to put it in the subject when they email drawings.

## Going live

See `docs/github-pages-dns.md`. The `CNAME` file already holds `tylermfgco.com`; `.nojekyll` tells GitHub Pages to serve the files as they are.

## Files

| Path | What it is |
|---|---|
| `content/site.json` | Site-wide settings: email, shipping rate, cut-off text, promo banner, form key |
| `content/products/` | One JSON file per product, plus `index.json` listing them |
| `partials/` | Shared head, header and footer (main site and shop versions) |
| `templates/product.html` | Layout for product pages |
| `assets/css/style.css` | All styles |
| `assets/js/quote.js`, `thanks.js` | Quote form and quote thank-you page |
| `assets/logo/` | Logo options and favicon |
| `assets/photos/` | Your photos |
| `build.ps1` | Fills in the generated parts of the pages |
| `serve.ps1` | Local preview server |
