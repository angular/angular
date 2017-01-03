import {task, watch} from 'gulp';
import * as path from 'path';

import {SOURCE_ROOT, DIST_ROOT, PROJECT_ROOT} from '../constants';
import {
  tsBuildTask, sassBuildTask, copyTask, buildAppTask, execNodeTask,
  vendorTask, sequenceTask, serverTask
} from '../task_helpers';

const gulpRunSequence = require('run-sequence');
const gulpConnect = require('gulp-connect');

const appDir = path.join(SOURCE_ROOT, 'e2e-app');
const outDir = DIST_ROOT;
const PROTRACTOR_CONFIG_PATH = path.join(PROJECT_ROOT, 'test/protractor.conf.js');

task(':watch:e2eapp', () => {
  watch(path.join(appDir, '**/*.ts'), [':build:e2eapp:ts']);
  watch(path.join(appDir, '**/*.html'), [':build:e2eapp:assets']);
});

/** Copies e2e app dependencies to build output. */
task(':build:e2eapp:vendor', vendorTask());

/** Builds e2e app ts to js. */
task(':build:e2eapp:ts', tsBuildTask(appDir));

/** No-op (needed by buildAppTask). */
task(':build:e2eapp:scss', sassBuildTask(outDir, appDir));

/** Copies e2e app assets (html, css) to build output. */
task(':build:e2eapp:assets', copyTask(appDir, outDir));

/** Builds the entire e2e app. */
task('build:e2eapp', buildAppTask('e2eapp'));

/** Ensures that protractor and webdriver are set up to run. */
task(':test:protractor:setup', execNodeTask('protractor', 'webdriver-manager', ['update']));

/** Runs protractor tests (assumes that server is already running. */
task(':test:protractor', execNodeTask('protractor', [PROTRACTOR_CONFIG_PATH]));

/** Starts up the e2e app server. */
task(':serve:e2eapp', serverTask(false));

/** Terminates the e2e app server */
task(':serve:e2eapp:stop', gulpConnect.serverClose);

/** Builds and serves the e2e app. */
task('serve:e2eapp', sequenceTask('build:e2eapp', ':serve:e2eapp'));

/**
 * [Watch task] Builds and serves e2e app, rebuilding whenever the sources change.
 * This should only be used when running e2e tests locally.
 */
task('serve:e2eapp:watch', ['serve:e2eapp', ':watch:components', ':watch:e2eapp']);

/**
 * Builds and serves the e2e-app and runs protractor once the e2e-app is ready.
 */
task('e2e', (done: (err?: string) => void) => {
  gulpRunSequence(
    ':test:protractor:setup',
    'serve:e2eapp',
    ':test:protractor',
    ':serve:e2eapp:stop',
    (err: any) => done(err)
  );
});
