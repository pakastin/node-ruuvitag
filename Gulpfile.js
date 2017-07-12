const gulp = require('gulp')
  , jasmine = require('gulp-jasmine')
  , plumber = require('gulp-plumber')
  , jshint = require('gulp-jshint');

gulp.task('test', function () {
  gulp.src('test/*Spec.js')
    .pipe(plumber())
    .pipe(jasmine())
    .on('error', (err) => { console.log('Error in tests! ' + err.message); });
});

gulp.task('jshint', function () {
  gulp.src(['**/*.js', '!node_modules/**/*.js'])
    .pipe(plumber())
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('watch', ['jshint', 'test'], function () {
  gulp.watch(['**/*.js', '!node_modules/**/*.js'], ['jshint', 'test']);
});
