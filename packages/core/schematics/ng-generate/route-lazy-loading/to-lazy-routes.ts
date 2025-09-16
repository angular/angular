/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {
  ReflectionHost,
  TypeScriptReflectionHost,
} from '@angular/compiler-cli/src/ngtsc/reflection/index';
import {ChangeTracker, PendingChange} from '../../utils/change_tracker';

import {findClassDeclaration} from '../../utils/typescript/class_declaration';
import {findLiteralProperty} from '../../utils/typescript/property_name';
import {
  isAngularRoutesArray,
  isProvideRoutesCallExpression,
  isRouterCallExpression,
  isRouterModuleCallExpression,
  isRouterProviderCallExpression,
  isStandaloneComponent,
} from './util';

interface RouteData {
  routeFilePath: string;
  routeFileImports: ts.ImportDeclaration[];
  array: ts.ArrayLiteralExpression;
}

export interface RouteMigrationData {
  path: string;
  file: string;
}

/**
 * Converts all application routes that are using standalone components to be lazy loaded.
 * @param sourceFile File that should be migrated.
 * @param program
 */
export function migrateFileToLazyRoutes(
  sourceFile: ts.SourceFile,
  program: ts.Program,
): {
  pendingChanges: PendingChange[];
  migratedRoutes: RouteMigrationData[];
  skippedRoutes: RouteMigrationData[];
} {
  const typeChecker = program.getTypeChecker();
  const reflector = new TypeScriptReflectionHost(typeChecker);
  const printer = ts.createPrinter();
  const tracker = new ChangeTracker(printer);

  const routeArraysToMigrate = findRoutesArrayToMigrate(sourceFile, typeChecker);

  if (routeArraysToMigrate.length === 0) {
    return {pendingChanges: [], skippedRoutes: [], migratedRoutes: []};
  }

  const {skippedRoutes, migratedRoutes} = migrateRoutesArray(
    routeArraysToMigrate,
    typeChecker,
    reflector,
    tracker,
  );

  return {
    pendingChanges: tracker.recordChanges().get(sourceFile) || [],
    skippedRoutes,
    migratedRoutes,
  };
}

/** Finds route object that can be migrated */
function findRoutesArrayToMigrate(sourceFile: ts.SourceFile, typeChecker: ts.TypeChecker) {
  const routesArrays: RouteData[] = [];

  sourceFile.forEachChild(function walk(node) {
    if (ts.isCallExpression(node)) {
      if (
        isRouterModuleCallExpression(node, typeChecker) ||
        isRouterProviderCallExpression(node, typeChecker) ||
        isRouterCallExpression(node, typeChecker) ||
        isProvideRoutesCallExpression(node, typeChecker)
      ) {
        const arg = node.arguments[0]; // ex: RouterModule.forRoot(routes) or provideRouter(routes)
        const routeFileImports = sourceFile.statements.filter(ts.isImportDeclaration);

        if (ts.isArrayLiteralExpression(arg) && arg.elements.length > 0) {
          // ex: inline routes array: RouterModule.forRoot([{ path: 'test', component: TestComponent }])
          routesArrays.push({
            routeFilePath: sourceFile.fileName,
            array: arg as ts.ArrayLiteralExpression,
            routeFileImports,
          });
        } else if (ts.isIdentifier(arg)) {
          // ex: reference to routes array: RouterModule.forRoot(routes)
          // RouterModule.forRoot(routes), provideRouter(routes), provideRoutes(routes)
          const symbol = typeChecker.getSymbolAtLocation(arg);
          if (!symbol?.declarations) return;

          for (const declaration of symbol.declarations) {
            if (ts.isVariableDeclaration(declaration)) {
              const initializer = declaration.initializer;
              if (initializer && ts.isArrayLiteralExpression(initializer)) {
                // ex: const routes = [{ path: 'test', component: TestComponent }];
                routesArrays.push({
                  routeFilePath: sourceFile.fileName,
                  array: initializer,
                  routeFileImports,
                });
              }
            }
          }
        }
      }
    } else if (ts.isVariableDeclaration(node)) {
      if (isAngularRoutesArray(node, typeChecker)) {
        const initializer = node.initializer;
        if (
          initializer &&
          ts.isArrayLiteralExpression(initializer) &&
          initializer.elements.length > 0
        ) {
          // ex: const routes: Routes = [{ path: 'test', component: TestComponent }];
          if (routesArrays.find((x) => x.array === initializer)) {
            // already exists
            return;
          }

          routesArrays.push({
            routeFilePath: sourceFile.fileName,
            array: initializer,
            routeFileImports: sourceFile.statements.filter(ts.isImportDeclaration),
          });
        }
      }
    } else if (ts.isExportAssignment(node)) {
      // Handles `export default routes`, `export default [...]` and `export default [...] as Routes`
      let expression = node.expression;

      if (ts.isAsExpression(expression)) {
        expression = expression.expression;
      }

      if (ts.isArrayLiteralExpression(expression)) {
        routesArrays.push({
          routeFilePath: sourceFile.fileName,
          array: expression,
          routeFileImports: sourceFile.statements.filter(ts.isImportDeclaration),
        });
      } else if (ts.isIdentifier(expression)) {
        manageRoutesExportedByDefault(routesArrays, typeChecker, expression, sourceFile);
      }
    } else if (ts.isExportDeclaration(node)) {
      // Handles cases like `export { routes as default }`
      if (node.exportClause && ts.isNamedExports(node.exportClause)) {
        for (const specifier of node.exportClause.elements) {
          if (specifier.name.text === 'default') {
            manageRoutesExportedByDefault(
              routesArrays,
              typeChecker,
              specifier.propertyName ?? specifier.name,
              sourceFile,
            );
          }
        }
      }
    }

    node.forEachChild(walk);
  });

  return routesArrays;
}

