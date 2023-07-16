/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * A wrapper around the `XMLHttpRequest` constructor.
 *
 * @publicApi
 */
export abstract class XhrFactory {
  abstract build(): XMLHttpRequest;

  /**
   * This method is used to build the serialized request body.
   * The return type can be one of the following: ArrayBuffer, Blob, FormData, URLSearchParams, string, or null.
   * 
   * Default implementation added.
   * 
   * @param body The body to serialize.
   * @returns The serialized request body.
   */
  serialize?<T>(body: T|null): ArrayBuffer | Blob | FormData | URLSearchParams | string | null {
    return null;
  };
}
