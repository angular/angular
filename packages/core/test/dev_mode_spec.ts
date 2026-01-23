/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {isDevMode} from '../src/core';

describe('dev mode', () => {
  it('is enabled in our tests by default', () => {
    expect(isDevMode()).toBe(true);
  });
});
