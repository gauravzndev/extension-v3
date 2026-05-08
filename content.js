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

function loadSettings(callback) {
    chrome.storage.sync.get(['buttonTheme', 'buttonPosition', 'buttonSize', 'customButtonLabel', 'keyboardShortcutEnabled', 'globalPrefs', 'modeState'], (s) => {
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
    return window.location.pathname.includes('/comments/') ||
           window.location.pathname.includes('/gallery/') ||
           window.location.href.includes('#lightbox');
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

// Returns the post's title or an empty string if we can't find a real one.
// Empty is meaningful: background.js's "if title is missing" rule (omit /
// placeholder) only fires when the title slot is actually empty. The earlier
// version fabricated a timestamp here, which silently bypassed that rule.
function getRawTitle() {
    let rawTitle = "";
    const currentPath = window.location.pathname;
    const allPosts = document.querySelectorAll('shreddit-post');
    let activePost = null;

    for (let post of allPosts) {
        let permalink = post.getAttribute('permalink');
        if (permalink && currentPath.includes(permalink.replace(/\/$/, ""))) {
            activePost = post;
            break;
        }
    }

    if (!activePost) activePost = document.querySelector('shreddit-post');

    if (activePost && activePost.getAttribute('post-title')) {
        rawTitle = activePost.getAttribute('post-title');
    } else if (document.title) {
        rawTitle = document.title.split(' : ')[0].split(' | ')[0];
    } else {
        const standardH1 = document.querySelector('h1');
        if (standardH1) rawTitle = standardH1.innerText;
    }

    if (!rawTitle || rawTitle.trim().length === 0 || rawTitle.toLowerCase().includes('reddit')) {
        return '';
    }
    return rawTitle;
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
    let timeStr;
    if (timeFormat === '12h') {
        const ampm = hh >= 12 ? 'PM' : 'AM';
        hh = hh % 12 || 12;
        timeStr = `${String(hh).padStart(2, '0')}${sep}${mn}${sep}${ampm}`;
    } else {
        timeStr = `${String(hh).padStart(2, '0')}${sep}${mn}`;
    }

    return `Untitled${sep}${dateStr}${sep}${timeStr}`;
}

function attachClickHandler(btn) {
    btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        const rawTitle = getRawTitle();
        const currentUrl = window.location.href.split('?')[0].split('#')[0].replace(/\/$/, "");

        const executeDownload = (finalTitle) => {
            // Mark the button busy so applyButtonAppearance won't overwrite the
            // loading/done message if the user saves popup settings mid-fetch.
            btn.dataset.busy = 'true';
            btn.innerHTML = getLoadingText();

            chrome.runtime.sendMessage({
                action: "fetchAndDownload",
                url: currentUrl,
                title: finalTitle
            }, (response) => {
                const themeNow = btn.getAttribute('data-theme') || 'theme-native';
                if (response && response.success) {
                    btn.innerHTML = getSuccessText(themeNow, response.count, response.total);
                } else {
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

        chrome.storage.sync.get(['globalPrefs', 'modeState', 'downloadMode'], (data) => {
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
        bodyObserver.observe(document.body, { childList: true, subtree: false });
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

// Alt+D shortcut. We listen at the window in capture phase so we run before
// Reddit's own hotkeys can swallow the keystroke.
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
    if (e.key !== 'd' && e.key !== 'D') return;
    if (!e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    if (e.repeat) return;
    if (isTypingTarget(e.target)) return;

    const btn = document.getElementById('reddit-custom-dl-btn');
    if (!btn) return;

    e.preventDefault();
    e.stopPropagation();
    btn.click();
}
window.addEventListener('keydown', handleKeyboardShortcut, true);

chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace !== 'sync') return;
    const relevant = ['buttonTheme', 'buttonPosition', 'buttonSize', 'customButtonLabel', 'keyboardShortcutEnabled'];
    if (!relevant.some(k => changes[k])) return;

    loadSettings((settings) => {
        const activeBtn = document.getElementById("reddit-custom-dl-btn");
        if (activeBtn) applyButtonAppearance(activeBtn, settings);
    });
});
