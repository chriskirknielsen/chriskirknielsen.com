(()=>{(function(){let r=new(window.AudioContext||window.webkitAudioContext),A=[{note:"C",octave:1,keyQwerty:"A",keyAzerty:"Q"},{note:"C#",octave:1,keyQwerty:"W",keyAzerty:"Z"},{note:"D",octave:1,keyQwerty:"S",keyAzerty:"S"},{note:"D#",octave:1,keyQwerty:"E",keyAzerty:"E"},{note:"E",octave:1,keyQwerty:"D",keyAzerty:"D"},{note:"F",octave:1,keyQwerty:"F",keyAzerty:"F"},{note:"F#",octave:1,keyQwerty:"T",keyAzerty:"T"},{note:"G",octave:1,keyQwerty:"G",keyAzerty:"G"},{note:"G#",octave:1,keyQwerty:"Y",keyAzerty:"Y"},{note:"A",octave:2,keyQwerty:"H",keyAzerty:"H"},{note:"A#",octave:2,keyQwerty:"U",keyAzerty:"U"},{note:"B",octave:2,keyQwerty:"J",keyAzerty:"J"},{note:"C",octave:2,keyQwerty:"K",keyAzerty:"K"}],m=new Map,p=new Map,w=new Set,v="",s=!1,y=!1;function B(){Array.from(document.querySelectorAll(".about-synth-slider, .about-synth-waveform-button, .about-synth-key")).forEach(e=>e.disabled=!1)}function E(e){return A.find(t=>(s?t.keyAzerty:t.keyQwerty)===e)||!1}function Q(e,t){return A.find(a=>a.note===e&&a.octave===parseInt(t,10))||!1}function K(e){return`${e.note}${e.octave}`}function M(e,t){return document.querySelector(`.about-synth-key[data-note="${e}"][data-octave="${t}"]`)||!1}function G(e){let t=e.getAttribute("data-note").trim().toUpperCase(),a=parseInt(e.getAttribute("data-octave"),10);return{note:t,octave:a}}function d(e,t=!1){let a=e.octave+(!t&&y?1:0);return{element:M(e.note,a),note:e.note,octave:a}}function g(e){return e.key.toLowerCase()==="shift"}function I(){let e=document.getElementById("synth-waveform");switch(e?parseInt(e.value,10):0){default:case 1:return"sine";case 2:return"triangle";case 3:return"square";case 4:return"sawtooth"}}function F(){return{attack:Math.min(10,Math.max(1e-5,parseFloat(document.getElementById("synth-osc-attack").value||0)))/10,decay:Math.min(10,Math.max(1e-5,parseFloat(document.getElementById("synth-osc-decay").value||0)))/2,sustain:Math.min(10,Math.max(1e-5,parseFloat(document.getElementById("synth-osc-sustain").value||0)))*10,release:Math.min(10,Math.max(1e-5,parseFloat(document.getElementById("synth-osc-release").value||0))),filter:Math.min(100,Math.max(1e-5,parseFloat(document.getElementById("synth-osc-filter").value||0)))*10}}function T(e=null){if(e&&typeof e=="boolean"){s=e;return}let t=document.getElementById("about-synth-keyboard-layout-switch");if(!!t)return s=t.checked,t.setAttribute("aria-checked",s.toString()),s}function f(){let e=y?1:0;Array.from(document.querySelectorAll("[data-note]")).forEach(a=>{let n=a.querySelector(".about-synth-key-label"),o=a.getAttribute("data-note"),i=parseInt(a.getAttribute("data-octave"),10),c=Q(o,i-e);if(!c){n.innerText="";return}let u=s?c.keyAzerty:c.keyQwerty;n.innerText=u})}function N(e="A",t=4){let n=0;switch(e){default:case"A":n=0;break;case"A#":case"Bb":n=1;break;case"B":n=2;break;case"C":n=3;break;case"C#":case"Db":n=4;break;case"D":n=5;break;case"D#":case"Eb":n=6;break;case"E":n=7;break;case"F":n=8;break;case"F#":case"Gb":n=9;break;case"G":n=10;break;case"G#":case"Ab":n=11;break}return n+=12*(t-4),440*Math.pow(2,n/12)}function x(e){let t=I()||"sine",a=F(),n=r.createOscillator(),o=N(e.note,(e.octave||0)+1),i=1e-5,c=r.createGain(),u=r.createGain(),k=r.createGain(),b=r.createGain(),l=r.createBiquadFilter(),C=100;n.type=t,n.connect(c),c.gain.value=["sine","triangle"].includes(t)?1:.25,c.connect(u),u.gain.setValueAtTime(1e-5,r.currentTime),a.attack>i?u.gain.exponentialRampToValueAtTime(.9,r.currentTime+i+a.attack):u.gain.exponentialRampToValueAtTime(.9,r.currentTime+i),u.connect(k),k.gain.setValueAtTime(1,r.currentTime+a.attack),k.gain.exponentialRampToValueAtTime(a.sustain/100,r.currentTime+a.attack+a.decay),k.connect(b),b.connect(a.filter<=1e3?l:r.destination),a.filter<=1e3&&(l.type="lowpass",l.frequency.value=a.filter+C,l.Q.value=1,l.connect(r.destination)),Number.isFinite(o)&&(n.frequency.value=o),h(v);let z=K(e);e.element.setAttribute("aria-pressed","true"),m.set(z,{osc:n,release:b,envelope:a,threshold:i}),w.add(z),n.start()}function h(e){if(!e)return;e.element.setAttribute("aria-pressed","false");let t=K(e),a=m.get(t);if(!a)return;let n=a.osc,o=a.release,i=a.envelope,c=a.threshold;o.gain.setValueAtTime(.9,r.currentTime),o.gain.exponentialRampToValueAtTime(1e-5,r.currentTime+Math.max(i.release,c)),n&&(setTimeout(()=>{n.stop()},1e3*Math.max(i.release,c)),m.delete(t),w.delete(t))}function S(e,t,a){x({element:e,note:t,octave:a})}B(),T(),f(),document.addEventListener("click",e=>{let t=e.target.closest(".toggleswitch");if(!t)return!0;let a=t.querySelector(".toggleswitch-checkbox"),n=e.target.closest("[data-value]");if(!n)return!0;e.preventDefault();let o=n.getAttribute("data-value")==="true";return a.checked=o,!1}),document.addEventListener("change",e=>{let t=e.target.closest(".toggleswitch-checkbox");!t||(s=t.checked,t.setAttribute("aria-checked",s.toString()),T(s),f())}),document.addEventListener("keydown",e=>{(g(e)||e.shiftKey)&&(y=!0,f())}),document.addEventListener("keyup",e=>{(g(e)||!e.shiftKey&&!g(e))&&(y=!1,f())}),document.addEventListener("mousedown",e=>{var t=e.target.closest("[data-note]");if(!!t)return e.preventDefault(),S(t,t.getAttribute("data-note"),parseInt(t.getAttribute("data-octave"),10)),v={element:t,note:t.getAttribute("data-note"),octave:parseInt(t.getAttribute("data-octave"),10)},!1},!1),document.addEventListener("mouseup",()=>h(v),!1),document.addEventListener("keydown",e=>{let t=e.key.toUpperCase();if(e.altKey||e.metaKey||e.ctrlKey||e.repeat)return;if(t==="ENTER"||t===" "){let o=e.target.closest("[data-note]");o&&S(o,o.getAttribute("data-note"),parseInt(o.getAttribute("data-octave"),10));return}let a=E(t);if(!a)return;let n=d(a);p.set(t,y),x(n)}),document.addEventListener("keyup",e=>{let t=e.key.toUpperCase();if(e.altKey||e.metaKey||e.ctrlKey)return;let a;if(t==="ENTER"||t===" "){let n=e.target.closest("[data-note]");n&&(a={element:n,note:n.getAttribute("data-note"),octave:parseInt(n.getAttribute("data-octave"),10)})}else{let n=E(t);if(!n)return;a=d(n);let o=p.get(t);o&&e.shiftKey===!1?(a.octave+=1,a=d(a,!0)):!o&&e.shiftKey===!0&&(a.octave-=1,a=d(a,!0))}h(a)},!1)})();})();
