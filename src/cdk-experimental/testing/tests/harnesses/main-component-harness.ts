/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarness} from '../../component-harness';
import {TestElement} from '../../test-element';
import {SubComponentHarness} from './sub-component-harness';

export class WrongComponentHarness extends ComponentHarness {
  static readonly hostSelector = 'wrong-selector';
}

export class MainComponentHarness extends ComponentHarness {
  static readonly hostSelector = 'test-main';

  readonly title = this.locatorFor('h1');
  readonly button = this.locatorFor('button');
  readonly asyncCounter = this.locatorFor('#asyncCounter');
  readonly counter = this.locatorFor('#counter');
  readonly input = this.locatorFor('#input');
  readonly value = this.locatorFor('#value');
  readonly allLabels = this.locatorForAll('label');
  readonly allLists = this.locatorForAll(SubComponentHarness);
  readonly memo = this.locatorFor('textarea');
  // Allow null for element
  readonly nullItem = this.locatorForOptional('wrong locator');
  // Allow null for component harness
  readonly nullComponentHarness = this.locatorForOptional(WrongComponentHarness);
  readonly errorItem = this.locatorFor('wrong locator');

  readonly globalEl = this.documentRootLocatorFactory().locatorFor('.sibling');
  readonly errorGlobalEl = this.documentRootLocatorFactory().locatorFor('wrong locator');
  readonly nullGlobalEl = this.documentRootLocatorFactory().locatorForOptional('wrong locator');

  readonly optionalDiv = this.locatorForOptional('div');
  readonly optionalSubComponent = this.locatorForOptional(SubComponentHarness);
  readonly errorSubComponent = this.locatorFor(WrongComponentHarness);

  private _testTools = this.locatorFor(SubComponentHarness);

  async increaseCounter(times: number) {
    const button = await this.button();
    for (let i = 0; i < times; i++) {
      await button.click();
    }
  }

  async getTestTool(index: number): Promise<TestElement> {
    const subComponent = await this._testTools();
    return subComponent.getItem(index);
  }

  async getTestTools(): Promise<TestElement[]> {
    const subComponent = await this._testTools();
    return subComponent.getItems();
  }
}
