import {task} from 'gulp';
import {execNodeTask} from '../util/task_helpers';
import {join} from 'path';
import {buildConfig, sequenceTask} from 'material2-build-tools';

const {packagesDir} = buildConfig;

/** Path to the demo-app source directory. */
const demoAppSource = join(packagesDir, 'demo-app');

/** Path to the tsconfig file that builds the AOT files. */
const tsconfigFile = join(demoAppSource, 'tsconfig-aot.json');

/**
 * Build the demo-app wit the release output in order confirm that the library is
 * working with AOT compilation enabled.
 */
task('build-aot', sequenceTask(
  'clean',
  ['build-aot:release-packages', 'build-aot:assets'],
  'build-aot:compiler-cli'
));

/**
 * Task that can be used to build the demo-app with AOT without building the
 * release output. This can be run if the release output is already built.
 */
task('build-aot:no-release-build', sequenceTask('build-aot:assets', 'build-aot:compiler-cli'));

/** Builds the demo-app assets and builds the required release packages. */
task('build-aot:release-packages', sequenceTask(
  [
    'cdk:build-release',
    'material:build-release',
    'cdk-experimental:build-release',
    'material-experimental:build-release',
    'material-moment-adapter:build-release',
    'material-examples:build-release',
  ],
));

/**
 * Task that builds the assets which are required for building with AOT. Since the demo-app uses
 * Sass files, we need to provide the transpiled CSS sources in the package output.
 */
task('build-aot:assets', [':build:devapp:assets', ':build:devapp:scss']);

/** Build the demo-app and a release to confirm that the library is AOT-compatible. */
task('build-aot:compiler-cli', execNodeTask(
  '@angular/compiler-cli', 'ngc', ['-p', tsconfigFile]
));
