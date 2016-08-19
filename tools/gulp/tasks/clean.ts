import {task} from 'gulp';
import {cleanTask} from '../task_helpers';


task('clean', cleanTask('dist'));
task(':clean:spec', cleanTask('dist/**/*.spec.*'));
task(':clean:assets', cleanTask('dist/**/*+(.html|.css)'));
