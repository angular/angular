/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HarnessPredicate, parallel, TestKey} from '@angular/cdk/testing';
import {DatepickerInputHarnessFilters, CalendarHarnessFilters} from './datepicker-harness-filters';
import {MatDatepickerInputHarnessBase, getInputPredicate} from './datepicker-input-harness-base';
import {MatCalendarHarness} from './calendar-harness';
import {
  DatepickerTrigger,
  closeCalendar,
  getCalendarId,
  getCalendar,
} from './datepicker-trigger-harness-base';

/** Harness for interacting with a standard Material datepicker inputs in tests. */
export class MatDatepickerInputHarness
  extends MatDatepickerInputHarnessBase
  implements DatepickerTrigger
{
  static hostSelector = '.mat-datepicker-input';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatDatepickerInputHarness`
   * that meets certain criteria.
   * @param options Options for filtering which input instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(
    options: DatepickerInputHarnessFilters = {},
  ): HarnessPredicate<MatDatepickerInputHarness> {
    return getInputPredicate(MatDatepickerInputHarness, options);
  }

  /** Gets whether the calendar associated with the input is open. */
  async isCalendarOpen(): Promise<boolean> {
    // `aria-owns` is set only if there's an open datepicker so we can use it as an indicator.
    const host = await this.host();
    return (await host.getAttribute('aria-owns')) != null;
  }

  /** Opens the calendar associated with the input. */
  async openCalendar(): Promise<void> {
    const [isDisabled, hasCalendar] = await parallel(() => [this.isDisabled(), this.hasCalendar()]);

    if (!isDisabled && hasCalendar) {
      // Alt + down arrow is the combination for opening the calendar with the keyboard.
      const host = await this.host();
      return host.sendKeys({alt: true}, TestKey.DOWN_ARROW);
    }
  }

  /** Closes the calendar associated with the input. */
  async closeCalendar(): Promise<void> {
    if (await this.isCalendarOpen()) {
      await closeCalendar(getCalendarId(this.host()), this.documentRootLocatorFactory());
      // This is necessary so that we wait for the closing animation to finish in touch UI mode.
      await this.forceStabilize();
    }
  }

  /** Whether a calendar is associated with the input. */
  async hasCalendar(): Promise<boolean> {
    return (await getCalendarId(this.host())) != null;
  }

  /**
   * Gets the `MatCalendarHarness` that is associated with the trigger.
   * @param filter Optionally filters which calendar is included.
   */
  async getCalendar(filter: CalendarHarnessFilters = {}): Promise<MatCalendarHarness> {
    return getCalendar(filter, this.host(), this.documentRootLocatorFactory());
  }
}
