/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {PathManipulation} from '../../../src/ngtsc/file_system';
import {LockFile} from '../../src/locking/lock_file';

/**
 * A mock implementation of `LockFile` that just logs its calls.
 */
export class MockLockFile implements LockFile {
  constructor(
      fs: PathManipulation, private log: string[] = [], public path = fs.resolve('/lockfile'),
      private pid = '1234') {}
  write() {
    this.log.push('write()');
  }
  read(): string {
    this.log.push('read()');
    return this.pid;
  }
  remove() {
    this.log.push('remove()');
  }
}
