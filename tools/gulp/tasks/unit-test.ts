import gulp = require('gulp');
import path = require('path');
import gulpMerge = require('merge2');

import {PROJECT_ROOT, COMPONENTS_DIR} from '../constants';
import {sequenceTask} from '../task_helpers';

const karma = require('karma');
const runSequence = require('run-sequence');

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


/** Build unit test dependencies and then inlines resources (html, css) into the JS output. */
gulp.task(':test:deps:inline', sequenceTask(':test:deps', ':inline-resources'));

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

/**
 * [Watch task] Runs the unit tests, rebuilding and re-testing when sources change.
 * Does not inline resources. Note that this doesn't use Karma's built-in file
 * watching. Due to the way our build process is set up, Karma ends up firing
 * it's change detection for every file that is written to disk, which causes
 * it to run tests multiple time and makes it hard to follow the console output.
 * This approach runs the Karma server and then depends on the Gulp API to tell
 * Karma when to run the tests.
 *
 * This task should be used when running unit tests locally.
 */
gulp.task('test', [':test:deps'], () => {
  let patternRoot = path.join(COMPONENTS_DIR, '**/*');

  // Configure the Karma server and override the autoWatch and singleRun just in case.
  let server = new karma.Server({
    configFile: path.join(PROJECT_ROOT, 'test/karma.conf.js'),
    autoWatch: false,
    singleRun: false
  });

  // Refreshes Karma's file list and schedules a test run.
  let runTests = () => {
    server.refreshFiles().then(() => server._injector.get('executor').schedule());
  };

  // Boot up the test server and run the tests whenever a new browser connects.
  server.start();
  server.on('browser_register', runTests);

  // Watch for file changes, rebuild and run the tests.
  gulp.watch(patternRoot + '.ts', () => runSequence(':build:components:spec', runTests));
  gulp.watch(patternRoot + '.scss', () => runSequence(':build:components:scss', runTests));
  gulp.watch(patternRoot + '.html', () => runSequence(':build:components:assets', runTests));
});
