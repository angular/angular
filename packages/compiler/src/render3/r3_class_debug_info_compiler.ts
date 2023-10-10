/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {mapLiteral} from '../output/map_util';
import * as o from '../output/output_ast';

import {Identifiers as R3} from './r3_identifiers';
import {devOnlyGuardedExpression} from './util';

/**
 * Info needed for runtime errors related to a class, such as the location in which the class is
 * defined.
 */
export interface R3ClassDebugInfo {
  /** The class identifier */
  type: o.Expression;

  /**
   * A string literal containing the original class name as appears in its definition.
   */
  className: o.Expression;

  /**
   * A string literal containing the relative path of the file in which the class is defined.
   *
   * The path is relative to the project root. The compiler does the best effort to find the project
   * root (e.g., using the rootDir of tsconfig), but if it fails this field is set to null,
   * indicating that the file path was failed to be computed. In this case, the downstream consumers
   * of the debug info will usually ignore the `lineNumber` field as well and just show the
   * `className`. For security reasons we never show the absolute file path and prefer to just
   * return null here.
   */
  filePath: o.Expression|null;

  /**
   * A number literal number containing the line number in which this class is defined.
   */
  lineNumber: o.Expression;
}

/**
 * Generate an ngDevMode guarded call to setClassDebugInfo with the debug info about the class
 * (e.g., the file name in which the class is defined)
 */
export function compileClassDebugInfo(debugInfo: R3ClassDebugInfo): o.Expression {
  const debugInfoObject:
      {className: o.Expression; filePath?: o.Expression; lineNumber?: o.Expression;} = {
        className: debugInfo.className,
      };

  // Include file path and line number only if the file relative path is calculated successfully.
  if (debugInfo.filePath) {
    debugInfoObject.filePath = debugInfo.filePath;
    debugInfoObject.lineNumber = debugInfo.lineNumber;
  }

  const fnCall = o.importExpr(R3.setClassDebugInfo).callFn([
    debugInfo.type,
    mapLiteral(debugInfoObject),
  ]);
  const iife = o.arrowFn([], [devOnlyGuardedExpression(fnCall).toStmt()]);
  return iife.callFn([]);
}
