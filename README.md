# Reddit Picture Gallery Downloader

_Last updated: 2026-05-08_

One-click downloader for Reddit galleries. Save full-resolution photos from any Reddit post — single image, multi-image gallery, or full subreddit thread — straight to your computer with a single press.

**[➡️ Available on the Chrome Web Store](https://chromewebstore.google.com/detail/reddit-picture-gallery-do/abhhhegakoaijhgfefmampphfjgmnapc)**

Keywords: *Reddit downloader · Reddit image downloader · Reddit gallery downloader · Reddit picture downloader · Reddit photo saver · Bulk image downloader · Reddit album saver · Save Reddit pictures · Download Reddit posts · Reddit zip downloader · Subreddit image downloader · One-click Reddit · Reddit lightbox download · Reddit WebP to JPG · Reddit batch save*

---

## 📋 Chrome Web Store description (copy-paste this into the CWS listing)

> 🚀 **Reddit Picture Gallery Downloader (v2.3)**
>
> Download high-resolution Reddit image galleries and posts with a single click. No more right-clicking through twelve images one at a time — press the button, get the whole gallery.
>
> Works on every modern Reddit page: post pages, gallery posts, single images, and the fullscreen lightbox viewer. Pulls source images straight from Reddit's metadata at original quality, no compression, no watermarking, nothing leaves your machine.
>
> ━━━━━━━━━━━━━━━━━━
> ✨ **What's new in v2.3**
>
> • **Per-mode Format Tweaks** — Folder Mode, ZIP Mode, and Individual Mode each carry their own separators, date format, time format, title case, Unique ID style, and so on. Pick dashes for ZIP filenames and underscores for Folder Mode without one bleeding into the other. Older configs are migrated automatically — your existing global settings are copied into all three modes so nothing changes until you start customising per-mode.
> • **Tips & Recipes page** — Six worked examples showing how to combine pills + format tweaks for common goals (one folder per subreddit, never overwrite a file, group by upload date, share a whole gallery as a ZIP, sync your setup across machines, the Alt + D shortcut). Open it from the Backup & reset row in Settings, from the welcome page, or directly at <code>tips.html</code>.
> • **Custom dropdown widget** — Every dropdown on the Settings page is now a pill-shaped, fully CSS-styled popup. The OS-rendered blue selection highlight is gone for good; popups always open downward, scroll internally if there are more options than fit, and stay clipped to the viewport.
> • **Live filename preview** — A handwritten "live preview." card on the left side of the Settings page shows exactly which files your current formula will produce, in a tree layout that mirrors File Explorer (folders, ZIPs, and images each get their own glyph). Long filenames truncate the body but always keep the extension visible.
> • **Two-tone palette** — Settings page collapsed to a single ink-on-cream palette in light mode and pale-on-dark in dark mode. No more blue Save buttons or green success badges scattered across the chrome.
> • **Compact popup** — The toolbar popup now fits in a single screen with no scroll. Save and Customize sit side-by-side, and the Customize button is icon-only with a tooltip.
> • **Reordered Format tweaks** — The 9 controls now read in a cleaner sequence: pill-join rules in row 1, per-pill rendering in row 2, date and time together in row 3.
>
> ━━━━━━━━━━━━━━━━━━
> 🪶 **Carried over from v2.2**
>
> • **WebP → JPEG conversion** — Reddit serves a lot of WebP previews, but Windows Photos and most gallery apps still don't open them cleanly. The downloader decodes and re-encodes WebP into JPEG on the fly so every saved file just works.
> • **Lightbox support** — The floating Download button stays visible when you click an image to open Reddit's fullscreen lightbox viewer.
> • **Smart "missing title" defaults** — Posts without a usable title omit the Title pill from the filename by default, or use a placeholder string you choose.
> • **Native title prompt** — Optional pre-download "rename this gallery" prompt uses your browser's built-in dialog so Reddit's keyboard shortcuts can't steal keystrokes while you're typing.
> • **Mid-download safety** — Saving a settings change while a gallery is still downloading no longer wipes the loading/done message.
>
> ━━━━━━━━━━━━━━━━━━
> 🔥 **Core features**
>
> • **One-click bulk download** — A floating Download Gallery button shows up on every Reddit post and gallery page. One press fetches every image at full resolution.
> • **Three download modes:**
>     — **Folder Mode:** creates a sub-folder per gallery and saves images inside.
>     — **ZIP Mode:** bundles the whole gallery into a single .zip archive. Perfect for sharing on Discord or email.
>     — **Individual Mode:** drops images straight into your base downloads folder, no wrapper.
> • **Drag-and-drop filename builder** — Compose your own naming convention from named pills: Subreddit, Author, Title, Upload Date, Download Date, Time, Index, Unique ID, plus arbitrary static text.
> • **Per-mode rules** for missing titles, paths that exceed Windows length limits, and single-image galleries.
> • **Global formatting options:** separator characters, title case (lower / UPPER / Title / Sentence), title-space handling, date format and separator, time format, index style (01, (01), [01]), unique-ID style.
> • **Eleven button themes** — Native Reddit (Orange), Premium Black, Modern Blue, Minimal Light, Glass, Gradient, Neon, Soft, Mint, Sunset, Mono. Four positions, three sizes, custom button label.
> • **Alt + D keyboard shortcut** for hands-free downloading.
> • **Backup & restore** — Export your full configuration to a JSON file, import it on another machine.
> • **Privacy first.** Everything runs locally in your browser. No servers, no ads, no tracking, no analytics. Source code is open.
>
> ━━━━━━━━━━━━━━━━━━
> 💡 **Quick setup tip:** Go to chrome://settings/downloads and turn OFF "Ask where to save each file before downloading". Otherwise Chrome will pop a Save dialog for every image in the gallery — with this off, the extension handles all routing silently.
>
> ━━━━━━━━━━━━━━━━━━
> ⚠️ **Note**
>
> This is a *picture* downloader — it focuses on photos and image galleries. Native Reddit videos are intentionally not supported, to keep the extension lightweight and fast.
>
> ━━━━━━━━━━━━━━━━━━
> 🔗 **Links & support**
>
> • Source Code: https://github.com/GauravZn/reddit-downloader
> • Support the project: https://ko-fi.com/gauravzn
>
> Found a bug or have a feature idea? Drop me an email or file an issue on GitHub.
>
> ━━━━━━━━━━━━━━━━━━
> 🏥 **The mission**
>
> 90% of all tips are donated to **St. Jude Children's Research Hospital** to support childhood cancer treatment and research.
>
> Donate directly: https://ko-fi.com/gauravzn
>
> ━━━━━━━━━━━━━━━━━━
> Built with ♥ by Gaurav. Thanks for using.

---

## What's new in v2.3 (engineering changelog)

**Per-mode Format Tweaks**
- The 9 format controls (Folder Pill Sep, Title Pill Sep, Index Format, Title Case, Title Space Options, Unique ID Format, Date Format, Date Separator, Time Format) used to live in a single global section under `globalPrefs`. They now live per-mode under `modeState[mode].formatPrefs` so each download mode has independent settings. Folder Pill Separator is omitted in Individual Mode (no folder/archive name to assemble).
- `options.js` generates the Format Tweaks block at the bottom of each panel via `buildFormatOptionsHTML(mode)`. Selects carry `data-mode` + `data-format-key` attributes so they can be looked up cheaply with `getFormatSelect(mode, key)`. The 26 generated selects are enhanced by `enhanceSelect()` in the same pass as the static fallback selects.
- `applySettings()` runs `ensureFormatPrefsMigrated(data)` on load — if the saved config has legacy `globalPrefs.{folderSeparatorFormat,...}` keys but no per-mode `formatPrefs`, the legacy values are copied into all three modes so existing users transition without losing their setup.
- `background.js` now reads format prefs from `modeState[activeMode].formatPrefs` with a three-tier fallback chain: per-mode → legacy globalPrefs (for users on a build that pre-dates the split) → hardcoded defaults.
- `globalPrefs` retains only `promptCustomTitle` and `activeMode`. Everything else moved out.

**Tips & Recipes page**
- New `tips.html` with 6 worked examples in a responsive 3-column card grid. Each card has a per-tip accent color (top hairline + numbered chip + icon background + corner radial wash all driven by `--accent` / `--accent-bg` / `--accent-soft` CSS vars). Caveat handwritten font on the hero overline.
- Linked from `welcome.html` ("See more tips →" anchor) and from the `Backup & reset` row in `options.html` (`a.tool-btn-tips` with a lightbulb icon).

**Custom dropdown widget**
- `enhanceSelect()` in `options.js` wraps every native `<select>` with a body-anchored `position: fixed` listbox so the OS's blue selection highlight never paints. Trigger is a button styled as a pill (`border-radius: 999px`); listbox positions itself below the trigger, caps `max-height` to fit available space, and scrolls internally with the scrollbar hidden via `scrollbar-width: none` + `::-webkit-scrollbar { display: none }`.
- Listbox positioning includes horizontal edge-detection so the rightmost-column dropdown (Unique ID Format) can't extend off the page. No flip-up — dropdowns always open downward.
- Native `<select>` stays in the DOM (visually hidden) so `chrome.storage`, form state, and the existing change-event listeners keep working unchanged. `applySettings()` dispatches a synthetic `change` event after programmatic `select.value = ...` so trigger labels stay in sync.

**Settings page UI**
- Two-tone palette across `options.css` and `popup.html`: cream + ink in light mode, dark + cream in dark mode. Dropped `--google-blue` and `--google-green` everywhere; `accent-color: var(--text-primary)` applied at `:root` to retint native form controls.
- Live preview tree on the left panel shows the full file structure (downloads/[base]/, then folder/zip line, then 3 image lines) with mode-tinted icons. Filename body truncates with ellipsis but the suffix (`.jpg`, `.zip`, `/`) is `flex-shrink: 0` so the extension is always visible.
- "live preview." card label uses Caveat handwritten font in warm tan (`#b18a5e` light / `#dbb481` dark).
- Mock-post carousel (3 peacock slides) uses `object-fit: contain` so the full image is always visible. Each slide's blurred copy fills the letterbox area as ambient backdrop. Bottom-right control cluster combines prev arrow + counter + next arrow into one translucent pill.
- Format Tweaks reordered: row 1 = pill join rules (Folder Sep · Title Sep · Index), row 2 = per-pill rendering (Title Case · Title Space · Unique ID), row 3 = date/time (Date Format · Date Separator · Time Format).
- "Folder Separator" → "Folder Pill Separation Character"; "Pill Separation Character" → "Title Pill Separation Character".

**Popup**
- Header icon swapped from `📥` emoji to the same picture-frame SVG used in the live-preview tree.
- Save and Customize Naming side-by-side instead of stacked. Customize is icon-only with `title=` tooltip and visually-hidden label for screen readers. Net ~80px vertical saved → fits without scroll.
- Preview button has `pointer-events: none` so its theme hover styles don't fire (the preview always shows the resting state — what you'll actually see on Reddit).

