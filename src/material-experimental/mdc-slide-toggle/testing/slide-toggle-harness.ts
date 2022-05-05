/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarnessConstructor, HarnessPredicate} from '@angular/cdk/testing';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {
  _MatSlideToggleHarnessBase,
  SlideToggleHarnessFilters,
} from '@angular/material/slide-toggle/testing';

/** Harness for interacting with a MDC-based mat-slide-toggle in tests. */
export class MatSlideToggleHarness extends _MatSlideToggleHarnessBase {
  protected _nativeElement = this.locatorFor('button');
  static hostSelector = '.mat-mdc-slide-toggle';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a slide-toggle w/ specific attributes.
   * @param options Options for narrowing the search:
   *   - `selector` finds a slide-toggle whose host element matches the given selector.
   *   - `label` finds a slide-toggle with specific label text.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with<T extends MatSlideToggleHarness>(
    this: ComponentHarnessConstructor<T>,
    options: SlideToggleHarnessFilters = {},
  ): HarnessPredicate<T> {
    return (
      new HarnessPredicate(this, options)
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
        .addOption(
          'disabled',
          options.disabled,
          async (harness, disabled) => (await harness.isDisabled()) == disabled,
        )
    );
  }

  async toggle(): Promise<void> {
    return (await this._nativeElement()).click();
  }

  override async isRequired(): Promise<boolean> {
    const ariaRequired = await (await this._nativeElement()).getAttribute('aria-required');
    return ariaRequired === 'true';
  }

  async isChecked(): Promise<boolean> {
    const checked = (await this._nativeElement()).getAttribute('aria-checked');
    return coerceBooleanProperty(await checked);
  }
}
