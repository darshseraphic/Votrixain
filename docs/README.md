# Votrixain website

A responsive, static landing page for the Votrixain Chrome extension. Its light and dark themes use the same neutral ink-and-paper palette as the browser extension, with responsive layouts for phones, tablets and desktop screens.

## Install into the Votrixain repository

Extract the website files into the repository root, alongside `manifest.json` and the existing `icons/` directory. The page references the website logo at `assets/logo.svg`.

The included `assets/logo.svg` is a small local bridge to the exact source logo at `../icons/logo.svg`, so the website uses the extension's logo rather than a redesigned mark. To make `assets/logo.svg` a physical byte-for-byte copy of the source file, run this command from the repository root:

```sh
sh prepare-assets.sh
```

The script copies `icons/logo.svg` into `assets/logo.svg`. It does not generate or alter the artwork.

## Preview locally

After extracting the files into the repository root, open `index.html` in a browser. No build step or package installation is required.

The public source repository is configured in `config.js`:

`https://github.com/darshseraphic/Votrixain`

## Included files

- `index.html` — page structure and content
- `styles.css` — responsive layout, shared extension color tokens, theme states and motion preferences
- `script.js` — theme persistence, accessible mobile navigation, repository links and copy interaction
- `config.js` — public repository URL
- `assets/logo.svg` — local bridge to the existing `icons/logo.svg` source asset
- `prepare-assets.sh` — optional exact-copy helper for `assets/logo.svg`

## Design attribution

The design direction and UI craft checklist were informed by **Unslop** by Damir Sokolovsky, licensed under CC BY 4.0: https://www.heydamir.design/unslop

## Themes

The website mirrors the extension palette. Light mode uses a `#F1F1F1` page, white surfaces, `#171717` ink and neutral gray borders. Dark mode uses a `#101010` page, `#1B1B1B` surfaces, `#F4F4F4` ink and neutral gray borders. Primary actions use the same light/dark button contrast as the extension. There is no colored accent.
