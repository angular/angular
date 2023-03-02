/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {ChangeTracker} from '../../utils/change_tracker';

const requiredRouteProperties = new Set(['path', 'matcher']);
const guardPropertyNames =
    new Set(['canActivate', 'canMatch', 'canDeactivate', 'canActivateChild']);

export interface RewriteEntity {
  startPos: number;
  width: number;
  replacement: string;
}

export interface MigratableRoute {
  guards?: ts.PropertyAssignment[];
  title?: ts.PropertyAssignment;
  resolvedData?: ts.PropertyAssignment[];
}

export type RewriteFn = (startPos: number, origLength: number, text: string) => void;

export function migrateFile(
    sourceFile: ts.SourceFile, rewriteFn: RewriteFn, typeChecker: ts.TypeChecker) {
  const printer = ts.createPrinter();
  const changeTracker = new ChangeTracker(printer);
  const usages = getMigratableRoutes(sourceFile);
  for (const migratableRoute of usages) {
    const {title, resolvedData, guards} = migratableRoute;
    if (title) {
      migrateResolveProperty(title, typeChecker, changeTracker, sourceFile);
    }
    if (resolvedData) {
      for (const property of resolvedData) {
        migrateResolveProperty(property, typeChecker, changeTracker, sourceFile);
      }
    }
    if (guards) {
      for (const property of guards) {
        if (!ts.isArrayLiteralExpression(property.initializer)) {
          continue;
        }

        const classGuards: ts.Expression[] = [];
        const injectionTokenGuards: ts.Expression[] = [];
        const nonClassGuards: ts.Expression[] = [];

        for (const element of property.initializer.elements) {
          if (isInjectionToken(element, typeChecker)) {
            injectionTokenGuards.push(element);
          } else if (isClass(element, typeChecker)) {
            classGuards.push(element);
          } else {
            nonClassGuards.push(element);
          }
        }

        if ((classGuards.length === 0 && injectionTokenGuards.length === 0) ||
            !ts.isIdentifier(property.name)) {
          // nothing to migrate if there are no class-based guards
          continue;
        }

        const guardName = property.name.text;
        const mapperFunctionName = `mapTo${guardName.charAt(0).toUpperCase()}${guardName.slice(1)}`;
        const mappedClassGuards = ts.factory.createCallExpression(
            ts.factory.createIdentifier(mapperFunctionName), undefined,
            [ts.factory.createArrayLiteralExpression(classGuards)]);

        if (classGuards.length > 0) {
          changeTracker.addImport(sourceFile, mapperFunctionName, '@angular/router');
        }

        if (nonClassGuards.length === 0 && injectionTokenGuards.length === 0) {
          // All we have is class guards so we just use the mapped function
          const replacementNode =
              ts.factory.updatePropertyAssignment(property, property.name, mappedClassGuards);
          changeTracker.replaceNode(property, replacementNode, ts.EmitHint.Unspecified);
        } else {
          const elements: ts.Expression[] = [...nonClassGuards];
          if (classGuards.length > 0) {
            elements.push(ts.factory.createSpreadElement(mappedClassGuards));
          }
          if (injectionTokenGuards.length > 0) {
            elements.push(...injectionTokenGuards.map(g => {
              return injectionTokenToFunction(changeTracker, sourceFile, g);
            }));
          }
          const concatenatedGuards = ts.factory.createArrayLiteralExpression(elements);
          const replacementNode =
              ts.factory.updatePropertyAssignment(property, property.name, concatenatedGuards);
          changeTracker.replaceNode(property, replacementNode, ts.EmitHint.Unspecified);
        }
      }
    }
  }

  for (const changesInFile of changeTracker.recordChanges().values()) {
    for (const change of changesInFile) {
      rewriteFn(change.start, change.removeLength ?? 0, change.text);
    }
  }
}

