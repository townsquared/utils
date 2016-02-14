var gulp = require('gulp'),
  plugins = require('gulp-load-plugins')(),
  ngHtml2Js = require("gulp-ng-html2js"),
  mergeStream = require("merge-stream");

//Shared configuration/paths for tasks
var paths = {
  src: ['src/**/*.js'],
  css: ['src/**/*.css'],
  html: ['src/templates/*.html'],
  file: 'utils.js',
  cssFile: 'ts-utils.css',
  fileMin: 'utils.min.js',
  dest: './dist'
};

gulp.task('watch', ['default'], function(){
  gulp.watch('src/**/*.js', ['default']);
});

// Scripts START
gulp.task('scripts', scripts(paths));
function scripts(paths) {
  return function() {
    var htmlStream = gulp.src(paths.html)
      .pipe(ngHtml2Js({
        moduleName: "ts.utils",
        prefix: "templates/"
      }));

    var jsStream = gulp.src(paths.src);
    var mergedStream = mergeStream(htmlStream,jsStream)
      .pipe(plugins.sourcemaps.init())
      .pipe(plugins.plumber())
      .pipe(plugins.babel())
      .pipe(plugins.angularFilesort())
      mergedStream
      .pipe(plugins.concat(paths.file))
      .pipe(plugins.sourcemaps.write('.'))
      .pipe(gulp.dest(paths.dest));
    return mergedStream
      .pipe(plugins.concat(paths.fileMin))
      // TODO: no annotate due to rumors of issues with ui-router
      // .pipe(plugins.ngAnnotate())
      .pipe(plugins.uglify({ mangle: false }))
      .pipe(plugins.sourcemaps.write('.'))
      .pipe(gulp.dest(paths.dest));

  };
}
// Scripts END

// Styles START
gulp.task('styles', function(){
  return gulp.src(paths.css)
    .pipe(plugins.concat(paths.cssFile))
    .pipe(gulp.dest(paths.dest));
});
// Styles END

// HTML 2 JS START - Loads templates into JS using $templateCache
function templates(paths){
  return function(){
    return gulp.src(paths.html)
      .pipe(ngHtml2Js({
        moduleName: "ts.utils",
        prefix: "templates/"
      }))
      .pipe(plugins.concat('ts-utils-templates.js'))
      .pipe(gulp.dest("./dist"))
  }
};

gulp.task('html2js', templates(paths));
// HTML 2 JS END


// Default task START
gulp.task('default', ['scripts', 'styles']);
// Default task END