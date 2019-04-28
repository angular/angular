/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as fs from 'fs';
import * as ts from 'typescript';

import {AbsoluteFsPath} from '../../../src/ngtsc/path';

import {ModuleResolver, ResolvedDeepImport, ResolvedRelativeModule} from './module_resolver';



/**
 * Helper functions for computing dependencies.
 */
export class DependencyHost {
  constructor(private moduleResolver: ModuleResolver) {}
  /**
   * Get a list of the resolved paths to all the dependencies of this entry point.
   * @param from An absolute path to the file whose dependencies we want to get.
   * @param dependencies A set that will have the absolute paths of resolved entry points added to
   * it.
   * @param missing A set that will have the dependencies that could not be found added to it.
   * @param deepImports A set that will have the import paths that exist but cannot be mapped to
   * entry-points, i.e. deep-imports.
   * @param alreadySeen A set that is used to track internal dependencies to prevent getting stuck
   * in a
   * circular dependency loop.
   */
  computeDependencies(
      from: AbsoluteFsPath, dependencies: Set<AbsoluteFsPath> = new Set(),
      missing: Set<string> = new Set(), deepImports: Set<string> = new Set(),
      alreadySeen: Set<AbsoluteFsPath> = new Set()):
      {dependencies: Set<AbsoluteFsPath>, missing: Set<string>, deepImports: Set<string>} {
    const fromContents = fs.readFileSync(from, 'utf8');
    if (!this.hasImportOrReexportStatements(fromContents)) {
      return {dependencies, missing, deepImports};
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
          const resolvedModule = this.moduleResolver.resolveModuleImport(importPath, from);
          if (resolvedModule) {
            if (resolvedModule instanceof ResolvedRelativeModule) {
              const internalDependency = resolvedModule.modulePath;
              if (!alreadySeen.has(internalDependency)) {
                alreadySeen.add(internalDependency);
                this.computeDependencies(
                    internalDependency, dependencies, missing, deepImports, alreadySeen);
              }
            } else {
              if (resolvedModule instanceof ResolvedDeepImport) {
                deepImports.add(resolvedModule.importPath);
              } else {
                dependencies.add(resolvedModule.entryPointPath);
              }
            }
          } else {
            missing.add(importPath);
          }
        });
    return {dependencies, missing, deepImports};
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
  hasImportOrReexportStatements(source: string): boolean {
    return /(import|export)\s.+from/.test(source);
  }
}
