/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/** Selector for finding table cells. */
export const CELL_SELECTOR = '.cdk-cell, .mat-cell, td';

/** Selector for finding editable table cells. */
export const EDITABLE_CELL_SELECTOR = '.cdk-popover-edit-cell, .mat-popover-edit-cell';

/** Selector for finding table rows. */
export const ROW_SELECTOR = '.cdk-row, .mat-row, tr';

/** Selector for finding the table element. */
export const TABLE_SELECTOR = 'table, cdk-table, mat-table';

/** CSS class added to the edit lens pane. */
export const EDIT_PANE_CLASS = 'cdk-edit-pane';

/** Selector for finding the edit lens pane. */
export const EDIT_PANE_SELECTOR = `.${EDIT_PANE_CLASS}, .mat-edit-pane`;
