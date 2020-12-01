/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {basename, dirname, normalize, NormalizedRoot, Path} from '@angular-devkit/core';
import {Tree, UpdateRecorder} from '@angular-devkit/schematics';
import {DirectoryEntry, FileSystem} from '../update-tool/file-system';
import * as path from 'path';

/**
 * File system that leverages the virtual tree from the CLI devkit. This file
 * system is commonly used by `ng update` migrations that run as part of the
 * Angular CLI.
 */
export class DevkitFileSystem extends FileSystem {
  private _updateRecorderCache = new Map<string, UpdateRecorder>();

  constructor(private _tree: Tree) {
    super();
  }

  resolve(...segments: string[]): Path {
    // Note: We use `posix.resolve` as the devkit paths are using posix separators.
    return normalize(path.posix.resolve('/', ...segments.map(normalize)));
  }

  edit(filePath: Path) {
    if (this._updateRecorderCache.has(filePath)) {
      return this._updateRecorderCache.get(filePath)!;
    }
    const recorder = this._tree.beginUpdate(filePath);
    this._updateRecorderCache.set(filePath, recorder);
    return recorder;
  }

  commitEdits() {
    this._updateRecorderCache.forEach(r => this._tree.commitUpdate(r));
    this._updateRecorderCache.clear();
  }

  exists(fileOrDirPath: Path) {
    // We need to check for both file or directory existence, in order
    // to comply with the expectation from the TypeScript compiler.
    return this._tree.exists(fileOrDirPath) || this._isExistingDirectory(fileOrDirPath);
  }

  overwrite(filePath: Path, content: string) {
    this._tree.overwrite(filePath, content);
  }

  create(filePath: Path, content: string) {
    this._tree.create(filePath, content);
  }

  delete(filePath: Path) {
    this._tree.delete(filePath);
  }

  read(filePath: Path) {
    const buffer = this._tree.read(filePath);
    return buffer !== null ? buffer.toString() : null;
  }

  readDirectory(dirPath: Path): DirectoryEntry {
    const {subdirs: directories, subfiles: files} = this._tree.getDir(dirPath);
    return {directories, files};
  }

  private _isExistingDirectory(dirPath: Path) {
    if (dirPath === NormalizedRoot) {
      return true;
    }

    const parent = dirname(dirPath);
    const dirName = basename(dirPath);
    // TypeScript also checks potential entry points, so e.g. importing
    // package.json will result in a lookup of /package.json/package.json
    // and /package.json/index.ts. In order to avoid failure, we check if
    // the parent is an existing file and return false, if that is the case.
    if (this._tree.exists(parent)) {
      return false;
    }

    const dir = this._tree.getDir(parent);
    return dir.subdirs.indexOf(dirName) !== -1;
  }
}
