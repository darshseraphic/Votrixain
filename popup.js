"use strict";

// Theme preference is stored locally in this extension page; no extra permission is needed.
const themeButton = document.getElementById("themeButton");
const themeIcon = document.getElementById("themeIcon");
const themeLabel = document.getElementById("themeLabel");
const colorSchemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
const themeOrder = ["system", "light", "dark"];
const THEME_STORAGE_KEY = "votrixain-theme";
const LEGACY_THEME_STORAGE_KEY = "cleanlink-theme";
let themePreference = "system";

const themeIconPaths = {
  system: '<rect x="3.8" y="4.5" width="12.4" height="9.2" rx="1.4"/><path d="M8 17h4m-2-3.3V17"/>',
  light: '<circle cx="10" cy="10" r="3.2"/><path d="M10 2.5v1.7m0 11.6v1.7M2.5 10h1.7m11.6 0h1.7M4.7 4.7l1.2 1.2m8.2 8.2 1.2 1.2m0-10.6-1.2 1.2m-8.2 8.2-1.2 1.2"/>',
  dark: '<path d="M16.2 12.3A6.8 6.8 0 0 1 7.7 3.8a6.8 6.8 0 1 0 8.5 8.5Z"/>'
};

function applyTheme(preference) {
  themePreference = preference;
  const resolvedTheme = preference === "system"
    ? (colorSchemeQuery.matches ? "dark" : "light")
    : preference;
  const label = preference.charAt(0).toUpperCase() + preference.slice(1);
  const nextPreference = themeOrder[(themeOrder.indexOf(preference) + 1) % themeOrder.length];
  const nextLabel = nextPreference.charAt(0).toUpperCase() + nextPreference.slice(1);

  document.documentElement.dataset.theme = resolvedTheme;
  document.documentElement.dataset.themePreference = preference;
  document.documentElement.style.colorScheme = resolvedTheme;
  themeLabel.textContent = label;
  themeIcon.innerHTML = themeIconPaths[preference];
  themeButton.setAttribute("aria-label", `Theme: ${label}. Activate to switch to ${nextLabel}`);
  themeButton.setAttribute("title", `Current theme: ${label} · Click to switch to ${nextLabel}`);
}

function saveTheme(preference) {
  applyTheme(preference);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // Theme still applies for this popup session if storage is unavailable.
  }
}

try {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || localStorage.getItem(LEGACY_THEME_STORAGE_KEY);
  const validSavedTheme = themeOrder.includes(savedTheme) ? savedTheme : "system";
  applyTheme(validSavedTheme);
  if (savedTheme && !localStorage.getItem(THEME_STORAGE_KEY) && themeOrder.includes(savedTheme)) {
    localStorage.setItem(THEME_STORAGE_KEY, savedTheme);
    localStorage.removeItem(LEGACY_THEME_STORAGE_KEY);
  }
} catch {
  applyTheme("system");
}

themeButton.addEventListener("click", () => {
  const nextPreference = themeOrder[(themeOrder.indexOf(themePreference) + 1) % themeOrder.length];
  saveTheme(nextPreference);
});

colorSchemeQuery.addEventListener?.("change", () => {
  if (themePreference === "system") applyTheme("system");
});

const input = document.getElementById("inputUrl");
const output = document.getElementById("outputUrl");
const resultSection = document.getElementById("resultSection");
const status = document.getElementById("status");
const statusText = document.getElementById("statusText");
const resultSummary = document.getElementById("resultSummary");
const removedBadge = document.getElementById("removedBadge");
const detailRow = document.getElementById("detailRow");
const detailText = document.getElementById("detailText");
const accessTitle = document.getElementById("accessTitle");
const accessDescription = document.getElementById("accessDescription");
const accessButton = document.getElementById("accessBtn");
const accessNote = document.getElementById("accessNote");

let currentSitePattern = null;
let currentHostname = null;
let currentSiteEnabled = false;

function setStatus(message, type = "") {
  statusText.textContent = message;
  status.classList.remove("error", "success");
  if (type) status.classList.add(type);
}

function showResult(result) {
  output.value = result.cleaned;
  resultSection.hidden = false;

  if (result.changed) {
    const label = result.removedCount === 1 ? "parameter removed" : "parameters removed";
    resultSummary.textContent = `${result.removedCount} ${label}`;
    removedBadge.textContent = `${result.removedCount} removed`;
    detailRow.hidden = result.removedKeys.length === 0;
    detailText.textContent = result.instagramRule
      ? "All Instagram query parameters were removed"
      : `Removed: ${result.removedKeys.join(", ")}`;
    setStatus("The cleaned link is ready to copy or open", "success");
  } else {
    resultSummary.textContent = "No recognized tracking parameters found";
    removedBadge.textContent = "Already clean";
    detailRow.hidden = false;
    detailText.textContent = "No changes were made to the link";
    setStatus("This link already looks clean", "success");
  }
}

