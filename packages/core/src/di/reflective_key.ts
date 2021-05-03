/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {stringify} from '../util/stringify';
import {resolveForwardRef} from './forward_ref';


/**
 * A unique object used for retrieving items from the {@link ReflectiveInjector}.
 *
 * Keys have:
 * - a system-wide unique `id`.
 * - a `token`.
 *
 * `Key` is used internally by {@link ReflectiveInjector} because its system-wide unique `id` allows
 * the
 * injector to store created objects in a more efficient way.
 *
 * `Key` should not be created directly. {@link ReflectiveInjector} creates keys automatically when
 * resolving
 * providers.
 *
 * @deprecated No replacement
 * @publicApi
 */
export class ReflectiveKey {
  public readonly displayName: string;
  /**
   * Private
   */
  constructor(public token: Object, public id: number) {
    if (!token) {
      throw new Error('Token must be defined!');
    }
    this.displayName = stringify(this.token);
  }

  /**
   * Retrieves a `Key` for a token.
   */
  static get(token: Object): ReflectiveKey {
    return _globalKeyRegistry.get(resolveForwardRef(token));
  }

  /**
   * @returns the number of keys registered in the system.
   */
  static get numberOfKeys(): number {
    return _globalKeyRegistry.numberOfKeys;
  }
}

export class KeyRegistry {
  private _allKeys = new Map<Object, ReflectiveKey>();

  get(token: Object): ReflectiveKey {
    if (token instanceof ReflectiveKey) return token;

    if (this._allKeys.has(token)) {
      return this._allKeys.get(token)!;
    }

    const newKey = new ReflectiveKey(token, ReflectiveKey.numberOfKeys);
    this._allKeys.set(token, newKey);
    return newKey;
  }

  get numberOfKeys(): number {
    return this._allKeys.size;
  }
}

const _globalKeyRegistry = new KeyRegistry();
