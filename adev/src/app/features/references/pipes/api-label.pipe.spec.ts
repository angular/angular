/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ApiItemType} from '../interfaces/api-item-type';
import {ApiLabel} from './api-label.pipe';

describe('ApiLabel', () => {
  let pipe: ApiLabel;

  beforeEach(() => {
    pipe = new ApiLabel();
  });

  it(`should return short label when labelType equals short`, () => {
    const result = pipe.transform(ApiItemType.CLASS, 'short');
    expect(result).toBe('C');
  });

  it(`should return short label when labelType equals short`, () => {
    const result = pipe.transform(ApiItemType.CLASS, 'full');
    expect(result).toBe('Class');
  });
});
