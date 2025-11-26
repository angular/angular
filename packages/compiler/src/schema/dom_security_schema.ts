/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {SecurityContext} from '../core';

// =================================================================================================
// =================================================================================================
// =========== S T O P   -  S T O P   -  S T O P   -  S T O P   -  S T O P   -  S T O P  ===========
// =================================================================================================
// =================================================================================================
//
//        DO NOT EDIT THIS LIST OF SECURITY SENSITIVE PROPERTIES WITHOUT A SECURITY REVIEW!
//
// =================================================================================================

/** Map from tagName|propertyName to SecurityContext. Properties applying to all tags use '*'. */
let _SECURITY_SCHEMA!: {[k: string]: SecurityContext};

export function SECURITY_SCHEMA(): {[k: string]: SecurityContext} {
  if (!_SECURITY_SCHEMA) {
    _SECURITY_SCHEMA = {};
    // Case is insignificant below, all element and attribute names are lower-cased for lookup.

    registerContext(SecurityContext.HTML, ['iframe|srcdoc', '*|innerHTML', '*|outerHTML']);
    registerContext(SecurityContext.STYLE, ['*|style']);
    // NB: no SCRIPT contexts here, they are never allowed due to the parser stripping them.
    registerContext(SecurityContext.URL, [
      '*|formAction',
      'a|href',
      'a|ping',
      'a|xlink:href',
      'animate|href',
      'animate|xlink:href',
      'animate|values',
      'animate|from',
      'animate|to',
      'animateMotion|href',
      'animateMotion|xlink:href',
      'animateMotion|values',
      'animateMotion|from',
      'animateMotion|to',
      'animateTransform|href',
      'animateTransform|xlink:href',
      'animateTransform|values',
      'animateTransform|from',
      'animateTransform|to',
      'area|href',
      'area|ping',
      'area|xlink:href',
      'audio|src',
      'blockquote|cite',
      'body|background',
      'del|cite',
      'feImage|href',
      'feImage|xlink:href',
      'filter|href',
      'filter|xlink:href',
      'form|action',
      'image|href',
      'image|xlink:href',
      'img|src',
      'input|src',
      'ins|cite',
      'linearGradient|href',
      'linearGradient|xlink:href',
      'mpath|href',
      'mpath|xlink:href',
      'pattern|href',
      'pattern|xlink:href',
      'q|cite',
      'radialGradient|href',
      'radialGradient|xlink:href',
      'set|href',
      'set|xlink:href',
      'set|to',
      'source|src',
      'textPath|href',
      'textPath|xlink:href',
      'track|src',
      'use|href',
      'use|xlink:href',
      'video|poster',
      'video|src',
    ]);
    registerContext(SecurityContext.RESOURCE_URL, [
      'applet|code',
      'applet|codebase',
      'base|href',
      'embed|src',
      'frame|src',
      'head|profile',
      'html|manifest',
      'iframe|src',
      'link|href',
      'media|src',
      'object|codebase',
      'object|data',
      'script|src',
    ]);
  }
  return _SECURITY_SCHEMA;
}

function registerContext(ctx: SecurityContext, specs: string[]) {
  for (const spec of specs) _SECURITY_SCHEMA[spec.toLowerCase()] = ctx;
}

/**
 * The set of security-sensitive attributes of an `<iframe>` that *must* be
 * applied as a static attribute only. This ensures that all security-sensitive
 * attributes are taken into account while creating an instance of an `<iframe>`
 * at runtime.
 *
 * Note: avoid using this set directly, use the `isIframeSecuritySensitiveAttr` function
 * in the code instead.
 */
export const IFRAME_SECURITY_SENSITIVE_ATTRS = new Set([
  'sandbox',
  'allow',
  'allowfullscreen',
  'referrerpolicy',
  'csp',
  'fetchpriority',
]);

/**
 * Checks whether a given attribute name might represent a security-sensitive
 * attribute of an <iframe>.
 */
export function isIframeSecuritySensitiveAttr(attrName: string): boolean {
  // The `setAttribute` DOM API is case-insensitive, so we lowercase the value
  // before checking it against a known security-sensitive attributes.
  return IFRAME_SECURITY_SENSITIVE_ATTRS.has(attrName.toLowerCase());
}
