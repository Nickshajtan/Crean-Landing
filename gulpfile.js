/*
* run "npm install" to install all dependencies from package.json or run those manually
*
*/

'use strict';
var gulp           = require('gulp'),
    gutil          = require('gulp-util' ),
    data           = require('gulp-data'),
    path           = require('path'),
    sass           = require('gulp-sass'),
    concat         = require('gulp-concat'),
    uglify         = require('gulp-uglify-es').default,
    sourcemaps     = require('gulp-sourcemaps'),
    autoprefixer   = require('gulp-autoprefixer'),
    fontmin        = require('gulp-fontmin'),
    imagemin       = require('gulp-imagemin'),
    imageminSvgo   = require('imagemin-svgo'),
    browsersync    = require('browser-sync').create(),
    notify         = require('gulp-notify');
    
var notifyOptions = {
  message : 'Error:: <%= error.message %> \nLine:: <%= error.line %> \nCode:: <%= error.extract %>'
};

var syntax = [ 'scss' ]; // Include your css syntax into array;

function browserSync(done) {
	browsersync.init({
        //Domen name or main directory ( choose server or proxy )
        server: {
            baseDir: "./" //server + /sync-options = settings 
        },  
        //proxy: "avto.com", //proxy + /sync-options = settings; OSpanel domen name
        notify: false,
        //port: 8080, 3000
        //open: true,
        //files: ;
	});
    done();
}

function browserSyncReload() {
  browsersync.reload();
}

/*
* compile theme scss
*/
gulp.task('scss-styles', function(){
      return gulp
      .src('./assets/scss/theme/main.scss')
      .pipe(sourcemaps.init())
      .pipe(sass({outputStyle: 'compressed'}).on('error',  notify.onError(notifyOptions)))
      .pipe(autoprefixer({ overrideBrowserslist: ['last 99 versions'], cascade: false }))
      .pipe(concat('theme-styles.min.css'))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest('./assets/public/'));
});
    
// Vendor styles
gulp.task('vendor-styles', function(){
      return gulp
      .src('./assets/scss/vendor/vendor.scss')
      .pipe(sourcemaps.init())
      .pipe(sass({outputStyle: 'compressed'}).on('error',  notify.onError(notifyOptions)))
      .pipe(autoprefixer({ overrideBrowserslist: ['last 99 versions'], cascade: false }))
      .pipe(concat('vendor-styles.min.css'))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest('./assets/public/'));
});

/*
* compile theme js
*/
gulp.task('theme-scripts', function() {
  return gulp
  .src('./assets/js/theme/*.js')
  .pipe(concat('theme.min.js'))
  .pipe(sourcemaps.init())
  .pipe(uglify())
  .pipe(sourcemaps.write('.'))
  .pipe(gulp.dest('./assets/public/'));
});

/*
* compile vendor scripts
*/
gulp.task('vendor-scripts', function() {
  return gulp
  .src('./assets/js/vendor/*.js')
  .pipe(concat('vendor.min.js'))
  .pipe(sourcemaps.init())
  .pipe(uglify())
  .pipe(sourcemaps.write('.'))
  .pipe(gulp.dest('./assets/public/'));
});

/*
* optimize theme images
*/
gulp.task('compress-img', function(done) {
    return gulp
    .src('./assets/img/**/*')
    .pipe(sourcemaps.init())
    .pipe(imagemin([
            imageminSvgo({
                plugins: [
                    {removeViewBox: true}
                ]
            })
        ]))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./assets/public/img/'))
    .on('end', done);
});

/*
* minify fonts
*/
function minifyFont(text, cb) {
    gulp
    .src('./assets/fonts/**/*.ttf')
    .pipe(fontmin({
            text: text
    }))
    .pipe(gulp.dest('./public/fonts/'))
    .on('end', cb);
}
gulp.task('compress-fonts', function(cb) {
    var buffers = [];
    gulp.src('index.php')
    .on('data', function(file) {
            buffers.push(file.contents);
    })
    .on('end', function() {
            var text = Buffer.concat(buffers).toString('utf-8');
            minifyFont(text, cb);
    });
});

/*
* copy fonts dir
*/
gulp.task('copy-dir-fonts', function(done) {
    return gulp
    .src('./assets/fonts/**/*.*')
    .on('data', function(file){  
			console.log({
                contents: file.contents,                 
                path: file.path,                         
                cwd: file.cwd,                           
                base: file.base,                         
                // path component helpers                
                relative: file.relative,                 
                dirname: file.dirname,                   
                basename: file.basename,                 
                stem: file.stem,                         
                extname: file.extname   
            });                 
    })    
    .pipe(gulp.dest('./assets/public/fonts/') );
});

gulp.task('fonts-styles', function(){
  return gulp
  .src('./assets/fonts/fonts.css')
  .pipe(sourcemaps.init())
  .pipe(sass({outputStyle: 'compressed'}).on('error',  notify.onError(notifyOptions)))
  .pipe(autoprefixer({ browsers: ['last 99 versions'], cascade: false }))
  .pipe(concat('fonts.min.css'))
  .pipe(sourcemaps.write('.'))
  .pipe(gulp.dest('./assets/public/'));
});


/*
*  run task for one time vendor styles, js files compiling
*/
gulp.task('vendor', gulp.series('vendor-styles','vendor-scripts', 'copy-dir-fonts', 'fonts-styles'));

/* 
* run task for continuous track of theme files 
*/
gulp.task('watch-theme', function() {
    gulp.watch('./assets/scss/theme/**/*.scss',   gulp.series('scss-styles')).on( 'change', browserSyncReload );
	gulp.watch('./assets/fonts/fonts.css',  gulp.series('fonts-styles', 'copy-dir-fonts')).on( 'change', browserSyncReload );
	gulp.watch('./assets/js/theme/*.js',  gulp.series('theme-scripts')).on( 'change', browserSyncReload );
	gulp.watch(['./assets/img/**/*', './assets/img/*'], gulp.series('compress-img')).on( 'change', browserSyncReload );
});

gulp.task('default', gulp.parallel('watch-theme', 'copy-dir-fonts', 'fonts-styles', 'vendor', browserSync));