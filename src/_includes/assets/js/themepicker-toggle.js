"use strict";!function(){function e(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null,t=document.documentElement,r=document.querySelector(".themepicker"),o=document.querySelector("[data-themepicker-toggler]"),n="data-themepicker",i="open"===t.getAttribute(n),a=null!==e?JSON.parse(e):!i;return t.setAttribute(n,a?"open":"closed"),o.setAttribute("aria-expanded",a.toString()),r.inert=!a,a}window.setTheme(window.getTheme()),document.addEventListener("click",(function(t){var r=t.target.closest("[data-theme-set]");if(r)window.setTheme(r.getAttribute("data-theme-set"));else{var o=t.target.closest("[data-themepicker-toggler]");if(o)e(o.getAttribute("data-themepicker-toggler")||null)}})),document.addEventListener("keypress",(function(t){t.altKey||t.metaKey||t.ctrlKey||t.shiftKey||"m"===t.key.toLowerCase()&&e()&&document.body.scrollIntoView({block:"start",behavior:"smooth"})}))}();