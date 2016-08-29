'use strict';

var gulp                = require('gulp'),
    jsHint              = require('gulp-jshint'),
    concat              = require('gulp-concat'),
    uglify              = require('gulp-uglify'),
    sourceMaps          = require('gulp-sourcemaps'),
    copy                = require('gulp-contrib-copy'),
    plumber             = require('gulp-plumber'),
    sass                = require('gulp-sass'),
    cleanCss            = require('gulp-clean-css'),
    autoPrefixer        = require('gulp-autoprefixer'),
    rename              = require('gulp-rename'),
    runSequence         = require('run-sequence'),
    browserSync         = require('browser-sync').create(),
    reload              = browserSync.reload;

var jsSRC               = './src/js/*.js',
    jsDEST              = 'dist/assets/scripts/',
    concatJsFile        = 'app.min.js',
    vendorsJsSRC        = './src/js/vendors/**/*.js',
    concatVendorJsFile  = 'vendors.min.js',
    sassSRC             = './src/sass',
    cssDEST             = 'dist/assets/styles/',
    autoPrefixBrowsers  = ['last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'],
    htmlSRC             = './src/index.html',
    htmlDEST            = 'dist/';

gulp.task('cssifySass', function(){
  return gulp.src(sassSRC +'/app.sass')
      .pipe(sourceMaps.init())
      .pipe(sass.sync().on('error', sass.logError))
      .pipe(autoPrefixer({browsers: autoPrefixBrowsers}))
      .pipe(cleanCss())
      .pipe(rename({extname: ".min.css"}))
      .pipe(sourceMaps.write())
      .pipe(gulp.dest(cssDEST));
});

gulp.task('copyHTML', function(){
  return gulp.src(htmlSRC)
      .pipe(plumber())
      .pipe(copy())
      .pipe(gulp.dest(htmlDEST));
});

gulp.task('copyVendorsScripts', function(){
  return gulp.src(vendorsJsSRC)
      .pipe(plumber())
      .pipe(concat(concatVendorJsFile))
      .pipe(gulp.dest(jsDEST));
});

gulp.task('lint', function(){
  return gulp.src(jsSRC)
      .pipe(plumber())
      .pipe(jsHint())
      .pipe(jsHint.reporter('default'));
});

gulp.task('concatAndMinifyScripts', function(){
  return gulp.src(jsSRC)
      .pipe(sourceMaps.init())
      .pipe(plumber())
      .pipe(concat(concatJsFile))
      .pipe(uglify())
      .pipe(sourceMaps.write())
      .pipe(gulp.dest(jsDEST));
});

gulp.task('serve', function(){
  browserSync.init({
    server: './dist/'
  });

  gulp.watch('./src/sass/**/*.sass', ['cssifySass']).on('change', reload);
  gulp.watch(jsSRC, ['lint', 'concatAndMinifyScripts']).on('change', reload);
  gulp.watch(vendorsJsSRC, ['copyVendorsScripts']).on('change', reload);
  gulp.watch(htmlSRC, ['copyHTML']).on('change', reload);
});

gulp.task('default', function(callback){
  runSequence(['serve', 'cssifySass', 'copyHTML', 'copyVendorsScripts', 'lint', 'concatAndMinifyScripts'], callback);
});
