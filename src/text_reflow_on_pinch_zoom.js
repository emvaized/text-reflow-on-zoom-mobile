// ==UserScript==
// @name         Text reflow on zoom for mobile (text wrap)
// @name:ru      Text reflow on zoom for mobile (text wrap)
// @description  Fits all text to the screen width after a pinch gesture on phone 
// @description:ru  Подгонка текста под ширину экрана после жеста увеличения на телефоне
// @version      1.0.8
// @author       emvaized
// @license      MIT
// @homepageURL  https://github.com/emvaized/text-reflow-on-zoom-mobile
// @downloadURL  https://github.com/emvaized/text-reflow-on-zoom-mobile/raw/refs/heads/main/src/text_reflow_on_pinch_zoom.js
// @namespace    text_reflow_on_pinch_zoom
// @match        *://*/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
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
    //div[b or em or i] |
    //div[normalize-space(text())] |
    //div[span[normalize-space(text())]]
`;

    const TEXT_CLASS = 'text-reflow-userscript';
    const SCROLL_PADDING_CLASS = 'text-reflow-scroll-padding';

    let isCssInjected = false;
    let isPinching = false;
    let zoomTarget = null;
    let targetDyOffsetRatio = null;
    let mutationDebounceTimer = null;

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

        // Scroll initial target element into view
        if (zoomTarget && targetDyOffsetRatio != null) {
            // Scroll to element vertically, according to new page layout
            const rect = zoomTarget.getBoundingClientRect();
            const scrollToPosition = rect.top + window.pageYOffset - targetDyOffsetRatio * window.innerHeight;
            window.scrollTo({ top: scrollToPosition, behavior: 'instant' });

            // Scroll element into view horizontally
            if (!['IMG', 'VIDEO', 'IFRAME'].includes(zoomTarget.nodeName) && zoomTarget.classList.contains(TEXT_CLASS)) {
                zoomTarget.classList.add(SCROLL_PADDING_CLASS);
                zoomTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
                zoomTarget.classList.remove(SCROLL_PADDING_CLASS);
            }

            // Reset the target and offset after scrolling
            zoomTarget = null;
            targetDyOffsetRatio = null;
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
        if (!event.touches || event.touches.length < 2) return;
        isPinching = true;

        // Store possible target of zoom gesture
        if (event.target instanceof Element) zoomTarget = event.target;

        // Calculate the midpoint between the two touch points
        const touch1 = event.touches[0];
        const touch2 = event.touches[1];
        const midpointX = (touch1.clientX + touch2.clientX) / 2;
        const midpointY = (touch1.clientY + touch2.clientY) / 2;

        // Use document.elementFromPoint to get the element at the midpoint
        const elementsFromPoint = document.elementsFromPoint(midpointX, midpointY);
        for (const element of elementsFromPoint) {
            if (element instanceof HTMLElement && element.classList.contains(TEXT_CLASS)) {
                zoomTarget = element;
                break;
            }
        }
        if (!zoomTarget && elementsFromPoint.length) zoomTarget = elementsFromPoint[0];

        // Store screen coordinates of target to scroll it into view after reflow
        if (zoomTarget instanceof Element) {
            const rect = zoomTarget.getBoundingClientRect();
            targetDyOffsetRatio = rect.top / window.innerHeight;
        }
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