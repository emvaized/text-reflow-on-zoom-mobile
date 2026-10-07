document.addEventListener('DOMContentLoaded', function() {
    const snapToTargetHorizontallyCheckbox = document.getElementById('snapToTargetHorizontally');

    // Load saved options from Chrome storage if available
    if (typeof chrome !== "undefined" && chrome.storage) {
        chrome.storage.sync.get(['snapToTargetHorizontally', 'blacklistDomains', 'supportOneFingerZoom', 'activateOnlyOnNonMobileView'], function(configs) {
            console.log(configs);

            snapToTargetHorizontallyCheckbox.checked = configs.snapToTargetHorizontally ?? true;
            document.getElementById('blacklistDomains').value = configs.blacklistDomains || 'youtube.com,maps.google.com,tiktok.com';
            document.getElementById('supportOneFingerZoom').checked = configs.supportOneFingerZoom ?? true;
            document.getElementById('activateOnlyOnNonMobileView').checked = configs.activateOnlyOnNonMobileView ?? false;
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

    setFooterButtons();
});

function setFooterButtons(){
    document.querySelector("#donateButton").addEventListener("click", function () {
        window.open('https://github.com/emvaized/emvaized.github.io/wiki/Donate-Page', '_blank');
    });
    
    document.querySelector("#githubButton").addEventListener("click", function () {
        window.open('https://github.com/emvaized/text-reflow-on-zoom-mobile', '_blank');
    });
    document.querySelector("#writeAReviewButton").addEventListener("click", function () {
        const isFirefox = navigator.userAgent.indexOf("Firefox") > -1;
        window.open(isFirefox ? 'https://addons.mozilla.org/firefox/addon/text-reflow-on-zoom-mobile/' : 'https://addons.mozilla.org/firefox/addon/text-reflow-on-zoom-mobile/', '_blank');
    });
}