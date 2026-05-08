// Inject per-theme styles for the live preview button. Source of truth for the
// themes lives in themes.js (loaded before us); same data backs the actual
// floating button on Reddit, so the preview can't drift from reality.
(function injectThemeStyles() {
    const el = document.createElement('style');
    el.textContent = buildThemeStyles('.preview-btn');
    document.head.appendChild(el);
})();

// Custom dropdown widget — same shape as the one on the options page. Every
// native <select> is wrapped with a trigger + body-anchored listbox so the
// OS-rendered blue selection highlight never appears in the popup either.
// Keeps the popup and the settings page visually identical, and means the
// dropdown background stays grey instead of blue when opened.
function enhanceSelect(nativeSelect) {
    if (nativeSelect.dataset.enhanced === 'true') return;
    nativeSelect.dataset.enhanced = 'true';

    const wrapper = document.createElement('div');
    wrapper.className = 'custom-select';

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'custom-select-trigger';
    trigger.innerHTML =
        '<span class="custom-select-label"></span>' +
        '<svg class="custom-select-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';

    const labelEl = trigger.querySelector('.custom-select-label');

    const listbox = document.createElement('ul');
    listbox.className = 'custom-select-listbox';
    listbox.setAttribute('role', 'listbox');

    function rebuildOptions() {
        listbox.innerHTML = '';
        Array.from(nativeSelect.options).forEach((opt) => {
            const li = document.createElement('li');
            li.className = 'custom-select-option';
            li.setAttribute('role', 'option');
            li.dataset.value = opt.value;
            li.textContent = opt.textContent;
            if (opt.value === nativeSelect.value) li.setAttribute('aria-selected', 'true');
            li.addEventListener('click', (e) => {
                e.stopPropagation();
                nativeSelect.value = opt.value;
                nativeSelect.dispatchEvent(new Event('change', { bubbles: true }));
                syncLabel();
                close();
            });
            listbox.appendChild(li);
        });
    }

    function syncLabel() {
        const opt = nativeSelect.options[nativeSelect.selectedIndex];
        labelEl.textContent = opt ? opt.textContent : '';
        Array.from(listbox.children).forEach(li => {
            if (li.dataset.value === nativeSelect.value) li.setAttribute('aria-selected', 'true');
            else li.removeAttribute('aria-selected');
        });
    }

    function position() {
        const rect = trigger.getBoundingClientRect();
        const margin = 8;

        // Always anchor below the trigger; cap max-height so the listbox
        // stays inside the small popup viewport.
        const spaceBelow = Math.max(120, window.innerHeight - rect.bottom - margin - 6);
        listbox.style.maxHeight = Math.min(240, spaceBelow) + 'px';

        listbox.style.minWidth = rect.width + 'px';
        listbox.style.maxWidth = Math.min(320, window.innerWidth - 12) + 'px';
        listbox.style.left = rect.left + 'px';
        listbox.style.top = (rect.bottom + 4) + 'px';

        const lb = listbox.getBoundingClientRect();
        if (lb.right > window.innerWidth - margin) {
            const shift = lb.right - (window.innerWidth - margin);
            listbox.style.left = Math.max(margin, rect.left - shift) + 'px';
        }
    }

    let isOpen = false;

    function open() {
        if (isOpen) return;
        rebuildOptions();
        syncLabel();
        if (listbox.parentNode !== document.body) document.body.appendChild(listbox);
        position();
        requestAnimationFrame(() => listbox.classList.add('is-open'));
        wrapper.classList.add('is-open');
        document.addEventListener('click', onDocClick, true);
        document.addEventListener('keydown', onKeyDown, true);
        window.addEventListener('scroll', closeOnScroll, true);
        window.addEventListener('resize', closeOnScroll);
        isOpen = true;
    }

    function close() {
        if (!isOpen) return;
        listbox.classList.remove('is-open');
        wrapper.classList.remove('is-open');
        document.removeEventListener('click', onDocClick, true);
        document.removeEventListener('keydown', onKeyDown, true);
        window.removeEventListener('scroll', closeOnScroll, true);
        window.removeEventListener('resize', closeOnScroll);
        isOpen = false;
    }

    function closeOnScroll(e) {
        if (e && listbox.contains(e.target)) return;
        close();
    }

    function onDocClick(e) {
        if (wrapper.contains(e.target) || listbox.contains(e.target)) return;
        close();
    }

    function onKeyDown(e) {
        if (e.key === 'Escape') { close(); trigger.focus(); return; }
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            const opts = Array.from(nativeSelect.options);
            let idx = nativeSelect.selectedIndex;
            idx = e.key === 'ArrowDown'
                ? Math.min(opts.length - 1, idx + 1)
                : Math.max(0, idx - 1);
            nativeSelect.value = opts[idx].value;
            nativeSelect.dispatchEvent(new Event('change', { bubbles: true }));
            syncLabel();
        } else if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            close();
        }
    }

    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isOpen) close(); else open();
    });

    nativeSelect.addEventListener('change', syncLabel);

    nativeSelect.parentNode.insertBefore(wrapper, nativeSelect);
    wrapper.appendChild(nativeSelect);
    wrapper.appendChild(trigger);
    syncLabel();
}

