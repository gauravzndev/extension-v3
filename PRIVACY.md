# Privacy Policy for Reddit Picture Gallery Downloader

_Last updated: 2026-05-08 (covers v2.3)_

## 1. Overview

Reddit Picture Gallery Downloader runs entirely on your own machine. We don't collect, transmit, sell, or share any personal data, browsing history, or usage telemetry. There are no servers we control — the extension talks directly to Reddit and to your own filesystem, and that's it.

## 2. What is stored, and where

All your settings live in `chrome.storage.sync`. That includes:

- Your **base download folder** name and **download mode** (Folder / ZIP / Individual)
- The **button appearance** you've picked (theme, position, size, custom label)
- Your **naming formulas** for each download mode (folder names, archive names, image filenames)
- Per-mode **format preferences** (separators, date format, time format, Title case, Unique ID style, etc.)
- Per-mode **fallback rules** (path-too-long behaviour, missing-title behaviour, single-image gallery behaviour)
- Any **custom static-text pills** you've created
- Toggle states for **"prompt for custom title"** and **"Alt + D shortcut"**

Because we use `chrome.storage.sync`, **if you have Chrome sync enabled and are signed into a Google account, your settings travel through Google's sync infrastructure to your other Chrome installations**. That's the same handling Google applies to your bookmarks, browser settings, and extensions list. The extension itself never sees a server. If you'd rather your settings stay on this device only, sign out of Chrome sync or turn off extension sync at `chrome://settings/syncSetup`.

## 3. Permissions, in plain language

The extension uses three Chrome permissions, each for a specific reason:

- **`downloads`** — required to write image and ZIP files to your computer's downloads folder. Without it, the extension couldn't save anything.
- **`storage`** — used to keep the settings listed above. Read/write only to your own browser profile; never sent anywhere by us.
- **Host access to `*.reddit.com` and `*.redd.it`** — required to fetch the JSON metadata that describes each Reddit post (so we know which images are in the gallery) and to download the image bytes themselves from Reddit's CDN. Both hosts are Reddit's own.

That's the complete list. We don't request `tabs`, `activeTab`, `webRequest`, `cookies`, `history`, or any other permission that could observe your browsing.

## 4. Network activity

Every network request the extension makes is to a Reddit-owned host:

- `*.reddit.com` — Reddit's JSON API (`/comments/.../.json`) for gallery metadata
- `*.redd.it`, `i.redd.it`, `preview.redd.it` — Reddit's CDN, where the actual image bytes live

WebP images are fetched and re-encoded to JPEG inside the extension's service worker using your browser's built-in `OffscreenCanvas` (so the saved file opens cleanly in Windows Photos and similar viewers). That decoding happens locally; nothing leaves your machine.

## 5. Backup files

If you click **Export Settings** in the options page, the extension saves a JSON file containing your full configuration into your downloads folder. That file is yours — it's not uploaded anywhere. **Import Settings** reads a JSON file from your disk back into the extension. Both stay local.

## 6. What we don't do

To be explicit about the things we **don't** do:

- No analytics, tracking pixels, error reporters, or telemetry
- No third-party SDKs of any kind bundled into the extension
- No remote configuration — the extension's behaviour is fully determined by your local settings
- No accounts, logins, or user identifiers
- No selling, sharing, or transmitting data of any kind

## 7. Changes to this policy

If we ever change what data the extension handles, this file is updated and the date at the top changes. Material changes will also be called out in the Chrome Web Store listing's "What's new" notes for the affected version.

## 8. Contact

Questions, concerns, or suggestions: **gauravjain.tech@gmail.com**

The full source code is available at <https://github.com/GauravZn/reddit-downloader> if you'd like to verify any of the claims above for yourself.
