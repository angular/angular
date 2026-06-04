/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Decodes a URI component, falling back to the raw value if it cannot be decoded.
 *
 * A bare `%` or any other malformed percent-escape is a legal character in a
 * URL but makes `decodeURIComponent` throw a `URIError`. Callers that decode
 * attacker-influenced strings (e.g. `window.location`) can use this to fall
 * back to the raw value instead of letting the error escape.
 *
 * @param value potential URI component to decode.
 * @returns the decoded URI if it can be decoded, otherwise the original value.
 */
export function decodeURIComponentSafe(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    // Ignore any invalid uri component.
    return value;
  }
}
