document.addEventListener('DOMContentLoaded', function() {
    const snapToTargetHorizontallyCheckbox = document.getElementById('snapToTargetHorizontally');

    // Load saved options from Chrome storage if available
    if (typeof chrome !== "undefined" && chrome.storage) {
        chrome.storage.sync.get(['snapToTargetHorizontally'], function(configs) {
            if (configs.snapToTargetHorizontally !== undefined) {
                snapToTargetHorizontallyCheckbox.checked = configs.snapToTargetHorizontally;
            }
        });
    }

    // Save options when checkbox is changed
    snapToTargetHorizontallyCheckbox.addEventListener('change', function() {
        if (typeof chrome !== "undefined" && chrome.storage) {
            chrome.storage.sync.set({ snapToTargetHorizontally: this.checked });
        }
    });
});