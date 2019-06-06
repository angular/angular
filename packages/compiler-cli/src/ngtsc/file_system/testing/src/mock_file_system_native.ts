/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {NodeJSFileSystem} from '../../src/node_js_file_system';
import {AbsoluteFsPath, PathSegment, PathString} from '../../src/types';

import {MockFileSystem} from './mock_file_system';

export class MockFileSystemNative extends MockFileSystem {
  constructor(cwd: AbsoluteFsPath = '/' as AbsoluteFsPath) { super(undefined, cwd); }

  // Delegate to the real NodeJSFileSystem for these path related methods

  resolve(...paths: string[]): AbsoluteFsPath {
    return NodeJSFileSystem.prototype.resolve.call(this, this.pwd(), ...paths);
  }
  dirname<T extends string>(file: T): T {
    return NodeJSFileSystem.prototype.dirname.call(this, file) as T;
  }
  join<T extends string>(basePath: T, ...paths: string[]): T {
    return NodeJSFileSystem.prototype.join.call(this, basePath, ...paths) as T;
  }
  relative<T extends PathString>(from: T, to: T): PathSegment {
    return NodeJSFileSystem.prototype.relative.call(this, from, to);
  }

  basename(filePath: string, extension?: string): PathSegment {
    return NodeJSFileSystem.prototype.basename.call(this, filePath, extension);
  }

  isCaseSensitive() { return NodeJSFileSystem.prototype.isCaseSensitive.call(this); }

  isRooted(path: string): boolean { return NodeJSFileSystem.prototype.isRooted.call(this, path); }

  isRoot(path: AbsoluteFsPath): boolean {
    return NodeJSFileSystem.prototype.isRoot.call(this, path);
  }

  normalize<T extends PathString>(path: T): T {
    return NodeJSFileSystem.prototype.normalize.call(this, path) as T;
  }

  protected splitPath<T>(path: string): string[] { return path.split(/[\\\/]/); }
}
