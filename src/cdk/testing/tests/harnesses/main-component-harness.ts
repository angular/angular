/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarness} from '../../component-harness';
import {TestElement, TestKey} from '../../test-element';
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
  readonly clickTest = this.locatorFor('.click-test');
  readonly clickTestResult = this.locatorFor('.click-test-result');
  // Allow null for element
  readonly nullItem = this.locatorForOptional('wrong locator');
  // Allow null for component harness
  readonly nullComponentHarness = this.locatorForOptional(WrongComponentHarness);
  readonly errorItem = this.locatorFor('wrong locator');

  readonly globalEl = this.documentRootLocatorFactory().locatorFor('.sibling');
  readonly errorGlobalEl = this.documentRootLocatorFactory().locatorFor('wrong locator');
  readonly nullGlobalEl = this.documentRootLocatorFactory().locatorForOptional('wrong locator');

  readonly optionalUsername = this.locatorForOptional('#username');
  readonly optionalSubComponent = this.locatorForOptional(SubComponentHarness);
  readonly errorSubComponent = this.locatorFor(WrongComponentHarness);

  readonly fourItemLists = this.locatorForAll(SubComponentHarness.with({itemCount: 4}));
  readonly toolsLists = this.locatorForAll(SubComponentHarness.with({title: 'List of test tools'}));
  readonly fourItemToolsLists =
      this.locatorForAll(SubComponentHarness.with({title: 'List of test tools', itemCount: 4}));
  readonly testLists = this.locatorForAll(SubComponentHarness.with({title: /test/}));
  readonly requiredFourIteamToolsLists =
      this.locatorFor(SubComponentHarness.with({title: 'List of test tools', itemCount: 4}));
  readonly lastList = this.locatorFor(SubComponentHarness.with({selector: ':last-child'}));
  readonly specaialKey = this.locatorFor('.special-key');

  readonly requiredAncestorRestrictedSubcomponent =
      this.locatorFor(SubComponentHarness.with({ancestor: '.other'}));
  readonly optionalAncestorRestrictedSubcomponent =
      this.locatorForOptional(SubComponentHarness.with({ancestor: '.other'}));
  readonly allAncestorRestrictedSubcomponent =
      this.locatorForAll(SubComponentHarness.with({ancestor: '.other'}));
  readonly requiredAncestorRestrictedMissingSubcomponent =
      this.locatorFor(SubComponentHarness.with({ancestor: '.not-found'}));
  readonly optionalAncestorRestrictedMissingSubcomponent =
      this.locatorForOptional(SubComponentHarness.with({ancestor: '.not-found'}));
  readonly allAncestorRestrictedMissingSubcomponent =
      this.locatorForAll(SubComponentHarness.with({ancestor: '.not-found'}));
  readonly multipleAncestorSelectorsSubcomponent =
      this.locatorForAll(SubComponentHarness.with({ancestor: '.other, .subcomponents'}));
  readonly directAncestorSelectorSubcomponent =
      this.locatorForAll(SubComponentHarness.with({ancestor: '.other >'}));


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

  async sendEnter(): Promise<void> {
    return (await this.input()).sendKeys(TestKey.ENTER);
  }

  async sendAltJ(): Promise<void> {
    return (await this.input()).sendKeys({alt: true}, 'j');
  }
}
