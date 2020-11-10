/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectorRef as ViewEngine_ChangeDetectorRef} from '../change_detection/change_detector_ref';
import {Renderer2} from '../render/api';
import {TNode, TNodeType} from './interfaces/node';
import {isProceduralRenderer} from './interfaces/renderer';
import {isComponentHost, isLView} from './interfaces/type_checks';
import {DECLARATION_COMPONENT_VIEW, LView, RENDERER} from './interfaces/view';
import {getCurrentTNode, getLView} from './state';
import {getComponentLViewByIndex} from './util/view_utils';
import {ViewRef} from './view_ref';



/** Returns a ChangeDetectorRef (a.k.a. a ViewRef) */
export function injectChangeDetectorRef(isPipe = false): ViewEngine_ChangeDetectorRef {
  return createViewRef(getCurrentTNode()!, getLView(), isPipe);
}

/**
 * Creates a ViewRef and stores it on the injector as ChangeDetectorRef (public alias).
 *
 * @param tNode The node that is requesting a ChangeDetectorRef
 * @param lView The view to which the node belongs
 * @param isPipe Whether the view is being injected into a pipe.
 * @returns The ChangeDetectorRef to use
 */
function createViewRef(tNode: TNode, lView: LView, isPipe: boolean): ViewEngine_ChangeDetectorRef {
  // `isComponentView` will be true for Component and Directives (but not for Pipes).
  // See https://github.com/angular/angular/pull/33072 for proper fix
  const isComponentView = !isPipe && isComponentHost(tNode);
  if (isComponentView) {
    // The LView represents the location where the component is declared.
    // Instead we want the LView for the component View and so we need to look it up.
    const componentView = getComponentLViewByIndex(tNode.index, lView);  // look down
    return new ViewRef(componentView, componentView);
  } else if (tNode.type & (TNodeType.AnyRNode | TNodeType.AnyContainer | TNodeType.Icu)) {
    // The LView represents the location where the injection is requested from.
    // We need to locate the containing LView (in case where the `lView` is an embedded view)
    const hostComponentView = lView[DECLARATION_COMPONENT_VIEW];  // look up
    return new ViewRef(hostComponentView, lView);
  }
  return null!;
}

/** Returns a Renderer2 (or throws when application was bootstrapped with Renderer3) */
function getOrCreateRenderer2(view: LView): Renderer2 {
  const renderer = view[RENDERER];
  if (isProceduralRenderer(renderer)) {
    return renderer as Renderer2;
  } else {
    throw new Error('Cannot inject Renderer2 when the application uses Renderer3!');
  }
}

/** Injects a Renderer2 for the current component. */
export function injectRenderer2(): Renderer2 {
  // We need the Renderer to be based on the component that it's being injected into, however since
  // DI happens before we've entered its view, `getLView` will return the parent view instead.
  const lView = getLView();
  const tNode = getCurrentTNode()!;
  const nodeAtIndex = getComponentLViewByIndex(tNode.index, lView);
  return getOrCreateRenderer2(isLView(nodeAtIndex) ? nodeAtIndex : lView);
}
