/**
 * @license
 * Copyright Google LLC All Rights Reserved.
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
   * Converts a file path to a module name that can be used as an `import.
   * I.e. `path/to/importedFile.ts` should be imported by `path/to/containingFile.ts`.
   *
   * See ImportResolver.
   */
  fileNameToModuleName(importedFilePath: string, containingFilePath: string): string;
  /**
   * Converts a path that refers to a resource into an absolute filePath
   * that can be later on used for loading the resource via `loadResource.
   */
  resourceNameToFileName(resourceName: string, containingFileName: string): string|null;
  /**
   * Loads a resource (e.g. html / css)
   */
  loadResource(path: string): Promise<string>|string;
}
