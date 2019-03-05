/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Path} from '@angular-devkit/core';
import {test} from '@angular-devkit/core/src/virtual-fs/host/test';

import {copyBazelFiles, deleteBazelFiles} from './bazel';

describe('Bazel builder', () => {
  it('should copy Bazel files', async() => {
    const host = new test.TestHost({
      '/files/WORKSPACE.template': '',
      '/files/BUILD.bazel.template': '',
      '/files/__dot__bazelrc.template': '',
      '/files/__dot__bazelignore.template': '',
      '/files/e2e/BUILD.bazel.template': '',
      '/files/src/BUILD.bazel.template': '',
    });
    const root = '/' as Path;
    const templateDir = '/files' as Path;
    await copyBazelFiles(host, root, templateDir);
    const {records} = host;
    expect(records).toContain({kind: 'write', path: '/WORKSPACE' as Path});
    expect(records).toContain({kind: 'write', path: '/BUILD.bazel' as Path});
  });

  it('should delete Bazel files', async() => {
    const host = new test.TestHost({
      '/WORKSPACE': '',
      '/BUILD.bazel': '',
    });
    await deleteBazelFiles(host, ['/WORKSPACE', '/BUILD.bazel'] as Path[]);
    const {records} = host;
    expect(records).toContain({kind: 'delete', path: '/WORKSPACE' as Path});
    expect(records).toContain({kind: 'delete', path: '/BUILD.bazel' as Path});
  });
});
