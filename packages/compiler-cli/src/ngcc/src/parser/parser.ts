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

export class ParsedFile {
  public decoratedClasses: DecoratedClass[] = [];
  constructor(public sourceFile: ts.SourceFile) { }
}

/**
 * This interface represents a class that can parse a package. A Package is stored in a directory
 * on disk and that directory can contain one or more package formats - e.g. fesm2015, UMD, etc.
 *
 * Each of these formats exposes one or more entry points, which are source files that need to be
 * parsed to identify the decorated exported classes that need to be analyzed and compiled by one or
 * more `DecoratorHandler` objects.
 *
 * Each entry point to a package is identified by a `SourceFile` that can be passed to the
 * `getDecoratedExportedClasses()` method.
 */
export interface PackageParser {
  /**
   * Parse a program via a specified entry point to identify all the declarations that represent
   * exported classes, which are also decorated, and noting which source file will need to be
   * transformed.
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
   * The actual file which needs to be transformed also depends upon the package format.
   *
   * - Flat file packages have all the classes in a single file.
   * - Other packages may re-export classes from other non-entry point files.
   * - Some formats may contain multiple "modules" in a single file.
   *
   * @param entryPoint The the entry point file for identifying classes to process.
   * @returns An collection of parsed files that hold the decorated classes and import information.
   */
   parseEntryPoint(entryPoint: ts.SourceFile): ParsedFile[];
}

/**
 * Search the `rootDirectory` and its subdirectories to find package.json files.
 * It ignores node dependencies, i.e. those under `node_modules` folders.
 * @param rootDirectory the directory in which we should search.
 */
export function findAllPackageJsonFiles(rootDirectory: string) {
  // TODO(gkalpak): Investigate whether skipping `node_modules/` directories (instead of traversing
  //                them and filtering out the results later) makes a noticeable difference.
  const paths = Array.from(find(rootDirectory));
  return paths.filter(path =>
    /\/package\.json$/.test(path) &&
    !/(?:^|\/)node_modules\//.test(path.slice(rootDirectory.length)));
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

