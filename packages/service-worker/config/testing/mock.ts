/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {sha1} from '../../cli/sha1';
import {Filesystem} from '../src/filesystem';

export class MockFilesystem implements Filesystem {
  private files = new Map<string, string>();

  constructor(files: {[name: string]: string | undefined}) {
    Object.keys(files).forEach((path) => this.files.set(path, files[path]!));
  }

  async list(dir: string): Promise<string[]> {
    return Array.from(this.files.keys()).filter((path) => path.startsWith(dir));
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

export class HashTrackingMockFilesystem extends MockFilesystem {
  public maxConcurrentHashings = 0;
  private concurrentHashings = 0;

  /** @override */
  override async hash(path: string): Promise<string> {
    // Increase the concurrent hashings count.
    this.concurrentHashings += 1;
    this.maxConcurrentHashings = Math.max(this.maxConcurrentHashings, this.concurrentHashings);

    // Artificial delay to check hashing concurrency.
    await new Promise((resolve) => setTimeout(resolve, 250));

    // Decrease the concurrent hashings count.
    this.concurrentHashings -= 1;

    return super.hash(path);
  }
}
