import {task} from 'gulp';
import {cleanTask} from '../task_helpers';


task('clean', cleanTask('dist'));
