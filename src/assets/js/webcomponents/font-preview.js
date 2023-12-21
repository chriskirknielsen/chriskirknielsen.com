class FontPreview extends HTMLElement {
	constructor() {
		super();

		this.fontPreviewInput = this.querySelector('[data-fontpreview="preview-input"]');
		this.fontPreviewOutputWrap = this.querySelector('[data-fontpreview="preview-output-wrap"]');
		this.fontPreviewOutput = this.querySelector('[data-fontpreview="preview-output"]');
		this.fontSpecimenSampleDefault = this.getAttribute('default-sample') || 'Sample Text';

		this.addEventListener('click', this);
		this.addEventListener('keyup', this);
		this.addEventListener('change', this);
		this.addEventListener('submit', this);
	}

	updateFontPreviewText = (e = null) => {
		const text = this.fontPreviewInput.value.trim() || this.fontSpecimenSampleDefault;
		this.fontPreviewOutputWrap.setAttribute('aria-label', text);
		this.fontPreviewOutput.textContent = text;
	};

	updateFontPreviewOptions = (e = null) => {
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
					this.updateFontPreviewText(e);
					this.updateFontPreviewOptions(e);
				}
				break;
			}
			case 'keyup':
			case 'submit': {
				this.updateFontPreviewText(e);
				break;
			}
			case 'change': {
				this.updateFontPreviewOptions(e);
				break;
			}
		}

		if (e.type === 'submit') {
			e.preventDefault();
		}
	}

	connectedCallback() {
		// Once defined, we can run initial logic
		this.classList.add('defined');
		this.updateFontPreviewText();
		this.updateFontPreviewOptions();
	}
}

customElements.define('font-preview', FontPreview);
