/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {RuntimeError} from '../errors';
import {getTemplateLocationDetails} from '../render3/instructions/element_validation';
import {RENDERER} from '../render3/interfaces/view';
import {nativeRemoveNode} from '../render3/dom_node_manipulation';
import {getLView, getSelectedTNode} from '../render3/state';
import {getNativeByTNode} from '../render3/util/view_utils';
import {trustedHTMLFromString} from '../util/security/trusted_types';
/**
 * Validation function invoked at runtime for each binding that might potentially
 * represent a security-sensitive attribute of an <iframe>.
 * See `IFRAME_SECURITY_SENSITIVE_ATTRS` in the
 * `packages/compiler/src/schema/dom_security_schema.ts` script for the full list
 * of such attributes.
 *
 * @codeGenApi
 */
export function ɵɵvalidateIframeAttribute(attrValue, tagName, attrName) {
  const lView = getLView();
  const tNode = getSelectedTNode();
  const element = getNativeByTNode(tNode, lView);
  // Restrict any dynamic bindings of security-sensitive attributes/properties
  // on an <iframe> for security reasons.
  if (tNode.type === 2 /* TNodeType.Element */ && tagName.toLowerCase() === 'iframe') {
    const iframe = element;
    // Unset previously applied `src` and `srcdoc` if we come across a situation when
    // a security-sensitive attribute is set later via an attribute/property binding.
    iframe.src = '';
    iframe.srcdoc = trustedHTMLFromString('');
    // Also remove the <iframe> from the document.
    nativeRemoveNode(lView[RENDERER], iframe);
    const errorMessage =
      ngDevMode &&
      `Angular has detected that the \`${attrName}\` was applied ` +
        `as a binding to an <iframe>${getTemplateLocationDetails(lView)}. ` +
        `For security reasons, the \`${attrName}\` can be set on an <iframe> ` +
        `as a static attribute only. \n` +
        `To fix this, switch the \`${attrName}\` binding to a static attribute ` +
        `in a template or in host bindings section.`;
    throw new RuntimeError(-910 /* RuntimeErrorCode.UNSAFE_IFRAME_ATTRS */, errorMessage);
  }
  return attrValue;
}
//# sourceMappingURL=iframe_attrs_validation.js.map
