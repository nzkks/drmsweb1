'use strict';

var gulp                = require('gulp'),
    pug                 = require('gulp-pug'),
    path                = require('path'),
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

var paths               = {
    jsSRC               : ['./src/js/*.js'],
    jsDEST              : 'dist/assets/scripts/',
    concatJsFile        : 'app.min.js',
    vendorsJsSRC        : ['./src/vendors/**/*.js'],
    concatVendorJsFile  : 'vendors.min.js',
    vendorsCssSRC       : ['./src/vendors/**/*.css'],
    concatVendorCssFile : 'vendors.min.css',
    sassSRC             : ['./src/sass/app.sass'],
    cssDEST             : 'dist/assets/styles/',
    autoPrefixBrowsers  : ['last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'],
    pugSRC              : ['./src/pug/**/*.pug'],
    pugDEST             : './src/',
    htmlSRC             : ['./src/index.html'],
    htmlDEST            : 'dist/'
};

gulp.task('compressVendorStyles', function(){
  return gulp.src(paths.vendorsCssSRC)
      .pipe(sourceMaps.init())
      .pipe(concat(paths.concatVendorCssFile))
      //.pipe(autoPrefixer({browsers: autoPrefixBrowsers}))
      .pipe(cleanCss())
      //.pipe(rename({extname: ".min.css"}))
      .pipe(sourceMaps.write())
      .pipe(gulp.dest(paths.cssDEST));
});

gulp.task('cssifySass', function(){
  return gulp.src(paths.sassSRC)
      .pipe(sourceMaps.init())
      .pipe(sass.sync().on('error', sass.logError))
      .pipe(autoPrefixer({browsers: paths.autoPrefixBrowsers}))
      .pipe(cleanCss())
      .pipe(rename({extname: ".min.css"}))
      .pipe(sourceMaps.write())
      .pipe(gulp.dest(paths.cssDEST));
});

gulp.task('processPugFiles', function(){
  return gulp.src(paths.pugSRC)
      .pipe(pug())
      .pipe(gulp.dest(paths.pugDEST));
});

gulp.task('copyHTML', function(){
  return gulp.src(paths.htmlSRC)
      .pipe(plumber())
      .pipe(copy())
      .pipe(gulp.dest(paths.htmlDEST));
});

gulp.task('copyVendorsScripts', function(){
  return gulp.src(paths.vendorsJsSRC)
      .pipe(plumber())
      .pipe(concat(paths.concatVendorJsFile))
      .pipe(gulp.dest(paths.jsDEST));
});

gulp.task('lint', function(){
  return gulp.src(paths.jsSRC)
      .pipe(plumber())
      .pipe(jsHint())
      .pipe(jsHint.reporter('default'));
});

gulp.task('concatAndMinifyScripts', function(){
  return gulp.src(paths.jsSRC)
      .pipe(sourceMaps.init())
      .pipe(plumber())
      .pipe(concat(paths.concatJsFile))
      .pipe(uglify())
      .pipe(sourceMaps.write())
      .pipe(gulp.dest(paths.jsDEST));
});

gulp.task('serve', function(){
  browserSync.init({
    server: './dist/'
  });

  gulp.watch(paths.pugSRC, ['processPugFiles']).on('change', reload);
  gulp.watch('./src/sass/**/*.sass', ['cssifySass']).on('change', reload);
  gulp.watch(paths.jsSRC, ['lint', 'concatAndMinifyScripts']).on('change', reload);
  gulp.watch(paths.vendorsJsSRC, ['copyVendorsScripts']).on('change', reload);
  gulp.watch(paths.vendorsCssSRC, ['compressVendorStyles']).on('change', reload);
  gulp.watch(paths.htmlSRC, ['copyHTML']).on('change', reload);
});

gulp.task('default', function(callback){
  runSequence(['serve', 'processPugFiles', 'compressVendorStyles', 'cssifySass', 'copyHTML', 'copyVendorsScripts', 'lint', 'concatAndMinifyScripts'], callback);
});
