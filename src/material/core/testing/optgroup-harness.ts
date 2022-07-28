/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ComponentHarness,
  ComponentHarnessConstructor,
  HarnessPredicate,
} from '@angular/cdk/testing';
import {OptgroupHarnessFilters} from './optgroup-harness-filters';
import {MatOptionHarness} from './option-harness';
import {OptionHarnessFilters} from './option-harness-filters';

/** Harness for interacting with an MDC-based `mat-optgroup` in tests. */
export class MatOptgroupHarness extends ComponentHarness {
  /** Selector used to locate option group instances. */
  static hostSelector = '.mat-mdc-optgroup';
  private _label = this.locatorFor('.mat-mdc-optgroup-label');

  /**
   * Gets a `HarnessPredicate` that can be used to search for a option group with specific
   * attributes.
   * @param options Options for filtering which option instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with<T extends MatOptgroupHarness>(
    this: ComponentHarnessConstructor<T>,
    options: OptgroupHarnessFilters = {},
  ): HarnessPredicate<T> {
    return new HarnessPredicate(this, options).addOption(
      'labelText',
      options.labelText,
      async (harness, title) => HarnessPredicate.stringMatches(await harness.getLabelText(), title),
    );
  }

  /** Gets the option group's label text. */
  async getLabelText(): Promise<string> {
    return (await this._label()).text();
  }

  /** Gets whether the option group is disabled. */
  async isDisabled(): Promise<boolean> {
    return (await (await this.host()).getAttribute('aria-disabled')) === 'true';
  }

  /**
   * Gets the options that are inside the group.
   * @param filter Optionally filters which options are included.
   */
  async getOptions(filter: OptionHarnessFilters = {}): Promise<MatOptionHarness[]> {
    return this.locatorForAll(MatOptionHarness.with(filter))();
  }
}
