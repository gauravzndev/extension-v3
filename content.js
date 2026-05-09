const MAX_SAFE_LENGTH = 110;

// Base layout. The 11 theme variants live in themes.js (loaded ahead of us
// via manifest.json) so the popup's live preview pulls from the same source.
const baseStyles = `
  .reddit-gallery-dl-btn {
    position: fixed !important;
    z-index: 2147483647 !important;
    cursor: pointer !important;
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
    transition: all 0.2s ease-in-out !important;
    font-weight: 600 !important;
  }

  .reddit-gallery-dl-btn[data-pos="bottom-right"] { bottom: 30px !important; right: 30px !important; top: auto !important; left: auto !important; }
  .reddit-gallery-dl-btn[data-pos="bottom-left"]  { bottom: 30px !important; left: 30px !important; top: auto !important; right: auto !important; }
  .reddit-gallery-dl-btn[data-pos="top-right"]    { top: 80px !important; right: 30px !important; bottom: auto !important; left: auto !important; }
  .reddit-gallery-dl-btn[data-pos="top-left"]     { top: 80px !important; left: 30px !important; bottom: auto !important; right: auto !important; }

  .reddit-gallery-dl-btn[data-size="compact"] { padding: 8px 16px !important; font-size: 13px !important; }
  .reddit-gallery-dl-btn[data-size="normal"]  { padding: 14px 28px !important; font-size: 15px !important; }
  .reddit-gallery-dl-btn[data-size="large"]   { padding: 18px 36px !important; font-size: 17px !important; }
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = baseStyles + '\n' + buildThemeStyles('.reddit-gallery-dl-btn', { important: true });
document.head.appendChild(styleSheet);

const MINIMAL_LABEL_THEMES = new Set(['theme-premium', 'theme-mono', 'theme-neon']);

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function getButtonContent(customLabel) {
    if (customLabel) return `<span>${escapeHtml(customLabel)}</span>`;
    return `<span style="font-size: 18px;">🚀</span><span>Download Gallery</span>`;
}

function getLoadingText() {
    return "Downloading...";
}

function getSuccessText(themeName, count, total) {
    const trailing = (total && total !== count) ? `${count}/${total}` : `${count}`;
    if (MINIMAL_LABEL_THEMES.has(themeName)) return `${trailing} Saved`;
    return `✅ ${trailing} Files Saved!`;
}

function getFailText(themeName) {
    if (MINIMAL_LABEL_THEMES.has(themeName)) return "No Images";
    return "❌ No Images";
}

let cachedSettings = null;

// Defensive wrapper around chrome.storage.sync.get. The raw API is normally
// available in content scripts when the extension declares "storage" in
// permissions, but in some real-world states it isn't:
//
//   - Enterprise policy disables sync at the profile level.
//   - The tab is a sandboxed iframe / extension iframe with reduced APIs.
//   - Transient extension-context invalidation between an update and the
//     next runtime tick (the content script is still running with a stale
//     handle to chrome.* but storage.sync has been torn down).
//
// In any of those, chrome.storage.sync is undefined and `.get()` throws
// "Cannot read properties of undefined (reading 'get')" — which kills the
// caller and leaves the floating button never mounted. Falling through with
// empty data lets the rest of the script keep working with default
// appearance and no saved formulas, which is a strictly better failure mode.
function safeStorageGet(keys, callback) {
    if (!chrome || !chrome.storage || !chrome.storage.sync) {
        console.warn('[RedditDL] chrome.storage.sync unavailable; falling back to defaults.');
        callback({});
        return;
    }
    try {
        chrome.storage.sync.get(keys, (data) => {
            if (chrome.runtime && chrome.runtime.lastError) {
                console.warn('[RedditDL] chrome.storage.sync.get lastError:', chrome.runtime.lastError.message);
                callback({});
                return;
            }
            callback(data || {});
        });
    } catch (e) {
        console.warn('[RedditDL] chrome.storage.sync.get threw:', e);
        callback({});
    }
}

function loadSettings(callback) {
    safeStorageGet(['buttonTheme', 'buttonPosition', 'buttonSize', 'customButtonLabel', 'keyboardShortcutEnabled', 'globalPrefs', 'modeState'], (s) => {
        cachedSettings = {
            theme: s.buttonTheme || 'theme-native',
            position: s.buttonPosition || 'bottom-right',
            size: s.buttonSize || 'normal',
            customLabel: (s.customButtonLabel || '').trim().slice(0, 40),
            keyboardShortcutEnabled: s.keyboardShortcutEnabled !== false,
            globalPrefs: s.globalPrefs || {},
            modeState: s.modeState || {}
        };
        callback(cachedSettings);
    });
}

function applyButtonAppearance(btn, settings) {
    btn.className = 'reddit-gallery-dl-btn';
    btn.setAttribute('data-theme', settings.theme);
    btn.setAttribute('data-pos', settings.position);
    btn.setAttribute('data-size', settings.size);
    // Don't trample the loading/done text if a download is currently running.
    // The click handler resets the label itself when the cycle finishes.
    if (btn.dataset.busy !== 'true') {
        btn.innerHTML = getButtonContent(settings.customLabel);
    }
}

function isPostPage() {
    // Real post pages always carry /comments/ or /gallery/ in the path —
    // those are unambiguous, button shows immediately even before the
    // shreddit-post element has finished mounting.
    if (window.location.pathname.includes('/comments/')) return true;
    if (window.location.pathname.includes('/gallery/')) return true;
    // #lightbox in the URL means a modal is open over a feed page, but
    // it doesn't tell us *which* post is in the modal. Only claim this
    // is a post page if findActivePostElement actually identifies one —
    // otherwise the button would be clickable in a state where Download
    // can't tell which post to grab, and would deterministically pull
    // the topmost feed entry (the original failure mode).
    if (window.location.href.includes('#lightbox')) {
        return !!findActivePostElement();
    }
    return false;
}

function manageFloatingButton() {
    let btn = document.getElementById('reddit-custom-dl-btn');

    if (!isPostPage()) {
        if (btn) btn.remove();
        return;
    }
    if (btn) {
        // The lightbox gets appended to body AFTER us. Same max z-index, DOM-order
        // wins the tiebreaker, so our button ends up hidden underneath. Bumping it
        // back to the end keeps it on top.
        if (document.body.lastElementChild !== btn) {
            document.body.appendChild(btn);
        }
        return;
    }

    loadSettings((settings) => {
        // The page might have navigated away while storage.get was in flight.
        if (!isPostPage()) return;
        if (document.getElementById('reddit-custom-dl-btn')) return;

        const newBtn = document.createElement("button");
        newBtn.id = "reddit-custom-dl-btn";
        applyButtonAppearance(newBtn, settings);
        document.body.appendChild(newBtn);
        attachClickHandler(newBtn);
    });
}

// Returns the <shreddit-post> element that the user is *actually* looking
// at right now. This is harder than it sounds because Reddit's feed +
// lightbox combo can put the page in any of three states:
//
//   1. Real post page — URL is /r/foo/comments/abc/.../, one shreddit-post
//      in the DOM, easy.
//   2. Subreddit feed — URL is /r/foo/, many shreddit-post in the DOM, no
//      "active" post until you click one.
//   3. Lightbox over the feed — feed posts are still in the DOM, AND a
//      separate post element is rendered inside an open dialog. The URL
//      sometimes pushes to /comments/abc/... and sometimes just appends
//      #lightbox to the feed URL — the latter is the case that broke us.
//
// Strategy: prefer a shreddit-post inside an open dialog (state 3). Then
// match by permalink against the URL (state 1). Only fall back to "first
// shreddit-post in DOM" if we're confidently on a post page; on a bare
// feed URL, returning the first feed post is wrong — that's the topmost
// feed entry, not the post the user actually opened. (Joe's bug.)
function findActivePostElement() {
    // Open dialog selectors covering Reddit's various lightbox host
    // elements over time. Order matters — the most specific markers
    // ("open" attribute, aria-modal) come first so we don't pick up
    // long-lived async loaders that aren't currently presenting a post.
    const modalSelectors = [
        'faceplate-dialog[open]',
        'dialog[open]',
        '[aria-modal="true"]',
        '[role="dialog"]',
        'shreddit-async-loader[bundlename*="lightbox" i]',
        'shreddit-async-loader[bundlename*="post" i]',
        'faceplate-dialog'
    ];
    for (const sel of modalSelectors) {
        const containers = document.querySelectorAll(sel);
        for (const container of containers) {
            const dialogPost = container.querySelector('shreddit-post[permalink]');
            if (dialogPost) return dialogPost;
        }
    }

    // No lightbox host — match by permalink against the current URL.
    const cleanCurrent = window.location.pathname.replace(/\/$/, '');
    const allPosts = document.querySelectorAll('shreddit-post');
    for (const post of allPosts) {
        const permalink = post.getAttribute('permalink');
        if (!permalink) continue;
        const cleanPerma = permalink.replace(/\/$/, '');
        if (cleanCurrent === cleanPerma || cleanCurrent.startsWith(cleanPerma + '/')) {
            return post;
        }
    }

    // Last-resort fallback. Only safe if the URL identifies a post
    // (contains /comments/) — on a bare /r/foo/ feed URL, "first
    // shreddit-post in DOM" is the topmost feed entry, deterministically
    // wrong on every click. Returning null here lets getRawTitle fall
    // through to document.title and the click handler skip the URL
    // override, which is the correct behavior when we genuinely can't
    // identify an active post.
    if (cleanCurrent.includes('/comments/') && allPosts.length >= 1) {
        return allPosts[0];
    }
    return null;
}

// Reads the title from a shreddit-post element if present, otherwise falls
// back to document.title / <h1> (with the boilerplate filter from the
// earlier fix). Pulled out so the click handler can call findActivePostElement
// once and pass the result to both getRawTitleFromPost and the URL builder
// — keeps title and URL in lock-step instead of diverging when the URL is
// ambiguous.
function getRawTitleFromPost(activePost) {
    if (activePost && activePost.getAttribute('post-title')) {
        return activePost.getAttribute('post-title').trim();
    }
    let candidate = '';
    if (document.title) {
        candidate = document.title.split(' : ')[0].split(' | ')[0];
    } else {
        const standardH1 = document.querySelector('h1');
        if (standardH1) candidate = standardH1.innerText;
    }
    candidate = candidate.trim();
    if (!candidate) return '';
    if (/^reddit(\s*[-–—:|]\s*.+)?$/i.test(candidate)) return '';
    if (/^reddit\.com\b/i.test(candidate)) return '';
    return candidate;
}

// Backward-compat shim for any code path that still calls getRawTitle()
// without the active post in hand.
function getRawTitle() {
    return getRawTitleFromPost(findActivePostElement());
}

// Builds a timestamp string used only as the *default value* in the title prompt
// when the post has no real title. Honors the user's Date Format / Date Separator
// / Time Format / Pill Separator settings so it matches everything else they
// see in the live preview. Doesn't get sent to background as a title — empty
// string still goes through, which is what triggers the missing-title rule.
function buildFallbackTitle(prefs) {
    const sep = ((v) => v === 'dash' ? '-' : v === 'space' ? ' ' : v === 'none' ? '' : '_')(
        prefs.fileSeparatorFormat || prefs.separatorFormat || 'space'
    );
    const dateSep = ((v) => v === 'underscore' ? '_' : v === 'space' ? ' ' : v === 'dot' ? '.' : v === 'none' ? '' : '-')(
        prefs.dateSeparatorFormat || 'dash'
    );
    const dateFormat = prefs.dateFormat || 'yyyy-mm-dd';
    const timeFormat = prefs.timeFormat || '24h';

    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    const yy = yyyy.toString().slice(-2);

    let dateStr;
    if (dateFormat === 'dd-mm-yyyy' || dateFormat === 'uk') dateStr = `${dd}${dateSep}${mm}${dateSep}${yyyy}`;
    else if (dateFormat === 'dd-mm-yy')                     dateStr = `${dd}${dateSep}${mm}${dateSep}${yy}`;
    else if (dateFormat === 'mm-dd-yyyy' || dateFormat === 'us') dateStr = `${mm}${dateSep}${dd}${dateSep}${yyyy}`;
    else if (dateFormat === 'mm-dd-yy')                     dateStr = `${mm}${dateSep}${dd}${dateSep}${yy}`;
    else                                                    dateStr = `${yyyy}${dateSep}${mm}${dateSep}${dd}`;

    let hh = now.getHours();
    const mn = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    let timeStr;
    // Mirror background.js's formatTimeFromDate exactly — both 24h and 12h
    // include seconds. Without this, the prompt's placeholder shows HH:MM
    // while the saved file's time/dl_date pills show HH:MM:SS, and the user
    // sees a mismatch the moment they hit Enter.
    if (timeFormat === '12h') {
        const ampm = hh >= 12 ? 'PM' : 'AM';
        hh = hh % 12 || 12;
        timeStr = `${String(hh).padStart(2, '0')}${sep}${mn}${sep}${ss}${sep}${ampm}`;
    } else {
        timeStr = `${String(hh).padStart(2, '0')}${sep}${mn}${sep}${ss}`;
    }

    return `Untitled${sep}${dateStr}${sep}${timeStr}`;
}

function attachClickHandler(btn) {
    btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Find the active post ONCE and use it for both title and URL —
        // they used to be derived independently (title from DOM, URL from
        // window.location.href) and could disagree when Reddit's lightbox
        // didn't push state to the post's permalink. With both rooted in
        // the same element, you can't end up downloading post A's images
        // while showing post B's title in the prompt.
        const activePost = findActivePostElement();
        const rawTitle = getRawTitleFromPost(activePost);

        // Prefer the active post's permalink as the URL we send to
        // background — that's what guarantees the .json fetch hits the
        // right post, even when Reddit's lightbox left window.location at
        // the bare subreddit URL. Only fall back to window.location.href
        // when no active post could be identified (regular post pages
        // with no lightbox involvement land here too — and that's fine,
        // because in that case window.location.href IS the post URL).
        let currentUrl;
        if (activePost && activePost.getAttribute('permalink')) {
            const perma = activePost.getAttribute('permalink').replace(/\/$/, '');
            currentUrl = window.location.origin + perma;
        } else {
            currentUrl = window.location.href.split('?')[0].split('#')[0].replace(/\/$/, "");
        }

        // Diagnostic breadcrumb — when a user reports "No Images" or "wrong
        // title", these lines are the first thing we want in the console:
        // which post was identified, what URL we're sending, and what the
        // raw page state looks like. `usedActivePost` tells us whether the
        // permalink-from-DOM path won or we fell back to window.location.
        console.log('[RedditDL] click', {
            url: currentUrl,
            rawTitleDetected: rawTitle,
            usedActivePost: !!(activePost && activePost.getAttribute('permalink')),
            activePostPermalink: activePost ? activePost.getAttribute('permalink') : null,
            href: window.location.href
        });

        const executeDownload = (finalTitle) => {
            // Mark the button busy so applyButtonAppearance won't overwrite the
            // loading/done message if the user saves popup settings mid-fetch.
            btn.dataset.busy = 'true';
            btn.innerHTML = getLoadingText();

            console.log('[RedditDL] sending fetchAndDownload to background', { url: currentUrl, finalTitle });
            const sendStart = Date.now();
            chrome.runtime.sendMessage({
                action: "fetchAndDownload",
                url: currentUrl,
                title: finalTitle
            }, (response) => {
                const elapsed = Date.now() - sendStart;
                // chrome.runtime.lastError fires here when the background
                // service worker died before responding, the message channel
                // closed, etc. — a separate failure mode from "we ran but
                // found 0 images". Keep them distinguishable in the console.
                if (chrome.runtime.lastError) {
                    console.error('[RedditDL] sendMessage failed after', elapsed, 'ms:', chrome.runtime.lastError.message);
                }
                const themeNow = btn.getAttribute('data-theme') || 'theme-native';
                if (response && response.success) {
                    console.log('[RedditDL] download cycle ok', { elapsedMs: elapsed, count: response.count, total: response.total });
                    btn.innerHTML = getSuccessText(themeNow, response.count, response.total);
                } else {
                    console.warn('[RedditDL] download cycle reported NO IMAGES / failure', { elapsedMs: elapsed, response });
                    btn.innerHTML = getFailText(themeNow);
                }
                setTimeout(() => {
                    delete btn.dataset.busy;
                    // Pull the freshest label/theme in case the user changed them while we were fetching.
                    if (cachedSettings) applyButtonAppearance(btn, cachedSettings);
                    else btn.innerHTML = getButtonContent('');
                }, 3000);
            });
        };

        // Same defensive path as loadSettings — chrome.storage.sync can be
        // undefined in restricted Chrome states. Default to {} and proceed
        // with built-in defaults rather than crash mid-click.
        safeStorageGet(['globalPrefs', 'modeState', 'downloadMode'], (data) => {
            const prefs = data.globalPrefs || {};
            const modeState = data.modeState || {};
            const activeMode = data.downloadMode || prefs.activeMode || 'folder';

            const isPromptEnabled = prefs.promptCustomTitle || false;

            const truncateRule = modeState[activeMode]?.fallbacks?.truncate || 'auto';

            let formattedCleanTitle = rawTitle.replace(/[\\/:*?"<>|]/g, "").trim();
            const isTooLong = formattedCleanTitle.length > MAX_SAFE_LENGTH;

            // The prompt needs *something* in its default field. If the post had
            // a real title, use it (truncated). Otherwise fall back to a timestamp
            // built from the user's date/time format settings. Either way,
            // formattedCleanTitle (the value we'll actually send to background)
            // stays empty when the post has no title, so the missing-title rule
            // still fires there.
            const promptDefault = formattedCleanTitle
                ? formattedCleanTitle.substring(0, MAX_SAFE_LENGTH)
                : buildFallbackTitle(prefs);

            const askForTitle = (cb) => {
                const message =
                    `Default title:\n${promptDefault}\n\n` +
                    `Enter a custom title for this gallery (or press Enter to keep the default):`;
                const input = window.prompt(message, promptDefault);
                if (input !== null) {
                    let typed = input.trim() || "Untitled_Gallery";
                    cb(typed.replace(/[\\/:*?"<>|]/g, ""));
                }
            };

            if (isPromptEnabled) {
                askForTitle(executeDownload);
            } else if (isTooLong && truncateRule === 'prompt') {
                askForTitle(executeDownload);
            } else {
                if (isTooLong && truncateRule === 'auto') {
                    formattedCleanTitle = formattedCleanTitle.substring(0, MAX_SAFE_LENGTH).trim();
                }
                executeDownload(formattedCleanTitle);
            }
        });
    });
}

// We used to poll every 500ms. MutationObserver does the same job for nearly free.
let observerScheduled = false;
const scheduleCheck = () => {
    if (observerScheduled) return;
    observerScheduled = true;
    requestAnimationFrame(() => {
        observerScheduled = false;
        manageFloatingButton();
    });
};

const bodyObserver = new MutationObserver(scheduleCheck);
const startObserving = () => {
    if (document.body) {
        // subtree: true so we catch shreddit-post and friends the moment
        // they mount anywhere in the DOM, not just as direct children of
        // <body>. Reddit's SPA almost always injects deep, so subtree:false
        // meant we'd sit waiting for a History/hashchange event before the
        // button appeared. The rAF debounce above keeps the cost bounded —
        // manageFloatingButton is a handful of O(1) checks per frame.
        bodyObserver.observe(document.body, { childList: true, subtree: true });
        scheduleCheck();
    } else {
        setTimeout(startObserving, 50);
    }
};
startObserving();

// Reddit is an SPA, so most navigations don't touch <body>. Hook the History API
// and the hash/popstate events so we still notice when the URL changes.
const _pushState = history.pushState;
const _replaceState = history.replaceState;
history.pushState = function () { _pushState.apply(this, arguments); scheduleCheck(); };
history.replaceState = function () { _replaceState.apply(this, arguments); scheduleCheck(); };
window.addEventListener('popstate', scheduleCheck);
window.addEventListener('hashchange', scheduleCheck);

// Alt+Shift+D shortcut. Plain Alt+D is taken by Chrome / Firefox / Edge
// for "focus the address bar", so adding Shift escapes the conflict while
// keeping the "D for Download" mnemonic. Three-key combos are also less
// prone to accidental triggers. We listen at the window in capture phase
// so we run before Reddit's own hotkeys (J/K/A/Z) can swallow the keystroke.
function isTypingTarget(target) {
    if (!target) return false;
    if (target.isContentEditable) return true;
    const tag = (target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return true;
    // Reddit's reply box is a shadow DOM editor; fall back to its role attribute.
    const role = target.getAttribute && target.getAttribute('role');
    if (role === 'textbox' || role === 'combobox') return true;
    return false;
}

function handleKeyboardShortcut(e) {
    if (!cachedSettings || cachedSettings.keyboardShortcutEnabled === false) return;
    // e.code is the physical key position — stable across keyboard layouts.
    // e.key would be '∂' on macOS US-layout under Alt+D, or some other dead-key
    // glyph in non-Latin layouts; e.code is always 'KeyD' for the same physical key.
    if (e.code !== 'KeyD') return;
    if (!e.altKey || !e.shiftKey || e.ctrlKey || e.metaKey) return;
    if (e.repeat) return;
    if (isTypingTarget(e.target)) return;

    const btn = document.getElementById('reddit-custom-dl-btn');
    if (!btn) return;

    e.preventDefault();
    e.stopPropagation();
    btn.click();
}
window.addEventListener('keydown', handleKeyboardShortcut, true);

// Same defensive guard as on storage.sync.get — onChanged may not exist in
// the restricted contexts that drop storage.sync. Without this check, the
// content script throws on script init and never even mounts the button.
if (chrome && chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace !== 'sync') return;
        const relevant = ['buttonTheme', 'buttonPosition', 'buttonSize', 'customButtonLabel', 'keyboardShortcutEnabled'];
        if (!relevant.some(k => changes[k])) return;

        loadSettings((settings) => {
            const activeBtn = document.getElementById("reddit-custom-dl-btn");
            if (activeBtn) applyButtonAppearance(activeBtn, settings);
        });
    });
}
