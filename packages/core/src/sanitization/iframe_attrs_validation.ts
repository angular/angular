/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {RuntimeError, RuntimeErrorCode} from '../errors';
import {getTemplateLocationDetails} from '../render3/instructions/element_validation';
import {TAttributes, TNodeType} from '../render3/interfaces/node';
import {RComment, RElement} from '../render3/interfaces/renderer_dom';
import {LView} from '../render3/interfaces/view';
import {getCurrentTNode, getLView} from '../render3/state';
import {getNativeByTNode} from '../render3/util/view_utils';

/*
 * The set of security-sensitive attributes of an `<iframe>` that *must* be
 * applied before setting the `src` or `srcdoc` attribute value.
 * This ensures that all security-sensitive attributes are taken into account
 * while creating an instance of an `<iframe>` at runtime.
 *
 * Keep this list in sync with the `IFRAME_SECURITY_SENSITIVE_ATTRS` token
 * from the `packages/compiler/src/schema/dom_security_schema.ts` script.
 */
export const IFRAME_SECURITY_SENSITIVE_ATTRS = new Set(
    ['sandbox', 'allow', 'allowfullscreen', 'referrerpolicy', 'loading', 'csp', 'fetchpriority']);

/**
 * Validation function invoked at runtime for each binding that might potentially
 * represent a security-sensitive attribute of an <iframe>
 * (see `IFRAME_SECURITY_SENSITIVE_ATTRS` for the full list of such attributes).
 *
 * @codeGenApi
 */
export function ɵɵvalidateIframeAttribute(attrValue: any, tagName: string, attrName: string) {
  const lView = getLView();
  const tNode = getCurrentTNode()!;
  const element = getNativeByTNode(tNode, lView) as RElement | RComment;

  if (tNode.type === TNodeType.Element && tNode.value.toLowerCase() === 'iframe' &&
      // Note: check for all false'y values including an empty string as a value,
      // since this is a default value for an `<iframe>`'s `src` attribute.
      ((element as HTMLIFrameElement).src || (element as HTMLIFrameElement).srcdoc)) {
    throw unsafeIframeAttributeError(lView, attrName);
  }
}

/**
 * Constructs an instance of a `RuntimeError` to indicate that
 * a security-sensitive attribute of an <iframe> was set after
 * setting an `src` or `srcdoc`.
 */
function unsafeIframeAttributeError(lView: LView, attrName: string) {
  const errorMessage = ngDevMode &&
      `For security reasons, setting the \`${attrName}\` attribute on an <iframe> ` +
          `after the \`src\` or \`srcdoc\` is not allowed${getTemplateLocationDetails(lView)}. ` +
          `To fix this, reorder the list of attributes (applied to the <iframe> in a template ` +
          `or via host bindings) to make sure the \`${attrName}\` is set before the ` +
          `\`src\` or \`srcdoc\``;
  return new RuntimeError(RuntimeErrorCode.UNSAFE_IFRAME_ATTRS, errorMessage);
}

/**
 * Validation function invoked at runtime for each <iframe>, which verifies that
 * all security-sensitive attributes are located before an `src` or `srcdoc` attributes.
 * This is needed to make sure that these security-sensitive attributes are taken into
 * account while creating an <iframe> at runtime. See `IFRAME_SECURITY_SENSITIVE_ATTRS`
 * for the full list of such attributes.
 *
 * @codeGenApi
 */
export function ɵɵvalidateIframeStaticAttributes(attrs: TAttributes) {
  // Static attributes are located in front of the `TAttributes` array in the following format:
  // `[attr1, value1, attr2, value2, ...]`. Exit when we come across the first marker (represented
  // by a number) or when we reach the end of an array. See additional information about the
  // `TAttributes` format in the `setUpAttributes` function docs.
  let i = 0;
  let seenSrc = false;
  while (i < attrs.length) {
    let attrName = attrs[i];

    // We came across a marker -> exit, since there
    // are no more static attributes in the array.
    if (typeof attrName === 'number') return;

    // Lower-case attribute names before checking, since the attribute name
    // in the native `setAttribute` is case-insensitive.
    attrName = (attrName as string).toLowerCase();
    if (attrName === 'src' || attrName === 'srcdoc') {
      seenSrc = true;
    } else {
      if (seenSrc && IFRAME_SECURITY_SENSITIVE_ATTRS.has(attrName)) {
        throw unsafeIframeAttributeError(getLView(), attrName as string);
      }
    }
    i += 2;
  }
}
