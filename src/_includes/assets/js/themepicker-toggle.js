"use strict";!function(){function e(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null,t=document.documentElement,n=document.querySelector(".themepicker"),r="data-themepicker",i="open"===t.getAttribute(r),a=null!==e?JSON.parse(e):!i;t.setAttribute(r,a?"open":"closed"),n.setAttribute("aria-expanded",a.toString())}window.setTheme(window.getTheme()),document.addEventListener("click",(function(t){var n=t.target.closest("[data-theme-set]");if(n)window.setTheme(n.getAttribute("data-theme-set"));else{var r=t.target.closest("[data-themepicker-toggler]");if(r)e(r.getAttribute("data-themepicker-toggler")||null)}})),document.addEventListener("keypress",(function(t){t.altKey||t.metaKey||t.ctrlKey||t.shiftKey||"m"===t.key.toLowerCase()&&e()}))}();