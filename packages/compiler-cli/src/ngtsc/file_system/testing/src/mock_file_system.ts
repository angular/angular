/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {basename, dirname, resolve} from '../../src/helpers';
import {AbsoluteFsPath, FileStats, FileSystem, PathSegment, PathString} from '../../src/types';

/**
 * An in-memory file system that can be used in unit tests.
 */
export abstract class MockFileSystem implements FileSystem {
  private _fileTree: Folder = {};
  private _cwd: AbsoluteFsPath;


  constructor(private _isCaseSensitive = false, cwd: AbsoluteFsPath = '/' as AbsoluteFsPath) {
    this._cwd = this.normalize(cwd);
  }

  isCaseSensitive() {
    return this._isCaseSensitive;
  }

  exists(path: AbsoluteFsPath): boolean {
    return this.findFromPath(path).entity !== null;
  }

  readFile(path: AbsoluteFsPath): string {
    const {entity} = this.findFromPath(path);
    if (isFile(entity)) {
      return entity.toString();
    } else {
      throw new MockFileSystemError('ENOENT', path, `File "${path}" does not exist.`);
    }
  }

  readFileBuffer(path: AbsoluteFsPath): Uint8Array {
    const {entity} = this.findFromPath(path);
    if (isFile(entity)) {
      return entity instanceof Uint8Array ? entity : new Buffer(entity);
    } else {
      throw new MockFileSystemError('ENOENT', path, `File "${path}" does not exist.`);
    }
  }

  writeFile(path: AbsoluteFsPath, data: string|Uint8Array, exclusive: boolean = false): void {
    const [folderPath, basename] = this.splitIntoFolderAndFile(path);
    const {entity} = this.findFromPath(folderPath);
    if (entity === null || !isFolder(entity)) {
      throw new MockFileSystemError(
          'ENOENT', path, `Unable to write file "${path}". The containing folder does not exist.`);
    }
    if (exclusive && entity[basename] !== undefined) {
      throw new MockFileSystemError(
          'EEXIST', path, `Unable to exclusively write file "${path}". The file already exists.`);
    }
    entity[basename] = data;
  }

  removeFile(path: AbsoluteFsPath): void {
    const [folderPath, basename] = this.splitIntoFolderAndFile(path);
    const {entity} = this.findFromPath(folderPath);
    if (entity === null || !isFolder(entity)) {
      throw new MockFileSystemError(
          'ENOENT', path, `Unable to remove file "${path}". The containing folder does not exist.`);
    }
    if (isFolder(entity[basename])) {
      throw new MockFileSystemError(
          'EISDIR', path, `Unable to remove file "${path}". The path to remove is a folder.`);
    }
    delete entity[basename];
  }

  symlink(target: AbsoluteFsPath, path: AbsoluteFsPath): void {
    const [folderPath, basename] = this.splitIntoFolderAndFile(path);
    const {entity} = this.findFromPath(folderPath);
    if (entity === null || !isFolder(entity)) {
      throw new MockFileSystemError(
          'ENOENT', path,
          `Unable to create symlink at "${path}". The containing folder does not exist.`);
    }
    entity[basename] = new SymLink(target);
  }

  readdir(path: AbsoluteFsPath): PathSegment[] {
    const {entity} = this.findFromPath(path);
    if (entity === null) {
      throw new MockFileSystemError(
          'ENOENT', path, `Unable to read directory "${path}". It does not exist.`);
    }
    if (isFile(entity)) {
      throw new MockFileSystemError(
          'ENOTDIR', path, `Unable to read directory "${path}". It is a file.`);
    }
    return Object.keys(entity) as PathSegment[];
  }

  lstat(path: AbsoluteFsPath): FileStats {
    const {entity} = this.findFromPath(path);
    if (entity === null) {
      throw new MockFileSystemError('ENOENT', path, `File "${path}" does not exist.`);
    }
    return new MockFileStats(entity);
  }

