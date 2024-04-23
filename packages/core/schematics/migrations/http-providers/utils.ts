/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {ChangeTracker} from '../../utils/change_tracker';
import {getAngularDecorators, NgDecorator} from '../../utils/ng_decorators';
import {getImportSpecifiers, getNamedImports} from '../../utils/typescript/imports';

const HTTP_CLIENT_MODULE = 'HttpClientModule';
const HTTP_CLIENT_XSRF_MODULE = 'HttpClientXsrfModule';
const HTTP_CLIENT_JSONP_MODULE = 'HttpClientJsonpModule';
const HTTP_CLIENT_TESTING_MODULE = 'HttpClientTestingModule';
const WITH_INTERCEPTORS_FROM_DI = 'withInterceptorsFromDi';
const WITH_JSONP_SUPPORT = 'withJsonpSupport';
const WITH_NOXSRF_PROTECTION = 'withNoXsrfProtection';
const WITH_XSRF_CONFIGURATION = 'withXsrfConfiguration';
const PROVIDE_HTTP_CLIENT = 'provideHttpClient';
const PROVIDE_HTTP_CLIENT_TESTING = 'provideHttpClientTesting';

const COMMON_HTTP = '@angular/common/http';
const COMMON_HTTP_TESTING = '@angular/common/http/testing';

const HTTP_MODULES = new Set([
  HTTP_CLIENT_MODULE,
  HTTP_CLIENT_XSRF_MODULE,
  HTTP_CLIENT_JSONP_MODULE,
]);
const HTTP_TESTING_MODULES = new Set([HTTP_CLIENT_TESTING_MODULE]);

export type RewriteFn = (startPos: number, width: number, text: string) => void;

export function migrateFile(
  sourceFile: ts.SourceFile,
  typeChecker: ts.TypeChecker,
  rewriteFn: RewriteFn,
) {
  const changeTracker = new ChangeTracker(ts.createPrinter());
  const addedImports = new Map<string, Set<string>>([
    [COMMON_HTTP, new Set()],
    [COMMON_HTTP_TESTING, new Set()],
  ]);

  const commonHttpIdentifiers = new Set(
    getImportSpecifiers(sourceFile, COMMON_HTTP, [...HTTP_MODULES]).map((specifier) =>
      specifier.getText(),
    ),
  );
  const commonHttpTestingIdentifiers = new Set(
    getImportSpecifiers(sourceFile, COMMON_HTTP_TESTING, [...HTTP_TESTING_MODULES]).map(
      (specifier) => specifier.getText(),
    ),
  );

  ts.forEachChild(sourceFile, function visit(node: ts.Node) {
    ts.forEachChild(node, visit);

    if (ts.isClassDeclaration(node)) {
      const decorators = getAngularDecorators(typeChecker, ts.getDecorators(node) || []);
      decorators.forEach((decorator) => {
        migrateDecorator(decorator, commonHttpIdentifiers, addedImports, changeTracker);
      });
    }

    migrateTestingModuleImports(node, commonHttpTestingIdentifiers, addedImports, changeTracker);
  });

  // Imports are for the whole file
  // We handle them separately

  // Remove the HttpModules imports from common/http
  const commonHttpImports = getNamedImports(sourceFile, COMMON_HTTP);
  if (commonHttpImports) {
    const symbolImportsToRemove = getImportSpecifiers(sourceFile, COMMON_HTTP, [...HTTP_MODULES]);

    const newImports = ts.factory.updateNamedImports(commonHttpImports, [
      ...commonHttpImports.elements.filter((current) => !symbolImportsToRemove.includes(current)),
      ...[...(addedImports.get(COMMON_HTTP) ?? [])].map((entry) => {
        return ts.factory.createImportSpecifier(
          false,
          undefined,
          ts.factory.createIdentifier(entry),
        );
      }),
    ]);
    changeTracker.replaceNode(commonHttpImports, newImports);
  }

  // Remove the HttpModules imports from common/http/testing
  const commonHttpTestingImports = getNamedImports(sourceFile, COMMON_HTTP_TESTING);
  if (commonHttpTestingImports) {
    const symbolImportsToRemove = getImportSpecifiers(sourceFile, COMMON_HTTP_TESTING, [
      ...HTTP_TESTING_MODULES,
    ]);

    const newHttpTestingImports = ts.factory.updateNamedImports(commonHttpTestingImports, [
      ...commonHttpTestingImports.elements.filter(
        (current) => !symbolImportsToRemove.includes(current),
      ),
      ...[...(addedImports.get(COMMON_HTTP_TESTING) ?? [])].map((entry) => {
        return ts.factory.createImportSpecifier(
          false,
          undefined,
          ts.factory.createIdentifier(entry),
        );
      }),
    ]);
    changeTracker.replaceNode(commonHttpTestingImports, newHttpTestingImports);
  }

  // Writing the changes
  for (const changesInFile of changeTracker.recordChanges().values()) {
    for (const change of changesInFile) {
      rewriteFn(change.start, change.removeLength ?? 0, change.text);
    }
  }
}

