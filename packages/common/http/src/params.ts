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
 * @publicApi
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
 * @publicApi
 */
export class HttpUrlEncodingCodec implements HttpParameterCodec {
  encodeKey(key: string): string { return standardEncoding(key); }

  encodeValue(value: string): string { return standardEncoding(value); }

  decodeKey(key: string): string { return decodeURIComponent(key); }

  decodeValue(value: string) { return decodeURIComponent(value); }
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

/** Options used to construct an `HttpParams` instance. */
export interface HttpParamsOptions {
  /**
   * String representation of the HTTP params in URL-query-string format. Mutually exclusive with
   * `fromObject`.
   */
  fromString?: string;

  /** Object map of the HTTP params. Mutally exclusive with `fromString`. */
  fromObject?: {[param: string]: string | string[]};

  /** Encoding codec used to parse and serialize the params. */
  encoder?: HttpParameterCodec;
}

/**
 * An HTTP request/response body that represents serialized parameters,
 * per the MIME type `application/x-www-form-urlencoded`.
 *
 * This class is immutable - all mutation operations return a new instance.
 *
 * @publicApi
 */
export class HttpParams {
  private map: Map<string, string[]>|null;
  private encoder: HttpParameterCodec;
  private updates: Update[]|null = null;
  private cloneFrom: HttpParams|null = null;

  constructor(options: HttpParamsOptions = {} as HttpParamsOptions) {
    this.encoder = options.encoder || new HttpUrlEncodingCodec();
    if (!!options.fromString) {
      if (!!options.fromObject) {
        throw new Error(`Cannot specify both fromString and fromObject.`);
      }
      this.map = paramParser(options.fromString, this.encoder);
    } else if (!!options.fromObject) {
      this.map = new Map<string, string[]>();
      Object.keys(options.fromObject).forEach(key => {
        const value = (options.fromObject as any)[key];
        this.map !.set(key, Array.isArray(value) ? value : [value]);
      });
    } else {
      this.map = null;
    }
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
    const clone = new HttpParams({ encoder: this.encoder } as HttpParamsOptions);
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
