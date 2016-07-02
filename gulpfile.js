var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var browserify = require('browserify');
var transform = require('vinyl-transform');
// var babelify = require('babelify');
var source = require('vinyl-source-stream');
var through2 = require('through2');

gulp.task('build', function() {
  return gulp.src('./src/**/*.js')
    // .on("error", function (err) {
    //   console.log("Error : " + err.message);
    //   console.log(err.stack);
    // })
    .pipe(through2.obj(function(file, encode, callback) {
        // fileにはsrcで読み込んだファイルの情報が引き渡される
        // file.pathを利用してbrowserifyインスタンスを生成する
        browserify(file.path)
          .transform('babelify', {presets: ["es2015"]})
          .bundle(function(err, res) {
            if (err) {
              console.log("Error : " + err.message);
              console.log(err.stack);
            }
            // bundleを実行し，処理結果でcontentsを上書きする
            file.contents = res;
            // callbackを実行し，次の処理にfileを引き渡す
            // nullになっている部分はエラー情報
            callback(null, file)
          });
    }))
    .pipe($.uglify())
    .pipe($.sourcemaps.init({loadMaps: true}))
    .pipe($.sourcemaps.write())
    // .pipe(source('bundle.js'))
    .pipe(gulp.dest('./dist'));
});
