import {task, watch} from 'gulp';
import * as path from 'path';

import {DIST_ROOT, SOURCE_ROOT} from '../constants';
import {
  sassBuildTask, tsBuildTask, copyTask, buildAppTask, vendorTask,
  serverTask, sequenceTask, triggerLivereload
} from '../util/task_helpers';


const appDir = path.join(SOURCE_ROOT, 'demo-app');
const outDir = DIST_ROOT;

task(':watch:devapp', () => {
  watch(path.join(appDir, '**/*.ts'), [':build:devapp:ts', triggerLivereload]);
  watch(path.join(appDir, '**/*.scss'), [':build:devapp:scss', triggerLivereload]);
  watch(path.join(appDir, '**/*.html'), [':build:devapp:assets', triggerLivereload]);
});

/** Path to the demo-app tsconfig file. */
const tsconfigPath = path.join(appDir, 'tsconfig.json');

task(':build:devapp:vendor', vendorTask());
task(':build:devapp:ts', tsBuildTask(tsconfigPath));
task(':build:devapp:scss', sassBuildTask(outDir, appDir));
task(':build:devapp:assets', copyTask(appDir, outDir));
task('build:devapp', buildAppTask('devapp'));

task(':serve:devapp', serverTask(true));

task('serve:devapp', ['build:devapp'], sequenceTask(
  [':serve:devapp', ':watch:components', ':watch:devapp']
));
