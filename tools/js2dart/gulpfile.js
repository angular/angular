var gulp = require('gulp');
var tasks = require('./gulp-tasks');
var runSequence = require('run-sequence');
var watch = require('gulp-watch');
var mergeStreams = require('event-stream').merge;

tasks.install(gulp);

gulp.task('test', function() {
  return runSequence('js2dart/test');
});

gulp.task('clean', ['js2dart/clean']);

gulp.task('watch', function(done) {
  // parallel is important as both streams are infinite!
  runSequence(['js2dart/test/watch', 'js2dart/src/watch'], done);
});