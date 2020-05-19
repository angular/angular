/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {Reference} from '../../imports';
import {ForeignFunctionResolver, PartialEvaluator, ResolvedValue} from '../../partial_evaluator';

import {NgModuleRawRouteData} from './analyzer';
import {entryPointKeyFor, RouterEntryPoint, RouterEntryPointManager} from './route';

const ROUTES_MARKER = '__ngRoutesMarker__';

export interface LazyRouteEntry {
  loadChildren: string;
  from: RouterEntryPoint;
  resolvedTo: RouterEntryPoint;
}

export function scanForCandidateTransitiveModules(
    expr: ts.Expression|null, evaluator: PartialEvaluator): string[] {
  if (expr === null) {
    return [];
  }

  const candidateModuleKeys: string[] = [];
  const entries = evaluator.evaluate(expr);

  function recursivelyAddModules(entry: ResolvedValue) {
    if (Array.isArray(entry)) {
      for (const e of entry) {
        recursivelyAddModules(e);
      }
    } else if (entry instanceof Map) {
      if (entry.has('ngModule')) {
        recursivelyAddModules(entry.get('ngModule')!);
      }
    } else if ((entry instanceof Reference) && hasIdentifier(entry.node)) {
      const filePath = entry.node.getSourceFile().fileName;
      const moduleName = entry.node.name.text;
      candidateModuleKeys.push(entryPointKeyFor(filePath, moduleName));
    }
  }

  recursivelyAddModules(entries);
  return candidateModuleKeys;
}

export function scanForRouteEntryPoints(
    ngModule: ts.SourceFile, moduleName: string, data: NgModuleRawRouteData,
    entryPointManager: RouterEntryPointManager, evaluator: PartialEvaluator): LazyRouteEntry[] {
  const loadChildrenIdentifiers: string[] = [];
  const from = entryPointManager.fromNgModule(ngModule, moduleName);
  if (data.providers !== null) {
    loadChildrenIdentifiers.push(...scanForProviders(data.providers, evaluator));
  }
  if (data.imports !== null) {
    loadChildrenIdentifiers.push(...scanForRouterModuleUsage(data.imports, evaluator));
  }
  if (data.exports !== null) {
    loadChildrenIdentifiers.push(...scanForRouterModuleUsage(data.exports, evaluator));
  }
  const routes: LazyRouteEntry[] = [];
  for (const loadChildren of loadChildrenIdentifiers) {
    const resolvedTo = entryPointManager.resolveLoadChildrenIdentifier(loadChildren, ngModule);
    if (resolvedTo !== null) {
      routes.push({
        loadChildren,
        from,
        resolvedTo,
      });
    }
  }
  return routes;
}

function scanForProviders(expr: ts.Expression, evaluator: PartialEvaluator): string[] {
  const loadChildrenIdentifiers: string[] = [];
  const providers = evaluator.evaluate(expr);

  function recursivelyAddProviders(provider: ResolvedValue): void {
    if (Array.isArray(provider)) {
      for (const entry of provider) {
        recursivelyAddProviders(entry);
      }
    } else if (provider instanceof Map) {
      if (provider.has('provide') && provider.has('useValue')) {
        const provide = provider.get('provide');
        const useValue = provider.get('useValue');
        if (isRouteToken(provide) && Array.isArray(useValue)) {
          loadChildrenIdentifiers.push(...scanForLazyRoutes(useValue));
        }
      }
    }
  }

  recursivelyAddProviders(providers);
  return loadChildrenIdentifiers;
}

function scanForRouterModuleUsage(expr: ts.Expression, evaluator: PartialEvaluator): string[] {
  const loadChildrenIdentifiers: string[] = [];
  const imports = evaluator.evaluate(expr, routerModuleFFR);

  function recursivelyAddRoutes(imp: ResolvedValue) {
    if (Array.isArray(imp)) {
      for (const entry of imp) {
        recursivelyAddRoutes(entry);
      }
    } else if (imp instanceof Map) {
      if (imp.has(ROUTES_MARKER) && imp.has('routes')) {
        const routes = imp.get('routes');
        if (Array.isArray(routes)) {
          loadChildrenIdentifiers.push(...scanForLazyRoutes(routes));
        }
      }
    }
  }

  recursivelyAddRoutes(imports);
  return loadChildrenIdentifiers;
}

function scanForLazyRoutes(routes: ResolvedValue[]): string[] {
  const loadChildrenIdentifiers: string[] = [];

  function recursivelyScanRoutes(routes: ResolvedValue[]): void {
    for (let route of routes) {
      if (!(route instanceof Map)) {
        continue;
      }
      if (route.has('loadChildren')) {
        const loadChildren = route.get('loadChildren');
        if (typeof loadChildren === 'string') {
          loadChildrenIdentifiers.push(loadChildren);
        }
      } else if (route.has('children')) {
        const children = route.get('children');
        if (Array.isArray(children)) {
          recursivelyScanRoutes(children);
        }
      }
    }
  }

  recursivelyScanRoutes(routes);
  return loadChildrenIdentifiers;
}

/**
 * A foreign function resolver that converts `RouterModule.forRoot/forChild(X)` to a special object
 * of the form `{__ngRoutesMarker__: true, routes: X}`.
 *
 * These objects are then recognizable inside the larger set of imports/exports.
 */
const routerModuleFFR: ForeignFunctionResolver =
    function routerModuleFFR(
        ref: Reference<ts.FunctionDeclaration|ts.MethodDeclaration|ts.FunctionExpression>,
        args: ReadonlyArray<ts.Expression>): ts.Expression|null {
  if (!isMethodNodeReference(ref) || !ts.isClassDeclaration(ref.node.parent)) {
    return null;
  } else if (
      ref.bestGuessOwningModule === null ||
      ref.bestGuessOwningModule.specifier !== '@angular/router') {
    return null;
  } else if (ref.node.parent.name === undefined || ref.node.parent.name.text !== 'RouterModule') {
    return null;
  } else if (
      !ts.isIdentifier(ref.node.name) ||
      (ref.node.name.text !== 'forRoot' && ref.node.name.text !== 'forChild')) {
    return null;
  }

  const routes = args[0];
  return ts.createObjectLiteral([
    ts.createPropertyAssignment(ROUTES_MARKER, ts.createTrue()),
    ts.createPropertyAssignment('routes', routes),
  ]);
};

function hasIdentifier(node: ts.Node): node is ts.Node&{name: ts.Identifier} {
  const node_ = node as ts.NamedDeclaration;
  return (node_.name !== undefined) && ts.isIdentifier(node_.name);
}

function isMethodNodeReference(
    ref: Reference<ts.FunctionDeclaration|ts.MethodDeclaration|ts.FunctionExpression>):
    ref is Reference<ts.MethodDeclaration> {
  return ts.isMethodDeclaration(ref.node);
}

function isRouteToken(ref: ResolvedValue): boolean {
  return ref instanceof Reference && ref.bestGuessOwningModule !== null &&
      ref.bestGuessOwningModule.specifier === '@angular/router' && ref.debugName === 'ROUTES';
}
