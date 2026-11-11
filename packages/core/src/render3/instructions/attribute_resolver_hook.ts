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
 * Change detection, the styling instructions, and element creation call the attribute resolver
 * runtime through these hooks instead of importing it, so an app without an attribute resolver
 * doesn't bundle that runtime. `_refreshAttributeResolvers` and `_registerAttributeResolverBinding`
 * are set before anything creates a `TView.attributeResolvers` or a `TNode.attributeResolvers`, so
 * code that finds either can call them.
 */

import type {TAttributeBinding, TAttributeResolver} from '../interfaces/attribute_resolver';
import type {TElementNode} from '../interfaces/node';
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

/**
 * Sets up automatic resolution for an element once its directives are created. Stays `null` until
 * `withAutoResolution()` is called.
 */
export let _setUpAttributeResolution:
  ((tView: TView, lView: LView, tNode: TElementNode) => void) | null = null;

/**
 * Called when an attribute resolver registers, which passes `null` for `setUpImpl`, and when
 * `withAutoResolution()` is called.
 */
export function enableAttributeResolverHooks(
  refreshImpl: (tView: TView, lView: LView) => void,
  registerBindingImpl: (
    tAttributeResolver: TAttributeResolver,
    directiveIndex: number,
    bindingIndex: number,
    kind: TAttributeBinding['kind'],
  ) => void,
  setUpImpl: ((tView: TView, lView: LView, tNode: TElementNode) => void) | null,
): void {
  // Once automatic resolution is on, its refresh also refreshes the resolver bindings, so a binding
  // that registers later keeps it.
  if (_setUpAttributeResolution === null) {
    _refreshAttributeResolvers = refreshImpl;
    _registerAttributeResolverBinding = registerBindingImpl;
    _setUpAttributeResolution = setUpImpl;
  }
}
