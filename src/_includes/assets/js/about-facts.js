"use strict";!function(){var t=function(t){for(var e=t.length-1;e>0;e-=1){var a=Math.floor(Math.random()*(e+1)),c=[t[a],t[e]];t[e]=c[0],t[a]=c[1]}return t}(Array.from(document.querySelectorAll("[data-facts] > li")).map((function(t){return"".concat(t.getAttribute("data-fact-emoji")," ").concat(t.textContent)}))),e=document.querySelector(".about-facts"),a=Object.assign(document.createElement("div"),{className:e.className}),c=document.querySelector(".about-fact-get"),n=Object.assign(document.createElement("button"),{className:c.className});n.style.setProperty("--btn-justify-content",c.style.getPropertyValue("--btn-justify-content"));var o=c.querySelector(".about-facts-icon"),r=c.querySelector(".about-facts-label"),l=document.querySelector(".about-fact-show"),u=Object.assign(document.createElement("p"),{className:l.className,hidden:!0});n.appendChild(o),n.appendChild(r),a.appendChild(n),a.appendChild(u),e.replaceWith(a);var s=-1;document.querySelector(".about-fact-get").addEventListener("click",(function(){var e=(s+1)%t.length;(u.hidden||-1===s)&&(u.hidden=!1),u.textContent=t[e],s=e}))}();