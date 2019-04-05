/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AbsoluteFsPath} from '@angular/compiler-cli/src/ngtsc/path';
import * as fs from 'fs';
import {dirname, join, resolve} from 'path';
import {PathMappings, isRelativePath} from '../utils';

/**
 * This is a very cut-down implementation of the TypeScript module resolution strategy.
 *
 * It is specific to the needs of ngcc and is not intended to be a drop-in replacement
 * for the TS module resolver. It is used to compute the dependencies between entry-points
 * that may be compiled by ngcc.
 *
 * The algorithm only finds `.d.ts` files for internal/relative imports and paths to
 * the folder containing the `package.json` of the entry-point for external imports.
 *
 * It will not look for `.ts` or `.js` files.
 *
 * It can cope with nested `node_modules` folders and also supports `paths`/`baseUrl`
 * configuration properties, as provided in a `ts.CompilerOptions` object.
 */
export class ModuleResolver {
  private baseUrl: string;
  private pathMappings: ProcessedPathMapping[];

  constructor(pathMappings?: PathMappings) {
    this.baseUrl = pathMappings ? pathMappings.baseUrl : '';
    this.pathMappings = pathMappings ? this.processPathMappings(pathMappings) : [];
  }

  /**
   * Resolve an absolute path for the `moduleName` imported into a file at `fromPath`.
   * @param moduleName The name of the import to resolve.
   * @param fromPath The path to the file containing the import.
   * @returns A path to the resolved module or null if missing.
   * Specifically:
   *  * the absolute path to the package.json of an external module
   *  * a typings file (.d.ts) of an internal module
   *  * null if none exists.
   */
  resolveModuleImport(moduleName: string, fromPath: AbsoluteFsPath): ResolvedModule|null {
    if (isRelativePath(moduleName)) {
      return this.resolveAsRelativePath(moduleName, fromPath);
    } else {
      return this.resolveByPathMappings(moduleName, fromPath) ||
          this.resolveAsEntryPoint(moduleName, fromPath);
    }
  }

  /**
   * Convert the `pathMappings` into a collection of `PathMapper` functions.
   */
  private processPathMappings(pathMappings: PathMappings): ProcessedPathMapping[] {
    return Object.keys(pathMappings.paths).map(pathPattern => {
      const matcher = splitOnStar(pathPattern);
      const templates = pathMappings.paths[pathPattern].map(splitOnStar);
      return {matcher, templates};
    });
  }

  /**
   * Attempt to find a mapped path for the given `path` and a `mapping`.
   *
   * The `path` matches the `mapping` if if it starts with `matcher.prefix` and ends with
   * `matcher.postfix`.
   *
   * When a `path` matches, then an array of "mapped paths" is returned.
   * The mapped path is computed for each template in `mapping.templates` by
   * replacing the `matcher.prefix` and `matcher.postfix` strings in `path with the
   * `template.prefix` and `template.postfix` strings.
   */
  private mapPath(path: string, mapping: ProcessedPathMapping): AbsoluteFsPath[]|null {
    const {prefix, postfix} = mapping.matcher;
    if (path.startsWith(prefix) && path.endsWith(postfix)) {
      const mappedPath = path.substring(prefix.length, path.length - postfix.length);
      return mapping.templates.map(
          template => AbsoluteFsPath.from(
              resolve(this.baseUrl, template.prefix + mappedPath + template.postfix)));
    }
    return null;
  }


  /**
   * Try to resolve a module name, as a relative path, from the `fromPath`.
   *
   * As it is relative, it only looks for files of the form: `${moduleName}.d.ts` or
   * `${moduleName}/index.d.ts`.
   * If neither of these files exist then the method returns `null`.
   */
  private resolveAsRelativePath(moduleName: string, fromPath: AbsoluteFsPath): ResolvedModule|null {
    const resolvedPath =
        this.resolvePath(resolve(dirname(fromPath), moduleName), ['.d.ts', '/index.d.ts']);
    return resolvedPath && {isRelative: true, isDeepImport: false, resolvedPath};
  }

