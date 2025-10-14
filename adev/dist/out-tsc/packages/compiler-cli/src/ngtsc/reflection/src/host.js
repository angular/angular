/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import ts from 'typescript';
export function isDecoratorIdentifier(exp) {
  return (
    ts.isIdentifier(exp) ||
    (ts.isPropertyAccessExpression(exp) &&
      ts.isIdentifier(exp.expression) &&
      ts.isIdentifier(exp.name))
  );
}
/**
 * An enumeration of possible kinds of class members.
 */
export var ClassMemberKind;
(function (ClassMemberKind) {
  ClassMemberKind[(ClassMemberKind['Constructor'] = 0)] = 'Constructor';
  ClassMemberKind[(ClassMemberKind['Getter'] = 1)] = 'Getter';
  ClassMemberKind[(ClassMemberKind['Setter'] = 2)] = 'Setter';
  ClassMemberKind[(ClassMemberKind['Property'] = 3)] = 'Property';
  ClassMemberKind[(ClassMemberKind['Method'] = 4)] = 'Method';
})(ClassMemberKind || (ClassMemberKind = {}));
/** Possible access levels of a class member. */
export var ClassMemberAccessLevel;
(function (ClassMemberAccessLevel) {
  ClassMemberAccessLevel[(ClassMemberAccessLevel['PublicWritable'] = 0)] = 'PublicWritable';
  ClassMemberAccessLevel[(ClassMemberAccessLevel['PublicReadonly'] = 1)] = 'PublicReadonly';
  ClassMemberAccessLevel[(ClassMemberAccessLevel['Protected'] = 2)] = 'Protected';
  ClassMemberAccessLevel[(ClassMemberAccessLevel['Private'] = 3)] = 'Private';
  ClassMemberAccessLevel[(ClassMemberAccessLevel['EcmaScriptPrivate'] = 4)] = 'EcmaScriptPrivate';
})(ClassMemberAccessLevel || (ClassMemberAccessLevel = {}));
/** Indicates that a declaration is referenced through an ambient type. */
export const AmbientImport = {};
//# sourceMappingURL=host.js.map
