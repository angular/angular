import {watch, WatchCallback} from 'gulp';

/** Function that watches a set of file globs and runs given Gulp tasks if a given file changes. */
export function watchFiles(fileGlob: string | string[], tasks: (string|WatchCallback)[],
                           debounceDelay = 700) {
  watch(fileGlob, {debounceDelay}, tasks);
}
