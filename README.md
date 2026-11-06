# Votrixain — Privacy URL Cleaner

![Votrixain icon](icons/icon128.png)

**Votrixain** is a Chrome Manifest V3 extension for removing recognized tracking parameters from URLs. It provides two distinct ways to clean links:

1. **Manual cleanup in the popup.** The user pastes a link and Votrixain parses it locally in the extension page.
2. **Optional automatic cleanup during navigation.** Chrome's Declarative Net Request (DNR) engine applies the packaged redirect rules to matching top-level navigations on hosts for which the user has granted permission.

The extension preserves unrecognized query parameters on ordinary URLs. Instagram post and Reel URLs, GitHub links, and X/Twitter status links are special cases: their query strings are removed in full. For manually cleaned X/Twitter status links, the empty `?` delimiter is retained to match the requested canonical form.

> **Version in this source:** `0.4.4` (`manifest.json` and `package.json`). The project is early-stage; test automatic navigation behavior in a separate Chrome profile before relying on it.

**Repository:** <https://github.com/darshseraphic/Votrixain>

## Contents

- [Behavior and scope](#behavior-and-scope)
- [Manual URL-cleaning behavior](#manual-url-cleaning-behavior)
- [Automatic navigation-cleaning behavior](#automatic-navigation-cleaning-behavior)
- [Permissions](#permissions)
- [Install in Chrome](#install-in-chrome)
- [Development and tests](#development-and-tests)
- [Complete file and directory reference](#complete-file-and-directory-reference)
- [Privacy and limitations](#privacy-and-limitations)
- [License metadata note](#license-metadata-note)

## Behavior and scope

### What it does

- Accepts complete `http://` and `https://` URLs for manual cleanup.
- Removes query keys beginning with `utm_` (case-insensitively) and the explicitly listed tracking keys described below.
- Removes every query parameter from Instagram post (`/p/`) and Reel (`/reel/`) links, all GitHub links, and X/Twitter status links.
- Preserves ordinary query parameters that are not on the tracking list, such as YouTube video IDs, search terms, and pagination values.
- Preserves the URL fragment when query parameters are removed.
- Lets the user enable or disable automatic cleaning one website host at a time.
- Provides System, Light, and Dark popup themes.

### What it does not do

Votrixain is a URL-parameter cleaner, not a general ad blocker or complete anti-tracking tool. It does not remove cookies, tracking pixels, browser fingerprints, server-side tracking, or identifiers embedded in URL paths or fragments. It does not rewrite arbitrary links in page content, clean clipboard contents automatically, or process every network request. The automatic rules target matching **top-level (`main_frame`) navigations** only.

## Manual URL-cleaning behavior

The implementation is in [`url-cleaner.js`](url-cleaner.js), exposed to the popup as `VotrixainUrl.cleanUrl(raw)`.

1. The input is converted to a string and trimmed. An empty value throws `Paste a link to get started`.
2. The browser `URL` parser validates the address. A value without a complete web URL throws an instruction to enter an `http://` or `https://` link.
3. Protocols other than HTTP and HTTPS are rejected.
4. If the host is `instagram.com` or a subdomain of it and the path matches an Instagram `/reel/<id>` or `/p/<id>` content path (with an optional trailing slash), the entire query string is removed.
5. If the host is `github.com` (or a subdomain), the entire query string is removed.
6. If the host is `x.com`, `twitter.com`, or a subdomain of either and the path matches `/<user>/status/<id>`, the entire query string is removed. The manually cleaned result retains a trailing empty `?` when the input had a query delimiter, matching the requested X link format.
7. For other URLs, query keys are compared in lowercase. Any key whose name starts with `utm_`, or whose name is in the explicit list below, is removed. Other query keys remain.
8. The function returns the cleaned URL and metadata: `changed`, `removedCount`, unique `removedKeys`, `instagramRule`, and `fullQueryRule`.

The manual cleaner's explicit tracking-key set is:

```text
fbclid, gclid, dclid, gbraid, wbraid, msclkid,
igshid, cplk, mc_cid, mc_eid, mkt_tok, srsltid,
ttclid, twclid, li_fat_id, epik, obrf,
fb_action_ids, fb_action_types, fb_source, scid
```

All `utm_` names are removed by the manual cleaner, including names not enumerated in this explicit set. Duplicate matching parameters are all removed and counted. Unrecognized parameters are preserved.

Example:

```text
Input:
https://www.instagram.com/reel/DcWXXbGKzMZ/?utm_source=ig_web_copy_link&cplk=NTc4MTIwNjQ2YQ==

Output:
https://www.instagram.com/reel/DcWXXbGKzMZ/
```

## Automatic navigation-cleaning behavior

Automatic cleaning is implemented by [`rules.json`](rules.json), loaded by Chrome through the `declarative_net_request.rule_resources` entry in [`manifest.json`](manifest.json). There is no background service worker or content script in this source tree; the redirect behavior is provided by the static DNR rules.

- **Rule 1** targets Instagram Reel and post URLs on `instagram.com` and `www.instagram.com`. It redirects by setting the query string to an empty value, so all query parameters on a matching navigation are removed.
- **Rule 7** removes the entire query string from GitHub URLs.
- **Rule 8** removes the entire query string from X/Twitter status URLs.
- **Rules 2–6** are five smaller generic regex match rules. They collectively detect the supported tracking-key groups and use the same `queryTransform.removeParams` list to remove the fixed tracking-parameter list.
- All eight rules apply to `main_frame` requests. They do not operate on subresources such as images, scripts, or XHR/fetch requests.
- The generic DNR removal list contains the 12 named UTM parameters and 21 other named tracking parameters encoded in `rules.json`. It is a fixed list. This differs slightly from manual cleanup, which removes any parameter name starting with `utm_`.
- The generic regex conditions are split across multiple rules to keep each regex compact. `tests/rules.test.js` checks the site-specific full-query rules, that each generic regex is valid and under 2 KB, and that the supported tracking names are covered.

The automatic permission toggle in the popup checks the active tab, forms an origin pattern for that tab's scheme and hostname, and calls `chrome.permissions.request()` or `chrome.permissions.remove()` for that one pattern. Automatic cleaning is unavailable for Chrome internal pages and other non-HTTP(S) URLs. Manual cleanup remains available without granting site access.

## Permissions

The permissions are declared in [`manifest.json`](manifest.json):

| Permission | How the source uses it |
| --- | --- |
| `activeTab` | Lets the popup inspect the active tab URL while the popup is open, so it can identify the current website for the optional automatic-cleaning control. |
| `declarativeNetRequestWithHostAccess` | Allows the packaged DNR rules to apply where the extension has host access. |
| Optional `http://*/*` and `https://*/*` host permissions | Allow the user to grant or revoke automatic-cleaning access for an individual site's origin pattern. They are optional and are not granted to all sites at installation. |

The popup displays whether permission is enabled for the current host and provides the matching enable/disable action. A user can also revoke permissions through Chrome's extension settings.

## Install in Chrome

### Load the unpacked extension

1. Download or clone this repository and extract it if needed.
2. Open `chrome://extensions` in Google Chrome.
3. Turn on **Developer mode**.
4. Select **Load unpacked**.
5. Select the project directory containing `manifest.json`.
6. Pin Votrixain from Chrome's Extensions menu if you want quick access.

After editing the source, return to `chrome://extensions` and select **Reload** on the Votrixain card.

### Use manual cleanup

1. Open the Votrixain popup.
2. Paste a complete `http://` or `https://` URL into **Link to clean**.
3. Select **Clean link**.
4. Use **Copy link** or **Open link** with the cleaned result.

Manual cleanup runs in the popup and does not require a website host permission.

### Enable automatic cleanup for one site

1. Open the website in Chrome.
2. Open the Votrixain popup on that tab.
3. In **Automatic cleaning**, select **Enable**.
4. Review Chrome's site-access prompt and grant permission only if you want automatic cleanup for that host.

To turn it off, select **Disable** in the same popup section or revoke the permission in Chrome's extension settings.

## Development and tests

### Requirements

- Google Chrome 101 or later, as declared by `minimum_chrome_version` in `manifest.json`.
- Node.js 18 or later for the test suite, as declared in `package.json`.
- No third-party npm dependencies are required by the current test suite.

### Run the tests

```bash
npm test
```

This runs Node's built-in test runner over `tests/*.test.js`.

The GitHub Actions workflow in [`.github/workflows/tests.yml`](.github/workflows/tests.yml) runs the same command on Node.js 18, 20, and 22 for pushes and pull requests.

### What the tests cover

- `tests/url-cleaner.test.js`: Instagram Reel and post query removal, `obrf` removal, fragment preservation, ordinary tracking removal while preserving functional parameters, case-insensitive and duplicate UTM removal, unchanged clean links, and invalid/unsupported input errors.
- `tests/rules.test.js`: Instagram DNR matching and full-query removal, generic regex validity and size, tracking-key coverage across the generic rules, and preservation of URLs that contain only functional query values.
- `tests/ui.test.js`: theme control is a button that cycles System/Light/Dark, left-side scrollbar styling, squircle radius fallback, Votrixain branding, and migration from the former `cleanlink-theme` preference key.

## Complete file and directory reference

This inventory describes the project files present in this source archive. It distinguishes runtime source, tests, documentation, website assets, and generated tooling output.

### Chrome extension runtime

| File | Function |
| --- | --- |
| [`manifest.json`](manifest.json) | Chrome Manifest V3 configuration. Declares the extension name and version, minimum Chrome version, permissions, optional HTTP/HTTPS host permissions, static DNR ruleset, extension icons, and popup entry point. |
| [`popup.html`](popup.html) | Markup for the extension popup. Defines the brand/header, theme button, URL input, clean and clear controls, status line, optional per-site permission panel, cleaned-result panel, copy/open actions, and privacy footer. Loads `url-cleaner.js` before `popup.js`. |
| [`popup.css`](popup.css) | Popup presentation. Defines light and dark CSS variables, layout, form controls, result and permission cards, accessible focus styles, squircle styling with rounded-corner fallback, and the left-positioned document scrollbar. |
| [`popup.js`](popup.js) | Popup interaction logic. Manages System/Light/Dark theme cycling and legacy theme-key migration; validates and displays manual-cleaning results; reads the active tab's host; checks, requests, and removes optional host access; handles clear, copy, open, keyboard shortcut, status, and permission-change events. |
| [`url-cleaner.js`](url-cleaner.js) | Shared URL-cleaning function. Exposes `cleanUrl()` as `globalThis.VotrixainUrl` for the popup and as a CommonJS export for Node tests. Performs HTTP(S) validation, full-query removal for Instagram, GitHub, and X/Twitter status URLs, and ordinary tracking-key removal while preserving unrecognized query parameters. |
| [`rules.json`](rules.json) | Static Chrome Declarative Net Request redirect rules. Contains full-query rules for Instagram, GitHub, and X/Twitter status URLs, plus five compact generic tracking-parameter matching rules, all scoped to top-level navigation. |
| [`icons/icon16.png`](icons/icon16.png), [`icons/icon32.png`](icons/icon32.png), [`icons/icon48.png`](icons/icon48.png), [`icons/icon128.png`](icons/icon128.png) | PNG extension icons at the sizes referenced by the manifest. The manifest uses 16/32/48/128 px icons and the popup uses the 48 px icon in its brand lockup. |
| [`icons/logo.svg`](icons/logo.svg) | Original Votrixain SVG logo artwork. The website's `docs/assets/logo.svg` references this file through a relative SVG image reference. |

### Automated tests

| File | Function |
| --- | --- |
| [`tests/url-cleaner.test.js`](tests/url-cleaner.test.js) | Unit tests for the `cleanUrl()` behavior, including Instagram, GitHub, and X status paths, recognized keys, fragments, functional parameter preservation, duplicate UTM values, and rejected input. |
| [`tests/rules.test.js`](tests/rules.test.js) | Tests the static DNR regexes and transformations, including regex size, rule coverage for all configured tracking names, and a functional-only query URL that should not match. |
| [`tests/ui.test.js`](tests/ui.test.js) | Source-level UI checks for the theme button, root scrollbar styling, squircle fallback, extension branding, and legacy theme preference migration. It inspects popup HTML, CSS, JavaScript, and the manifest; it is not a browser-driven visual test. |

### Project documentation and maintenance files

| File | Function |
| --- | --- |
| [`README.md`](README.md) | Main project guide: describes behavior, permissions, installation, testing, and the responsibility of each source/documentation file. |
| [`CHANGELOG.md`](CHANGELOG.md) | Version history for 0.4.0 through 0.4.4, including the Votrixain rename, theme changes, Instagram behavior, and DNR regex splitting. |
| [`PRIVACY.md`](PRIVACY.md) | Privacy summary describing locally handled pasted URLs, DNR-based optional navigation cleaning, data transmission, local theme storage, permission use, and limitations. |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | Contribution guidance. Requests focused changes, conservative URL rules, tests for behavior/permission changes, and privacy review before introducing analytics or remote processing. |
| [`SECURITY.md`](SECURITY.md) | Security-reporting guidance for vulnerabilities and a reminder not to include credentials or private browsing data in reports. |
| [`DESIGN_CREDITS.md`](DESIGN_CREDITS.md) | Attribution for the Unslop design guidance, including the author, project, and CC BY 4.0 license link. |
| [`GITHUB_SETUP.md`](GITHUB_SETUP.md) | Repository setup and Git command instructions. It contains an originally suggested repository name (`votrixain-chrome-extension`); the repository URL currently configured by the website is `https://github.com/darshseraphic/Votrixain`. Review the setup instructions before reusing them for the existing repository. |
| [`LICENSE.txt`](LICENSE.txt) | Text of the Votrixain Proprietary Source-Available License included in this archive. See [License metadata note](#license-metadata-note) because `package.json` declares a different license identifier. |
| [`package.json`](package.json) | npm project metadata: package name, version, description, license field, Node.js engine requirement, and the `npm test` script. It defines no build or runtime dependency scripts. |

### Website source in `docs/`

The `docs/` directory contains a static landing page for the extension. It is plain HTML, CSS, and JavaScript; there is no website bundler or npm build step in the supplied source.

| File | Function |
| --- | --- |
| [`docs/index.html`](docs/index.html) | Website page structure and copy. Contains the header/navigation, hero with a browser-style URL-cleaning illustration, product explanation, link-anatomy before/after section, three-step explanation, privacy section, project/repository section, FAQ, closing call to action, and footer. It loads `config.js`, `script.js`, `styles.css`, and `assets/logo.svg`. The shown URL transformation is a static illustration; it does not call the extension's `url-cleaner.js`. |
| [`docs/styles.css`](docs/styles.css) | Website styling. Defines the white/near-white/gray light palette, graphite dark theme, typography, 1000 px page measure, section and hero layouts, browser preview, mobile navigation styles, responsive breakpoints, hover/focus states, reduced-motion behavior, and dark-theme logo inversion. |
| [`docs/script.js`](docs/script.js) | Website interactions. Sets the copyright year; validates and applies the configured HTTPS repository URL to source links; stores a light/dark theme preference in `localStorage`; toggles the responsive navigation and closes it on link click, Escape, outside click, or desktop breakpoint change; and copies the example cleaned URL to the clipboard with status feedback. |
| [`docs/config.js`](docs/config.js) | Sets `window.VOTRIXAIN_CONFIG.repositoryUrl` to the public GitHub repository URL used by the website's source links. |
| [`docs/assets/logo.svg`](docs/assets/logo.svg) | Small SVG wrapper that references `../icons/logo.svg`. It is not a byte-for-byte copy of the original logo file. |
| [`docs/prepare-assets.sh`](docs/prepare-assets.sh) | Shell helper that checks for `icons/logo.svg`, creates an `assets/` directory relative to the shell's current working directory, and copies the source logo to `assets/logo.svg`. As currently written, when run from the repository root it writes to the root-level `assets/logo.svg`, not `docs/assets/logo.svg`. |
| [`docs/README.md`](docs/README.md) | Website-specific setup notes, preview guidance, file list, theme description, and Unslop attribution. |

### Repository and generated files

| File or directory | Function |
| --- | --- |
| [`.github/workflows/tests.yml`](.github/workflows/tests.yml) | GitHub Actions workflow. On pushes and pull requests it checks out the repository, installs the selected Node.js version (18, 20, or 22), and runs `npm test`. |
| [`.gitignore`](.gitignore) | Lists local/editor files and generated packages that Git should ignore, including OS metadata, CRX/ZIP files, `node_modules`, environment files, and IDE folders. |
| [`.gitattributes`](.gitattributes) | Enables automatic text handling and marks PNG files as binary. |
| [`_metadata/generated_indexed_rulesets/_ruleset1`](_metadata/generated_indexed_rulesets/_ruleset1) | Chrome-generated indexed ruleset data associated with the declarative rules. This is compiled/binary output, not a hand-edited source file; `rules.json` is the readable source of the DNR rules. |
| `.git/` | Git repository internals included in the uploaded source archive. These files store repository history/configuration and are not part of the extension's runtime. They are not individually documented here. |

## Privacy and limitations

The current extension source contains no analytics SDK, advertising SDK, account service, remote-code loader, or Votrixain-operated link-processing endpoint. Manual URL parsing and cleanup run in the popup page. The automatic rules are packaged locally and Chrome applies them only where the extension has host access.

The selected popup theme is stored in the extension page's `localStorage` under `votrixain-theme`. The code also checks the former `cleanlink-theme` key and migrates a valid saved value to the new key.

When a cleaned link is opened, the destination website receives the resulting URL as part of the normal navigation. That website can still use its own cookies, pixels, fingerprinting, and other tracking methods.

See [`PRIVACY.md`](PRIVACY.md) for the fuller privacy summary and review [`manifest.json`](manifest.json) for the permissions declared by this version.

## License metadata note

There is a **license metadata inconsistency in the supplied source archive**:

- [`LICENSE.txt`](LICENSE.txt) contains the text titled **Votrixain Proprietary Source-Available License**.
- [`package.json`](package.json) declares `"license": "MIT"`.

These statements do not describe the same licensing terms. This README does not choose between them or reinterpret either file. The repository owner should resolve the mismatch before publishing or distributing the project and ensure the manifest, package metadata, license file, and public release description agree. Until that is resolved, refer to `LICENSE.txt` itself and do not rely on the package metadata alone.
