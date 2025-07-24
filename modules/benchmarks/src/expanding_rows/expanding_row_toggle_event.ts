/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * This interface is used to send toggle (expand/collapse) events to the user
 * code.
 */
export interface ExpandingRowToggleEvent {
  /** The identifier of the row that was toggled. */
  rowId: string;

  /**
   * A boolean indicating whether or not this row was expanded. This is set to
   * false if the row was collapsed.
   */
  isExpand: boolean;
}
