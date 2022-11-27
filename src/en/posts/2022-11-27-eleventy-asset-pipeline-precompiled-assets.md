---
title: 'Eleventy Asset Pipeline: Precompiled Assets without Gulp'
summary: Precompiled Sass and JS files that become part of the source folder.
metaImageBackground: 'https://images.unsplash.com/photo-1543674892-7d64d45df18b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2060&q=80'
tags:
    - eleventy
    - javascript
templateEngineOverride: njk,md
---

I've found out a way to avoid using Gulp and save compiled assets that then live as regular assets that can be used as includes and whatnot within my Eleventy build. (and yes, [I like to precompile](/blog/eleventy-within-eleventy-precompiling-reused-assets/), it seems…) [Full code at the end!](#all-done)

For the past few years, I've been using Gulp to convert my JSON tokens to Sass, to compile my Sass into CSS, and to minify my JS files. Gulp is super simple and works great for what I need. However, having to run it in parallel from Eleventy means that I couldn't rely on a nice series of events to trigger my Eleventy build right as the Gulp stuff was done. I did have [a delay before re-running](https://www.11ty.dev/docs/watch-serve/#add-delay-before-re-running) but if I set the delay to a second, what if Gulp took 500ms? Half a second, gone forever! And if Gulp took 1500ms, then the build would get interrupted and restart, wasting more time! Let's improve this.

## Not exactly a new idea from me

First off, I want to acknowledge that most folks can use a regular [assets pipeline like Max Böck's](https://mxb.dev/blog/eleventy-asset-pipeline/) or even push it further like [Vadim Makeev's recent solution](https://pepelsbey.dev/articles/eleventy-css-js/). These are smart and effective solutions that I'd likely use if I weren't inlining. In my case, the CSS gets inlined as a transform via PurgeCSS, so I want the global stylesheet to be available as a source file (so it doesn't compile for every page, though [that could likely be cached](/blog/eleventy-within-eleventy-precompiling-reused-assets/#quick-update)), and not as an output file with its own permalink. Additionally, I have a JSON file with design tokens that needs to get converted into a Sass file. Fun!

## From Gulp to eleventy.before

Alright, so the idea is to use the `eleventy.before` event, which replaces my Gulp setup. But changing stuff is always a good excuse to look for new ways to do things. Inspired by Vadim's aforementioned article, I've switched over to `esbuild` instead of using `terser`, though I don't believe that to be essential — there's both pretty dang fast for a small site like mine.

The callback for the `before` event passes in the base `config`, including current folder information, which I can use for the Sass compiler [as demonstrated on the Eleventy docs](https://www.11ty.dev/docs/languages/custom/#using-inputpath), to properly resolve imports.

{% callout %}
I have my assets in `/src/assets/scss` and `/src/assets/js`, and the resulting files are output to `/src/_includes/assets/css` and `/src/_includes/assets/js`, respectively, so if you decide to use this setup, make sure you adjust for your file structure!
{% endcallout %}

## Let's get coding

First, the packages I use need to be installed, in my case via npm:

```text
npm install glob json-sass sass esbuild
```

I then require those packages and define the function and ensure all the mandatory properties are passed to the `settings` object:

```js
const path = require('node:path'); // Part of node, no need to install
const fs = require('fs'); // Part of node, no need to install
const glob = require('glob');
const jsonSass = require('json-sass');
const sass = require('sass');
const esbuild = require('esbuild');

module.exports = function (eleventyConfig) {
    eleventyConfig.on('eleventy.before', function (config) {
        /**
         * Compile a list of files from the src/assets folder to src/_includes/assets.
         * @param {Object} settings Configuration for the compiler.
         * @param {string} settings.inFolder Name of the input folder.
         * @param {string} settings.inExt Extension of the input files.
         * @param {string} [settings.outFolder] Optional. Name of the output folder. Defaults to the same name as `inFolder`.
         * @param {string} [settings.outExt] Optional. Extension of the output files. Defaults to the same extension as `inExt`.
         * @param {function} [settings.filterFn] Optional. Function run against the list of file paths returning a boolean describing if the file should be compiled.
         * @param {function} settings.compileFn Compiler for the provided files.
         * @returns {Promise<string[]>} List of output files.
         */
        const compileAssets = (settings) => {
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

            return new Promise((resolve, reject) => {
                /* Here goes all the file-finding, compilation, and output logic */
            });
        };
    });
};
```

This `compileAssets` function is trying to be forgiving: if you're taking JS files, it's likely you'll want JS in the output as well, so the name and extensions can be omitted and will be copied for the output. Some other cases though, like Sass, will require a different output. The callback for the `before` event needs to know when everything is done so it can run the actual build, so I am making heavy use of the [`Promise` API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise). I also have to handle my JSON file for the design tokens before the Sass compilation runs, furthering my need for promises.

Okay so the scaffolding is in place, but that promise is still looking pretty sad, so here's what needs to happen:
1. Find files by glob
1. Filter files I don't need (e.g. Sass files starting with `_`)
1. Iterate over each file and get their path information
1. Determine the output subfolder if relevant
1. Compile the file with a provided compiler
1. Save the file to the correct folder (but also ensure the folder exists!)

```js
/* Previous code omitted for brevity */

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
            /* Compilation and output logic */
        });
    });
});
```

Now that I have a list of the files I want to process, I can compute the output paths and compile each file to their target:

```js
/* Previous code omitted for brevity */

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
        // Create the folder structure if it doesn't exist, including subfolders thanks to `recursive: true`
        fs.mkdir('./' + folder, { recursive: true }, (dirErr, path) => {
            if (dirErr) {
                return failure(dirErr);
            }

            // Write the file with the provided result
            fs.writeFile(outputPath, result, { flag: 'w' }, (fileError) => {
                if (fileError) {
                    return failure(fileError);
                }

                // This promise has done all we needed, so we can resolve it
                success(outputPath);
            });
        })
    );
});

// Resolve the `compileAssets` promise when all the files are processed
Promise.all(compiledFiles).then((savedFiles) => resolve(savedFiles));
```

Quite a bit going on here! Since I have some assets that live in subfolders, I need to grab whatever is after the common source folder path, so `outputPath` is a bit heavy-handed. Then the `compileFn` is called on the `parsed` file path object — the defined function must be able to work with that, which I'll demonstrate below! Then I have a promise to place my file in the correct folder using `fs`. Once done, I can resolve the promise with `success(outputPath)`. And finally, I resolve the "factory's" promise when all the compiled file promises have succeeded.

I think this is a fairly straightforward piece but the fact that we have multiple layers of promises does make it a little confusing. I hope the variable names I used help keep this understandable!

At this point, the `compileAssets` function is ready to get to work. Within the context of the `eleventy.before` handler, below the function definition, I compile my Sass and JS files:

```js
/* Previous code omitted for brevity */

const styles = compileAssets({
    inFolder: 'scss',
    inExt: 'scss',
    outFolder: 'css',
    outExt: 'css',
    filterFn: (inputPath) => !inputPath.split('/').pop().startsWith('_'),
    compileFn: async (parsed) => {
        const result = sass.compile(`${parsed.dir}/${parsed.base}`, {
            loadPaths: [parsed.dir || '.', config.dir.includes],
            style: 'compressed',
            precision: 4,
        });
        return result.css;
    },
});

const scripts = compileAssets({
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
```

{% callout %}
While the `filterFn` accepts a string, the `compileFn` makes use of the parsed path object. The filter function is, for my needs, very light so I'd rather only parse the paths of the files I know I'll compile (if this smells of micro-optimisation to you… you're probably right).
{% endcallout %}

So now I need to tell Eleventy this is done and the build can start, right?

Not so fast! I still need that JSON-to-Sass step for my tokens, which can be added below the previous code block. It reads the input file, passes it to `jsonSass`, and the contents are passed to create a new file. When it's done, it gets resolved, or rejected on error.

```js
// Compile the JSON tokens file to a Sass file first
const tokens = new Promise((resolve, reject) =>
    fs
        .createReadStream(`${config.inputDir}/_data/tokens.json`)
        .pipe(jsonSass({ prefix: '$tokens: ' }))
        .pipe(
            fs
                .createWriteStream(`${config.inputDir}/assets/scss/tools/_tokens.scss`)
                .on('finish', () => resolve())
                .on('error', () => reject())
        )
);
```

Nice and easy! Last thing is to indeed tell Eleventy to build. This is achieved by returning a promise, since this is an asynchronous setup. Eleventy will wait until the promise is resolved. For me, it's a chained promise of JSON then Sass, and in parallel, the JS files. This is accomplished with a neat one-liner:

```js
return Promise.all([tokens.then(() => styles), scripts]);
```

The final piece of the puzzle is to handle how Eleventy watches the input and output files, or else it's headed straight for Infinite Loop Land! With `v2.0.0-canary.18`, this is a breeze:

```js
eleventyConfig.addWatchTarget(`./${rootDir}/assets/scss/**/*.scss`);
eleventyConfig.addWatchTarget(`./${rootDir}/assets/js/**/*.js`); // Unnecessary, I think, but I like the symmetry
// Ignore the compiled files
eleventyConfig.watchIgnores.add(`./${rootDir}/assets/scss/tools/_tokens.scss`);
eleventyConfig.watchIgnores.add(`./${rootDir}/_includes/assets/css/**/*`);
eleventyConfig.watchIgnores.add(`./${rootDir}/_includes/assets/js/**/*`);
```
## All done

And that's that! I will mention one downside of this process instead of gulp is that JSON, Sass and JS all get recompiled every time, for any change, instead of just being changed as-needed, but I think with a little more Eleventinkering, it can be overcome. The upshot is that now my build starts exactly when it needs to! And it's still blazingly fast, but that's Eleventy for ya…

Anyways, I hope this was interesting for you! You can find [my final Eleventy configuration file on GitHub](https://github.com/chriskirknielsen/chriskirknielsen.com/blob/main/.eleventy.js), but for all that I went over, this is the full configuration:

```js
const rootDir = 'src';

const path = require('node:path'); // Part of node, no need to install
const fs = require('fs'); // Part of node, no need to install
const glob = require('glob');
const jsonSass = require('json-sass');
const sass = require('sass');
const esbuild = require('esbuild');

module.exports = function (eleventyConfig) {
    eleventyConfig.on('eleventy.before', function (config) {
        /**
         * Compile a list of files from the src/assets folder to src/_includes/assets.
         * @param {Object} settings Configuration for the compiler.
         * @param {string} settings.inFolder Name of the input folder.
         * @param {string} settings.inExt Extension of the input files.
         * @param {string} [settings.outFolder] Optional. Name of the output folder. Defaults to the same name as `inFolder`.
         * @param {string} [settings.outExt] Optional. Extension of the output files. Defaults to the same extension as `inExt`.
         * @param {function} [settings.filterFn] Optional. Function run against the list of file paths returning a boolean describing if the file should be compiled.
         * @param {function} settings.compileFn Compiler for the provided files.
         * @returns {Promise<string[]>} List of output files.
         */
        const compileAssets = (settings) => {
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
        };

        // Compile the JSON tokens file to a Sass file first
        const tokens = new Promise((resolve, reject) =>
            fs
                .createReadStream(`${config.inputDir}/_data/tokens.json`)
                .pipe(jsonSass({ prefix: '$tokens: ' }))
                .pipe(
                    fs
                        .createWriteStream(`${config.inputDir}/assets/scss/tools/_tokens.scss`)
                        .on('finish', () => resolve())
                        .on('error', () => reject())
                )
        );

        const styles = compileAssets({
            inFolder: 'scss',
            inExt: 'scss',
            outFolder: 'css',
            outExt: 'css',
            filterFn: (inputPath) => !inputPath.split('/').pop().startsWith('_'),
            compileFn: async (parsed) => {
                const result = sass.compile(`${parsed.dir}/${parsed.base}`, {
                    loadPaths: [parsed.dir || '.', config.dir.includes],
                    style: 'compressed',
                    precision: 4,
                });
                return result.css;
            },
        });
        const scripts = compileAssets({
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

        return Promise.all([tokens.then(() => styles), scripts]);
    });

    eleventyConfig.addWatchTarget(`./${rootDir}/assets/scss/**/*.scss`);
    eleventyConfig.addWatchTarget(`./${rootDir}/assets/js/**/*.js`); // Unnecessary, I think, but I like the symmetry
    // Ignore the compiled files
    eleventyConfig.watchIgnores.add(`./${rootDir}/assets/scss/tools/_tokens.scss`);
    eleventyConfig.watchIgnores.add(`./${rootDir}/_includes/assets/css/**/*`);
    eleventyConfig.watchIgnores.add(`./${rootDir}/_includes/assets/js/**/*`);
}
```