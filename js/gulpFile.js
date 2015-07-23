var gulp = require('gulp'),
    less = require('gulp-less'),
    livereload = require('gulp-livereload'),
    watch = require("gulp-watch");
gulp.task("lessc", function () {
    gulp.src("css/*.less")
    .pipe(less())
    .pipe(gulp.dest("css/"))
    .pipe(livereload());
});
gulp.task("watch", function (file) {
    livereload.listen();
    livereload.changed(file.path);
    gulp.watch('css/*.less', ['lessc']);
});

gulp.task('default', ['watch'], function () {
    gulp.start('lessc');
});