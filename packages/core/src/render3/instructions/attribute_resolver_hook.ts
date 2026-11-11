/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * @fileoverview
 *
 * Change detection and the styling instructions call the attribute resolver runtime through these
 * hooks instead of importing it, so an app without an attribute resolver doesn't bundle that
 * runtime. They're set before anything creates a `TView.attributeResolvers` or a
 * `TNode.attributeResolvers`, so code that finds either can call them.
 */

import type {TAttributeBinding, TAttributeResolver} from '../interfaces/attribute_resolver';
import type {LView, TView} from '../interfaces/view';

/** Resolves the attributes of every element in a view that has an attribute resolver. */
export let _refreshAttributeResolvers: ((tView: TView, lView: LView) => void) | null = null;

/** Records a binding of a resolved attribute with the source that owns it. */
export let _registerAttributeResolverBinding:
  | ((
      tAttributeResolver: TAttributeResolver,
      directiveIndex: number,
      bindingIndex: number,
      kind: TAttributeBinding['kind'],
    ) => void)
  | null = null;

/** Called when an attribute resolver registers. */
export function enableAttributeResolverHooks(
  refreshImpl: (tView: TView, lView: LView) => void,
  registerBindingImpl: (
    tAttributeResolver: TAttributeResolver,
    directiveIndex: number,
    bindingIndex: number,
    kind: TAttributeBinding['kind'],
  ) => void,
): void {
  _refreshAttributeResolvers = refreshImpl;
  _registerAttributeResolverBinding = registerBindingImpl;
}
