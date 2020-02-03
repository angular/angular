/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {MockFileSystemNative} from '../../../src/ngtsc/file_system/testing';
import {LockFileAsync, LockFileSync} from '../../src/execution/lock_file';
import {MockLogger} from './mock_logger';

export class MockLockFileSync extends LockFileSync {
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

export class MockLockFileAsync extends LockFileAsync {
  log: string[] = [];
  constructor(private options: {throwOnCreate?: boolean, throwOnRemove?: boolean} = {}) {
    // This `MockLockFile` is not used in tests that are run via `runInEachFileSystem()`
    // So we cannot use `getFileSystem()` but instead just instantiate a mock file-system.
    super(new MockFileSystemNative(), new MockLogger(), 200, 2);
  }
  async create() {
    this.log.push('create()');
    if (this.options.throwOnCreate) throw new Error('LockFile.create() error');
  }
  remove() {
    this.log.push('remove()');
    if (this.options.throwOnRemove) throw new Error('LockFile.remove() error');
  }
}
