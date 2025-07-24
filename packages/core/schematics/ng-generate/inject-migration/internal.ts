/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';
import {
  isAccessedViaThis,
  isInlineFunction,
  MigrationOptions,
  parameterDeclaresProperty,
} from './analysis';

/** Property that is a candidate to be combined. */
interface CombineCandidate {
  /** Node that declares the property. */
  declaration: ts.PropertyDeclaration;
  /** Value to which the property was initialized in the constructor. */
  initializer: ts.Expression;
}

/**
 * Finds class property declarations without initializers whose constructor-based initialization
 * can be inlined into the declaration spot after migrating to `inject`. For example:
 *
 * ```ts
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
  options: MigrationOptions,
): {
  toCombine: CombineCandidate[];
  toHoist: ts.PropertyDeclaration[];
} | null {
  let toCombine: CombineCandidate[] | null = null;
  let toHoist: ts.PropertyDeclaration[] = [];

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
    return null;
  }

  const memberInitializers = getMemberInitializers(constructor);
  if (memberInitializers === null) {
    return null;
  }

  const inlinableParameters = options._internalReplaceParameterReferencesInInitializers
    ? findInlinableParameterReferences(constructor, localTypeChecker)
    : new Set<ts.Declaration>();

  for (const [name, decl] of membersToDeclarations.entries()) {
    if (memberInitializers.has(name)) {
      const initializer = memberInitializers.get(name)!;

      if (!hasLocalReferences(initializer, constructor, inlinableParameters, localTypeChecker)) {
        toCombine ??= [];
        toCombine.push({declaration: membersToDeclarations.get(name)!, initializer});
      }
    } else {
      // Mark members that have no initializers and can't be combined to be hoisted above the
      // injected members. This is either a no-op or it allows us to avoid some patterns internally
      // like the following:
      // ```
      // class Foo {
      //   publicFoo: Foo;
      //   private privateFoo: Foo;
      //
      //   constructor() {
      //     this.initializePrivateFooSomehow();
      //     this.publicFoo = this.privateFoo;
      //   }
      // }
      // ```
      toHoist.push(decl);
    }
  }

  // If no members need to be combined, none need to be hoisted either.
  return toCombine === null ? null : {toCombine, toHoist};
}

/**
 * In some cases properties may be declared out of order, but initialized in the correct order.
 * The internal-specific migration will combine such properties which will result in a compilation
 * error, for example:
 *
 * ```ts
 * class MyClass {
 *   foo: Foo;
 *   bar: Bar;
 *
 *   constructor(bar: Bar) {
 *     this.bar = bar;
 *     this.foo = this.bar.getFoo();
 *   }
 * }
 * ```
 *
 * Will become:
 *
 * ```ts
 * class MyClass {
 *   foo: Foo = this.bar.getFoo();
 *   bar: Bar = inject(Bar);
 * }
 * ```
 *
 * This function determines if cases like this can be saved by reordering the properties so their
 * declaration order matches the order in which they're initialized.
 *
 * @param toCombine Properties that are candidates to be combined.
 * @param constructor
 */
export function shouldCombineInInitializationOrder(
  toCombine: CombineCandidate[],
  constructor: ts.ConstructorDeclaration,
): boolean {
  let combinedMemberReferenceCount = 0;
  let otherMemberReferenceCount = 0;
  const injectedMemberNames = new Set<string>();
  const combinedMemberNames = new Set<string>();

  // Collect the name of constructor parameters that declare new properties.
  // These can be ignored since they'll be hoisted above other properties.
  constructor.parameters.forEach((param) => {
    if (parameterDeclaresProperty(param) && ts.isIdentifier(param.name)) {
      injectedMemberNames.add(param.name.text);
    }
  });

  // Collect the names of the properties being combined. We should only reorder
  // the properties if at least one of them refers to another one.
  toCombine.forEach(({declaration: {name}}) => {
    if (ts.isStringLiteralLike(name) || ts.isIdentifier(name)) {
      combinedMemberNames.add(name.text);
    }
  });

  // Visit all the initializers and check all the property reads in the form of `this.<name>`.
  // Skip over the ones referring to injected parameters since they're going to be hoisted.
  const walkInitializer = (node: ts.Node) => {
    if (ts.isPropertyAccessExpression(node) && node.expression.kind === ts.SyntaxKind.ThisKeyword) {
      if (combinedMemberNames.has(node.name.text)) {
        combinedMemberReferenceCount++;
      } else if (!injectedMemberNames.has(node.name.text)) {
        otherMemberReferenceCount++;
      }
    }

    node.forEachChild(walkInitializer);
  };
  toCombine.forEach((candidate) => walkInitializer(candidate.initializer));

  // If at the end there is at least one reference between a combined member and another,
  // and there are no references to any other class members, we can safely reorder the
  // properties based on how they were initialized.
  return combinedMemberReferenceCount > 0 && otherMemberReferenceCount === 0;
}

