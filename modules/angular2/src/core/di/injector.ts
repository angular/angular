import {CONST_EXPR, stringify, isBlank} from 'angular2/src/facade/lang';
import {unimplemented, BaseException} from 'angular2/src/facade/exceptions';

const _THROW_IF_NOT_FOUND = CONST_EXPR(new Object());
export const THROW_IF_NOT_FOUND = CONST_EXPR(_THROW_IF_NOT_FOUND);

class _NullInjector implements Injector {
  get(token: any, notFoundValue: any = _THROW_IF_NOT_FOUND): any {
    if (notFoundValue === _THROW_IF_NOT_FOUND) {
      throw new BaseException(`No provider for ${stringify(token)}!`);
    }
    return notFoundValue;
  }
}

/**
 * The Injector interface. This class can also be used
 * to get hold of an Injector.
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
   *   provide("validToken", {useValue: "Value"})
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

/**
 * An simple injector based on a Map of values.
 */
export class MapInjector implements Injector {
  constructor(private _parent: Injector, private _values: Map<any, any>) {
    if (isBlank(this._parent)) {
      this._parent = Injector.NULL;
    }
  }
  get(token: any, notFoundValue?: any): any {
    if (token === Injector) {
      return this;
    }
    return this._values.has(token) ? this._values.get(token) :
                                     this._parent.get(token, notFoundValue);
  }
}
