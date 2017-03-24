import {task} from 'gulp';
import {copySync} from 'fs-extra';
import {DIST_DEMOAPP, DIST_RELEASE} from '../constants';
import {sequenceTask, execNodeTask} from '../util/task_helpers';
import {join} from 'path';

const tsconfigFile = join(DIST_DEMOAPP, 'tsconfig-aot.json');

/** Builds the demo-app and library. To be able to run NGC, apply the metadata workaround. */
task('aot:deps', sequenceTask('build:devapp', ':package:release', 'aot:copy-release'));

// As a workaround for https://github.com/angular/angular/issues/12249, we need to
// copy the Material ESM output inside of the demo-app output.
task('aot:copy-release', () => copySync(DIST_RELEASE, join(DIST_DEMOAPP, 'material')));

/** Build the demo-app and a release to confirm that the library is AOT-compatible. */
task('aot:build', sequenceTask('aot:deps', 'aot:compiler-cli'));

/** Build the demo-app and a release to confirm that the library is AOT-compatible. */
task('aot:compiler-cli', execNodeTask(
  '@angular/compiler-cli', 'ngc', ['-p', tsconfigFile]
));
