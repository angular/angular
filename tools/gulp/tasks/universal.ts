import {task} from 'gulp';
import {ngcBuildTask, tsBuildTask, copyTask, execTask} from '../util/task_helpers';
import {join} from 'path';
import {copySync} from 'fs-extra';
import {buildConfig, sequenceTask} from 'material2-build-tools';

const {outputDir, packagesDir} = buildConfig;

/** Path to the directory where all releases are created. */
const releasesDir = join(outputDir, 'releases');

const appDir = join(packagesDir, 'universal-app');
const outDir = join(outputDir, 'packages', 'universal-app');

// Paths to the different tsconfig files of the Universal app.
// Building the sources in the output directory is part of the workaround for
// https://github.com/angular/angular/issues/12249
const tsconfigAppPath = join(outDir, 'tsconfig-build.json');
const tsconfigPrerenderPath = join(outDir, 'tsconfig-prerender.json');

/** Path to the compiled prerender file. Running this file just dumps the HTML output for now. */
const prerenderOutFile = join(outDir, 'prerender.js');

/** Task that builds the universal-app and runs the prerender script. */
task('prerender', ['universal:build'], execTask(
  // Runs node with the tsconfig-paths module to alias the @angular/material dependency.
  'node', ['-r', 'tsconfig-paths/register', prerenderOutFile], {
    env: {TS_NODE_PROJECT: tsconfigPrerenderPath},
    // Errors in lifecycle hooks will write to STDERR, but won't exit the process with an
    // error code, however we still want to catch those cases in the CI.
    failOnStderr: true
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
  copySync(join(releasesDir, 'material'), join(outDir, 'material'));
  copySync(join(releasesDir, 'cdk'), join(outDir, 'cdk'));
});
