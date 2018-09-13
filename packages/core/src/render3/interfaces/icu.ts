/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {LElementNode} from './node';
import {LViewData} from './view';


/** Size of LViewData's header. Necessary to adjust for it when setting slots.  */
export const ICU_HEADER_OFFSET = 5;

// Below are constants for LViewData indices to help us look up LViewData members
// without having to remember the specific indices.
// Uglify will inline these when minifying so there shouldn't be a cost.
export const ACTIVE_CASE = 0;
export const PLURAL_RESOLVER = 1;
export const ICU_PARENT = 2;
export const ICU_RENDER_PARENT = 3;
export const ICU_DATA_INDEX = 4;

/**
 * `LIcuData` stores all of the information needed to represent the ICU expression depending on the
 * value of its binding.
 * Each ICU expression has its own `LIcuData`. When processing a particular ICU expression, we set
 * the `viewData` to that `LIcuData`. When that view is done processing, the `viewData` is set back
 * to whatever the original `viewData` was before (the parent `LViewData`).
 *
 * Keeping separate state for each view facilities view insertion / deletion, so we
 * don't have to edit the data array based on which views are present.
 */
export interface LIcuData extends Array<any> {
  /**
   * Index of the current active case.
   * Its value is -1 when there is no active case.
   */
  [ACTIVE_CASE]: number;

  /**
   * A function used to resolve the case to select in a plural ICU expression
   */
  [PLURAL_RESOLVER]: ((value: any) => string)|null;

  /**
   * Access to the parent view is necessary so we can propagate back
   * up from inside a container to parent[NEXT].
   */
  [ICU_PARENT]: LViewData|null;

  /**
   * Parent Element which will contain the location where all of the Views will be
   * inserted into to.
   *
   * If `renderParent` is `null` it is headless. This means that it is contained
   * in another `LViewNode` which in turn is contained in an `LContainerNode` and
   * therefore it does not yet have its own parent.
   *
   * If `renderParent` is not `null` then it may be:
   * - same as `LIcuNode.parent` in which case it is just a normal container.
   * - different from `LIcuNode.parent` in which case it has been re-projected.
   *   In other words `LIcuNode.parent` is logical parent where as
   *   `renderParent` is render parent.
   *
   * When the case nodes from that `LIcuNode` are inserted then `renderParent` is:
   * - `null`, keep going up a hierarchy until actual `renderParent` is found.
   * - not `null`, then use the `projectedParent.native` as the `RElement` to insert
   *   the nodes into.
   */
  [ICU_RENDER_PARENT]: LElementNode|null;

  /**
   * Contains the index value of the ICU data in the current i18n mapping
   */
  [ICU_DATA_INDEX]: number;
}

export const enum IcuType {Plural = 0, Select = 1}
export type IcuTemplate = {
  wrapper: Element,
  instructions: (string | number | null | Function)[]
};
export type IcuExpression = {
  type: IcuType,
  keys: string[],
  templates: IcuTemplate[],
  mainBinding: number,
  embedded: IcuExpression[]
};

// Note: This hack is necessary so we don't erroneously get a circular dependency
// failure based on types.
export const unusedValueExportToPlacateAjd = 1;
