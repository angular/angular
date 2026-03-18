/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injector} from '../../src/core';
import {ERROR_DETAILS_PAGE_BASE_URL} from '../../src/error_details_base_url';

describe('Injector.NULL', () => {
  it('should throw if no arg is given', () => {
    expect(() => Injector.NULL.get('someToken')).toThrowError(
      'NG0201: No provider found for `someToken`. ' +
        `Find more at ${ERROR_DETAILS_PAGE_BASE_URL}/NG0201`,
    );
  });

  it('should throw if THROW_IF_NOT_FOUND is given', () => {
    expect(() => Injector.NULL.get('someToken', Injector.THROW_IF_NOT_FOUND)).toThrowError(
      'NG0201: No provider found for `someToken`. ' +
        `Find more at ${ERROR_DETAILS_PAGE_BASE_URL}/NG0201`,
    );
  });

  it('should return the default value', () => {
    expect(Injector.NULL.get('someToken', 'notFound')).toEqual('notFound');
  });
});
