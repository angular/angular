/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ContentContainerComponentHarness, HarnessPredicate} from '@angular/cdk/testing';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {LegacyButtonHarnessFilters} from './button-harness-filters';

/** Harness for interacting with a standard mat-button in tests. */
export class MatLegacyButtonHarness extends ContentContainerComponentHarness {
  // TODO(jelbourn) use a single class, like `.mat-button-base`
  /** The selector for the host element of a button instance. */
  static hostSelector = `[mat-button], [mat-raised-button], [mat-flat-button], [mat-icon-button],
                         [mat-stroked-button], [mat-fab], [mat-mini-fab]`;

  /**
   * Gets a `HarnessPredicate` that can be used to search for a button harness that meets
   * certain criteria.
   * @param options Options for filtering which button instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: LegacyButtonHarnessFilters = {}): HarnessPredicate<MatLegacyButtonHarness> {
    return new HarnessPredicate(MatLegacyButtonHarness, options).addOption(
      'text',
      options.text,
      (harness, text) => HarnessPredicate.stringMatches(harness.getText(), text),
    );
  }

  /**
   * Clicks the button at the given position relative to its top-left.
   * @param relativeX The relative x position of the click.
   * @param relativeY The relative y position of the click.
   */
  click(relativeX: number, relativeY: number): Promise<void>;
  /** Clicks the button at its center. */
  click(location: 'center'): Promise<void>;
  /** Clicks the button. */
  click(): Promise<void>;
  async click(...args: [] | ['center'] | [number, number]): Promise<void> {
    return (await this.host()).click(...(args as []));
  }

  /** Whether the button is disabled. */
  async isDisabled(): Promise<boolean> {
    const disabled = (await this.host()).getAttribute('disabled');
    return coerceBooleanProperty(await disabled);
  }

  /** Gets the button's label text. */
  async getText(): Promise<string> {
    return (await this.host()).text();
  }

  /** Focuses the button. */
  async focus(): Promise<void> {
    return (await this.host()).focus();
  }

  /** Blurs the button. */
  async blur(): Promise<void> {
    return (await this.host()).blur();
  }

  /** Whether the button is focused. */
  async isFocused(): Promise<boolean> {
    return (await this.host()).isFocused();
  }
}
