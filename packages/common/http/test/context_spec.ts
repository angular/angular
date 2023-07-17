/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HttpContext, HttpContextToken} from '../src/context';

const IS_ENABLED = new HttpContextToken<boolean>(() => false);
const UNUSED = new HttpContextToken<boolean>(() => true);
const CACHE_OPTION =
    new HttpContextToken<{cache: boolean, expiresIn?: number}>(() => ({cache: false}));

describe('HttpContext', () => {
  let context: HttpContext;

  beforeEach(() => {
    context = new HttpContext();
  });

  describe('with basic value', () => {
    it('should test public api', () => {
      expect(context.has(UNUSED)).toBe(false);
      expect(context.get(IS_ENABLED)).toBe(false);
      expect([...context.keys()]).toEqual([
        IS_ENABLED
      ]);  // value from factory function is stored in the map upon access

      expect(context.has(IS_ENABLED)).toBe(true);
      context.set(IS_ENABLED, true);
      expect(context.has(IS_ENABLED)).toBe(true);
      expect(context.get(IS_ENABLED)).toBe(true);
      expect([...context.keys()]).toEqual([IS_ENABLED]);

      context.delete(IS_ENABLED);
      expect([...context.keys()]).toEqual([]);
    });
  });

  describe('with complex value', () => {
    it('should test public api', () => {
      expect(context.get(CACHE_OPTION)).toEqual({cache: false});
      expect([...context.keys()]).toEqual([CACHE_OPTION]);

      const value = {cache: true, expiresIn: 30};
      context.set(CACHE_OPTION, value);
      expect(context.get(CACHE_OPTION)).toBe(value);
      expect([...context.keys()]).toEqual([CACHE_OPTION]);

      context.delete(CACHE_OPTION);
      expect([...context.keys()]).toEqual([]);
    });

    it('should ensure that same reference is returned for default value between multiple accesses',
       () => {
         const value = context.get(CACHE_OPTION);  // will get default value
         expect(value).toEqual({cache: false});
         expect(context.get(CACHE_OPTION)).toBe(value);
       });
  });
});
