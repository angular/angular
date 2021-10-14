/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarness, HarnessPredicate} from '@angular/cdk/testing';
import {NativeOptionHarnessFilters} from './native-select-harness-filters';

/** Harness for interacting with a native `option` in tests. */
export class MatNativeOptionHarness extends ComponentHarness {
  /** Selector used to locate option instances. */
  static hostSelector = 'select[matNativeControl] option';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatNativeOptionHarness` that meets
   * certain criteria.
   * @param options Options for filtering which option instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: NativeOptionHarnessFilters = {}) {
    return new HarnessPredicate(MatNativeOptionHarness, options)
      .addOption('text', options.text, async (harness, title) =>
        HarnessPredicate.stringMatches(await harness.getText(), title),
      )
      .addOption(
        'index',
        options.index,
        async (harness, index) => (await harness.getIndex()) === index,
      )
      .addOption(
        'isSelected',
        options.isSelected,
        async (harness, isSelected) => (await harness.isSelected()) === isSelected,
      );
  }

  /** Gets the option's label text. */
  async getText(): Promise<string> {
    return (await this.host()).getProperty<string>('label');
  }

  /** Index of the option within the native `select` element. */
  async getIndex(): Promise<number> {
    return (await this.host()).getProperty<number>('index');
  }

  /** Gets whether the option is disabled. */
  async isDisabled(): Promise<boolean> {
    return (await this.host()).getProperty<boolean>('disabled');
  }

  /** Gets whether the option is selected. */
  async isSelected(): Promise<boolean> {
    return (await this.host()).getProperty<boolean>('selected');
  }
}
