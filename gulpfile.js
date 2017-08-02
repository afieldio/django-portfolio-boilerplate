var gulp = require('gulp');
var sass = require('gulp-sass');
var watch = require('gulp-watch');
var minifycss = require('gulp-minify-css');
var rename = require('gulp-rename');
var livereload = require('gulp-livereload');
var fs = require('fs');
var imagemin = require('gulp-imagemin');


var gzip_options = {
    threshold: '1kb',
    gzipOptions: {
        level: 9
    }
};

/* Compile Our Sass */
gulp.task('sass', function() {
    return gulp.src('portfolio/static/portfolio/scss/main.scss')
        .pipe(sass())
        .pipe(gulp.dest('portfolio/static/portfolio/css'))
        .pipe(rename({suffix: '.min'}))
        .pipe(minifycss())
        .pipe(gulp.dest('portfolio/static/portfolio/css'))
        .pipe(livereload());
});

gulp.task('image', function() {
    gulp.src('portfolio/static/portfolio/images/*')
        .pipe(imagemin())
        .pipe(gulp.dest('portfolio/static/portfolio/img/'))
});



// gulp.task('js', function () {
//     if (!fs.existsSync('aquaman/static/bower_components/')) {
//         gulp.src('bower_components/*')
//             .pipe(symlink('aquaman/static/bower_components/')) // Write to the destination folder
//     }
// });

/* Move font files */
// gulp.task('fonts', function(){
//     return gulp.src('bower_components/components-font-awesome/fonts/*')
//         .pipe(gulp.dest('aquaman/static/fonts/'))
// });

/* Watch Files For Changes */
gulp.task('watch', function() {
    livereload.listen();
    gulp.watch('**/portfolio/static/portfolio/scss/*.scss', ['sass']);

    /* Trigger a live reload on any Django template changes */
    gulp.watch('**/templates/*').on('change', livereload.changed);

});

gulp.task('default', ['sass', 'watch', 'image']);