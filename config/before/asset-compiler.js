const path = require('node:path');
const fs = require('fs');
const glob = require('glob');
const jsonSass = require('json-sass');
const sass = require('sass'); // dart-sass
const esbuild = require('esbuild');

/**
 * Compile a list of files from the src/assets folder to src/_includes/assets.
 * @param {object} settings Configuration for the compiler.
 * @param {string} settings.inFolder Name of the input folder.
 * @param {string} settings.inExt Extension of the input files.
 * @param {string} [settings.outFolder] Optional. Name of the output folder. Defaults to the same name as `inFolder`.
 * @param {string} [settings.outExt] Optional. Extension of the output files. Defaults to the same extension as `inExt`.
 * @param {function} [settings.filterFn] Optional. Function run against the list of file paths retuning a boolean describing if the file should be compiled.
 * @param {function} settings.compileFn Compiler for the provided files.
 * @param {object} config Configuration for the Eleventy folders.
 * @returns {Promise<string[]>} List of output files.
 */
function assetCompiler(settings, config) {
	const _requiredSettings = ['inFolder', 'inExt', 'compileFn'];

	// Check all the correct data is passed
	if (_requiredSettings.some((s) => !settings.hasOwnProperty(s))) {
		throw 'The settings object is missing required properties: '.concat(_requiredSettings.filter((s) => !settings.hasOwnProperty(s)).join(', '));
	}

	// Ensure the compile function is properly provided
	if (typeof settings.compileFn !== 'function') {
		throw 'The compileFn property must be a function that takes a parsed path object as an argument.';
	}

	// If the output extension is missing, use the input extension
	if (!settings.hasOwnProperty('outExt')) {
		settings.outExt = settings.inExt;
	}

	// If the output folder is missing, use the input folder
	if (!settings.hasOwnProperty('outFolder')) {
		settings.outFolder = settings.inFolder;
	}

	// Create a promise so we can mark it as resolved when all the files are compiled
	return new Promise((resolve, reject) => {
		// Grab a list of all the files matching the folder and extension
		const inputFolder = `${config.inputDir}/assets/${settings.inFolder}`;
		return glob(`${inputFolder}/**/*.${settings.inExt}`, './', (globError, inputFiles) => {
			if (globError) {
				return reject(globError);
			}

			// Filter the found files if the a function is provided, or else run a basic boolean check
			const filteredInputFiles = inputFiles.filter(typeof settings.filterFn === 'function' ? settings.filterFn : (file) => Boolean(file));

			// Generate each file
			const compiledFiles = filteredInputFiles.map(async (inputPath) => {
				// Get the parsed path for the file
				const parsed = path.parse(inputPath);

				// Compute the output folder name, taking whatever is after the base asset folder and removing leading and trailing slashes
				const outputFolder = parsed.dir
					.split(inputFolder)
					.pop()
					.replace(/^(\/)+/, '')
					.replace(/(\/)+$/, '')
					.trim();

				// Compute the final output folder, checking if the output folder has a value to append a slash if needed
				const subfolder = outputFolder.length > 0 ? `${outputFolder}/` : '';
				const folder = `${config.inputDir}/_includes/assets/${settings.outFolder}/${subfolder}`;

				// Compute the final path with the file name
				const outputPath = `${folder}${parsed.name}.${settings.outExt}`;

				// Compile the input file with the provided compiler
				const result = await settings.compileFn(parsed);

				// Return a promise that handles generating the target output file
				return new Promise((success, failure) =>
					// Create the folder structure if it doesn't exist, including subfolders thanks to `recursirve: true`
					fs.mkdir('./' + folder, { recursive: true }, (dirErr, path) => {
						if (dirErr) {
							return failure(dirErr);
						}

						// Write the file with the provided result
						fs.writeFile(outputPath, result, { flag: 'w' }, (fileError) => {
							if (fileError) {
								return failure(fileError);
							}
							success(outputPath);
						});
					})
				);
			});

			// Resolve the `compileAssets` promise when all the files are processed
			Promise.all(compiledFiles).then((savedFiles) => resolve(savedFiles));
		});
	});
}

module.exports = function (eleventyConfig, options) {
	/** Pre-compiles all Sass and JS to the assets folder that is used while building. */
	eleventyConfig.on('eleventy.before', function (config) {
		let beforeStart = performance.now(); // Track execution time

		const tokensFileInput = `${config.inputDir}/_data/tokens.json`;
		const tokensFileOutput = `${config.inputDir}/assets/scss/tools/_tokens.scss`;

		// Precompile Sass and JS files with the asset compiler
		const compileAssets = (settings) => assetCompiler(settings, config);

		// Compile the JSON tokens file to a Sass file first
		const tokens = new Promise((resolve, reject) =>
			fs
				.createReadStream(tokensFileInput)
				.pipe(jsonSass({ prefix: '$tokens: ' }))
				.pipe(fs.createWriteStream(tokensFileOutput).on('finish', resolve).on('error', reject))
		);

		const styles = () =>
			compileAssets({
				inFolder: 'scss',
				inExt: 'scss',
				outFolder: 'css',
				outExt: 'css',
				filterFn: (inputPath) => !inputPath.split('/').pop().startsWith('_'),
				compileFn: async (parsed) => {
					const result = sass.compile(`${parsed.dir}/${parsed.base}`, {
						charset: false,
						loadPaths: [parsed.dir || '.', config.dir.includes],
						style: 'compressed',
						precision: 4,
					});
					return result.css;
				},
			});

		const scripts = () =>
			compileAssets({
				inFolder: 'js',
				inExt: 'js',
				compileFn: async (parsed) => {
					const result = await esbuild.build({
						target: 'es2020',
						entryPoints: [`${parsed.dir}/${parsed.base}`],
						minify: true,
						bundle: true,
						write: false,
					});
					return result.outputFiles[0].text;
				},
			});

		return Promise.all([tokens.then(styles), scripts()]).then((pipelines) => {
			console.log('\x1b[33m%s\x1b[0m', `[11ty] Ran eleventy.before in ${(performance.now() - beforeStart).toFixed(1)}ms`);
			return pipelines;
		});
	});
};
