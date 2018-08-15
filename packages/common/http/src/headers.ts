/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

interface Update {
  name: string;
  value?: string|string[];
  op: 'a'|'s'|'d';
}

/**
 * Represents the header configuration options for an HTTP request.
 * Instances are immutable. Modifying methods return a cloned
 * instance with the change. The original object is never changed.
 *
 * @publicApi
 */
export class HttpHeaders {
  /**
   * Internal map of lowercase header names to values.
   */
  // TODO(issue/24571): remove '!'.
  private headers!: Map<string, string[]>;


  /**
   * Internal map of lowercased header names to the normalized
   * form of the name (the form seen first).
   */
  private normalizedNames: Map<string, string> = new Map();

  /**
   * Complete the lazy initialization of this object (needed before reading).
   */
  private lazyInit!: HttpHeaders|Function|null;

  /**
   * Queued updates to be materialized the next initialization.
   */
  private lazyUpdate: Update[]|null = null;

  /**  Constructs a new HTTP header object with the given values.*/

  constructor(headers?: string|{[name: string]: string | string[]}) {
    if (!headers) {
      this.headers = new Map<string, string[]>();
    } else if (typeof headers === 'string') {
      this.lazyInit = () => {
        this.headers = new Map<string, string[]>();
        headers.split('\n').forEach(line => {
          const index = line.indexOf(':');
          if (index > 0) {
            const name = line.slice(0, index);
            const key = name.toLowerCase();
            const value = line.slice(index + 1).trim();
            this.maybeSetNormalizedName(name, key);
            if (this.headers.has(key)) {
              this.headers.get(key)!.push(value);
            } else {
              this.headers.set(key, [value]);
            }
          }
        });
      };
    } else {
      this.lazyInit = () => {
        this.headers = new Map<string, string[]>();
        Object.keys(headers).forEach(name => {
          let values: string|string[] = headers[name];
          const key = name.toLowerCase();
          if (typeof values === 'string') {
            values = [values];
          }
          if (values.length > 0) {
            this.headers.set(key, values);
            this.maybeSetNormalizedName(name, key);
          }
        });
      };
    }
  }

  /**
   * Checks for existence of a given header.
   *
   * @param name The header name to check for existence.
   *
   * @returns True if the header exists, false otherwise.
   */
  has(name: string): boolean {
    this.init();

    return this.headers.has(name.toLowerCase());
  }

  /**
   * Retrieves the first value of a given header.
   *
   * @param name The header name.
   *
   * @returns The value string if the header exists, null otherwise
   */
  get(name: string): string|null {
    this.init();

    const values = this.headers.get(name.toLowerCase());
    return values && values.length > 0 ? values[0] : null;
  }

  /**
   * Retrieves the names of the headers.
   *
   * @returns A list of header names.
   */
  keys(): string[] {
    this.init();

    return Array.from(this.normalizedNames.values());
  }

  /**
   * Retrieves a list of values for a given header.
   *
   * @param name The header name from which to retrieve values.
   *
   * @returns A string of values if the header exists, null otherwise.
   */
  getAll(name: string): string[]|null {
    this.init();

    return this.headers.get(name.toLowerCase()) || null;
  }

  /**
   * Appends a new value to the existing set of values for a header
   * and returns them in a clone of the original instance.
   *
   * @param name The header name for which to append the values.
   * @param value The value to append.
   *
   * @returns A clone of the HTTP headers object with the value appended to the given header.
   */

  append(name: string, value: string|string[]): HttpHeaders {
    return this.clone({name, value, op: 'a'});
  }
  /**
   * Sets or modifies a value for a given header in a clone of the original instance.
   * If the header already exists, its value is replaced with the given value
   * in the returned object.
   *
   * @param name The header name.
   * @param value The value or values to set or overide for the given header.
   *
   * @returns A clone of the HTTP headers object with the newly set header value.
   */
  set(name: string, value: string|string[]): HttpHeaders {
    return this.clone({name, value, op: 's'});
  }
  /**
   * Deletes values for a given header in a clone of the original instance.
   *
   * @param name The header name.
   * @param value The value or values to delete for the given header.
   *
   * @returns A clone of the HTTP headers object with the given value deleted.
   */
  delete(name: string, value?: string|string[]): HttpHeaders {
    return this.clone({name, value, op: 'd'});
  }

  private maybeSetNormalizedName(name: string, lcName: string): void {
    if (!this.normalizedNames.has(lcName)) {
      this.normalizedNames.set(lcName, name);
    }
  }

  private init(): void {
    if (!!this.lazyInit) {
      if (this.lazyInit instanceof HttpHeaders) {
        this.copyFrom(this.lazyInit);
      } else {
        this.lazyInit();
      }
      this.lazyInit = null;
      if (!!this.lazyUpdate) {
        this.lazyUpdate.forEach(update => this.applyUpdate(update));
        this.lazyUpdate = null;
      }
    }
  }

  private copyFrom(other: HttpHeaders) {
    other.init();
    Array.from(other.headers.keys()).forEach(key => {
      this.headers.set(key, other.headers.get(key)!);
      this.normalizedNames.set(key, other.normalizedNames.get(key)!);
    });
  }

  private clone(update: Update): HttpHeaders {
    const clone = new HttpHeaders();
    clone.lazyInit =
        (!!this.lazyInit && this.lazyInit instanceof HttpHeaders) ? this.lazyInit : this;
    clone.lazyUpdate = (this.lazyUpdate || []).concat([update]);
    return clone;
  }

  private applyUpdate(update: Update): void {
    const key = update.name.toLowerCase();
    switch (update.op) {
      case 'a':
      case 's':
        let value = update.value!;
        if (typeof value === 'string') {
          value = [value];
        }
        if (value.length === 0) {
          return;
        }
        this.maybeSetNormalizedName(update.name, key);
        const base = (update.op === 'a' ? this.headers.get(key) : undefined) || [];
        base.push(...value);
        this.headers.set(key, base);
        break;
      case 'd':
        const toDelete = update.value as string | undefined;
        if (!toDelete) {
          this.headers.delete(key);
          this.normalizedNames.delete(key);
        } else {
          let existing = this.headers.get(key);
          if (!existing) {
            return;
          }
          existing = existing.filter(value => toDelete.indexOf(value) === -1);
          if (existing.length === 0) {
            this.headers.delete(key);
            this.normalizedNames.delete(key);
          } else {
            this.headers.set(key, existing);
          }
        }
        break;
    }
  }

  /**
   * @internal
   */
  forEach(fn: (name: string, values: string[]) => void) {
    this.init();
    Array.from(this.normalizedNames.keys())
        .forEach(key => fn(this.normalizedNames.get(key)!, this.headers.get(key)!));
  }
}