  stat(path: AbsoluteFsPath): FileStats {
    const {entity} = this.findFromPath(path, {followSymLinks: true});
    if (entity === null) {
      throw new MockFileSystemError('ENOENT', path, `File "${path}" does not exist.`);
    }
    return new MockFileStats(entity);
  }

  copyFile(from: AbsoluteFsPath, to: AbsoluteFsPath): void {
    this.writeFile(to, this.readFile(from));
  }

  moveFile(from: AbsoluteFsPath, to: AbsoluteFsPath): void {
    this.writeFile(to, this.readFile(from));
    const result = this.findFromPath(dirname(from));
    const folder = result.entity as Folder;
    const name = basename(from);
    delete folder[name];
  }

  ensureDir(path: AbsoluteFsPath): Folder {
    const segments = this.splitPath(path).map(segment => this.getCanonicalPath(segment));

    // Convert the root folder to a canonical empty string `''` (on Windows it would be `'C:'`).
    segments[0] = '';
    if (segments.length > 1 && segments[segments.length - 1] === '') {
      // Remove a trailing slash (unless the path was only `/`)
      segments.pop();
    }

    let current: Folder = this._fileTree;
    for (const segment of segments) {
      if (isFile(current[segment])) {
        throw new Error(`Folder already exists as a file.`);
      }
      if (!current[segment]) {
        current[segment] = {};
      }
      current = current[segment] as Folder;
    }
    return current;
  }

  removeDeep(path: AbsoluteFsPath): void {
    const [folderPath, basename] = this.splitIntoFolderAndFile(path);
    const {entity} = this.findFromPath(folderPath);
    if (entity === null || !isFolder(entity)) {
      throw new MockFileSystemError(
          'ENOENT', path,
          `Unable to remove folder "${path}". The containing folder does not exist.`);
    }
    delete entity[basename];
  }

  isRoot(path: AbsoluteFsPath): boolean {
    return this.dirname(path) === path;
  }

  extname(path: AbsoluteFsPath|PathSegment): string {
    const match = /.+(\.[^.]*)$/.exec(path);
    return match !== null ? match[1] : '';
  }

  realpath(filePath: AbsoluteFsPath): AbsoluteFsPath {
    const result = this.findFromPath(filePath, {followSymLinks: true});
    if (result.entity === null) {
      throw new MockFileSystemError(
          'ENOENT', filePath, `Unable to find the real path of "${filePath}". It does not exist.`);
    } else {
      return result.path;
    }
  }

  pwd(): AbsoluteFsPath {
    return this._cwd;
  }

  chdir(path: AbsoluteFsPath): void {
    this._cwd = this.normalize(path);
  }

  getDefaultLibLocation(): AbsoluteFsPath {
    // Mimic the node module resolution algorithm and start in the current directory, then look
    // progressively further up the tree until reaching the FS root.
    // E.g. if the current directory is /foo/bar, look in /foo/bar/node_modules, then
    // /foo/node_modules, then /node_modules.

    let path = 'node_modules/typescript/lib';
    let resolvedPath = this.resolve(path);

    // Construct a path for the top-level node_modules to identify the stopping point.
    const topLevelNodeModules = this.resolve('/' + path);

    while (resolvedPath !== topLevelNodeModules) {
      if (this.exists(resolvedPath)) {
        return resolvedPath;
      }

      // Not here, look one level higher.
      path = '../' + path;
      resolvedPath = this.resolve(path);
    }

    // The loop exits before checking the existence of /node_modules/typescript at the top level.
    // This is intentional - if no /node_modules/typescript exists anywhere in the tree, there's
    // nothing this function can do about it, and TS may error later if it looks for a lib.d.ts file
    // within this directory. It might be okay, though, if TS never checks for one.
    return topLevelNodeModules;
  }

  abstract resolve(...paths: string[]): AbsoluteFsPath;
  abstract dirname<T extends string>(file: T): T;
  abstract join<T extends string>(basePath: T, ...paths: string[]): T;
  abstract relative<T extends PathString>(from: T, to: T): PathSegment|AbsoluteFsPath;
  abstract basename(filePath: string, extension?: string): PathSegment;
  abstract isRooted(path: string): boolean;
  abstract normalize<T extends PathString>(path: T): T;
  protected abstract splitPath<T extends PathString>(path: T): string[];

