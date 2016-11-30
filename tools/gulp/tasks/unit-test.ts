import gulp = require('gulp');
import path = require('path');
import gulpMerge = require('merge2');

import {PROJECT_ROOT} from '../constants';
import {sequenceTask} from '../task_helpers';

const karma = require('karma');

/** Copies deps for unit tests to the build output. */
gulp.task(':build:test:vendor', function() {
  const npmVendorFiles = [
    '@angular', 'core-js/client', 'hammerjs', 'rxjs', 'systemjs/dist', 'zone.js/dist'
  ];

  return gulpMerge(
    npmVendorFiles.map(function(root) {
      const glob = path.join(root, '**/*.+(js|js.map)');
      return gulp.src(path.join('node_modules', glob))
        .pipe(gulp.dest(path.join('dist/vendor', root)));
    }));
});

/** Builds dependencies for unit tests. */
gulp.task(':test:deps', sequenceTask(
  'clean',
  [
    ':build:test:vendor',
    ':build:components:assets',
    ':build:components:scss',
    ':build:components:spec',
  ]
));

/**
 * [Watch task] Build unit test dependencies, and rebuild whenever sources are changed.
 * This should only be used when running tests locally.
 */
gulp.task(':test:watch', sequenceTask(':test:deps', ':watch:components:spec'));

/** Build unit test dependencies and then inlines resources (html, css) into the JS output. */
gulp.task(':test:deps:inline', sequenceTask(':test:deps', ':inline-resources'));


/**
 * [Watch task] Runs the unit tests, rebuilding and re-testing when sources change.
 * Does not inline resources.
 *
 * This task should be used when running unit tests locally.
 */
gulp.task('test', [':test:watch'], (done: () => void) => {
  new karma.Server({
    configFile: path.join(PROJECT_ROOT, 'test/karma.conf.js')
  }, done).start();
});

/**
 * Runs the unit tests once with inlined resources (html, css). Does not watch for changes.
 *
 * This task should be used when running tests on the CI server.
 */
gulp.task('test:single-run', [':test:deps:inline'], (done: () => void) => {
  new karma.Server({
    configFile: path.join(PROJECT_ROOT, 'test/karma.conf.js'),
    singleRun: true
  }, done).start();
});
