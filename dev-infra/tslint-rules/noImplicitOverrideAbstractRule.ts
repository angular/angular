/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Replacement, RuleFailure, WalkContext} from 'tslint/lib';
import {TypedRule} from 'tslint/lib/rules';
import * as ts from 'typescript';

const FAILURE_MESSAGE = 'Missing override modifier. Members implemented as part of ' +
    'abstract classes must explicitly set the "override" modifier. ' +
    'More details: https://github.com/microsoft/TypeScript/issues/44457#issuecomment-856202843.';

/**
 * Rule which enforces that class members implementing abstract members
 * from base classes explicitly specify the `override` modifier.
 *
 * This ensures we follow the best-practice of applying `override` for abstract-implemented
 * members so that TypeScript creates diagnostics in both scenarios where either the abstract
 * class member is removed, or renamed.
 *
 * More details can be found here: https://github.com/microsoft/TypeScript/issues/44457.
 */
export class Rule extends TypedRule {
  override applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): RuleFailure[] {
    return this.applyWithFunction(sourceFile, ctx => visitNode(sourceFile, ctx, program));
  }
}

/**
 * For a TypeScript AST node and each of its child nodes, check whether the node is a class
 * element which implements an abstract member but does not have the `override` keyword.
 */
function visitNode(node: ts.Node, ctx: WalkContext, program: ts.Program) {
  // If a class element implements an abstract member but does not have the
  // `override` keyword, create a lint failure.
  if (ts.isClassElement(node) && !hasOverrideModifier(node) &&
      matchesParentAbstractElement(node, program)) {
    ctx.addFailureAtNode(
        node, FAILURE_MESSAGE, Replacement.appendText(node.getStart(), `override `));
  }

  ts.forEachChild(node, node => visitNode(node, ctx, program));
}

/**
 * Checks if the specified class element matches a parent abstract class element. i.e.
 * whether the specified member "implements" an abstract member from a base class.
 */
function matchesParentAbstractElement(node: ts.ClassElement, program: ts.Program): boolean {
  const containingClass = node.parent as ts.ClassDeclaration;

  // If the property we check does not have a property name, we cannot look for similarly-named
  // members in parent classes and therefore return early.
  if (node.name === undefined) {
    return false;
  }

  const propertyName = getPropertyNameText(node.name);
  const typeChecker = program.getTypeChecker();

  // If the property we check does not have a statically-analyzable property name,
  // we cannot look for similarly-named members in parent classes and return early.
  if (propertyName === null) {
    return false;
  }

  return checkClassForInheritedMatchingAbstractMember(containingClass, typeChecker, propertyName);
}

/** Checks if the given class inherits an abstract member with the specified name. */
function checkClassForInheritedMatchingAbstractMember(
    clazz: ts.ClassDeclaration, typeChecker: ts.TypeChecker, searchMemberName: string): boolean {
  const baseClass = getBaseClass(clazz, typeChecker);

  // If the class is not `abstract`, then all parent abstract methods would need to
  // be implemented, and there is never an abstract member within the class.
  if (baseClass === null || !hasAbstractModifier(baseClass)) {
    return false;
  }

  const matchingMember = baseClass.members.find(
      m => m.name !== undefined && getPropertyNameText(m.name) === searchMemberName);

  if (matchingMember !== undefined) {
    return hasAbstractModifier(matchingMember);
  }

  return checkClassForInheritedMatchingAbstractMember(baseClass, typeChecker, searchMemberName);
}

/** Gets the base class for the given class declaration. */
function getBaseClass(node: ts.ClassDeclaration, typeChecker: ts.TypeChecker): ts.ClassDeclaration|
    null {
  const baseTypes = getExtendsHeritageExpressions(node);

  if (baseTypes.length > 1) {
    throw Error('Class unexpectedly extends from multiple types.');
  }

  const baseClass = typeChecker.getTypeAtLocation(baseTypes[0]).getSymbol();
  const baseClassDecl = baseClass?.valueDeclaration ?? baseClass?.declarations?.[0];

  if (baseClassDecl !== undefined && ts.isClassDeclaration(baseClassDecl)) {
    return baseClassDecl;
  }

  return null;
}

/** Gets the `extends` base type expressions of the specified class. */
function getExtendsHeritageExpressions(classDecl: ts.ClassDeclaration):
    ts.ExpressionWithTypeArguments[] {
  if (classDecl.heritageClauses === undefined) {
    return [];
  }
  const result: ts.ExpressionWithTypeArguments[] = [];
  for (const clause of classDecl.heritageClauses) {
    if (clause.token === ts.SyntaxKind.ExtendsKeyword) {
      result.push(...clause.types);
    }
  }
  return result;
}

/** Gets whether the specified node has the `abstract` modifier applied. */
function hasAbstractModifier(node: ts.Node): boolean {
  return !!node.modifiers?.some(s => s.kind === ts.SyntaxKind.AbstractKeyword);
}

/** Gets whether the specified node has the `override` modifier applied. */
function hasOverrideModifier(node: ts.Node): boolean {
  return !!node.modifiers?.some(s => s.kind === ts.SyntaxKind.OverrideKeyword);
}

/** Gets the property name text of the specified property name. */
function getPropertyNameText(name: ts.PropertyName): string|null {
  if (ts.isComputedPropertyName(name)) {
    return null;
  }
  return name.text;
}
