/* Variables */
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const keyNoteMap = [
	{ note: 'C', octave: 1, keyQwerty: 'A', keyAzerty: 'Q' },
	{ note: 'C#', octave: 1, keyQwerty: 'W', keyAzerty: 'Z' },
	{ note: 'D', octave: 1, keyQwerty: 'S', keyAzerty: 'S' },
	{ note: 'D#', octave: 1, keyQwerty: 'E', keyAzerty: 'E' },
	{ note: 'E', octave: 1, keyQwerty: 'D', keyAzerty: 'D' },
	{ note: 'F', octave: 1, keyQwerty: 'F', keyAzerty: 'F' },
	{ note: 'F#', octave: 1, keyQwerty: 'T', keyAzerty: 'T' },
	{ note: 'G', octave: 1, keyQwerty: 'G', keyAzerty: 'G' },
	{ note: 'G#', octave: 1, keyQwerty: 'Y', keyAzerty: 'Y' },
	{ note: 'A', octave: 2, keyQwerty: 'H', keyAzerty: 'H' },
	{ note: 'A#', octave: 2, keyQwerty: 'U', keyAzerty: 'U' },
	{ note: 'B', octave: 2, keyQwerty: 'J', keyAzerty: 'J' },
	{ note: 'C', octave: 2, keyQwerty: 'K', keyAzerty: 'K' },
];
const pressedNotes = new Map();
let clickedKey = '';
let isAzerty = false;
let isShiftPressed = false;

/* Functions */
function enableSynth() {
	Array.from(document.querySelectorAll('.about-synth-slider, .about-synth-waveform-button, .about-synth-key')).forEach((synthControl) => (synthControl.disabled = false));
}

function getNoteByKey(key) {
	return keyNoteMap.find((mapped) => (isAzerty ? mapped.keyAzerty : mapped.keyQwerty) === key) || false;
}

function getKeyByNoteOctave(note, octave) {
	return keyNoteMap.find((mapped) => mapped.note === note && mapped.octave === parseInt(octave, 10)) || false;
}

function getKeyDataByKeyNote(keyNote) {
	const octave = keyNote.octave + (isShiftPressed ? 1 : 0);
	return {
		element: document.querySelector(`[data-note="${keyNote.note}"][data-octave="${octave}"]`),
		note: keyNote.note,
		octave: octave,
	};
}

function isKeyEventShift(e) {
	return e.key.toLowerCase() === 'shift';
}

function getSynthType() {
	const slider = document.getElementById('synth-waveform');
	switch (parseInt(slider.value, 10)) {
		default:
		case 1: {
			return 'sine';
		}
		case 2: {
			return 'triangle';
		}
		case 3: {
			return 'square';
		}
		case 4: {
			return 'sawtooth';
		}
	}
}

function getSynthAdsr() {
	const adsr = {
		attack: Math.min(10, Math.max(0.00001, parseFloat(document.getElementById('synth-osc-attack').value || 0))) / 10, // 0-1
		decay: Math.min(10, Math.max(0.00001, parseFloat(document.getElementById('synth-osc-decay').value || 0))) / 2, // 0-5
		sustain: Math.min(10, Math.max(0.00001, parseFloat(document.getElementById('synth-osc-sustain').value || 0))) * 10, // 0-100
		release: Math.min(10, Math.max(0.00001, parseFloat(document.getElementById('synth-osc-release').value || 0))), // 0-10
	};
	return adsr;
}

function setKeyboardLayout(forcedValue = null) {
	if (forcedValue && typeof forcedValue === 'boolean') {
		return (isAzerty = forcedValue);
	}

	const cbox = document.getElementById('about-synth-keyboard-layout-switch');
	if (!cbox) {
		return;
	}
	isAzerty = cbox.checked;
	cbox.setAttribute('aria-checked', isAzerty.toString());
	return isAzerty;
}

function reLabelKeys() {
	const octaveShift = isShiftPressed ? 1 : 0;
	const keys = Array.from(document.querySelectorAll('[data-note]'));
	keys.forEach((key) => {
		const label = key.querySelector('.about-synth-key-label');
		const note = key.getAttribute('data-note');
		const octave = parseInt(key.getAttribute('data-octave'), 10);
		const keyNote = getKeyByNoteOctave(note, octave - octaveShift);
		if (!keyNote) {
			label.innerText = '';
			return;
		}
		const keyPress = isAzerty ? keyNote.keyAzerty : keyNote.keyQwerty;
		label.innerText = keyPress;
	});
}

function getHz(note = 'A', octave = 4) {
	const A4 = 440;
	let N = 0;
	switch (note) {
		default:
		case 'A':
			N = 0;
			break;
		case 'A#':
		case 'Bb':
			N = 1;
			break;
		case 'B':
			N = 2;
			break;
		case 'C':
			N = 3;
			break;
		case 'C#':
		case 'Db':
			N = 4;
			break;
		case 'D':
			N = 5;
			break;
		case 'D#':
		case 'Eb':
			N = 6;
			break;
		case 'E':
			N = 7;
			break;
		case 'F':
			N = 8;
			break;
		case 'F#':
		case 'Gb':
			N = 9;
			break;
		case 'G':
			N = 10;
			break;
		case 'G#':
		case 'Ab':
			N = 11;
			break;
	}
	N += 12 * (octave - 4);
	return A4 * Math.pow(2, N / 12);
}

