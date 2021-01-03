/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import {ClassMetadataMap} from './ng_query_visitor';

/**
 * Gets all chained super-class TypeScript declarations for the given class
 * by using the specified class metadata map.
 */
export function getSuperClassDeclarations(
    classDecl: ts.ClassDeclaration, classMetadataMap: ClassMetadataMap) {
  const declarations: ts.ClassDeclaration[] = [];

  let current = classMetadataMap.get(classDecl);
  while (current && current.superClass) {
    declarations.push(current.superClass);
    current = classMetadataMap.get(current.superClass);
  }

  return declarations;
}
