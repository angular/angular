/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export function parseCookieValue(cookieStr: string, name: string): string | null {
  name = encodeURIComponent(name);
  for (const cookie of cookieStr.split(';')) {
    const eqIndex = cookie.indexOf('=');
    const [cookieName, cookieValue]: string[] =
      eqIndex == -1 ? [cookie, ''] : [cookie.slice(0, eqIndex), cookie.slice(eqIndex + 1)];
    if (cookieName.trim() === name) {
      try {
        return decodeURIComponent(cookieValue);
      } catch {
        // A bare `%` is a valid cookie-octet per RFC 6265, but is not a valid
        // percent-encoding sequence, so `decodeURIComponent` throws on it. Fall
        // back to the raw value rather than letting the error escape to callers.
        return cookieValue;
      }
    }
  }
  return null;
}
