# Reddit Picture Gallery Downloader

One-click downloader for Reddit galleries. Save full-resolution photos from any Reddit post — single image, multi-image gallery, or full subreddit thread — straight to your computer with a single press.

**[➡️ Available on the Chrome Web Store](https://chromewebstore.google.com/detail/reddit-picture-gallery-do/abhhhegakoaijhgfefmampphfjgmnapc)**

Keywords: *Reddit downloader · Reddit image downloader · Reddit gallery downloader · Reddit picture downloader · Reddit photo saver · Bulk image downloader · Reddit album saver · Save Reddit pictures · Download Reddit posts · Reddit zip downloader · Subreddit image downloader · One-click Reddit · Reddit lightbox download · Reddit WebP to JPG · Reddit batch save*

---

## 📋 Chrome Web Store description (copy-paste this into the CWS listing)

> 🚀 **Reddit Picture Gallery Downloader (v2.2)**
>
> Download high-resolution Reddit image galleries and posts with a single click. No more right-clicking through twelve images one at a time — press the button, get the whole gallery.
>
> Works on every modern Reddit page: post pages, gallery posts, single images, and now the fullscreen lightbox viewer too. Pulls source images straight from Reddit's metadata at original quality, no compression, no watermarking, nothing leaves your machine.
>
> ━━━━━━━━━━━━━━━━━━
> ✨ **What's new in v2.2**
>
> • **WebP → JPEG conversion** — Reddit serves a lot of WebP previews these days, but Windows Photos and most gallery apps still don't open them cleanly. The downloader now decodes and re-encodes WebP into JPEG on the fly so every saved file just works. JPG/PNG galleries still use Chrome's native fast download path — only WebP gets the conversion.
> • **Lightbox support** — The floating Download button now stays visible when you click an image to open Reddit's fullscreen lightbox viewer. Grab the whole gallery from inside the lightbox without backing out to the post.
> • **Smarter "missing title" defaults** — When a post has no usable title, the downloader now omits the Title pill from the filename by default instead of inserting a placeholder string. Cleaner filenames out of the box. Switch to "Use a placeholder" any time in Settings — the placeholder defaults to "No Title" and is fully editable.
> • **Cleaner status text** — The button reads "Downloading..." while it works, then "✅ X Files Saved!" when it's done. No emoji clutter mid-download.
> • **Minimal popup design** — Toned down the popup's branding so it blends with your browser's color scheme.
> • **Native title prompt** — Optional pre-download "rename this gallery" prompt now uses your browser's built-in dialog, which means Reddit's keyboard shortcuts (J/K/etc.) can't steal your keystrokes while you're typing. Press Enter to keep the default title, type to override, Esc to cancel.
> • **12-hour time format respects your separator** — Picking dash gets you "02-30-00-PM" instead of the old hardcoded "02-30-00_PM".
> • **Mid-download safety** — Saving a settings change while a 10-image gallery is still downloading no longer wipes the loading/done message. The button keeps its progress text and refreshes itself when the cycle finishes.
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
- Date Format dropdown labels rewritten from `YYYY MM DD` (which falsely implied a space separator) to `Year, Month, Day`. Time Format labels similarly clarified. Both got info-icon tooltips pointing users at the related Date Separator / Element Separator dropdowns.
- Removed the dead `<span id="status-msg">` element and its CSS — never used after the switch to toast notifications.

## Setup

After install, visit `chrome://settings/downloads` and turn **off** "Ask where to save each file before downloading". Otherwise Chrome will prompt for every image in a multi-image gallery.

## Files

- `manifest.json` — MV3 manifest
- `themes.js` — shared theme definitions used by both `content.js` and `popup.html`. Exposes `buildThemeStyles(selector, { important })` so each context can stamp out CSS with the right specificity.
- `content.js` — floating Download button injected into reddit.com
- `background.js` — service worker; fetches gallery JSON, builds filenames, drives `chrome.downloads`, converts WebP to JPEG
- `options.html` / `options.js` / `options.css` — full configuration page
- `popup.html` / `popup.js` — toolbar popup for quick settings
- `welcome.html` / `welcome.js` — first-run onboarding tab
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
