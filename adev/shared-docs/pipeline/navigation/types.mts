/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * `NavigationItem` generation strategy
 */
export type NavigationItemGenerationStrategy = {
  /** App route path prefix. */
  pathPrefix: string;
  /** Content path where the source files are kept. */
  contentPath: string;
  /** Page/route label generator function. */
  labelGeneratorFn: (fileName: string, firstLine: string) => string;
};

/** Strategy for navigation item generation. */
export type Strategy = 'errors' | 'extended-diagnostics';
