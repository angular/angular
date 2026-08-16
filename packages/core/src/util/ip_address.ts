/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

const v4Seg = '(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])';
const v4Str = `(?:${v4Seg}\\.){3}${v4Seg}`;
const v6Seg = '(?:[0-9a-fA-F]{1,4})';

const IPV4_REGEX = new RegExp(`^${v4Str}$`);

const IPV6_REGEX = new RegExp(
  '^(?:' +
    `(?:${v6Seg}:){7}(?:${v6Seg}|:)|` +
    `(?:${v6Seg}:){6}(?:${v4Str}|:${v6Seg}|:)|` +
    `(?:${v6Seg}:){5}(?::${v4Str}|(?::${v6Seg}){1,2}|:)|` +
    `(?:${v6Seg}:){4}(?:(?::${v6Seg}){0,1}:${v4Str}|(?::${v6Seg}){1,3}|:)|` +
    `(?:${v6Seg}:){3}(?:(?::${v6Seg}){0,2}:${v4Str}|(?::${v6Seg}){1,4}|:)|` +
    `(?:${v6Seg}:){2}(?:(?::${v6Seg}){0,3}:${v4Str}|(?::${v6Seg}){1,5}|:)|` +
    `(?:${v6Seg}:){1}(?:(?::${v6Seg}){0,4}:${v4Str}|(?::${v6Seg}){1,6}|:)|` +
    `(?::(?:(?::${v6Seg}){0,5}:${v4Str}|(?::${v6Seg}){1,7}|:))` +
    ')(?:%[0-9a-zA-Z-.:]{1,})?$',
);

/**
 * Validates whether a given string is a valid IPv4 or IPv6 address.
 *
 * This function checks strings against standard IP format rules:
 * - **IPv4**: Consists of four octets separated by periods (`.`), where each octet is a decimal
 *   number between 0 and 255 with no leading zeros (e.g., `192.168.1.1`).
 * - **IPv6**: Consists of eight 16-bit hex blocks separated by colons (`:`), with support for
 *   zero compression (`::`), IPv4-mapped IPv6 addresses (e.g., `::ffff:192.168.1.1`), and optional
 *   scoped zone identifiers (e.g., `%eth0`).
 * - **Unspecified Version**: Tests against IPv4 first, falling back to IPv6 if IPv4 fails.
 *
 * ## Implementation background
 *
 * The regular expression patterns and logic used in this implementation were ported over from the
 * Node.js core `net` module (specifically `lib/internal/net.js`):
 * https://github.com/nodejs/node/blob/main/lib/internal/net.js
 *
 * ### Why Port This Over?
 * The `node:net` module is a Node.js server/runtime API and is **not available in normal browser
 * client-side JavaScript**. Because `node:net` relies on native C++ bindings for OS socket APIs, browser
 * environments (and client-side bundlers like Vite/Webpack used in Angular) cannot resolve or execute it.
 *
 * @param value The string to validate as an IP address.
 * @returns `4` if valid IPv4, `6` if valid IPv6, or `0` if invalid or not matching the requested version.
 */
export function isIpAddress(value: string): 4 | 6 | 0 {
  if (IPV4_REGEX.test(value)) {
    return 4;
  }
  if (IPV6_REGEX.test(value)) {
    return 6;
  }
  return 0;
}
