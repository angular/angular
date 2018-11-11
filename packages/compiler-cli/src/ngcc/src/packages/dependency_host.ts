/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as path from 'canonical-path';
import * as fs from 'fs';
import * as ts from 'typescript';

/**
 * Helper functions for computing dependencies.
 */
export class DependencyHost {
  /**
   * Get a list of the resolved paths to all the dependencies of this entry point.
   * @param from An absolute path to the file whose dependencies we want to get.
   * @param resolved A set that will have the absolute paths of resolved entry points added to it.
   * @param missing A set that will have the dependencies that could not be found added to it.
   * @param deepImports A set that will have the import paths that exist but cannot be mapped to
   * entry-points, i.e. deep-imports.
   * @param internal A set that is used to track internal dependencies to prevent getting stuck in a
   * circular dependency loop.
   */
  computeDependencies(
      from: string, resolved: Set<string>, missing: Set<string>, deepImports: Set<string>,
      internal: Set<string> = new Set()): void {
    const fromContents = fs.readFileSync(from, 'utf8');
    if (!this.hasImportOrReeportStatements(fromContents)) {
      return;
    }

    // Parse the source into a TypeScript AST and then walk it looking for imports and re-exports.
    const sf =
        ts.createSourceFile(from, fromContents, ts.ScriptTarget.ES2015, false, ts.ScriptKind.JS);
    sf.statements
        // filter out statements that are not imports or reexports
        .filter(this.isStringImportOrReexport)
        // Grab the id of the module that is being imported
        .map(stmt => stmt.moduleSpecifier.text)
        // Resolve this module id into an absolute path
        .forEach(importPath => {
          if (importPath.startsWith('.')) {
            // This is an internal import so follow it
            const internalDependency = this.resolveInternal(from, importPath);
            // Avoid circular dependencies
            if (!internal.has(internalDependency)) {
              internal.add(internalDependency);
              this.computeDependencies(
                  internalDependency, resolved, missing, deepImports, internal);
            }
          } else {
            const resolvedEntryPoint = this.tryResolveEntryPoint(from, importPath);
            if (resolvedEntryPoint !== null) {
              resolved.add(resolvedEntryPoint);
            } else {
              // If the import could not be resolved as entry point, it either does not exist
              // at all or is a deep import.
              const deeplyImportedFile = this.tryResolve(from, importPath);
              if (deeplyImportedFile !== null) {
                deepImports.add(importPath);
              } else {
                missing.add(importPath);
              }
            }
          }
        });
  }

  /**
   * Resolve an internal module import.
   * @param from the absolute file path from where to start trying to resolve this module
   * @param to the module specifier of the internal dependency to resolve
   * @returns the resolved path to the import.
   */
  resolveInternal(from: string, to: string): string {
    const fromDirectory = path.dirname(from);
    // `fromDirectory` is absolute so we don't need to worry about telling `require.resolve`
    // about it - unlike `tryResolve` below.
    return require.resolve(path.resolve(fromDirectory, to));
  }

  /**
   * We don't want to resolve external dependencies directly because if it is a path to a
   * sub-entry-point (e.g. @angular/animations/browser rather than @angular/animations)
   * then `require.resolve()` may return a path to a UMD bundle, which may actually live
   * in the folder containing the sub-entry-point
   * (e.g. @angular/animations/bundles/animations-browser.umd.js).
   *
   * Instead we try to resolve it as a package, which is what we would need anyway for it to be
   * compilable by ngcc.
   *
   * If `to` is actually a path to a file then this will fail, which is what we want.
   *
   * @param from the file path from where to start trying to resolve this module
   * @param to the module specifier of the dependency to resolve
   * @returns the resolved path to the entry point directory of the import or null
   * if it cannot be resolved.
   */
  tryResolveEntryPoint(from: string, to: string): string|null {
    const entryPoint = this.tryResolve(from, `${to}/package.json`);
    return entryPoint && path.dirname(entryPoint);
  }

  /**
   * Resolve the absolute path of a module from a particular starting point.
   *
   * @param from the file path from where to start trying to resolve this module
   * @param to the module specifier of the dependency to resolve
   * @returns an absolute path to the entry-point of the dependency or null if it could not be
   * resolved.
   */
  tryResolve(from: string, to: string): string|null {
    try {
      return require.resolve(to, {paths: [from]});
    } catch (e) {
      return null;
    }
  }

  /**
   * Check whether the given statement is an import with a string literal module specifier.
   * @param stmt the statement node to check.
   * @returns true if the statement is an import with a string literal module specifier.
   */
  isStringImportOrReexport(stmt: ts.Statement): stmt is ts.ImportDeclaration&
      {moduleSpecifier: ts.StringLiteral} {
    return ts.isImportDeclaration(stmt) ||
        ts.isExportDeclaration(stmt) && !!stmt.moduleSpecifier &&
        ts.isStringLiteral(stmt.moduleSpecifier);
  }

  /**
   * Check whether a source file needs to be parsed for imports.
   * This is a performance short-circuit, which saves us from creating
   * a TypeScript AST unnecessarily.
   *
   * @param source The content of the source file to check.
   *
   * @returns false if there are definitely no import or re-export statements
   * in this file, true otherwise.
   */
  hasImportOrReeportStatements(source: string): boolean {
    return /(import|export)\s.+from/.test(source);
  }
}
