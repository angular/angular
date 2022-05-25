/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SchematicsException, Tree} from '@angular-devkit/schematics';
import {InsertChange} from '@schematics/angular/utility/change';
import * as ts from 'typescript';
import {insertImport} from '@schematics/angular/utility/ast-utils';

/**
 * Checks whether the providers from a module are being imported in a `bootstrapApplication` call.
 * @param tree File tree of the project.
 * @param filePath Path of the file in which to check.
 * @param className Class name of the module to search for.
 */
export function importsProvidersFrom(tree: Tree, filePath: string, className: string): boolean {
  const sourceFile = ts.createSourceFile(
    filePath,
    tree.readText(filePath),
    ts.ScriptTarget.Latest,
    true,
  );

  const bootstrapCall = findBootstrapApplicationCall(sourceFile);
  const importProvidersFromCall = bootstrapCall ? findImportProvidersFromCall(bootstrapCall) : null;

  return (
    !!importProvidersFromCall &&
    importProvidersFromCall.arguments.some(arg => ts.isIdentifier(arg) && arg.text === className)
  );
}

/**
 * Adds an `importProvidersFrom` call to the `bootstrapApplication` call.
 * @param tree File tree of the project.
 * @param filePath Path to the file that should be updated.
 * @param moduleName Name of the module that should be imported.
 * @param modulePath Path from which to import the module.
 */
export function addModuleImportToStandaloneBootstrap(
  tree: Tree,
  filePath: string,
  moduleName: string,
  modulePath: string,
) {
  const sourceFile = ts.createSourceFile(
    filePath,
    tree.readText(filePath),
    ts.ScriptTarget.Latest,
    true,
  );

  const bootstrapCall = findBootstrapApplicationCall(sourceFile);

  if (!bootstrapCall) {
    throw new SchematicsException(`Could not find bootstrapApplication call in ${filePath}`);
  }

  const recorder = tree.beginUpdate(filePath);
  const importCall = findImportProvidersFromCall(bootstrapCall);
  const printer = ts.createPrinter();
  const sourceText = sourceFile.getText();

  // Add imports to the module being added and `importProvidersFrom`. We don't
  // have to worry about duplicates, because `insertImport` handles them.
  [
    insertImport(sourceFile, sourceText, moduleName, modulePath),
    insertImport(sourceFile, sourceText, 'importProvidersFrom', '@angular/core'),
  ].forEach(change => {
    if (change instanceof InsertChange) {
      recorder.insertLeft(change.pos, change.toAdd);
    }
  });

  // If there is an `importProvidersFrom` call already, reuse it.
  if (importCall) {
    recorder.insertRight(
      importCall.arguments[importCall.arguments.length - 1].getEnd(),
      `, ${moduleName}`,
    );
  } else if (bootstrapCall.arguments.length === 1) {
    // Otherwise if there is no options parameter to `bootstrapApplication`,
    // create an object literal with a `providers` array and the import.
    const newCall = ts.factory.updateCallExpression(
      bootstrapCall,
      bootstrapCall.expression,
      bootstrapCall.typeArguments,
      [
        ...bootstrapCall.arguments,
        ts.factory.createObjectLiteralExpression([createProvidersAssignment(moduleName)], true),
      ],
    );

    recorder.remove(bootstrapCall.getStart(), bootstrapCall.getWidth());
    recorder.insertRight(
      bootstrapCall.getStart(),
      printer.printNode(ts.EmitHint.Unspecified, newCall, sourceFile),
    );
  } else {
    const providersLiteral = findProvidersLiteral(bootstrapCall);

    if (providersLiteral) {
      // If there's a `providers` array, add the import to it.
      const newProvidersLiteral = ts.factory.updateArrayLiteralExpression(providersLiteral, [
        ...providersLiteral.elements,
        createImportProvidersFromCall(moduleName),
      ]);
      recorder.remove(providersLiteral.getStart(), providersLiteral.getWidth());
      recorder.insertRight(
        providersLiteral.getStart(),
        printer.printNode(ts.EmitHint.Unspecified, newProvidersLiteral, sourceFile),
      );
    } else {
      // Otherwise add a `providers` array to the existing object literal.
      const optionsLiteral = bootstrapCall.arguments[1] as ts.ObjectLiteralExpression;
      const newOptionsLiteral = ts.factory.updateObjectLiteralExpression(optionsLiteral, [
        ...optionsLiteral.properties,
        createProvidersAssignment(moduleName),
      ]);
      recorder.remove(optionsLiteral.getStart(), optionsLiteral.getWidth());
      recorder.insertRight(
        optionsLiteral.getStart(),
        printer.printNode(ts.EmitHint.Unspecified, newOptionsLiteral, sourceFile),
      );
    }
  }

  tree.commitUpdate(recorder);
}

