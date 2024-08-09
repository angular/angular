/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';
import {isAccessedViaThis} from './analysis';

/**
 * Finds class property declarations without initializers whose constructor-based initialization
 * can be inlined into the declaration spot after migrating to `inject`. For example:
 *
 * ```
 * private foo: number;
 *
 * constructor(private service: MyService) {
 *   this.foo = this.service.getFoo();
 * }
 * ```
 *
 * The initializer of `foo` can be inlined, because `service` will be initialized
 * before it after the `inject` migration has finished running.
 *
 * @param node Class declaration that is being migrated.
 * @param constructor Constructor declaration of the class being migrated.
 * @param localTypeChecker Type checker scoped to the current file.
 */
export function findUninitializedPropertiesToCombine(
  node: ts.ClassDeclaration,
  constructor: ts.ConstructorDeclaration,
  localTypeChecker: ts.TypeChecker,
): Map<ts.PropertyDeclaration, ts.Expression> | null {
  let result: Map<ts.PropertyDeclaration, ts.Expression> | null = null;

  const membersToDeclarations = new Map<string, ts.PropertyDeclaration>();
  for (const member of node.members) {
    if (
      ts.isPropertyDeclaration(member) &&
      !member.initializer &&
      !ts.isComputedPropertyName(member.name)
    ) {
      membersToDeclarations.set(member.name.text, member);
    }
  }

  if (membersToDeclarations.size === 0) {
    return result;
  }

  const memberInitializers = getMemberInitializers(constructor);
  if (memberInitializers === null) {
    return result;
  }

  for (const [name, initializer] of memberInitializers.entries()) {
    if (
      membersToDeclarations.has(name) &&
      !hasLocalReferences(initializer, constructor, localTypeChecker)
    ) {
      result = result || new Map();
      result.set(membersToDeclarations.get(name)!, initializer);
    }
  }

  return result;
}

/**
 * Finds the expressions from the constructor that initialize class members, for example:
 *
 * ```
 * private foo: number;
 *
 * constructor() {
 *   this.foo = 123;
 * }
 * ```
 *
 * @param constructor Constructor declaration being analyzed.
 */
function getMemberInitializers(constructor: ts.ConstructorDeclaration) {
  let memberInitializers: Map<string, ts.Expression> | null = null;

  if (!constructor.body) {
    return memberInitializers;
  }

  // Only look at top-level constructor statements.
  for (const node of constructor.body.statements) {
    // Only look for statements in the form of `this.<name> = <expr>;` or `this[<name>] = <expr>;`.
    if (
      !ts.isExpressionStatement(node) ||
      !ts.isBinaryExpression(node.expression) ||
      node.expression.operatorToken.kind !== ts.SyntaxKind.EqualsToken ||
      (!ts.isPropertyAccessExpression(node.expression.left) &&
        !ts.isElementAccessExpression(node.expression.left)) ||
      node.expression.left.expression.kind !== ts.SyntaxKind.ThisKeyword
    ) {
      continue;
    }

    let name: string | undefined;

    if (ts.isPropertyAccessExpression(node.expression.left)) {
      name = node.expression.left.name.text;
    } else if (ts.isElementAccessExpression(node.expression.left)) {
      name = ts.isStringLiteralLike(node.expression.left.argumentExpression)
        ? node.expression.left.argumentExpression.text
        : undefined;
    }

    // If the member is initialized multiple times, take the first one.
    if (name && (!memberInitializers || !memberInitializers.has(name))) {
      memberInitializers = memberInitializers || new Map();
      memberInitializers.set(name, node.expression.right);
    }
  }

  return memberInitializers;
}

/**
 * Determines if a node has references to local symbols defined in the constructor.
 * @param root Expression to check for local references.
 * @param constructor Constructor within which the expression is used.
 * @param localTypeChecker Type checker scoped to the current file.
 */
function hasLocalReferences(
  root: ts.Expression,
  constructor: ts.ConstructorDeclaration,
  localTypeChecker: ts.TypeChecker,
): boolean {
  const sourceFile = root.getSourceFile();
  let hasLocalRefs = false;

  root.forEachChild(function walk(node) {
    // Stop searching if we know that it has local references.
    if (hasLocalRefs) {
      return;
    }

    // Skip identifiers that are accessed via `this` since they're accessing class members
    // that aren't local to the constructor. This is here primarily to catch cases like this
    // where `foo` is defined inside the constructor, but is a class member:
    // ```
    // constructor(private foo: Foo) {
    //   this.bar = this.foo.getFoo();
    // }
    // ```
    if (ts.isIdentifier(node) && !isAccessedViaThis(node)) {
      const declarations = localTypeChecker.getSymbolAtLocation(node)?.declarations;
      const isReferencingLocalSymbol = declarations?.some(
        (decl) =>
          // The source file check is a bit redundant since the type checker
          // is local to the file, but it's inexpensive and it can prevent
          // bugs in the future if we decide to use a full type checker.
          decl.getSourceFile() === sourceFile &&
          decl.getStart() >= constructor.getStart() &&
          decl.getEnd() <= constructor.getEnd() &&
          !isInsideInlineFunction(decl, constructor),
      );

      if (isReferencingLocalSymbol) {
        hasLocalRefs = true;
      }
    }

    if (!hasLocalRefs) {
      node.forEachChild(walk);
    }
  });

  return hasLocalRefs;
}

/**
 * Determines if a node is defined inside of an inline function.
 * @param startNode Node from which to start checking for inline functions.
 * @param boundary Node at which to stop searching.
 */
function isInsideInlineFunction(startNode: ts.Node, boundary: ts.Node): boolean {
  let current = startNode;

  while (current) {
    if (current === boundary) {
      return false;
    }

    if (
      ts.isFunctionDeclaration(current) ||
      ts.isFunctionExpression(current) ||
      ts.isArrowFunction(current)
    ) {
      return true;
    }

    current = current.parent;
  }

  return false;
}
