/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {ModuleResolver} from '../../imports';
import {PartialEvaluator} from '../../partial_evaluator';

import {scanForRouteEntryPoints} from './lazy';
import {RouterEntryPointManager} from './route';

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
    const key = `${sourceFile.fileName}#${moduleName}`;
    if (this.modules.has(key)) {
      throw new Error(`Double route analyzing ${key}`);
    }
    this.modules.set(
        key, {
                 sourceFile, moduleName, imports, exports, providers,
             });
  }

  listLazyRoutes(): LazyRoute[] {
    const routes: LazyRoute[] = [];
    for (const key of Array.from(this.modules.keys())) {
      const data = this.modules.get(key) !;
      const entryPoints = scanForRouteEntryPoints(
          data.sourceFile, data.moduleName, data, this.entryPointManager, this.evaluator);
      routes.push(...entryPoints.map(entryPoint => ({
                                       route: entryPoint.loadChildren,
                                       module: entryPoint.from,
                                       referencedModule: entryPoint.resolvedTo,
                                     })));
    }
    return routes;
  }
}
