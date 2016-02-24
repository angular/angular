import {stringify, CONST, Type, isBlank} from 'angular2/src/facade/lang';
import {BaseException, WrappedException} from 'angular2/src/facade/exceptions';
import {resolveForwardRef} from './forward_ref';

/**
 * A unique object used for retrieving items from the {@link Injector}.
 *
 * Keys have:
 * - a system-wide unique `id`.
 * - a `token`.
 *
 * `Key` is used internally by {@link Injector} because its system-wide unique `id` allows the
 * injector to store created objects in a more efficient way.
 *
 * `Key` should not be created directly. {@link Injector} creates keys automatically when resolving
 * providers.
 */
export class Key {
  /**
   * Private
   */
  constructor(public token: Object, public id: number) {
    if (isBlank(token)) {
      throw new BaseException('Token must be defined!');
    }
  }

  /**
   * Returns a stringified token.
   */
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
 * @internal
 */
export class KeyRegistry {
  private _allKeys = new Map<Object, Key>();

  get(token: Object): Key {
    if (token instanceof Key) return token;

    if (this._allKeys.has(token)) {
      return this._allKeys.get(token);
    }

    var newKey = new Key(token, Key.numberOfKeys);
    this._allKeys.set(token, newKey);
    return newKey;
  }

  get numberOfKeys(): number { return this._allKeys.size; }
}

var _globalKeyRegistry = new KeyRegistry();
