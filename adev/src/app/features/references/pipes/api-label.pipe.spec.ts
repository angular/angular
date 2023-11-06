/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ApiLabel} from './api-label.pipe';

describe('ApiLabel', () => {
  it('create an instance', () => {
    const pipe = new ApiLabel();
    expect(pipe).toBeTruthy();
  });
});
