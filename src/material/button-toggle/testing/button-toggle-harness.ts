/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarness, HarnessPredicate} from '@angular/cdk/testing';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {MatButtonToggleAppearance} from '@angular/material/button-toggle';
import {ButtonToggleHarnessFilters} from './button-toggle-harness-filters';


/** Harness for interacting with a standard mat-button-toggle in tests. */
export class MatButtonToggleHarness extends ComponentHarness {
  /** The selector for the host element of a `MatButton` instance. */
  static hostSelector = 'mat-button-toggle';

  private _label = this.locatorFor('.mat-button-toggle-label-content');
  private _button = this.locatorFor('.mat-button-toggle-button');

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatButtonToggleHarness` that meets
   * certain criteria.
   * @param options Options for filtering which button toggle instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: ButtonToggleHarnessFilters = {}): HarnessPredicate<MatButtonToggleHarness> {
    return new HarnessPredicate(MatButtonToggleHarness, options)
        .addOption('text', options.text,
            (harness, text) => HarnessPredicate.stringMatches(harness.getText(), text))
        .addOption('name', options.name,
            (harness, name) => HarnessPredicate.stringMatches(harness.getName(), name))
        .addOption('checked', options.checked,
            async (harness, checked) => (await harness.isChecked()) === checked);
  }

  /** Gets a boolean promise indicating if the button toggle is checked. */
  async isChecked(): Promise<boolean> {
    const checked = (await this._button()).getAttribute('aria-pressed');
    return coerceBooleanProperty(await checked);
  }

  /** Gets a boolean promise indicating if the button toggle is disabled. */
  async isDisabled(): Promise<boolean> {
    const disabled = (await this._button()).getAttribute('disabled');
    return coerceBooleanProperty(await disabled);
  }

  /** Gets a promise for the button toggle's name. */
  async getName(): Promise<string | null> {
    return (await this._button()).getAttribute('name');
  }

  /** Gets a promise for the button toggle's aria-label. */
  async getAriaLabel(): Promise<string | null> {
    return (await this._button()).getAttribute('aria-label');
  }

  /** Gets a promise for the button toggles's aria-labelledby. */
  async getAriaLabelledby(): Promise<string | null> {
    return (await this._button()).getAttribute('aria-labelledby');
  }

  /** Gets a promise for the button toggle's text. */
  async getText(): Promise<string> {
    return (await this._label()).text();
  }

  /** Gets the appearance that the button toggle is using. */
  async getAppearance(): Promise<MatButtonToggleAppearance> {
    const host = await this.host();
    const className = 'mat-button-toggle-appearance-standard';
    return await host.hasClass(className) ? 'standard' : 'legacy';
  }

  /** Focuses the toggle. */
  async focus(): Promise<void> {
    return (await this._button()).focus();
  }

  /** Blurs the toggle. */
  async blur(): Promise<void> {
    return (await this._button()).blur();
  }

  /** Toggle the checked state of the buttons toggle. */
  async toggle(): Promise<void> {
    return (await this._button()).click();
  }

  /**
   * Puts the button toggle in a checked state by toggling it if it's
   * currently unchecked, or doing nothing if it is already checked.
   */
  async check(): Promise<void> {
    if (!(await this.isChecked())) {
      await this.toggle();
    }
  }

  /**
   * Puts the button toggle in an unchecked state by toggling it if it's
   * currently checked, or doing nothing if it's already unchecked.
   */
  async uncheck(): Promise<void> {
    if (await this.isChecked()) {
      await this.toggle();
    }
  }
}
