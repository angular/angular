/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {runServer} from '../../src/protractor/utils';

describe('Bazel protractor utils', () => {

  it('should be able to start devserver', async() => {
    // Test will automatically time out if the server couldn't be launched as expected.
    await runServer('angular', 'packages/bazel/test/protractor-utils/fake-devserver', '--port', []);
  });
});
