/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PluginItem} from '@babel/core';

export interface OptimizationOptions {
  enableLinker?: {
    ensureNoPartialDeclaration: boolean;
    filterPaths?: RegExp;
    linkerOptions?: object;
  };
  optimize?: {
    isSideEffectFree?: (absoluteDiskPath: string) => boolean;
  };
  downlevelAsyncGeneratorsIfPresent?: boolean;
}

export function createEsbuildAngularOptimizePlugin(opts: OptimizationOptions, additionalBabelPlugins?: PluginItem[]): Promise<any>