/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {StaticSymbolResolverHost} from './static_symbol_resolver';
import {AotSummaryResolverHost} from './summary_resolver';

/**
 * The host of the AotCompiler disconnects the implementation from TypeScript / other language
 * services and from underlying file systems.
 */
export interface AotCompilerHost extends StaticSymbolResolverHost, AotSummaryResolverHost {
  /**
   * Loads a resource (e.g. html / css)
   */
  loadResource(path: string): Promise<string>;
}
