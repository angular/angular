import {task, watch} from 'gulp';
import * as path from 'path';
import gulpMerge = require('merge2');
import gulpRunSequence = require('run-sequence');

import {SOURCE_ROOT, DIST_ROOT, PROJECT_ROOT, NPM_VENDOR_FILES} from '../constants';
import {
  tsBuildTask, sassBuildTask, copyTask, buildAppTask, execNodeTask,
  vendorTask, sequenceTask, serverTask
} from '../task_helpers';


const appDir = path.join(SOURCE_ROOT, 'e2e-app');
const outDir = DIST_ROOT;
const PROTRACTOR_CONFIG_PATH = path.join(PROJECT_ROOT, 'test/protractor.conf.js');


task(':watch:e2eapp', () => {
  watch(path.join(appDir, '**/*.ts'), [':build:e2eapp:ts']);
  watch(path.join(appDir, '**/*.scss'), [':build:e2eapp:scss']);
  watch(path.join(appDir, '**/*.html'), [':build:e2eapp:assets']);
});


task(':build:e2eapp:vendor', vendorTask());
task(':build:e2eapp:ts', [':build:components:ts'], tsBuildTask(appDir));
task(':build:e2eapp:scss', [':build:components:scss'], sassBuildTask(outDir, appDir, []));
task(':build:e2eapp:assets', copyTask(appDir, outDir));

task('build:e2eapp', buildAppTask('e2eapp'));


task(':test:protractor:setup', execNodeTask('protractor', 'webdriver-manager', ['update']));
task(':test:protractor', execNodeTask('protractor', [PROTRACTOR_CONFIG_PATH]));
// This task is used because, in some cases, protractor will block and not exit the process,
// causing Travis to timeout. This task should always be used in a synchronous sequence as
// the last step.
task(':e2e:done', () => process.exit(0));

let stopE2eServer: () => void = null;
task(':serve:e2eapp', serverTask(false, (stream) => { stopE2eServer = () => stream.emit('kill') }));
task(':serve:e2eapp:stop', () => stopE2eServer());
task('serve:e2eapp', ['build:e2eapp'], sequenceTask([
  ':serve:e2eapp',
  ':watch:components',
  ':watch:e2eapp'
]));


task('e2e', sequenceTask(
  ':test:protractor:setup', 'serve:e2eapp', ':test:protractor', ':serve:e2eapp:stop',
  ':e2e:done'
));
