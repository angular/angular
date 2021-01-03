/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


export const enum BypassType {
  Url = 'URL',
  Html = 'HTML',
  ResourceUrl = 'ResourceURL',
  Script = 'Script',
  Style = 'Style',
}

/**
 * Marker interface for a value that's safe to use in a particular context.
 *
 * @publicApi
 */
export interface SafeValue {}

/**
 * Marker interface for a value that's safe to use as HTML.
 *
 * @publicApi
 */
export interface SafeHtml extends SafeValue {}

/**
 * Marker interface for a value that's safe to use as style (CSS).
 *
 * @publicApi
 */
export interface SafeStyle extends SafeValue {}

/**
 * Marker interface for a value that's safe to use as JavaScript.
 *
 * @publicApi
 */
export interface SafeScript extends SafeValue {}

/**
 * Marker interface for a value that's safe to use as a URL linking to a document.
 *
 * @publicApi
 */
export interface SafeUrl extends SafeValue {}

/**
 * Marker interface for a value that's safe to use as a URL to load executable code from.
 *
 * @publicApi
 */
export interface SafeResourceUrl extends SafeValue {}


abstract class SafeValueImpl implements SafeValue {
  constructor(public changingThisBreaksApplicationSecurity: string) {}

  abstract getTypeName(): string;

  toString() {
    return `SafeValue must use [property]=binding: ${this.changingThisBreaksApplicationSecurity}` +
        ` (see https://g.co/ng/security#xss)`;
  }
}

class SafeHtmlImpl extends SafeValueImpl implements SafeHtml {
  getTypeName() {
    return BypassType.Html;
  }
}
class SafeStyleImpl extends SafeValueImpl implements SafeStyle {
  getTypeName() {
    return BypassType.Style;
  }
}
class SafeScriptImpl extends SafeValueImpl implements SafeScript {
  getTypeName() {
    return BypassType.Script;
  }
}
class SafeUrlImpl extends SafeValueImpl implements SafeUrl {
  getTypeName() {
    return BypassType.Url;
  }
}
class SafeResourceUrlImpl extends SafeValueImpl implements SafeResourceUrl {
  getTypeName() {
    return BypassType.ResourceUrl;
  }
}

export function unwrapSafeValue(value: SafeValue): string;
export function unwrapSafeValue<T>(value: T): T;
export function unwrapSafeValue<T>(value: T|SafeValue): T {
  return value instanceof SafeValueImpl ? value.changingThisBreaksApplicationSecurity as any as T :
                                          value as any as T;
}


export function allowSanitizationBypassAndThrow(
    value: any, type: BypassType.Html): value is SafeHtml;
export function allowSanitizationBypassAndThrow(
    value: any, type: BypassType.ResourceUrl): value is SafeResourceUrl;
export function allowSanitizationBypassAndThrow(
    value: any, type: BypassType.Script): value is SafeScript;
export function allowSanitizationBypassAndThrow(
    value: any, type: BypassType.Style): value is SafeStyle;
export function allowSanitizationBypassAndThrow(value: any, type: BypassType.Url): value is SafeUrl;
export function allowSanitizationBypassAndThrow(value: any, type: BypassType): boolean;
export function allowSanitizationBypassAndThrow(value: any, type: BypassType): boolean {
  const actualType = getSanitizationBypassType(value);
  if (actualType != null && actualType !== type) {
    // Allow ResourceURLs in URL contexts, they are strictly more trusted.
    if (actualType === BypassType.ResourceUrl && type === BypassType.Url) return true;
    throw new Error(
        `Required a safe ${type}, got a ${actualType} (see https://g.co/ng/security#xss)`);
  }
  return actualType === type;
}

export function getSanitizationBypassType(value: any): BypassType|null {
  return value instanceof SafeValueImpl && value.getTypeName() as BypassType || null;
}

/**
 * Mark `html` string as trusted.
 *
 * This function wraps the trusted string in `String` and brands it in a way which makes it
 * recognizable to {@link htmlSanitizer} to be trusted implicitly.
 *
 * @param trustedHtml `html` string which needs to be implicitly trusted.
 * @returns a `html` which has been branded to be implicitly trusted.
 */
export function bypassSanitizationTrustHtml(trustedHtml: string): SafeHtml {
  return new SafeHtmlImpl(trustedHtml);
}
/**
 * Mark `style` string as trusted.
 *
 * This function wraps the trusted string in `String` and brands it in a way which makes it
 * recognizable to {@link styleSanitizer} to be trusted implicitly.
 *
 * @param trustedStyle `style` string which needs to be implicitly trusted.
 * @returns a `style` hich has been branded to be implicitly trusted.
 */
export function bypassSanitizationTrustStyle(trustedStyle: string): SafeStyle {
  return new SafeStyleImpl(trustedStyle);
}
/**
 * Mark `script` string as trusted.
 *
 * This function wraps the trusted string in `String` and brands it in a way which makes it
 * recognizable to {@link scriptSanitizer} to be trusted implicitly.
 *
 * @param trustedScript `script` string which needs to be implicitly trusted.
 * @returns a `script` which has been branded to be implicitly trusted.
 */
export function bypassSanitizationTrustScript(trustedScript: string): SafeScript {
  return new SafeScriptImpl(trustedScript);
}
/**
 * Mark `url` string as trusted.
 *
 * This function wraps the trusted string in `String` and brands it in a way which makes it
 * recognizable to {@link urlSanitizer} to be trusted implicitly.
 *
 * @param trustedUrl `url` string which needs to be implicitly trusted.
 * @returns a `url`  which has been branded to be implicitly trusted.
 */
export function bypassSanitizationTrustUrl(trustedUrl: string): SafeUrl {
  return new SafeUrlImpl(trustedUrl);
}
/**
 * Mark `url` string as trusted.
 *
 * This function wraps the trusted string in `String` and brands it in a way which makes it
 * recognizable to {@link resourceUrlSanitizer} to be trusted implicitly.
 *
 * @param trustedResourceUrl `url` string which needs to be implicitly trusted.
 * @returns a `url` which has been branded to be implicitly trusted.
 */
export function bypassSanitizationTrustResourceUrl(trustedResourceUrl: string): SafeResourceUrl {
  return new SafeResourceUrlImpl(trustedResourceUrl);
}
