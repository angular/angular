/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <reference types="node" />
import * as os from 'os';
import {NodeJSFileSystem} from '../../src/node_js_file_system';
import {AbsoluteFsPath, PathSegment, PathString} from '../../src/types';

import {MockFileSystem} from './mock_file_system';

const isWindows = os.platform() === 'win32';

export class MockFileSystemNative extends MockFileSystem {
  constructor(cwd: AbsoluteFsPath = '/' as AbsoluteFsPath) {
    super(undefined, cwd);
  }

  // Delegate to the real NodeJSFileSystem for these path related methods

  override resolve(...paths: string[]): AbsoluteFsPath {
    return NodeJSFileSystem.prototype.resolve.call(this, this.pwd(), ...paths);
  }
  override dirname<T extends string>(file: T): T {
    return NodeJSFileSystem.prototype.dirname.call(this, file) as T;
  }
  override join<T extends string>(basePath: T, ...paths: string[]): T {
    return NodeJSFileSystem.prototype.join.call(this, basePath, ...paths) as T;
  }
  override relative<T extends PathString>(from: T, to: T): PathSegment|AbsoluteFsPath {
    return NodeJSFileSystem.prototype.relative.call(this, from, to);
  }

  override basename(filePath: string, extension?: string): PathSegment {
    return NodeJSFileSystem.prototype.basename.call(this, filePath, extension);
  }

  override isCaseSensitive() {
    return NodeJSFileSystem.prototype.isCaseSensitive.call(this);
  }

  override isRooted(path: string): boolean {
    return NodeJSFileSystem.prototype.isRooted.call(this, path);
  }

  override isRoot(path: AbsoluteFsPath): boolean {
    return NodeJSFileSystem.prototype.isRoot.call(this, path);
  }

  override normalize<T extends PathString>(path: T): T {
    // When running in Windows, absolute paths are normalized to always include a drive letter. This
    // ensures that rooted posix paths used in tests will be normalized to real Windows paths, i.e.
    // including a drive letter. Note that the same normalization is done in emulated Windows mode
    // (see `MockFileSystemWindows`) so that the behavior is identical between native Windows and
    // emulated Windows mode.
    if (isWindows) {
      path = path.replace(/^[\/\\]/i, 'C:/') as T;
    }

    return NodeJSFileSystem.prototype.normalize.call(this, path) as T;
  }

  protected override splitPath<T>(path: string): string[] {
    return path.split(/[\\\/]/);
  }
}
