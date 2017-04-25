import gulp = require('gulp');
import {execNodeTask} from '../util/task_helpers';
import {DIST_MATERIAL} from '../constants';

gulp.task('lint', ['tslint', 'stylelint', 'madge', 'dashboardlint']);

/** Task that runs madge to detect circular dependencies. */
gulp.task('madge', ['material:clean-build'], execNodeTask('madge', ['--circular', DIST_MATERIAL]));

/** Task to lint Angular Material's scss stylesheets. */
gulp.task('stylelint', execNodeTask(
  'stylelint', ['src/**/*.scss', '--config', 'stylelint-config.json', '--syntax', 'scss']
));

gulp.task('dashboardlint', execNodeTask(
  'stylelint', ['tools/screenshot-test/**/*.css', '--config', 'stylelint-config.json',
    '--syntax', 'scss']
));

const tsLintBaseFlags = ['-c', 'tslint.json', '+(src|e2e|tools)/**/*.ts', '--exclude',
    '**/node_modules/**/*'];

/** Task to run TSLint against the e2e/ and src/ directories. */
gulp.task('tslint', execNodeTask('tslint', tsLintBaseFlags));

/** Task that automatically fixes TSLint warnings. */
gulp.task('tslint:fix', execNodeTask('tslint', [...tsLintBaseFlags, '--fix']));