function handleClean() {
  try {
    const result = VotrixainUrl.cleanUrl(input.value);
    showResult(result);
  } catch (error) {
    resultSection.hidden = true;
    setStatus(error.message || "Could not clean this link", "error");
    input.focus();
  }
}

async function getCurrentSitePermissionPattern() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const activeTab = tabs && tabs[0];
  if (!activeTab || !activeTab.url) return null;

  const url = new URL(activeTab.url);
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;

  currentHostname = url.hostname;
  return `${url.protocol}//${url.hostname}/*`;
}

async function refreshSiteAccess() {
  accessButton.disabled = true;
  accessButton.textContent = "Checking";

  try {
    currentSitePattern = await getCurrentSitePermissionPattern();
    if (!currentSitePattern) {
      currentSiteEnabled = false;
      accessTitle.textContent = "Automatic cleaning";
      accessDescription.textContent = "Open a website to manage its automatic cleaning";
      accessButton.textContent = "Unavailable";
      accessNote.textContent = "Site access is unavailable on Chrome system pages and the Chrome Web Store.";
      return;
    }

    currentSiteEnabled = await chrome.permissions.contains({ origins: [currentSitePattern] });
    if (currentSiteEnabled) {
      accessTitle.textContent = "Automatic cleaning is on";
      accessDescription.textContent = `Top-level links on ${currentHostname} are cleaned`;
      accessButton.textContent = "Disable";
      accessButton.classList.add("enabled");
      accessNote.textContent = "Access is limited to this host. You can revoke it here at any time.";
    } else {
      accessTitle.textContent = "Automatic cleaning";
      accessDescription.textContent = `Off for ${currentHostname}. Enable only on sites you choose`;
      accessButton.textContent = "Enable";
      accessButton.classList.remove("enabled");
      accessNote.textContent = "Chrome asks for permission for this host only. Manual cleaning needs no site access.";
    }
    accessButton.disabled = false;
  } catch (error) {
    currentSitePattern = null;
    currentSiteEnabled = false;
    accessTitle.textContent = "Automatic cleaning unavailable";
    accessDescription.textContent = "Chrome could not check this site's permission";
    accessButton.textContent = "Unavailable";
    accessNote.textContent = "Manual link cleaning remains available without site access.";
    console.warn("Votrixain site permission check failed:", error);
  }
}

async function toggleSiteAccess() {
  if (!currentSitePattern || accessButton.disabled) return;

  accessButton.disabled = true;
  const pattern = currentSitePattern;

  try {
    if (currentSiteEnabled) {
      const removed = await chrome.permissions.remove({ origins: [pattern] });
      setStatus(
        removed ? `Automatic cleaning disabled for ${currentHostname}` : "Chrome did not remove this site's permission",
        removed ? "success" : "error"
      );
    } else {
      // Called directly from the button click so Chrome can show a scoped prompt.
      const granted = await chrome.permissions.request({ origins: [pattern] });
      setStatus(
        granted ? `Automatic cleaning enabled for ${currentHostname}` : "Permission was not granted; manual cleaning still works",
        granted ? "success" : "error"
      );
    }
  } catch (error) {
    setStatus("Chrome could not update this site's permission", "error");
    console.warn("Votrixain site permission update failed:", error);
  }

  await refreshSiteAccess();
}

document.getElementById("cleanBtn").addEventListener("click", handleClean);
document.getElementById("accessBtn").addEventListener("click", toggleSiteAccess);

document.getElementById("clearBtn").addEventListener("click", () => {
  input.value = "";
  output.value = "";
  resultSection.hidden = true;
  setStatus("Paste a link to begin");
  input.focus();
});

input.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
    event.preventDefault();
    handleClean();
  }
});

input.addEventListener("input", () => {
  if (!resultSection.hidden) resultSection.hidden = true;
  if (status.classList.contains("error")) setStatus("Paste a link to begin");
});

document.getElementById("copyBtn").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(output.value);
    const buttonLabel = document.querySelector("#copyBtn span");
    const previousLabel = buttonLabel.textContent;
    buttonLabel.textContent = "Copied";
    setStatus("Clean link copied to the clipboard", "success");
    window.setTimeout(() => { buttonLabel.textContent = previousLabel; }, 1400);
  } catch {
    setStatus("Clipboard is unavailable. Select the cleaned link and copy it", "error");
    output.focus();
    output.select();
  }
});

document.getElementById("openBtn").addEventListener("click", () => {
  if (output.value) chrome.tabs.create({ url: output.value });
});

chrome.permissions.onAdded.addListener(() => { void refreshSiteAccess(); });
chrome.permissions.onRemoved.addListener(() => { void refreshSiteAccess(); });
void refreshSiteAccess();
