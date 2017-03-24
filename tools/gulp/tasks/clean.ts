import {task} from 'gulp';
import {DIST_ROOT} from '../constants';
import {cleanTask} from '../util/task_helpers';


/** Deletes the dist/ directory. */
task('clean', cleanTask(DIST_ROOT));
