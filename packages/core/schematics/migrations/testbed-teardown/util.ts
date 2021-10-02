/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {getImportSpecifier} from '../../utils/typescript/imports';
import {isReferenceToImport} from '../../utils/typescript/symbol';

/** Result of a full-program analysis looking for `initTestEnvironment` calls. */
export interface InitTestEnvironmentAnalysis {
  /** Total number of calls that were found. */
  totalCalls: number;
  /** Calls that need to be migrated. */
  callsToMigrate: ts.CallExpression[];
}

/** Finds the `initTestEnvironment` calls that need to be migrated. */
export function findInitTestEnvironmentCalls(
    typeChecker: ts.TypeChecker, allSourceFiles: ts.SourceFile[]): InitTestEnvironmentAnalysis {
  const callsToMigrate = new Set<ts.CallExpression>();
  let totalCalls = 0;

  allSourceFiles.forEach(sourceFile => {
    sourceFile.forEachChild(function walk(node: ts.Node) {
      if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression) &&
          ts.isIdentifier(node.expression.name) &&
          node.expression.name.text === 'initTestEnvironment' &&
          isTestBedAccess(typeChecker, node.expression)) {
        totalCalls++;
        if (shouldMigrateInitTestEnvironment(node)) {
          callsToMigrate.add(node);
        }
      }

      node.forEachChild(walk);
    });
  });

  return {
    // Sort the nodes so that they will be migrated in reverse source order (nodes at the end of
    // the file are migrated first). This avoids issues where a migrated node will offset the
    // bounds of all nodes that come after it. Note that the nodes here are from all of the
    // passed in source files, but that doesn't matter since the later nodes will still appear
    // after the earlier ones.
    callsToMigrate: sortInReverseSourceOrder(Array.from(callsToMigrate)),
    totalCalls
  };
}

/** Finds the `configureTestingModule` and `withModule` calls that need to be migrated. */
export function findTestModuleMetadataNodes(
    typeChecker: ts.TypeChecker, sourceFile: ts.SourceFile) {
  const testModuleMetadataLiterals = new Set<ts.ObjectLiteralExpression>();
  const withModuleImport = getImportSpecifier(sourceFile, '@angular/core/testing', 'withModule');

  sourceFile.forEachChild(function walk(node: ts.Node) {
    if (ts.isCallExpression(node)) {
      const isConfigureTestingModuleCall = ts.isPropertyAccessExpression(node.expression) &&
          ts.isIdentifier(node.expression.name) &&
          node.expression.name.text === 'configureTestingModule' &&
          isTestBedAccess(typeChecker, node.expression) && shouldMigrateModuleConfigCall(node);
      const isWithModuleCall = withModuleImport && ts.isIdentifier(node.expression) &&
          isReferenceToImport(typeChecker, node.expression, withModuleImport) &&
          shouldMigrateModuleConfigCall(node);

      if (isConfigureTestingModuleCall || isWithModuleCall) {
        testModuleMetadataLiterals.add(node.arguments[0] as ts.ObjectLiteralExpression);
      }
    }

    node.forEachChild(walk);
  });

  // Sort the nodes so that they will be migrated in reverse source order (nodes at the end of
  // the file are migrated first). This avoids issues where a migrated node will offset the
  // bounds of all nodes that come after it.
  return sortInReverseSourceOrder(Array.from(testModuleMetadataLiterals));
}

/** Migrates a call to `TestBed.initTestEnvironment`. */
export function migrateInitTestEnvironment(node: ts.CallExpression): ts.CallExpression {
  const literalProperties: ts.ObjectLiteralElementLike[] = [];

  if (node.arguments.length > 2) {
    if (isFunction(node.arguments[2])) {
      // If the last argument is a function, add the function as the `aotSummaries` property.
      literalProperties.push(ts.createPropertyAssignment('aotSummaries', node.arguments[2]));
    } else if (ts.isObjectLiteralExpression(node.arguments[2])) {
      // If the property is an object literal, copy over all the properties.
      literalProperties.push(...node.arguments[2].properties);
    }
  }

  // Finally push the teardown object so that it appears last.
  literalProperties.push(createTeardownAssignment());

  return ts.createCall(
      node.expression, node.typeArguments,
      [...node.arguments.slice(0, 2), ts.createObjectLiteral(literalProperties, true)]);
}

