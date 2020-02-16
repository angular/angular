/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {commentRegex, fromComment, mapFileCommentRegex} from 'convert-source-map';
import {AbsoluteFsPath, FileSystem, absoluteFrom} from '../../../src/ngtsc/file_system';
import {RawSourceMap} from './raw_source_map';
import {SourceFile} from './source_file';

/**
 * This class can be used to load a source file, its associated source map and any upstream sources.
 *
 * Since a source file might reference (or include) a source map, this class can load those too.
 * Since a source map might reference other source files, these are also loaded as needed.
 *
 * This is done recursively. The result is a "tree" of `SourceFile` objects, each containing
 * mappings to other `SourceFile` objects as necessary.
 */
export class SourceFileLoader {
  constructor(private fs: FileSystem) {}

  /**
   * Load a source file, compute its source map, and recursively load any referenced source files.
   *
   * @param sourcePath The path to the source file to load.
   * @param contents The contents of the source file to load (if known).
   * The contents may be known because the source file was inlined into a source map.
   * If it is not known the contents will be read from the file at the `sourcePath`.
   * @param mapAndPath The raw source-map and the path to the source-map file, if known.
   * @param previousPaths An internal parameter used for cyclic dependency tracking.
   * @returns a SourceFile if the content for one was provided or able to be loaded from disk,
   * `null` otherwise.
   */
  loadSourceFile(sourcePath: AbsoluteFsPath, contents: string, mapAndPath: MapAndPath): SourceFile;
  loadSourceFile(sourcePath: AbsoluteFsPath, contents: string|null): SourceFile|null;
  loadSourceFile(sourcePath: AbsoluteFsPath): SourceFile|null;
  loadSourceFile(
      sourcePath: AbsoluteFsPath, contents: string|null, mapAndPath: null,
      previousPaths: AbsoluteFsPath[]): SourceFile|null;
  loadSourceFile(
      sourcePath: AbsoluteFsPath, contents: string|null = null, mapAndPath: MapAndPath|null = null,
      previousPaths: AbsoluteFsPath[] = []): SourceFile|null {
    if (contents === null) {
      if (!this.fs.exists(sourcePath)) {
        return null;
      }

      // Track source file paths if we have loaded them from disk so that we don't get into an
      // infinite recursion
      if (previousPaths.includes(sourcePath)) {
        throw new Error(
            `Circular source file mapping dependency: ${previousPaths.join(' -> ')} -> ${sourcePath}`);
      }
      previousPaths = previousPaths.concat([sourcePath]);

      contents = this.fs.readFile(sourcePath);
    }

    // If not provided try to load the source map based on the source itself
    if (mapAndPath === null) {
      mapAndPath = this.loadSourceMap(sourcePath, contents);
    }

    let map: RawSourceMap|null = null;
    let inline = true;
    let sources: (SourceFile | null)[] = [];
    if (mapAndPath !== null) {
      const basePath = mapAndPath.mapPath || sourcePath;
      sources = this.processSources(basePath, mapAndPath.map, previousPaths);
      map = mapAndPath.map;
      inline = mapAndPath.mapPath === null;
    }

    return new SourceFile(sourcePath, contents, map, inline, sources);
  }

  /**
   * Find the source map associated with the source file whose `sourcePath` and `contents` are
   * provided.
   *
   * Source maps can be inline, as part of a base64 encoded comment, or external as a separate file
   * whose path is indicated in a comment or implied from the name of the source file itself.
   */
  private loadSourceMap(sourcePath: AbsoluteFsPath, contents: string): MapAndPath|null {
    const inline = commentRegex.exec(contents);
    if (inline !== null) {
      return {map: fromComment(inline.pop() !).sourcemap, mapPath: null};
    }

    const external = mapFileCommentRegex.exec(contents);
    if (external) {
      try {
        const fileName = external[1] || external[2];
        const externalMapPath = this.fs.resolve(this.fs.dirname(sourcePath), fileName);
        return {map: this.loadRawSourceMap(externalMapPath), mapPath: externalMapPath};
      } catch {
        return null;
      }
    }

    const impliedMapPath = absoluteFrom(sourcePath + '.map');
    if (this.fs.exists(impliedMapPath)) {
      return {map: this.loadRawSourceMap(impliedMapPath), mapPath: impliedMapPath};
    }

    return null;
  }

  /**
   * Iterate over each of the "sources" for this source file's source map, recursively loading each
   * source file and its associated source map.
   */
  private processSources(
      basePath: AbsoluteFsPath, map: RawSourceMap,
      previousPaths: AbsoluteFsPath[]): (SourceFile|null)[] {
    const sourceRoot = this.fs.resolve(this.fs.dirname(basePath), map.sourceRoot || '');
    return map.sources.map((source, index) => {
      const path = this.fs.resolve(sourceRoot, source);
      const content = map.sourcesContent && map.sourcesContent[index] || null;
      return this.loadSourceFile(path, content, null, previousPaths);
    });
  }

  /**
   * Load the source map from the file at `mapPath`, parsing its JSON contents into a `RawSourceMap`
   * object.
   */
  private loadRawSourceMap(mapPath: AbsoluteFsPath): RawSourceMap {
    return JSON.parse(this.fs.readFile(mapPath));
  }
}

/** A small helper structure that is returned from `loadSourceMap()`. */
interface MapAndPath {
  /** The path to the source map if it was external or `null` if it was inline. */
  mapPath: AbsoluteFsPath|null;
  /** The raw source map itself. */
  map: RawSourceMap;
}
