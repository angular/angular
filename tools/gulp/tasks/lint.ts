import gulp = require('gulp');
import {execNodeTask} from '../util/task_helpers';
import {DIST_MATERIAL} from '../constants';

/** Glob that matches all SCSS or CSS files that should be linted. */
const stylesGlob = '+(tools|src)/**/*.+(css|scss)';

/** List of flags that will passed to the different TSLint tasks. */
const tsLintBaseFlags = [
  '-c', 'tslint.json', '+(src|e2e|tools)/**/*.ts', '--exclude', '**/node_modules/**/*'
];

gulp.task('lint', ['tslint', 'stylelint', 'madge']);

/** Task that runs madge to detect circular dependencies. */
gulp.task('madge', ['material:clean-build'], execNodeTask('madge', ['--circular', DIST_MATERIAL]));

/** Task to lint Angular Material's scss stylesheets. */
gulp.task('stylelint', execNodeTask(
  'stylelint', [stylesGlob, '--config', 'stylelint-config.json', '--syntax', 'scss']
));

/** Task to run TSLint against the e2e/ and src/ directories. */
gulp.task('tslint', execNodeTask('tslint', tsLintBaseFlags));

/** Task that automatically fixes TSLint warnings. */
gulp.task('tslint:fix', execNodeTask('tslint', [...tsLintBaseFlags, '--fix']));
