/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Polyfill for [Headers](https://developer.mozilla.org/en-US/docs/Web/API/Headers/Headers), as
 * specified in the [Fetch Spec](https://fetch.spec.whatwg.org/#headers-class).
 *
 * The only known difference between this `Headers` implementation and the spec is the
 * lack of an `entries` method.
 *
 * @usageNotes
 * ### Example
 *
 * ```
 * import {Headers} from '@angular/http';
 *
 * var firstHeaders = new Headers();
 * firstHeaders.append('Content-Type', 'image/jpeg');
 * console.log(firstHeaders.get('Content-Type')) //'image/jpeg'
 *
 * // Create headers from Plain Old JavaScript Object
 * var secondHeaders = new Headers({
 *   'X-My-Custom-Header': 'Angular'
 * });
 * console.log(secondHeaders.get('X-My-Custom-Header')); //'Angular'
 *
 * var thirdHeaders = new Headers(secondHeaders);
 * console.log(thirdHeaders.get('X-My-Custom-Header')); //'Angular'
 * ```
 *
 * @deprecated see https://angular.io/guide/http
 * @publicApi
 */
export class Headers {
  /** @internal header names are lower case */
  _headers: Map<string, string[]> = new Map();
  /** @internal map lower case names to actual names */
  _normalizedNames: Map<string, string> = new Map();

  // TODO(vicb): any -> string|string[]
  constructor(headers?: Headers|{[name: string]: any}|null) {
    if (!headers) {
      return;
    }

    if (headers instanceof Headers) {
      headers.forEach((values: string[], name: string) => {
        values.forEach(value => this.append(name, value));
      });
      return;
    }

    Object.keys(headers).forEach((name: string) => {
      const values: string[] = Array.isArray(headers[name]) ? headers[name] : [headers[name]];
      this.delete(name);
      values.forEach(value => this.append(name, value));
    });
  }

  /**
   * Returns a new Headers instance from the given DOMString of Response Headers
   */
  static fromResponseHeaderString(headersString: string): Headers {
    const headers = new Headers();

    headersString.split('\n').forEach(line => {
      const index = line.indexOf(':');
      if (index > 0) {
        const name = line.slice(0, index);
        const value = line.slice(index + 1).trim();
        headers.set(name, value);
      }
    });

    return headers;
  }

  /**
   * Appends a header to existing list of header values for a given header name.
   */
  append(name: string, value: string): void {
    const values = this.getAll(name);

    if (values === null) {
      this.set(name, value);
    } else {
      values.push(value);
    }
  }

  /**
   * Deletes all header values for the given name.
   */
  delete (name: string): void {
    const lcName = name.toLowerCase();
    this._normalizedNames.delete(lcName);
    this._headers.delete(lcName);
  }

  forEach(fn: (values: string[], name: string|undefined, headers: Map<string, string[]>) => void):
      void {
    this._headers.forEach(
        (values, lcName) => fn(values, this._normalizedNames.get(lcName), this._headers));
  }

  /**
   * Returns first header that matches given name.
   */
  get(name: string): string|null {
    const values = this.getAll(name);

    if (values === null) {
      return null;
    }

    return values.length > 0 ? values[0] : null;
  }

  /**
   * Checks for existence of header by given name.
   */
  has(name: string): boolean { return this._headers.has(name.toLowerCase()); }

  /**
   * Returns the names of the headers
   */
  keys(): string[] { return Array.from(this._normalizedNames.values()); }

  /**
   * Sets or overrides header value for given name.
   */
  set(name: string, value: string|string[]): void {
    if (Array.isArray(value)) {
      if (value.length) {
        this._headers.set(name.toLowerCase(), [value.join(',')]);
      }
    } else {
      this._headers.set(name.toLowerCase(), [value]);
    }
    this.mayBeSetNormalizedName(name);
  }

  /**
   * Returns values of all headers.
   */
  values(): string[][] { return Array.from(this._headers.values()); }

  /**
   * Returns string of all headers.
   */
  // TODO(vicb): returns {[name: string]: string[]}
  toJSON(): {[name: string]: any} {
    const serialized: {[name: string]: string[]} = {};

    this._headers.forEach((values: string[], name: string) => {
      const split: string[] = [];
      values.forEach(v => split.push(...v.split(',')));
      serialized[this._normalizedNames.get(name) !] = split;
    });

    return serialized;
  }

  /**
   * Returns list of header values for a given name.
   */
  getAll(name: string): string[]|null {
    return this.has(name) ? this._headers.get(name.toLowerCase()) || null : null;
  }

  /**
   * This method is not implemented.
   */
  entries() { throw new Error('"entries" method is not implemented on Headers class'); }

  private mayBeSetNormalizedName(name: string): void {
    const lcName = name.toLowerCase();

    if (!this._normalizedNames.has(lcName)) {
      this._normalizedNames.set(lcName, name);
    }
  }
}
