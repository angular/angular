/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {APP_ID} from './application/application_tokens';
import {inject} from './di/injector_compatibility';
import {ɵɵdefineInjectable} from './di/interface/defs';
import {getDocument} from './render3/interfaces/document';

/**
 * A type-safe key to use with `TransferState`.
 *
 * Example:
 *
 * ```ts
 * const COUNTER_KEY = makeStateKey<number>('counter');
 * let value = 10;
 *
 * transferState.set(COUNTER_KEY, value);
 * ```
 *
 * @publicApi
 */
export type StateKey<T> = string & {
  __not_a_string: never;
  __value_type?: T;
};

/**
 * Create a `StateKey<T>` that can be used to store value of type T with `TransferState`.
 *
 * Example:
 *
 * ```ts
 * const COUNTER_KEY = makeStateKey<number>('counter');
 * let value = 10;
 *
 * transferState.set(COUNTER_KEY, value);
 * ```
 *
 * @publicApi
 */
export function makeStateKey<T = void>(key: string): StateKey<T> {
  return key as StateKey<T>;
}

function initTransferState(): TransferState {
  const transferState = new TransferState();
  if (typeof ngServerMode === 'undefined' || !ngServerMode) {
    transferState.store = retrieveTransferredState(getDocument(), inject(APP_ID));
  }

  return transferState;
}

/**
 * A key value store that is transferred from the application on the server side to the application
 * on the client side.
 *
 * The `TransferState` is available as an injectable token.
 * On the client, just inject this token using DI and use it, it will be lazily initialized.
 * On the server it's already included if `renderApplication` function is used. Otherwise, import
 * the `ServerTransferStateModule` module to make the `TransferState` available.
 *
 * The values in the store are serialized/deserialized using JSON.stringify/JSON.parse. So only
 * boolean, number, string, null and non-class objects will be serialized and deserialized in a
 * non-lossy manner.
 *
 * @publicApi
 */
export class TransferState {
  /** @nocollapse */
  static ɵprov = /** @pureOrBreakMyCode */ /* @__PURE__ */ ɵɵdefineInjectable({
    token: TransferState,
    providedIn: 'root',
    factory: initTransferState,
  });

  /** @internal */
  store: Record<string, unknown | undefined> = {};

  private onSerializeCallbacks: {[k: string]: () => unknown | undefined} = {};

  /**
   * Get the value corresponding to a key. Return `defaultValue` if key is not found.
   */
  get<T>(key: StateKey<T>, defaultValue: T): T {
    return this.store[key] !== undefined ? (this.store[key] as T) : defaultValue;
  }

  /**
   * Set the value corresponding to a key.
   */
  set<T>(key: StateKey<T>, value: T): void {
    this.store[key] = value;
  }

  /**
   * Remove a key from the store.
   */
  remove<T>(key: StateKey<T>): void {
    delete this.store[key];
  }

  /**
   * Test whether a key exists in the store.
   */
  hasKey<T>(key: StateKey<T>): boolean {
    return this.store.hasOwnProperty(key);
  }

  /**
   * Indicates whether the state is empty.
   */
  get isEmpty(): boolean {
    return Object.keys(this.store).length === 0;
  }

  /**
   * Register a callback to provide the value for a key when `toJson` is called.
   */
  onSerialize<T>(key: StateKey<T>, callback: () => T): void {
    this.onSerializeCallbacks[key] = callback;
  }

  /**
   * Serialize the current state of the store to JSON.
   */
  toJson(): string {
    // Call the onSerialize callbacks and put those values into the store.
    for (const key in this.onSerializeCallbacks) {
      if (this.onSerializeCallbacks.hasOwnProperty(key)) {
        try {
          this.store[key] = this.onSerializeCallbacks[key]();
        } catch (e) {
          console.warn('Exception in onSerialize callback: ', e);
        }
      }
    }

    // Escape script tag to avoid break out of <script> tag in serialized output.
    // Encoding of `<` is the same behaviour as G3 script_builders.
    return JSON.stringify(this.store).replace(/</g, '\\u003C');
  }
}

function retrieveTransferredState(
  doc: Document,
  appId: string,
): Record<string, unknown | undefined> {
  // Locate the script tag with the JSON data transferred from the server.
  // The id of the script tag is set to the Angular appId + 'state'.
  const script = doc.getElementById(appId + '-state');
  if (script?.textContent) {
    try {
      // Avoid using any here as it triggers lint errors in google3 (any is not allowed).
      // Decoding of `<` is done of the box by browsers and node.js, same behaviour as G3
      // script_builders.
      return JSON.parse(script.textContent) as {};
    } catch (e) {
      console.warn('Exception while restoring TransferState for app ' + appId, e);
    }
  }

  return {};
}