**Welcome page**
- Added "See more tips →" anchor below the three feature cards. Subtle inline link with arrow-shift on hover; opens `tips.html` in a new tab.

## What's new in v2.2 (engineering changelog)

**Download pipeline**
- Added MV3 service-worker WebP → JPEG re-encoding via `createImageBitmap` + `OffscreenCanvas`. Used in all three download modes; ZIP mode converts in place from the already-fetched blob.
- Single-image fallback regex now matches `.webp` (and tolerates query strings via `(\?|$)`). Previously, single-image WebP posts were silently dropped — the download would just say "No Images".
- Extension parser (`getExtFromUrl`) sanity-checks the result against `/^[a-z0-9]{1,5}$/i` instead of relying on a `|| 'jpg'` fallback that never fired.
- 12-hour time formatter now uses the user-selected separator before the AM/PM token (was hardcoded `_`).

**Filename builder**
- Default `missingTitle` rule flipped from `placeholder` to `omit` for new installs. Existing configs are preserved by the merge-defaults migration in `options.js`.
- Default placeholder string changed from `Gallery_no_title` to `No Title`.
- `getRawTitle()` in content.js now returns an empty string when no title is detectable, instead of fabricating a `Apr-15-2026_10-30` timestamp. The fabrication was silently bypassing the user's "Omit title" rule. New `buildFallbackTitle(prefs)` helper builds a timestamp matching the user's date/time settings — used **only** as the prompt's default value, never sent to background.