/** Migrates an object literal that is passed into `configureTestingModule` or `withModule`. */
export function migrateTestModuleMetadataLiteral(node: ts.ObjectLiteralExpression):
    ts.ObjectLiteralExpression {
  return ts.createObjectLiteral(
      [...node.properties, createTeardownAssignment()], node.properties.length > 0);
}

/** Returns whether a property access points to `TestBed`. */
function isTestBedAccess(typeChecker: ts.TypeChecker, node: ts.PropertyAccessExpression): boolean {
  const symbolName = typeChecker.getTypeAtLocation(node.expression)?.getSymbol()?.getName();
  return symbolName === 'TestBed' || symbolName === 'TestBedStatic';
}

/** Whether a call to `initTestEnvironment` should be migrated. */
function shouldMigrateInitTestEnvironment(node: ts.CallExpression): boolean {
  // If there is no third argument, we definitely have to migrate it.
  if (node.arguments.length === 2) {
    return true;
  }

  // This is technically a type error so we shouldn't mess with it.
  if (node.arguments.length < 2) {
    return false;
  }

  // Otherwise we need to figure out if the `teardown` flag is set on the last argument.
  const lastArg = node.arguments[2];

  // Note: the checks below will identify something like `initTestEnvironment(..., ..., {})`,
  // but they'll ignore a variable being passed in as the last argument like `const config = {};
  // initTestEnvironment(..., ..., config)`. While we can resolve the variable to its declaration
  // using `typeChecker.getTypeAtLocation(lastArg).getSymbol()?.valueDeclaration`, we deliberately
  // don't, because it introduces some complexity and we may end up breaking user code. E.g.
  // the `config` from the example above may be passed in to other functions or the `teardown`
  // flag could be added later on by a function call.

  // If the argument is an object literal and there are no
  // properties called `teardown`, we have to migrate it.
  if (isObjectLiteralWithoutTeardown(lastArg)) {
    return true;
  }

  // If the last argument is an `aotSummaries` function, we also have to migrate.
  if (isFunction(lastArg)) {
    return true;
  }

  // Otherwise don't migrate if we couldn't identify the last argument.
  return false;
}

/**
 * Whether a call to a module configuration function should be migrated. This covers
 * `TestBed.configureTestingModule` and `withModule` since they both accept `TestModuleMetadata`
 * as their first argument.
 */
function shouldMigrateModuleConfigCall(node: ts.CallExpression): node is ts.CallExpression&
    {arguments: [ts.ObjectLiteralExpression, ...ts.Expression[]]} {
  return node.arguments.length > 0 && isObjectLiteralWithoutTeardown(node.arguments[0]);
}

/** Returns whether a node is a function literal. */
function isFunction(node: ts.Node): node is ts.ArrowFunction|ts.FunctionExpression|
    ts.FunctionDeclaration {
  return ts.isArrowFunction(node) || ts.isFunctionExpression(node) ||
      ts.isFunctionDeclaration(node);
}

/** Checks whether a node is an object literal that doesn't contain a property called `teardown`. */
function isObjectLiteralWithoutTeardown(node: ts.Node): node is ts.ObjectLiteralExpression {
  return ts.isObjectLiteralExpression(node) && !node.properties.find(prop => {
    return prop.name?.getText() === 'teardown';
  });
}

/** Creates a teardown configuration property assignment. */
function createTeardownAssignment(): ts.PropertyAssignment {
  // `teardown: {destroyAfterEach: false}`
  return ts.createPropertyAssignment(
      'teardown',
      ts.createObjectLiteral([ts.createPropertyAssignment('destroyAfterEach', ts.createFalse())]));
}

/** Sorts an array of AST nodes in reverse source order. */
function sortInReverseSourceOrder<T extends ts.Node>(nodes: T[]): T[] {
  return nodes.sort((a, b) => b.getEnd() - a.getEnd());
}
