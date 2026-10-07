### 1.2.0
- Added support for one finger zoom (double tap + move finger up/down)
- Added ability to blacklist domains
- Added option to activate script only on desktop view pages (not adapted for mobiles) - disabled by default
- Implemented options page with ability to toggle settings
- Refactored detection of zoom target element for better reliability
- Other code optimisations and improvements

### 1.1.1
- Improved detection of images, videos or iframes in center of pinch gesture

### 1.1.0
- Added support for lazy loaded content on websites
- Code refactored for better performance
- Scroll horizontally only when text element in the center

### 1.0.7
- Added support for `<pre>` elements
- Don't scroll `<video>` and `<iframe>` elements into the view horizontally

### 1.0.6
- Switched to XPath selector for more accurate detection of text elements
- Improved the script's performance on heavy pages
- Scroll any element into view horizontally, if it's not detected as image

### 1.0.5
- Scroll element into view horizontally only if it matches as a text element, to zoom images more comfortably
- Various performance and code improvements
- Added Github urls in Userscript meta tags 

### 1.0.4
- Improved scrolling reflowed element into view + added animated transition
- Improved text elements selector on page
- Updated addon icon on Firefox

### 1.0.3
- Updated project structure
- Added ability to function as extension
- Published addon for Firefox Android 

### 1.0.2
- Exclude text elements nested inside other text elements
- Improved code for scrolling target element into view after reflow

### 1.0.1
- Added support for divs which contain <br> elements