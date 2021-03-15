/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import {isNullCheck, isSafeAccess} from '../../utils/typescript/nodes';
import {hasOneOfTypes, isNullableType} from '../../utils/typescript/symbol';

/**
 * Finds all the accesses of `ActivatedRouteSnapshot.fragment`
 * that need to be migrated within a particular file.
 */
export function findFragmentAccesses(
    typeChecker: ts.TypeChecker, sourceFile: ts.SourceFile): Set<ts.PropertyAccessExpression> {
  const results = new Set<ts.PropertyAccessExpression>();

  sourceFile.forEachChild(function walk(node: ts.Node) {
    if (ts.isPropertyAccessExpression(node) && node.name.text === 'fragment' &&
        !results.has(node) && !isNullCheck(node) && !isSafeAccess(node) &&
        hasOneOfTypes(typeChecker, node.expression, ['ActivatedRouteSnapshot']) &&
        isNullableType(typeChecker, node)) {
      results.add(node);
    }

    node.forEachChild(walk);
  });

  return results;
}

/** Migrates an `ActivatedRouteSnapshot.fragment` access. */
export function migrateActivatedRouteSnapshotFragment(node: ts.PropertyAccessExpression): ts.Node {
  // Turns `foo.fragment` into `foo.fragment!`.
  return ts.createNonNullExpression(node);
}
