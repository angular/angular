/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {InvalidFileSystem, setFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system';
import {MockFileSystemNative} from '@angular/compiler-cli/src/ngtsc/file_system/testing';

/**
 * Only run these tests on the "native" file-system.
 *
 * Babel uses the `path.resolve()` function internally, which makes it very hard to mock out the
 * file-system from the outside. We run these tests on Unix and Windows in our CI jobs, so there is
 * test coverage.
 */
let counter = 0;
export function runInNativeFileSystem(label: string, callback: () => void) {
  describe(`<<FileSystem: Native>>/${label}`, () => {
    beforeEach(() => setFileSystem(new MockFileSystemNative()));
    afterEach(() => setFileSystem(new InvalidFileSystem()));
    callback();
  });
}
