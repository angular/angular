import {ComponentFixture, TestBed} from '@angular/core/testing';
import {HarnessLoader} from '../component-harness';
import {TestbedHarnessEnvironment} from '../testbed/index';
import {MainComponentHarness} from './harnesses/main-component-harness';
import {SubComponentHarness} from './harnesses/sub-component-harness';
import {TestComponentsModule} from './test-components-module';
import {TestMainComponent} from './test-main-component';

function activeElementText() {
  return document.activeElement && (document.activeElement as HTMLElement).innerText || '';
}

describe('TestbedHarnessEnvironment', () => {
  let fixture: ComponentFixture<{}>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({imports: [TestComponentsModule]}).compileComponents();
    fixture = TestBed.createComponent(TestMainComponent);
  });

  describe('HarnessLoader', () => {
    let loader: HarnessLoader;

    beforeEach(async () => {
      loader = TestbedHarnessEnvironment.loader(fixture);
    });

    it('should create HarnessLoader from fixture', async () => {
      expect(loader).not.toBeNull();
    });

    it('should create ComponentHarness for fixture', async () => {
      const harness =
        await TestbedHarnessEnvironment.harnessForFixture(fixture, MainComponentHarness);
      expect(harness).not.toBeNull();
    });

    it('should find required HarnessLoader for child element', async () => {
      const subcomponentsLoader = await loader.getChildLoader('.subcomponents');
      expect(subcomponentsLoader).not.toBeNull();
    });

    it('should error after failing to find required HarnessLoader for child element', async () => {
      try {
        await loader.getChildLoader('error');
        fail('Expected to throw');
      } catch (e) {
        expect(e.message)
          .toBe('Expected to find element matching selector: "error", but none was found');
      }
    });

    it('should find all HarnessLoaders for child elements', async () => {
      const loaders = await loader.getAllChildLoaders('.subcomponents,.counters');
      expect(loaders.length).toBe(2);
    });

    it('should get first matching component for required harness', async () => {
      const harness = await loader.getHarness(SubComponentHarness);
      expect(harness).not.toBeNull();
      expect(await (await harness.title()).text()).toBe('List of test tools');
    });

    it('should throw if no matching component found for required harness', async () => {
      const countersLoader = await loader.getChildLoader('.counters');
      try {
        await countersLoader.getHarness(SubComponentHarness);
        fail('Expected to throw');
      } catch (e) {
        expect(e.message)
          .toBe('Expected to find element matching selector: "test-sub", but none was found');
      }
    });

    it('should get all matching components for all harnesses', async () => {
      const harnesses = await loader.getAllHarnesses(SubComponentHarness);
      expect(harnesses.length).toBe(2);
    });
  });

  describe('ComponentHarness', () => {
    let harness: MainComponentHarness;

    beforeEach(async () => {
      harness =
        await TestbedHarnessEnvironment.harnessForFixture(fixture, MainComponentHarness);
    });

    it('should locate a required element based on CSS selector', async () => {
      const title = await harness.title();
      expect(await title.text()).toBe('Main Component');
    });

    it('should throw when failing to locate a required element based on CSS selector', async () => {
      try {
        await harness.errorItem();
        fail('Expected to throw');
      } catch (e) {
        expect(e.message).toBe(
          'Expected to find element matching selector: "wrong locator", but none was found');
      }
    });

    it('should locate an optional element based on CSS selector', async () => {
      const present = await harness.optionalDiv();
      const missing = await harness.nullItem();
      expect(present).not.toBeNull();
      expect(await present!.text()).toBe('Hello Yi from Angular 2!');
      expect(missing).toBeNull();
    });

    it('should locate all elements based on CSS selector', async () => {
      const labels = await harness.allLabels();
      expect(labels.length).toBe(2);
      expect(await labels[0].text()).toBe('Count:');
      expect(await labels[1].text()).toBe('AsyncCounter:');
    });

    it('should locate required sub harnesses', async () => {
      const items = await harness.getTestTools();
      expect(items.length).toBe(3);
      expect(await items[0].text()).toBe('Protractor');
      expect(await items[1].text()).toBe('TestBed');
      expect(await items[2].text()).toBe('Other');
    });

    it('should throw when failing to locate required sub harnesses', async () => {
      try {
        await harness.errorSubComponent();
        fail('Expected to throw');
      } catch (e) {
        expect(e.message).toBe(
          'Expected to find element matching selector: "wrong-selector", but none was found');
      }
    });

    it('should locate optional sub harnesses', async () => {
      const present = await harness.optionalSubComponent();
      const missing = await harness.nullComponentHarness();
      expect(present).not.toBeNull();
      expect(await (await present!.title()).text()).toBe('List of test tools');
      expect(missing).toBeNull();
    });

    it('should locate all sub harnesses', async () => {
      const alllists = await harness.allLists();
      const items1 = await alllists[0].getItems();
      const items2 = await alllists[1].getItems();
      expect(alllists.length).toBe(2);
      expect(items1.length).toBe(3);
      expect(await items1[0].text()).toBe('Protractor');
      expect(await items1[1].text()).toBe('TestBed');
      expect(await items1[2].text()).toBe('Other');
      expect(items2.length).toBe(3);
      expect(await items2[0].text()).toBe('Unit Test');
      expect(await items2[1].text()).toBe('Integration Test');
      expect(await items2[2].text()).toBe('Performance Test');
    });

    it('should wait for async operation to complete', async () => {
      const asyncCounter = await harness.asyncCounter();
      expect(await asyncCounter.text()).toBe('5');
      await harness.increaseCounter(3);
      expect(await asyncCounter.text()).toBe('8');
    });

    it('can get elements outside of host', async () => {
      const subcomponents = await harness.allLists();
      expect(subcomponents[0]).not.toBeNull();
      const globalEl = await subcomponents[0]!.globalElement();
      expect(globalEl).not.toBeNull();
      expect(await globalEl.text()).toBe('Hello Yi from Angular 2!');
    });
  });

  describe('TestElement', () => {
    let harness: MainComponentHarness;

    beforeEach(async () => {
      harness =
          await TestbedHarnessEnvironment.harnessForFixture(fixture, MainComponentHarness);
    });

    it('should be able to clear', async () => {
      const input = await harness.input();
      await input.sendKeys('Yi');
      expect(await input.getAttribute('value')).toBe('Yi');

      await input.clear();
      expect(await input.getAttribute('value')).toBe('');
    });

    it('should be able to click', async () => {
      const counter = await harness.counter();
      expect(await counter.text()).toBe('0');
      await harness.increaseCounter(3);
      expect(await counter.text()).toBe('3');
    });

    it('should be able to send key', async () => {
      const input = await harness.input();
      const value = await harness.value();
      await input.sendKeys('Yi');

      expect(await input.getAttribute('value')).toBe('Yi');
      expect(await value.text()).toBe('Input: Yi');
    });

    it('focuses the element before sending key', async () => {
      const input = await harness.input();
      await input.sendKeys('Yi');
      expect(await input.getAttribute('id')).toBe(document.activeElement!.id);
    });

    it('should be able to hover', async () => {
      const host = await harness.host();
      let classAttr = await host.getAttribute('class');
      expect(classAttr).not.toContain('hovering');
      await host.hover();
      classAttr = await host.getAttribute('class');
      expect(classAttr).toContain('hovering');
    });

    it('should be able to getAttribute', async () => {
      const memoStr = `
        This is an example that shows how to use component harness
        You should use getAttribute('value') to retrieve the text in textarea
      `;
      const memo = await harness.memo();
      await memo.sendKeys(memoStr);
      expect(await memo.getAttribute('value')).toBe(memoStr);
    });

    it('should be able to getCssValue', async () => {
      const title = await harness.title();
      expect(await title.getCssValue('height')).toBe('50px');
    });

    it('should focus and blur element', async () => {
      let button = await harness.button();
      expect(activeElementText()).not.toBe(await button.text());
      await button.focus();
      expect(activeElementText()).toBe(await button.text());
      await button.blur();
      expect(activeElementText()).not.toBe(await button.text());
    });
  });
});
