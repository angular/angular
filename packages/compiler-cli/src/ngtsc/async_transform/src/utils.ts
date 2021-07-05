/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

export type AsyncFunction =
    ts.ArrowFunction|ts.FunctionExpression|ts.FunctionDeclaration|ts.MethodDeclaration;

/**
 * Test to see if the given `node` is an async function (declaration, expression or method).
 */
export function isAsyncFunction(node: ts.Node): node is AsyncFunction {
  return (ts.isArrowFunction(node) || ts.isFunctionExpression(node) ||
          ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node)) &&
      isAsync(node);
}

/**
 * Test to see if the given `fn` is an async function.
 */
export function isAsync(fn: ts.SignatureDeclaration): boolean {
  return !!(ts.getCombinedModifierFlags(fn) & ts.ModifierFlags.Async);
}

/**
 * Create an optimistic unique name from the given seed string.
 */
export function uniqueName(factory: ts.NodeFactory, seed: string) {
  return factory.createUniqueName(seed, ts.GeneratedIdentifierFlags.Optimistic);
}

/**
 * Return a clone of the given `modifiers` with the `async` modifier filtered out.
 */
export function filterAsyncModifier(modifiers: ts.ModifiersArray|undefined): ts.Modifier[]|
    undefined {
  if (modifiers === undefined) {
    return undefined;
  }
  return modifiers.filter(modifier => modifier.kind !== ts.SyntaxKind.AsyncKeyword);
}

/**
 * Test to see if the given `fn` signature declaration has a defined function body.
 */
export function hasFunctionBody(fn: ts.SignatureDeclaration): fn is ts.SignatureDeclaration&
    {body: ts.FunctionBody} {
  return (ts.isFunctionExpression(fn) || ts.isFunctionDeclaration(fn) ||
          ts.isMethodDeclaration(fn)) &&
      fn.body !== undefined;
}

/**
 * Test to see if the given `node` is the receiver in an assignment expression.
 */
export function isAssignmentReceiver(node: ts.PropertyAccessExpression|
                                     ts.ElementAccessExpression): boolean {
  const parent = node.parent;
  return parent && isAssignment(parent) && parent.left === node;
}

/**
 * Test to see if the given `node` is an assignment expression.
 */
export function isAssignment(node: ts.Node):
    node is ts.AssignmentExpression<ts.AssignmentOperatorToken> {
  return ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken;
}

/**
 * Type guard for a function that has been assigned to a variable or property. E.g.
 *
 * ```
 * const foo = () => {};
 * ```
 *
 * ```
 * const obj = {
 *   foo: () => {}
 * };
 * ```
 */
export function isNamedFunction(node: ts.SignatureDeclaration): node is ts.SignatureDeclaration&
    {parent: {name: ts.Identifier}} {
  const parent = node.parent;
  if (parent === undefined) {
    return false;
  }

  if (ts.isVariableDeclaration(parent) || ts.isPropertyAssignment(parent) ||
      ts.isPropertyDeclaration(parent)) {
    return parent.initializer === node && ts.isIdentifier(parent.name);
  }

  return false;
}

/**
 * Test to see if the `node` is the name part of a declaration.
 *
 * - CallSignatureDeclaration
 * - ClassDeclaration
 * - ConstructorDeclaration
 * - ConstructSignatureDeclaration
 * - EnumDeclaration
 * - ExportDeclaration
 * - FunctionDeclaration
 * - GetAccessorDeclaration
 * - ImportEqualsDeclaration
 * - IndexSignatureDeclaration
 * - InterfaceDeclaration
 * - MethodDeclaration
 * - MissingDeclaration
 * - ModuleDeclaration
 * - NamespaceExportDeclaration
 * - PropertyDeclaration
 * - SetAccessorDeclaration
 * - TypeAliasDeclaration
 * - TypeParameterDeclaration
 * - VariableDeclaration
 */
