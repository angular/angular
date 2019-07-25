/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarness, HarnessPredicate} from '@angular/cdk-experimental/testing';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {SlideToggleHarnessFilters} from './slide-toggle-harness-filters';


/**
 * Harness for interacting with a standard mat-slide-toggle in tests.
 * @dynamic
 */
export class MatSlideToggleHarness extends ComponentHarness {
  static hostSelector = 'mat-slide-toggle';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a slide-toggle w/ specific attributes.
   * @param options Options for narrowing the search:
   *   - `label` finds a slide-toggle with specific label text.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: SlideToggleHarnessFilters = {}): HarnessPredicate<MatSlideToggleHarness> {
    return new HarnessPredicate(MatSlideToggleHarness)
        .addOption('label', options.label,
            (harness, label) => HarnessPredicate.stringMatches(harness.getLabelText(), label));
  }

  private _label = this.locatorFor('label');
  private _input = this.locatorFor('input');
  private _inputContainer = this.locatorFor('.mat-slide-toggle-bar');

  /** Gets a boolean promise indicating if the slide-toggle is checked. */
  async isChecked(): Promise<boolean> {
    const checked = (await this._input()).getAttribute('checked');
    return coerceBooleanProperty(await checked);
  }

  /** Gets a boolean promise indicating if the slide-toggle is disabled. */
  async isDisabled(): Promise<boolean> {
    const disabled = (await this._input()).getAttribute('disabled');
    return coerceBooleanProperty(await disabled);
  }

  /** Gets a boolean promise indicating if the slide-toggle is required. */
  async isRequired(): Promise<boolean> {
    const required = (await this._input()).getAttribute('required');
    return coerceBooleanProperty(await required);
  }

  /** Gets a boolean promise indicating if the slide-toggle is valid. */
  async isValid(): Promise<boolean> {
    const invalid = (await this.host()).hasClass('ng-invalid');
    return !(await invalid);
  }

  /** Gets a promise for the slide-toggle's name. */
  async getName(): Promise<string | null> {
    return (await this._input()).getAttribute('name');
  }

  /** Gets a promise for the slide-toggle's aria-label. */
  async getAriaLabel(): Promise<string | null> {
    return (await this._input()).getAttribute('aria-label');
  }

  /** Gets a promise for the slide-toggle's aria-labelledby. */
  async getAriaLabelledby(): Promise<string | null> {
    return (await this._input()).getAttribute('aria-labelledby');
  }

  /** Gets a promise for the slide-toggle's label text. */
  async getLabelText(): Promise<string> {
    return (await this._label()).text();
  }

  /** Focuses the slide-toggle and returns a void promise that indicates action completion. */
  async foucs(): Promise<void> {
    return (await this._input()).focus();
  }

  /** Blurs the slide-toggle and returns a void promise that indicates action completion. */
  async blur(): Promise<void> {
    return (await this._input()).blur();
  }

  /**
   * Toggle the checked state of the slide-toggle and returns a void promise that indicates when the
   * action is complete.
   *
   * Note: This toggles the slide-toggle as a user would, by clicking it.
   */
  async toggle(): Promise<void> {
    return (await this._inputContainer()).click();
  }

  /**
   * Puts the slide-toggle in a checked state by toggling it if it is currently unchecked, or doing
   * nothing if it is already checked. Returns a void promise that indicates when the action is
   * complete.
   *
   * Note: This attempts to check the slide-toggle as a user would, by clicking it.
   */
  async check(): Promise<void> {
    if (!(await this.isChecked())) {
      await this.toggle();
    }
  }

  /**
   * Puts the slide-toggle in an unchecked state by toggling it if it is currently checked, or doing
   * nothing if it is already unchecked. Returns a void promise that indicates when the action is
   * complete.
   *
   * Note: This toggles the slide-toggle as a user would, by clicking it.
   */
  async uncheck(): Promise<void> {
    if (await this.isChecked()) {
      await this.toggle();
    }
  }
}
