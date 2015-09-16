import {CONST} from 'angular2/src/core/facade/lang';

/**
 * By binding to an `OpaqueToken` you can enable an application to return more meaningful error
 * messages.
 *
 * ## Example
 *
 * ```
 * // While the following would work, see below for the preferred way
 * var binding = bind('value0').toValue(0);
 * ...
 * var value = injector.get('value0');
 *
 * // An OpaqueToken is the preferred way and lead to more helpful error messages
 * export value0Token = new OpaqueToken('value0');
 * var binding = bind(value0Token).toValue(0);
 * ...
 * var value = injector.get(value0Token);
 * ```
 */
@CONST()
export class OpaqueToken {
  constructor(private _desc: string) {}

  toString(): string { return `Token ${this._desc}`; }
}