/** Finds the call to `bootstrapApplication` within a file. */
export function findBootstrapApplicationCall(sourceFile: ts.SourceFile): ts.CallExpression | null {
  const localName = findImportLocalName(
    sourceFile,
    'bootstrapApplication',
    '@angular/platform-browser',
  );

  return localName ? findCall(sourceFile, localName) : null;
}

/** Find a call to `importProvidersFrom` within a `bootstrapApplication` call. */
function findImportProvidersFromCall(bootstrapCall: ts.CallExpression): ts.CallExpression | null {
  const providersLiteral = findProvidersLiteral(bootstrapCall);
  const importProvidersName = findImportLocalName(
    bootstrapCall.getSourceFile(),
    'importProvidersFrom',
    '@angular/core',
  );

  if (providersLiteral && importProvidersName) {
    for (const element of providersLiteral.elements) {
      // Look for an array element that calls the `importProvidersFrom` function.
      if (
        ts.isCallExpression(element) &&
        ts.isIdentifier(element.expression) &&
        element.expression.text === importProvidersName
      ) {
        return element;
      }
    }
  }

  return null;
}

/** Finds the `providers` array literal within a `bootstrapApplication` call. */
function findProvidersLiteral(bootstrapCall: ts.CallExpression): ts.ArrayLiteralExpression | null {
  // The imports have to be in the second argument of
  // the function which has to be an object literal.
  if (
    bootstrapCall.arguments.length > 1 &&
    ts.isObjectLiteralExpression(bootstrapCall.arguments[1])
  ) {
    for (const prop of bootstrapCall.arguments[1].properties) {
      if (
        ts.isPropertyAssignment(prop) &&
        ts.isIdentifier(prop.name) &&
        prop.name.text === 'providers' &&
        ts.isArrayLiteralExpression(prop.initializer)
      ) {
        return prop.initializer;
      }
    }
  }

  return null;
}

/**
 * Finds the local name of an imported symbol. Could be the symbol name itself or its alias.
 * @param sourceFile File within which to search for the import.
 * @param name Actual name of the import, not its local alias.
 * @param moduleName Name of the module from which the symbol is imported.
 */
function findImportLocalName(
  sourceFile: ts.SourceFile,
  name: string,
  moduleName: string,
): string | null {
  for (const node of sourceFile.statements) {
    // Only look for top-level imports.
    if (
      !ts.isImportDeclaration(node) ||
      !ts.isStringLiteral(node.moduleSpecifier) ||
      node.moduleSpecifier.text !== moduleName
    ) {
      continue;
    }

    // Filter out imports that don't have the right shape.
    if (
      !node.importClause ||
      !node.importClause.namedBindings ||
      !ts.isNamedImports(node.importClause.namedBindings)
    ) {
      continue;
    }

    // Look through the elements of the declaration for the specific import.
    for (const element of node.importClause.namedBindings.elements) {
      if ((element.propertyName || element.name).text === name) {
        // The local name is always in `name`.
        return element.name.text;
      }
    }
  }

  return null;
}

/**
 * Finds a call to a function with a specific name.
 * @param rootNode Node from which to start searching.
 * @param name Name of the function to search for.
 */
function findCall(rootNode: ts.Node, name: string): ts.CallExpression | null {
  let result: ts.CallExpression | null = null;

  rootNode.forEachChild(function walk(node) {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === name
    ) {
      result = node;
    }

    if (!result) {
      node.forEachChild(walk);
    }
  });

  return result;
}

/** Creates an `importProvidersFrom({{moduleName}})` call. */
function createImportProvidersFromCall(moduleName: string): ts.CallExpression {
  return ts.factory.createCallChain(
    ts.factory.createIdentifier('importProvidersFrom'),
    undefined,
    undefined,
    [ts.factory.createIdentifier(moduleName)],
  );
}

/** Creates a `providers: [importProvidersFrom({{moduleName}})]` property assignment. */
function createProvidersAssignment(moduleName: string): ts.PropertyAssignment {
  return ts.factory.createPropertyAssignment(
    'providers',
    ts.factory.createArrayLiteralExpression([createImportProvidersFromCall(moduleName)]),
  );
}
