# Brand Assets — where to drop your files

Everything in this `public/assets/` folder is served at the site root under
`/assets/…`. To add your real graphics, just drop files here with the **exact
names below** and they'll appear automatically — no code changes needed.

> The site already ships with tasteful placeholders, so it looks complete right
> now. Replacing these just makes it *yours*.

| File to add | Used for | Recommended size | Notes |
|---|---|---|---|
| `logo.svg` | Header + footer logo | vector (SVG) | **Best option.** Overwrite the placeholder with your real vector logo. |
| `logo.png` | Fallback logo | ~600×190, transparent PNG | Only needed if you don't have an SVG. If you use this instead of SVG, change `/assets/logo.svg` → `/assets/logo.png` in `src/components/Header.astro` and `src/components/Footer.astro`. |
| `hero.jpg` | Big hero image (home) | 1000×1250 (4:5), <300 KB | A photo of Sara, an IV session, or a bright wellness shot. Until added, an elegant branded placeholder shows. |
| `sara.jpg` | "About Sara" portrait | 900×1125 (4:5), <250 KB | A friendly professional photo of Sara. |
| `sara-ivsalt-bio.png` | Blog author photo (Sara) | 200×200, square | Shown on blog posts as the author avatar. Until added, a brand "S" circle shows instead. |
| `og-image.jpg` | Social share preview | 1200×630 | **Already generated** (branded logo card) and lives at `public/og-image.jpg` (site root, not this folder). Replace that file to change the link-preview image. |
| `apple-touch-icon.png` | iOS home-screen icon | 180×180 PNG | Optional. The logo on a solid navy (#0a0e1c) background works well. |

## Tips for photos
- **Orientation:** hero and Sara photos look best **portrait** (taller than wide).
- **Compression:** run images through [squoosh.app](https://squoosh.app) to keep them small and fast. Aim for well under 300 KB.
- **Faces:** keep the subject slightly off-center / upper-third — the bottom of the hero fades into a dark gradient where text sits.

## How to add them (GitHub, no terminal needed)
1. Go to your repo → `public/assets/` folder → **Add file → Upload files**.
2. Drag in your images named exactly as above.
3. Commit. Netlify redeploys automatically in ~1 minute.

The favicon (browser-tab icon) is `public/favicon.svg` — replace it if you want a
custom tab icon.
