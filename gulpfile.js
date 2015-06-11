var gulp = require('gulp'),
  plugins = require('gulp-load-plugins')();

gulp.task('default', function(){
  return gulp.src('src/**/*.js')
    .pipe(plugins.angularFilesort())
    .pipe(plugins.concat('utils.js'))
    .pipe(gulp.dest('dist'))
    .pipe(plugins.ngAnnotate())
    .pipe(plugins.uglify())
    .pipe(plugins.concat('utils.min.js'))
    .pipe(gulp.dest('dist'))
});

gulp.task('watch', ['default'], function(){
  gulp.watch('src/**/*.js', ['default']);
});
