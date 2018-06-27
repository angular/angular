/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { dirname, resolve } from 'path';
import { readFileSync } from 'fs';
import { find } from 'shelljs';
import * as ts from 'typescript';
import { Decorator } from '../../../ngtsc/host';

/**
 * A simple container that holds the details of a decorated class that has been
 * parsed out of a package.
 */
export class DecoratedClass {
  /**
   * Initialize a `DecoratedClass` that was found by parsing a package.
   * @param name The name of the class that has been found. This is mostly used
   * for informational purposes.
   * @param declaration The TypeScript AST node where this class is declared
   * @param decorators The collection of decorators that have been found on this class.
   */
  constructor(
    public name: string,
    public declaration: ts.Declaration,
    public decorators: Decorator[],
  ) {}
}

/**
 * This interface represents a class that can parse a package. A Package is stored in a directory
 * on disk and that directory can contain one or more package formats - e.g. fesm2015, UMD, etc.
 *
 * Each of these formats exposes one or more entry points, which are source files that need to be
 * parsed to identity the decorated classes that need to be analyzed and compiled by one or more
 * `DecoratorHandler` objects.
 *
 * Each entry point to a package is identified by a `SourceFile` that can be passed to the
 * `getDecoratedClasses()` method.
 */
export interface PackageParser {
  /**
   * Parse a source file and identify all the declarations that represent exported classes,
   * which are also decorated.
   *
   * Identifying classes can be different depending upon the format of the source file.
   *
   * For example:
   *
   * - ES2015 files contain `class Xxxx {...}` style declarations
   * - ES5 files contain `var Xxxx = (function () { function Xxxx() { ... }; return Xxxx; })();` style
   *   declarations
   * - UMD have similar declarations to ES5 files but the whole thing is wrapped in IIFE module wrapper
   *   function.
   *
   * @param entryPoint The file containing classes to parse.
   * @returns An array of `DecoratedClass` objects that represent the classes that were found when
   * parsing the source file.
   */
  getDecoratedExportedClasses(entryPoint: ts.SourceFile): DecoratedClass[];
}

/**
 * Search the `rootDirectory` and its subdirectories to find package.json files.
 * It ignores node dependencies, i.e. those under `node_modules` folders.
 * @param rootDirectory the directory in which we should search.
 */
export function findAllPackageJsonFiles(rootDirectory: string) {
  const paths = Array.from(find(rootDirectory));
  return paths.filter(path => {
      const relativePath = path.slice(rootDirectory.length);
      return /package\.json$/.test(relativePath) && !/node_modules\//.test(relativePath);
    });
}

/**
 * Identify the entry points of a package.
 * @param packageDirectory The absolute path to the root directory that contains this package.
 * @param format The format of the entry point within the package.
 * @returns A collection of paths that point to entry points for this package.
 */
export function getEntryPoints(packageDirectory: string, format: string): string[] {
  const packageJsonPaths = findAllPackageJsonFiles(packageDirectory);
  return packageJsonPaths
    .map(packageJsonPath => {
      const entryPointPackageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
      const relativeEntryPointPath = entryPointPackageJson[format];
      return relativeEntryPointPath && resolve(dirname(packageJsonPath), relativeEntryPointPath);
    })
    .filter(entryPointPath => entryPointPath);
}

