/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';
import {AbsoluteFsPath, FileSystem} from '../../../src/ngtsc/file_system';

/**
 * A cache that holds on to data that can be shared for processing all entry-points in a single
 * invocation of ngcc. In particular, the following aspects are shared across all entry-points
 * through this cache:
 *
 * 1. Default library files such as `lib.dom.d.ts` and `lib.es5.d.ts`. These files don't change
 *    and some are very large, so parsing is expensive. Therefore, the parsed `ts.SourceFile`s for
 *    the default library files are cached.
 * 2. The typings of @angular scoped packages. The typing files for @angular packages are typically
 *    used in the entry-points that ngcc processes, so benefit from a single source file cache.
 *    Especially `@angular/core/core.d.ts` is large and expensive to parse repeatedly. In contrast
 *    to default library files, we have to account for these files to be invalidated during a single
 *    invocation of ngcc, as ngcc will overwrite the .d.ts files during its processing.
 * 3. A module resolution cache for TypeScript to use for module resolution. Module resolution is
 *    an expensive operation due to the large number of filesystem accesses. During a single
 *    invocation of ngcc it is assumed that the filesystem layout does not change, so a single
 *    module resolution cache is provided for use by all entry-points.
 *
 * The lifecycle of this cache corresponds with a single invocation of ngcc. Separate invocations,
 * e.g. the CLI's synchronous module resolution fallback will therefore all have their own cache.
 * This is because module resolution results cannot be assumed to be valid across invocations, as
 * modifications of the file-system may have invalidated earlier results. Additionally, it allows
 * for the source file cache to be garbage collected once ngcc processing has completed.
 */
export class TransformCache {
  private sfCache = new Map<AbsoluteFsPath, ts.SourceFile>();
  readonly moduleResolutionCache: ts.ModuleResolutionCache;

  constructor(private fs: FileSystem) {
    this.moduleResolutionCache = ts.createModuleResolutionCache(fs.pwd(), fileName => {
      return fs.isCaseSensitive() ? fileName : fileName.toLowerCase();
    });
  }

  /**
   * Loads a `ts.SourceFile` if the provided `fileName` is deemed appropriate to be cached. To
   * optimize for memory usage, only files that are generally used in all entry-points are cached.
   * If `fileName` is not considered to benefit from caching or the requested file does not exist,
   * then `undefined` is returned.
   */
  getCachedSourceFile(fileName: string): ts.SourceFile|undefined {
    const absPath = this.fs.resolve(fileName);
    if (isDefaultLibrary(absPath, this.fs)) {
      return this.getStableCachedFile(absPath);
    } else if (isAngularDts(absPath, this.fs)) {
      return this.getVolatileCachedFile(absPath);
    } else {
      return undefined;
    }
  }

  /**
   * Attempts to load the source file from the cache, or parses the file into a `ts.SourceFile` if
   * it's not yet cached. This method assumes that the file will not be modified for the duration
   * that this cache is valid for. If that assumption does not hold, the `getVolatileCachedFile`
   * method is to be used instead.
   */
  private getStableCachedFile(absPath: AbsoluteFsPath): ts.SourceFile|undefined {
    if (!this.sfCache.has(absPath)) {
      const content = readFile(absPath, this.fs);
      if (content === undefined) {
        return undefined;
      }
      const sf = ts.createSourceFile(absPath, content, ts.ScriptTarget.ES2015);
      this.sfCache.set(absPath, sf);
    }
    return this.sfCache.get(absPath)!;
  }