function playKey(key) {
	const type = getSynthType() || 'sine';
	const adsr = getSynthAdsr();
	const osc = audioContext.createOscillator();
	const freq = getHz(key.note, (key.octave || 0) + 1);
	const threshold = 0.00001;
	const attack = audioContext.createGain();
	const decay = audioContext.createGain();
	const release = audioContext.createGain();

	osc.type = type;
	osc.connect(attack);

	/* Attack */
	attack.gain.setValueAtTime(0.00001, audioContext.currentTime);
	if (adsr.attack > threshold) {
		attack.gain.exponentialRampToValueAtTime(0.9, audioContext.currentTime + threshold + adsr.attack);
	} else {
		attack.gain.exponentialRampToValueAtTime(0.9, audioContext.currentTime + threshold);
	}
	attack.connect(decay);

	/* Decay */
	decay.gain.setValueAtTime(1, audioContext.currentTime + adsr.attack);
	decay.gain.exponentialRampToValueAtTime(adsr.sustain / 100, audioContext.currentTime + adsr.attack + adsr.decay);
	decay.connect(release);

	release.connect(audioContext.destination);

	if (Number.isFinite(freq)) {
		osc.frequency.value = freq;
	}

	// Stop previous iteration of the note
	stopKey(clickedKey);

	// Change state and play the note
	key.element.setAttribute('aria-pressed', 'true');
	pressedNotes.set(JSON.stringify(key), { osc, release, adsr, threshold });
	pressedNotes.get(JSON.stringify(key)).osc.start();
}

function stopKey(key) {
	if (!key) {
		return;
	}
	key.element.setAttribute('aria-pressed', 'false');

	const note = pressedNotes.get(JSON.stringify(key));
	if (!note) {
		return;
	}
	const osc = note.osc;
	const release = note.release;
	const adsr = note.adsr;
	const threshold = note.threshold;

	release.gain.setValueAtTime(0.9, audioContext.currentTime);
	release.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + Math.max(adsr.release, threshold));

	if (osc) {
		setTimeout(() => {
			osc.stop();
		}, 1000 * Math.max(adsr.release, threshold));

		pressedNotes.delete(JSON.stringify(key));
	}
}

function triggerKey(element, note, octave) {
	let key = { element, note, octave };
	clickedKey = key;
	playKey(key);
}

/* Init */
enableSynth();
setKeyboardLayout();
reLabelKeys();

/* Event handlers */
document.addEventListener('click', (e) => {
	const toggler = e.target.closest('.toggleswitch');
	if (!toggler) {
		return true;
	}

	const cbox = toggler.querySelector('.toggleswitch-checkbox');
	const label = e.target.closest('[data-value]');
	if (!label) {
		return true;
	}

	e.preventDefault();
	const forcedVal = label.getAttribute('data-value') === 'true';
	cbox.checked = forcedVal;

	return false;
});

document.addEventListener('change', (e) => {
	const cbox = e.target.closest('.toggleswitch-checkbox');
	if (!cbox) {
		return;
	}
	isAzerty = cbox.checked;
	cbox.setAttribute('aria-checked', isAzerty.toString());
	setKeyboardLayout(isAzerty);
	reLabelKeys();
});

document.addEventListener('keydown', (e) => {
	if (isKeyEventShift(e) || e.shiftKey) {
		isShiftPressed = true;
		reLabelKeys();
	}
});

document.addEventListener('keyup', (e) => {
	if (isKeyEventShift(e) || (!e.shiftKey && !isKeyEventShift(e))) {
		isShiftPressed = false;
		reLabelKeys();
	}
});

document.addEventListener(
	'mousedown',
	(e) => {
		var element = e.target.closest('[data-note]');
		if (!element) {
			return;
		}
		e.preventDefault();
		triggerKey(element, element.getAttribute('data-note'), parseInt(element.getAttribute('data-octave'), 10));
		return false;
	},
	false
);

document.addEventListener('mouseup', () => stopKey(clickedKey), false);

document.addEventListener('keydown', (e) => {
	const pressedKey = e.key.toUpperCase();

	// Keyboard shortcuts shouldn't get interrupted
	if (e.altKey || e.metaKey || e.ctrlKey) {
		return;
	}

	// If the user has a key focused and pressed either Enter or Space, play the focused note
	if (pressedKey === 'ENTER' || pressedKey === ' ') {
		const element = e.target.closest('[data-note]');
		if (!element) {
			return;
		}
		triggerKey(element, element.getAttribute('data-note'), parseInt(element.getAttribute('data-octave'), 10));
		return;
	}

	// Find the note associated with the keyboard key
	const keyNote = getNoteByKey(pressedKey);
	if (!keyNote) {
		return;
	}
	let key = getKeyDataByKeyNote(keyNote);
	clickedKey = key;
	playKey(key);
});

document.addEventListener(
	'keyup',
	() => {
		console.log('letgo', clickedKey);
		stopKey(clickedKey);
	},
	false
);
