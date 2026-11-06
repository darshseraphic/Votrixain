# Changelog

## Unreleased

- Added full query-string removal for GitHub links and X/Twitter status links in manual cleanup and automatic top-level navigation redirects.
- Retained the trailing empty `?` on manually cleaned X/Twitter status links when the input included a query string.


## 0.4.4

- Renamed the product from CleanLink to Votrixain; URL-cleaning behavior and the permission model are unchanged.
- Updated the extension name, popup wordmark, project documentation, and package identifier.
- Migrated the saved theme preference from `cleanlink-theme` to `votrixain-theme` so existing preferences are retained where extension storage is preserved.


## 0.4.3

- Replaced the theme selector with a button that cycles through System, Light, and Dark.
- Moved scrollbar styling to the document root and positioned it on the left.
- Set the scrollbar thumb to black in Light mode and white in Dark mode.
- Used the native system UI font stack.
- Kept squircle surfaces with rounded-corner fallbacks.

## 0.4.2

- Added a System / Light / Dark theme preference.
- Refined the black-and-white popup styling, squircle surfaces, and left-side scrollbar.
- Split generic tracking matches into smaller Declarative Net Request regex conditions to address the compiled-regex complexity warning.

## 0.4.1

- Added `obrf` to known tracking parameters.
- Extended Instagram automatic-cleaning matching to both post (`/p/`) and Reel (`/reel/`) paths.

## 0.4.0

- Added the first structured prototype with local URL cleaning and optional per-site automatic navigation cleaning.
