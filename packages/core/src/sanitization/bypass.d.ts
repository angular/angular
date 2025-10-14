/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
export declare const enum BypassType {
    Url = "URL",
    Html = "HTML",
    ResourceUrl = "ResourceURL",
    Script = "Script",
    Style = "Style"
}
/**
 * Marker interface for a value that's safe to use in a particular context.
 *
 * @publicApi
 */
export interface SafeValue {
}
/**
 * Marker interface for a value that's safe to use as HTML.
 *
 * @publicApi
 */
export interface SafeHtml extends SafeValue {
}
/**
 * Marker interface for a value that's safe to use as style (CSS).
 *
 * @publicApi
 */
export interface SafeStyle extends SafeValue {
}
/**
 * Marker interface for a value that's safe to use as JavaScript.
 *
 * @publicApi
 */
export interface SafeScript extends SafeValue {
}
/**
 * Marker interface for a value that's safe to use as a URL linking to a document.
 *
 * @publicApi
 */
export interface SafeUrl extends SafeValue {
}
/**
 * Marker interface for a value that's safe to use as a URL to load executable code from.
 *
 * @publicApi
 */
export interface SafeResourceUrl extends SafeValue {
}
export declare function unwrapSafeValue(value: SafeValue): string;
export declare function unwrapSafeValue<T>(value: T): T;
export declare function allowSanitizationBypassAndThrow(value: any, type: BypassType.Html): value is SafeHtml;
export declare function allowSanitizationBypassAndThrow(value: any, type: BypassType.ResourceUrl): value is SafeResourceUrl;
export declare function allowSanitizationBypassAndThrow(value: any, type: BypassType.Script): value is SafeScript;
export declare function allowSanitizationBypassAndThrow(value: any, type: BypassType.Style): value is SafeStyle;
export declare function allowSanitizationBypassAndThrow(value: any, type: BypassType.Url): value is SafeUrl;
export declare function allowSanitizationBypassAndThrow(value: any, type: BypassType): boolean;
export declare function getSanitizationBypassType(value: any): BypassType | null;
/**
 * Mark `html` string as trusted.
 *
 * This function wraps the trusted string in `String` and brands it in a way which makes it
 * recognizable to {@link htmlSanitizer} to be trusted implicitly.
 *
 * @param trustedHtml `html` string which needs to be implicitly trusted.
 * @returns a `html` which has been branded to be implicitly trusted.
 */
export declare function bypassSanitizationTrustHtml(trustedHtml: string): SafeHtml;
/**
 * Mark `style` string as trusted.
 *
 * This function wraps the trusted string in `String` and brands it in a way which makes it
 * recognizable to {@link styleSanitizer} to be trusted implicitly.
 *
 * @param trustedStyle `style` string which needs to be implicitly trusted.
 * @returns a `style` hich has been branded to be implicitly trusted.
 */
export declare function bypassSanitizationTrustStyle(trustedStyle: string): SafeStyle;
/**
 * Mark `script` string as trusted.
 *
 * This function wraps the trusted string in `String` and brands it in a way which makes it
 * recognizable to {@link scriptSanitizer} to be trusted implicitly.
 *
 * @param trustedScript `script` string which needs to be implicitly trusted.
 * @returns a `script` which has been branded to be implicitly trusted.
 */
export declare function bypassSanitizationTrustScript(trustedScript: string): SafeScript;
/**
 * Mark `url` string as trusted.
 *
 * This function wraps the trusted string in `String` and brands it in a way which makes it
 * recognizable to {@link urlSanitizer} to be trusted implicitly.
 *
 * @param trustedUrl `url` string which needs to be implicitly trusted.
 * @returns a `url`  which has been branded to be implicitly trusted.
 */
export declare function bypassSanitizationTrustUrl(trustedUrl: string): SafeUrl;
/**
 * Mark `url` string as trusted.
 *
 * This function wraps the trusted string in `String` and brands it in a way which makes it
 * recognizable to {@link resourceUrlSanitizer} to be trusted implicitly.
 *
 * @param trustedResourceUrl `url` string which needs to be implicitly trusted.
 * @returns a `url` which has been branded to be implicitly trusted.
 */
export declare function bypassSanitizationTrustResourceUrl(trustedResourceUrl: string): SafeResourceUrl;