  dump(): Folder {
    const {entity} = this.findFromPath(this.resolve('/'));
    if (entity === null || !isFolder(entity)) {
      return {};
    }

    return this.cloneFolder(entity);
  }

  init(folder: Folder): void {
    this.mount(this.resolve('/'), folder);
  }

  mount(path: AbsoluteFsPath, folder: Folder): void {
    if (this.exists(path)) {
      throw new Error(`Unable to mount in '${path}' as it already exists.`);
    }
    const mountFolder = this.ensureDir(path);

    this.copyInto(folder, mountFolder);
  }

  private cloneFolder(folder: Folder): Folder {
    const clone: Folder = {};
    this.copyInto(folder, clone);
    return clone;
  }

  private copyInto(from: Folder, to: Folder): void {
    for (const path in from) {
      const item = from[path];
      const canonicalPath = this.getCanonicalPath(path);
      if (isSymLink(item)) {
        to[canonicalPath] = new SymLink(this.getCanonicalPath(item.path));
      } else if (isFolder(item)) {
        to[canonicalPath] = this.cloneFolder(item);
      } else {
        to[canonicalPath] = from[path];
      }
    }
  }


  protected findFromPath(path: AbsoluteFsPath, options?: {followSymLinks: boolean}): FindResult {
    const followSymLinks = !!options && options.followSymLinks;
    const segments = this.splitPath(path);
    if (segments.length > 1 && segments[segments.length - 1] === '') {
      // Remove a trailing slash (unless the path was only `/`)
      segments.pop();
    }
    // Convert the root folder to a canonical empty string `""` (on Windows it would be `C:`).
    segments[0] = '';
    let current: Entity|null = this._fileTree;
    while (segments.length) {
      current = current[this.getCanonicalPath(segments.shift()!)];
      if (current === undefined) {
        return {path, entity: null};
      }
      if (segments.length > 0 && (!isFolder(current))) {
        current = null;
        break;
      }
      if (isFile(current)) {
        break;
      }
      if (isSymLink(current)) {
        if (followSymLinks) {
          return this.findFromPath(resolve(current.path, ...segments), {followSymLinks});
        } else {
          break;
        }
      }
    }
    return {path, entity: current};
  }

  protected splitIntoFolderAndFile(path: AbsoluteFsPath): [AbsoluteFsPath, string] {
    const segments = this.splitPath(this.getCanonicalPath(path));
    const file = segments.pop()!;
    return [path.substring(0, path.length - file.length - 1) as AbsoluteFsPath, file];
  }

  protected getCanonicalPath<T extends string>(p: T): T {
    return this.isCaseSensitive() ? p : p.toLowerCase() as T;
  }
}
export interface FindResult {
  path: AbsoluteFsPath;
  entity: Entity|null;
}
export type Entity = Folder|File|SymLink;
export interface Folder {
  [pathSegments: string]: Entity;
}
export type File = string|Uint8Array;
export class SymLink {
  constructor(public path: AbsoluteFsPath) {}
}

class MockFileStats implements FileStats {
  constructor(private entity: Entity) {}
  isFile(): boolean {
    return isFile(this.entity);
  }
  isDirectory(): boolean {
    return isFolder(this.entity);
  }
  isSymbolicLink(): boolean {
    return isSymLink(this.entity);
  }
}

class MockFileSystemError extends Error {
  constructor(public code: string, public path: string, message: string) {
    super(message);
  }
}

export function isFile(item: Entity|null): item is File {
  return Buffer.isBuffer(item) || typeof item === 'string';
}

export function isSymLink(item: Entity|null): item is SymLink {
  return item instanceof SymLink;
}

export function isFolder(item: Entity|null): item is Folder {
  return item !== null && !isFile(item) && !isSymLink(item);
}
