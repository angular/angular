/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * A request to import a given symbol from the given module.
 */
export interface ImportRequest<TFile> {
  /**
   * Name of the export to be imported.
   * May be `null` if a namespace import is requested.
   */
  exportSymbolName: string | null;

  /**
   * Module specifier to be imported.
   * May be a module name, or a file-relative path.
   */
  exportModuleSpecifier: string;

  /**
   * File for which the import is requested for. This may
   * be used by import generators to re-use existing imports.
   *
   * Import managers may also allow this to be nullable if
   * imports are never re-used. E.g. in the linker generator.
   */
  requestedFile: TFile;

  /**
   * Specifies an alias under which the symbol can be referenced within
   * the file (e.g. `import { symbol as alias } from 'module'`).
   *
   * !!!Warning!!! passing in this alias is considered unsafe, because the import manager won't
   * try to avoid conflicts with existing identifiers in the file if it is specified. As such,
   * this option should only be used if the caller has verified that the alias won't conflict
   * with anything in the file.
   */
  unsafeAliasOverride?: string;
}

/**
 * Generate import information based on the context of the code being generated.
 *
 * Implementations of these methods return a specific identifier that corresponds to the imported
 * module.
 */
export interface ImportGenerator<TFile, TExpression> {
  addImport(request: ImportRequest<TFile>): TExpression;
}
