/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * A SecurityContext marks a location that has dangerous security implications, e.g. a DOM property
 * like `innerHTML` that could cause Cross Site Scripting (XSS) security bugs when improperly
 * handled.
 *
 * See DomSanitizer for more details on security in Angular applications.
 *
 * @publicApi
 */
export enum SecurityContext {
  NONE = 0,
  HTML = 1,
  STYLE = 2,
  SCRIPT = 3,
  URL = 4,
  RESOURCE_URL = 5,
  ATTRIBUTE_NO_BINDING = 6,
}

// =================================================================================================
// =================================================================================================
// =========== S T O P   -  S T O P   -  S T O P   -  S T O P   -  S T O P   -  S T O P  ===========
// =================================================================================================
// =================================================================================================
//
//        DO NOT EDIT THIS LIST OF SECURITY SENSITIVE PROPERTIES WITHOUT A SECURITY REVIEW!
//
// =================================================================================================

/**
 *  Map from tagName|propertyName to SecurityContext. Properties applying to all tags use '*'.
 */
let _SECURITY_SCHEMA!: {[k: string]: SecurityContext};
const SVG_NAMESPACE = 'svg';
const MATH_ML_NAMESPACE = 'math';

/**
 * @remarks Keep is a copy of DOM Security Schema.
 * @see [SECURITY_SCHEMA](../../../compiler/src/schema/dom_security_schema.ts)
 */
export function SECURITY_SCHEMA(): {[k: string]: SecurityContext} {
  if (!_SECURITY_SCHEMA) {
    _SECURITY_SCHEMA = {};
    // Case is insignificant below, all element and attribute names are lower-cased for lookup.

    registerContext(SecurityContext.HTML, /** Namespace */ undefined, [
      ['iframe', ['srcdoc']],
      ['*', ['innerHTML', 'outerHTML']],
    ]);
    registerContext(SecurityContext.STYLE, /** Namespace */ undefined, [['*', ['style']]]);
    // NB: no SCRIPT contexts here, they are never allowed due to the parser stripping them.
    registerContext(SecurityContext.URL, /** Namespace */ undefined, [
      ['*', ['formAction']],
      ['area', ['href', 'protocol']],
      ['a', ['href', 'xlink:href', 'protocol']],
      ['form', ['action']],

      // The below two items are safe and should be removed but they require a G3 clean-up as a small number of tests fail.
      ['img', ['src']],
      ['video', ['src']],
    ]);

    registerContext(SecurityContext.URL, MATH_ML_NAMESPACE, [
      // MathML namespace
      // https://crsrc.org/c/third_party/blink/renderer/core/sanitizer/sanitizer.cc;l=753-768;drc=b3eb16372dcd3317d65e9e0265015e322494edcd;bpv=1;bpt=1
      ['annotation', ['href', 'xlink:href']],
      ['annotation-xml', ['href', 'xlink:href']],
      ['maction', ['href', 'xlink:href']],
      ['malignmark', ['href', 'xlink:href']],
      ['math', ['href', 'xlink:href']],
      ['mroot', ['href', 'xlink:href']],
      ['msqrt', ['href', 'xlink:href']],
      ['merror', ['href', 'xlink:href']],
      ['mfrac', ['href', 'xlink:href']],
      ['mglyph', ['href', 'xlink:href']],
      ['msub', ['href', 'xlink:href']],
      ['msup', ['href', 'xlink:href']],
      ['msubsup', ['href', 'xlink:href']],
      ['mmultiscripts', ['href', 'xlink:href']],
      ['mprescripts', ['href', 'xlink:href']],
      ['mi', ['href', 'xlink:href']],
      ['mn', ['href', 'xlink:href']],
      ['mo', ['href', 'xlink:href']],
      ['mpadded', ['href', 'xlink:href']],
      ['mphantom', ['href', 'xlink:href']],
      ['mrow', ['href', 'xlink:href']],
      ['ms', ['href', 'xlink:href']],
      ['mspace', ['href', 'xlink:href']],
      ['mstyle', ['href', 'xlink:href']],
      ['mtable', ['href', 'xlink:href']],
      ['mtd', ['href', 'xlink:href']],
      ['mtr', ['href', 'xlink:href']],
      ['mtext', ['href', 'xlink:href']],
      ['mover', ['href', 'xlink:href']],
      ['munder', ['href', 'xlink:href']],
      ['munderover', ['href', 'xlink:href']],
      ['semantics', ['href', 'xlink:href']],
      ['none', ['href', 'xlink:href']],
    ]);

    registerContext(SecurityContext.RESOURCE_URL, /** Namespace */ undefined, [
      ['base', ['href']],
      ['embed', ['src']],
      ['frame', ['src']],
      ['iframe', ['src']],
      ['link', ['href']],
      ['object', ['codebase', 'data']],
    ]);

    registerContext(SecurityContext.URL, SVG_NAMESPACE, [['a', ['href', 'xlink:href']]]);

    // Keep this in sync with SECURITY_SENSITIVE_ELEMENTS in packages/core/src/sanitization/sanitization.ts
    // The `unknown` elements refer to cases when we need to validate the input/binding in a directive (host bindings)
    // and the directive can be applied to multiple different elements (with different tag names). In this case we generate
    // a special instruction that an attribute might potentially be security-sensitive and defer the actual security check
    // to runtime, when we apply that directive to a concrete elements, thus we can check the combination of tag+attribute
    // against the set that requires sanitization.
    // These are unsafe as `attributeName` can be `href` or `xlink:href`
    // See: http://b/463880509#comment7
    registerContext(SecurityContext.ATTRIBUTE_NO_BINDING, SVG_NAMESPACE, [
      ['animate', ['attributeName', 'values', 'to', 'from']],
      ['set', ['to', 'attributeName']],
      ['animateMotion', ['attributeName']],
      ['animateTransform', ['attributeName']],
    ]);

    registerContext(SecurityContext.ATTRIBUTE_NO_BINDING, /** Namespace */ undefined, [
      [
        'unknown',
        [
          'attributeName',
          'values',
          'to',
          'from',
          'sandbox',
          'allow',
          'allowFullscreen',
          'referrerPolicy',
          'csp',
          'fetchPriority',
        ],
      ],
      ['iframe', ['sandbox', 'allow', 'allowFullscreen', 'referrerPolicy', 'csp', 'fetchPriority']],
    ]);
  }

  return _SECURITY_SCHEMA;
}

function registerContext(
  ctx: SecurityContext,
  namespace: string | undefined,
  specs: readonly [tagName: string, attributeNames: readonly string[]][],
): void {
  for (const [element, attributeNames] of specs) {
    let tagName =
      namespace && element !== '*' && element !== 'unknown' ? `:${namespace}:${element}` : element;
    tagName = tagName.toLowerCase();

    for (const attr of attributeNames) {
      _SECURITY_SCHEMA[`${tagName}|${attr.toLowerCase()}`] = ctx;
    }
  }
}
