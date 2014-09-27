var gulp = require('gulp');
var tasks = require('./gulp-tasks');
var runSequence = require('run-sequence');
var watch = require('gulp-watch');
var mergeStreams = require('event-stream').merge;

tasks.install(gulp);

gulp.task('test', function() {
  return runSequence('transpiler/test');
});

gulp.task('clean', ['transpiler/clean']);

gulp.task('watch', function(done) {
  // parallel is important as both streams are infinite!
  runSequence(['transpiler/test/watch', 'transpiler/src/watch'], done);
});