/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


import {Injector} from '@angular/core';
import {describe, expect, it} from '@angular/core/testing/src/testing_internal';

{
  describe('Injector.NULL', () => {
    it('should throw if no arg is given', () => {
      expect(() => Injector.NULL.get('someToken'))
          .toThrowError('NullInjectorError: No provider for someToken!');
    });

    it('should throw if THROW_IF_NOT_FOUND is given', () => {
      expect(() => Injector.NULL.get('someToken', Injector.THROW_IF_NOT_FOUND))
          .toThrowError('NullInjectorError: No provider for someToken!');
    });

    it('should return the default value', () => {
      expect(Injector.NULL.get('someToken', 'notFound')).toEqual('notFound');
    });
  });
}
