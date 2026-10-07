// ==UserScript==
// @name         Text reflow on zoom for mobile (text wrap)
// @name:ru      Text reflow on zoom for mobile (text wrap)
// @description  Fits all text to the screen width after a pinch gesture on phone 
// @description:ru  Подгонка текста под ширину экрана после жеста увеличения на телефоне
// @version      1.2.0
// @author       emvaized
// @license      MIT
// @homepageURL  https://github.com/emvaized/text-reflow-on-zoom-mobile
// @downloadURL  https://github.com/emvaized/text-reflow-on-zoom-mobile/raw/refs/heads/main/src/text_reflow_on_pinch_zoom.js
// @namespace    text_reflow_on_pinch_zoom
// @match        *://*/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(async function() {
    'use strict';

    const xpathSelector = `
    //p |
    //a[normalize-space(text())] |
    //h1 |
    //h2 |
    //h3 |
    //h4 |
    //h5 |
    //h6 |
    //li |
    //pre |
    //div[b or em or i or normalize-space(text()) or span[normalize-space(text())]]
`;

    const TEXT_CLASS = 'textReflowScript';
    const SCROLL_PADDING_CLASS = 'textReflowScrollPadding';

    let isCssInjected = false;
    let isPinching = false;
    let zoomTarget = null;
    let targetViewportOffset = null;
    let targetElement = null;
    let zoomTargetRect = null;

    let lastTapDownTime = 0; // To track timing between taps
    const doubleTapTimeout = 200; // Timeout for second tap in milliseconds

    // Options
    let blacklistDomains = 'youtube.com,maps.google.com,tiktok.com';
    let snapToTargetHorizontally = true; // Snap to target element horizontally after reflow
    let supportOneFingerZoom = true; // Option to support one-finger zoom (double-tap + move finger up or down)
    let activateOnlyOnNonMobileView = false; // Option to activate only on non-mobile view (desktop view)
        
    // Load saved options from Chrome storage if available
    if (typeof chrome !== "undefined" && chrome.storage) {
        const loadedConfigs = await chrome.storage.sync.get(['snapToTargetHorizontally', 'blacklistDomains', 'supportOneFingerZoom', 'activateOnlyOnNonMobileView']);
        if (loadedConfigs) {
            snapToTargetHorizontally = loadedConfigs.snapToTargetHorizontally !== undefined ? loadedConfigs.snapToTargetHorizontally : snapToTargetHorizontally;
            blacklistDomains = loadedConfigs.blacklistDomains || blacklistDomains;
            supportOneFingerZoom = loadedConfigs.supportOneFingerZoom !== undefined ? loadedConfigs.supportOneFingerZoom : supportOneFingerZoom;
            activateOnlyOnNonMobileView = loadedConfigs.activateOnlyOnNonMobileView !== undefined ? loadedConfigs.activateOnlyOnNonMobileView : activateOnlyOnNonMobileView;
        }

        chrome.storage.onChanged.addListener((c) => {
            if (c.snapToTargetHorizontally){
                snapToTargetHorizontally = c.snapToTargetHorizontally.newValue;
            }
            if (c.blacklistDomains){
                blacklistDomains = c.blacklistDomains.newValue;
            }
            if (c.supportOneFingerZoom){
                supportOneFingerZoom = c.supportOneFingerZoom.newValue;
            }
            if (c.activateOnlyOnNonMobileView){
                activateOnlyOnNonMobileView = c.activateOnlyOnNonMobileView.newValue;
            }
        });
    }

    // Prevent reflow on blacklisted domains
    const currentDomain = window.location.hostname;
    const blacklistedDomainsArray = blacklistDomains.split(',').map(domain => domain.trim());
    if (blacklistedDomainsArray.some(domain => currentDomain.includes(domain.trim()))) {
        console.log(`Text reflow on zoom: Skipping reflow for blacklisted domain: ${currentDomain}`);
        return;
    }

    /// Prevent on pages optimized for mobiles
    // A mobile device with a width set higher than ~700px means the browser had to fake a desktop view (defaulting to 980px)
    if (activateOnlyOnNonMobileView) {
        const isDesktopView = window.innerWidth > 768;
        if (!isDesktopView) return;
    }

    function reflowText() {
        if (!isCssInjected) {
            injectStyles();

            // Init MutationObserver to handle dynamically added content after zoom
            setTimeout(() => {
                const observer = new MutationObserver(handleMutations);
                observer.observe(document.body, { childList: true, subtree: true });
            }, 1000);
        }

        const maxAllowedWidth = Math.round(window.visualViewport.width * 0.96);
        document.documentElement.style.setProperty('--text-reflow-max-width', `${maxAllowedWidth}px`);

        // Select elements likely to contain text
        processAllTextInNode(document.body);

        // Preserve the target's position relative to the viewport after the text reflows into the narrower width.
        if (targetElement && targetViewportOffset !== null){
            const targetRect = targetElement.getBoundingClientRect();
            const scrollToPosition = window.pageYOffset + (zoomTargetRect.rect?.top ?? targetRect.top) - targetViewportOffset;
            window.scrollTo({ top: scrollToPosition, behavior: 'instant' });

            // Scroll text targets into view horizontally, but keep media targets
            // vertically aligned without horizontal snapping
            const shouldSnapHorizontally = snapToTargetHorizontally
                && targetElement
                && !['IMG', 'VIDEO', 'IFRAME'].includes(targetElement.tagName || targetElement.firstChild?.tagName);

            if (shouldSnapHorizontally) {
                let t = targetElement;
                t = t.closest(`.${TEXT_CLASS}`) || t;
                
                t.classList.add(SCROLL_PADDING_CLASS);
                t.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
                t.classList.remove(SCROLL_PADDING_CLASS);
            } else if (!targetElement) {
                window.scrollTo({ 
                    top: targetRect.top + window.pageYOffset + (window.innerHeight / 2), 
                    left: targetRect.left + window.pageXOffset + (window.innerWidth / 2),
                    behavior: 'smooth'
                });
            }
            
            zoomTargetRect = null;
            targetViewportOffset = null;
            targetElement = null;
        } 
    }

    function injectStyles() {
        const styleContent = `.${TEXT_CLASS} { word-wrap: break-word !important; overflow-wrap: break-word !important; max-width: var(--text-reflow-max-width) !important; }
.${SCROLL_PADDING_CLASS} { scroll-margin-left: 1vw !important; }`;
        const styleElement = document.createElement('style');
        styleElement.textContent = styleContent;
        (document.head || document.documentElement).appendChild(styleElement);
        isCssInjected = true;
    }

    function processAllTextInNode(contextNode) {
        const xpathResult = document.evaluate(xpathSelector, contextNode, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
        for (let i = 0, n = xpathResult.snapshotLength; i < n; i++) {
            processTextElement(xpathResult.snapshotItem(i));
        }
    }

    function processTextElement(el) {
        if (canProcessElement(el)) {
            el.classList.add(TEXT_CLASS);
        }
    }

    function canProcessElement(el) {
        if (!(el instanceof HTMLElement)) return false;
        if (el.classList.contains(TEXT_CLASS)) return false;
        if (!el.textContent.trim()) return false;
        if (!el.offsetParent) return false;

        // Proccess only top-level text elements
        let parent = el.parentElement;
        while (parent) {
            if (parent.classList.contains(TEXT_CLASS)) return false;
            parent = parent.parentElement;
        }
        return true;
    }

    function handleMutations(mutations) {
        if (!isCssInjected) return;
        for (const mutation of mutations) {
            if (mutation.type !== 'childList' || !mutation.addedNodes.length) continue;
            for (const node of mutation.addedNodes) {
                if (node.nodeType !== Node.ELEMENT_NODE) continue;
                processAllTextInNode(node);
            }
        }
    }

    // Detect start of multi-touch (pinch) gesture
    function handleTouchStart(event) {
        if (!event.touches) return;

        if (event.touches.length === 1 && supportOneFingerZoom) {
            // Check for double-tap gesture
            const currentTime = new Date().getTime();
            const timeSinceLastTap = currentTime - lastTapDownTime;
            
            if (timeSinceLastTap < doubleTapTimeout && timeSinceLastTap > 0) {
                // Double-tap detected
                isPinching = true;
                lastTapDownTime = 0;
            } else {
                // Not a double-tap, update last tap time
                lastTapDownTime = currentTime;
            }
        } else if (event.touches.length === 2) {
            /// Two-finger pinch gesture
            isPinching = true;
        }

        if (isPinching) {
            // Store possible target of a pinch gesture
            if (event.target instanceof Element) zoomTarget = event.target;

            if (event.touches.length === 2){
                // Try to calculate the midpoint between the two touch points
                const touch1 = event.touches[0];
                const touch2 = event.touches[1];
                const midpointX = (touch1.clientX + touch2.clientX) / 2;
                const midpointY = (touch1.clientY + touch2.clientY) / 2;
                setZoomTargetRect(midpointX, midpointY);
            } else if (event.touches.length === 1 && supportOneFingerZoom) {
                // For one-finger zoom, use the touch point to find the target element
                const touch = event.touches[0];
                setZoomTargetRect(touch.clientX, touch.clientY);
            }

            if (zoomTargetRect) {
                targetViewportOffset = zoomTargetRect.rect.top;
                targetElement = zoomTargetRect.parentElement?.closest(`.${TEXT_CLASS}`)
                    || zoomTargetRect.parentElement
                    || zoomTarget;
            }
        }
    }

    function setZoomTargetRect(x, y){
        // Use document.elementFromPoint to set fallback element
        zoomTarget = document.elementFromPoint(x, y) || zoomTarget;

        zoomTargetRect = getTextAnchorAtPoint(x, y);
        if (!zoomTargetRect) {
            zoomTargetRect = {
                rect: { left: x, top: y, parentElement: zoomTarget },
            };
        }
    }

    function getTextAnchorAtPoint(x, y) {
        let textNode = null;
        let range = null;

        // Try to find the exact Text Node at (x, y)
        if (document.caretPositionFromPoint) {
            const pos = document.caretPositionFromPoint(x, y);
            if (pos && pos.offsetNode.nodeType === Node.TEXT_NODE) {
            textNode = pos.offsetNode;
            range = document.createRange();
            range.setStart(textNode, pos.offset);
            range.setEnd(textNode, Math.min(pos.offset + 1, textNode.length));
            }
        } else if (document.caretRangeFromPoint) { // WebKit / Safari
            const r = document.caretRangeFromPoint(x, y);
            if (r && r.startContainer.nodeType === Node.TEXT_NODE) {
            textNode = r.startContainer;
            range = r;
            }
        }

        // If a text node was hit, anchor to its exact bounding box
        if (range) {
            const rect = range.getBoundingClientRect();
            // Verify point actually falls near valid text content
            if (rect.width > 0 && rect.height > 0) {
                return {
                    node: textNode,
                    parentElement: textNode.parentElement,
                    rect: rect // Exact coordinates of the character/line
                };
            }
        }

        return null;
    }

    // Detect end of multi-touch (pinch) gesture
    function handleTouchEnd(event) {
        if (!isPinching || !event.touches || event.touches.length !== 0) return;
        isPinching = false;
        reflowText();
    }

    // Add event listeners
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    // Uncomment to test on PC
    // window.visualViewport.addEventListener('resize', reflowText);
})();