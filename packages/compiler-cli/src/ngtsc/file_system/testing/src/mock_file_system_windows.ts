/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <reference types="node" />
import * as p from 'path';

import {AbsoluteFsPath, PathSegment, PathString} from '../../src/types';
import {MockFileSystem} from './mock_file_system';

export class MockFileSystemWindows extends MockFileSystem {
  override resolve(...paths: string[]): AbsoluteFsPath {
    const resolved = p.win32.resolve(this.pwd(), ...paths);
    return this.normalize(resolved as AbsoluteFsPath);
  }

  override dirname<T extends string>(path: T): T {
    return this.normalize(p.win32.dirname(path) as T);
  }

  override join<T extends string>(basePath: T, ...paths: string[]): T {
    return this.normalize(p.win32.join(basePath, ...paths)) as T;
  }

  override relative<T extends PathString>(from: T, to: T): PathSegment|AbsoluteFsPath {
    return this.normalize(p.win32.relative(from, to)) as PathSegment | AbsoluteFsPath;
  }

  override basename(filePath: string, extension?: string): PathSegment {
    return p.win32.basename(filePath, extension) as PathSegment;
  }

  override isRooted(path: string): boolean {
    return /^([A-Z]:)?([\\\/]|$)/i.test(path);
  }

  protected override splitPath<T extends PathString>(path: T): string[] {
    return path.split(/[\\\/]/);
  }

  override normalize<T extends PathString>(path: T): T {
    return path.replace(/^[\/\\]/i, 'C:/').replace(/\\/g, '/') as T;
  }
}
