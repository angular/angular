import {task, watch} from 'gulp';
import {join} from 'path';
import {SOURCE_ROOT, DIST_E2EAPP, PROJECT_ROOT, DIST_RELEASES} from '../build-config';
import {ngcBuildTask, copyTask, execNodeTask, sequenceTask, serverTask} from '../util/task_helpers';
import {copySync} from 'fs-extra';

// There are no type definitions available for these imports.
const gulpConnect = require('gulp-connect');

const appDir = join(SOURCE_ROOT, 'e2e-app');
const outDir = DIST_E2EAPP;

const PROTRACTOR_CONFIG_PATH = join(PROJECT_ROOT, 'test/protractor.conf.js');
const tsconfigPath = join(outDir, 'tsconfig-build.json');

/** Glob that matches all files that need to be copied to the output folder. */
const assetsGlob = join(appDir, '**/*.+(html|css|json|ts)');

/**
 * Builds and serves the e2e-app and runs protractor once the e2e-app is ready.
 */
task('e2e', sequenceTask(
  [':test:protractor:setup', 'serve:e2eapp'],
  ':test:protractor',
  ':serve:e2eapp:stop',
  'screenshots',
));

/** Task that builds the e2e-app in AOT mode. */
task('e2e-app:build', sequenceTask(
  'clean',
  ['material:build-release', 'cdk:build-release'],
  ['e2e-app:copy-release', 'e2e-app:copy-assets'],
  'e2e-app:build-ts'
));

/** Task that copies all required assets to the output folder. */
task('e2e-app:copy-assets', copyTask(assetsGlob, outDir));

/** Task that builds the TypeScript sources. Those are compiled inside of the dist folder. */
task('e2e-app:build-ts', ngcBuildTask(tsconfigPath));

task(':watch:e2eapp', () => {
  watch(join(appDir, '**/*.ts'), ['e2e-app:build']);
  watch(join(appDir, '**/*.html'), ['e2e-app:copy-assets']);
});

/** Ensures that protractor and webdriver are set up to run. */
task(':test:protractor:setup', execNodeTask('protractor', 'webdriver-manager', ['update']));

/** Runs protractor tests (assumes that server is already running. */
task(':test:protractor', execNodeTask('protractor', [PROTRACTOR_CONFIG_PATH]));

/** Starts up the e2e app server. */
task(':serve:e2eapp', serverTask(outDir, false));

/** Terminates the e2e app server */
task(':serve:e2eapp:stop', gulpConnect.serverClose);

/** Builds and serves the e2e app. */
task('serve:e2eapp', sequenceTask('e2e-app:build', ':serve:e2eapp'));

/**
 * [Watch task] Builds and serves e2e app, rebuilding whenever the sources change.
 * This should only be used when running e2e tests locally.
 */
task('serve:e2eapp:watch', ['serve:e2eapp', 'material:watch', ':watch:e2eapp']);

// As a workaround for https://github.com/angular/angular/issues/12249, we need to
// copy the Material and CDK ESM output inside of the demo-app output.
task('e2e-app:copy-release', () => {
  copySync(join(DIST_RELEASES, 'material'), join(outDir, 'material'));
  copySync(join(DIST_RELEASES, 'cdk'), join(outDir, 'cdk'));
});

