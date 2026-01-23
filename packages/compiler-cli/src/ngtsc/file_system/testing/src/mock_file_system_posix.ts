/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/// <reference types="node" />
import * as p from 'path';

import {AbsoluteFsPath, PathSegment, PathString} from '../../src/types';
import {MockFileSystem} from './mock_file_system';

export class MockFileSystemPosix extends MockFileSystem {
  override resolve(...paths: string[]): AbsoluteFsPath {
    const resolved = p.posix.resolve(this.pwd(), ...paths);
    return this.normalize(resolved) as AbsoluteFsPath;
  }

  override dirname<T extends string>(file: T): T {
    return this.normalize(p.posix.dirname(file)) as T;
  }

  override join<T extends string>(basePath: T, ...paths: string[]): T {
    return this.normalize(p.posix.join(basePath, ...paths)) as T;
  }

  override relative<T extends PathString>(from: T, to: T): PathSegment | AbsoluteFsPath {
    return this.normalize(p.posix.relative(from, to)) as PathSegment | AbsoluteFsPath;
  }

  override basename(filePath: string, extension?: string): PathSegment {
    return p.posix.basename(filePath, extension) as PathSegment;
  }

  override isRooted(path: string): boolean {
    return path.startsWith('/');
  }

  protected override splitPath<T extends PathString>(path: T): string[] {
    return path.split('/');
  }

  override normalize<T extends PathString>(path: T): T {
    return path.replace(/^[a-z]:\//i, '/').replace(/\\/g, '/') as T;
  }
}
