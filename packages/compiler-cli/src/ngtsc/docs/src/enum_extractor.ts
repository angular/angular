/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {EntryType, EnumEntry, EnumMemberEntry, MemberType} from './entities';
import {extractJsDocDescription, extractJsDocTags, extractRawJsDoc} from './jsdoc_extractor';
import {extractResolvedTypeString} from './type_extractor';
import ts from 'typescript';

/** Extracts documentation entry for an enum. */
export function extractEnum(
  declaration: ts.EnumDeclaration,
  typeChecker: ts.TypeChecker,
): EnumEntry {
  return {
    name: declaration.name.getText(),
    entryType: EntryType.Enum,
    members: extractEnumMembers(declaration, typeChecker),
    rawComment: extractRawJsDoc(declaration),
    description: extractJsDocDescription(declaration),
    jsdocTags: extractJsDocTags(declaration),
  };
}

/** Extracts doc info for an enum's members. */
function extractEnumMembers(
  declaration: ts.EnumDeclaration,
  checker: ts.TypeChecker,
): EnumMemberEntry[] {
  return declaration.members.map((member) => ({
    name: member.name.getText(),
    type: extractResolvedTypeString(member, checker),
    value: getEnumMemberValue(member),
    memberType: MemberType.EnumItem,
    jsdocTags: extractJsDocTags(member),
    description: extractJsDocDescription(member),
    memberTags: [],
  }));
}

/** Gets the explicitly assigned value for an enum member, or an empty string if there is none. */
function getEnumMemberValue(memberNode: ts.EnumMember): string {
  // If the enum member has a child number literal or string literal,
  // we use that literal as the "value" of the member.
  const literal = memberNode.getChildren().find((n) => {
    return (
      ts.isNumericLiteral(n) ||
      ts.isStringLiteral(n) ||
      (ts.isPrefixUnaryExpression(n) &&
        n.operator === ts.SyntaxKind.MinusToken &&
        ts.isNumericLiteral(n.operand))
    );
  });
  return literal?.getText() ?? '';
}
