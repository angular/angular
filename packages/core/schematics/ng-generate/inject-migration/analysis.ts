/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';
import {getAngularDecorators} from '../../utils/ng_decorators';
import {getNamedImports} from '../../utils/typescript/imports';
import {closestNode} from '../../utils/typescript/nodes';

/** Options that can be used to configure the migration. */
export interface MigrationOptions {
  /** Whether to generate code that keeps injectors backwards compatible. */
  backwardsCompatibleConstructors?: boolean;

  /** Whether to migrate abstract classes. */
  migrateAbstractClasses?: boolean;

  /** Whether to make the return type of `@Optinal()` parameters to be non-nullable. */
  nonNullableOptional?: boolean;

  /**
   * Internal-only option that determines whether the migration should try to move the
   * initializers of class members from the constructor back into the member itself. E.g.
   *
   * ```
   * // Before
   * private foo;
   *
   * constructor(@Inject(BAR) private bar: Bar) {
   *   this.foo = this.bar.getValue();
   * }
   *
   * // After
   * private bar = inject(BAR);
   * private foo = this.bar.getValue();
   * ```
   */
  _internalCombineMemberInitializers?: boolean;

  /**
   * Internal-only option that determines whether the migration should
   * replace constructor parameter references with `this.param` property
   * references. Only applies to references to readonly properties in
   * initializers.
   *
   * ```
   * // Before
   * private foo;
   *
   * constructor(readonly service: Service) {
   *   this.foo = service.getFoo();
   * }
   *
   * // After
   * readonly service = inject(Service);
   * private foo = this.service.getFoo();
   * ```
   */
  _internalReplaceParameterReferencesInInitializers?: boolean;
}

/** Names of decorators that enable DI on a class declaration. */
const DECORATORS_SUPPORTING_DI = new Set([
  'Component',
  'Directive',
  'Pipe',
  'NgModule',
  'Injectable',
]);

/** Names of symbols used for DI on parameters. */
export const DI_PARAM_SYMBOLS = new Set([
  'Inject',
  'Attribute',
  'Optional',
  'SkipSelf',
  'Self',
  'Host',
  'forwardRef',
]);

/** Kinds of nodes which aren't injectable when set as a type of a parameter. */
const UNINJECTABLE_TYPE_KINDS = new Set([
  ts.SyntaxKind.TrueKeyword,
  ts.SyntaxKind.FalseKeyword,
  ts.SyntaxKind.NumberKeyword,
  ts.SyntaxKind.StringKeyword,
  ts.SyntaxKind.NullKeyword,
  ts.SyntaxKind.VoidKeyword,
]);

/**
 * Finds the necessary information for the `inject` migration in a file.
 * @param sourceFile File which to analyze.
 * @param localTypeChecker Type checker scoped to the specific file.
 */
export function analyzeFile(
  sourceFile: ts.SourceFile,
  localTypeChecker: ts.TypeChecker,
  options: MigrationOptions,
) {
  const coreSpecifiers = getNamedImports(sourceFile, '@angular/core');

  // Exit early if there are no Angular imports.
  if (coreSpecifiers === null || coreSpecifiers.elements.length === 0) {
    return null;
  }

  const classes: {
    node: ts.ClassDeclaration;
    constructor: ts.ConstructorDeclaration;
    superCall: ts.CallExpression | null;
  }[] = [];
  const nonDecoratorReferences: Record<string, number | undefined> = {};
  const importsToSpecifiers = coreSpecifiers.elements.reduce((map, specifier) => {
    const symbolName = (specifier.propertyName || specifier.name).text;
    if (DI_PARAM_SYMBOLS.has(symbolName)) {
      map.set(symbolName, specifier);
    }
    return map;
  }, new Map<string, ts.ImportSpecifier>());

  sourceFile.forEachChild(function walk(node) {
    // Skip import declarations since they can throw off the identifier
    // could below and we don't care about them in this migration.
    if (ts.isImportDeclaration(node)) {
      return;
    }

    if (ts.isParameter(node)) {
      const closestConstructor = closestNode(node, ts.isConstructorDeclaration);

      // Visiting the same parameters that we're about to remove can throw off the reference
      // counting logic below. If we run into an initializer, we always visit its initializer
      // and optionally visit the modifiers/decorators if it's not due to be deleted. Note that
      // here we technically aren't dealing with the the full list of classes, but the parent class
      // will have been visited by the time we reach the parameters.
      if (node.initializer) {
        walk(node.initializer);
      }

      if (
        closestConstructor === null ||
        // This is meant to avoid the case where this is a
        // parameter inside a function placed in a constructor.
        !closestConstructor.parameters.includes(node) ||
        !classes.some((c) => c.constructor === closestConstructor)
      ) {
        node.modifiers?.forEach(walk);
      }
      return;
    }

    if (ts.isIdentifier(node) && importsToSpecifiers.size > 0) {
      let symbol: ts.Symbol | undefined;

      for (const [name, specifier] of importsToSpecifiers) {
        const localName = (specifier.propertyName || specifier.name).text;

        // Quick exit if the two symbols don't match up.
        if (localName === node.text) {
          if (!symbol) {
            symbol = localTypeChecker.getSymbolAtLocation(node);

            // If the symbol couldn't be resolved the first time, it won't be resolved the next
            // time either. Stop the loop since we won't be able to get an accurate result.
            if (!symbol || !symbol.declarations) {
              break;
            } else if (symbol.declarations.some((decl) => decl === specifier)) {
              nonDecoratorReferences[name] = (nonDecoratorReferences[name] || 0) + 1;
            }
          }
        }
      }
    } else if (ts.isClassDeclaration(node)) {
      const decorators = getAngularDecorators(localTypeChecker, ts.getDecorators(node) || []);
      const isAbstract = !!node.modifiers?.some((m) => m.kind === ts.SyntaxKind.AbstractKeyword);
      const supportsDI = decorators.some((dec) => DECORATORS_SUPPORTING_DI.has(dec.name));
      const constructorNode = node.members.find(
        (member) =>
          ts.isConstructorDeclaration(member) &&
          member.body != null &&
          member.parameters.length > 0,
      ) as ts.ConstructorDeclaration | undefined;

      // Basic check to determine if all parameters are injectable. This isn't exhaustive, but it
      // should catch the majority of cases. An exhaustive check would require a full type checker
      // which we don't have in this migration.
      const allParamsInjectable = !!constructorNode?.parameters.every((param) => {
        if (!param.type || !UNINJECTABLE_TYPE_KINDS.has(param.type.kind)) {
          return true;
        }
        return getAngularDecorators(localTypeChecker, ts.getDecorators(param) || []).some(
          (dec) => dec.name === 'Inject' || dec.name === 'Attribute',
        );
      });

      // Don't migrate abstract classes by default, because
      // their parameters aren't guaranteed to be injectable.
      if (
        supportsDI &&
        constructorNode &&
        allParamsInjectable &&
        (!isAbstract || options.migrateAbstractClasses)
      ) {
        classes.push({
          node,
          constructor: constructorNode,
          superCall: node.heritageClauses ? findSuperCall(constructorNode) : null,
        });
      }
    }

    node.forEachChild(walk);
  });

  return {classes, nonDecoratorReferences};
}