const descriptions = {
    folder: "One sub-folder per gallery, images tucked inside.",
    zip: "One .zip per gallery — easy to share.",
    individual: "Images straight into your downloads folder, no wrapper."
};

function updateDescription() {
    const mode = document.getElementById('downloadMode').value;
    const helper = document.getElementById('modeDescription');
    if (helper) helper.textContent = descriptions[mode];
}

function updatePreview() {
    const theme = document.getElementById('buttonTheme').value;
    const size = document.getElementById('buttonSize').value;
    const customLabel = (document.getElementById('customButtonLabel').value || '').trim();

    const previewBtn = document.getElementById('previewBtn');
    const labelText = previewBtn.querySelector('.preview-label-text');
    const emoji = previewBtn.querySelector('.preview-emoji');

    previewBtn.setAttribute('data-theme', theme);
    previewBtn.setAttribute('data-size', size);

    if (customLabel) {
        labelText.textContent = customLabel;
        emoji.style.display = 'none';
    } else {
        labelText.textContent = 'Download Gallery';
        emoji.style.display = 'inline';
    }
}

function saveOptions() {
    const folderName = document.getElementById('folderName').value.trim() || 'reddit_downloads';
    const downloadMode = document.getElementById('downloadMode').value;
    const buttonTheme = document.getElementById('buttonTheme').value;
    const buttonPosition = document.getElementById('buttonPosition').value;
    const buttonSize = document.getElementById('buttonSize').value;
    const customButtonLabel = document.getElementById('customButtonLabel').value.trim().slice(0, 40);

    chrome.storage.sync.set({
        preferredFolder: folderName,
        downloadMode: downloadMode,
        buttonTheme: buttonTheme,
        buttonPosition: buttonPosition,
        buttonSize: buttonSize,
        customButtonLabel: customButtonLabel
    }, () => {
        const saveBtn = document.getElementById('saveBtn');
        saveBtn.classList.add('saved');
        setTimeout(() => window.close(), 850);
    });
}

function restoreOptions() {
    chrome.storage.sync.get({
        preferredFolder: 'reddit_downloads',
        downloadMode: 'folder',
        buttonTheme: 'theme-native',
        buttonPosition: 'bottom-right',
        buttonSize: 'normal',
        customButtonLabel: ''
    }, (items) => {
        document.getElementById('folderName').value = items.preferredFolder;
        document.getElementById('downloadMode').value = items.downloadMode;
        document.getElementById('customButtonLabel').value = items.customButtonLabel || '';

        const safeSelect = (id, value, fallback) => {
            const el = document.getElementById(id);
            const valid = Array.from(el.options).map(opt => opt.value);
            el.value = valid.includes(value) ? value : fallback;
        };
        safeSelect('buttonTheme', items.buttonTheme, 'theme-native');
        safeSelect('buttonPosition', items.buttonPosition, 'bottom-right');
        safeSelect('buttonSize', items.buttonSize, 'normal');

        // Programmatic .value = doesn't fire change. Fire one on each native
        // select so the custom dropdown widgets sync their visible labels.
        document.querySelectorAll('select').forEach(s => {
            s.dispatchEvent(new Event('change', { bubbles: true }));
        });

        updateDescription();
        updatePreview();
    });
}

document.getElementById('downloadMode').addEventListener('change', updateDescription);
['buttonTheme', 'buttonPosition', 'buttonSize'].forEach(id => {
    document.getElementById(id).addEventListener('change', updatePreview);
});
document.getElementById('customButtonLabel').addEventListener('input', updatePreview);

// Wrap every native <select> with the custom dropdown widget BEFORE we restore
// values, so the trigger labels paint correctly on first render.
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('select').forEach(enhanceSelect);
    restoreOptions();
});

document.getElementById('saveBtn').addEventListener('click', saveOptions);

document.getElementById('customizeNamingBtn').addEventListener('click', () => {
    if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
    } else {
        window.open(chrome.runtime.getURL('options.html'));
    }
});
