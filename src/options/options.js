document.addEventListener('DOMContentLoaded', function() {
    const snapToTargetHorizontallyCheckbox = document.getElementById('snapToTargetHorizontally');

    // Load saved options from Chrome storage if available
    if (typeof chrome !== "undefined" && chrome.storage) {
        chrome.storage.sync.get(['snapToTargetHorizontally', 'blacklistDomains', 'supportOneFingerZoom', 'activateOnlyOnNonMobileView'], function(configs) {
            if (configs.snapToTargetHorizontally !== undefined) {
                snapToTargetHorizontallyCheckbox.checked = configs.snapToTargetHorizontally;
            }
            if (configs.blacklistDomains !== undefined) {
                document.getElementById('blacklistDomains').value = configs.blacklistDomains;
            }
            if (configs.supportOneFingerZoom !== undefined) {
                document.getElementById('supportOneFingerZoom').checked = configs.supportOneFingerZoom;
            }
            if (configs.activateOnlyOnNonMobileView !== undefined) {
                document.getElementById('activateOnlyOnNonMobileView').checked = configs.activateOnlyOnNonMobileView;
            }
        });
    }

    // snap to target element horizontally after reflow
    snapToTargetHorizontallyCheckbox.addEventListener('change', function() {
        if (typeof chrome !== "undefined" && chrome.storage) {
            chrome.storage.sync.set({ snapToTargetHorizontally: this.checked });
        }
    });

    // blacklist domains
    document.getElementById('blacklistDomains').addEventListener('change', function() {
        if (typeof chrome !== "undefined" && chrome.storage) {
            chrome.storage.sync.set({ blacklistDomains: this.value });
        }
    });

    // one-finger zoom
    document.getElementById('supportOneFingerZoom').addEventListener('change', function() {
        if (typeof chrome !== "undefined" && chrome.storage) {
            chrome.storage.sync.set({ supportOneFingerZoom: this.checked });
        }
    });

    // activate only on non-mobile view
    document.getElementById('activateOnlyOnNonMobileView').addEventListener('change', function() {
        if (typeof chrome !== "undefined" && chrome.storage) {
            chrome.storage.sync.set({ activateOnlyOnNonMobileView: this.checked });
        }
    });
});