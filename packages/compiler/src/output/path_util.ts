/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {StaticSymbol} from '../aot/static_symbol';

/**
 * Interface that defines how import statements should be generated.
 */
export abstract class ImportResolver {
  /**
   * Converts a file path to a module name that can be used as an `import.
   * I.e. `path/to/importedFile.ts` should be imported by `path/to/containingFile.ts`.
   */
  abstract fileNameToModuleName(importedFilePath: string, containingFilePath: string): string|null;

  /**
   * Converts the given StaticSymbol into another StaticSymbol that should be used
   * to generate the import from.
   */
  abstract getImportAs(symbol: StaticSymbol): StaticSymbol|null;

  /**
   * Determine the arity of a type.
   */
  abstract getTypeArity(symbol: StaticSymbol): number|null;
}