function migrateDecorator(
  decorator: NgDecorator,
  commonHttpIdentifiers: Set<string>,
  addedImports: Map<string, Set<string>>,
  changeTracker: ChangeTracker,
) {
  // Only @NgModule and @Component support `imports`.
  // Also skip decorators with no arguments.
  if (
    (decorator.name !== 'NgModule' && decorator.name !== 'Component') ||
    decorator.node.expression.arguments.length < 1
  ) {
    return;
  }

  // Does the decorator have any imports?
  const metadata = decorator.node.expression.arguments[0];
  if (!ts.isObjectLiteralExpression(metadata)) {
    return;
  }

  const moduleImports = getImportsProp(metadata);
  if (!moduleImports) {
    return;
  }

  // Does the decorator import any of the HTTP modules?
  const importedModules = getImportedHttpModules(moduleImports, commonHttpIdentifiers);
  if (!importedModules) {
    return;
  }

  const addedProviders = new Set<ts.CallExpression>();

  // Handle the different imported Http modules
  if (importedModules.client) {
    addedImports.get(COMMON_HTTP)?.add(WITH_INTERCEPTORS_FROM_DI);
    addedProviders.add(createCallExpression(WITH_INTERCEPTORS_FROM_DI));
  }
  if (importedModules.clientJsonp) {
    addedImports.get(COMMON_HTTP)?.add(WITH_JSONP_SUPPORT);
    addedProviders.add(createCallExpression(WITH_JSONP_SUPPORT));
  }
  if (importedModules.xsrf) {
    // HttpClientXsrfModule is the only module with Class methods.
    // They correspond to different provider functions
    if (importedModules.xsrfOptions === 'disable') {
      addedImports.get(COMMON_HTTP)?.add(WITH_NOXSRF_PROTECTION);
      addedProviders.add(createCallExpression(WITH_NOXSRF_PROTECTION));
    } else {
      addedImports.get(COMMON_HTTP)?.add(WITH_XSRF_CONFIGURATION);
      addedProviders.add(
        createCallExpression(
          WITH_XSRF_CONFIGURATION,
          importedModules.xsrfOptions?.options ? [importedModules.xsrfOptions.options] : [],
        ),
      );
    }
  }

  // Removing the imported Http modules from the imports list
  const newImports = ts.factory.createArrayLiteralExpression([
    ...moduleImports.elements.filter(
      (item) =>
        item !== importedModules.client &&
        item !== importedModules.clientJsonp &&
        item !== importedModules.xsrf,
    ),
  ]);

  // Adding the new providers
  addedImports.get(COMMON_HTTP)?.add(PROVIDE_HTTP_CLIENT);
  const providers = getProvidersFromLiteralExpr(metadata);
  const provideHttpExpr = createCallExpression(PROVIDE_HTTP_CLIENT, [...addedProviders]);

  let newProviders: ts.ArrayLiteralExpression;
  if (!providers) {
    // No existing providers, we add an property to the literal
    newProviders = ts.factory.createArrayLiteralExpression([provideHttpExpr]);
  } else {
    // We add the provider to the existing provider array
    newProviders = ts.factory.createArrayLiteralExpression([
      ...providers.elements,
      provideHttpExpr,
    ]);
  }

  // Replacing the existing decorator with the new one (with the new imports and providers)
  const newDecoratorArgs = ts.factory.createObjectLiteralExpression([
    ...metadata.properties.filter((p) => p.getText() === 'imports'),
    ts.factory.createPropertyAssignment('imports', newImports),
    ts.factory.createPropertyAssignment('providers', newProviders),
  ]);
  changeTracker.replaceNode(metadata, newDecoratorArgs);
}

