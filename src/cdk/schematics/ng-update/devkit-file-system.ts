/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {normalize, Path, relative} from '@angular-devkit/core';
import {Tree, UpdateRecorder} from '@angular-devkit/schematics';
import * as path from 'path';
import {FileSystem} from '../update-tool/file-system';

/**
 * File system that leverages the virtual tree from the CLI devkit. This file
 * system is commonly used by `ng update` migrations that run as part of the
 * Angular CLI.
 */
export class DevkitFileSystem extends FileSystem<Path> {
  private _updateRecorderCache = new Map<string, UpdateRecorder>();
  private _workspaceFsPath: Path;

  constructor(private _tree: Tree, workspaceFsPath: string) {
    super();
    this._workspaceFsPath = normalize(workspaceFsPath);
  }

  resolve(...segments: string[]): Path {
    // Note: We use `posix.resolve` as the devkit paths are using posix separators.
    const resolvedPath = normalize(path.posix.resolve(...segments.map(normalize)));
    // If the resolved path points to the workspace root, then this is an absolute disk
    // path and we need to compute a devkit tree relative path.
    if (resolvedPath.startsWith(this._workspaceFsPath)) {
      return relative(this._workspaceFsPath, resolvedPath);
    }
    // Otherwise we know that the path is absolute (due to the resolve), and that it
    // refers to an absolute devkit tree path (like `/angular.json`). We keep those
    // unmodified as they are already resolved workspace paths.
    return resolvedPath;
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

  exists(filePath: Path) {
    return this._tree.exists(filePath);
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
}
