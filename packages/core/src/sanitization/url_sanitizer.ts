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
 * (1) Either a protocol that is not javascript:, and that has valid characters
 *     (alphanumeric or [+-.]).
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
 * This regular expression was taken from the Closure sanitization library.
 */
const SAFE_URL_PATTERN = /^(?!javascript:)(?:[a-z0-9+.-]+:|[^&:\/?#]*(?:[\/?#]|$))/i;

/**
 * A pattern that matches safe `data:` URLs. Only binary media MIME types (image, video, audio)
 * with base64 encoding are permitted. This prevents dangerous MIME types such as
 * `data:text/html` or `data:application/javascript` from being used as XSS vectors when
 * Angular binds URLs in templates or sanitizes innerHTML content.
 *
 * Note: `data:image/svg+xml` is intentionally excluded because SVG documents can embed
 * executable scripts, making them unsafe when opened via a link or navigation.
 *
 * Allowed image types: bmp, gif, jpeg, jpg, png, tiff, webp
 * Allowed video types: mpeg, mp4, ogg, webm
 * Allowed audio types: 3gpp, 3gpp2, aac, midi, mp3, mp4, mpeg, ogg, opus, wav, webm, x-m4a
 */
const SAFE_DATA_URL_PATTERN =
  /^data:(?:image\/(?:bmp|gif|jpeg|jpg|png|tiff|webp)|video\/(?:mpeg|mp4|ogg|webm)|audio\/(?:3gpp|3gpp2|aac|midi|mp3|mp4|mpeg|ogg|opus|wav|webm|x-m4a));base64,[a-z0-9+\/]+=*$/i;

export function _sanitizeUrl(url: string): string {
  url = String(url);
  if (/^data:/i.test(url)) {
    // `data:` URLs require special handling: only safe binary media MIME types with base64
    // encoding are permitted. This prevents `data:text/html` and similar MIME types from
    // bypassing sanitization and enabling XSS via innerHTML or URL bindings.
    if (SAFE_DATA_URL_PATTERN.test(url)) return url;

    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      console.warn(`WARNING: sanitizing unsafe URL value ${url} (see ${XSS_SECURITY_URL})`);
    }

    return 'unsafe:' + url;
  }

  if (SAFE_URL_PATTERN.test(url)) return url;

  if (typeof ngDevMode === 'undefined' || ngDevMode) {
    console.warn(`WARNING: sanitizing unsafe URL value ${url} (see ${XSS_SECURITY_URL})`);
  }

  return 'unsafe:' + url;
}