function migrateTestingModuleImports(
  node: ts.Node,
  commonHttpTestingIdentifiers: Set<string>,
  addedImports: Map<string, Set<string>>,
  changeTracker: ChangeTracker,
) {
  // Look for calls to `TestBed.configureTestingModule` with at least one argument.
  // TODO: this won't work if `TestBed` is aliased or type cast.
  if (
    !ts.isCallExpression(node) ||
    node.arguments.length < 1 ||
    !ts.isPropertyAccessExpression(node.expression) ||
    !ts.isIdentifier(node.expression.expression) ||
    node.expression.expression.text !== 'TestBed' ||
    node.expression.name.text !== 'configureTestingModule'
  ) {
    return;
  }

  // Do we have any arguments for configureTestingModule ?
  const configureTestingModuleArgs = node.arguments[0];
  if (!ts.isObjectLiteralExpression(configureTestingModuleArgs)) {
    return;
  }

  // Do we have an imports property with an array ?
  const importsArray = getImportsProp(configureTestingModuleArgs);
  if (!importsArray) {
    return;
  }

  // Does the imports array contain the HttpClientTestingModule?
  const httpClientTesting = importsArray.elements.find(
    (elt) => elt.getText() === HTTP_CLIENT_TESTING_MODULE,
  );
  if (!httpClientTesting || !commonHttpTestingIdentifiers.has(HTTP_CLIENT_TESTING_MODULE)) {
    return;
  }

  addedImports.get(COMMON_HTTP_TESTING)?.add(PROVIDE_HTTP_CLIENT_TESTING);

  const newImports = ts.factory.createArrayLiteralExpression([
    ...importsArray.elements.filter((item) => item !== httpClientTesting),
  ]);

  const provideHttpClient = createCallExpression(PROVIDE_HTTP_CLIENT, [
    createCallExpression(WITH_INTERCEPTORS_FROM_DI),
  ]);
  const provideHttpClientTesting = createCallExpression(PROVIDE_HTTP_CLIENT_TESTING);

  // Adding the new providers
  const providers = getProvidersFromLiteralExpr(configureTestingModuleArgs);

  let newProviders: ts.ArrayLiteralExpression;
  if (!providers) {
    // No existing providers, we add an property to the literal
    newProviders = ts.factory.createArrayLiteralExpression([
      provideHttpClient,
      provideHttpClientTesting,
    ]);
  } else {
    // We add the provider to the existing provider array
    newProviders = ts.factory.createArrayLiteralExpression([
      ...providers.elements,
      provideHttpClient,
      provideHttpClientTesting,
    ]);
  }

  // Replacing the existing decorator with the new one (with the new imports and providers)
  const newTestingModuleArgs = ts.factory.createObjectLiteralExpression([
    ...configureTestingModuleArgs.properties.filter((p) => p.getText() === 'imports'),
    ts.factory.createPropertyAssignment('imports', newImports),
    ts.factory.createPropertyAssignment('providers', newProviders),
  ]);
  changeTracker.replaceNode(configureTestingModuleArgs, newTestingModuleArgs);
}

function getImportsProp(literal: ts.ObjectLiteralExpression) {
  const properties = literal.properties;
  const importProp = properties.find((property) => property.name?.getText() === 'imports');
  if (!importProp || !ts.hasOnlyExpressionInitializer(importProp)) {
    return null;
  }

  if (ts.isArrayLiteralExpression(importProp.initializer)) {
    return importProp.initializer;
  }

  return null;
}

function getProvidersFromLiteralExpr(literal: ts.ObjectLiteralExpression) {
  const properties = literal.properties;
  const providersProp = properties.find((property) => property.name?.getText() === 'providers');
  if (!providersProp || !ts.hasOnlyExpressionInitializer(providersProp)) {
    return null;
  }

  if (ts.isArrayLiteralExpression(providersProp.initializer)) {
    return providersProp.initializer;
  }

  return null;
}

function getImportedHttpModules(
  imports: ts.ArrayLiteralExpression,
  commonHttpIdentifiers: Set<string>,
) {
  let client: ts.Identifier | ts.CallExpression | null = null;
  let clientJsonp: ts.Identifier | ts.CallExpression | null = null;
  let xsrf: ts.Identifier | ts.CallExpression | null = null;

  // represents respectively:
  // HttpClientXsrfModule.disable()
  // HttpClientXsrfModule.withOptions(options)
  // base HttpClientXsrfModule
  let xsrfOptions: 'disable' | {options: ts.Expression} | null = null;

  // Handling the 3 http modules from @angular/common/http and skipping the rest
  for (const item of imports.elements) {
    if (ts.isIdentifier(item)) {
      const moduleName = item.getText();

      // We only care about the modules from @angular/common/http
      if (!commonHttpIdentifiers.has(moduleName)) {
        continue;
      }

      if (moduleName === HTTP_CLIENT_MODULE) {
        client = item;
      } else if (moduleName === HTTP_CLIENT_JSONP_MODULE) {
        clientJsonp = item;
      } else if (moduleName === HTTP_CLIENT_XSRF_MODULE) {
        xsrf = item;
      }
    } else if (ts.isCallExpression(item) && ts.isPropertyAccessExpression(item.expression)) {
      const moduleName = item.expression.expression.getText();

      // We only care about the modules from @angular/common/http
      if (!commonHttpIdentifiers.has(moduleName)) {
        continue;
      }

      if (moduleName === HTTP_CLIENT_XSRF_MODULE) {
        xsrf = item;
        if (item.expression.getText().includes('withOptions') && item.arguments.length === 1) {
          xsrfOptions = {options: item.arguments[0]};
        } else if (item.expression.getText().includes('disable')) {
          xsrfOptions = 'disable';
        }
      }
    }
  }

  if (client !== null || clientJsonp !== null || xsrf !== null) {
    return {client, clientJsonp, xsrf, xsrfOptions};
  }

  return null;
}

function createCallExpression(functionName: string, args: ts.Expression[] = []) {
  return ts.factory.createCallExpression(
    ts.factory.createIdentifier(functionName),
    undefined,
    args,
  );
}
