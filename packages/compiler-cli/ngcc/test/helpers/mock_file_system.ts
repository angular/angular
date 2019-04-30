/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AbsoluteFsPath, PathSegment} from '../../../src/ngtsc/path';
import {FileStats, FileSystem} from '../../src/file_system/file_system';

/**
 * An in-memory file system that can be used in unit tests.
 */
export class MockFileSystem implements FileSystem {
  files: Folder = {};
  constructor(...folders: Folder[]) {
    folders.forEach(files => this.processFiles(this.files, files, true));
  }

  exists(path: AbsoluteFsPath): boolean { return this.findFromPath(path) !== null; }

  readFile(path: AbsoluteFsPath): string {
    const file = this.findFromPath(path);
    if (isFile(file)) {
      return file;
    } else {
      throw new MockFileSystemError('ENOENT', path, `File "${path}" does not exist.`);
    }
  }

  writeFile(path: AbsoluteFsPath, data: string): void {
    const [folderPath, basename] = this.splitIntoFolderAndFile(path);
    const folder = this.findFromPath(folderPath);
    if (!isFolder(folder)) {
      throw new MockFileSystemError(
          'ENOENT', path, `Unable to write file "${path}". The containing folder does not exist.`);
    }
    folder[basename] = data;
  }

  readdir(path: AbsoluteFsPath): PathSegment[] {
    const folder = this.findFromPath(path);
    if (folder === null) {
      throw new MockFileSystemError(
          'ENOENT', path, `Unable to read directory "${path}". It does not exist.`);
    }
    if (isFile(folder)) {
      throw new MockFileSystemError(
          'ENOTDIR', path, `Unable to read directory "${path}". It is a file.`);
    }
    return Object.keys(folder) as PathSegment[];
  }

  lstat(path: AbsoluteFsPath): FileStats {
    const fileOrFolder = this.findFromPath(path);
    if (fileOrFolder === null) {
      throw new MockFileSystemError('ENOENT', path, `File "${path}" does not exist.`);
    }
    return new MockFileStats(fileOrFolder);
  }

  stat(path: AbsoluteFsPath): FileStats {
    const fileOrFolder = this.findFromPath(path, {followSymLinks: true});
    if (fileOrFolder === null) {
      throw new MockFileSystemError('ENOENT', path, `File "${path}" does not exist.`);
    }
    return new MockFileStats(fileOrFolder);
  }

  pwd(): AbsoluteFsPath { return AbsoluteFsPath.from('/'); }

  copyFile(from: AbsoluteFsPath, to: AbsoluteFsPath): void {
    this.writeFile(to, this.readFile(from));
  }

  moveFile(from: AbsoluteFsPath, to: AbsoluteFsPath): void {
    this.writeFile(to, this.readFile(from));
    const folder = this.findFromPath(AbsoluteFsPath.dirname(from)) as Folder;
    const basename = PathSegment.basename(from);
    delete folder[basename];
  }

  ensureDir(path: AbsoluteFsPath): void { this.ensureFolders(this.files, path.split('/')); }

  private processFiles(current: Folder, files: Folder, isRootPath = false): void {
    Object.keys(files).forEach(path => {
      const pathResolved = isRootPath ? AbsoluteFsPath.from(path) : path;
      const segments = pathResolved.split('/');
      const lastSegment = segments.pop() !;
      const containingFolder = this.ensureFolders(current, segments);
      const entity = files[path];
      if (isFolder(entity)) {
        const processedFolder = containingFolder[lastSegment] = {} as Folder;
        this.processFiles(processedFolder, entity);
      } else {
        containingFolder[lastSegment] = entity;
      }
    });
  }

  private ensureFolders(current: Folder, segments: string[]): Folder {
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

  private findFromPath(path: AbsoluteFsPath, options?: {followSymLinks: boolean}): Entity|null {
    const followSymLinks = !!options && options.followSymLinks;
    const segments = path.split('/');
    let current = this.files;
    while (segments.length) {
      const next: Entity = current[segments.shift() !];
      if (next === undefined) {
        return null;
      }
      if (segments.length > 0 && (!isFolder(next))) {
        return null;
      }
      if (isFile(next)) {
        return next;
      }
      if (isSymLink(next)) {
        return followSymLinks ?
            this.findFromPath(AbsoluteFsPath.resolve(next.path, ...segments), {followSymLinks}) :
            next;
      }
      current = next;
    }
    return current || null;
  }

  private splitIntoFolderAndFile(path: AbsoluteFsPath): [AbsoluteFsPath, string] {
    const segments = path.split('/');
    const file = segments.pop() !;
    return [AbsoluteFsPath.fromUnchecked(segments.join('/')), file];
  }
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

function isFile(item: Entity | null): item is File {
  return typeof item === 'string';
}

function isSymLink(item: Entity | null): item is SymLink {
  return item instanceof SymLink;
}

function isFolder(item: Entity | null): item is Folder {
  return item !== null && !isFile(item) && !isSymLink(item);
}
