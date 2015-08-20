import {MapWrapper} from 'angular2/src/core/facade/collection';
import {stringify, CONST, Type, isBlank, BaseException} from 'angular2/src/core/facade/lang';
import {TypeLiteral} from './type_literal';
import {resolveForwardRef} from './forward_ref';

export {TypeLiteral} from './type_literal';

/**
 * A unique object used for retrieving items from the {@link Injector}.
 *
 * Keys have:
 * - a system-wide unique `id`.
 * - a `token`, usually the `Type` of the instance.
 *
 * Keys are used internally by the {@link Injector} because their system-wide unique `id`s allow the
 * injector to index in arrays rather than looking up items in maps.
 */
export class Key {
  constructor(public token: Object, public id: number) {
    if (isBlank(token)) {
      throw new BaseException('Token must be defined!');
    }
  }

  get displayName(): string { return stringify(this.token); }

  /**
   * Retrieves a `Key` for a token.
   */
  static get(token: Object): Key { return _globalKeyRegistry.get(resolveForwardRef(token)); }

  /**
   * @returns the number of keys registered in the system.
   */
  static get numberOfKeys(): number { return _globalKeyRegistry.numberOfKeys; }
}

/**
 * @private
 */
export class KeyRegistry {
  private _allKeys: Map<Object, Key> = new Map();

  get(token: Object): Key {
    if (token instanceof Key) return token;

    // TODO: workaround for https://github.com/Microsoft/TypeScript/issues/3123
    var theToken = token;
    if (token instanceof TypeLiteral) {
      theToken = token.type;
    }
    token = theToken;

    if (this._allKeys.has(token)) {
      return this._allKeys.get(token);
    }

    var newKey = new Key(token, Key.numberOfKeys);
    this._allKeys.set(token, newKey);
    return newKey;
  }

  get numberOfKeys(): number { return MapWrapper.size(this._allKeys); }
}

var _globalKeyRegistry = new KeyRegistry();
