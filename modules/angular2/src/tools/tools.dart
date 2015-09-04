library angular2.src.tools.tools;

import 'dart:js';
import 'package:angular2/angular2.dart' show ApplicationRef;
import 'common_tools.dart' show AngularTools;

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
void enableDebugTools(ApplicationRef appRef) {
  final tools = new AngularTools(appRef);
  context['ng'] = new JsObject.jsify({
    'profiler': {
      'timeChangeDetection': ([config]) {
        tools.profiler.timeChangeDetection(config);
      }
    }
  });
}

/**
 * Disables Angular 2 tools.
 */
void disableDebugTools() {
  context.deleteProperty('ng');
}
