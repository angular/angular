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

    if (cookieName.trim() !== name) {
      continue;
    }

    let value = cookieValue;
    try {
      value = decodeURIComponent(cookieValue);
    } catch {
      // Fall back to raw cookie value if decoding fails (e.g. malformed percent-encoding).
    }

    if (value.length > 1 && value[0] === '"' && value[value.length - 1] === '"') {
      value = value.slice(1, -1);
    }

    return value;
  }

  return null;
}