/**
 * Returns the parameters of a function that aren't used within its body.
 * @param declaration Function in which to search for unused parameters.
 * @param localTypeChecker Type checker scoped to the file in which the function was declared.
 * @param removedStatements Statements that were already removed from the constructor.
 */
export function getConstructorUnusedParameters(
  declaration: ts.ConstructorDeclaration,
  localTypeChecker: ts.TypeChecker,
  removedStatements: Set<ts.Statement>,
): Set<ts.Declaration> {
  const accessedTopLevelParameters = new Set<ts.Declaration>();
  const topLevelParameters = new Set<ts.Declaration>();
  const topLevelParameterNames = new Set<string>();
  const unusedParams = new Set<ts.Declaration>();

  // Prepare the parameters for quicker checks further down.
  for (const param of declaration.parameters) {
    if (ts.isIdentifier(param.name)) {
      topLevelParameters.add(param);
      topLevelParameterNames.add(param.name.text);
    }
  }

  if (!declaration.body) {
    return topLevelParameters;
  }

  const analyze = (node: ts.Node) => {
    // Don't descend into statements that were removed already.
    if (ts.isStatement(node) && removedStatements.has(node)) {
      return;
    }

    if (!ts.isIdentifier(node) || !topLevelParameterNames.has(node.text)) {
      node.forEachChild(analyze);
      return;
    }

    // Don't consider `this.<name>` accesses as being references to
    // parameters since they'll be moved to property declarations.
    if (isAccessedViaThis(node)) {
      return;
    }

    localTypeChecker.getSymbolAtLocation(node)?.declarations?.forEach((decl) => {
      if (ts.isParameter(decl) && topLevelParameters.has(decl)) {
        accessedTopLevelParameters.add(decl);
      }
      if (ts.isShorthandPropertyAssignment(decl)) {
        const symbol = localTypeChecker.getShorthandAssignmentValueSymbol(decl);
        if (symbol && symbol.valueDeclaration && ts.isParameter(symbol.valueDeclaration)) {
          accessedTopLevelParameters.add(symbol.valueDeclaration);
        }
      }
    });
  };

  declaration.parameters.forEach((param) => {
    if (param.initializer) {
      analyze(param.initializer);
    }
  });

  declaration.body.forEachChild(analyze);

  for (const param of topLevelParameters) {
    if (!accessedTopLevelParameters.has(param)) {
      unusedParams.add(param);
    }
  }
  return unusedParams;
}

/**
 * Determines which parameters of a function declaration are used within its `super` call.
 * @param declaration Function whose parameters to search for.
 * @param superCall `super()` call within the function.
 * @param localTypeChecker Type checker scoped to the file in which the function is declared.
 */