export function isDeclarationName(node: ts.Node, parent: ts.Node): boolean {
  return (ts.isCallSignatureDeclaration(parent) || ts.isClassDeclaration(parent) ||
          ts.isConstructorDeclaration(parent) || ts.isConstructSignatureDeclaration(parent) ||
          ts.isEnumDeclaration(parent) || ts.isExportDeclaration(parent) ||
          ts.isFunctionDeclaration(parent) || ts.isGetAccessorDeclaration(parent) ||
          ts.isImportEqualsDeclaration(parent) || ts.isIndexSignatureDeclaration(parent) ||
          ts.isInterfaceDeclaration(parent) || ts.isMethodDeclaration(parent) ||
          ts.isMissingDeclaration(parent) || ts.isModuleDeclaration(parent) ||
          ts.isNamespaceExportDeclaration(parent) || ts.isPropertyDeclaration(parent) ||
          ts.isSetAccessorDeclaration(parent) || ts.isTypeAliasDeclaration(parent) ||
          ts.isTypeParameterDeclaration(parent) || ts.isVariableDeclaration(parent)) &&
      parent.name === node;
}

/**
 * Test to see if the `node` is the label in a labeled statement or break/continue statement.
 */
export function isLabel(node: ts.Node, parent: ts.Node): boolean {
  return (ts.isLabeledStatement(parent) || ts.isBreakOrContinueStatement(parent)) &&
      parent.label === node;
}

/**
 * Test to see if the `node` is a name part of an other syntactic construction.
 *
 * We need to check that the `node` is not the `name` property of any of:
 *
 * - ClassElement
 * - ClassExpression
 * - EnumElement
 * - FunctionExpression
 * - ImportClause
 * - JSDocLink
 * - JSDocNameReference
 * - JSDocPropertyLikeTag
 * - JsxAttribute
 * - MetaProperty
 * - MethodSignature
 * - NamedTupleMember
 * - NamespaceExport
 * - NamespaceImport
 * - ObjectLiteralElement
 * - PropertyAccessChain
 * - PropertyAccessExpression
 * - PropertyAssignment
 * - PropertySignature
 * - TypeElement
 *
 * We need to check that the `node` is neither the `name` nor `propertyName` property of any of:
 *
 * - BindingElement
 * - ExportSpecifier
 * - ImportSpecifier
 *
 * Others:
 *
 * - TypePredicateNode (parameterName)
 * - ImportTypeNode (qualifier)
 * - TypeReferenceNode (typeName)
 * - TypeQueryNode (exprName)
 */
export function isPropertyName(node: ts.Node, parent: ts.Node): boolean {
  return (ts.isClassElement(parent) || ts.isClassExpression(parent) || ts.isEnumMember(parent) ||
          ts.isFunctionExpression(parent) || ts.isImportClause(parent) || ts.isJSDocLink(parent) ||
          ts.isJSDocNameReference(parent) || ts.isJSDocPropertyLikeTag(parent) ||
          ts.isJsxAttribute(parent) || ts.isMetaProperty(parent) || ts.isMethodSignature(parent) ||
          ts.isNamedTupleMember(parent) || ts.isNamespaceExport(parent) ||
          ts.isNamespaceImport(parent) || ts.isObjectLiteralElement(parent) ||
          ts.isPropertyAccessChain(parent) || ts.isPropertyAccessExpression(parent) ||
          ts.isPropertyAssignment(parent) || ts.isPropertySignature(parent) ||
          ts.isTypeElement(parent)) &&
      parent.name === node ||
      (ts.isImportSpecifier(parent) || ts.isExportSpecifier(parent) ||
       ts.isBindingElement(parent)) &&
      (parent.propertyName === node || parent.name === node) ||
      ts.isTypePredicateNode(parent) && parent.parameterName === node ||
      ts.isImportTypeNode(parent) && parent.qualifier === node ||
      ts.isTypeReferenceNode(parent) && parent.typeName === node ||
      ts.isTypeQueryNode(parent) && parent.exprName === node;
}

/**
 * Test to see if the `node` is the `tagName` on a JSDoc or JSX node.
 */
export function isTagName(node: ts.Node, parent: ts.Node): boolean {
  return (ts.isJSDoc(parent) || ts.isJsxOpeningElement(parent) || ts.isJsxClosingElement(parent) ||
          ts.isJsxSelfClosingElement(parent)) &&
      (parent as any).tagName === node;
}

/**
 * Test to see if the `node` is the name part of a shorthand property assignment.
 * E.g. `{ node }`.
 */
export function isShorthandPropertyName(node: ts.Node): node is ts.Node&
    {parent: ts.ShorthandPropertyAssignment} {
  const parent = node.parent;
  if (parent === undefined) {
    return false;
  }
  return ts.isShorthandPropertyAssignment(parent) && parent.name === node;
}
