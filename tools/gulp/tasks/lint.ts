import {task} from 'gulp';
import {execNodeTask} from '../util/task_helpers';
import {DIST_MATERIAL, DIST_CDK} from '../constants';

/** Glob that matches all SCSS or CSS files that should be linted. */
const stylesGlob = '+(tools|src)/**/*.+(css|scss)';

/** List of flags that will passed to the different TSLint tasks. */
const tsLintBaseFlags = [
  '-c', 'tslint.json', '+(src|e2e|tools)/**/*.ts', '--exclude', '**/node_modules/**/*'
];

task('lint', ['tslint', 'stylelint', 'madge']);

/** Task that runs madge to detect circular dependencies. */
task('madge', ['material:clean-build'], execNodeTask(
  'madge', ['--circular', DIST_MATERIAL, DIST_CDK])
);

/** Task to lint Angular Material's scss stylesheets. */
task('stylelint', execNodeTask(
  'stylelint', [stylesGlob, '--config', 'stylelint-config.json', '--syntax', 'scss']
));

/** Task to run TSLint against the e2e/ and src/ directories. */
task('tslint', execNodeTask('tslint', tsLintBaseFlags));

/** Task that automatically fixes TSLint warnings. */
task('tslint:fix', execNodeTask('tslint', [...tsLintBaseFlags, '--fix']));
