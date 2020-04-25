/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {normalize} from '@angular-devkit/core';
import {Tree, UpdateRecorder} from '@angular-devkit/schematics';
import {relative} from 'path';
import {FileSystem} from '../update-tool/file-system';

/**
 * File system that leverages the virtual tree from the CLI devkit. This file
 * system is commonly used by `ng update` migrations that run as part of the
 * Angular CLI.
 */
export class DevkitFileSystem implements FileSystem {
  private _updateRecorderCache = new Map<string, UpdateRecorder>();

  constructor(private _tree: Tree, private _workspaceFsPath: string) {}

  resolve(fsFilePath: string) {
    return normalize(relative(this._workspaceFsPath, fsFilePath)) as string;
  }

  edit(fsFilePath: string) {
    const treeFilePath = this.resolve(fsFilePath);
    if (this._updateRecorderCache.has(treeFilePath)) {
      return this._updateRecorderCache.get(treeFilePath)!;
    }
    const recorder = this._tree.beginUpdate(treeFilePath);
    this._updateRecorderCache.set(treeFilePath, recorder);
    return recorder;
  }

  commitEdits() {
    this._updateRecorderCache.forEach(r => this._tree.commitUpdate(r));
    this._updateRecorderCache.clear();
  }

  exists(fsFilePath: string) {
    return this._tree.exists(this.resolve(fsFilePath));
  }

  overwrite(fsFilePath: string, content: string) {
    this._tree.overwrite(this.resolve(fsFilePath), content);
  }

  create(fsFilePath: string, content: string) {
    this._tree.create(this.resolve(fsFilePath), content);
  }

  delete(fsFilePath: string) {
    this._tree.delete(this.resolve(fsFilePath));
  }

  read(fsFilePath: string) {
    const buffer = this._tree.read(this.resolve(fsFilePath));
    return buffer !== null ? buffer.toString() : null;
  }
}
