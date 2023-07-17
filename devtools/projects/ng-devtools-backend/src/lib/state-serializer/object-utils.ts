/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// Intentionally do not include the prototype because it contains
// inherited methods (hasOwnProperty, etc.). Also ignore symbols
// because it is tricky to pass a path to a symbol.
//
// We'd have to go through a serialization and deserialization logic
// which will add unnecessary complexity.
export const getKeys = (obj: {}): string[] => {
  if (!obj) {
    return [];
  }
  return Object.getOwnPropertyNames(obj);
};
