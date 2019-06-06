/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
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

  isCaseSensitive() { return this._isCaseSensitive; }

  exists(path: AbsoluteFsPath): boolean { return this.findFromPath(path).entity !== null; }

  readFile(path: AbsoluteFsPath): string {
    const {entity} = this.findFromPath(path);
    if (isFile(entity)) {
      return entity;
    } else {
      throw new MockFileSystemError('ENOENT', path, `File "${path}" does not exist.`);
    }
  }

  writeFile(path: AbsoluteFsPath, data: string): void {
    const [folderPath, basename] = this.splitIntoFolderAndFile(path);
    const {entity} = this.findFromPath(folderPath);
    if (entity === null || !isFolder(entity)) {
      throw new MockFileSystemError(
          'ENOENT', path, `Unable to write file "${path}". The containing folder does not exist.`);
    }
    entity[basename] = data;
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

  mkdir(path: AbsoluteFsPath): void { this.ensureFolders(this._fileTree, this.splitPath(path)); }

  ensureDir(path: AbsoluteFsPath): void {
    this.ensureFolders(this._fileTree, this.splitPath(path));
  }

  isRoot(path: AbsoluteFsPath): boolean { return this.dirname(path) === path; }

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

  pwd(): AbsoluteFsPath { return this._cwd; }

  getDefaultLibLocation(): AbsoluteFsPath { return this.resolve('node_modules/typescript/lib'); }

  abstract resolve(...paths: string[]): AbsoluteFsPath;
  abstract dirname<T extends string>(file: T): T;
  abstract join<T extends string>(basePath: T, ...paths: string[]): T;
  abstract relative<T extends PathString>(from: T, to: T): PathSegment;
  abstract basename(filePath: string, extension?: string): PathSegment;
  abstract isRooted(path: string): boolean;
  abstract normalize<T extends PathString>(path: T): T;
  protected abstract splitPath<T extends PathString>(path: T): string[];

  dump(): Folder { return cloneFolder(this._fileTree); }
  init(folder: Folder): void { this._fileTree = cloneFolder(folder); }

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
      current = current[segments.shift() !];
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
    const segments = this.splitPath(path);
    const file = segments.pop() !;
    return [path.substring(0, path.length - file.length - 1) as AbsoluteFsPath, file];
  }

  protected ensureFolders(current: Folder, segments: string[]): Folder {
    // Convert the root folder to a canonical empty string `""` (on Windows it would be `C:`).
    segments[0] = '';
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
}
export interface FindResult {
  path: AbsoluteFsPath;
  entity: Entity|null;
}
export type Entity = Folder | File | SymLink;
export interface Folder { [pathSegments: string]: Entity; }
export type File = string;
export class SymLink {
  constructor(public path: AbsoluteFsPath) {}
}

class MockFileStats implements FileStats {
  constructor(private entity: Entity) {}
  isFile(): boolean { return isFile(this.entity); }
  isDirectory(): boolean { return isFolder(this.entity); }
  isSymbolicLink(): boolean { return isSymLink(this.entity); }
}

class MockFileSystemError extends Error {
  constructor(public code: string, public path: string, message: string) { super(message); }
}

export function isFile(item: Entity | null): item is File {
  return typeof item === 'string';
}

export function isSymLink(item: Entity | null): item is SymLink {
  return item instanceof SymLink;
}

export function isFolder(item: Entity | null): item is Folder {
  return item !== null && !isFile(item) && !isSymLink(item);
}

function cloneFolder(folder: Folder): Folder {
  const clone: Folder = {};
  for (const path in folder) {
    const item = folder[path];
    if (isSymLink(item)) {
      clone[path] = new SymLink(item.path);
    } else if (isFolder(item)) {
      clone[path] = cloneFolder(item);
    } else {
      clone[path] = folder[path];
    }
  }
  return clone;
}
