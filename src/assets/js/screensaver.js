(function () {
	// Set up an object to count the key inputs and the required keys for the Konami code
	const keys = {
		index: 0,
		konami: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'],
	};

	// List available colors
	const colors = ['tomato', 'green', 'slateblue', 'yellow', 'cyan', 'orange', 'deeppink', 'white'];
	let lastColor;
	let lastCollisionTime;

	const getRandomItem = (list) => list[Math.floor(Math.random() * list.length)];
	const setScreenSaver = (isOn = false) => {
		// Find an existing screensaver…
		let screenSaver = document.querySelector('.screensaver');

		// Define the "collision" function
		const onCollision = (e) => {
			if (!['scrsvrX', 'scrsvrY'].includes(e.animationName)) {
				return;
			}
			const diffColors = colors.filter((c) => c !== lastColor); // Exclude last used color
			const newCollisionTime = Date.now();
			const isDoubleCollision = newCollisionTime - lastCollisionTime <= 100; // If two collisions occurred nearly at the same time, we can pretent it's a corner hit, party!
			const newColor = isDoubleCollision ? lastColor : getRandomItem(diffColors);

			if (isDoubleCollision) {
				const confettiCount = 128;
				const confettiRemove = (e) => {
					const confetti = e.target;
					if (e.animationName !== 'scrsvrConfettiTransform') {
						return;
					}
					confetti.removeEventListener('animationend', confettiRemove);
					confetti.remove();
				};

				for (let c = 0; c < confettiCount; c++) {
					const confetti = document.createElement('div');
					const color = getRandomItem(colors);
					const speed = 1 + parseFloat((Math.random() / 5 - 0.1).toFixed(3)); // Value between 0.9 and 1.1
					const delay = Math.round(Math.random() * 500);
					const scale = (Math.random() / 2 + 0.5).toFixed(3);
					const rotate = parseFloat((Math.random() - 0.5).toFixed(3));
					const translate = ((c / confettiCount) * 100 + (Math.random() - 0.5)).toFixed(3);
					confetti.classList.add('confetti');
					confetti.setAttribute('aria-hidden', 'true');
					confetti.style.setProperty('--confetti-color', color);
					confetti.style.setProperty('--confetti-speed', speed);
					confetti.style.setProperty('--confetti-delay', delay);
					confetti.style.setProperty('--confetti-scale', scale);
					confetti.style.setProperty('--confetti-rotate', rotate);
					confetti.style.setProperty('--confetti-translate', translate);
					screenSaver.appendChild(confetti);
					confetti.addEventListener('animationend', confettiRemove);
				}
			}

			screenSaver.style.setProperty('--scrnsvr-logo-fill', newColor);
			lastColor = newColor;
			lastCollisionTime = newCollisionTime;
		};

		// If there is a screensaver, remove it if required, or leave it if it should be visible
		if (!isOn) {
			if (screenSaver) {
				screenSaver.removeEventListener('animationiteration', onCollision);
				screenSaver.remove();
			}

			document.documentElement.removeAttribute('data-screensaver');
			return;
		}

		const randSpeedX = (0.75 + Math.random() * 0.5).toFixed(4);
		const randSpeedY = (0.75 + Math.random() * 0.5).toFixed(4);
		const randDelayX = Math.floor(Math.random() * 2500);
		const randDelayY = Math.floor(Math.random() * 2500);
		const color = getRandomItem(colors);

		screenSaver = document.createElement('div');

		screenSaver.style.setProperty('--scrnsvr-logo-fill', color);
		screenSaver.style.setProperty('--scrnsvr-speed-x', randSpeedX);
		screenSaver.style.setProperty('--scrnsvr-speed-y', randSpeedY);
		screenSaver.style.setProperty('--scrnsvr-delay-x', `-${randDelayX}ms`);
		screenSaver.style.setProperty('--scrnsvr-delay-y', `-${randDelayY}ms`);
		screenSaver.classList.add('screensaver');

		// Change color once a border is hit
		screenSaver.addEventListener('animationiteration', onCollision);

		screenSaver.innerHTML = '<div><svg width="183.79" height="80.86" viewBox="0 0 183.79 80.86"><use href="#dvd-logo" /></svg></div>';
		document.body.appendChild(screenSaver);
		document.documentElement.setAttribute('data-screensaver', '');
	};

	document.addEventListener('keyup', (e) => {
		if (e.isTrusted) {
			if (keys.konami[keys.index] === e.key) {
				if (keys.index == keys.konami.length - 1) {
					keys.index = 0;

					setScreenSaver(true);
					return; // We're done here!
				} else {
					keys.index++;
				}
			}
			setScreenSaver(false); // If this isn't konami-esque, any key input results in the destruction of the screensaver
		}
	});

	// If there's a click, remove the screensaver
	document.addEventListener('click', () => setScreenSaver(false));
})();
