"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const rules = require("../rules.json");

const instagramRule = rules.find((rule) => rule.id === 1);
const genericRules = rules.filter((rule) => rule.id !== 1);
const allTrackingParams = [
  "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "utm_id",
  "utm_source_platform", "utm_creative_format", "utm_marketing_tactic", "utm_referrer",
  "utm_reader", "utm_name", "fbclid", "gclid", "dclid", "gbraid", "wbraid", "msclkid",
  "igshid", "cplk", "mc_cid", "mc_eid", "mkt_tok", "srsltid", "ttclid", "twclid",
  "li_fat_id", "epik", "fb_action_ids", "fb_action_types", "fb_source", "scid", "obrf"
];

test("Instagram automatic rule matches Reel and Post URLs and removes their full query", () => {
  const regex = new RegExp(instagramRule.condition.regexFilter, "i");
  assert.equal(regex.test("https://www.instagram.com/reel/DcWXXbGKzMZ/?utm_source=ig_web_copy_link&cplk=abc"), true);
  assert.equal(regex.test("https://www.instagram.com/p/DcWXXbGKzMZ/?utm_source=share&obrf=abc"), true);
  assert.equal(instagramRule.action.redirect.transform.query, "");
});

test("every generic DNR regex is compact and under 2KB source size", () => {
  assert.ok(genericRules.length >= 4);
  for (const rule of genericRules) {
    assert.ok(Buffer.byteLength(rule.condition.regexFilter, "utf8") < 2048, `rule ${rule.id} regex is too long`);
    assert.ok(new RegExp(rule.condition.regexFilter, "i"));
    assert.deepEqual(rule.action.redirect.transform.queryTransform.removeParams, allTrackingParams);
  }
});

test("generic DNR rules collectively match every tracked parameter", () => {
  for (const key of allTrackingParams) {
    const url = `https://example.com/path?keep=1&${key}=tracking-value`;
    const matched = genericRules.some((rule) => new RegExp(rule.condition.regexFilter, "i").test(url));
    assert.equal(matched, true, `No DNR rule matched ${key}`);
  }
});

test("generic DNR rules preserve functional-only query URLs", () => {
  const url = "https://www.youtube.com/watch?v=abc123&t=30";
  assert.equal(genericRules.some((rule) => new RegExp(rule.condition.regexFilter, "i").test(url)), false);
});
