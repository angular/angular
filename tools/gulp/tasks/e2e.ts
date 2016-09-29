import {task, watch} from 'gulp';
import * as path from 'path';
import gulpMerge = require('merge2');
import gulpRunSequence = require('run-sequence');

import {SOURCE_ROOT, DIST_ROOT, PROJECT_ROOT} from '../constants';
import {
  tsBuildTask, sassBuildTask, copyTask, buildAppTask, execNodeTask,
  vendorTask, sequenceTask, serverTask
} from '../task_helpers';


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
task(':build:e2eapp:ts', [':build:components:ts'], tsBuildTask(appDir));

/** No-op (needed by buildAppTask). */
task(':build:e2eapp:scss', [':build:components:scss'], sassBuildTask(outDir, appDir, []));

/** Copies e2e app assets (html, css) to build output. */
task(':build:e2eapp:assets', copyTask(appDir, outDir));

/** Builds the entire e2e app. */
task('build:e2eapp', buildAppTask('e2eapp'));

/** Ensures that protractor and webdriver are set up to run. */
task(':test:protractor:setup', execNodeTask('protractor', 'webdriver-manager', ['update']));

/** Runs protractor tests (assumes that server is already running. */
task(':test:protractor', execNodeTask('protractor', [PROTRACTOR_CONFIG_PATH]));

/**
 * Forces process termination.
 *
 * This task is used because, in some cases, protractor will block and not exit the process,
 * causing Travis to timeout. This task should always be used in a synchronous sequence as
 * the last step.
 */
task(':e2e:done', () => process.exit(0));

let stopE2eServer: () => void = null;

/** Starts up the e2e app server. */
task(':serve:e2eapp', serverTask(false, (stream) => { stopE2eServer = () => stream.emit('kill') }));

/** Terminates the e2e app server */
task(':serve:e2eapp:stop', () => stopE2eServer());

/** Builds and serves the e2e app. */
task('serve:e2eapp', sequenceTask('build:components', 'build:e2eapp', ':serve:e2eapp'));

/**
 * [Watch task] Builds and serves e2e app, rebuilding whenever the sources change.
 * This should only be used when running e2e tests locally.
 */
task('serve:e2eapp:watch', ['serve:e2eapp', ':watch:components', ':watch:e2eapp']);

/**
 * [Watch task] Serves the e2e app and runs the protractor tests. Rebuilds when sources change.
 *
 * This task should only be used when running the e2e tests locally.
 */
task('e2e', sequenceTask(
  ':test:protractor:setup',
  'serve:e2eapp:watch',
  ':test:protractor',
  ':serve:e2eapp:stop',
  ':e2e:done',
));

/**
 * Runs the e2e once. Does not watch for changes.
 *
 * This task should be used when running tests on the CI server.
 */
task('e2e:single-run', sequenceTask(
  ':test:protractor:setup',
  'serve:e2eapp',
  ':test:protractor',
  ':serve:e2eapp:stop',
  ':e2e:done',
));
