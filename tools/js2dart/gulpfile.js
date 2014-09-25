var gulp = require('gulp');
var tasks = require('./gulp-tasks');
var runSequence = require('run-sequence');
var watch = require('gulp-watch');
var mergeStreams = require('event-stream').merge;

tasks.install(gulp);

gulp.task('build', function() {
  return runSequence('js2dart/build');
});

gulp.task('test', function() {
  return runSequence('build', 'js2dart/test');
});

gulp.task('clean', ['js2dart/clean']);

gulp.task('watch', function() {
  var js2dartWatch = watch(tasks.paths.js2dartSrc, function(_, done) {
    runSequence('js2dart/build', 'js2dart/test', done);
  });
  runSequence('js2dart/test/watch');
  return js2dartWatch;
});