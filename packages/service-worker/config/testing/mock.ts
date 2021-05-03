/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {sha1} from '../../cli/sha1';
import {Filesystem} from '../src/filesystem';

export class MockFilesystem implements Filesystem {
  private files = new Map<string, string>();

  constructor(files: {[name: string]: string|undefined}) {
    Object.keys(files).forEach(path => this.files.set(path, files[path]!));
  }

  async list(dir: string): Promise<string[]> {
    return Array.from(this.files.keys()).filter(path => path.startsWith(dir));
  }

  async read(path: string): Promise<string> {
    return this.files.get(path)!;
  }

  async hash(path: string): Promise<string> {
    return sha1(this.files.get(path)!);
  }

  async write(path: string, contents: string): Promise<void> {
    this.files.set(path, contents);
  }
}
