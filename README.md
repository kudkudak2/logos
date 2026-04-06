# Logos

This project builds as a static site that can be deployed directly to Cloudflare Pages.

## Local build

```sh
npm run build
```

The production export is written to `dist/`.

What the build does:
- bundles the inline module from `index.html` into `dist/assets/main.js`
- copies `The_Clockmaker_s_Proof.mp3` into `dist/assets/`
- rewrites `index.html` for production so it no longer depends on local `node_modules`

## Local preview

```sh
npm run build
python3 -m http.server 5173 -d dist
```

Then open `http://localhost:5173`.

## Cloudflare Pages

This repository now includes `wrangler.toml` with:

```toml
pages_build_output_dir = "dist"
```

### Deploy with Wrangler

```sh
npm run deploy:cloudflare
```

That runs the build and then deploys `dist/` with:

```sh
npx wrangler pages deploy dist
```

### Deploy from the Cloudflare dashboard

Use these settings:

- Framework preset: `None`
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: repository root

## Output

- `dist/index.html`
- `dist/404.html`
- `dist/assets/main.js`
- `dist/assets/main.js.map`
- `dist/assets/The_Clockmaker_s_Proof.mp3`
- `dist/_headers`
