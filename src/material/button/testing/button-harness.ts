/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarness, HarnessPredicate} from '@angular/cdk/testing';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {ButtonHarnessFilters} from './button-harness-filters';


/** Harness for interacting with a standard mat-button in tests. */
export class MatButtonHarness extends ComponentHarness {
  // TODO(jelbourn) use a single class, like `.mat-button-base`
  /** The selector for the host element of a `MatButton` instance. */
  static hostSelector = [
    '[mat-button]',
    '[mat-raised-button]',
    '[mat-flat-button]',
    '[mat-icon-button]',
    '[mat-stroked-button]',
    '[mat-fab]',
    '[mat-mini-fab]',
  ].join(',');

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatButtonHarness` that meets
   * certain criteria.
   * @param options Options for filtering which button instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: ButtonHarnessFilters = {}): HarnessPredicate<MatButtonHarness> {
    return new HarnessPredicate(MatButtonHarness, options)
        .addOption('text', options.text,
            (harness, text) => HarnessPredicate.stringMatches(harness.getText(), text));
  }

  /** Clicks the button. */
  async click(): Promise<void> {
    return (await this.host()).click();
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
}
