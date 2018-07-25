/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const BRAND = '__SANITIZER_TRUSTED_BRAND__';

export const enum BypassType {
  Url = 'Url',
  Html = 'Html',
  ResourceUrl = 'ResourceUrl',
  Script = 'Script',
  Style = 'Style',
}

/**
 * A branded trusted string used with sanitization.
 *
 * See: {@link TrustedHtmlString}, {@link TrustedResourceUrlString}, {@link TrustedScriptString},
 * {@link TrustedStyleString}, {@link TrustedUrlString}
 */
export interface TrustedString extends String { [BRAND]: BypassType; }

/**
 * A branded trusted string used with sanitization of `html` strings.
 *
 * See: {@link bypassSanitizationTrustHtml} and {@link htmlSanitizer}.
 */
export interface TrustedHtmlString extends TrustedString { [BRAND]: BypassType.Html; }

/**
 * A branded trusted string used with sanitization of `style` strings.
 *
 * See: {@link bypassSanitizationTrustStyle} and {@link styleSanitizer}.
 */
export interface TrustedStyleString extends TrustedString { [BRAND]: BypassType.Style; }

/**
 * A branded trusted string used with sanitization of `url` strings.
 *
 * See: {@link bypassSanitizationTrustScript} and {@link scriptSanitizer}.
 */
export interface TrustedScriptString extends TrustedString { [BRAND]: BypassType.Script; }

/**
 * A branded trusted string used with sanitization of `url` strings.
 *
 * See: {@link bypassSanitizationTrustUrl} and {@link urlSanitizer}.
 */
export interface TrustedUrlString extends TrustedString { [BRAND]: BypassType.Url; }

/**
 * A branded trusted string used with sanitization of `resourceUrl` strings.
 *
 * See: {@link bypassSanitizationTrustResourceUrl} and {@link resourceUrlSanitizer}.
 */
export interface TrustedResourceUrlString extends TrustedString { [BRAND]: BypassType.ResourceUrl; }

export function allowSanitizationBypass(value: any, type: BypassType): boolean {
  return (value instanceof String && (value as TrustedStyleString)[BRAND] === type) ? true : false;
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
  return bypassSanitizationTrustString(trustedHtml, BypassType.Html);
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
  return bypassSanitizationTrustString(trustedStyle, BypassType.Style);
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
  return bypassSanitizationTrustString(trustedScript, BypassType.Script);
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
  return bypassSanitizationTrustString(trustedUrl, BypassType.Url);
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
  return bypassSanitizationTrustString(trustedResourceUrl, BypassType.ResourceUrl);
}


function bypassSanitizationTrustString(
    trustedString: string, mode: BypassType.Html): TrustedHtmlString;
function bypassSanitizationTrustString(
    trustedString: string, mode: BypassType.Style): TrustedStyleString;
function bypassSanitizationTrustString(
    trustedString: string, mode: BypassType.Script): TrustedScriptString;
function bypassSanitizationTrustString(
    trustedString: string, mode: BypassType.Url): TrustedUrlString;
function bypassSanitizationTrustString(
    trustedString: string, mode: BypassType.ResourceUrl): TrustedResourceUrlString;
function bypassSanitizationTrustString(trustedString: string, mode: BypassType): TrustedString {
  const trusted = new String(trustedString) as TrustedString;
  trusted[BRAND] = mode;
  return trusted;
}
