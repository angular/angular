var gulp = require('gulp');
var pipe = require('pipe/gulp');
var traceur = require('gulp-traceur');


var path = {
  src: './src/**/*.js',
};


// TRANSPILE ES6
gulp.task('build_source_amd', function() {
  gulp.src(path.src)
      .pipe(traceur(pipe.traceur()))
      .pipe(gulp.dest('dist/amd'));
});

gulp.task('build_source_cjs', function() {
  gulp.src(path.src)
      .pipe(traceur(pipe.traceur({modules: 'commonjs'})))
      .pipe(gulp.dest('dist/cjs'));
});

gulp.task('build_source_es6', function() {
  gulp.src(path.src)
      .pipe(traceur(pipe.traceur({outputLanguage: 'es6'})))
      .pipe(gulp.dest('dist/es6'));
});

gulp.task('build_dist', ['build_source_cjs', 'build_source_amd', 'build_source_es6']);
gulp.task('build', ['build_dist']);


// WATCH FILES FOR CHANGES
gulp.task('watch', function() {
  gulp.watch(path.src, ['build']);
});
