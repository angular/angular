/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license

*/
import {
  normalize,
  join,
  extname,
  relative,
  dirname,
  Path as DevkitAbsPath,
  PathFragment as DevkitPathFragment,
} from '@angular-devkit/core';
import {DirEntry, FileEntry, Tree} from '@angular-devkit/schematics';
import {
  AbsoluteFsPath,
  FileStats,
  FileSystem,
  PathSegment,
  PathString,
} from '@angular/compiler-cli';
import * as posixPath from 'node:path/posix';

/**
 * Angular compiler file system implementation that leverages an
 * CLI schematic virtual file tree.
 */
export class DevkitMigrationFilesystem implements FileSystem {
  constructor(private readonly tree: Tree) {}

  extname(path: AbsoluteFsPath | PathSegment): string {
    return extname(path as string as DevkitAbsPath | DevkitPathFragment);
  }

  isRoot(path: AbsoluteFsPath): boolean {
    return (path as string as DevkitAbsPath) === normalize('/');
  }

  isRooted(path: string): boolean {
    return this.normalize(path).startsWith('/');
  }

  dirname<T extends PathString>(file: T): T {
    return this.normalize(dirname(file as DevkitAbsPath | DevkitPathFragment)) as string as T;
  }

  join<T extends PathString>(basePath: T, ...paths: string[]): T {
    return this.normalize(
      join(basePath as DevkitAbsPath | DevkitPathFragment, ...paths),
    ) as string as T;
  }

  relative<T extends PathString>(from: T, to: T): PathSegment | AbsoluteFsPath {
    return this.normalize(
      relative(
        from as DevkitAbsPath | DevkitPathFragment,
        to as DevkitAbsPath | DevkitPathFragment,
      ),
    ) as string as PathSegment | AbsoluteFsPath;
  }

  basename(filePath: string, extension?: string): PathSegment {
    return posixPath.basename(filePath, extension) as PathSegment;
  }

  normalize<T extends PathString>(path: T): T {
    return normalize(path as string) as string as T;
  }

  resolve(...paths: string[]): AbsoluteFsPath {
    const normalizedPaths = paths.map((p) => normalize(p));
    // In dev-kit, the NodeJS working directory should never be
    // considered, so `/` is the last resort over `cwd`.
    return this.normalize(
      posixPath.resolve(normalize('/'), ...normalizedPaths),
    ) as string as AbsoluteFsPath;
  }

  pwd(): AbsoluteFsPath {
    return '/' as AbsoluteFsPath;
  }

  isCaseSensitive(): boolean {
    return true;
  }

  exists(path: AbsoluteFsPath): boolean {
    return statPath(this.tree, path) !== null;
  }

  readFile(path: AbsoluteFsPath): string {
    return this.tree.readText(path);
  }

  readFileBuffer(path: AbsoluteFsPath): Uint8Array {
    const buffer = this.tree.read(path);
    if (buffer === null) {
      throw new Error(`File does not exist: ${path}`);
    }
    return buffer;
  }

  readdir(path: AbsoluteFsPath): PathSegment[] {
    const dir = this.tree.getDir(path);
    return [
      ...(dir.subdirs as string[] as PathSegment[]),
      ...(dir.subfiles as string[] as PathSegment[]),
    ];
  }

  lstat(path: AbsoluteFsPath): FileStats {
    const stat = statPath(this.tree, path);
    if (stat === null) {
      throw new Error(`File does not exist for "lstat": ${path}`);
    }
    return stat;
  }
  stat(path: AbsoluteFsPath): FileStats {
    const stat = statPath(this.tree, path);
    if (stat === null) {
      throw new Error(`File does not exist for "stat": ${path}`);
    }
    return stat;
  }

  realpath(filePath: AbsoluteFsPath): AbsoluteFsPath {
    return filePath;
  }

  getDefaultLibLocation(): AbsoluteFsPath {
    return 'node_modules/typescript/lib' as AbsoluteFsPath;
  }

  ensureDir(path: AbsoluteFsPath): void {
    // Migrations should compute replacements and not write directly.
    throw new Error('DevkitFilesystem#ensureDir is not supported.');
  }

  writeFile(path: AbsoluteFsPath, data: string | Uint8Array): void {
    // Migrations should compute replacements and not write directly.
    throw new Error('DevkitFilesystem#writeFile is not supported.');
  }

  removeFile(path: AbsoluteFsPath): void {
    // Migrations should compute replacements and not write directly.
    throw new Error('DevkitFilesystem#removeFile is not supported.');
  }

  copyFile(from: AbsoluteFsPath, to: AbsoluteFsPath): void {
    // Migrations should compute replacements and not write directly.
    throw new Error('DevkitFilesystem#copyFile is not supported.');
  }

  moveFile(from: AbsoluteFsPath, to: AbsoluteFsPath): void {
    // Migrations should compute replacements and not write directly.
    throw new Error('DevkitFilesystem#moveFile is not supported.');
  }

  removeDeep(path: AbsoluteFsPath): void {
    // Migrations should compute replacements and not write directly.
    throw new Error('DevkitFilesystem#removeDeep is not supported.');
  }

  chdir(_path: AbsoluteFsPath): void {
    throw new Error('FileSystem#chdir is not supported.');
  }

  symlink(): void {
    throw new Error('FileSystem#symlink is not supported.');
  }
}

/** Stats the given path in the virtual tree. */
function statPath(tree: Tree, path: AbsoluteFsPath): FileStats | null {
  let fileInfo: FileEntry | null = null;
  let dirInfo: DirEntry | null = null;
  try {
    fileInfo = tree.get(path);
  } catch (e) {
    if ((e as any).constructor.name === 'PathIsDirectoryException') {
      dirInfo = tree.getDir(path);
    } else {
      throw e;
    }
  }

  if (fileInfo !== null || dirInfo !== null) {
    return {
      isDirectory: () => dirInfo !== null,
      isFile: () => fileInfo !== null,
      isSymbolicLink: () => false,
    };
  }
  return null;
}
