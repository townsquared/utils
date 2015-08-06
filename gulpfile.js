var gulp = require('gulp'),
  plugins = require('gulp-load-plugins')();

var paths = {
  src: ['src/**/*.js'],
  file: 'utils.js',
  fileMin: 'utils.min.js',
  dest: './dist',
};

gulp.task('watch', ['default'], function(){
  gulp.watch('src/**/*.js', ['default']);
});

gulp.task('default', scripts(paths));
function scripts(paths) {
  return function() {
    var stream = gulp.src(paths.src)
      .pipe(plugins.sourcemaps.init())
      .pipe(plugins.plumber())
      .pipe(plugins.babel())
      .pipe(plugins.angularFilesort())
    stream
      .pipe(plugins.concat(paths.file))
      .pipe(plugins.sourcemaps.write('.'))
      .pipe(gulp.dest(paths.dest));
    return stream
      .pipe(plugins.concat(paths.fileMin))
      // TODO: no annotate due to rumors of issues with ui-router
      // .pipe(plugins.ngAnnotate())
      .pipe(plugins.uglify({ mangle: false }))
      .pipe(plugins.sourcemaps.write('.'))
      .pipe(gulp.dest(paths.dest));

  };
}
