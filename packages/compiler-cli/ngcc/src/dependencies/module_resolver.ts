/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AbsoluteFsPath, ReadonlyFileSystem} from '../../../src/ngtsc/file_system';
import {PathMappings} from '../path_mappings';
import {isRelativePath, resolveFileWithPostfixes} from '../utils';

/**
 * This is a very cut-down implementation of the TypeScript module resolution strategy.
 *
 * It is specific to the needs of ngcc and is not intended to be a drop-in replacement
 * for the TS module resolver. It is used to compute the dependencies between entry-points
 * that may be compiled by ngcc.
 *
 * The algorithm only finds `.js` files for internal/relative imports and paths to
 * the folder containing the `package.json` of the entry-point for external imports.
 *
 * It can cope with nested `node_modules` folders and also supports `paths`/`baseUrl`
 * configuration properties, as provided in a `ts.CompilerOptions` object.
 */
export class ModuleResolver {
  private pathMappings: ProcessedPathMapping[];

  constructor(
      private fs: ReadonlyFileSystem, pathMappings?: PathMappings,
      readonly relativeExtensions = ['', '.js', '/index.js']) {
    this.pathMappings = pathMappings ? this.processPathMappings(pathMappings) : [];
  }

  /**
   * Resolve an absolute path for the `moduleName` imported into a file at `fromPath`.
   * @param moduleName The name of the import to resolve.
   * @param fromPath The path to the file containing the import.
   * @returns A path to the resolved module or null if missing.
   * Specifically:
   *  * the absolute path to the package.json of an external module
   *  * a JavaScript file of an internal module
   *  * null if none exists.
   */
  resolveModuleImport(moduleName: string, fromPath: AbsoluteFsPath): ResolvedModule|null {
    if (isRelativePath(moduleName)) {
      return this.resolveAsRelativePath(moduleName, fromPath);
    } else {
      return this.pathMappings.length && this.resolveByPathMappings(moduleName, fromPath) ||
          this.resolveAsEntryPoint(moduleName, fromPath);
    }
  }

  /**
   * Convert the `pathMappings` into a collection of `PathMapper` functions.
   */
  private processPathMappings(pathMappings: PathMappings): ProcessedPathMapping[] {
    const baseUrl = this.fs.resolve(pathMappings.baseUrl);
    return Object.keys(pathMappings.paths).map(pathPattern => {
      const matcher = splitOnStar(pathPattern);
      const templates = pathMappings.paths[pathPattern].map(splitOnStar);
      return {matcher, templates, baseUrl};
    });
  }

