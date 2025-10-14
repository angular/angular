/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {isComponentHost} from '../render3/interfaces/type_checks';
import {DECLARATION_COMPONENT_VIEW} from '../render3/interfaces/view';
import {getCurrentTNode, getLView} from '../render3/state';
import {getComponentLViewByIndex} from '../render3/util/view_utils';
import {ViewRef} from '../render3/view_ref';
/**
 * Base class that provides change detection functionality.
 * A change-detection tree collects all views that are to be checked for changes.
 * Use the methods to add and remove views from the tree, initiate change-detection,
 * and explicitly mark views as _dirty_, meaning that they have changed and need to be re-rendered.
 *
 * @see [Using change detection hooks](guide/components/lifecycle#using-change-detection-hooks)
 * @see [Defining custom change detection](guide/components/lifecycle#defining-custom-change-detection)
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
 * after an interval.
 *
 * {@example core/ts/change_detect/change-detection.ts region='mark-for-check'}
 *
 * ### Detach change detector to limit how often check occurs
 *
 * The following example defines a component with a large list of read-only data
 * that is expected to change constantly, many times per second.
 * To improve performance, we want to check and update the list
 * less often than the changes actually occur. To do that, we detach
 * the component's change detector and perform an explicit local check every five seconds.
 *
 * {@example core/ts/change_detect/change-detection.ts region='detach'}
 *
 *
 * ### Reattaching a detached component
 *
 * The following example creates a component displaying live data.
 * The component detaches its change detector from the main change detector tree
 * when the `live` property is set to false, and reattaches it when the property
 * becomes true.
 *
 * {@example core/ts/change_detect/change-detection.ts region='reattach'}
 *
 * @publicApi
 */
export class ChangeDetectorRef {
  /**
   * @internal
   * @nocollapse
   */
  static __NG_ELEMENT_ID__ = injectChangeDetectorRef;
}
/** Returns a ChangeDetectorRef (a.k.a. a ViewRef) */
export function injectChangeDetectorRef(flags) {
  return createViewRef(
    getCurrentTNode(),
    getLView(),
    (flags & 16) /* InternalInjectFlags.ForPipe */ === 16 /* InternalInjectFlags.ForPipe */,
  );
}
/**
 * Creates a ViewRef and stores it on the injector as ChangeDetectorRef (public alias).
 *
 * @param tNode The node that is requesting a ChangeDetectorRef
 * @param lView The view to which the node belongs
 * @param isPipe Whether the view is being injected into a pipe.
 * @returns The ChangeDetectorRef to use
 */
function createViewRef(tNode, lView, isPipe) {
  if (isComponentHost(tNode) && !isPipe) {
    // The LView represents the location where the component is declared.
    // Instead we want the LView for the component View and so we need to look it up.
    const componentView = getComponentLViewByIndex(tNode.index, lView); // look down
    return new ViewRef(componentView, componentView);
  } else if (
    tNode.type &
    (3 /* TNodeType.AnyRNode */ |
      12 /* TNodeType.AnyContainer */ |
      32 /* TNodeType.Icu */ |
      128) /* TNodeType.LetDeclaration */
  ) {
    // The LView represents the location where the injection is requested from.
    // We need to locate the containing LView (in case where the `lView` is an embedded view)
    const hostComponentView = lView[DECLARATION_COMPONENT_VIEW]; // look up
    return new ViewRef(hostComponentView, lView);
  }
  return null;
}
//# sourceMappingURL=change_detector_ref.js.map
