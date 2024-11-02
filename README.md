# <sub><img src="./src/icon.png" height="48" width="48"></sub> Text reflow on zoom (mobile)

![Greasy Fork Downloads](https://img.shields.io/greasyfork/dt/514789?label=downloads&logo=greasyfork)
[![Mozilla Add-on](https://img.shields.io/amo/users/text-reflow-on-zoom-mobile?color=%23FF6611&label=users&logo=Firefox)](https://addons.mozilla.org/firefox/addon/text-reflow-on-zoom-mobile/)

This script tries to fit all text on page to the screen width after pinch gesture on phone. 
It tries to replicate text reflow feature from Opera Mobile, but in any browser. 

It is available to use as a [Userscript](./src/text_reflow_on_zoom.js), or as a browser extension (currently available only as [Firefox Addon](https://addons.mozilla.org/firefox/addon/text-reflow-on-zoom-mobile/)).

#### Demo

<img src="assets/illustration.gif" >

## Current problems

Since it is a first attempt of implementing this feature, there are currently a few problems: 

- Some reflowed text elements might be misaligned, if they are positioned inside an element with `align-items:center`

- The script attempts to guess text element which you were zooming into, and scrolls it into view after reflow. But this feature is buggy and doesn't work reliably all the time

- Some elements with text are not reflowed by the script, for example `div` elements, or `span` elements with `display:inline` set. I am yet to figure out how to target these elements without too much performance overhead and unwanted reflows

## Donate
If you really enjoy this project, please consider supporting its further development by making a small donation using one of the services below 🙏 

<a href="https://ko-fi.com/emvaized"><img src="https://cdn.prod.website-files.com/5c14e387dab576fe667689cf/64f1a9ddd0246590df69ea0b_kofi_long_button_red%25402x-p-800.png" alt="Support on Ko-fi" height="40"></a> &nbsp; <a href="https://liberapay.com/emvaized/donate"><img alt="Donate using Liberapay" src="https://liberapay.com/assets/widgets/donate.svg" height="40"></a> &nbsp; <a href="https://emvaized.github.io/donate/bitcoin/"><img src="https://github.com/emvaized/emvaized.github.io/blob/main/donate/bitcoin/assets/bitcoin-donate-button.png?raw=true" alt="Donate Bitcoin" height="40" /></a>

### Contributing

If you have any ideas on how it can be improved, please let me know using a [Feedback](https://greasyfork.org/en/scripts/514789-text-reflow-on-zoom-by-pinch-gesture-mobile/feedback) form on Greasyfork, or by opening an issue ticket or pull request here on Github.