function injectionTokenToFunction(
    changeTracker: ChangeTracker, sourceFile: ts.SourceFile,
    token: ts.Expression): ts.ArrowFunction {
  changeTracker.addImport(sourceFile, 'inject', '@angular/core');

  // Inject the token and call it with the guard or resolver params
  // inject(token)(...params)
  const functionBody = ts.factory.createCallExpression(
      ts.factory.createCallExpression(ts.factory.createIdentifier('inject'), undefined, [token]),
      undefined,
      [ts.factory.createSpreadElement(ts.factory.createIdentifier('params'))],
  );

  // (...params)
  const genericSpreadParams = ts.factory.createParameterDeclaration(
      undefined,
      ts.factory.createToken(ts.SyntaxKind.DotDotDotToken),
      ts.factory.createIdentifier('params'),
  );

  // (...params) => inject(token)(...params)
  return ts.factory.createArrowFunction(
      undefined,
      undefined,
      [genericSpreadParams],
      undefined,
      ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
      functionBody,
  );
}

function migrateResolveProperty(
    title: ts.PropertyAssignment, typeChecker: ts.TypeChecker, changeTracker: ChangeTracker,
    sourceFile: ts.SourceFile) {
  if (!isClass(title.initializer, typeChecker)) {
    return;
  }

  let migratedInitializer: ts.Expression;
  if (isInjectionToken(title.initializer, typeChecker)) {
    migratedInitializer = injectionTokenToFunction(changeTracker, sourceFile, title.initializer);
  } else {
    const mapperFunctionName = 'mapToResolve';
    changeTracker.addImport(sourceFile, mapperFunctionName, '@angular/router');
    // mapToResolve(Resolver)
    migratedInitializer = ts.factory.createCallExpression(
        ts.factory.createIdentifier(mapperFunctionName), undefined, [title.initializer]);
  }
  const replacementNode =
      ts.factory.updatePropertyAssignment(title, title.name, migratedInitializer);
  changeTracker.replaceNode(title, replacementNode, ts.EmitHint.Unspecified);
}

function getMigratableRoutes(sourceFile: ts.SourceFile): MigratableRoute[] {
  const routesToMigrate: MigratableRoute[] = [];
  const visitNode = (node: ts.Node) => {
    if (ts.isObjectLiteralExpression(node)) {
      const hasRequiredRouteProperty =
          node.properties.some(prop => isPropertyAssignmentWithName(prop, requiredRouteProperties));
      if (hasRequiredRouteProperty) {
        const route: MigratableRoute = {};

        route.guards = node.properties.filter(
            (prop): prop is ts.PropertyAssignment =>
                isPropertyAssignmentWithName(prop, guardPropertyNames));

        route.title = node.properties.find(
            (prop): prop is ts.PropertyAssignment => isPropertyAssignmentWithName(prop, 'title'));

        const resolve = node.properties.find(
            (prop): prop is ts.PropertyAssignment => isPropertyAssignmentWithName(prop, 'resolve'));
        if (resolve && ts.isObjectLiteralExpression(resolve.initializer)) {
          route.resolvedData = resolve.initializer.properties.filter(
              (p): p is ts.PropertyAssignment => ts.isPropertyAssignment(p));
        }

        if (route.guards?.length || route.title || route.resolvedData?.length) {
          routesToMigrate.push(route);
        }
      }
    }
    ts.forEachChild(node, visitNode);
  };
  ts.forEachChild(sourceFile, visitNode);
  return routesToMigrate;
}

function isPropertyAssignmentWithName(
    property: ts.ObjectLiteralElementLike,
    nameOrNames: string|Set<string>): property is ts.PropertyAssignment {
  return ts.isPropertyAssignment(property) && ts.isIdentifier(property.name) &&
      (nameOrNames instanceof Set ? nameOrNames.has(property.name.text) :
                                    nameOrNames === property.name.text);
}

function isClass(node: ts.Node, typeChecker: ts.TypeChecker): boolean {
  const symbol = typeChecker.getSymbolAtLocation(node);
  const type = typeChecker.getTypeAtLocation(node);
  function isClassDeclaration(symbol?: ts.Symbol): boolean {
    return !!symbol?.valueDeclaration && ts.isClassDeclaration(symbol.valueDeclaration);
  }
  return isClassDeclaration(type.getSymbol()) || isClassDeclaration(symbol);
}

function isInjectionToken(node: ts.Node, typeChecker: ts.TypeChecker): boolean {
  const type = typeChecker.getTypeAtLocation(node);
  return type.getSymbol()?.escapedName === 'InjectionToken';
}
