/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';
import {ClassPropertyID, getUniqueIDForClassProperty} from './identify_queries';

/**
 * Attempts to resolve the given reference and determine a class
 * property ID that is points to.
 */
export function getReferenceTargetId(
  node: ts.Identifier,
  checker: ts.TypeChecker,
  projectDirAbsPath: string,
): ClassPropertyID | null {
  const target = checker.getSymbolAtLocation(node);
  if (
    target?.valueDeclaration === undefined ||
    !ts.isPropertyDeclaration(target.valueDeclaration)
  ) {
    return null;
  }

  return getUniqueIDForClassProperty(target.valueDeclaration, projectDirAbsPath);
}
