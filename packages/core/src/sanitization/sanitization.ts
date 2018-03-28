/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {stringify} from '../render3/util';

import {_sanitizeHtml as _sanitizeHtml} from './html_sanitizer';
import {_sanitizeStyle as _sanitizeStyle} from './style_sanitizer';
import {_sanitizeUrl as _sanitizeUrl} from './url_sanitizer';

const BRAND = '__SANITIZER_TRUSTED_BRAND__';

/**
 * A branded trusted string used with sanitization.
 *
 * See: {@link TrustedHtmlString}, {@link TrustedResourceUrlString}, {@link TrustedScriptString},
 * {@link TrustedStyleString}, {@link TrustedUrlString}
 */
export interface TrustedString extends String {
  '__SANITIZER_TRUSTED_BRAND__': 'Html'|'Style'|'Script'|'Url'|'ResourceUrl';
}

/**
 * A branded trusted string used with sanitization of `html` strings.
 *
 * See: {@link bypassSanitizationTrustHtml} and {@link htmlSanitizer}.
 */
export interface TrustedHtmlString extends TrustedString { '__SANITIZER_TRUSTED_BRAND__': 'Html'; }

/**
 * A branded trusted string used with sanitization of `style` strings.
 *
 * See: {@link bypassSanitizationTrustStyle} and {@link styleSanitizer}.
 */
export interface TrustedStyleString extends TrustedString {
  '__SANITIZER_TRUSTED_BRAND__': 'Style';
}

/**
 * A branded trusted string used with sanitization of `url` strings.
 *
 * See: {@link bypassSanitizationTrustScript} and {@link scriptSanitizer}.
 */
export interface TrustedScriptString extends TrustedString {
  '__SANITIZER_TRUSTED_BRAND__': 'Script';
}

/**
 * A branded trusted string used with sanitization of `url` strings.
 *
 * See: {@link bypassSanitizationTrustUrl} and {@link urlSanitizer}.
 */
export interface TrustedUrlString extends TrustedString { '__SANITIZER_TRUSTED_BRAND__': 'Url'; }

/**
 * A branded trusted string used with sanitization of `resourceUrl` strings.
 *
 * See: {@link bypassSanitizationTrustResourceUrl} and {@link resourceUrlSanitizer}.
 */
export interface TrustedResourceUrlString extends TrustedString {
  '__SANITIZER_TRUSTED_BRAND__': 'ResourceUrl';
}

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
  if (unsafeHtml instanceof String && (unsafeHtml as TrustedHtmlString)[BRAND] === 'Html') {
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
  if (unsafeStyle instanceof String && (unsafeStyle as TrustedStyleString)[BRAND] === 'Style') {
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
  if (unsafeUrl instanceof String && (unsafeUrl as TrustedUrlString)[BRAND] === 'Url') {
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
  if (unsafeResourceUrl instanceof String &&
      (unsafeResourceUrl as TrustedResourceUrlString)[BRAND] === 'ResourceUrl') {
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
  if (unsafeScript instanceof String && (unsafeScript as TrustedScriptString)[BRAND] === 'Script') {
    return unsafeScript.toString();
  }
  throw new Error('unsafe value used in a script context');
}

/**
 * Mark `html` string as trusted.
 *
 * This function wraps the trusted string in `String` and brands it in a way which makes it
 * recognizable to {@link htmlSanitizer} to be trusted implicitly.
 *
 * @param trustedHtml `html` string which needs to be implicitly trusted.
 * @returns a `html` `String` which has been branded to be implicitly trusted.
 */
export function bypassSanitizationTrustHtml(trustedHtml: string): TrustedHtmlString {
  return bypassSanitizationTrustString(trustedHtml, 'Html');
}
/**
 * Mark `style` string as trusted.
 *
 * This function wraps the trusted string in `String` and brands it in a way which makes it
 * recognizable to {@link styleSanitizer} to be trusted implicitly.
 *
 * @param trustedStyle `style` string which needs to be implicitly trusted.
 * @returns a `style` `String` which has been branded to be implicitly trusted.
 */
export function bypassSanitizationTrustStyle(trustedStyle: string): TrustedStyleString {
  return bypassSanitizationTrustString(trustedStyle, 'Style');
}
/**
 * Mark `script` string as trusted.
 *
 * This function wraps the trusted string in `String` and brands it in a way which makes it
 * recognizable to {@link scriptSanitizer} to be trusted implicitly.
 *
 * @param trustedScript `script` string which needs to be implicitly trusted.
 * @returns a `script` `String` which has been branded to be implicitly trusted.
 */
export function bypassSanitizationTrustScript(trustedScript: string): TrustedScriptString {
  return bypassSanitizationTrustString(trustedScript, 'Script');
}
/**
 * Mark `url` string as trusted.
 *
 * This function wraps the trusted string in `String` and brands it in a way which makes it
 * recognizable to {@link urlSanitizer} to be trusted implicitly.
 *
 * @param trustedUrl `url` string which needs to be implicitly trusted.
 * @returns a `url` `String` which has been branded to be implicitly trusted.
 */
export function bypassSanitizationTrustUrl(trustedUrl: string): TrustedUrlString {
  return bypassSanitizationTrustString(trustedUrl, 'Url');
}
/**
 * Mark `url` string as trusted.
 *
 * This function wraps the trusted string in `String` and brands it in a way which makes it
 * recognizable to {@link resourceUrlSanitizer} to be trusted implicitly.
 *
 * @param trustedResourceUrl `url` string which needs to be implicitly trusted.
 * @returns a `url` `String` which has been branded to be implicitly trusted.
 */
export function bypassSanitizationTrustResourceUrl(trustedResourceUrl: string):
    TrustedResourceUrlString {
  return bypassSanitizationTrustString(trustedResourceUrl, 'ResourceUrl');
}


function bypassSanitizationTrustString(trustedString: string, mode: 'Html'): TrustedHtmlString;
function bypassSanitizationTrustString(trustedString: string, mode: 'Style'): TrustedStyleString;
function bypassSanitizationTrustString(trustedString: string, mode: 'Script'): TrustedScriptString;
function bypassSanitizationTrustString(trustedString: string, mode: 'Url'): TrustedUrlString;
function bypassSanitizationTrustString(
    trustedString: string, mode: 'ResourceUrl'): TrustedResourceUrlString;
function bypassSanitizationTrustString(
    trustedString: string,
    mode: 'Html' | 'Style' | 'Script' | 'Url' | 'ResourceUrl'): TrustedString {
  const trusted = new String(trustedString) as TrustedString;
  trusted[BRAND] = mode;
  return trusted;
}
