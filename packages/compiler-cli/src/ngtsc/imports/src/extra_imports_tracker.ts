/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';


/**
 * A tool to track extra imports to be added to the generated files. This is mainly to be used in
 * the local compilation mode inb order to generate extra imports which resemble those generated in
 * full compilation mode for component dependencies.
 *
 * An instance of this class will be passed to each annotation handler so that they can register the
 * extra imports that they see fit. Later on, the instance is passed to the Ivy transformer ({@link
 * ivyTransformFactory}) and it is used to add the extra imports registered by the handlers to the
 * import manager ({@link ImportManager}) in order to have these imports generated.
 *
 * The extra imports are all side effect imports, and so they are identified by a single string
 * containing the module name.
 *
 * The tool offers API for adding local imports (to be added to a specific file) and global imports
 * (to be added to all the files in the local compilation)
 */
export class ExtraImportsTracker {
  /**
   * Adds an extra import to be added to the generated file of a specific source file.
   */
  addImportForFile(sf: ts.SourceFile, moduleName: string): void {
    // TODO(pmvald): Implement this method.
  }

  /**
   * If the given node is an imported identifier, this method adds the module from which it is
   * imported as an extra import to the generated file of each source file in the compilation unit,
   * otherwise the method is noop.
   */
  addGlobalImportFromIdentifier(node: ts.Node): void {
    // TODO(pmvald): Implement this method.
  }

  /**
   * Returns the list of all module names that the given file should include as its extra imports.
   */
  getImportsForFile(sf: ts.SourceFile): string[] {
    // TODO(pmvald): Implement this method.
    return [];
  }
}