/**
 * Finds the expressions from the constructor that initialize class members, for example:
 *
 * ```ts
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
 * Checks if the node is an identifier that references a property from the given
 * list. Returns the property if it is.
 */
function getIdentifierReferencingProperty(
  node: ts.Node,
  localTypeChecker: ts.TypeChecker,
  propertyNames: Set<string>,
  properties: Set<ts.Declaration>,
): ts.ParameterDeclaration | undefined {
  if (!ts.isIdentifier(node) || !propertyNames.has(node.text)) {
    return undefined;
  }
  const declarations = localTypeChecker.getSymbolAtLocation(node)?.declarations;
  if (!declarations) {
    return undefined;
  }

  for (const decl of declarations) {
    if (properties.has(decl)) {
      return decl as ts.ParameterDeclaration;
    }
  }
  return undefined;
}

/**
 * Returns true if the node introduces a new `this` scope (so we can't
 * reference the outer this).
 */
function introducesNewThisScope(node: ts.Node): boolean {
  return (
    ts.isFunctionDeclaration(node) ||
    ts.isFunctionExpression(node) ||
    ts.isMethodDeclaration(node) ||
    ts.isClassDeclaration(node) ||
    ts.isClassExpression(node)
  );
}

/**
 * Finds constructor parameter references which can be inlined as `this.prop`.
 * - prop must be a readonly property
 * - the reference can't be in a nested function where `this` might refer
 *   to something else
 */
function findInlinableParameterReferences(
  constructorDeclaration: ts.ConstructorDeclaration,
  localTypeChecker: ts.TypeChecker,
): Set<ts.Declaration> {
  const eligibleProperties = constructorDeclaration.parameters.filter(
    (p) =>
      ts.isIdentifier(p.name) && p.modifiers?.some((s) => s.kind === ts.SyntaxKind.ReadonlyKeyword),
  );
  const eligibleNames = new Set(eligibleProperties.map((p) => (p.name as ts.Identifier).text));
  const eligiblePropertiesSet: Set<ts.Declaration> = new Set(eligibleProperties);

  function walk(node: ts.Node, canReferenceThis: boolean) {
    const property = getIdentifierReferencingProperty(
      node,
      localTypeChecker,
      eligibleNames,
      eligiblePropertiesSet,
    );
    if (property && !canReferenceThis) {
      // The property is referenced in a nested context where
      // we can't use `this`, so we can't inline it.
      eligiblePropertiesSet.delete(property);
    } else if (introducesNewThisScope(node)) {
      canReferenceThis = false;
    }

    ts.forEachChild(node, (child) => {
      walk(child, canReferenceThis);
    });
  }

  walk(constructorDeclaration, true);
  return eligiblePropertiesSet;
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
  allowedParameters: Set<ts.Declaration>,
  localTypeChecker: ts.TypeChecker,
): boolean {
  const sourceFile = root.getSourceFile();
  let hasLocalRefs = false;

  const walk = (node: ts.Node) => {
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
          !allowedParameters.has(decl) &&
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
  };

  walk(root);

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

    if (isInlineFunction(current)) {
      return true;
    }

    current = current.parent;
  }

  return false;
}
