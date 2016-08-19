import {task, watch} from 'gulp';
import * as path from 'path';

import {DIST_ROOT, SOURCE_ROOT} from '../constants';
import {
  sassBuildTask, tsBuildTask, copyTask, buildAppTask, vendorTask,
  serverTask, sequenceTask
} from '../task_helpers';


const appDir = path.join(SOURCE_ROOT, 'demo-app');
const outDir = DIST_ROOT;


task(':watch:devapp', () => {
  watch(path.join(appDir, '**/*.ts'), [':build:devapp:ts']);
  watch(path.join(appDir, '**/*.scss'), [':build:devapp:scss']);
  watch(path.join(appDir, '**/*.html'), [':build:devapp:assets']);
});


task(':build:devapp:vendor', vendorTask());
task(':build:devapp:ts', [':build:components:ts'], tsBuildTask(appDir));
task(':build:devapp:scss', [':build:components:scss'], sassBuildTask(outDir, appDir, []));
task(':build:devapp:assets', copyTask(appDir, outDir));
task('build:devapp', buildAppTask('devapp'));

task(':serve:devapp', serverTask());
task('serve:devapp', ['build:devapp'], sequenceTask(
  [':serve:devapp', ':watch:components', ':watch:devapp']
));
