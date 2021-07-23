/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarness} from '../../component-harness';
import {TestElement, TestKey} from '../../test-element';
import {CompoundSelectorHarness} from './compound-selector-harness';
import {QuotedCommaSelectorHarness} from './quoted-comma-selector-harness';
import {SubComponentHarness, SubComponentSpecialHarness} from './sub-component-harness';

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
  readonly clickModifiersResult = this.locatorFor('.click-modifiers-test-result');
  readonly singleSelect = this.locatorFor('#single-select');
  readonly singleSelectValue = this.locatorFor('#single-select-value');
  readonly singleSelectChangeEventCounter = this.locatorFor('#single-select-change-counter');
  readonly multiSelect = this.locatorFor('#multi-select');
  readonly multiSelectValue = this.locatorFor('#multi-select-value');
  readonly multiSelectChangeEventCounter = this.locatorFor('#multi-select-change-counter');
  readonly numberInput = this.locatorFor('#number-input');
  readonly numberInputValue = this.locatorFor('#number-input-value');
  readonly contextmenuTestResult = this.locatorFor('.contextmenu-test-result');
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

  readonly taskStateTestTrigger = this.locatorFor('#task-state-test-trigger');
  readonly taskStateTestResult = this.locatorFor('#task-state-result');

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
  readonly compoundSelectorWithAncestor =
      this.locatorForAll(CompoundSelectorHarness.with({ancestor: '.parent'}));
  readonly quotedContentSelectorWithAncestor =
      this.locatorFor(QuotedCommaSelectorHarness.with({ancestor: '.quoted-comma-parent'}));

  readonly subcomponentHarnessesAndElements =
      this.locatorForAll('#counter', SubComponentHarness);
  readonly subcomponentHarnessAndElementsRedundant =
      this.locatorForAll(
          SubComponentHarness.with({title: /test/}), 'test-sub', SubComponentHarness, 'test-sub');
  readonly subcomponentAndSpecialHarnesses =
      this.locatorForAll(SubComponentHarness, SubComponentSpecialHarness);
  readonly missingElementsAndHarnesses =
      this.locatorFor('.not-found', SubComponentHarness.with({title: /not found/}));
  readonly shadows = this.locatorForAll('.in-the-shadows');
  readonly deepShadow = this.locatorFor(
      'test-shadow-boundary test-sub-shadow-boundary > .in-the-shadows');
  readonly hoverTest = this.locatorFor('#hover-box');
  readonly customEventBasic = this.locatorFor('#custom-event-basic');
  readonly customEventObject = this.locatorFor('#custom-event-object');
  readonly hidden = this.locatorFor('.hidden-element');

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

  async getTaskStateResult(): Promise<string> {
    await (await this.taskStateTestTrigger()).click();
    // Wait for async tasks to complete since the click caused a
    // timeout to be scheduled outside of the NgZone.
    await this.waitForTasksOutsideAngular();
    return (await this.taskStateTestResult()).text();
  }
}
