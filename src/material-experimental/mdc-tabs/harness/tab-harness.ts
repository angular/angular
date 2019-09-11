/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarness, TestElement} from '@angular/cdk/testing';

/**
 * Harness for interacting with a standard Angular Material tab-label in tests.
 * @dynamic
 */
export class MatTabHarness extends ComponentHarness {
  static hostSelector = '.mat-tab-label';

  private _rootLocatorFactory = this.documentRootLocatorFactory();

  /** Gets the label of the tab. */
  async getLabel(): Promise<string> {
    return (await this.host()).text();
  }

  /** Gets the aria label of the tab. */
  async getAriaLabel(): Promise<string|null> {
    return (await this.host()).getAttribute('aria-label');
  }

  /** Gets the value of the "aria-labelledby" attribute. */
  async getAriaLabelledby(): Promise<string|null> {
    return (await this.host()).getAttribute('aria-labelledby');
  }

  /**
   * Gets the content element of the given tab. Note that the element will be empty
   * until the tab is selected. This is an implementation detail of the tab-group
   * in order to avoid rendering of non-active tabs.
   */
  async getContentElement(): Promise<TestElement> {
    return this._rootLocatorFactory.locatorFor(`#${await this._getContentId()}`)();
  }

  /** Whether the tab is selected. */
  async isSelected(): Promise<boolean> {
    const hostEl = await this.host();
    return (await hostEl.getAttribute('aria-selected')) === 'true';
  }

  /** Whether the tab is disabled. */
  async isDisabled(): Promise<boolean> {
    const hostEl = await this.host();
    return (await hostEl.getAttribute('aria-disabled')) === 'true';
  }

  /**
   * Selects the given tab by clicking on the label. Tab cannot be
   * selected if disabled.
   */
  async select(): Promise<void> {
    await (await this.host()).click();
  }

  /** Gets the element id for the content of the current tab. */
  private async _getContentId(): Promise<string> {
    const hostEl = await this.host();
    // Tabs never have an empty "aria-controls" attribute.
    return (await hostEl.getAttribute('aria-controls'))!;
  }
}
