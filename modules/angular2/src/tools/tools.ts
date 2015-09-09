import {global} from 'angular2/src/core/facade/lang';
import {ApplicationRef} from 'angular2/angular2';
import {AngularTools} from './common_tools';

var context = <any>global;

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
export function enableDebugTools(appRef: ApplicationRef): void {
  context.ng = new AngularTools(appRef);
}

/**
 * Disables Angular 2 tools.
 */
export function disableDebugTools(): void {
  context.ng = undefined;
}
