/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {ModuleResolver} from '../../imports';
import {PartialEvaluator} from '../../partial_evaluator';

import {scanForCandidateTransitiveModules, scanForRouteEntryPoints} from './lazy';
import {entryPointKeyFor, RouterEntryPointManager} from './route';

export interface NgModuleRawRouteData {
  sourceFile: ts.SourceFile;
  moduleName: string;
  imports: ts.Expression|null;
  exports: ts.Expression|null;
  providers: ts.Expression|null;
}

export interface LazyRoute {
  route: string;
  module: {name: string, filePath: string};
  referencedModule: {name: string, filePath: string};
}

export class NgModuleRouteAnalyzer {
  private modules = new Map<string, NgModuleRawRouteData>();
  private entryPointManager: RouterEntryPointManager;

  constructor(moduleResolver: ModuleResolver, private evaluator: PartialEvaluator) {
    this.entryPointManager = new RouterEntryPointManager(moduleResolver);
  }

  add(sourceFile: ts.SourceFile, moduleName: string, imports: ts.Expression|null,
      exports: ts.Expression|null, providers: ts.Expression|null): void {
    const key = entryPointKeyFor(sourceFile.fileName, moduleName);
    if (this.modules.has(key)) {
      throw new Error(`Double route analyzing for '${key}'.`);
    }
    this.modules.set(key, {
      sourceFile,
      moduleName,
      imports,
      exports,
      providers,
    });
  }

  listLazyRoutes(entryModuleKey?: string|undefined): LazyRoute[] {
    if ((entryModuleKey !== undefined) && !this.modules.has(entryModuleKey)) {
      throw new Error(`Failed to list lazy routes: Unknown module '${entryModuleKey}'.`);
    }

    const routes: LazyRoute[] = [];
    const scannedModuleKeys = new Set<string>();
    const pendingModuleKeys = entryModuleKey ? [entryModuleKey] : Array.from(this.modules.keys());

    // When listing lazy routes for a specific entry module, we need to recursively extract
    // "transitive" routes from imported/exported modules. This is not necessary when listing all
    // lazy routes, because all analyzed modules will be scanned anyway.
    const scanRecursively = entryModuleKey !== undefined;

    while (pendingModuleKeys.length > 0) {
      const key = pendingModuleKeys.pop()!;

      if (scannedModuleKeys.has(key)) {
        continue;
      } else {
        scannedModuleKeys.add(key);
      }

      const data = this.modules.get(key)!;
      const entryPoints = scanForRouteEntryPoints(
          data.sourceFile, data.moduleName, data, this.entryPointManager, this.evaluator);

      routes.push(...entryPoints.map(entryPoint => ({
                                       route: entryPoint.loadChildren,
                                       module: entryPoint.from,
                                       referencedModule: entryPoint.resolvedTo,
                                     })));

      if (scanRecursively) {
        pendingModuleKeys.push(
            ...[
                // Scan the retrieved lazy route entry points.
                ...entryPoints.map(
                    ({resolvedTo}) => entryPointKeyFor(resolvedTo.filePath, resolvedTo.moduleName)),
                // Scan the current module's imported modules.
                ...scanForCandidateTransitiveModules(data.imports, this.evaluator),
                // Scan the current module's exported modules.
                ...scanForCandidateTransitiveModules(data.exports, this.evaluator),
        ].filter(key => this.modules.has(key)));
      }
    }

    return routes;
  }
}
