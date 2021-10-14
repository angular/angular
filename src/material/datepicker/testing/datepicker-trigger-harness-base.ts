/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarness, LocatorFactory, parallel, TestElement} from '@angular/cdk/testing';
import {CalendarHarnessFilters} from './datepicker-harness-filters';
import {MatCalendarHarness} from './calendar-harness';

/** Interface for a test harness that can open and close a calendar. */
export interface DatepickerTrigger {
  isCalendarOpen(): Promise<boolean>;
  openCalendar(): Promise<void>;
  closeCalendar(): Promise<void>;
  hasCalendar(): Promise<boolean>;
  getCalendar(filter?: CalendarHarnessFilters): Promise<MatCalendarHarness>;
}

/** Base class for harnesses that can trigger a calendar. */
export abstract class DatepickerTriggerHarnessBase
  extends ComponentHarness
  implements DatepickerTrigger
{
  /** Whether the trigger is disabled. */
  abstract isDisabled(): Promise<boolean>;

  /** Whether the calendar associated with the trigger is open. */
  abstract isCalendarOpen(): Promise<boolean>;

  /** Opens the calendar associated with the trigger. */
  protected abstract _openCalendar(): Promise<void>;

  /** Opens the calendar if the trigger is enabled and it has a calendar. */
  async openCalendar(): Promise<void> {
    const [isDisabled, hasCalendar] = await parallel(() => [this.isDisabled(), this.hasCalendar()]);

    if (!isDisabled && hasCalendar) {
      return this._openCalendar();
    }
  }

  /** Closes the calendar if it is open. */
  async closeCalendar(): Promise<void> {
    if (await this.isCalendarOpen()) {
      await closeCalendar(getCalendarId(this.host()), this.documentRootLocatorFactory());
      // This is necessary so that we wait for the closing animation to finish in touch UI mode.
      await this.forceStabilize();
    }
  }

  /** Gets whether there is a calendar associated with the trigger. */
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

/** Gets the ID of the calendar that a particular test element can trigger. */
export async function getCalendarId(host: Promise<TestElement>): Promise<string | null> {
  return (await host).getAttribute('data-mat-calendar');
}

/** Closes the calendar with a specific ID. */
export async function closeCalendar(
  calendarId: Promise<string | null>,
  documentLocator: LocatorFactory,
) {
  // We close the calendar by clicking on the backdrop, even though all datepicker variants
  // have the ability to close by pressing escape. The backdrop is preferrable, because the
  // escape key has multiple functions inside a range picker (either cancel the current range
  // or close the calendar). Since we don't have access to set the ID on the backdrop in all
  // cases, we set a unique class instead which is the same as the calendar's ID and suffixed
  // with `-backdrop`.
  const backdropSelector = `.${await calendarId}-backdrop`;
  return (await documentLocator.locatorFor(backdropSelector)()).click();
}

/** Gets the test harness for a calendar associated with a particular host. */
export async function getCalendar(
  filter: CalendarHarnessFilters,
  host: Promise<TestElement>,
  documentLocator: LocatorFactory,
): Promise<MatCalendarHarness> {
  const calendarId = await getCalendarId(host);

  if (!calendarId) {
    throw Error(`Element is not associated with a calendar`);
  }

  return documentLocator.locatorFor(
    MatCalendarHarness.with({
      ...filter,
      selector: `#${calendarId}`,
    }),
  )();
}
