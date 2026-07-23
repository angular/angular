/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {RENDERER} from '../render3/interfaces/view';
import {nativeRemoveNode} from '../render3/dom_node_manipulation';
import {getLView} from '../render3/state';
import {trustedHTMLFromString} from '../util/security/trusted_types';

/**
 * Enforces security by neutralizing an `<iframe>` if a security-sensitive attribute is set.
 *
 * This function is invoked at runtime when a security-sensitive attribute is bound to an `<iframe>`.
 * It clears the `src` and `srcdoc` attributes and removes the `<iframe>` from the DOM to prevent
 * potential security risks.
 *
 * @see [SECURITY_SCHEMA](../../../compiler/src/schema/dom_security_schema.ts) for the full list
 * of such attributes.
 *
 * @codeGenApi
 */
export function enforceIframeSecurity(iframe: HTMLIFrameElement): void {
  const lView = getLView();

  // Unset previously applied `src` and `srcdoc` if we come across a situation when
  // a security-sensitive attribute is set later via an attribute/property binding.
  iframe.src = '';
  iframe.srcdoc = trustedHTMLFromString('') as unknown as string;

  // Also remove the <iframe> from the document.
  nativeRemoveNode(lView[RENDERER], iframe);
}
