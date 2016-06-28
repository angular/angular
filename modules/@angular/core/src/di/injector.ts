/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BaseException, unimplemented} from '../facade/exceptions';
import {stringify} from '../facade/lang';

const _THROW_IF_NOT_FOUND = /*@ts2dart_const*/ new Object();
export const THROW_IF_NOT_FOUND = /*@ts2dart_const*/ _THROW_IF_NOT_FOUND;

class _NullInjector implements Injector {
  get(token: any, notFoundValue: any = _THROW_IF_NOT_FOUND): any {
    if (notFoundValue === _THROW_IF_NOT_FOUND) {
      throw new BaseException(`No provider for ${stringify(token)}!`);
    }
    return notFoundValue;
  }
}

/**
 * @stable
 */
export abstract class Injector {
  static THROW_IF_NOT_FOUND = _THROW_IF_NOT_FOUND;
  static NULL: Injector = new _NullInjector();

  /**
   * Retrieves an instance from the injector based on the provided token.
   * If not found:
   * - Throws {@link NoProviderError} if no `notFoundValue` that is not equal to
   * Injector.THROW_IF_NOT_FOUND is given
   * - Returns the `notFoundValue` otherwise
   *
   * ### Example ([live demo](http://plnkr.co/edit/HeXSHg?p=preview))
   *
   * ```typescript
   * var injector = ReflectiveInjector.resolveAndCreate([
   *   {provide: "validToken", useValue: "Value"}
   * ]);
   * expect(injector.get("validToken")).toEqual("Value");
   * expect(() => injector.get("invalidToken")).toThrowError();
   * ```
   *
   * `Injector` returns itself when given `Injector` as a token.
   *
   * ```typescript
   * var injector = ReflectiveInjector.resolveAndCreate([]);
   * expect(injector.get(Injector)).toBe(injector);
   * ```
   */
  get(token: any, notFoundValue?: any): any { return unimplemented(); }
}
