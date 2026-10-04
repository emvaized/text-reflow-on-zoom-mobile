document.addEventListener('DOMContentLoaded', function() {
    const snapToTargetHorizontallyCheckbox = document.getElementById('snapToTargetHorizontally');

    // Load saved options from Chrome storage if available
    if (typeof chrome !== "undefined" && chrome.storage) {
        chrome.storage.sync.get(['snapToTargetHorizontally', 'blacklistDomains', 'supportOneFingerZoom'], function(configs) {
            if (configs.snapToTargetHorizontally !== undefined) {
                snapToTargetHorizontallyCheckbox.checked = configs.snapToTargetHorizontally;
            }
            if (configs.blacklistDomains !== undefined) {
                document.getElementById('blacklistDomains').value = configs.blacklistDomains;
            }
            if (configs.supportOneFingerZoom !== undefined) {
                document.getElementById('supportOneFingerZoom').checked = configs.supportOneFingerZoom;
            }
        });
    }

    // Save options when checkbox is changed
    snapToTargetHorizontallyCheckbox.addEventListener('change', function() {
        if (typeof chrome !== "undefined" && chrome.storage) {
            chrome.storage.sync.set({ snapToTargetHorizontally: this.checked });
        }
    });

    // Save blacklist domains when input is changed
    document.getElementById('blacklistDomains').addEventListener('change', function() {
        if (typeof chrome !== "undefined" && chrome.storage) {
            chrome.storage.sync.set({ blacklistDomains: this.value });
        }
    });

    // Save one-finger zoom option when checkbox is changed
    document.getElementById('supportOneFingerZoom').addEventListener('change', function() {
        if (typeof chrome !== "undefined" && chrome.storage) {
            chrome.storage.sync.set({ supportOneFingerZoom: this.checked });
        }
    });
});