export function getSuperParameters(
  declaration: ts.FunctionLikeDeclaration,
  superCall: ts.CallExpression,
  localTypeChecker: ts.TypeChecker,
): Set<ts.ParameterDeclaration> {
  const usedParams = new Set<ts.ParameterDeclaration>();
  const topLevelParameters = new Set<ts.ParameterDeclaration>();
  const topLevelParameterNames = new Set<string>();

  // Prepare the parameters for quicker checks further down.
  for (const param of declaration.parameters) {
    if (ts.isIdentifier(param.name)) {
      topLevelParameters.add(param);
      topLevelParameterNames.add(param.name.text);
    }
  }

  superCall.forEachChild(function walk(node) {
    if (ts.isIdentifier(node) && topLevelParameterNames.has(node.text)) {
      localTypeChecker.getSymbolAtLocation(node)?.declarations?.forEach((decl) => {
        if (ts.isParameter(decl) && topLevelParameters.has(decl)) {
          usedParams.add(decl);
        } else if (
          ts.isShorthandPropertyAssignment(decl) &&
          topLevelParameterNames.has(decl.name.text)
        ) {
          for (const param of topLevelParameters) {
            if (ts.isIdentifier(param.name) && decl.name.text === param.name.text) {
              usedParams.add(param);
              break;
            }
          }
        }
      });
      // Parameters referenced inside callbacks can be used directly
      // within `super` so don't descend into inline functions.
    } else if (!isInlineFunction(node)) {
      node.forEachChild(walk);
    }
  });

  return usedParams;
}

/**
 * Determines if a specific parameter has references to other parameters.
 * @param param Parameter to check.
 * @param allParameters All parameters of the containing function.
 * @param localTypeChecker Type checker scoped to the current file.
 */
export function parameterReferencesOtherParameters(
  param: ts.ParameterDeclaration,
  allParameters: ts.NodeArray<ts.ParameterDeclaration>,
  localTypeChecker: ts.TypeChecker,
): boolean {
  // A parameter can only reference other parameters through its initializer.
  if (!param.initializer || allParameters.length < 2) {
    return false;
  }

  const paramNames = new Set<string>();
  for (const current of allParameters) {
    if (current !== param && ts.isIdentifier(current.name)) {
      paramNames.add(current.name.text);
    }
  }

  let result = false;
  const analyze = (node: ts.Node) => {
    if (ts.isIdentifier(node) && paramNames.has(node.text) && !isAccessedViaThis(node)) {
      const symbol = localTypeChecker.getSymbolAtLocation(node);
      const referencesOtherParam = symbol?.declarations?.some((decl) => {
        return (allParameters as ts.NodeArray<ts.Declaration>).includes(decl);
      });

      if (referencesOtherParam) {
        result = true;
      }
    }

    if (!result) {
      node.forEachChild(analyze);
    }
  };

  analyze(param.initializer);
  return result;
}

/** Checks whether a parameter node declares a property on its class. */
export function parameterDeclaresProperty(node: ts.ParameterDeclaration): boolean {
  return !!node.modifiers?.some(
    ({kind}) =>
      kind === ts.SyntaxKind.PublicKeyword ||
      kind === ts.SyntaxKind.PrivateKeyword ||
      kind === ts.SyntaxKind.ProtectedKeyword ||
      kind === ts.SyntaxKind.ReadonlyKeyword,
  );
}

/** Checks whether a type node is nullable. */
export function isNullableType(node: ts.TypeNode): boolean {
  // Apparently `foo: null` is `Parameter<TypeNode<NullKeyword>>`,
  // while `foo: undefined` is `Parameter<UndefinedKeyword>`...
  if (node.kind === ts.SyntaxKind.UndefinedKeyword || node.kind === ts.SyntaxKind.VoidKeyword) {
    return true;
  }

  if (ts.isLiteralTypeNode(node)) {
    return node.literal.kind === ts.SyntaxKind.NullKeyword;
  }

  if (ts.isUnionTypeNode(node)) {
    return node.types.some(isNullableType);
  }

  return false;
}

/** Checks whether a type node has generic arguments. */
export function hasGenerics(node: ts.TypeNode): boolean {
  if (ts.isTypeReferenceNode(node)) {
    return node.typeArguments != null && node.typeArguments.length > 0;
  }

  if (ts.isUnionTypeNode(node)) {
    return node.types.some(hasGenerics);
  }

  return false;
}

/** Checks whether an identifier is accessed through `this`, e.g. `this.<some identifier>`. */
export function isAccessedViaThis(node: ts.Identifier): boolean {
  return (
    ts.isPropertyAccessExpression(node.parent) &&
    node.parent.expression.kind === ts.SyntaxKind.ThisKeyword &&
    node.parent.name === node
  );
}

/** Finds a `super` call inside of a specific node. */
function findSuperCall(root: ts.Node): ts.CallExpression | null {
  let result: ts.CallExpression | null = null;

  root.forEachChild(function find(node) {
    if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.SuperKeyword) {
      result = node;
    } else if (result === null) {
      node.forEachChild(find);
    }
  });

  return result;
}

/** Checks whether a node is an inline function. */
export function isInlineFunction(
  node: ts.Node,
): node is ts.FunctionDeclaration | ts.FunctionExpression | ts.ArrowFunction {
  return (
    ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isArrowFunction(node)
  );
}
