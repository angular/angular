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
      'area|href',
      'area|ping',
      'audio|src',
      'a|href',
      'a|xlink:href',
      'a|ping',
      'blockquote|cite',
      'body|background',
      'del|cite',
      'form|action',
      'img|src',
      'input|src',
      'ins|cite',
      'q|cite',
      'source|src',
      'track|src',
      'video|poster',
      'video|src',

      // MathML namespace
      // https://crsrc.org/c/third_party/blink/renderer/core/sanitizer/sanitizer.cc;l=753-768;drc=b3eb16372dcd3317d65e9e0265015e322494edcd;bpv=1;bpt=1
      'annotation|href',
      'annotation|xlink:href',
      'annotation-xml|href',
      'annotation-xml|xlink:href',
      'maction|href',
      'maction|xlink:href',
      'malignmark|href',
      'malignmark|xlink:href',
      'math|href',
      'math|xlink:href',
      'mroot|href',
      'mroot|xlink:href',
      'msqrt|href',
      'msqrt|xlink:href',
      'merror|href',
      'merror|xlink:href',
      'mfrac|href',
      'mfrac|xlink:href',
      'mglyph|href',
      'mglyph|xlink:href',
      'msub|href',
      'msub|xlink:href',
      'msup|href',
      'msup|xlink:href',
      'msubsup|href',
      'msubsup|xlink:href',
      'mmultiscripts|href',
      'mmultiscripts|xlink:href',
      'mprescripts|href',
      'mprescripts|xlink:href',
      'mi|href',
      'mi|xlink:href',
      'mn|href',
      'mn|xlink:href',
      'mo|href',
      'mo|xlink:href',
      'mpadded|href',
      'mpadded|xlink:href',
      'mphantom|href',
      'mphantom|xlink:href',
      'mrow|href',
      'mrow|xlink:href',
      'ms|href',
      'ms|xlink:href',
      'mspace|href',
      'mspace|xlink:href',
      'mstyle|href',
      'mstyle|xlink:href',
      'mtable|href',
      'mtable|xlink:href',
      'mtd|href',
      'mtd|xlink:href',
      'mtr|href',
      'mtr|xlink:href',
      'mtext|href',
      'mtext|xlink:href',
      'mover|href',
      'mover|xlink:href',
      'munder|href',
      'munder|xlink:href',
      'munderover|href',
      'munderover|xlink:href',
      'semantics|href',
      'semantics|xlink:href',
      'none|href',
      'none|xlink:href',
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

    // Keep this in sync with SECURITY_SENSITIVE_ELEMENTS in packages/core/src/sanitization/sanitization.ts
    // Unknown is the internal tag name for unknown elements example used for host-bindings.
    // These are unsafe as `attributeName` can be `href` or `xlink:href`
    // See: http://b/463880509#comment7

    registerContext(SecurityContext.ATTRIBUTE_NO_BINDING, [
      'animate|attributeName',
      'set|attributeName',
      'animateMotion|attributeName',
      'animateTransform|attributeName',

      'unknown|attributeName',

      'iframe|sandbox',
      'iframe|allow',
      'iframe|allowFullscreen',
      'iframe|referrerPolicy',
      'iframe|csp',
      'iframe|fetchPriority',

      'unknown|sandbox',
      'unknown|allow',
      'unknown|allowFullscreen',
      'unknown|referrerPolicy',
      'unknown|csp',
      'unknown|fetchPriority',
    ]);
  }

  return _SECURITY_SCHEMA;
}

function registerContext(ctx: SecurityContext, specs: string[]) {
  for (const spec of specs) _SECURITY_SCHEMA[spec.toLowerCase()] = ctx;
}
