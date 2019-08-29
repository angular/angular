/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import {ClassDeclaration} from '../../reflection';

export function tsCastToAny(expr: ts.Expression): ts.Expression {
  return ts.createParen(
      ts.createAsExpression(expr, ts.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)));
}


/**
 * Create an expression which instantiates an element by its HTML tagName.
 *
 * Thanks to narrowing of `document.createElement()`, this expression will have its type inferred
 * based on the tag name, including for custom elements that have appropriate .d.ts definitions.
 */
export function tsCreateElement(tagName: string): ts.Expression {
  const createElement = ts.createPropertyAccess(
      /* expression */ ts.createIdentifier('document'), 'createElement');
  return ts.createCall(
      /* expression */ createElement,
      /* typeArguments */ undefined,
      /* argumentsArray */[ts.createLiteral(tagName)]);
}

/**
 * Create a `ts.VariableStatement` which declares a variable without explicit initialization.
 *
 * The initializer `null!` is used to bypass strict variable initialization checks.
 *
 * Unlike with `tsCreateVariable`, the type of the variable is explicitly specified.
 */
export function tsDeclareVariable(id: ts.Identifier, type: ts.TypeNode): ts.VariableStatement {
  const decl = ts.createVariableDeclaration(
      /* name */ id,
      /* type */ type,
      /* initializer */ ts.createNonNullExpression(ts.createNull()));
  return ts.createVariableStatement(
      /* modifiers */ undefined,
      /* declarationList */[decl]);
}

/**
 * Create a `ts.VariableStatement` that initializes a variable with a given expression.
 *
 * Unlike with `tsDeclareVariable`, the type of the variable is inferred from the initializer
 * expression.
 */
export function tsCreateVariable(
    id: ts.Identifier, initializer: ts.Expression): ts.VariableStatement {
  const decl = ts.createVariableDeclaration(
      /* name */ id,
      /* type */ undefined,
      /* initializer */ initializer);
  return ts.createVariableStatement(
      /* modifiers */ undefined,
      /* declarationList */[decl]);
}

/**
 * Construct a `ts.CallExpression` that calls a method on a receiver.
 */
export function tsCallMethod(
    receiver: ts.Expression, methodName: string, args: ts.Expression[] = []): ts.CallExpression {
  const methodAccess = ts.createPropertyAccess(receiver, methodName);
  return ts.createCall(
      /* expression */ methodAccess,
      /* typeArguments */ undefined,
      /* argumentsArray */ args);
}

export function checkIfClassIsExported(node: ClassDeclaration): boolean {
  // A class is exported if one of two conditions is met:
  // 1) it has the 'export' modifier.
  // 2) it's declared at the top level, and there is an export statement for the class.
  if (node.modifiers !== undefined &&
      node.modifiers.some(mod => mod.kind === ts.SyntaxKind.ExportKeyword)) {
    // Condition 1 is true, the class has an 'export' keyword attached.
    return true;
  } else if (
      node.parent !== undefined && ts.isSourceFile(node.parent) &&
      checkIfFileHasExport(node.parent, node.name.text)) {
    // Condition 2 is true, the class is exported via an 'export {}' statement.
    return true;
  }
  return false;
}

function checkIfFileHasExport(sf: ts.SourceFile, name: string): boolean {
  for (const stmt of sf.statements) {
    if (ts.isExportDeclaration(stmt) && stmt.exportClause !== undefined) {
      for (const element of stmt.exportClause.elements) {
        if (element.propertyName === undefined && element.name.text === name) {
          // The named declaration is directly exported.
          return true;
        } else if (element.propertyName !== undefined && element.propertyName.text == name) {
          // The named declaration is exported via an alias.
          return true;
        }
      }
    }
  }
  return false;
}

export function checkIfGenericTypesAreUnbound(node: ClassDeclaration<ts.ClassDeclaration>):
    boolean {
  if (node.typeParameters === undefined) {
    return true;
  }
  return node.typeParameters.every(param => param.constraint === undefined);
}
