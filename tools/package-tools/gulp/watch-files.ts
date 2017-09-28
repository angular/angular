import {watch} from 'gulp';
import {triggerLivereload} from './trigger-livereload';

/**
 * Function that watches a set of file globs and runs given Gulp tasks if a given file changes.
 * By default the livereload server will be also called on file change.
 */
export function watchFiles(fileGlob: string | string[], tasks: string[], livereload = true,
                            debounceDelay = 700) {
  watch(fileGlob, {debounceDelay}, [...tasks, () => livereload && triggerLivereload()]);
}
