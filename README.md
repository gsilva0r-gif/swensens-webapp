# Swensen's website

Responsive multi-page website for Swensen's at Hyde & Union. Content and imagery are managed in the **Swensen's Website** Airtable base.

## Editing content

- Flavor photos: `Flavors` → `Photo` (or `Photo URL` as a fallback)
- Promotions: `Slideshow` → desktop/mobile image fields
- Menu feature: `Menu` → `Photo` (or `Photo URL`)
- Merchandise: `Gifts & Merch` → product and lifestyle photo fields
- Logo: `Website Branding`
- Guest video covers: `Customer Videos`
- Reusable page photos, decorative frames, and seasonal backdrops: `Website Images`

An uploaded Airtable attachment always takes priority over its URL fallback.

## Secure Airtable connection

The browser calls `/api/airtable`; the API credential is read only by `worker/index.js` from the `AIRTABLE_TOKEN` runtime secret. Never place an Airtable token in `site.js`, HTML, or any committed file.

GitHub Pages can display the built-in fallback content, but live Airtable updates require a server-capable deployment with `AIRTABLE_TOKEN` configured.

## Local preview

```sh
npm install
npm run dev
```

The local static preview uses built-in fallback content when the secure API route is unavailable.
