/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export interface OptimizationOptions {
  optimize?: {
    isSideEffectFree?: (absoluteDiskPath: string) => boolean;
  };
  enableLinker?: boolean;
}

export function createEsbuildAngularOptimizePlugin(opts: OptimizationOptions): Promise<any>