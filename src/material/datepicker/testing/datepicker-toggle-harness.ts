/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HarnessPredicate} from '@angular/cdk/testing';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {DatepickerToggleHarnessFilters} from './datepicker-harness-filters';
import {DatepickerTriggerHarnessBase} from './datepicker-trigger-harness-base';

/** Harness for interacting with a standard Material datepicker toggle in tests. */
export class MatDatepickerToggleHarness extends DatepickerTriggerHarnessBase {
  static hostSelector = '.mat-datepicker-toggle';

  /** The clickable button inside the toggle. */
  private _button = this.locatorFor('button');

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatDatepickerToggleHarness` that
   * meets certain criteria.
   * @param options Options for filtering which datepicker toggle instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(
    options: DatepickerToggleHarnessFilters = {},
  ): HarnessPredicate<MatDatepickerToggleHarness> {
    return new HarnessPredicate(MatDatepickerToggleHarness, options);
  }

  /** Gets whether the calendar associated with the toggle is open. */
  async isCalendarOpen(): Promise<boolean> {
    return (await this.host()).hasClass('mat-datepicker-toggle-active');
  }

  /** Whether the toggle is disabled. */
  async isDisabled(): Promise<boolean> {
    const button = await this._button();
    return coerceBooleanProperty(await button.getAttribute('disabled'));
  }

  protected async _openCalendar(): Promise<void> {
    return (await this._button()).click();
  }
}
