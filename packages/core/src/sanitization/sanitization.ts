/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {getCurrentSanitizer} from '../render3/state';
import {stringify} from '../render3/util';

import {BypassType, allowSanitizationBypass} from './bypass';
import {_sanitizeHtml as _sanitizeHtml} from './html_sanitizer';
import {SecurityContext} from './security';
import {StyleSanitizeFn, _sanitizeStyle as _sanitizeStyle} from './style_sanitizer';
import {_sanitizeUrl as _sanitizeUrl} from './url_sanitizer';



/**
 * An `html` sanitizer which converts untrusted `html` **string** into trusted string by removing
 * dangerous content.
 *
 * This method parses the `html` and locates potentially dangerous content (such as urls and
 * javascript) and removes it.
 *
 * It is possible to mark a string as trusted by calling {@link bypassSanitizationTrustHtml}.
 *
 * @param unsafeHtml untrusted `html`, typically from the user.
 * @returns `html` string which is safe to display to user, because all of the dangerous javascript
 * and urls have been removed.
 */
export function sanitizeHtml(unsafeHtml: any): string {
  const s = getCurrentSanitizer();
  if (s) {
    return s.sanitize(SecurityContext.HTML, unsafeHtml) || '';
  }
  if (allowSanitizationBypass(unsafeHtml, BypassType.Html)) {
    return unsafeHtml.toString();
  }
  return _sanitizeHtml(document, stringify(unsafeHtml));
}

/**
 * A `style` sanitizer which converts untrusted `style` **string** into trusted string by removing
 * dangerous content.
 *
 * This method parses the `style` and locates potentially dangerous content (such as urls and
 * javascript) and removes it.
 *
 * It is possible to mark a string as trusted by calling {@link bypassSanitizationTrustStyle}.
 *
 * @param unsafeStyle untrusted `style`, typically from the user.
 * @returns `style` string which is safe to bind to the `style` properties, because all of the
 * dangerous javascript and urls have been removed.
 */
export function sanitizeStyle(unsafeStyle: any): string {
  const s = getCurrentSanitizer();
  if (s) {
    return s.sanitize(SecurityContext.STYLE, unsafeStyle) || '';
  }
  if (allowSanitizationBypass(unsafeStyle, BypassType.Style)) {
    return unsafeStyle.toString();
  }
  return _sanitizeStyle(stringify(unsafeStyle));
}

/**
 * A `url` sanitizer which converts untrusted `url` **string** into trusted string by removing
 * dangerous
 * content.
 *
 * This method parses the `url` and locates potentially dangerous content (such as javascript) and
 * removes it.
 *
 * It is possible to mark a string as trusted by calling {@link bypassSanitizationTrustUrl}.
 *
 * @param unsafeUrl untrusted `url`, typically from the user.
 * @returns `url` string which is safe to bind to the `src` properties such as `<img src>`, because
 * all of the dangerous javascript has been removed.
 */
export function sanitizeUrl(unsafeUrl: any): string {
  const s = getCurrentSanitizer();
  if (s) {
    return s.sanitize(SecurityContext.URL, unsafeUrl) || '';
  }
  if (allowSanitizationBypass(unsafeUrl, BypassType.Url)) {
    return unsafeUrl.toString();
  }
  return _sanitizeUrl(stringify(unsafeUrl));
}

/**
 * A `url` sanitizer which only lets trusted `url`s through.
 *
 * This passes only `url`s marked trusted by calling {@link bypassSanitizationTrustResourceUrl}.
 *
 * @param unsafeResourceUrl untrusted `url`, typically from the user.
 * @returns `url` string which is safe to bind to the `src` properties such as `<img src>`, because
 * only trusted `url`s have been allowed to pass.
 */
export function sanitizeResourceUrl(unsafeResourceUrl: any): string {
  const s = getCurrentSanitizer();
  if (s) {
    return s.sanitize(SecurityContext.RESOURCE_URL, unsafeResourceUrl) || '';
  }
  if (allowSanitizationBypass(unsafeResourceUrl, BypassType.ResourceUrl)) {
    return unsafeResourceUrl.toString();
  }
  throw new Error('unsafe value used in a resource URL context (see http://g.co/ng/security#xss)');
}

/**
 * A `script` sanitizer which only lets trusted javascript through.
 *
 * This passes only `script`s marked trusted by calling {@link bypassSanitizationTrustScript}.
 *
 * @param unsafeScript untrusted `script`, typically from the user.
 * @returns `url` string which is safe to bind to the `<script>` element such as `<img src>`,
 * because only trusted `scripts`s have been allowed to pass.
 */
export function sanitizeScript(unsafeScript: any): string {
  const s = getCurrentSanitizer();
  if (s) {
    return s.sanitize(SecurityContext.SCRIPT, unsafeScript) || '';
  }
  if (allowSanitizationBypass(unsafeScript, BypassType.Script)) {
    return unsafeScript.toString();
  }
  throw new Error('unsafe value used in a script context');
}

/**
 * The default style sanitizer will handle sanitization for style properties by
 * sanitizing any CSS property that can include a `url` value (usually image-based properties)
 */
export const defaultStyleSanitizer = (function(prop: string, value?: string): string | boolean {
  if (value === undefined) {
    return prop === 'background-image' || prop === 'background' || prop === 'border-image' ||
        prop === 'filter' || prop === 'filter' || prop === 'list-style' ||
        prop === 'list-style-image';
  }

  return sanitizeStyle(value);
} as StyleSanitizeFn);
