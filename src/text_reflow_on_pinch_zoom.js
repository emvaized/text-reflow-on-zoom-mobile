// ==UserScript==
// @name         Text reflow on pinch zoom (mobile)
// @name:ru      Text reflow on pinch zoom (mobile)
// @description  Fits all text to the screen width after a pinch gesture on phone 
// @description:ru  Подгонка текста под ширину экрана после жеста увеличения на телефоне
// @version      1.0.5
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

    const textElementsSelector = 'p,a,h1,h2,h3,h4,h5,h6,li,div:has(> br),div:has(> span:not(:empty)),div:has(> em)';
    let isCssInjected = false, isPinching = false;
    let zoomTarget, targetDyOffsetRatio;

    function reflowText() {
        if (!isCssInjected) {
            const styleContent = `.text-reflow-userscript { word-wrap: break-word !important; overflow-wrap:break-word !important; max-width:var(--text-reflow-max-width) !important; }
            .text-reflow-scroll-padding {scroll-margin-left: 1vw !important;}`;
            const styleElement = document.createElement('style');
            styleElement.textContent = styleContent;
            document.head.appendChild(styleElement);
            isCssInjected = true;
        }

        const maxAllowedWidth = Math.round(window.visualViewport.width * 0.96);
        document.documentElement.style.setProperty('--text-reflow-max-width', `${maxAllowedWidth}px`);

        // Select elements likely to contain text
        const textElements = document.querySelectorAll(textElementsSelector);

        // Keep track of elements that should be excluded because they are nested
        const excludedElements = new Set();

        for (let i = 0, n = textElements.length, el; i < n; i++) {
            el = textElements[i];

            if (!el.offsetParent) continue;
            if (!el.textContent.trim()) continue;
            if (excludedElements.has(el)) continue;

            // Proccess only top-level text elements
            let isTopLevel = true;
            let parent = el.parentElement;

            while (parent) {
                if (parent.matches(textElementsSelector)) {
                    isTopLevel = false;
                    excludedElements.add(el);
                    break;
                }
                parent = parent.parentElement;
            }
            if (isTopLevel) {
                // Apply CSS styles to element and skip it next time
                el.classList.add('text-reflow-userscript');
                excludedElements.add(el);
            } 
        }

        /// Scroll initial target element into view
        if (zoomTarget && targetDyOffsetRatio) {
                // Scroll to element vertically, according to new page layout
                const targetOffset = targetDyOffsetRatio * window.innerHeight;
                const rect = zoomTarget.getBoundingClientRect();
                const targetTop = rect.top + window.pageYOffset;
                const scrollToPosition = targetTop - targetOffset;
                
                window.scrollTo({
                    top: scrollToPosition,
                    behavior: 'instant'
                });

                // Scroll element into view horizontally
                if (zoomTarget.matches(textElementsSelector)) {
                    zoomTarget.classList.add('text-reflow-scroll-padding')
                    zoomTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
                    zoomTarget.classList.remove('text-reflow-scroll-padding')
                }

                // Reset the target and offset after scrolling
                zoomTarget = null;
                targetDyOffsetRatio = null;
        }
    }

    // Detect start of multi-touch (pinch) gesture
    function handleTouchStart(event) {
        if (event.touches && event.touches.length >= 2) {
            isPinching = true;

            // Store possible target of zoom gesture
            if (event.target) zoomTarget = event.target;

            // Calculate the midpoint between the two touch points
            const touch1 = event.touches[0];
            const touch2 = event.touches[1];
            const midpointX = (touch1.clientX + touch2.clientX) / 2;
            const midpointY = (touch1.clientY + touch2.clientY) / 2;
            
            // Use document.elementFromPoint to get the element at the midpoint
            let possibleZoomTarget;
            const elementsFromPoint = document.elementsFromPoint(midpointX, midpointY);
            for (let i = 0, n = elementsFromPoint.length, element; i < n; i++) {
                element = elementsFromPoint[i];
                if (element.matches(textElementsSelector)) {
                    possibleZoomTarget = element;
                    break;
                }
            }
            if (!possibleZoomTarget) possibleZoomTarget = elementsFromPoint[0];
            if (possibleZoomTarget) zoomTarget = possibleZoomTarget;
            
            // Store screen coordinates of target to scroll it into view after reflow
            const targetRect= zoomTarget.getBoundingClientRect(); 
            targetDyOffsetRatio = targetRect.top / window.innerHeight;
        }
    }

    // Detect end of multi-touch (pinch) gesture
    function handleTouchEnd(event) {
        if (isPinching && (event.touches && event.touches.length === 0)) {
            isPinching = false;
            reflowText();
        }
    }

    // Add event listeners
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);

    /// Uncomment to test on PC
    // window.visualViewport.addEventListener('resize', reflowText);
})();