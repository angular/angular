/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {ConstantEntry, EntryType, EnumEntry, EnumMemberEntry, MemberType} from './entities';
import {extractJsDocDescription, extractJsDocTags, extractRawJsDoc} from './jsdoc_extractor';

/** Name of the tag indicating that an object literal should be shown as an enum in docs. */
const LITERAL_AS_ENUM_TAG = 'object-literal-as-enum';

/** Extracts documentation entry for a constant. */
export function extractConstant(
  declaration: ts.VariableDeclaration,
  typeChecker: ts.TypeChecker,
): ConstantEntry | EnumEntry {
  // For constants specifically, we want to get the base type for any literal types.
  // For example, TypeScript by default extracts `const PI = 3.14` as PI having a type of the
  // literal `3.14`. We don't want this behavior for constants, since generally one wants the
  // _value_ of the constant to be able to change between releases without changing the type.
  // `VERSION` is a good example here; the version is always a `string`, but the actual value of
  // the version string shouldn't matter to the type system.
  const resolvedType = typeChecker.getBaseTypeOfLiteralType(
    typeChecker.getTypeAtLocation(declaration),
  );

  // In the TS AST, the leading comment for a variable declaration is actually
  // on the ancestor `ts.VariableStatement` (since a single variable statement may
  // contain multiple variable declarations).
  const rawComment = extractRawJsDoc(declaration.parent.parent);
  const jsdocTags = extractJsDocTags(declaration);
  const description = extractJsDocDescription(declaration);
  const name = declaration.name.getText();

  // Some constants have to be treated as enums for documentation purposes.
  if (jsdocTags.some((tag) => tag.name === LITERAL_AS_ENUM_TAG)) {
    return {
      name,
      entryType: EntryType.Enum,
      members: extractLiteralPropertiesAsEnumMembers(declaration),
      rawComment,
      description,
      jsdocTags: jsdocTags.filter((tag) => tag.name !== LITERAL_AS_ENUM_TAG),
    };
  }

  return {
    name: name,
    type: typeChecker.typeToString(resolvedType),
    entryType: EntryType.Constant,
    rawComment,
    description,
    jsdocTags,
  };
}

/** Gets whether a given constant is an Angular-added const that should be ignored for docs. */
export function isSyntheticAngularConstant(declaration: ts.VariableDeclaration) {
  return declaration.name.getText() === 'USED_FOR_NG_TYPE_CHECKING';
}

/**
 * Extracts the properties of a variable initialized as an object literal as if they were enum
 * members. Will throw for any variables that can't be statically analyzed easily.
 */
function extractLiteralPropertiesAsEnumMembers(
  declaration: ts.VariableDeclaration,
): EnumMemberEntry[] {
  let initializer = declaration.initializer;

  // Unwrap `as` and parenthesized expressions.
  while (
    initializer &&
    (ts.isAsExpression(initializer) || ts.isParenthesizedExpression(initializer))
  ) {
    initializer = initializer.expression;
  }

  if (initializer === undefined || !ts.isObjectLiteralExpression(initializer)) {
    throw new Error(
      `Declaration tagged with "${LITERAL_AS_ENUM_TAG}" must be initialized to an object literal, but received ${
        initializer ? ts.SyntaxKind[initializer.kind] : 'undefined'
      }`,
    );
  }

  return initializer.properties.map((prop) => {
    if (!ts.isPropertyAssignment(prop) || !ts.isIdentifier(prop.name)) {
      throw new Error(
        `Property in declaration tagged with "${LITERAL_AS_ENUM_TAG}" must be a property assignment with a static name`,
      );
    }

    if (!ts.isNumericLiteral(prop.initializer) && !ts.isStringLiteralLike(prop.initializer)) {
      throw new Error(
        `Property in declaration tagged with "${LITERAL_AS_ENUM_TAG}" must be initialized to a number or string literal`,
      );
    }

    return {
      name: prop.name.text,
      type: `${declaration.name.getText()}.${prop.name.text}`,
      value: prop.initializer.getText(),
      memberType: MemberType.EnumItem,
      jsdocTags: extractJsDocTags(prop),
      description: extractJsDocDescription(prop),
      memberTags: [],
    };
  });
}