  /**
   * Try to resolve a module name, as a relative path, from the `fromPath`.
   *
   * As it is relative, it only looks for files that end in one of the `relativeExtensions`.
   * For example: `${moduleName}.js` or `${moduleName}/index.js`.
   * If neither of these files exist then the method returns `null`.
   */
  private resolveAsRelativePath(moduleName: string, fromPath: AbsoluteFsPath): ResolvedModule|null {
    const resolvedPath = resolveFileWithPostfixes(
        this.fs, this.fs.resolve(this.fs.dirname(fromPath), moduleName), this.relativeExtensions);
    return resolvedPath && new ResolvedRelativeModule(resolvedPath);
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
          if (this.isEntryPoint(mappedPath)) {
            return new ResolvedExternalModule(mappedPath);
          }
          const nonEntryPointImport = this.resolveAsRelativePath(mappedPath, fromPath);
          if (nonEntryPointImport !== null) {
            return isRelativeImport(packagePath, mappedPath) ? nonEntryPointImport :
                                                               new ResolvedDeepImport(mappedPath);
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
    while (!this.fs.isRoot(folder)) {
      folder = this.fs.dirname(folder);
      if (folder.endsWith('node_modules')) {
        // Skip up if the folder already ends in node_modules
        folder = this.fs.dirname(folder);
      }
      const modulePath = this.fs.resolve(folder, 'node_modules', moduleName);
      if (this.isEntryPoint(modulePath)) {
        return new ResolvedExternalModule(modulePath);
      } else if (this.resolveAsRelativePath(modulePath, fromPath)) {
        return new ResolvedDeepImport(modulePath);
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
    return this.fs.exists(this.fs.join(modulePath, 'package.json'));
  }

  /**
   * Apply the `pathMappers` to the `moduleName` and return all the possible
   * paths that match.
   *
   * The mapped path is computed for each template in `mapping.templates` by
   * replacing the `matcher.prefix` and `matcher.postfix` strings in `path with the
   * `template.prefix` and `template.postfix` strings.
   */
  private findMappedPaths(moduleName: string): AbsoluteFsPath[] {
    const matches = this.pathMappings.map(mapping => this.matchMapping(moduleName, mapping));

    let bestMapping: ProcessedPathMapping|undefined;
    let bestMatch: string|undefined;

    for (let index = 0; index < this.pathMappings.length; index++) {
      const mapping = this.pathMappings[index];
      const match = matches[index];
      if (match !== null) {
        // If this mapping had no wildcard then this must be a complete match.
        if (!mapping.matcher.hasWildcard) {
          bestMatch = match;
          bestMapping = mapping;
          break;
        }
        // The best matched mapping is the one with the longest prefix.
        if (!bestMapping || mapping.matcher.prefix > bestMapping.matcher.prefix) {
          bestMatch = match;
          bestMapping = mapping;
        }
      }
    }

    return (bestMapping !== undefined && bestMatch !== undefined) ?
        this.computeMappedTemplates(bestMapping, bestMatch) :
        [];
  }

  /**
   * Attempt to find a mapped path for the given `path` and a `mapping`.
   *
   * The `path` matches the `mapping` if if it starts with `matcher.prefix` and ends with
   * `matcher.postfix`.
   *
   * @returns the wildcard segment of a matched `path`, or `null` if no match.
   */
  private matchMapping(path: string, mapping: ProcessedPathMapping): string|null {
    const {prefix, postfix, hasWildcard} = mapping.matcher;
    if (hasWildcard) {
      return (path.startsWith(prefix) && path.endsWith(postfix)) ?
          path.substring(prefix.length, path.length - postfix.length) :
          null;
    } else {
      return (path === prefix) ? '' : null;
    }
  }

  /**
   * Compute the candidate paths from the given mapping's templates using the matched
   * string.
   */
  private computeMappedTemplates(mapping: ProcessedPathMapping, match: string) {
    return mapping.templates.map(
        template => this.fs.resolve(mapping.baseUrl, template.prefix + match + template.postfix));
  }

  /**
   * Search up the folder tree for the first folder that contains `package.json`
   * or `null` if none is found.
   */
  private findPackagePath(path: AbsoluteFsPath): AbsoluteFsPath|null {
    let folder = path;
    while (!this.fs.isRoot(folder)) {
      folder = this.fs.dirname(folder);
      if (this.fs.exists(this.fs.join(folder, 'package.json'))) {
        return folder;
      }
    }
    return null;
  }
}

/** The result of resolving an import to a module. */
export type ResolvedModule = ResolvedExternalModule|ResolvedRelativeModule|ResolvedDeepImport;

/**
 * A module that is external to the package doing the importing.
 * In this case we capture the folder containing the entry-point.
 */
export class ResolvedExternalModule {
  constructor(public entryPointPath: AbsoluteFsPath) {}
}

/**
 * A module that is relative to the module doing the importing, and so internal to the
 * source module's package.
 */
export class ResolvedRelativeModule {
  constructor(public modulePath: AbsoluteFsPath) {}
}

/**
 * A module that is external to the package doing the importing but pointing to a
 * module that is deep inside a package, rather than to an entry-point of the package.
 */
export class ResolvedDeepImport {
  constructor(public importPath: AbsoluteFsPath) {}
}

function splitOnStar(str: string): PathMappingPattern {
  const [prefix, postfix] = str.split('*', 2);
  return {prefix, postfix: postfix || '', hasWildcard: postfix !== undefined};
}

interface ProcessedPathMapping {
  baseUrl: AbsoluteFsPath;
  matcher: PathMappingPattern;
  templates: PathMappingPattern[];
}

interface PathMappingPattern {
  prefix: string;
  postfix: string;
  hasWildcard: boolean;
}

function isRelativeImport(from: AbsoluteFsPath, to: AbsoluteFsPath) {
  return to.startsWith(from) && !to.includes('node_modules');
}
