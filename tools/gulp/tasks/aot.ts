import {task} from 'gulp';
import {join} from 'path';
import {DIST_ROOT} from '../constants';
import {execNodeTask, sequenceTask} from '../task_helpers';

/** Copies the source files of the demo-app to the dist folder. */
task('aot:copy', [':build:devapp:scss', ':build:devapp:assets']);

/**
 * Prepares the AOT compilation by copying the demo-app and building the components with their
 * associated metadata files from the Angular compiler.
 */
task('aot:prepare', sequenceTask(
  'clean',
  ['aot:copy', 'build:components:release', ':build:components:ngc'])
);

/** Builds the demo-app with the Angular compiler to verify that all components work. */
task('aot:build', ['aot:prepare'], execNodeTask(
  '@angular/compiler-cli', 'ngc', ['-p', join(DIST_ROOT, 'tsconfig-aot.json')])
);
