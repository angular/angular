/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as path from 'canonical-path';
import {DepGraph} from 'dependency-graph';
import * as fs from 'fs';
import * as ts from 'typescript';

import {EntryPoint} from './entry_point';


/**
 * Holds information about entry points that were ignored because
 * they have depedencies that are missing.
 *
 * This might not be an error, because the entry point might not actually be used
 * in the application. If it is used then the `ngc` application compilation would
 * fail also.
 *
 * For example, an application use the `@angular/router` package. This package includes an
 * entry-point called `@angular/router/upgrade`, which has a dependency on the
 * `@angular/upgrade` package. If the application never uses code from `@angular/router/upgrade`
 * then there is no need for `@angular/upgrade` to be installed.
 *
 * In this case the ngcc tool should just ignore the `@angular/router/upgrade` end-point.
 */
export interface IgnoredEntryPoint {
  entryPoint: EntryPoint;
  missingDeps: string[];
}

/**
 * Holds information about dependencies of an entry-point that do not need to be processed
 * by the ngcc tool.
 *
 * For example, the `rxjs` package does not contain any Angular decorators that need to be
 * compiled and so this can be safely ignored by ngcc.
 */
export interface IgnoredDependency {
  entryPoint: EntryPoint;
  dependencyPath: string;
}

/**
 * The result of sorting the entry-points by their dependencies.
 *
 * The `entryPoints` array will be ordered so that no entry point depends upon an entry point that
 * appears later in the array.
 *
 * Some entry points or their dependencies may be have been ignored. These are captured for
 * diagnostic purposes in `ignoredEntryPoints` and `ignoredDependencies` respectively.
 */
export interface SortedEntryPointsInfo {
  entryPoints: EntryPoint[];
  ignoredEntryPoints: IgnoredEntryPoint[];
  ignoredDependencies: IgnoredDependency[];
}

/**
 * Sort the array of entry points so that the dependant entry points always come later than
 * their dependencies in the array.
 * @param entryPoints An array entry points to sort.
 * @returns the result of sorting the entry points.
 */
export function sortEntryPointsByDependency(entryPoints: EntryPoint[]): SortedEntryPointsInfo {
  const ignoredEntryPoints: IgnoredEntryPoint[] = [];
  const ignoredDependencies: IgnoredDependency[] = [];
  const graph = new DepGraph();

  // Add the entry ponts to the graph as nodes
  entryPoints.forEach(entryPoint => graph.addNode(entryPoint.path, entryPoint));

  // Now add the dependencies between them
  entryPoints.forEach(entryPoint => {
    const entryPointPath = entryPoint.esm2015;
    if (!entryPointPath) {
      throw new Error(`Esm2015 format missing in '${entryPoint.path}' entry-point.`);
    }

    const dependencies = new Set<string>();
    const missing = new Set<string>();
    Helpers.computeDependencies(entryPointPath, dependencies, missing);

    if (missing.size > 0) {
      const nodesToRemove = [entryPoint.path, ...graph.dependantsOf(entryPoint.path)];
      nodesToRemove.forEach(node => {
        ignoredEntryPoints.push(
            {entryPoint: graph.getNodeData(node) as EntryPoint, missingDeps: Array.from(missing)});
        graph.removeNode(node);
      });
    } else {
      dependencies.forEach(dependencyPath => {
        if (graph.hasNode(dependencyPath)) {
          graph.addDependency(entryPoint.path, dependencyPath);
        } else {
          ignoredDependencies.push({entryPoint, dependencyPath});
        }
      });
    }
  });

  return {
    entryPoints: graph.overallOrder().map(path => graph.getNodeData(path) as EntryPoint),
    ignoredEntryPoints,
    ignoredDependencies
  };
}

/**
 * Helper functions for computing dependencies.
 */
export class Helpers {
  /**
   * Get a list of the resolved paths to all the dependencies of this entry point.
   * @param from An absolute path to the file whose dependencies we want to get.
   * @param resolved A set that will have the resolved dependencies added to it.
   * @param missing A set that will have the dependencies that could not be found added to it.
   * @param internal A set that is used to track internal dependencies to prevent getting stuck in a
   * circular
   * dependency loop.
   * @returns a object containing an array of absolute paths to `resolved` depenendencies and an
   * array of
   * import specifiers for dependencies that were `missing`.
   */
  static computeDependencies(
      from: string, resolved: Set<string>, missing: Set<string>,
      internal: Set<string> = new Set()): void {
    const fromContents = fs.readFileSync(from, 'utf8');
    if (!Helpers.hasImportOrReeportStatements(fromContents)) {
      return;
    }

    // Parse the source into a TypeScript AST and then walk it looking for imports and re-exports.
    const sf =
        ts.createSourceFile(from, fromContents, ts.ScriptTarget.ES2015, false, ts.ScriptKind.JS);
    sf.statements
        // filter out statements that are not imports or reexports
        .filter(Helpers.isStringImportOrReexport)
        // Grab the id of the module that is being imported
        .map(stmt => stmt.moduleSpecifier.text)
        // Resolve this module id into an absolute path
        .forEach(importPath => {
          if (importPath.startsWith('.')) {
            // This is an internal import so follow it
            const internalDependency = Helpers.resolveInternal(from, importPath);
            // Avoid circular dependencies
            if (!internal.has(internalDependency)) {
              internal.add(internalDependency);
              Helpers.computeDependencies(internalDependency, resolved, missing, internal);
            }
          } else {
            const externalDependency = Helpers.tryResolveExternal(from, importPath);
            if (externalDependency !== null) {
              resolved.add(externalDependency);
            } else {
              missing.add(importPath);
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
  static resolveInternal(from: string, to: string): string {
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
  static tryResolveExternal(from: string, to: string): string|null {
    const externalDependency = Helpers.tryResolve(from, `${to}/package.json`);
    return externalDependency && path.dirname(externalDependency);
  }

  /**
   * Resolve the absolute path of a module from a particular starting point.
   *
   * @param from the file path from where to start trying to resolve this module
   * @param to the module specifier of the dependency to resolve
   * @returns an absolute path to the entry-point of the dependency or null if it could not be
   * resolved.
   */
  static tryResolve(from: string, to: string): string|null {
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
  static isStringImportOrReexport(stmt: ts.Statement): stmt is ts.ImportDeclaration&
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
  static hasImportOrReeportStatements(source: string): boolean {
    return /(import|export)\s+[^\n]+from/.test(source);
  }
}