/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export function sanitizeObject(obj: any): any {
  // Keep track of visited objects to detect circular references.
  const seen = new WeakSet();

  function recurse(value: any): any {
    // Primitives and null
    if (value === null || typeof value !== 'object') {
      // Some primitives are not serializable
      if (
        typeof value === 'function' ||
        typeof value === 'symbol' ||
        typeof value === 'bigint' ||
        value === undefined
      ) {
        return '[Non-serializable data]';
      }

      // Most other primitives are serializable
      return value;
    }

    // Down here we only have objects
    // Check for circular references
    if (seen.has(value)) {
      return '[Circular]';
    }
    seen.add(value);

    // Recursively serialize arrays
    if (Array.isArray(value)) {
      return value.map(recurse);
    }

    // Recursively serialize objects
    const result: Record<string, any> = {};
    for (const [key, propValue] of Object.entries(value)) {
      result[key] = recurse(propValue);
    }
    return result;
  }

  return recurse(obj);
}
