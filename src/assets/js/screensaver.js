(function () {
	// Set up an object to count the key inputs and the required keys for the Konami code
	const keys = {
		index: 0,
		konami: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'],
	};

	// List available colors
	const colors = ['red', 'green', 'blue', 'yellow', 'cyan', 'orange', 'hotpink', 'white'];

	// Flag if the stylesheet's loaded
	let styleInit = false;
	let lastColor;
	const getRandomItem = (list) => list[Math.floor(Math.random() * list.length)];
	const setScreenSaver = (isOn = false) => {
		// Find an existing screensaver…
		let screenSaver = document.querySelector('.screensaver');

		// If there is no screensaver and we want one, create it (if it exists and we waant one, do nothing)
		if (!screenSaver && isOn) {
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
			screenSaver.addEventListener('animationiteration', (e) => {
				const diffColors = colors.filter((c) => c !== lastColor); // Exclude last used color
				const newColor = getRandomItem(diffColors);
				screenSaver.style.setProperty('--scrnsvr-logo-fill', newColor);
				lastColor = newColor;
			});

			screenSaver.innerHTML = '<div><svg viewBox="0 0 159 64.8" width="159" height="65"><use href="#ckn-logo" /></svg></div>';
			document.body.appendChild(screenSaver);
		} else if (screenSaver && !isOn) {
			screenSaver.remove();
		}
	};

	document.addEventListener('keyup', (e) => {
		if (e.isTrusted) {
			if (keys.konami[keys.index] === e.key) {
				if (keys.index == 9) {
					keys.index = 0;

					// If the stylesheet isn't added, let's bring it in
					if (!styleInit) {
						const link = document.createElement('link');
						link.rel = 'stylesheet';
						link.type = 'text/css';
						link.href = scrsvrUrl;
						document.head.appendChild(link);
						styleInit = true;
						link.onload = setScreenSaver(true);
					} else {
						setScreenSaver(true);
					}
					return; // We're done here!
				} else {
					keys.index++;
				}
			}
			setScreenSaver(false); // If this isn't konami-esaue, any key input results in the destruction of the screensaver
		}
	});

	// If there's a click, remove the screensaver
	document.addEventListener('click', (e) => setScreenSaver(false));
})();
