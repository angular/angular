/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

/**
 * reflector.ts implements static reflection of declarations using the TypeScript `ts.TypeChecker`.
 */

/**
 * A reflected parameter of a function, method, or constructor, indicating the name, any
 * decorators, and an expression representing a reference to the value side of the parameter's
 * declared type, if applicable.
 */
export interface Parameter {
  /**
   * Name of the parameter as a `ts.BindingName`, which allows the parameter name to be identified
   * via sourcemaps.
   */
  name: ts.BindingName;

  /**
   * A `ts.Expression` which represents a reference to the value side of the parameter's type.
   */
  typeValueExpr: ts.Expression|null;

  /**
   * Array of decorators present on the parameter.
   */
  decorators: Decorator[];
}

/**
 * A reflected decorator, indicating the name, where it was imported from, and any arguments if the
 * decorator is a call expression.
 */
export interface Decorator {
  /**
   * Name of the decorator, extracted from the decoration expression.
   */
  name: string;

  /**
   * Import path (relative to the decorator's file) of the decorator itself.
   */
  from: string;

  /**
   * The decorator node itself (useful for printing sourcemap based references to the decorator).
   */
  node: ts.Decorator;

  /**
   * Any arguments of a call expression, if one is present. If the decorator was not a call
   * expression, then this will be an empty array.
   */
  args: ts.Expression[];
}

/**
 * Reflect a `ts.ClassDeclaration` and determine the list of parameters.
 *
 * Note that this only reflects the referenced class and not any potential parent class - that must
 * be handled by the caller.
 *
 * @param node the `ts.ClassDeclaration` to reflect
 * @param checker a `ts.TypeChecker` used for reflection
 * @returns a `Parameter` instance for each argument of the constructor, or `null` if no constructor
 */
export function reflectConstructorParameters(
    node: ts.ClassDeclaration, checker: ts.TypeChecker): Parameter[]|null {
  // Firstly, look for a constructor.
  // clang-format off
  const maybeCtor: ts.ConstructorDeclaration[] = node
    .members
    .filter(element => ts.isConstructorDeclaration(element)) as ts.ConstructorDeclaration[];
  // clang-format on

  if (maybeCtor.length !== 1) {
    // No constructor.
    return null;
  }

  // Reflect each parameter.
  return maybeCtor[0].parameters.map(param => reflectParameter(param, checker));
}

/**
 * Reflect a `ts.ParameterDeclaration` and determine its name, a token which refers to the value
 * declaration of its type (if possible to statically determine), and its decorators, if any.
 */
function reflectParameter(node: ts.ParameterDeclaration, checker: ts.TypeChecker): Parameter {
  // The name of the parameter is easy.
  const name = node.name;

  const decorators = node.decorators &&
          node.decorators.map(decorator => reflectDecorator(decorator, checker))
              .filter(decorator => decorator !== null) as Decorator[] ||
      [];

  // It may or may not be possible to write an expression that refers to the value side of the
  // type named for the parameter.
  let typeValueExpr: ts.Expression|null = null;

  // It's not possible to get a value expression if the parameter doesn't even have a type.
  if (node.type !== undefined) {
    // It's only valid to convert a type reference to a value reference if the type actually has a
    // value declaration associated with it.
    const type = checker.getTypeFromTypeNode(node.type);
    if (type.symbol !== undefined && type.symbol.valueDeclaration !== undefined) {
      // The type points to a valid value declaration. Rewrite the TypeReference into an Expression
      // which references the value pointed to by the TypeReference, if possible.
      typeValueExpr = typeNodeToValueExpr(node.type);
    }
  }

  return {
      name, typeValueExpr, decorators,
  };
}

/**
 * Reflect a decorator and return a structure describing where it comes from and any arguments.
 *
 * Only imported decorators are considered, not locally defined decorators.
 */
export function reflectDecorator(decorator: ts.Decorator, checker: ts.TypeChecker): Decorator|null {
  // Attempt to resolve the decorator expression into a reference to a concrete Identifier. The
  // expression may contain a call to a function which returns the decorator function, in which
  // case we want to return the arguments.
  let decoratorOfInterest: ts.Expression = decorator.expression;
  let args: ts.Expression[] = [];

  // Check for call expressions.
  if (ts.isCallExpression(decoratorOfInterest)) {
    args = Array.from(decoratorOfInterest.arguments);
    decoratorOfInterest = decoratorOfInterest.expression;
  }

  // The final resolved decorator should be a `ts.Identifier` - if it's not, then something is
  // wrong and the decorator can't be resolved statically.
  if (!ts.isIdentifier(decoratorOfInterest)) {
    return null;
  }

  const importDecl = reflectImportedIdentifier(decoratorOfInterest, checker);
  if (importDecl === null) {
    return null;
  }

  return {
    ...importDecl,
    node: decorator, args,
  };
}

function typeNodeToValueExpr(node: ts.TypeNode): ts.Expression|null {
  if (ts.isTypeReferenceNode(node)) {
    return entityNameToValue(node.typeName);
  } else {
    return null;
  }
}

function entityNameToValue(node: ts.EntityName): ts.Expression|null {
  if (ts.isQualifiedName(node)) {
    const left = entityNameToValue(node.left);
    return left !== null ? ts.createPropertyAccess(left, node.right) : null;
  } else if (ts.isIdentifier(node)) {
    return ts.getMutableClone(node);
  } else {
    return null;
  }
}

function propertyNameToValue(node: ts.PropertyName): string|null {
  if (ts.isIdentifier(node) || ts.isStringLiteral(node) || ts.isNumericLiteral(node)) {
    return node.text;
  } else {
    return null;
  }
}

export function reflectObjectLiteral(node: ts.ObjectLiteralExpression): Map<string, ts.Expression> {
  const map = new Map<string, ts.Expression>();
  node.properties.forEach(prop => {
    if (ts.isPropertyAssignment(prop)) {
      const name = propertyNameToValue(prop.name);
      if (name === null) {
        return;
      }
      map.set(name, prop.initializer);
    } else if (ts.isShorthandPropertyAssignment(prop)) {
      map.set(prop.name.text, prop.name);
    } else {
      return;
    }
  });
  return map;
}

export function reflectImportedIdentifier(
    id: ts.Identifier, checker: ts.TypeChecker): {name: string, from: string}|null {
  const symbol = checker.getSymbolAtLocation(id);

  if (symbol === undefined || symbol.declarations === undefined ||
      symbol.declarations.length !== 1) {
    return null;
  }

  // Ignore decorators that are defined locally (not imported).
  const decl: ts.Declaration = symbol.declarations[0];
  if (!ts.isImportSpecifier(decl)) {
    return null;
  }

  // Walk back from the specifier to find the declaration, which carries the module specifier.
  const importDecl = decl.parent !.parent !.parent !;

  // The module specifier is guaranteed to be a string literal, so this should always pass.
  if (!ts.isStringLiteral(importDecl.moduleSpecifier)) {
    // Not allowed to happen in TypeScript ASTs.
    return null;
  }

  // Read the module specifier.
  const from = importDecl.moduleSpecifier.text;

  // Compute the name by which the decorator was exported, not imported.
  const name = (decl.propertyName !== undefined ? decl.propertyName : decl.name).text;

  return {from, name};
}