/** Migrate a routes object standalone components to be lazy loaded. */
function migrateRoutesArray(
  routesArray: RouteData[],
  typeChecker: ts.TypeChecker,
  reflector: ReflectionHost,
  tracker: ChangeTracker,
): {migratedRoutes: RouteMigrationData[]; skippedRoutes: RouteMigrationData[]} {
  const migratedRoutes: RouteMigrationData[] = [];
  const skippedRoutes: RouteMigrationData[] = [];
  const importsToRemove: ts.ImportDeclaration[] = [];

  for (const route of routesArray) {
    route.array.elements.forEach((element) => {
      if (ts.isObjectLiteralExpression(element)) {
        const {
          migratedRoutes: migrated,
          skippedRoutes: toBeSkipped,
          importsToRemove: toBeRemoved,
        } = migrateRoute(element, route, typeChecker, reflector, tracker);
        migratedRoutes.push(...migrated);
        skippedRoutes.push(...toBeSkipped);
        importsToRemove.push(...toBeRemoved);
      }
    });
  }

  for (const importToRemove of importsToRemove) {
    tracker.removeNode(importToRemove);
  }

  return {migratedRoutes, skippedRoutes};
}

/**
 * Migrates a single route object and returns the results of the migration
 * It recursively migrates the children routes if they exist
 */
