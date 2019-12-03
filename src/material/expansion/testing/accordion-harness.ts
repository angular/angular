/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarness, HarnessPredicate} from '@angular/cdk/testing';
import {MatExpansionPanelHarness} from './expansion-harness';
import {AccordionHarnessFilters, ExpansionPanelHarnessFilters} from './expansion-harness-filters';

/** Harness for interacting with a standard mat-accordion in tests. */
export class MatAccordionHarness extends ComponentHarness {
  static hostSelector = '.mat-accordion';

  /**
   * Gets a `HarnessPredicate` that can be used to search for an accordion
   * with specific attributes.
   * @param options Options for narrowing the search.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: AccordionHarnessFilters = {}): HarnessPredicate<MatAccordionHarness> {
    return new HarnessPredicate(MatAccordionHarness, options);
  }

  /** Gets all expansion panels which are part of the accordion. */
  async getExpansionPanels(filter: ExpansionPanelHarnessFilters = {}):
      Promise<MatExpansionPanelHarness[]> {
    return this.locatorForAll(MatExpansionPanelHarness.with(filter))();
  }

  /** Whether the accordion allows multiple expanded panels simultaneously. */
  async isMulti(): Promise<boolean> {
    return (await this.host()).hasClass('mat-accordion-multi');
  }
}