  /**
   * In contrast to `getStableCachedFile`, this method always verifies that the cached source file
   * is the same as what's stored on disk. This is done for files that are expected to change during
   * ngcc's processing, such as @angular scoped packages for which the .d.ts files are overwritten
   * by ngcc. If the contents on disk have changed compared to a previously cached source file, the
   * content from disk is re-parsed and the cache entry is replaced.
   */
  private getVolatileCachedFile(absPath: AbsoluteFsPath): ts.SourceFile|undefined {
    const content = readFile(absPath, this.fs);
    if (content === undefined) {
      return undefined;
    }
    if (!this.sfCache.has(absPath) || this.sfCache.get(absPath)!.text !== content) {
      const sf = ts.createSourceFile(absPath, content, ts.ScriptTarget.ES2015);
      this.sfCache.set(absPath, sf);
    }
    return this.sfCache.get(absPath)!;
  }
}

const DEFAULT_LIB_PATTERN = ['node_modules', 'typescript', 'lib', /^lib\..+\.d\.ts$/];

/**
 * Determines whether the provided path corresponds with a default library file inside of the
 * typescript package.
 *
 * @param absPath The path for which to determine if it corresponds with a default library file.
 * @param fs The filesystem to use for inspecting the path.
 */
export function isDefaultLibrary(absPath: AbsoluteFsPath, fs: FileSystem): boolean {
  return isFile(absPath, DEFAULT_LIB_PATTERN, fs);
}

const ANGULAR_DTS_PATTERN = ['node_modules', '@angular', /./, /\.d\.ts$/];

/**
 * Determines whether the provided path corresponds with a .d.ts file inside of an @angular
 * scoped package. This logic only accounts for the .d.ts files in the root, which is sufficient
 * to find the large, flattened entry-point files that benefit from caching.
 *
 * @param absPath The path for which to determine if it corresponds with an @angular .d.ts file.
 * @param fs The filesystem to use for inspecting the path.
 */
export function isAngularDts(absPath: AbsoluteFsPath, fs: FileSystem): boolean {
  return isFile(absPath, ANGULAR_DTS_PATTERN, fs);
}

/**
 * Helper function to determine whether a file corresponds with a given pattern of segments.
 *
 * @param path The path for which to determine whether it represented to provided segments.
 * @param segments Array of segments; the `path` must have ending segments that match the
 * patterns in this array.
 * @param fs The filesystem to use for inspecting the path.
 */
function isFile(
    path: AbsoluteFsPath, segments: ReadonlyArray<string|RegExp>, fs: FileSystem): boolean {
  for (let i = segments.length - 1; i >= 0; i--) {
    const pattern = segments[i];
    const segment = fs.basename(path);
    if (typeof pattern === 'string') {
      if (pattern !== segment) {
        return false;
      }
    } else {
      if (!pattern.test(segment)) {
        return false;
      }
    }
    path = fs.dirname(path);
  }
  return true;
}

/**
 * A cache for processing a single entry-point. This exists to share `ts.SourceFile`s between the
 * source and typing programs that are created for a single program. Additionally, it leverages the
 * transform cache for module resolution and sharing of default library files.
 */
export class EntryPointCache {
  private readonly sfCache = new Map<AbsoluteFsPath, ts.SourceFile>();

  constructor(private fs: FileSystem, private transformCache: TransformCache) {}

  get moduleResolutionCache(): ts.ModuleResolutionCache {
    return this.transformCache.moduleResolutionCache;
  }

  getCachedSourceFile(fileName: string, languageVersion: ts.ScriptTarget): ts.SourceFile|undefined {
    const staticSf = this.transformCache.getCachedSourceFile(fileName);
    if (staticSf !== undefined) {
      return staticSf;
    }

    const absPath = this.fs.resolve(fileName);
    if (this.sfCache.has(absPath)) {
      return this.sfCache.get(absPath);
    }

    const content = readFile(absPath, this.fs);
    if (content === undefined) {
      return undefined;
    }
    const sf = ts.createSourceFile(fileName, content, languageVersion);
    this.sfCache.set(absPath, sf);
    return sf;
  }
}

function readFile(absPath: AbsoluteFsPath, fs: FileSystem): string|undefined {
  if (!fs.exists(absPath) || !fs.stat(absPath).isFile()) {
    return undefined;
  }
  return fs.readFile(absPath);
}
