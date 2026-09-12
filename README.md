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

The browser calls the Sites-hosted `/api/airtable` endpoint; the API credential is read only by `worker/index.js` from the `AIRTABLE_TOKEN` runtime secret. Never place an Airtable token in `site.js`, HTML, or any committed file.

The Sites deployment calls that endpoint on the same origin. GitHub Pages calls the same secure endpoint cross-origin, with access limited to the repository's Pages origin. Responses are not cached, so a refresh loads the latest rows marked `Show on Site`.

## Local preview

```sh
npm install
npm run dev
```

The local static preview uses built-in fallback content when the secure API route is unavailable.
