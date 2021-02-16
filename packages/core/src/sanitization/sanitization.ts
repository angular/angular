/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {getDocument} from '../render3/interfaces/document';
import {SANITIZER} from '../render3/interfaces/view';
import {getLView} from '../render3/state';
import {renderStringify} from '../render3/util/stringify_utils';
import {TrustedHTML, TrustedScript, TrustedScriptURL} from '../util/security/trusted_type_defs';
import {trustedHTMLFromString, trustedScriptURLFromString} from '../util/security/trusted_types';
import {trustedHTMLFromStringBypass, trustedScriptFromStringBypass, trustedScriptURLFromStringBypass} from '../util/security/trusted_types_bypass';

import {allowSanitizationBypassAndThrow, BypassType, unwrapSafeValue} from './bypass';
import {_sanitizeHtml as _sanitizeHtml} from './html_sanitizer';
import {Sanitizer} from './sanitizer';
import {SecurityContext} from './security';
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
 *
 * @codeGenApi
 */
export function ɵɵsanitizeHtml(unsafeHtml: any): TrustedHTML|string {
  const sanitizer = getSanitizer();
  if (sanitizer) {
    return trustedHTMLFromStringBypass(sanitizer.sanitize(SecurityContext.HTML, unsafeHtml) || '');
  }
  if (allowSanitizationBypassAndThrow(unsafeHtml, BypassType.Html)) {
    return trustedHTMLFromStringBypass(unwrapSafeValue(unsafeHtml));
  }
  return _sanitizeHtml(getDocument(), renderStringify(unsafeHtml));
}

/**
 * A `style` sanitizer which converts untrusted `style` **string** into trusted string by removing
 * dangerous content.
 *
 * It is possible to mark a string as trusted by calling {@link bypassSanitizationTrustStyle}.
 *
 * @param unsafeStyle untrusted `style`, typically from the user.
 * @returns `style` string which is safe to bind to the `style` properties.
 *
 * @codeGenApi
 */
