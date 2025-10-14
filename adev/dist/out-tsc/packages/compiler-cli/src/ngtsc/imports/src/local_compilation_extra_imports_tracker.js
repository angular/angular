/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import ts from 'typescript';
import {getContainingImportDeclaration} from '../../reflection/src/typescript';
/**
 * A tool to track extra imports to be added to the generated files in the local compilation mode.
 *
 * This is needed for g3 bundling mechanism which requires dev files (= locally compiled) to have
 * imports resemble those generated for prod files (= full compilation mode). In full compilation
 * mode Angular compiler generates extra imports for statically analyzed component dependencies. We
 * need similar imports in local compilation as well.
 *
 * The tool offers API for adding local imports (to be added to a specific file) and global imports
 * (to be added to all the files in the local compilation). For more details on how these extra
 * imports are determined see this design doc:
 * https://docs.google.com/document/d/1dOWoSDvOY9ozlMmyCnxoFLEzGgHmTFVRAOVdVU-bxlI/edit?tab=t.0#heading=h.5n3k516r57g5
 *
 * An instance of this class will be passed to each annotation handler so that they can register the
 * extra imports that they see fit. Later on, the instance is passed to the Ivy transformer ({@link
 * ivyTransformFactory}) and it is used to add the extra imports registered by the handlers to the
 * import manager ({@link ImportManager}) in order to have these imports generated.
 *
 * The extra imports are all side effect imports, and so they are identified by a single string
 * containing the module name.
 *
 */
export class LocalCompilationExtraImportsTracker {
  typeChecker;
  localImportsMap = new Map();
  globalImportsSet = new Set();
  /** Names of the files marked for extra import generation. */
  markedFilesSet = new Set();
  constructor(typeChecker) {
    this.typeChecker = typeChecker;
  }
  /**
   * Marks the source file for extra imports generation.
   *
   * The extra imports are generated only for the files marked through this method. In other words,
   * the method {@link getImportsForFile} returns empty if the file is not marked. This allows the
   * consumers of this tool to avoid generating extra imports for unrelated files (e.g., non-Angular
   * files)
   */
  markFileForExtraImportGeneration(sf) {
    this.markedFilesSet.add(sf.fileName);
  }
  /**
   * Adds an extra import to be added to the generated file of a specific source file.
   */
  addImportForFile(sf, moduleName) {
    if (!this.localImportsMap.has(sf.fileName)) {
      this.localImportsMap.set(sf.fileName, new Set());
    }
    this.localImportsMap.get(sf.fileName).add(moduleName);
  }
  /**
   * If the given node is an imported identifier, this method adds the module from which it is
   * imported as an extra import to the generated file of each source file in the compilation unit,
   * otherwise the method is noop.
   *
   * Adding an extra import to all files is not optimal though. There are rooms to optimize and a
   * add the import to a subset of files (e.g., exclude all the non Angular files as they don't need
   * any extra import). However for this first version of this feature we go by this mechanism for
   * simplicity. There will be on-going work to further optimize this method to add the extra import
   * to smallest possible candidate files instead of all files.
   */
  addGlobalImportFromIdentifier(node) {
    let identifier = null;
    if (ts.isIdentifier(node)) {
      identifier = node;
    } else if (ts.isPropertyAccessExpression(node) && ts.isIdentifier(node.expression)) {
      identifier = node.expression;
    }
    if (identifier === null) {
      return;
    }
    const sym = this.typeChecker.getSymbolAtLocation(identifier);
    if (!sym?.declarations?.length) {
      return;
    }
    const importClause = sym.declarations[0];
    const decl = getContainingImportDeclaration(importClause);
    if (decl !== null) {
      this.globalImportsSet.add(removeQuotations(decl.moduleSpecifier.getText()));
    }
  }
  /**
   * Returns the list of all module names that the given file should include as its extra imports.
   */
  getImportsForFile(sf) {
    if (!this.markedFilesSet.has(sf.fileName)) {
      return [];
    }
    return [...this.globalImportsSet, ...(this.localImportsMap.get(sf.fileName) ?? [])];
  }
}
function removeQuotations(s) {
  return s.substring(1, s.length - 1).trim();
}
//# sourceMappingURL=local_compilation_extra_imports_tracker.js.map
