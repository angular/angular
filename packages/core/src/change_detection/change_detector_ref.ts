/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectFlags} from '../di';
import {InternalInjectFlags} from '../di/interface/injector';
import {TNode, TNodeType} from '../render3/interfaces/node';
import {isComponentHost} from '../render3/interfaces/type_checks';
import {DECLARATION_COMPONENT_VIEW, LView} from '../render3/interfaces/view';
import {getCurrentTNode, getLView} from '../render3/state';
import {getComponentLViewByIndex} from '../render3/util/view_utils';
import {ViewRef} from '../render3/view_ref';

/**
 * Base class that provides change detection functionality.
 * A change-detection tree collects all views that are to be checked for changes.
 * Use the methods to add and remove views from the tree, initiate change-detection,
 * and explicitly mark views as _dirty_, meaning that they have changed and need to be re-rendered.
 *
 * @see [Using change detection hooks](guide/lifecycle-hooks#using-change-detection-hooks)
 * @see [Defining custom change detection](guide/lifecycle-hooks#defining-custom-change-detection)
 *
 * @usageNotes
 *
 * The following examples demonstrate how to modify default change-detection behavior
 * to perform explicit detection when needed.
 *
 * ### Use `markForCheck()` with `CheckOnce` strategy
 *
 * The following example sets the `OnPush` change-detection strategy for a component
 * (`CheckOnce`, rather than the default `CheckAlways`), then forces a second check
 * after an interval. See [live demo](https://plnkr.co/edit/GC512b?p=preview).
 *
 * <code-example path="core/ts/change_detect/change-detection.ts"
 * region="mark-for-check"></code-example>
 *
 * ### Detach change detector to limit how often check occurs
 *
 * The following example defines a component with a large list of read-only data
 * that is expected to change constantly, many times per second.
 * To improve performance, we want to check and update the list
 * less often than the changes actually occur. To do that, we detach
 * the component's change detector and perform an explicit local check every five seconds.
 *
 * <code-example path="core/ts/change_detect/change-detection.ts" region="detach"></code-example>
 *
 *
 * ### Reattaching a detached component
 *
 * The following example creates a component displaying live data.
 * The component detaches its change detector from the main change detector tree
 * when the `live` property is set to false, and reattaches it when the property
 * becomes true.
 *
 * <code-example path="core/ts/change_detect/change-detection.ts" region="reattach"></code-example>
 *
 * @publicApi
 */
export abstract class ChangeDetectorRef {
  /**
   * When a view uses the {@link ChangeDetectionStrategy#OnPush OnPush} (checkOnce)
   * change detection strategy, explicitly marks the view as changed so that
   * it can be checked again.
   *
   * Components are normally marked as dirty (in need of rerendering) when inputs
   * have changed or events have fired in the view. Call this method to ensure that
   * a component is checked even if these triggers have not occurred.
   *
   * <!-- TODO: Add a link to a chapter on OnPush components -->
   *
   */
  abstract markForCheck(): void;

  /**
   * Detaches this view from the change-detection tree.
   * A detached view is  not checked until it is reattached.
   * Use in combination with `detectChanges()` to implement local change detection checks.
   *
   * Detached views are not checked during change detection runs until they are
   * re-attached, even if they are marked as dirty.
   *
   * <!-- TODO: Add a link to a chapter on detach/reattach/local digest -->
   * <!-- TODO: Add a live demo once ref.detectChanges is merged into master -->
   *
   */
  abstract detach(): void;

  /**
   * Checks this view and its children. Use in combination with {@link ChangeDetectorRef#detach
   * detach}
   * to implement local change detection checks.
   *
   * <!-- TODO: Add a link to a chapter on detach/reattach/local digest -->
   * <!-- TODO: Add a live demo once ref.detectChanges is merged into master -->
   *
   */
  abstract detectChanges(): void;

  /**
   * Checks the change detector and its children, and throws if any changes are detected.
   *
   * Use in development mode to verify that running change detection doesn't introduce
   * other changes. Calling it in production mode is a noop.
   */
  abstract checkNoChanges(): void;

  /**
   * Re-attaches the previously detached view to the change detection tree.
   * Views are attached to the tree by default.
   *
   * <!-- TODO: Add a link to a chapter on detach/reattach/local digest -->
   *
   */
  abstract reattach(): void;

  /**
   * @internal
   * @nocollapse
   */
  static __NG_ELEMENT_ID__: (flags: InjectFlags) => ChangeDetectorRef = injectChangeDetectorRef;
}



/** Returns a ChangeDetectorRef (a.k.a. a ViewRef) */
export function injectChangeDetectorRef(flags: InjectFlags): ChangeDetectorRef {
  return createViewRef(
      getCurrentTNode()!, getLView(),
      (flags & InternalInjectFlags.ForPipe) === InternalInjectFlags.ForPipe);
}

/**
 * Creates a ViewRef and stores it on the injector as ChangeDetectorRef (public alias).
 *
 * @param tNode The node that is requesting a ChangeDetectorRef
 * @param lView The view to which the node belongs
 * @param isPipe Whether the view is being injected into a pipe.
 * @returns The ChangeDetectorRef to use
 */
function createViewRef(tNode: TNode, lView: LView, isPipe: boolean): ChangeDetectorRef {
  if (isComponentHost(tNode) && !isPipe) {
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
