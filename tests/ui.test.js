"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "popup.html"), "utf8");
const css = fs.readFileSync(path.join(root, "popup.css"), "utf8");
const js = fs.readFileSync(path.join(root, "popup.js"), "utf8");

test("theme control is a button, not a select or dropdown", () => {
  assert.match(html, /<button id="themeButton" class="theme-button"/);
  assert.doesNotMatch(html, /<select[^>]*theme/i);
  assert.match(js, /themeButton\.addEventListener\("click"/);
  assert.match(js, /const themeOrder = \["system", "light", "dark"\]/);
});

test("root document scrollbar is styled and positioned on the left", () => {
  assert.match(css, /html\s*\{[^}]*direction:\s*rtl/s);
  assert.match(css, /body\s*\{[^}]*direction:\s*ltr/s);
  assert.match(css, /html::-webkit-scrollbar-thumb/);
  assert.match(css, /scrollbar-color:\s*var\(--scroll-thumb\)\s+var\(--page\)/);
  assert.match(css, /--scroll-thumb:\s*#111111/);
  assert.match(css, /--scroll-thumb:\s*#ffffff/);
});

test("squircle surfaces retain a fallback radius", () => {
  assert.match(css, /border-radius:\s*28px/);
  assert.match(css, /corner-shape:\s*squircle/);
});


test("product branding uses Votrixain and migrates the previous theme key", () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, "manifest.json"), "utf8"));
  assert.equal(manifest.name, "Votrixain – Privacy URL Cleaner");
  assert.equal(manifest.action.default_title, "Votrixain");
  assert.match(html, /<title>Votrixain<\/title>/);
  assert.match(html, /<span class="brand-name">Votrixain<\/span>/);
  assert.match(js, /const THEME_STORAGE_KEY = "votrixain-theme"/);
  assert.match(js, /const LEGACY_THEME_STORAGE_KEY = "cleanlink-theme"/);
  assert.match(js, /localStorage\.removeItem\(LEGACY_THEME_STORAGE_KEY\)/);
});
