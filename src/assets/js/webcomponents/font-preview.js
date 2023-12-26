class FontPreview extends HTMLElement {
	constructor() {
		super();

		// Grab all interactive elements
		this.fontPreviewInput = this.querySelector('[data-fontpreview="preview-input"]');
		this.fontPreviewOutputWrap = this.querySelector('[data-fontpreview="preview-output-wrap"]');
		this.fontPreviewOutput = this.querySelector('[data-fontpreview="preview-output"]');
		this.fontSpecimenSampleDefault = this.getAttribute('default-sample') || 'Sample Text';

		// Listen for events
		this.addEventListener('click', this);
		this.addEventListener('keyup', this);
		this.addEventListener('change', this);
		this.addEventListener('submit', this);
	}

	// When a user changes the custom text to preview
	updateFontPreviewText = () => {
		const text = this.fontPreviewInput.value.trim() || this.fontSpecimenSampleDefault;
		this.fontPreviewOutputWrap.setAttribute('aria-label', text);
		this.fontPreviewOutput.textContent = text;
	};

	// When a user changes the font options
	updateFontPreviewOptions = () => {
		let previewOptions = Array.from(this.querySelectorAll('[data-preview-option]'));
		previewOptions.forEach((previewOption) => {
			let classToToggle = previewOption.getAttribute('name');
			var isOptionChecked = previewOption.checked;

			this.fontPreviewOutput.classList.toggle('specimen-' + classToToggle, isOptionChecked);
		});
	};

	handleEvent(e) {
		switch (e.type) {
			case 'click': {
				if (e.target.closest('[data-fontpreview="preview-update"]')) {
					this.updateFontPreviewText();
					this.updateFontPreviewOptions();
				}
				break;
			}
			case 'keyup':
			case 'submit': {
				this.updateFontPreviewText();
				break;
			}
			case 'change': {
				this.updateFontPreviewOptions();
				break;
			}
		}

		if (e.type === 'submit') {
			e.preventDefault();
		}
	}

	connectedCallback() {
		// Once defined, we can run initial logic
		this.classList.add('defined'); // Workaround for browsers that support web components but not the :defined CSS pseudo-class
		this.updateFontPreviewText();
		this.updateFontPreviewOptions();
	}
}

customElements.define('font-preview', FontPreview);
