/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HarnessPredicate, ComponentHarness} from '@angular/cdk/testing';
import {CalendarCellHarnessFilters} from './datepicker-harness-filters';

/** Harness for interacting with a standard Material calendar cell in tests. */
export class MatCalendarCellHarness extends ComponentHarness {
  static hostSelector = '.mat-calendar-body-cell';

  /** Reference to the inner content element inside the cell. */
  private _content = this.locatorFor('.mat-calendar-body-cell-content');

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatCalendarCellHarness`
   * that meets certain criteria.
   * @param options Options for filtering which cell instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: CalendarCellHarnessFilters = {}): HarnessPredicate<MatCalendarCellHarness> {
    return new HarnessPredicate(MatCalendarCellHarness, options)
      .addOption('text', options.text, (harness, text) => {
        return HarnessPredicate.stringMatches(harness.getText(), text);
      })
      .addOption('selected', options.selected, async (harness, selected) => {
        return (await harness.isSelected()) === selected;
      })
      .addOption('active', options.active, async (harness, active) => {
        return (await harness.isActive()) === active;
      })
      .addOption('disabled', options.disabled, async (harness, disabled) => {
        return (await harness.isDisabled()) === disabled;
      })
      .addOption('today', options.today, async (harness, today) => {
        return (await harness.isToday()) === today;
      })
      .addOption('inRange', options.inRange, async (harness, inRange) => {
        return (await harness.isInRange()) === inRange;
      })
      .addOption(
        'inComparisonRange',
        options.inComparisonRange,
        async (harness, inComparisonRange) => {
          return (await harness.isInComparisonRange()) === inComparisonRange;
        },
      )
      .addOption('inPreviewRange', options.inPreviewRange, async (harness, inPreviewRange) => {
        return (await harness.isInPreviewRange()) === inPreviewRange;
      });
  }

  /** Gets the text of the calendar cell. */
  async getText(): Promise<string> {
    return (await this._content()).text();
  }

  /** Gets the aria-label of the calendar cell. */
  async getAriaLabel(): Promise<string> {
    // We're guaranteed for the `aria-label` to be defined
    // since this is a private element that we control.
    return (await this.host()).getAttribute('aria-label') as Promise<string>;
  }

  /** Whether the cell is selected. */
  async isSelected(): Promise<boolean> {
    const host = await this.host();
    return (await host.getAttribute('aria-pressed')) === 'true';
  }

  /** Whether the cell is disabled. */
  async isDisabled(): Promise<boolean> {
    return this._hasState('disabled');
  }

  /** Whether the cell is currently activated using keyboard navigation. */
  async isActive(): Promise<boolean> {
    return this._hasState('active');
  }

  /** Whether the cell represents today's date. */
  async isToday(): Promise<boolean> {
    return (await this._content()).hasClass('mat-calendar-body-today');
  }

  /** Selects the calendar cell. Won't do anything if the cell is disabled. */
  async select(): Promise<void> {
    return (await this.host()).click();
  }

  /** Hovers over the calendar cell. */
  async hover(): Promise<void> {
    return (await this.host()).hover();
  }

  /** Moves the mouse away from the calendar cell. */
  async mouseAway(): Promise<void> {
    return (await this.host()).mouseAway();
  }

  /** Focuses the calendar cell. */
  async focus(): Promise<void> {
    return (await this.host()).focus();
  }

  /** Removes focus from the calendar cell. */
  async blur(): Promise<void> {
    return (await this.host()).blur();
  }

  /** Whether the cell is the start of the main range. */
  async isRangeStart(): Promise<boolean> {
    return this._hasState('range-start');
  }

  /** Whether the cell is the end of the main range. */
  async isRangeEnd(): Promise<boolean> {
    return this._hasState('range-end');
  }

  /** Whether the cell is part of the main range. */
  async isInRange(): Promise<boolean> {
    return this._hasState('in-range');
  }

  /** Whether the cell is the start of the comparison range. */
  async isComparisonRangeStart(): Promise<boolean> {
    return this._hasState('comparison-start');
  }

  /** Whether the cell is the end of the comparison range. */
  async isComparisonRangeEnd(): Promise<boolean> {
    return this._hasState('comparison-end');
  }

  /** Whether the cell is inside of the comparison range. */
  async isInComparisonRange(): Promise<boolean> {
    return this._hasState('in-comparison-range');
  }

  /** Whether the cell is the start of the preview range. */
  async isPreviewRangeStart(): Promise<boolean> {
    return this._hasState('preview-start');
  }

  /** Whether the cell is the end of the preview range. */
  async isPreviewRangeEnd(): Promise<boolean> {
    return this._hasState('preview-end');
  }

  /** Whether the cell is inside of the preview range. */
  async isInPreviewRange(): Promise<boolean> {
    return this._hasState('in-preview');
  }

  /** Returns whether the cell has a particular CSS class-based state. */
  private async _hasState(name: string): Promise<boolean> {
    return (await this.host()).hasClass(`mat-calendar-body-${name}`);
  }
}
