import {yellow} from 'chalk';
import {src} from 'gulp';

// This import does not have any type definitions.
const gulpConnect = require('gulp-connect');

/** Triggers a reload when livereload is enabled and a gulp-connect server is running. */
export function triggerLivereload() {
  console.log(yellow('Server: Changes were detected and a livereload was triggered.'));
  return src('dist').pipe(gulpConnect.reload());
}
