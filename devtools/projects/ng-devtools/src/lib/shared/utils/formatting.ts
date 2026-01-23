/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Formats a byte count into a readable string with appropriate units.
 * @param bytes The number of bytes to format
 * @returns A formatted string with units (B, KB, MB)
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Formatter functions for different value types
 */
const formatters = {
  null: () => 'null',
  undefined: () => 'undefined',
  string: (val: string) => `"${val}"`,
  object: (val: object) => JSON.stringify(val, null, 2),
  default: (val: unknown) => String(val),
};

/**
 * Formats a value into a readable string representation
 * @param value The value to format
 * @returns A formatted string representation of the value
 */
export function getFormattedValue(value: unknown): string {
  if (value === null) return formatters.null();
  if (value === undefined) return formatters.undefined();
  if (typeof value === 'string') return formatters.string(value);
  if (typeof value === 'object') return formatters.object(value);
  return formatters.default(value);
}
