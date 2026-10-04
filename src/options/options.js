document.addEventListener('DOMContentLoaded', function() {
    const snapToTargetHorizontallyCheckbox = document.getElementById('snapToTargetHorizontally');

    // Load saved options from Chrome storage if available
    if (typeof chrome !== "undefined" && chrome.storage) {
        chrome.storage.sync.get(['snapToTargetHorizontally', 'blacklistDomains'], function(configs) {
            if (configs.snapToTargetHorizontally !== undefined) {
                snapToTargetHorizontallyCheckbox.checked = configs.snapToTargetHorizontally;
            }
            if (configs.blacklistDomains !== undefined) {
                document.getElementById('blacklistDomains').value = configs.blacklistDomains;
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
});