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
 * invocation of ngcc. In particular, the default library files are cached as parsed `ts.SourceFile`
 * as these files are used in each entry-point and some are expensive to parse, especially
 * `lib.es5.d.ts` and `lib.dom.d.ts`. Additionally, a `ts.ModuleResolutionCache` is exposed for
 * all module resolution operations to use, such that all entry-points can leverage a single module
 * resolution cache.
 *
 * The lifecycle of this cache corresponds with a single invocation of ngcc. Separate invocations,
 * e.g. the CLI's synchronous module resolution fallback will therefore all have their own cache.
 * This is because module resolution results cannot be assumed to be valid across invocations, as
 * modifications of the file-system may have invalidated earlier results.
 */
export class TransformCache {
  private defaultLibCache = new Map<AbsoluteFsPath, ts.SourceFile>();
  readonly moduleResolutionCache: ts.ModuleResolutionCache;

  constructor(private fs: FileSystem) {
    this.moduleResolutionCache = ts.createModuleResolutionCache(fs.pwd(), fileName => {
      return fs.isCaseSensitive() ? fileName : fileName.toLowerCase();
    });
  }

  getCachedSourceFile(fileName: string): ts.SourceFile|undefined {
    const absPath = this.fs.resolve(fileName);
    if (isDefaultLibrary(absPath, this.fs)) {
      return this.getDefaultLibFileCached(absPath);
    } else {
      return undefined;
    }
  }

  private getDefaultLibFileCached(absPath: AbsoluteFsPath): ts.SourceFile|undefined {
    if (!this.defaultLibCache.has(absPath)) {
      const content = readFile(absPath, this.fs);
      if (content === undefined) {
        return undefined;
      }
      const sf = ts.createSourceFile(absPath, content, ts.ScriptTarget.ES2015);
      this.defaultLibCache.set(absPath, sf);
    }
    return this.defaultLibCache.get(absPath)!;
  }
}

/**
 * Determines whether the provided path corresponds with a default library file inside of the
 * typescript package.
 *
 * @param absPath The path for which to determine whether it is a default library file.
 * @param fs The filesystem to use for inspecting the path.
 */
export function isDefaultLibrary(absPath: AbsoluteFsPath, fs: FileSystem): boolean {
  if (!/^lib\..+\.d\.ts$/.test(fs.basename(absPath))) {
    return false;
  }
  let path = absPath;
  for (const dirName of ['node_modules', 'typescript', 'lib'].reverse()) {
    path = fs.dirname(path);
    if (fs.basename(path) !== dirName) {
      return false;
    }
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
