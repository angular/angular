import {task, watch} from 'gulp';
import * as path from 'path';

import {SOURCE_ROOT, DIST_E2EAPP, PROJECT_ROOT} from '../constants';
import {
  tsBuildTask, copyTask, buildAppTask, execNodeTask, sequenceTask, serverTask
} from '../util/task_helpers';

// There are no type definitions available for these imports.
const gulpConnect = require('gulp-connect');

const appDir = path.join(SOURCE_ROOT, 'e2e-app');
const outDir = DIST_E2EAPP;

const PROTRACTOR_CONFIG_PATH = path.join(PROJECT_ROOT, 'test/protractor.conf.js');
const tsconfigPath = path.join(appDir, 'tsconfig-build.json');

task(':watch:e2eapp', () => {
  watch(path.join(appDir, '**/*.ts'), [':build:e2eapp:ts']);
  watch(path.join(appDir, '**/*.html'), [':build:e2eapp:assets']);
});

/** Builds e2e app ts to js. */
task(':build:e2eapp:ts', tsBuildTask(tsconfigPath));

/** Copies e2e app assets (html, css) to build output. */
task(':build:e2eapp:assets', copyTask(appDir, outDir));

/** Builds the entire e2e app. */
task('build:e2eapp', buildAppTask('e2eapp'));

/** Ensures that protractor and webdriver are set up to run. */
task(':test:protractor:setup', execNodeTask('protractor', 'webdriver-manager', ['update']));

/** Runs protractor tests (assumes that server is already running. */
task(':test:protractor', execNodeTask('protractor', [PROTRACTOR_CONFIG_PATH]));

/** Starts up the e2e app server. */
task(':serve:e2eapp', serverTask(outDir, false));

/** Terminates the e2e app server */
task(':serve:e2eapp:stop', gulpConnect.serverClose);

/** Builds and serves the e2e app. */
task('serve:e2eapp', sequenceTask('build:e2eapp', ':serve:e2eapp'));

/**
 * [Watch task] Builds and serves e2e app, rebuilding whenever the sources change.
 * This should only be used when running e2e tests locally.
 */
task('serve:e2eapp:watch', ['serve:e2eapp', 'material:watch', ':watch:e2eapp']);

/**
 * Builds and serves the e2e-app and runs protractor once the e2e-app is ready.
 */
task('e2e', sequenceTask(
  [':test:protractor:setup', 'serve:e2eapp'],
  ':test:protractor',
  ':serve:e2eapp:stop',
  'screenshots',
));

