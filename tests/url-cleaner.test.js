"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { cleanUrl } = require("../url-cleaner.js");
assert.equal(globalThis.VotrixainUrl.cleanUrl, cleanUrl);

const instagramInput = "https://www.instagram.com/reel/DcWXXbGKzMZ/?utm_source=ig_web_copy_link&cplk=NTc4MTIwNjQ2YQ==";

test("removes every query parameter from Instagram Reel links", () => {
  const result = cleanUrl(instagramInput);
  assert.equal(result.cleaned, "https://www.instagram.com/reel/DcWXXbGKzMZ/");
  assert.equal(result.removedCount, 2);
  assert.equal(result.instagramRule, true);
});

test("removes every query parameter from Instagram Post links, including obrf", () => {
  const result = cleanUrl("https://www.instagram.com/p/DfWwPedsS2u/?utm_source=ig_web_copy_link&obrf=NTc4MTIwNjQ2YQ==");
  assert.equal(result.cleaned, "https://www.instagram.com/p/DfWwPedsS2u/");
  assert.equal(result.removedCount, 2);
  assert.equal(result.instagramRule, true);
});

test("removes obrf from other URLs while preserving functional parameters", () => {
  const result = cleanUrl("https://example.com/item?id=42&obrf=NTc4MTIwNjQ2YQ==");
  assert.equal(result.cleaned, "https://example.com/item?id=42");
  assert.equal(result.removedKeys.includes("obrf"), true);
});

test("preserves the fragment when removing Instagram Reel query parameters", () => {
  const result = cleanUrl("https://instagram.com/reel/abc123/?share=1#comments");
  assert.equal(result.cleaned, "https://instagram.com/reel/abc123/#comments");
});

test("removes tracking parameters but preserves functional parameters", () => {
  const result = cleanUrl("https://example.com/search?q=privacy&page=2&utm_source=newsletter&fbclid=abc");
  assert.equal(result.cleaned, "https://example.com/search?q=privacy&page=2");
  assert.equal(result.removedCount, 2);
});

test("removes UTM keys case-insensitively, including duplicate values", () => {
  const result = cleanUrl("https://example.com/?UTM_Source=a&utm_source=b&keep=1");
  assert.equal(result.cleaned, "https://example.com/?keep=1");
  assert.equal(result.removedCount, 2);
});

test("leaves a clean link unchanged", () => {
  const value = "https://www.youtube.com/watch?v=abc123&t=30";
  const result = cleanUrl(value);
  assert.equal(result.cleaned, value);
  assert.equal(result.changed, false);
  assert.equal(result.removedCount, 0);
});

test("rejects empty, malformed, and non-web URLs", () => {
  assert.throws(() => cleanUrl("  "), /Paste a link/);
  assert.throws(() => cleanUrl("example.com"), /complete link/);
  assert.throws(() => cleanUrl("javascript:alert(1)"), /only processes http and https/);
});
