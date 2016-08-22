var gulp = require('gulp');

var SRC = 'src/itotoshi.js';
var SRC_LINT_GLOB = 'src/**/*.js';
var SRC_BASENAME = 'itotoshi.js';
var DEST = 'dist';

// Do lint task for production build.
gulp.task('build', ['lint'], function() {
  return doBuild(false);
});

gulp.task('build-dev', function() {
  return doBuild(true);
});

function doBuild(development) {
  function onError(err) {
    console.log(err.message);
    console.log(err.stack);
  }

  var browserify = require('browserify');
  var source = require('vinyl-source-stream');
  var buffer = require('vinyl-buffer');

  var b = browserify({
    entries: SRC,
    debug: true,
  });
  b = b.transform('babelify')
  b = b.bundle()
  b = b.on('error', onError);
  // turns the output bundle stream into a stream containing
  // the normal attributes gulp plugins expect.
  b = b.pipe(source(SRC_BASENAME));
  // transform streaming contents into buffer contents
  // (because gulp-sourcemaps does not support streaming contents)
  b = b.pipe(buffer());
  if (!development) {
    var sourcemaps = require('gulp-sourcemaps');
    var uglify = require('gulp-uglify');
    b = b.pipe(sourcemaps.init({loadMaps: true}));
    b = b.pipe(uglify()).on('error', onError);
    b = b.pipe(sourcemaps.write());
  }
  b = b.pipe(gulp.dest(DEST));
  return b;
}

gulp.task('lint', function() {
  var eslint = require('gulp-eslint');

  return gulp.src(SRC_LINT_GLOB)
    .pipe(eslint({ useEslintrc: true }))
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
});