function migrateRoute(
  element: ts.ObjectLiteralExpression,
  route: RouteData,
  typeChecker: ts.TypeChecker,
  reflector: ReflectionHost,
  tracker: ChangeTracker,
): {
  migratedRoutes: RouteMigrationData[];
  skippedRoutes: RouteMigrationData[];
  importsToRemove: ts.ImportDeclaration[];
} {
  const skippedRoutes: RouteMigrationData[] = [];
  const migratedRoutes: RouteMigrationData[] = [];
  const importsToRemove: ts.ImportDeclaration[] = [];

  const component = findLiteralProperty(element, 'component');

  // this can be empty string or a variable that is not a string, or not present at all
  const routePath = findLiteralProperty(element, 'path')?.getText() ?? '';

  const children = findLiteralProperty(element, 'children') as ts.PropertyAssignment | undefined;

  // recursively migrate children routes first if they exist
  if (children && ts.isArrayLiteralExpression(children.initializer)) {
    for (const childRoute of children.initializer.elements) {
      if (ts.isObjectLiteralExpression(childRoute)) {
        const {
          migratedRoutes: migrated,
          skippedRoutes: toBeSkipped,
          importsToRemove: toBeRemoved,
        } = migrateRoute(childRoute, route, typeChecker, reflector, tracker);
        migratedRoutes.push(...migrated);
        skippedRoutes.push(...toBeSkipped);
        importsToRemove.push(...toBeRemoved);
      }
    }
  }

  const routeMigrationResults = {migratedRoutes, skippedRoutes, importsToRemove};

  if (!component) {
    return routeMigrationResults;
  }

  const componentDeclaration = findClassDeclaration(component, typeChecker);

  if (!componentDeclaration) {
    return routeMigrationResults;
  }

  // if component is not a standalone component, skip it
  if (!isStandaloneComponent(componentDeclaration, reflector)) {
    skippedRoutes.push({path: routePath, file: route.routeFilePath});
    return routeMigrationResults;
  }

  const componentClassName =
    componentDeclaration.name && ts.isIdentifier(componentDeclaration.name)
      ? componentDeclaration.name.text
      : null;
  if (!componentClassName) {
    return routeMigrationResults;
  }

  // if component is in the same file as the routes array, skip it
  if (componentDeclaration.getSourceFile().fileName === route.routeFilePath) {
    return routeMigrationResults;
  }

  const componentImport = route.routeFileImports.find((importDecl) =>
    importDecl.importClause?.getText().includes(componentClassName),
  )!;

  // remove single and double quotes from the import path
  let componentImportPath = ts.isStringLiteral(componentImport?.moduleSpecifier)
    ? componentImport.moduleSpecifier.text
    : null;

  // if the import path is not a string literal, skip it
  if (!componentImportPath) {
    skippedRoutes.push({path: routePath, file: route.routeFilePath});
    return routeMigrationResults;
  }

  const isDefaultExport =
    componentDeclaration.modifiers?.some((x) => x.kind === ts.SyntaxKind.DefaultKeyword) ?? false;

  const loadComponent = createLoadComponentPropertyAssignment(
    componentImportPath,
    componentClassName,
    isDefaultExport,
  );

  tracker.replaceNode(component, loadComponent);
  // Add the import statement for the standalone component
  if (!importsToRemove.includes(componentImport)) {
    importsToRemove.push(componentImport);
  }
  migratedRoutes.push({path: routePath, file: route.routeFilePath});

  // the component was migrated, so we return the results
  return routeMigrationResults;
}

/**
 * Generates the loadComponent property assignment for a given component.
 *
 * Example:
 * loadComponent: () => import('./path').then(m => m.componentName)
 * or
 * loadComponent: () => import('./path') // when isDefaultExport is true
 */
function createLoadComponentPropertyAssignment(
  componentImportPath: string,
  componentDeclarationName: string,
  isDefaultExport: boolean,
) {
  return ts.factory.createPropertyAssignment(
    'loadComponent',
    ts.factory.createArrowFunction(
      undefined,
      undefined,
      [],
      undefined,
      ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
      isDefaultExport
        ? createImportCallExpression(componentImportPath) // will generate import('./path) and will skip the then() call
        : ts.factory.createCallExpression(
            // will generate import('./path).then(m => m.componentName)
            ts.factory.createPropertyAccessExpression(
              createImportCallExpression(componentImportPath),
              'then',
            ),
            undefined,
            [createImportThenCallExpression(componentDeclarationName)],
          ),
    ),
  );
}

const manageRoutesExportedByDefault = (
  routesArrays: RouteData[],
  typeChecker: ts.TypeChecker,
  expression: ts.Expression,
  sourceFile: ts.SourceFile,
) => {
  const symbol = typeChecker.getSymbolAtLocation(expression);
  if (!symbol?.declarations) {
    return;
  }
  for (const declaration of symbol.declarations) {
    if (
      ts.isVariableDeclaration(declaration) &&
      declaration.initializer &&
      ts.isArrayLiteralExpression(declaration.initializer)
    ) {
      routesArrays.push({
        routeFilePath: sourceFile.fileName,
        array: declaration.initializer,
        routeFileImports: sourceFile.statements.filter(ts.isImportDeclaration),
      });
    }
  }
};

// import('./path)
const createImportCallExpression = (componentImportPath: string) =>
  ts.factory.createCallExpression(ts.factory.createIdentifier('import'), undefined, [
    ts.factory.createStringLiteral(componentImportPath, true),
  ]);

// m => m.componentName
const createImportThenCallExpression = (componentDeclarationName: string) =>
  ts.factory.createArrowFunction(
    undefined,
    undefined,
    [ts.factory.createParameterDeclaration(undefined, undefined, 'm', undefined, undefined)],
    undefined,
    ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
    ts.factory.createPropertyAccessExpression(
      ts.factory.createIdentifier('m'),
      componentDeclarationName,
    ),
  );
