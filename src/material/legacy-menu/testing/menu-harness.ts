/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HarnessPredicate} from '@angular/cdk/testing';
import {
  MenuHarnessFilters,
  MenuItemHarnessFilters,
  _MatMenuHarnessBase,
  _MatMenuItemHarnessBase,
} from '@angular/material/menu/testing';

/** Harness for interacting with a standard mat-menu in tests. */
export class MatLegacyMenuHarness extends _MatMenuHarnessBase<
  typeof MatLegacyMenuItemHarness,
  MatLegacyMenuItemHarness,
  MenuItemHarnessFilters
> {
  /** The selector for the host element of a `MatMenu` instance. */
  static hostSelector = '.mat-menu-trigger';
  protected _itemClass = MatLegacyMenuItemHarness;

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatMenuHarness` that meets certain
   * criteria.
   * @param options Options for filtering which menu instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: MenuHarnessFilters = {}): HarnessPredicate<MatLegacyMenuHarness> {
    return new HarnessPredicate(MatLegacyMenuHarness, options).addOption(
      'triggerText',
      options.triggerText,
      (harness, text) => HarnessPredicate.stringMatches(harness.getTriggerText(), text),
    );
  }
}

/** Harness for interacting with a standard mat-menu-item in tests. */
export class MatLegacyMenuItemHarness extends _MatMenuItemHarnessBase<
  typeof MatLegacyMenuHarness,
  MatLegacyMenuHarness
> {
  /** The selector for the host element of a `MatMenuItem` instance. */
  static hostSelector = '.mat-menu-item';
  protected _menuClass = MatLegacyMenuHarness;

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatMenuItemHarness` that meets
   * certain criteria.
   * @param options Options for filtering which menu item instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: MenuItemHarnessFilters = {}): HarnessPredicate<MatLegacyMenuItemHarness> {
    return new HarnessPredicate(MatLegacyMenuItemHarness, options)
      .addOption('text', options.text, (harness, text) =>
        HarnessPredicate.stringMatches(harness.getText(), text),
      )
      .addOption(
        'hasSubmenu',
        options.hasSubmenu,
        async (harness, hasSubmenu) => (await harness.hasSubmenu()) === hasSubmenu,
      );
  }
}