**Floating button**
- Floating button now wins the z-index tiebreaker against Reddit's lightbox overlay by re-appending itself to the end of `<body>` whenever later DOM is injected after it.
- `applyButtonAppearance` now honours a `data-busy` flag during downloads so storage-change events don't clobber the loading/done innerHTML. After the cycle ends, the button rebuilds itself from the freshest `cachedSettings` so any mid-download label/theme change still takes effect.
- Custom button label is rendered verbatim when set; default is the universal `🚀 Download Gallery`. No more rocket-icon toggle.
- Loading state simplified to a single string with no theme-specific branching.

**Themes**
- Theme definitions extracted to a shared `themes.js` (loaded by both content.js and popup.html) with a `buildThemeStyles(selector, { important })` helper. Single source of truth for all 11 themes — change a color once and both the actual button on Reddit and the popup's live preview update together. content.js stamps `!important` on every declaration; popup doesn't need to.

**Title prompt**
- Title prompt uses `window.prompt` (native), removing the in-page modal CSS/JS entirely. Native dialog inherently blocks Reddit's keyboard shortcuts while open, no manual hijacking needed.

**UI polish**
- Popup `header-icon` neutralized (no more orange gradient); unused `--reddit` CSS variable removed.
- Popup version label now reads from `chrome.runtime.getManifest().version` instead of a hardcoded string. Bump the manifest, popup updates automatically.
- Date Format dropdown labels rewritten from `YYYY MM DD` (which falsely implied a space separator) to `Year, Month, Day`. Time Format labels similarly clarified. Both got info-icon tooltips pointing users at the related Date Separator / Pill Separator dropdowns.
- Removed the dead `<span id="status-msg">` element and its CSS — never used after the switch to toast notifications.

