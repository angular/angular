/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * An abstract table, with the ability to read/write objects stored under keys.
 */
export interface Table {
  /**
   * The name of this table in the database.
   */
  name: string;

  /**
   * Delete a key from the table.
   */
  'delete'(key: string): Promise<boolean>;

  /**
   * List all the keys currently stored in the table.
   */
  keys(): Promise<string[]>;

  /**
   * Read a key from a table, either as an Object or with a given type.
   */
  read(key: string): Promise<Object>;
  read<T>(key: string): Promise<T>;

  /**
   * Write a new value for a key to the table, overwriting any previous value.
   */
  write(key: string, value: Object): Promise<void>;
}

/**
 * An abstract database, consisting of multiple named `Table`s.
 */
export interface Database {
  /**
   * Delete an entire `Table` from the database, by name.
   */
  'delete'(table: string): Promise<boolean>;

  /**
   * List all `Table`s by name.
   */
  list(): Promise<string[]>;

  /**
   * Open a `Table`.
   */
  open(table: string, cacheQueryOptions?: CacheQueryOptions): Promise<Table>;
}

/**
 * An error returned in rejected promises if the given key is not found in the table.
 */
export class NotFound {
  constructor(public table: string, public key: string) {}
}
