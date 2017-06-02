import {task} from 'gulp';
import {DIST_RELEASES, DIST_ROOT, SOURCE_ROOT} from '../build-config';
import {ngcBuildTask, tsBuildTask, copyTask, sequenceTask, execTask} from '../util/task_helpers';
import {join} from 'path';
import {copySync} from 'fs-extra';

const appDir = join(SOURCE_ROOT, 'universal-app');
const outDir = join(DIST_ROOT, 'packages', 'universal-app');

// Paths to the different tsconfig files of the Universal app.
// Building the sources in the output directory is part of the workaround for
// https://github.com/angular/angular/issues/12249
const tsconfigAppPath = join(outDir, 'tsconfig-build.json');
const tsconfigPrerenderPath = join(outDir, 'tsconfig-prerender.json');

/** Path to the compiled prerender file. Running this file just dumps the HTML output for now. */
const prerenderOutFile = join(outDir, 'prerender.js');

/** Task that builds the universal-app and runs the prerender script. */
task('universal:test-prerender', ['universal:build'], execTask(
  // Runs node with the tsconfig-paths module to alias the @angular/material dependency.
  'node', ['-r', 'tsconfig-paths/register', prerenderOutFile], {
    env: {TS_NODE_PROJECT: tsconfigPrerenderPath}
  }
));

task('universal:build', sequenceTask(
  'clean',
  ['material:build-release', 'cdk:build-release'],
  ['universal:copy-release', 'universal:copy-files'],
  'universal:build-app-ts',
  'universal:build-prerender-ts'
));

/** Task that builds the universal app in the output directory. */
task('universal:build-app-ts', ngcBuildTask(tsconfigAppPath));

/** Task that copies all files to the output directory. */
task('universal:copy-files', copyTask(appDir, outDir));

/** Task that builds the prerender script in the output directory. */
task('universal:build-prerender-ts', tsBuildTask(tsconfigPrerenderPath));

// As a workaround for https://github.com/angular/angular/issues/12249, we need to
// copy the Material and CDK ESM output inside of the universal-app output.
task('universal:copy-release', () => {
  copySync(join(DIST_RELEASES, 'material'), join(outDir, 'material'));
  copySync(join(DIST_RELEASES, 'cdk'), join(outDir, 'cdk'));
});
