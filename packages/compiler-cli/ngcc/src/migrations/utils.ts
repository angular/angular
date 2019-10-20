/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';
import {Reference} from '../../../src/ngtsc/imports';
import {ClassDeclaration, Decorator, isNamedClassDeclaration, isNamedFunctionDeclaration, isNamedVariableDeclaration} from '../../../src/ngtsc/reflection';
import {MigrationHost} from './migration';

export function isClassDeclaration(clazz: ts.Declaration): clazz is ClassDeclaration {
  return isNamedClassDeclaration(clazz) || isNamedFunctionDeclaration(clazz) ||
      isNamedVariableDeclaration(clazz);
}

/**
 * Returns true if the `clazz` is decorated as a `Directive` or `Component`.
 */
export function hasDirectiveDecorator(host: MigrationHost, clazz: ClassDeclaration): boolean {
  return host.metadata.getDirectiveMetadata(new Reference(clazz)) !== null;
}

/**
 * Returns true if the `clazz` has its own constructor function.
 */
export function hasConstructor(host: MigrationHost, clazz: ClassDeclaration): boolean {
  return host.reflectionHost.getConstructorParameters(clazz) !== null;
}

/**
 * Create an empty `Directive` decorator that will be associated with the `clazz`.
 */
export function createDirectiveDecorator(clazz: ClassDeclaration): Decorator {
  const selectorArg = ts.createObjectLiteral([
    // TODO: At the moment ngtsc does not accept a directive with no selector
    ts.createPropertyAssignment('selector', ts.createStringLiteral('NGCC_DUMMY')),
  ]);

  return {
    name: 'Directive',
    identifier: null,
    import: {name: 'Directive', from: '@angular/core'},
    node: null,
    synthesizedFor: clazz.name,
    args: [reifySourceFile(selectorArg)],
  };
}

/**
 * Create an empty `Injectable` decorator that will be associated with the `clazz`.
 */
export function createInjectableDecorator(clazz: ClassDeclaration): Decorator {
  return {
    name: 'Injectable',
    identifier: null,
    import: {name: 'Injectable', from: '@angular/core'},
    node: null,
    synthesizedFor: clazz.name,
    args: [],
  };
}

const EMPTY_SF = ts.createSourceFile('(empty)', '', ts.ScriptTarget.Latest);

/**
 * Takes a `ts.Expression` and returns the same `ts.Expression`, but with an associated
 * `ts.SourceFile`.
 *
 * This transformation is necessary to use synthetic `ts.Expression`s with the `PartialEvaluator`,
 * and many decorator arguments are interpreted in this way.
 */
function reifySourceFile(expr: ts.Expression): ts.Expression {
  const printer = ts.createPrinter();
  const exprText = printer.printNode(ts.EmitHint.Unspecified, expr, EMPTY_SF);
  const sf = ts.createSourceFile(
      '(synthetic)', `const expr = ${exprText};`, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const stmt = sf.statements[0];
  if (!ts.isVariableStatement(stmt)) {
    throw new Error(`Expected VariableStatement, got ${ts.SyntaxKind[stmt.kind]}`);
  }
  return stmt.declarationList.declarations[0].initializer !;
}
