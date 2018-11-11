/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

/**
 * A bundle represents the currently compiled entry point format, containing
 * information that is necessary for compiling @angular/core with ngcc.
 */
export interface BundleInfo {
  isCore: boolean;
  isFlat: boolean;
  rewriteCoreImportsTo: ts.SourceFile|null;
  rewriteCoreDtsImportsTo: ts.SourceFile|null;
}

export function createBundleInfo(
    isCore: boolean, rewriteCoreImportsTo: ts.SourceFile | null,
    rewriteCoreDtsImportsTo: ts.SourceFile | null): BundleInfo {
  return {
    isCore,
    isFlat: rewriteCoreImportsTo === null,
    rewriteCoreImportsTo: rewriteCoreImportsTo,
    rewriteCoreDtsImportsTo: rewriteCoreDtsImportsTo,
  };
}