export function ɵɵsanitizeStyle(unsafeStyle: any): string {
  const sanitizer = getSanitizer();
  if (sanitizer) {
    return sanitizer.sanitize(SecurityContext.STYLE, unsafeStyle) || '';
  }
  if (allowSanitizationBypassAndThrow(unsafeStyle, BypassType.Style)) {
    return unwrapSafeValue(unsafeStyle);
  }
  return renderStringify(unsafeStyle);
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
 *
 * @codeGenApi
 */
export function ɵɵsanitizeUrl(unsafeUrl: any): string {
  const sanitizer = getSanitizer();
  if (sanitizer) {
    return sanitizer.sanitize(SecurityContext.URL, unsafeUrl) || '';
  }
  if (allowSanitizationBypassAndThrow(unsafeUrl, BypassType.Url)) {
    return unwrapSafeValue(unsafeUrl);
  }
  return _sanitizeUrl(renderStringify(unsafeUrl));
}

/**
 * A `url` sanitizer which only lets trusted `url`s through.
 *
 * This passes only `url`s marked trusted by calling {@link bypassSanitizationTrustResourceUrl}.
 *
 * @param unsafeResourceUrl untrusted `url`, typically from the user.
 * @returns `url` string which is safe to bind to the `src` properties such as `<img src>`, because
 * only trusted `url`s have been allowed to pass.
 *
 * @codeGenApi
 */
export function ɵɵsanitizeResourceUrl(unsafeResourceUrl: any): TrustedScriptURL|string {
  const sanitizer = getSanitizer();
  if (sanitizer) {
    return trustedScriptURLFromStringBypass(
        sanitizer.sanitize(SecurityContext.RESOURCE_URL, unsafeResourceUrl) || '');
  }
  if (allowSanitizationBypassAndThrow(unsafeResourceUrl, BypassType.ResourceUrl)) {
    return trustedScriptURLFromStringBypass(unwrapSafeValue(unsafeResourceUrl));
  }
  throw new Error('unsafe value used in a resource URL context (see https://g.co/ng/security#xss)');
}

/**
 * A `script` sanitizer which only lets trusted javascript through.
 *
 * This passes only `script`s marked trusted by calling {@link
 * bypassSanitizationTrustScript}.
 *
 * @param unsafeScript untrusted `script`, typically from the user.
 * @returns `url` string which is safe to bind to the `<script>` element such as `<img src>`,
 * because only trusted `scripts` have been allowed to pass.
 *
 * @codeGenApi
 */
export function ɵɵsanitizeScript(unsafeScript: any): TrustedScript|string {
  const sanitizer = getSanitizer();
  if (sanitizer) {
    return trustedScriptFromStringBypass(
        sanitizer.sanitize(SecurityContext.SCRIPT, unsafeScript) || '');
  }
  if (allowSanitizationBypassAndThrow(unsafeScript, BypassType.Script)) {
    return trustedScriptFromStringBypass(unwrapSafeValue(unsafeScript));
  }
  throw new Error('unsafe value used in a script context');
}

/**
 * A template tag function for promoting the associated constant literal to a
 * TrustedHTML. Interpolation is explicitly not allowed.
 *
 * @param html constant template literal containing trusted HTML.
 * @returns TrustedHTML wrapping `html`.
 *
 * @security This is a security-sensitive function and should only be used to
 * convert constant values of attributes and properties found in
 * application-provided Angular templates to TrustedHTML.
 *
 * @codeGenApi
 */
export function ɵɵtrustConstantHtml(html: TemplateStringsArray): TrustedHTML|string {
  // The following runtime check ensures that the function was called as a
  // template tag (e.g. ɵɵtrustConstantHtml`content`), without any interpolation
  // (e.g. not ɵɵtrustConstantHtml`content ${variable}`). A TemplateStringsArray
  // is an array with a `raw` property that is also an array. The associated
  // template literal has no interpolation if and only if the length of the
  // TemplateStringsArray is 1.
  if (ngDevMode && (!Array.isArray(html) || !Array.isArray(html.raw) || html.length !== 1)) {
    throw new Error(`Unexpected interpolation in trusted HTML constant: ${html.join('?')}`);
  }
  return trustedHTMLFromString(html[0]);
}

/**
 * A template tag function for promoting the associated constant literal to a
 * TrustedScriptURL. Interpolation is explicitly not allowed.
 *
 * @param url constant template literal containing a trusted script URL.
 * @returns TrustedScriptURL wrapping `url`.
 *
 * @security This is a security-sensitive function and should only be used to
 * convert constant values of attributes and properties found in
 * application-provided Angular templates to TrustedScriptURL.
 *
 * @codeGenApi
 */
export function ɵɵtrustConstantResourceUrl(url: TemplateStringsArray): TrustedScriptURL|string {
  // The following runtime check ensures that the function was called as a
  // template tag (e.g. ɵɵtrustConstantResourceUrl`content`), without any
  // interpolation (e.g. not ɵɵtrustConstantResourceUrl`content ${variable}`). A
  // TemplateStringsArray is an array with a `raw` property that is also an
  // array. The associated template literal has no interpolation if and only if
  // the length of the TemplateStringsArray is 1.
  if (ngDevMode && (!Array.isArray(url) || !Array.isArray(url.raw) || url.length !== 1)) {
    throw new Error(`Unexpected interpolation in trusted URL constant: ${url.join('?')}`);
  }
  return trustedScriptURLFromString(url[0]);
}

/**
 * Detects which sanitizer to use for URL property, based on tag name and prop name.
 *
 * The rules are based on the RESOURCE_URL context config from
 * `packages/compiler/src/schema/dom_security_schema.ts`.
 * If tag and prop names don't match Resource URL schema, use URL sanitizer.
 */
export function getUrlSanitizer(tag: string, prop: string) {
  if ((prop === 'src' &&
       (tag === 'embed' || tag === 'frame' || tag === 'iframe' || tag === 'media' ||
        tag === 'script')) ||
      (prop === 'href' && (tag === 'base' || tag === 'link'))) {
    return ɵɵsanitizeResourceUrl;
  }
  return ɵɵsanitizeUrl;
}

/**
 * Sanitizes URL, selecting sanitizer function based on tag and property names.
 *
 * This function is used in case we can't define security context at compile time, when only prop
 * name is available. This happens when we generate host bindings for Directives/Components. The
 * host element is unknown at compile time, so we defer calculation of specific sanitizer to
 * runtime.
 *
 * @param unsafeUrl untrusted `url`, typically from the user.
 * @param tag target element tag name.
 * @param prop name of the property that contains the value.
 * @returns `url` string which is safe to bind.
 *
 * @codeGenApi
 */
export function ɵɵsanitizeUrlOrResourceUrl(unsafeUrl: any, tag: string, prop: string): any {
  return getUrlSanitizer(tag, prop)(unsafeUrl);
}

export function validateAgainstEventProperties(name: string) {
  if (name.toLowerCase().startsWith('on')) {
    const msg = `Binding to event property '${name}' is disallowed for security reasons, ` +
        `please use (${name.slice(2)})=...` +
        `\nIf '${name}' is a directive input, make sure the directive is imported by the` +
        ` current module.`;
    throw new Error(msg);
  }
}

export function validateAgainstEventAttributes(name: string) {
  if (name.toLowerCase().startsWith('on')) {
    const msg = `Binding to event attribute '${name}' is disallowed for security reasons, ` +
        `please use (${name.slice(2)})=...`;
    throw new Error(msg);
  }
}

function getSanitizer(): Sanitizer|null {
  const lView = getLView();
  return lView && lView[SANITIZER];
}
