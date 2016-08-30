'use strict';
var
  gulp = require('gulp'),
  path = require('path'),
  fs = require('fs'),
  del = require('del'),
  runSequence = require('run-sequence'),
  cssnext = require('postcss-cssnext'),
  $ = require('gulp-load-plugins')();

var
  paths = {
    src: 'app',
    pcDirectory: 'pc',
    spDirectory: 'sp',
    build: 'build',
    assets: 'assets',
    css: 'styles',
    js: 'scripts',
    font: 'font',
    img: 'images',
    json: 'config'
  };

gulp.task('ejs', function () {
  var
    srcJSON = path.join(paths.json, 'data.json'),
    json = JSON.parse(fs.readFileSync(srcJSON)),
    srcPath = path.join(paths.src, '**', '*.ejs'),
    ignorePath = path.join(paths.src, '**', '_*.ejs'),
    errorMessage = 'Error: <%= error.message %>';

  gulp.src([srcPath, '!' + ignorePath])
    .pipe($.plumber({
      errorHandler: $.notify.onError(errorMessage)
    }))
    .pipe($.ejs(json, {"ext": ".html"}))
    .pipe(gulp.dest(paths.build));
});

gulp.task('sass', function () {
  var
    srcPath = path.join(paths.src, paths.assets, paths.css, '**/*.sass'),
    buildPath = path.join(paths.build, paths.assets, paths.css),
    errorMessage = 'Error: <%= error.message %>',
    processors = [
      cssnext({browsers: ['last 2 version']})
    ];

  gulp.src(srcPath)
    .pipe($.plumber({
      errorHandler: $.notify.onError(errorMessage)
    }))
    .pipe($.sass({
      outputStyle: 'expanded'
    }))
    .pipe($.postcss(processors))
    .pipe(gulp.dest(buildPath));
});

gulp.task('script', function () {
  var
    srcPath = path.join(paths.src, paths.assets, paths.js, '**/*.js'),
    buildPath = path.join(paths.build, paths.assets, paths.js),
    jshintPath = path.join(paths.json, 'jshintrc.json');

  gulp.src(srcPath)
    .pipe($.plumber())
    .pipe($.jshint(jshintPath))
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe(gulp.dest(buildPath));
});

gulp.task('fonts', function () {
  var
    srcJSON = path.join(paths.json, 'font.json'),
    json = JSON.parse(fs.readFileSync(srcJSON)),
    buildPath = path.join(paths.build, paths.assets, paths.css, paths.font);

  gulp.src(json)
    .pipe(gulp.dest(buildPath));
});

gulp.task('libs', function () {
  var
    srcJSON = path.join(paths.json, 'libs.json'),
    json = JSON.parse(fs.readFileSync(srcJSON)),
    buildPath = path.join(paths.build, paths.assets, paths.js, paths.css, paths.img);

  gulp.src(json)
    .pipe(gulp.dest(buildPath));
});

gulp.task('images', function () {
  var
    srcPath = path.join(paths.src, paths.assets, paths.img, '**/*.+(jpg|jpeg|png|gif|svg)'),
    buildPath = path.join(paths.build, paths.assets, paths.img);

  gulp.src(srcPath)
    .pipe($.imagemin({
      optimizationLevel: 7
    }))
    .pipe(gulp.dest(buildPath));
});

gulp.task('watch', function () {
  var
    sassPath = path.join(paths.src, paths.assets, paths.css, '**/*.sass'),
    jsPath = path.join(paths.src, paths.assets, paths.js, '**/*.js'),
    ejsPath = path.join(paths.src, '**', '*.ejs');

  gulp.watch(sassPath, ['sass']);
  gulp.watch(jsPath, ['script']);
  gulp.watch(ejsPath, ['ejs']);
});

gulp.task('webserver', function () {
  gulp.src('./build')
    .pipe($.webserver({
      host: 'localhost',
      port: 8000,
      livereload: true,
      open: false
    }));
});

gulp.task('setting-pc', function () {
  paths.src = path.join(paths.src, paths.pcDirectory);
  paths.build = path.join(paths.build, paths.pcDirectory);
});

gulp.task('setting-sp', function () {
  paths.src = path.join(paths.src, paths.spDirectory);
  paths.build = path.join(paths.build, paths.spDirectory);
});

gulp.task('clean-pc', function (callback) {
  return del(['build/pc'], callback);
});

gulp.task('clean-sp', function (callback) {
  return del(['build/sp'], callback);
});

gulp.task('develop', function (callback) {
  runSequence(['fonts', 'libs', 'images', 'ejs', 'sass', 'script', 'watch', 'webserver'], callback);
});

gulp.task('pc', function (callback) {
  runSequence('clean-pc', ['setting-pc', 'develop'], callback);
});
gulp.task('sp', function (callback) {
  runSequence('clean-sp', ['setting-sp', 'develop'], callback);
});
