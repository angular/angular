/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  BaseHarnessFilters,
  ComponentHarness,
  ComponentHarnessConstructor,
  HarnessPredicate,
} from '@angular/cdk/testing';

/** A set of criteria that can be used to filter a list of error harness instances. */
export interface ErrorHarnessFilters extends BaseHarnessFilters {
  /** Only find instances whose text matches the given value. */
  text?: string | RegExp;
}

export abstract class _MatErrorHarnessBase extends ComponentHarness {
  /** Gets a promise for the error's label text. */
  async getText(): Promise<string> {
    return (await this.host()).text();
  }

  protected static _getErrorPredicate<T extends MatErrorHarness>(
    type: ComponentHarnessConstructor<T>,
    options: ErrorHarnessFilters,
  ): HarnessPredicate<T> {
    return new HarnessPredicate(type, options).addOption('text', options.text, (harness, text) =>
      HarnessPredicate.stringMatches(harness.getText(), text),
    );
  }
}

/** Harness for interacting with an MDC-based `mat-error` in tests. */
export class MatErrorHarness extends _MatErrorHarnessBase {
  static hostSelector = '.mat-mdc-form-field-error';

  /**
   * Gets a `HarnessPredicate` that can be used to search for an error with specific
   * attributes.
   * @param options Options for filtering which error instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with<T extends MatErrorHarness>(
    this: ComponentHarnessConstructor<T>,
    options: ErrorHarnessFilters = {},
  ): HarnessPredicate<T> {
    return _MatErrorHarnessBase._getErrorPredicate(this, options);
  }
}
