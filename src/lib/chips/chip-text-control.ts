/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


/** Interface for a text control that is used to drive interaction with a mat-chip-list. */
export interface MatChipTextControl {
  /** Unique identifier for the text control. */
  id: string;

  /** The text control's placeholder text. */
  placeholder: string;

  /** Whether the text control has browser focus. */
  focused: boolean;

  /** Whether the text control is empty. */
  empty: boolean;

  /** Focuses the text control. */
  focus(): void;
}
