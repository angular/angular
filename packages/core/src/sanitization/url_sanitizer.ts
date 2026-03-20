/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {XSS_SECURITY_URL} from '../error_details_base_url';

/**
 * A pattern that recognizes URLs that are safe wrt. XSS in URL navigation
 * contexts.
 *
 * This regular expression matches a subset of URLs that will not cause script
 * execution if used in URL context within a HTML document. Specifically, this
 * regular expression matches if:
 * (1) Either a protocol that is not javascript: or vbscript:, and that has
 *     valid characters (alphanumeric or [+-.]).
 *     For data: URIs, only safe media subtypes (image/*, video/*, audio/*)
 *     are allowed. Other data: subtypes (e.g. data:text/html) are blocked
 *     as they can lead to script execution in some environments.
 * (2) or no protocol.  A protocol must be followed by a colon. The below
 *     allows that by allowing colons only after one of the characters [/?#].
 *     A colon after a hash (#) must be in the fragment.
 *     Otherwise, a colon after a (?) must be in a query.
 *     Otherwise, a colon after a single solidus (/) must be in a path.
 *     Otherwise, a colon after a double solidus (//) must be in the authority
 *     (before port).
 *
 * The pattern disallows &, used in HTML entity declarations before
 * one of the characters in [/?#]. This disallows HTML entities used in the
 * protocol name, which should never happen, e.g. "h&#116;tp" for "http".
 * It also disallows HTML entities in the first path part of a relative path,
 * e.g. "foo&lt;bar/baz".  Our existing escaping functions should not produce
 * that. More importantly, it disallows masking of a colon,
 * e.g. "javascript&#58;...".
 *
 * This regular expression was originally taken from the Closure sanitization
 * library and extended to also block vbscript: and dangerous data: subtypes.
 *
 * Note: data:image/svg+xml is allowed because SVG loaded via <img src> is
 * sandboxed by browsers (scripts do not execute). For <a href> contexts,
 * modern browsers (Chrome 60+, Firefox 59+) block top-level navigation to
 * data: URLs entirely, providing an additional layer of defense.
 */
const SAFE_URL_PATTERN =
  /^(?!javascript:)(?!vbscript:)(?!data:(?!image\/|video\/|audio\/))(?:[a-z0-9+.-]+:|[^&:\/?#]*(?:[\/?#]|$))/i;
export function _sanitizeUrl(url: string): string {
  url = String(url);
  if (url.match(SAFE_URL_PATTERN)) return url;

  if (typeof ngDevMode === 'undefined' || ngDevMode) {
    console.warn(`WARNING: sanitizing unsafe URL value ${url} (see ${XSS_SECURITY_URL})`);
  }

  return 'unsafe:' + url;
}
