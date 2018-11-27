import {watchFiles} from 'material2-build-tools';
import {getActiveBrowserSyncInstance} from './task_helpers';

/**
 * Function that watches a set of file globs and runs the specified tasks if a file
 * changed. Additionally BrowserSync will reload all browsers on file change.
 */
export function watchFilesAndReload(fileGlob: string | string[], tasks: string[]) {
  watchFiles(fileGlob, [...tasks, () => getActiveBrowserSyncInstance().reload()]);
}
