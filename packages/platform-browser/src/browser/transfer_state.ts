/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {APP_ID, Inject, Injectable, InjectionToken, ModuleWithProviders, NgModule, Optional} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {map} from 'rxjs/operator/map';
import {DOCUMENT} from '../dom/dom_tokens';

export function escapeHtml(text: string): string {
  const escapedText: {[k: string]: string} = {
    '&': '&a;',
    '"': '&q;',
    '\'': '&s;',
    '<': '&l;',
    '>': '&g;',
  };
  return text.replace(/[&"'<>]/g, s => escapedText[s]);
}

export function unescapeHtml(text: string): string {
  const unescapedText: {[k: string]: string} = {
    '&a;': '&',
    '&q;': '"',
    '&s;': '\'',
    '&l;': '<',
    '&g;': '>',
  };
  return text.replace(/&[^;]+;/g, s => unescapedText[s]);
}

/**
 * A type-safe key to use with `TransferState`.
 *
 * Example:
 *
 * ```
 * const COUNTER_KEY = makeStateKey<number>('counter');
 * let value = 10;
 *
 * transferState.set(COUNTER_KEY, value);
 * ```
 *
 * @experimental
 */
export type StateKey<T> = string & {__not_a_string: never};

/**
 * Create a `StateKey<T>` that can be used to store value of type T with `TransferState`.
 *
 * Example:
 *
 * ```
 * const COUNTER_KEY = makeStateKey<number>('counter');
 * let value = 10;
 *
 * transferState.set(COUNTER_KEY, value);
 * ```
 *
 * @experimental
 */
export function makeStateKey<T = void>(key: string): StateKey<T> {
  return key as StateKey<T>;
}

/**
 * A key value store that is transferred from the application on the server side to the application
 * on the client side.
 *
 * `TransferState` will be available as an injectable token. To use it import
 * `ServerTransferStateModule` on the server and `BrowserTransferStateModule` on the client.
 *
 * The values in the store are serialized/deserialized using JSON.stringify/JSON.parse. So only
 * boolean, number, string, null and non-class objects will be serialized and deserialzied in a
 * non-lossy manner.
 *
 * @experimental
 */
@Injectable()
export class TransferState {
  private store: {[k: string]: {} | undefined} = {};
  private initialized$: Observable<{[k: string]: {} | undefined}>;
  private onSerializeCallbacks: {[k: string]: () => {} | undefined} = {};

  /** @internal */
  static init(initState: {}, initialStore?: Promise<{[k: string]: {} | undefined}>) {
    const transferState = new TransferState();
    if (initialStore) {
      transferState.initialized$ = new Observable(obs => {
        initialStore !.then(store => {
          transferState.store = store;
          obs.next();
          obs.complete();
        });
      });
      return transferState;
    } else {
      transferState.store = initState;
      return transferState;
    }
  }

  private _get<T>(key: StateKey<T>, defaultValue: T): T {
    return this.store[key] !== undefined ? this.store[key] as T : defaultValue;
  }

  /**
   *  Get the value corresponding to a key. Return `defaultValue` if key is not found.
   */
  getAsync<T>(key: StateKey<T>, defaultValue: T): Observable<T> {
    if (!this.initialized$) {
      throw new Error('To use getAsync you must use BrowserTransferStateModule.withAsync()');
    }
    return map.call(this.initialized$, (_: any) => this._get(key, defaultValue));
  }

  /**
   * Get the value corresponding to a key. Return `defaultValue` if key is not found.
   *
   * @deprecated Use getAsync instead.
   */
  get<T>(key: StateKey<T>, defaultValue: T): T { return this._get(key, defaultValue); }

  /**
   * Set the value corresponding to a key.
   */
  set<T>(key: StateKey<T>, value: T): void { this.store[key] = value; }

  /**
   * Remove a key from the store.
   */
  remove<T>(key: StateKey<T>): void { delete this.store[key]; }

  private _hasKey<T>(key: StateKey<T>): boolean { return this.store.hasOwnProperty(key); }

  /**
   * Test whether a key exists in the store.
   */
  hasKeyAsync<T>(key: StateKey<T>): Observable<boolean> {
    if (!this.initialized$) {
      throw new Error('To use hasKeyAsync you must use BrowserTransferStateModule.withAsync()');
    }
    return map.call(this.initialized$, (_: any) => this._hasKey(key));
  }

  /**
   * Test whether a key exists in the store.
   *
   * @deprecated Use hasKeyAsync instead.
   */
  hasKey<T>(key: StateKey<T>): boolean { return this._hasKey(key); }

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
    return JSON.stringify(this.store);
  }
}

export function initTransferState(doc: Document, appId: string, useAsync = false) {
  const getTransferedState: () => {} = () => {
    // Locate the script tag with the JSON data transferred from the server.
    // The id of the script tag is set to the Angular appId + 'state'.
    const script = doc.getElementById(appId + '-state');
    let initialState = {};
    if (script && script.textContent) {
      try {
        initialState = JSON.parse(unescapeHtml(script.textContent));
      } catch (e) {
        console.warn('Exception while restoring TransferState for app ' + appId, e);
      }
    }
    return initialState;
  };

  if (useAsync) {
    const initialContent: Promise<{[k: string]: {} | undefined}> =
        new Promise((resolve, reject) => {
          const contentDoneLoaded = (e?: Event) => {
            doc.removeEventListener('DOMContentLoaded', contentDoneLoaded);
            resolve(getTransferedState());
          };
          if (doc.readyState === 'complete' || doc.readyState === 'loaded') {
            contentDoneLoaded();
          } else {
            doc.addEventListener('DOMContentLoaded', contentDoneLoaded);
          }
        });

    const transferState = TransferState.init({}, initialContent);

    return transferState;
  } else {
    const initialState = getTransferedState();
    return TransferState.init(initialState);
  }
}

export function initTransferStateAsync(doc: Document, appId: string) {
  return initTransferState(doc, appId, true);
}

/**
 * NgModule to install on the client side while using the `TransferState` to transfer state from
 * server to client.
 *
 * @experimental
 */
@NgModule({
  providers: [{provide: TransferState, useFactory: initTransferState, deps: [DOCUMENT, APP_ID]}],
})
export class BrowserTransferStateModule {
  static withAsyncRetrieval(): ModuleWithProviders {
    return {
      ngModule: BrowserTransferStateModule,
      providers:
          [{provide: TransferState, useFactory: initTransferStateAsync, deps: [DOCUMENT, APP_ID]}]
    };
  }
}
