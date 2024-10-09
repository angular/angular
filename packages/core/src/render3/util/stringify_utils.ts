/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Type} from '../../interface/type';
import {NG_COMP_DEF} from '../fields';

/**
 * Used for stringify render output in Ivy.
 * Important! This function is very performance-sensitive and we should
 * be extra careful not to introduce megamorphic reads in it.
 * Check `core/test/render3/perf/render_stringify` for benchmarks and alternate implementations.
 */
export function renderStringify(value: any): string {
  if (typeof value === 'string') return value;
  if (value == null) return '';
  // Use `String` so that it invokes the `toString` method of the value. Note that this
  // appears to be faster than calling `value.toString` (see `render_stringify` benchmark).
  return String(value);
}

/**
 * Used to stringify a value so that it can be displayed in an error message.
 *
 * Important! This function contains a megamorphic read and should only be
 * used for error messages.
 */
export function stringifyForError(value: any): string {
  if (typeof value === 'function') return value.name || value.toString();
  if (typeof value === 'object' && value != null && typeof value.type === 'function') {
    return value.type.name || value.type.toString();
  }

  return renderStringify(value);
}

/**
 * Used to stringify a `Type` and including the file path and line number in which it is defined, if
 * possible, for better debugging experience.
 *
 * Important! This function contains a megamorphic read and should only be used for error messages.
 */
export function debugStringifyTypeForError(type: Type<any>): string {
  // TODO(pmvald): Do some refactoring so that we can use getComponentDef here without creating
  // circular deps.
  let componentDef = (type as any)[NG_COMP_DEF] || null;
  if (componentDef !== null && componentDef.debugInfo) {
    return stringifyTypeFromDebugInfo(componentDef.debugInfo);
  }

  return stringifyForError(type);
}

// TODO(pmvald): Do some refactoring so that we can use the type ClassDebugInfo for the param
// debugInfo here without creating circular deps.
function stringifyTypeFromDebugInfo(debugInfo: any): string {
  if (!debugInfo.filePath || !debugInfo.lineNumber) {
    return debugInfo.className;
  } else {
    return `${debugInfo.className} (at ${debugInfo.filePath}:${debugInfo.lineNumber})`;
  }
}
