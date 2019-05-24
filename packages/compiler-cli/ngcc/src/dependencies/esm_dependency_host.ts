/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';

import {AbsoluteFsPath, PathSegment} from '../../../src/ngtsc/path';
import {FileSystem} from '../file_system/file_system';
import {DependencyHost, DependencyInfo} from './dependency_host';
import {ModuleResolver, ResolvedDeepImport, ResolvedRelativeModule} from './module_resolver';


/**
 * Helper functions for computing dependencies.
 */
export class EsmDependencyHost implements DependencyHost {
  constructor(private fs: FileSystem, private moduleResolver: ModuleResolver) {}

  /**
   * Find all the dependencies for the entry-point at the given path.
   *
   * @param entryPointPath The absolute path to the JavaScript file that represents an entry-point.
   * @returns Information about the dependencies of the entry-point, including those that were
   * missing or deep imports into other entry-points.
   */
  findDependencies(entryPointPath: AbsoluteFsPath): DependencyInfo {
    const dependencies = new Set<AbsoluteFsPath>();
    const missing = new Set<AbsoluteFsPath|PathSegment>();
    const deepImports = new Set<AbsoluteFsPath>();
    const alreadySeen = new Set<AbsoluteFsPath>();
    this.recursivelyFindDependencies(
        entryPointPath, dependencies, missing, deepImports, alreadySeen);
    return {dependencies, missing, deepImports};
  }

  /**
   * Compute the dependencies of the given file.
   *
   * @param file An absolute path to the file whose dependencies we want to get.
   * @param dependencies A set that will have the absolute paths of resolved entry points added to
   * it.
   * @param missing A set that will have the dependencies that could not be found added to it.
   * @param deepImports A set that will have the import paths that exist but cannot be mapped to
   * entry-points, i.e. deep-imports.
   * @param alreadySeen A set that is used to track internal dependencies to prevent getting stuck
   * in a
   * circular dependency loop.
   */
  private recursivelyFindDependencies(
      file: AbsoluteFsPath, dependencies: Set<AbsoluteFsPath>, missing: Set<string>,
      deepImports: Set<string>, alreadySeen: Set<AbsoluteFsPath>): void {
    const fromContents = this.fs.readFile(file);
    if (!this.hasImportOrReexportStatements(fromContents)) {
      return;
    }

    // Parse the source into a TypeScript AST and then walk it looking for imports and re-exports.
    const sf =
        ts.createSourceFile(file, fromContents, ts.ScriptTarget.ES2015, false, ts.ScriptKind.JS);
    sf.statements
        // filter out statements that are not imports or reexports
        .filter(this.isStringImportOrReexport)
        // Grab the id of the module that is being imported
        .map(stmt => stmt.moduleSpecifier.text)
        // Resolve this module id into an absolute path
        .forEach(importPath => {
          const resolvedModule = this.moduleResolver.resolveModuleImport(importPath, file);
          if (resolvedModule) {
            if (resolvedModule instanceof ResolvedRelativeModule) {
              const internalDependency = resolvedModule.modulePath;
              if (!alreadySeen.has(internalDependency)) {
                alreadySeen.add(internalDependency);
                this.recursivelyFindDependencies(
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
