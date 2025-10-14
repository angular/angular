/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {getLViewById} from './lview_tracking';
/**
 * The internal view context which is specific to a given DOM element, directive or
 * component instance. Each value in here (besides the LView and element node details)
 * can be present, null or undefined. If undefined then it implies the value has not been
 * looked up yet, otherwise, if null, then a lookup was executed and nothing was found.
 *
 * Each value will get filled when the respective value is examined within the getContext
 * function. The component, element and each directive instance will share the same instance
 * of the context.
 */
export class LContext {
  lViewId;
  nodeIndex;
  native;
  /**
   * The instance of the Component node.
   */
  component;
  /**
   * The list of active directives that exist on this element.
   */
  directives;
  /**
   * The map of local references (local reference name => element or directive instance) that
   * exist on this element.
   */
  localRefs;
  /** Component's parent view data. */
  get lView() {
    return getLViewById(this.lViewId);
  }
  constructor(
    /**
     * ID of the component's parent view data.
     */
    lViewId,
    /**
     * The index instance of the node.
     */
    nodeIndex,
    /**
     * The instance of the DOM node that is attached to the lNode.
     */
    native,
  ) {
    this.lViewId = lViewId;
    this.nodeIndex = nodeIndex;
    this.native = native;
  }
}
//# sourceMappingURL=context.js.map
