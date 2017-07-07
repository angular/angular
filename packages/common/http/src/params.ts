/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * A codec for encoding and decoding parameters in URLs.
 *
 * Used by `HttpParams`.
 *
 *  @experimental
 **/
export interface HttpParameterCodec {
  encodeKey(key: string): string;
  encodeValue(value: string): string;

  decodeKey(key: string): string;
  decodeValue(value: string): string;
}

/**
 * A `HttpParameterCodec` that uses `encodeURIComponent` and `decodeURIComponent` to
 * serialize and parse URL parameter keys and values.
 *
 * @experimental
 */
export class HttpUrlEncodingCodec implements HttpParameterCodec {
  encodeKey(k: string): string { return standardEncoding(k); }

  encodeValue(v: string): string { return standardEncoding(v); }

  decodeKey(k: string): string { return decodeURIComponent(k); }

  decodeValue(v: string) { return decodeURIComponent(v); }
}


function paramParser(rawParams: string, codec: HttpParameterCodec): Map<string, string[]> {
  const map = new Map<string, string[]>();
  if (rawParams.length > 0) {
    const params: string[] = rawParams.split('&');
    params.forEach((param: string) => {
      const eqIdx = param.indexOf('=');
      const [key, val]: string[] = eqIdx == -1 ?
          [codec.decodeKey(param), ''] :
          [codec.decodeKey(param.slice(0, eqIdx)), codec.decodeValue(param.slice(eqIdx + 1))];
      const list = map.get(key) || [];
      list.push(val);
      map.set(key, list);
    });
  }
  return map;
}
function standardEncoding(v: string): string {
  return encodeURIComponent(v)
      .replace(/%40/gi, '@')
      .replace(/%3A/gi, ':')
      .replace(/%24/gi, '$')
      .replace(/%2C/gi, ',')
      .replace(/%3B/gi, ';')
      .replace(/%2B/gi, '+')
      .replace(/%3D/gi, '=')
      .replace(/%3F/gi, '?')
      .replace(/%2F/gi, '/');
}

interface Update {
  param: string;
  value?: string;
  op: 'a'|'d'|'s';
}

/**
 * An HTTP request/response body that represents serialized parameters,
 * per the MIME type `application/x-www-form-urlencoded`.
 *
 * This class is immuatable - all mutation operations return a new instance.
 *
 * @experimental
 */
export class HttpParams {
  private map: Map<string, string[]>|null;
  private encoder: HttpParameterCodec;
  private updates: Update[]|null = null;
  private cloneFrom: HttpParams|null = null;

  constructor(options: {
    fromString?: string,
    encoder?: HttpParameterCodec,
  } = {}) {
    this.encoder = options.encoder || new HttpUrlEncodingCodec();
    this.map = !!options.fromString ? paramParser(options.fromString, this.encoder) : null;
  }

  /**
   * Check whether the body has one or more values for the given parameter name.
   */
  has(param: string): boolean {
    this.init();
    return this.map !.has(param);
  }

  /**
   * Get the first value for the given parameter name, or `null` if it's not present.
   */
  get(param: string): string|null {
    this.init();
    const res = this.map !.get(param);
    return !!res ? res[0] : null;
  }

  /**
   * Get all values for the given parameter name, or `null` if it's not present.
   */
  getAll(param: string): string[]|null {
    this.init();
    return this.map !.get(param) || null;
  }

  /**
   * Get all the parameter names for this body.
   */
  keys(): string[] {
    this.init();
    return Array.from(this.map !.keys());
  }

  /**
   * Construct a new body with an appended value for the given parameter name.
   */
  append(param: string, value: string): HttpParams { return this.clone({param, value, op: 'a'}); }

  /**
   * Construct a new body with a new value for the given parameter name.
   */
  set(param: string, value: string): HttpParams { return this.clone({param, value, op: 's'}); }

  /**
   * Construct a new body with either the given value for the given parameter
   * removed, if a value is given, or all values for the given parameter removed
   * if not.
   */
  delete (param: string, value?: string): HttpParams { return this.clone({param, value, op: 'd'}); }

  /**
   * Serialize the body to an encoded string, where key-value pairs (separated by `=`) are
   * separated by `&`s.
   */
  toString(): string {
    this.init();
    return this.keys()
        .map(key => {
          const eKey = this.encoder.encodeKey(key);
          return this.map !.get(key) !.map(value => eKey + '=' + this.encoder.encodeValue(value))
              .join('&');
        })
        .join('&');
  }

  private clone(update: Update): HttpParams {
    const clone = new HttpParams({encoder: this.encoder});
    clone.cloneFrom = this.cloneFrom || this;
    clone.updates = (this.updates || []).concat([update]);
    return clone;
  }

  private init() {
    if (this.map === null) {
      this.map = new Map<string, string[]>();
    }
    if (this.cloneFrom !== null) {
      this.cloneFrom.init();
      this.cloneFrom.keys().forEach(key => this.map !.set(key, this.cloneFrom !.map !.get(key) !));
      this.updates !.forEach(update => {
        switch (update.op) {
          case 'a':
          case 's':
            const base = (update.op === 'a' ? this.map !.get(update.param) : undefined) || [];
            base.push(update.value !);
            this.map !.set(update.param, base);
            break;
          case 'd':
            if (update.value !== undefined) {
              let base = this.map !.get(update.param) || [];
              const idx = base.indexOf(update.value);
              if (idx !== -1) {
                base.splice(idx, 1);
              }
              if (base.length > 0) {
                this.map !.set(update.param, base);
              } else {
                this.map !.delete(update.param);
              }
            } else {
              this.map !.delete(update.param);
              break;
            }
        }
      });
      this.cloneFrom = null;
    }
  }
}