  /**
   * Try to resolve the `moduleName`, by applying the computed `pathMappings` and
   * then trying to resolve the mapped path as a relative or external import.
   *
   * Whether the mapped path is relative is defined as it being "below the `fromPath`" and not
   * containing `node_modules`.
   *
   * If the mapped path is not relative but does not resolve to an external entry-point, then we
   * check whether it would have resolved to a relative path, in which case it is marked as a
   * "deep-import".
   */
  private resolveByPathMappings(moduleName: string, fromPath: AbsoluteFsPath): ResolvedModule|null {
    const mappedPaths = this.findMappedPaths(moduleName);
    if (mappedPaths.length > 0) {
      const packagePath = this.findPackagePath(fromPath);
      if (packagePath !== null) {
        for (const mappedPath of mappedPaths) {
          const isRelative =
              mappedPath.startsWith(packagePath) && !mappedPath.includes('node_modules');
          if (isRelative) {
            return this.resolveAsRelativePath(mappedPath, fromPath);
          } else if (this.isEntryPoint(mappedPath)) {
            return {isRelative, isDeepImport: false, resolvedPath: mappedPath};
          } else if (this.resolveAsRelativePath(mappedPath, fromPath)) {
            return {isRelative, isDeepImport: true, resolvedPath: mappedPath};
          }
        }
      }
    }
    return null;
  }

  /**
   * Try to resolve the `moduleName` as an external entry-point by searching the `node_modules`
   * folders up the tree for a matching `.../node_modules/${moduleName}`.
   *
   * If a folder is found but the path does not contain a `package.json` then it is marked as a
   * "deep-import".
   */
  private resolveAsEntryPoint(moduleName: string, fromPath: AbsoluteFsPath): ResolvedModule|null {
    let folder = fromPath;
    while (folder !== '/') {
      folder = AbsoluteFsPath.fromUnchecked(dirname(folder));
      if (folder.endsWith('node_modules')) {
        // Skip up if the folder already ends in node_modules
        folder = AbsoluteFsPath.fromUnchecked(dirname(folder));
      }
      const modulePath = AbsoluteFsPath.from(resolve(folder, 'node_modules', moduleName));
      if (this.isEntryPoint(modulePath)) {
        return {isRelative: false, isDeepImport: false, resolvedPath: modulePath};
      } else if (this.resolveAsRelativePath(modulePath, fromPath)) {
        return {isRelative: false, isDeepImport: true, resolvedPath: modulePath};
      }
    }
    return null;
  }

  /**
   * Attempt to resolve a `path` to a file by appending the provided `postFixes`
   * to the `path` and checking if the file exists on disk.
   * @returns An absolute path to the first matching existing file, or `null` if none exist.
   */
  private resolvePath(path: string, postFixes: string[]): AbsoluteFsPath|null {
    for (const postFix of postFixes) {
      const testPath = path + postFix;
      if (fs.existsSync(testPath)) {
        return AbsoluteFsPath.from(testPath);
      }
    }
    return null;
  }

  /**
   * Can we consider the given path as an entry-point to a package?
   *
   * This is achieved by checking for the existence of `${modulePath}/package.json`.
   */
  private isEntryPoint(modulePath: AbsoluteFsPath): boolean {
    return fs.existsSync(join(modulePath, 'package.json'));
  }

  /**
   * Apply the `pathMappers` to the `moduleName` and return all the possible
   * paths that match.
   */
  private findMappedPaths(moduleName: string): AbsoluteFsPath[] {
    if (this.pathMappings.length > 0) {
      for (const mapping of this.pathMappings) {
        const matches = this.mapPath(moduleName, mapping);
        if (matches !== null) {
          return matches;
        }
      }
    }
    return [];
  }

  /**
   * Search up the folder tree for the first folder that contains `package.json`
   * or `null` if none is found.
   */
  private findPackagePath(path: AbsoluteFsPath): AbsoluteFsPath|null {
    let folder = path;
    while (folder !== '/') {
      folder = AbsoluteFsPath.fromUnchecked(dirname(folder));
      if (fs.existsSync(join(folder, 'package.json'))) {
        return folder;
      }
    }
    return null;
  }
}

/**
 * Information about a module that was resolved by the `ModuleResolver`.
 */
export interface ResolvedModule {
  /** Is this module "relative" to the importing file? */
  isRelative: boolean;
  /** Is this module deep inside a package rather than an entry-point? */
  isDeepImport: boolean;
  /**
   * The path to the `.d.ts` file (if relative)
   * or the folder containing the `package.json` of the entry-point
   * if not relative and not deep.
   * */
  resolvedPath: AbsoluteFsPath;
}

function splitOnStar(str: string): {prefix: string, postfix: string} {
  const [prefix, postfix] = str.split('*', 2);
  return {prefix, postfix};
}

interface ProcessedPathMapping {
  matcher: {prefix: string, postfix: string};
  templates: {prefix: string, postfix: string}[];
}
