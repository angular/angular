/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {mapLiteral} from '../output/map_util';
import * as o from '../output/output_ast';
import {Identifiers as R3} from './r3_identifiers';
import {devOnlyGuardedExpression} from './util';
/**
 * Generate an ngDevMode guarded call to setClassDebugInfo with the debug info about the class
 * (e.g., the file name in which the class is defined)
 */
export function compileClassDebugInfo(debugInfo) {
  const debugInfoObject = {
    className: debugInfo.className,
  };
  // Include file path and line number only if the file relative path is calculated successfully.
  if (debugInfo.filePath) {
    debugInfoObject.filePath = debugInfo.filePath;
    debugInfoObject.lineNumber = debugInfo.lineNumber;
  }
  // Include forbidOrphanRendering only if it's set to true (to reduce generated code)
  if (debugInfo.forbidOrphanRendering) {
    debugInfoObject.forbidOrphanRendering = o.literal(true);
  }
  const fnCall = o
    .importExpr(R3.setClassDebugInfo)
    .callFn([debugInfo.type, mapLiteral(debugInfoObject)]);
  const iife = o.arrowFn([], [devOnlyGuardedExpression(fnCall).toStmt()]);
  return iife.callFn([]);
}
//# sourceMappingURL=r3_class_debug_info_compiler.js.map
