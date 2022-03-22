/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  AsyncFactoryFn,
  ComponentHarness,
  HarnessPredicate,
  TestElement,
} from '@angular/cdk/testing';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {SlideToggleHarnessFilters} from './slide-toggle-harness-filters';

export abstract class _MatSlideToggleHarnessBase extends ComponentHarness {
  private _label = this.locatorFor('label');
  protected abstract _nativeElement: AsyncFactoryFn<TestElement>;

  /** Toggle the checked state of the slide-toggle. */
  abstract toggle(): Promise<void>;

  /** Whether the slide-toggle is checked. */
  abstract isChecked(): Promise<boolean>;

  /** Whether the slide-toggle is disabled. */
  async isDisabled(): Promise<boolean> {
    const disabled = (await this._nativeElement()).getAttribute('disabled');
    return coerceBooleanProperty(await disabled);
  }

  /** Whether the slide-toggle is required. */
  async isRequired(): Promise<boolean> {
    const required = (await this._nativeElement()).getAttribute('required');
    return coerceBooleanProperty(await required);
  }

  /** Whether the slide-toggle is valid. */
  async isValid(): Promise<boolean> {
    const invalid = (await this.host()).hasClass('ng-invalid');
    return !(await invalid);
  }

  /** Gets the slide-toggle's name. */
  async getName(): Promise<string | null> {
    return (await this._nativeElement()).getAttribute('name');
  }

  /** Gets the slide-toggle's aria-label. */
  async getAriaLabel(): Promise<string | null> {
    return (await this._nativeElement()).getAttribute('aria-label');
  }

  /** Gets the slide-toggle's aria-labelledby. */
  async getAriaLabelledby(): Promise<string | null> {
    return (await this._nativeElement()).getAttribute('aria-labelledby');
  }

  /** Gets the slide-toggle's label text. */
  async getLabelText(): Promise<string> {
    return (await this._label()).text();
  }

  /** Focuses the slide-toggle. */
  async focus(): Promise<void> {
    return (await this._nativeElement()).focus();
  }

  /** Blurs the slide-toggle. */
  async blur(): Promise<void> {
    return (await this._nativeElement()).blur();
  }

  /** Whether the slide-toggle is focused. */
  async isFocused(): Promise<boolean> {
    return (await this._nativeElement()).isFocused();
  }

  /**
   * Puts the slide-toggle in a checked state by toggling it if it is currently unchecked, or doing
   * nothing if it is already checked.
   */
  async check(): Promise<void> {
    if (!(await this.isChecked())) {
      await this.toggle();
    }
  }

  /**
   * Puts the slide-toggle in an unchecked state by toggling it if it is currently checked, or doing
   * nothing if it is already unchecked.
   */
  async uncheck(): Promise<void> {
    if (await this.isChecked()) {
      await this.toggle();
    }
  }
}

/** Harness for interacting with a standard mat-slide-toggle in tests. */
export class MatSlideToggleHarness extends _MatSlideToggleHarnessBase {
  private _inputContainer = this.locatorFor('.mat-slide-toggle-bar');
  protected _nativeElement = this.locatorFor('input');

  /** The selector for the host element of a `MatSlideToggle` instance. */
  static hostSelector = '.mat-slide-toggle';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatSlideToggleHarness` that meets
   * certain criteria.
   * @param options Options for filtering which slide toggle instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: SlideToggleHarnessFilters = {}): HarnessPredicate<MatSlideToggleHarness> {
    return (
      new HarnessPredicate(MatSlideToggleHarness, options)
        .addOption('label', options.label, (harness, label) =>
          HarnessPredicate.stringMatches(harness.getLabelText(), label),
        )
        // We want to provide a filter option for "name" because the name of the slide-toggle is
        // only set on the underlying input. This means that it's not possible for developers
        // to retrieve the harness of a specific checkbox with name through a CSS selector.
        .addOption(
          'name',
          options.name,
          async (harness, name) => (await harness.getName()) === name,
        )
        .addOption(
          'checked',
          options.checked,
          async (harness, checked) => (await harness.isChecked()) == checked,
        )
    );
  }

  /** Toggle the checked state of the slide-toggle. */
  async toggle(): Promise<void> {
    return (await this._inputContainer()).click();
  }

  /** Whether the slide-toggle is checked. */
  async isChecked(): Promise<boolean> {
    const checked = (await this._nativeElement()).getProperty<boolean>('checked');
    return coerceBooleanProperty(await checked);
  }
}
