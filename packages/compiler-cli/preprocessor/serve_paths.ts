/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as path from 'path';

/**
 * Maps an HTTP request target onto a file path inside `distDir`, or `null` if the target does
 * not name one.
 *
 * `path.normalize` followed by a leading-`../` strip is not a containment check: it only held
 * because Node's parser rejects a request target that does not start with `/`, which happens to
 * make `normalize` clamp the dot segments at the root. Resolve the path and assert the result is
 * under `distDir` instead, so containment does not depend on the parser.
 *
 * Symlinks inside `distDir` are followed. `dist` is generated from the caller's own workspace, so
 * that is a copy of what they already asked to serve, not an escape.
 */
export function resolveDistPath(distDir: string, url: string | undefined): string | null {
  // `/main.js?v=2` is a request for `/main.js`, not for a file whose name contains `?v=2`.
  const target = (url ?? '/').split(/[?#]/, 1)[0];

  let decoded: string;
  try {
    decoded = decodeURIComponent(target);
  } catch {
    // Malformed percent-escape.
    return null;
  }
  if (decoded.includes('\0')) {
    return null;
  }

  const root = path.resolve(distDir);
  // Anchor at `/` so dot segments are resolved against the URL root, then map onto the filesystem
  // relative to `root`.
  const urlPath = path.posix.normalize('/' + decoded.replace(/^\/+/, ''));
  const resolved = path.resolve(root, '.' + urlPath);

  if (resolved !== root && !resolved.startsWith(root + path.sep)) {
    return null;
  }
  return resolved;
}
