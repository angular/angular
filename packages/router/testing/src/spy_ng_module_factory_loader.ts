/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Compiler, Injectable, NgModuleFactory, NgModuleFactoryLoader} from '@angular/core';

@Injectable()
export class SpyNgModuleFactoryLoader implements NgModuleFactoryLoader {
  /**
   * @docsNotRequired
   */
  private _stubbedModules: {[path: string]: Promise<NgModuleFactory<any>>|undefined} = {};

  /**
   * @docsNotRequired
   */
  set stubbedModules(modules: {[path: string]: any}) {
    const res: {[path: string]: any} = {};
    for (const t of Object.keys(modules)) {
      res[t] = this.compiler.compileModuleAsync(modules[t]);
    }
    this._stubbedModules = res;
  }

  /**
   * @docsNotRequired
   */
  get stubbedModules(): {[path: string]: any} {
    return this._stubbedModules;
  }

  constructor(private compiler: Compiler) {}

  load(path: string): Promise<NgModuleFactory<any>> {
    if (this._stubbedModules[path]) {
      return this._stubbedModules[path]!;
    } else {
      return <any>Promise.reject(new Error(`Cannot find module ${path}`));
    }
  }
}
