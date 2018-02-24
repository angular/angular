/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DOCUMENT, isPlatformServer} from '@angular/common';
import {APP_ID, Inject, Injectable, NgModule, PLATFORM_ID} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Subscriber} from 'rxjs/Subscriber';

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
  private contentLoaded: boolean;
  private store: {[k: string]: {} | undefined} = {};
  private onSerializeCallbacks: {[k: string]: () => {} | undefined} = {};

  constructor(
      @Inject(DOCUMENT) private doc: any, @Inject(APP_ID) appId: string,
      @Inject(PLATFORM_ID) platformId: Object) {
    const script = doc.getElementById(appId + '-state');
    this.contentLoaded = isPlatformServer(platformId) || (script && script.textContent);

    if (this.contentLoaded) {
      this.store = getTransferState(doc, appId);
    } else {
      const handler = () => {
        this.store = getTransferState(doc, appId);
        this.contentLoaded = true;
        doc.removeEventListener('DOMContentLoaded', handler);
      };

      doc.addEventListener('DOMContentLoaded', handler);
    }
  }

  /**
   * Get the value corresponding to a key. Return `defaultValue` if key is not found.
   * @deprecated use get$
   */
  get<T>(key: StateKey<T>, defaultValue: T): T {
    return this.store[key] !== undefined ? this.store[key] as T : defaultValue;
  }

  /**
   * Set the value corresponding to a key.
   */
  set<T>(key: StateKey<T>, value: T) { this.store[key] = value; }

  /**
   * Remove a key from the store.
   */
  remove<T>(key: StateKey<T>) { delete this.store[key]; }

  /**
   * Test whether a key exists in the store.
   * @deprecated use hasKey$
   */
  hasKey<T>(key: StateKey<T>): boolean { return this.store.hasOwnProperty(key); }

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

  /**
   * Get the value corresponding to a key. Return `defaultValue` if key is not found.
   */
  get$<T>(key: StateKey<T>, defaultValue: T): Observable<T> {
    return Observable.create((observer: Subscriber<T>) => {
      const handler = () => observer.next(this.get(key, defaultValue));
      const teardown = () => this.doc.removeEventListener('DOMContentLoaded', handler);
      this.contentLoaded ? handler() : this.doc.addEventListener('DOMContentLoaded', handler);
      return this.contentLoaded ? () => {} : teardown;
    });
  }

  /**
   * Test whether a key exists in the store.
   */
  hasKey$<T>(key: StateKey<T>): Observable<boolean> {
    return Observable.create((observer: Subscriber<boolean>) => {
      const handler = () => observer.next(this.hasKey(key));
      const teardown = () => this.doc.removeEventListener('DOMContentLoaded', handler);
      this.contentLoaded ? handler() : this.doc.addEventListener('DOMContentLoaded', handler);
      return this.contentLoaded ? () => {} : teardown;
    });
  }
}

/** Retrieve the TransferState object from the DOM */
function getTransferState(doc: Document, appId: string) {
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
}

/**
 * NgModule to install on the client side while using the `TransferState` to transfer state from
 * server to client.
 *
 * @experimental
 */
@NgModule({
  providers: [TransferState],
})
export class BrowserTransferStateModule {
}
