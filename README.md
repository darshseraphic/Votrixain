# Votrixain — Privacy URL Cleaner

![Votrixain icon](icons/icon128.png)

Votrixain is an experimental Chrome Manifest V3 extension that removes known tracking parameters from pasted URLs and can optionally clean matching top-level navigation URLs on websites the user explicitly authorizes.

> **Project status:** Early open-source prototype (v0.4.4). Contributions, bug reports, and careful testing are welcome. Automatic navigation behavior should be tested in your own Chrome profile before relying on it.

## What it does

- Cleans pasted `http` and `https` links locally in the extension popup.
- Removes all query parameters from Instagram post (`/p/`) and Reel (`/reel/`) URLs while preserving the path and URL fragment.
- Removes recognized tracking parameters from other supported URLs, including `utm_*`, `fbclid`, `gclid`, `igshid`, `cplk`, and `obrf`.
- Preserves query parameters that are not on the tracking list, such as YouTube video IDs and search terms.
- Optionally applies the packaged navigation rules on a site after the user grants that site's host permission.
- Offers System, Light, and Dark themes.

## What it does not do

Votrixain is a URL cleaner, not a complete anti-tracking or ad-blocking tool. It does not block cookies, pixels, browser fingerprinting, server-side tracking, or identifiers embedded in URL paths or fragments. It does not sanitize every URL in page content, network subrequests, the clipboard, or other applications. Automatic cleaning applies to matching top-level navigation requests only.

## Publish this project

See [GITHUB_SETUP.md](GITHUB_SETUP.md) for the suggested public repository name and upload steps.

## Install for development

1. Clone or download this repository.
2. Open `chrome://extensions` in Google Chrome.
3. Enable **Developer mode**.
4. Select **Load unpacked**.
5. Choose the repository folder that contains `manifest.json`.
6. Pin Votrixain from Chrome's Extensions menu.

To update a loaded unpacked extension after changing the code, select **Reload** on its card in `chrome://extensions`.

## Try manual cleaning

Paste this example into the popup and select **Clean link**:

```text
https://www.instagram.com/p/DfWwPedsS2u/?utm_source=ig_web_copy_link&obrf=NTc4MTIwNjQ34Rf==
```

Expected result:

```text
https://www.instagram.com/p/DfWwPedsS2u/
```

Manual cleaning requires no website host permission.

## Enable automatic cleaning for a site

1. Open the website in Chrome.
2. Open the Votrixain popup.
3. Choose **Enable** in the Automatic cleaning section.
4. Review and approve Chrome's permission prompt for that site, if you want automatic cleaning there.

Votrixain does not request access to all websites at installation. The user grants access one host at a time. You can disable automatic cleaning from the popup or revoke the site's permission in Chrome's extension settings.

The packaged Declarative Net Request rules apply only to matching `main_frame` navigation requests. They do not rewrite arbitrary text in the address bar or other applications. The browser still sends the resulting cleaned URL to the destination website when you navigate to it.

## Permissions

| Permission | Why it is used |
| --- | --- |
| `activeTab` | Read the active tab's URL when the popup is open so the user can manage automatic cleaning for that site. |
| `declarativeNetRequestWithHostAccess` | Apply packaged URL-cleaning redirect rules only where the extension has host access. |
| Optional `http://*/*` and `https://*/*` host permissions | Let the user grant or revoke automatic cleaning access for individual sites. These are optional and are not granted at installation. |

## Privacy

- URL parsing and manual cleanup run locally in the browser.
- The extension contains no account system, analytics SDK, remote code, or URL-cleaning backend.
- Theme preference is stored in the extension's local page storage.
- Automatic navigation cleaning requires host access granted by the user for each site.
- The cleaned URL is then navigated to normally, so the destination website receives that URL.

See [PRIVACY.md](PRIVACY.md) for the project's privacy summary. The permission model is defined in [`manifest.json`](manifest.json).

## Development and tests

Requirements: Node.js 18 or later. The test suite uses Node's built-in test runner and has no third-party dependencies.

```bash
npm test
```

Or run it directly:

```bash
node --test tests/*.test.js
```

The GitHub Actions workflow runs the test suite on Node.js 18, 20, and 22 for pushes and pull requests.

## Project structure

```text
.
├── manifest.json          # Chrome extension manifest (MV3)
├── popup.html             # Popup markup
├── popup.css              # Light/dark UI, layout and scrollbar styling
├── popup.js               # Popup behavior, theme and host-permission controls
├── url-cleaner.js         # Local URL parsing and cleaning
├── rules.json             # Static declarative navigation rules
├── icons/                 # Monochrome PNG icons and SVG logo
├── tests/                 # Unit and UI-structure tests
├── PRIVACY.md             # Privacy summary
├── CHANGELOG.md           # Release history
└── DESIGN_CREDITS.md      # Attribution for design guidance
```

## License

The Votrixain source code is released under the [MIT License](LICENSE). The design-guidance attribution in [DESIGN_CREDITS.md](DESIGN_CREDITS.md) is retained separately.
