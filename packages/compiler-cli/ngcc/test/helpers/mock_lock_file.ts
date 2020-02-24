/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {MockFileSystemNative} from '../../../src/ngtsc/file_system/testing';
import {LockFile} from '../../src/execution/lock_file';

export class MockLockFile extends LockFile {
  log: string[] = [];
  constructor(private options: {throwOnCreate?: boolean, throwOnRemove?: boolean} = {}) {
    // This `MockLockFile` is not used in tests that are run via `runInEachFileSystem()`
    // So we cannot use `getFileSystem()` but instead just instantiate a mock file-system.
    super(new MockFileSystemNative());
  }
  create() {
    this.log.push('create()');
    if (this.options.throwOnCreate) throw new Error('LockFile.create() error');
  }
  remove() {
    this.log.push('remove()');
    if (this.options.throwOnRemove) throw new Error('LockFile.remove() error');
  }
}
