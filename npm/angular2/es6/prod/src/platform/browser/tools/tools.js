import { global } from 'angular2/src/facade/lang';
import { AngularTools } from './common_tools';
var context = global;
/**
 * Enabled Angular 2 debug tools that are accessible via your browser's
 * developer console.
 *
 * Usage:
 *
 * 1. Open developer console (e.g. in Chrome Ctrl + Shift + j)
 * 1. Type `ng.` (usually the console will show auto-complete suggestion)
 * 1. Try the change detection profiler `ng.profiler.timeChangeDetection()`
 *    then hit Enter.
 */
export function enableDebugTools(ref) {
    context.ng = new AngularTools(ref);
}
/**
 * Disables Angular 2 tools.
 */
export function disableDebugTools() {
    delete context.ng;
}
