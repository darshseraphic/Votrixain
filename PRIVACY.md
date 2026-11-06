# Privacy summary

Votrixain is designed to process links locally in the browser.

## Data handled

When you paste a URL into the popup, the extension parses and cleans that URL in the popup page. When optional automatic cleaning is enabled for a site, Chrome's Declarative Net Request engine applies the packaged matching rules to top-level navigation URLs for hosts to which you granted access.

## Data collection and transmission

The current source contains no analytics SDK, advertising SDK, account service, remote code loader, or Votrixain-operated link-processing endpoint. It does not transmit pasted links to a Votrixain server.

When you open a cleaned link, the browser navigates to the destination and that destination receives the cleaned URL as part of the normal web request. Websites may still use cookies, pixels, fingerprinting, and other tracking methods outside Votrixain's scope.

## Local storage

The selected theme preference is stored in the extension's local page storage. Chrome itself manages the host permissions you grant or revoke.

## Permissions

- `activeTab` is used to identify the current tab's website while the popup is open.
- `declarativeNetRequestWithHostAccess` allows the static cleanup rules to operate on sites with granted host access.
- Optional HTTP and HTTPS host permissions are requested site by site when you enable automatic cleaning.

## Scope and limitations

Votrixain removes known URL parameters. It is not a complete privacy shield and does not prevent tracking that does not depend on those parameters. Instagram post and Reel links have all query parameters removed by design; on other sites, only recognized tracking parameters are removed.

This summary describes the code in the current repository version. Review the manifest and source whenever the extension changes.
