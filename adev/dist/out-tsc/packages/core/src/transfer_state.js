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
export function makeStateKey(key) {
  return key;
}
function initTransferState() {
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
  store = {};
  onSerializeCallbacks = {};
  /**
   * Get the value corresponding to a key. Return `defaultValue` if key is not found.
   */
  get(key, defaultValue) {
    return this.store[key] !== undefined ? this.store[key] : defaultValue;
  }
  /**
   * Set the value corresponding to a key.
   */
  set(key, value) {
    this.store[key] = value;
  }
  /**
   * Remove a key from the store.
   */
  remove(key) {
    delete this.store[key];
  }
  /**
   * Test whether a key exists in the store.
   */
  hasKey(key) {
    return this.store.hasOwnProperty(key);
  }
  /**
   * Indicates whether the state is empty.
   */
  get isEmpty() {
    return Object.keys(this.store).length === 0;
  }
  /**
   * Register a callback to provide the value for a key when `toJson` is called.
   */
  onSerialize(key, callback) {
    this.onSerializeCallbacks[key] = callback;
  }
  /**
   * Serialize the current state of the store to JSON.
   */
  toJson() {
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
export function retrieveTransferredState(doc, appId) {
  // Locate the script tag with the JSON data transferred from the server.
  // The id of the script tag is set to the Angular appId + 'state'.
  const script = doc.getElementById(appId + '-state');
  if (script?.textContent) {
    try {
      // Avoid using any here as it triggers lint errors in google3 (any is not allowed).
      // Decoding of `<` is done of the box by browsers and node.js, same behaviour as G3
      // script_builders.
      return JSON.parse(script.textContent);
    } catch (e) {
      console.warn('Exception while restoring TransferState for app ' + appId, e);
    }
  }
  return {};
}
//# sourceMappingURL=transfer_state.js.map
