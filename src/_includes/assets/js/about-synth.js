"use strict";var audioContext=new(window.AudioContext||window.webkitAudioContext),keyNoteMap=[{note:"C",octave:1,keyQwerty:"A",keyAzerty:"Q"},{note:"C#",octave:1,keyQwerty:"W",keyAzerty:"Z"},{note:"D",octave:1,keyQwerty:"S",keyAzerty:"S"},{note:"D#",octave:1,keyQwerty:"E",keyAzerty:"E"},{note:"E",octave:1,keyQwerty:"D",keyAzerty:"D"},{note:"F",octave:1,keyQwerty:"F",keyAzerty:"F"},{note:"F#",octave:1,keyQwerty:"T",keyAzerty:"T"},{note:"G",octave:1,keyQwerty:"G",keyAzerty:"G"},{note:"G#",octave:1,keyQwerty:"Y",keyAzerty:"Y"},{note:"A",octave:2,keyQwerty:"H",keyAzerty:"H"},{note:"A#",octave:2,keyQwerty:"U",keyAzerty:"U"},{note:"B",octave:2,keyQwerty:"J",keyAzerty:"J"},{note:"C",octave:2,keyQwerty:"K",keyAzerty:"K"}],pressedNotes=new Map,pressedKeysShifted=new Map,pressedKbkeys=new Set,clickedKey="",isAzerty=!1,isShiftPressed=!1;function enableSynth(){Array.from(document.querySelectorAll(".about-synth-slider, .about-synth-waveform-button, .about-synth-key")).forEach((function(e){return e.disabled=!1}))}function getNoteByKey(e){return keyNoteMap.find((function(t){return(isAzerty?t.keyAzerty:t.keyQwerty)===e}))||!1}function getKeyByNoteOctave(e,t){return keyNoteMap.find((function(a){return a.note===e&&a.octave===parseInt(t,10)}))||!1}function getNoteOctaveByKey(e){return"".concat(e.note).concat(e.octave)}function getElementByNoteOctave(e,t){return document.querySelector('.about-synth-key[data-note="'.concat(e,'"][data-octave="').concat(t,'"]'))||!1}function getNoteOctaveByElement(e){return{note:e.getAttribute("data-note").trim().toUpperCase(),octave:parseInt(e.getAttribute("data-octave"),10)}}function getKeyDataByKeyNote(e){var t=arguments.length>1&&void 0!==arguments[1]&&arguments[1],a=e.octave+(!t&&isShiftPressed?1:0);return{element:getElementByNoteOctave(e.note,a),note:e.note,octave:a}}function isKeyEventShift(e){return"shift"===e.key.toLowerCase()}function getSynthType(){var e=document.getElementById("synth-waveform");switch(e?parseInt(e.value,10):0){default:case 1:return"sine";case 2:return"triangle";case 3:return"square";case 4:return"sawtooth"}}function getSynthEnvelope(){return{attack:Math.min(10,Math.max(1e-5,parseFloat(document.getElementById("synth-osc-attack").value||0)))/10,decay:Math.min(10,Math.max(1e-5,parseFloat(document.getElementById("synth-osc-decay").value||0)))/2,sustain:10*Math.min(10,Math.max(1e-5,parseFloat(document.getElementById("synth-osc-sustain").value||0))),release:Math.min(10,Math.max(1e-5,parseFloat(document.getElementById("synth-osc-release").value||0)))}}function setKeyboardLayout(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null;if(e&&"boolean"==typeof e)isAzerty=e;else{var t=document.getElementById("about-synth-keyboard-layout-switch");if(t)return isAzerty=t.checked,t.setAttribute("aria-checked",isAzerty.toString()),isAzerty}}function reLabelKeys(){var e=isShiftPressed?1:0;Array.from(document.querySelectorAll("[data-note]")).forEach((function(t){var a=t.querySelector(".about-synth-key-label"),n=getKeyByNoteOctave(t.getAttribute("data-note"),parseInt(t.getAttribute("data-octave"),10)-e);if(n){var r=isAzerty?n.keyAzerty:n.keyQwerty;a.innerText=r}else a.innerText=""}))}function getHz(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"A",t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:4,a=440,n=0;switch(e){default:case"A":n=0;break;case"A#":case"Bb":n=1;break;case"B":n=2;break;case"C":n=3;break;case"C#":case"Db":n=4;break;case"D":n=5;break;case"D#":case"Eb":n=6;break;case"E":n=7;break;case"F":n=8;break;case"F#":case"Gb":n=9;break;case"G":n=10;break;case"G#":case"Ab":n=11}return n+=12*(t-4),a*Math.pow(2,n/12)}function playKey(e){var t=getSynthType()||"sine",a=getSynthEnvelope(),n=audioContext.createOscillator(),r=getHz(e.note,(e.octave||0)+1),o=1e-5,s=audioContext.createGain(),i=audioContext.createGain(),y=audioContext.createGain(),c=audioContext.createGain();n.type=t,n.connect(s),s.gain.value=["sine","triangle"].includes(t)?1:.25,s.connect(i),i.gain.setValueAtTime(1e-5,audioContext.currentTime),a.attack>o?i.gain.exponentialRampToValueAtTime(.9,audioContext.currentTime+o+a.attack):i.gain.exponentialRampToValueAtTime(.9,audioContext.currentTime+o),i.connect(y),y.gain.setValueAtTime(1,audioContext.currentTime+a.attack),y.gain.exponentialRampToValueAtTime(a.sustain/100,audioContext.currentTime+a.attack+a.decay),y.connect(c),c.connect(audioContext.destination),Number.isFinite(r)&&(n.frequency.value=r),stopKey(clickedKey);var u=getNoteOctaveByKey(e);e.element.setAttribute("aria-pressed","true"),pressedNotes.set(u,{osc:n,release:c,envelope:a,threshold:o}),pressedKbkeys.add(u),n.start()}function stopKey(e){if(e){e.element.setAttribute("aria-pressed","false");var t=getNoteOctaveByKey(e),a=pressedNotes.get(t);if(a){var n=a.osc,r=a.release,o=a.envelope,s=a.threshold;r.gain.setValueAtTime(.9,audioContext.currentTime),r.gain.exponentialRampToValueAtTime(1e-5,audioContext.currentTime+Math.max(o.release,s)),n&&(setTimeout((function(){n.stop()}),1e3*Math.max(o.release,s)),pressedNotes.delete(t),pressedKbkeys.delete(t))}}}function triggerKey(e,t,a){playKey({element:e,note:t,octave:a})}enableSynth(),setKeyboardLayout(),reLabelKeys(),document.addEventListener("click",(function(e){var t=e.target.closest(".toggleswitch");if(!t)return!0;var a=t.querySelector(".toggleswitch-checkbox"),n=e.target.closest("[data-value]");if(!n)return!0;e.preventDefault();var r="true"===n.getAttribute("data-value");return a.checked=r,!1})),document.addEventListener("change",(function(e){var t=e.target.closest(".toggleswitch-checkbox");t&&(isAzerty=t.checked,t.setAttribute("aria-checked",isAzerty.toString()),setKeyboardLayout(isAzerty),reLabelKeys())})),document.addEventListener("keydown",(function(e){(isKeyEventShift(e)||e.shiftKey)&&(isShiftPressed=!0,reLabelKeys())})),document.addEventListener("keyup",(function(e){(isKeyEventShift(e)||!e.shiftKey&&!isKeyEventShift(e))&&(isShiftPressed=!1,reLabelKeys())})),document.addEventListener("mousedown",(function(e){var t=e.target.closest("[data-note]");if(t)return e.preventDefault(),triggerKey(t,t.getAttribute("data-note"),parseInt(t.getAttribute("data-octave"),10)),clickedKey={element:t,note:t.getAttribute("data-note"),octave:parseInt(t.getAttribute("data-octave"),10)},!1}),!1),document.addEventListener("mouseup",(function(){return stopKey(clickedKey)}),!1),document.addEventListener("keydown",(function(e){var t=e.key.toUpperCase();if(!(e.altKey||e.metaKey||e.ctrlKey||e.repeat))if("ENTER"!==t&&" "!==t){var a=getNoteByKey(t);if(a){var n=getKeyDataByKeyNote(a);pressedKeysShifted.set(t,isShiftPressed),playKey(n)}}else{var r=e.target.closest("[data-note]");r&&triggerKey(r,r.getAttribute("data-note"),parseInt(r.getAttribute("data-octave"),10))}})),document.addEventListener("keyup",(function(e){var t=e.key.toUpperCase();if(!(e.altKey||e.metaKey||e.ctrlKey)){var a;if("ENTER"===t||" "===t){var n=e.target.closest("[data-note]");n&&(a={element:n,note:n.getAttribute("data-note"),octave:parseInt(n.getAttribute("data-octave"),10)})}else{var r=getNoteByKey(t);if(!r)return;a=getKeyDataByKeyNote(r);var o=pressedKeysShifted.get(t);o&&!1===e.shiftKey?(a.octave+=1,a=getKeyDataByKeyNote(a,!0)):o||!0!==e.shiftKey||(a.octave-=1,a=getKeyDataByKeyNote(a,!0))}stopKey(a)}}),!1);