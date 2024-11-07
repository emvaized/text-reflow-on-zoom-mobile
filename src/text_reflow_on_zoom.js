// ==UserScript==
// @name         Text reflow on zoom by pinch gesture (mobile)
// @description  This userscript tries to fit text to screen width after pinch gesture. It tries to replicate text reflow feature from Opera Mobile.
// @description:ru Этот скрипт пытается подогнать текст под ширину экрана после жеста увеличения на телефоне. Он воспроизводит функцию переноса текста из Opera Mobile.
// @version      1.0.3
// @author       emvaized
// @license      MIT
// @namespace    text_reflow_on_pinch_zoom
// @match        *://*/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    let isCssInjected = false, isPinching = false;
    let zoomTarget, targetDyOffsetRatio;
    const textElementsSelector = 'p, a, h1, h2, h3, h4, h5, h6, li, div:has(> br), div:has(> span:not(:empty)), div:has(> em)';

    function reflowText() {
        if (!isCssInjected) {
            const styleContent = `.text-reflow-userscript { word-wrap: break-word !important; overflow-wrap:break-word !important; max-width:var(--reflow-max-width) !important; }
            .text-reflow-scroll-padding {scroll-margin-left: 1vw !important;}`;
            const styleElement = document.createElement('style');
            styleElement.textContent = styleContent;
            document.head.appendChild(styleElement);
        }

        const maxAllowedWidth = window.visualViewport.width * 0.96;
        document.documentElement.style.setProperty('--reflow-max-width', `${maxAllowedWidth}px`);

        // Select elements likely to contain text
        const textElements = document.querySelectorAll(textElementsSelector);

        // Check if an element is nested inside another matching element
        const filterElements = (el) => {
            // Filter out elements with no text
            if (!el.textContent) return false;
            
            let parent = el.parentElement;
            while (parent) {
                // If a parent is also a text element, proccess it instead
                if (parent.matches(textElementsSelector)) return false;
                parent = parent.parentElement;
            }
            return true;
        };
  
        // Filter elements to get only top-level ones
        const topLevelTextElements = Array.from(textElements).filter(filterElements);
        topLevelTextElements.forEach(element => processElement(element));

        /// Scroll initial target element into view
        if (zoomTarget && targetDyOffsetRatio) {
            setTimeout(t => {
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
                zoomTarget.classList.add('text-reflow-scroll-padding')
                zoomTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
                zoomTarget.classList.remove('text-reflow-scroll-padding')

                // Reset the target and offset after scrolling
                zoomTarget = null;
                targetDyOffsetRatio = null;
            }, 1);
        }
    }

    function processElement(element){
        element.classList.add('text-reflow-userscript')
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