/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {ConstantEntry, EntryType} from './entities';
import {extractJsDocDescription, extractJsDocTags, extractRawJsDoc,} from './jsdoc_extractor';

/** Extracts documentation entry for a constant. */
export function extractConstant(
    declaration: ts.VariableDeclaration, typeChecker: ts.TypeChecker): ConstantEntry {
  // For constants specifically, we want to get the base type for any literal types.
  // For example, TypeScript by default extracts `const PI = 3.14` as PI having a type of the
  // literal `3.14`. We don't want this behavior for constants, since generally one wants the
  // _value_ of the constant to be able to change between releases without changing the type.
  // `VERSION` is a good example here; the version is always a `string`, but the actual value of
  // the version string shouldn't matter to the type system.
  const resolvedType =
      typeChecker.getBaseTypeOfLiteralType(typeChecker.getTypeAtLocation(declaration));

  // In the TS AST, the leading comment for a variable declaration is actually
  // on the ancestor `ts.VariableStatement` (since a single variable statement may
  // contain multiple variable declarations).
  const variableStatement = declaration.parent.parent;
  const rawComment = extractRawJsDoc(declaration.parent.parent);

  return {
    name: declaration.name.getText(),
    type: typeChecker.typeToString(resolvedType),
    entryType: EntryType.Constant,
    rawComment,
    description: extractJsDocDescription(declaration),
    jsdocTags: extractJsDocTags(declaration),
  };
}

/** Gets whether a given constant is an Angular-added const that should be ignored for docs. */
export function isSyntheticAngularConstant(declaration: ts.VariableDeclaration) {
  return declaration.name.getText() === 'USED_FOR_NG_TYPE_CHECKING';
}
