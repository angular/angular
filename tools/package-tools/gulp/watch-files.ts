import {watch} from 'gulp';
import {triggerLivereload} from './trigger-livereload';

/** Options that will be passed to the watch function of Gulp.*/
const gulpWatchOptions = { debounceDelay: 700 };

/**
 * Function that watches a set of file globs and runs given Gulp tasks if a given file changes.
 * By default the livereload server will be also called on file change.
 */
export function watchFiles(fileGlob: string | string[], tasks: string[], livereload = true) {
  watch(fileGlob, gulpWatchOptions, [...tasks, () => livereload && triggerLivereload()]);
}