## Setup

After install, visit `chrome://settings/downloads` and turn **off** "Ask where to save each file before downloading". Otherwise Chrome will prompt for every image in a multi-image gallery.

## Files

- `manifest.json` — MV3 manifest
- `themes.js` — shared theme definitions used by both `content.js` and `popup.html`. Exposes `buildThemeStyles(selector, { important })` so each context can stamp out CSS with the right specificity.
- `content.js` — floating Download button injected into reddit.com
- `background.js` — service worker; fetches gallery JSON, builds filenames, drives `chrome.downloads`, converts WebP to JPEG. Reads per-mode format prefs from `modeState[activeMode].formatPrefs`.
- `options.html` / `options.js` / `options.css` — full configuration page. The 9 Format Tweaks per panel are generated at runtime by `buildFormatOptionsHTML(mode)`; native `<select>` controls are wrapped with the custom dropdown widget by `enhanceSelect()`.
- `popup.html` / `popup.js` — toolbar popup for quick settings
- `welcome.html` / `welcome.js` — first-run onboarding tab; links to tips.html
- `tips.html` — standalone "Tips & Recipes" page (6 worked examples), linked from welcome.html and from the Backup & reset row in options.html
- `jszip.min.js` — bundled for ZIP mode
- `Sortable.min.js` — bundled for the drag-and-drop pill builder
- `tests.md` — pre-release test plan. Run through it (or at least the smoke test at the bottom) before publishing a new version.

## Permissions

- `downloads` — to write files to disk
- `storage` — to persist your settings via `chrome.storage.sync`
- Host access to `*.reddit.com` and `*.redd.it` — to fetch gallery metadata and image bytes

No other permissions. No analytics, no remote logging, no telemetry.

## Privacy

- Runs entirely in your browser. No data leaves your machine.
- No accounts, no servers, no tracking.
- Settings sync through `chrome.storage.sync` (Google's built-in extension sync) only if you're signed into Chrome and have extension sync enabled — that's between you and Chrome, the extension itself never sees a server.

## Links

- **Chrome Web Store:** https://chromewebstore.google.com/detail/reddit-picture-gallery-do/abhhhegakoaijhgfefmampphfjgmnapc
- **Source code:** https://github.com/GauravZn/reddit-downloader
- **Support the project:** https://ko-fi.com/gauravzn

90% of all tips go to St. Jude Children's Research Hospital.

---

With love,
Gaurav.
