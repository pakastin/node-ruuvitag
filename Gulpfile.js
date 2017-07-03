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

// DONT COMMIT

const raspi = require('./raspi-deploy.json');

gulp.task('deploy', function () {

  const remotePath = '/node/ruuvitest';

  const raspi = require('./raspi-deploy.json');

  const conn = ftp.create({
    host: raspi.host,
    user: raspi.user,
    password: raspi.password,
    parallel: 10,
    log: gutil.log
  });

  const globs = [
    'ruuvi.js',
    'test.js',
    'parse.js',
    'dataformats/*.js',
    'package.json'
  ];

  // using base = '.' will transfer everything to /public_html correctly
  // turn off buffering in gulp.src for best performance

  return gulp.src( globs, { base: '.', buffer: false } )
    .pipe( conn.newer( remotePath ) ) // only upload newer files
    .pipe( conn.dest( remotePath ) );
});

gulp.task('watch', ['jshint', 'test'], function () {
  gulp.watch(['**/*.js', '!node_modules/**/*.js'], ['jshint', 'test']);
});
