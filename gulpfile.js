const root = './src'; // Root folder
const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass')); // dart-sass
const babel = require('gulp-babel');
const terser = require('gulp-terser');
const { exec, spawn } = require('child_process');

gulp.task('css', function () {
	return gulp
		.src([root + '/assets/scss/*.scss', '!_*.scss'])
		.pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
		.pipe(gulp.dest(root + '/_includes/assets/css'));
});

gulp.task('js', function () {
	return gulp
		.src([root + '/assets/js/*.js'])
		.pipe(babel({ presets: ['@babel/env'] }))
		.pipe(terser())
		.pipe(gulp.dest(root + '/_includes/assets/js'));
});

gulp.task('watch', function () {
	gulp.watch(root + '/_data/tokens.json', gulp.parallel('tokens'));
	gulp.watch(root + '/assets/scss/**/*.scss', gulp.parallel('css'));
	gulp.watch(root + '/assets/js/**/*.js', gulp.parallel('js'));
});

gulp.task('tokens', function (cb) {
	const cmd = spawn('npx', ['json-to-scss', root + '/_data/tokens.json', root + '/assets/scss/tools/_tokens.scss', '--k="dq"'], { stdio: 'inherit' });
	cmd.on('close', function (code) {
		console.log('tokens exited with code ' + code);
		cb(code);
	});
	return cmd;
});

gulp.task('build-css', gulp.series('tokens', 'css'));
