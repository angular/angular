/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import ts from 'typescript';
import {ClassMemberAccessLevel} from './host';
export function isNamedClassDeclaration(node) {
  return ts.isClassDeclaration(node) && isIdentifier(node.name);
}
export function isNamedFunctionDeclaration(node) {
  return ts.isFunctionDeclaration(node) && isIdentifier(node.name);
}
export function isNamedVariableDeclaration(node) {
  return ts.isVariableDeclaration(node) && isIdentifier(node.name);
}
function isIdentifier(node) {
  return node !== undefined && ts.isIdentifier(node);
}
/**
 * Converts the given class member access level to a string.
 * Useful fo error messages.
 */
export function classMemberAccessLevelToString(level) {
  switch (level) {
    case ClassMemberAccessLevel.EcmaScriptPrivate:
      return 'ES private';
    case ClassMemberAccessLevel.Private:
      return 'private';
    case ClassMemberAccessLevel.Protected:
      return 'protected';
    case ClassMemberAccessLevel.PublicReadonly:
      return 'public readonly';
    case ClassMemberAccessLevel.PublicWritable:
    default:
      return 'public';
  }
}
//# sourceMappingURL=util.js.map
