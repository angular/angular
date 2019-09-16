/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarness, HarnessPredicate} from '@angular/cdk/testing';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {ButtonHarnessFilters} from '@angular/material/button/testing/button-harness-filters';


/**
 * Harness for interacting with a MDC-based mat-button in tests.
 * @dynamic
 */
export class MatButtonHarness extends ComponentHarness {
  // TODO(jelbourn) use a single class, like `.mat-button-base`
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
   * Gets a `HarnessPredicate` that can be used to search for a button with specific attributes.
   * @param options Options for narrowing the search:
   *   - `selector` finds a button whose host element matches the given selector.
   *   - `text` finds a button with specific text content.
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

  /** Gets a boolean promise indicating if the button is disabled. */
  async isDisabled(): Promise<boolean> {
    const disabled = (await this.host()).getAttribute('disabled');
    return coerceBooleanProperty(await disabled);
  }

  /** Gets a promise for the button's label text. */
  async getText(): Promise<string> {
    return (await this.host()).text();
  }

  /** Focuses the button and returns a void promise that indicates when the action is complete. */
  async focus(): Promise<void> {
    return (await this.host()).focus();
  }

  /** Blurs the button and returns a void promise that indicates when the action is complete. */
  async blur(): Promise<void> {
    return (await this.host()).blur();
  }
}
