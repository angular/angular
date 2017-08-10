/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Observable} from 'rxjs/Observable';
import {NgControl} from '@angular/forms';


/** An interface which allows a control to work inside of a `MdFormField`. */
export abstract class MdFormFieldControl<T> {
  /** The value of the control. */
  value: T;

  /**
   * Stream that emits whenever the state of the control changes such that the parent `MdFormField`
   * needs to run change detection.
   */
  readonly stateChanges: Observable<void>;

  /** The element ID for this control. */
  readonly id: string;

  /** The placeholder for this control. */
  readonly placeholder: string;

  /** Gets the NgControl for this control. */
  readonly ngControl: NgControl | null;

  /** Whether the control is focused. */
  readonly focused: boolean;

  /** Whether the control is empty. */
  readonly empty: boolean;

  /** Whether the control is required. */
  readonly required: boolean;

  /** Whether the control is disabled. */
  readonly disabled: boolean;

  /** Whether the control is in an error state. */
  readonly errorState: boolean;

  /** Sets the list of element IDs that currently describe this control. */
  abstract setDescribedByIds(ids: string[]): void;

  /** Focuses this control. */
  abstract focus(): void;
}
