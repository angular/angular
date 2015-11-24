'use strict';var lang_1 = require('angular2/src/facade/lang');
var common_tools_1 = require('./common_tools');
var context = lang_1.global;
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
function enableDebugTools(ref) {
    context.ng = new common_tools_1.AngularTools(ref);
}
exports.enableDebugTools = enableDebugTools;
/**
 * Disables Angular 2 tools.
 */
function disableDebugTools() {
    context.ng = undefined;
}
exports.disableDebugTools = disableDebugTools;
//# sourceMappingURL=tools.js.map