/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarness, HarnessPredicate} from '@angular/cdk-experimental/testing';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {RadioButtonHarnessFilters} from './radio-harness-filters';

/**
 * Harness for interacting with a standard mat-radio-button in tests.
 * @dynamic
 */
export class MatRadioButtonHarness extends ComponentHarness {
  static hostSelector = 'mat-radio-button';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a radio-button with
   * specific attributes.
   * @param options Options for narrowing the search:
   *   - `label` finds a radio-button with specific label text.
   *   - `name` finds a radio-button with specific name.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: RadioButtonHarnessFilters = {}): HarnessPredicate<MatRadioButtonHarness> {
    return new HarnessPredicate(MatRadioButtonHarness)
        .addOption(
            'label', options.label,
            (harness, label) => HarnessPredicate.stringMatches(harness.getLabelText(), label))
        .addOption(
            'name', options.name, async (harness, name) => (await harness.getName()) === name)
        .addOption('id', options.id, async (harness, id) => (await harness.getId()) === id);
  }

  private _textLabel = this.locatorFor('.mat-radio-label-content');
  private _clickLabel = this.locatorFor('.mat-radio-label');
  private _input = this.locatorFor('input');

  /** Whether the radio-button is checked. */
  async isChecked(): Promise<boolean> {
    const checked = (await this._input()).getAttribute('checked');
    return coerceBooleanProperty(await checked);
  }

  /** Whether the radio-button is disabled. */
  async isDisabled(): Promise<boolean> {
    const disabled = (await this._input()).getAttribute('disabled');
    return coerceBooleanProperty(await disabled);
  }

  /** Whether the radio-button is required. */
  async isRequired(): Promise<boolean> {
    const required = (await this._input()).getAttribute('required');
    return coerceBooleanProperty(await required);
  }

  /** Gets a promise for the radio-button's name. */
  async getName(): Promise<string|null> {
    return (await this._input()).getAttribute('name');
  }

  /** Gets a promise for the radio-button's id. */
  async getId(): Promise<string|null> {
    return (await this.host()).getAttribute('id');
  }

  /** Gets a promise for the radio-button's label text. */
  async getLabelText(): Promise<string> {
    return (await this._textLabel()).text();
  }

  /**
   * Focuses the radio-button and returns a void promise that indicates when the
   * action is complete.
   */
  async focus(): Promise<void> {
    return (await this._input()).focus();
  }

  /**
   * Blurs the radio-button and returns a void promise that indicates when the
   * action is complete.
   */
  async blur(): Promise<void> {
    return (await this._input()).blur();
  }

  /**
   * Puts the radio-button in a checked state by clicking it if it is currently unchecked,
   * or doing nothing if it is already checked. Returns a void promise that indicates when
   * the action is complete.
   */
  async check(): Promise<void> {
    if (!(await this.isChecked())) {
      return (await this._clickLabel()).click();
    }
  }
}
