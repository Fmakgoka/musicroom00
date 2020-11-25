'use strict'
const gulp = require('gulp')
const sass = require('gulp-sass')
const beautify = require('gulp-beautify')
const cleanCSS = require('gulp-clean-css')
const babel = require('gulp-babel')
const concat = require('gulp-concat')
const terser = require('gulp-terser')
const sourcemaps = require('gulp-sourcemaps')

sass.compiler = require('node-sass')

exports.sass = () => {
    return gulp.src('./resources/sass/**/*.scss')
    .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
    .pipe(beautify.css())
    .pipe(gulp.dest('./public/css/'))
}

exports.minifyCSS = () => {
    return gulp.src('./public/css/**/*.css')
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(gulp.dest('./public/css/'))
}

exports.ejs = () => {
    return gulp.src('./views/**/*.ejs')
    .pipe(beautify.html(
        {
            preserve_newlines: false
        }
    ))
    .pipe(gulp.dest('./views/'))
}

exports.img = () => {
    return gulp.src('./resources/img/**/*')
    .pipe(gulp.dest('./public/img/'))
}

exports.js = () => {
    return gulp.src([
        './node_modules/jquery/dist/jquery.min.js',
        './node_modules/@popperjs/core/dist/umd/popper.min.js',
        './node_modules/bootstrap/dist/js/bootstrap.min.js',
        './node_modules/awesomplete/awesomplete.min.js',
        './resources/vendor/OwlCarousel/dist/owl.carousel.min.js',
        // './resources/vendor/deezer/js/min/dz.js',
        './resources/js/*.js'
    ])
    .pipe(sourcemaps.init())
    .pipe(babel({
        ignore: [
            './node_modules/',
            './resources/vendor/'
        ],
        presets: ['@babel/env']
    }))
    .pipe(concat('script.js'))
    .pipe(gulp.dest('./public/js/'))
}

exports.minifyJS = () => {
    return gulp.src('./public/js/*.js')
    .pipe(terser({}))
    .pipe(gulp.dest('./public/js/'))
}

exports.cacheBusting = () => {}

exports.default = gulp.series(this.sass, this.img, this.js)

exports.watch = () => {
    gulp.watch([
            './resources/sass/**/*',
            './resources/js/**/*',
            './resources/img/**/*'
        ], gulp.parallel(this.sass, this.js, this.img))
}

exports.minify = gulp.series(this.default, this.minifyCSS, this.minifyJS)