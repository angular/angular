import {
  ComponentHarness,
  ComponentHarnessConstructor,
  HarnessLoader,
  TestElement
} from '@angular/cdk/testing';
import {expectAsyncError} from '@angular/cdk/testing/private';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {async, ComponentFixture, fakeAsync, TestBed} from '@angular/core/testing';
import {FakeOverlayHarness} from './harnesses/fake-overlay-harness';
import {MainComponentHarness} from './harnesses/main-component-harness';
import {SubComponentHarness, SubComponentSpecialHarness} from './harnesses/sub-component-harness';
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

    beforeEach(() => {
      loader = TestbedHarnessEnvironment.loader(fixture);
    });

    it('should create HarnessLoader from fixture', () => {
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
        expect(e.message).toBe(
            'Failed to find element matching one of the following queries:' +
            '\n(HarnessLoader for element matching selector: "error")');
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
        expect(e.message).toBe(
            'Failed to find element matching one of the following queries:' +
            '\n(SubComponentHarness with host element matching selector: "test-sub")');
      }
    });

    it('should get all matching components for all harnesses', async () => {
      const harnesses = await loader.getAllHarnesses(SubComponentHarness);
      expect(harnesses.length).toBe(4);
    });

    it('should be able to load harness through document root loader', async () => {
      const documentRootHarnesses =
          await TestbedHarnessEnvironment.documentRootLoader(fixture).getAllHarnesses(
              FakeOverlayHarness);
      const fixtureHarnesses = await loader.getAllHarnesses(FakeOverlayHarness);
      expect(fixtureHarnesses.length).toBe(0);
      expect(documentRootHarnesses.length).toBe(1);
      expect(await documentRootHarnesses[0].getDescription()).toBe('This is a fake overlay.');
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
            'Failed to find element matching one of the following queries:' +
            '\n(TestElement for element matching selector: "wrong locator")');
      }
    });

    it('should locate an optional element based on CSS selector', async () => {
      const present = await harness.optionalUsername();
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
            'Failed to find element matching one of the following queries:' +
            '\n(WrongComponentHarness with host element matching selector: "wrong-selector")');
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
      const items3 = await alllists[2].getItems();
      const items4 = await alllists[3].getItems();
      expect(alllists.length).toBe(4);
      expect(items1.length).toBe(3);
      expect(await items1[0].text()).toBe('Protractor');
      expect(await items1[1].text()).toBe('TestBed');
      expect(await items1[2].text()).toBe('Other');
      expect(items2.length).toBe(4);
      expect(await items2[0].text()).toBe('Unit Test');
      expect(await items2[1].text()).toBe('Integration Test');
      expect(await items2[2].text()).toBe('Performance Test');
      expect(await items2[3].text()).toBe('Mutation Test');
      expect(items3.length).toBe(0);
      expect(items4.length).toBe(0);
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

    it('should send enter key', async () => {
      const specialKey = await harness.specaialKey();
      await harness.sendEnter();
      expect(await specialKey.text()).toBe('enter');
    });

    it('should send alt+j key', async () => {
      const specialKey = await harness.specaialKey();
      await harness.sendAltJ();
      expect(await specialKey.text()).toBe('alt-j');
    });

    it('should load required harness with ancestor selector restriction', async () => {
      const subcomp = await harness.requiredAncestorRestrictedSubcomponent();
      expect(await (await subcomp.title()).text()).toBe('List of other 1');
    });

    it('should throw when failing to find required harness with ancestor selector restriction',
        async () => {
          try {
            await harness.requiredAncestorRestrictedMissingSubcomponent();
            fail('Expected to throw');
          } catch (e) {
            expect(e.message).toBe(
                'Failed to find element matching one of the following queries:' +
                '\n(SubComponentHarness with host element matching selector: "test-sub"' +
                ' satisfying the constraints: has ancestor matching selector ".not-found")');
          }
        });

    it('should load optional harness with ancestor selector restriction', async () => {
      const [subcomp1, subcomp2] = await Promise.all([
        harness.optionalAncestorRestrictedSubcomponent(),
        harness.optionalAncestorRestrictedMissingSubcomponent()
      ]);
      expect(subcomp1).not.toBeNull();
      expect(subcomp2).toBeNull();
      expect(await (await subcomp1!.title()).text()).toBe('List of other 1');
    });

    it('should load all harnesses with ancestor selector restriction', async () => {
      const [subcomps1, subcomps2] = await Promise.all([
        harness.allAncestorRestrictedSubcomponent(),
        harness.allAncestorRestrictedMissingSubcomponent()
      ]);
      expect(subcomps1.length).toBe(2);
      expect(subcomps2.length).toBe(0);
      const [title1, title2] =
          await Promise.all(subcomps1.map(async comp => (await comp.title()).text()));
      expect(title1).toBe('List of other 1');
      expect(title2).toBe('List of other 2');
    });

    it('should load all harnesses with multiple ancestor selector restriction', async () => {
      const subcomps = await harness.multipleAncestorSelectorsSubcomponent();
      expect(subcomps.length).toBe(4);
    });

    it('should load all harnesses with direct ancestor selector restriction', async () => {
      const subcomps = await harness.directAncestorSelectorSubcomponent();
      expect(subcomps.length).toBe(2);
    });

    it('should be able to wait for tasks outside of Angular within native async/await',
        async () => {
      expect(await harness.getTaskStateResult()).toBe('result');
    });

    it('should be able to wait for tasks outside of Angular within async test zone',
        async (() => {
      harness.getTaskStateResult().then(res => expect(res).toBe('result'));
    }));

    it('should be able to wait for tasks outside of Angular within fakeAsync test zone',
        fakeAsync(async () => {
      expect(await harness.getTaskStateResult()).toBe('result');
    }));
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
      expect(await input.getProperty('value')).toBe('Yi');

      await input.clear();
      expect(await input.getProperty('value')).toBe('');
    });

    it('should be able to click', async () => {
      const counter = await harness.counter();
      expect(await counter.text()).toBe('0');
      await harness.increaseCounter(3);
      expect(await counter.text()).toBe('3');
    });

    it('should be able to click at a specific position within an element', async () => {
      const clickTest = await harness.clickTest();
      const clickTestResult = await harness.clickTestResult();
      await clickTest.click(50, 50);
      expect(await clickTestResult.text()).toBe('50-50');
    });

    it('should be able to send key', async () => {
      const input = await harness.input();
      const value = await harness.value();
      await input.sendKeys('Yi');

      expect(await input.getProperty('value')).toBe('Yi');
      expect(await value.text()).toBe('Input: Yi');
    });

    it('focuses the element before sending key', async () => {
      const input = await harness.input();
      await input.sendKeys('Yi');
      expect(await input.getAttribute('id')).toBe(document.activeElement!.id);
    });

    it('should be able to retrieve dimensions', async () => {
      const dimensions = await (await harness.title()).getDimensions();
      expect(dimensions).toEqual(jasmine.objectContaining({height: 100, width: 200}));
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
      expect(await memo.getProperty('value')).toBe(memoStr);
    });

    it('should be able to getCssValue', async () => {
      const title = await harness.title();
      expect(await title.getCssValue('height')).toBe('100px');
    });

    it('should focus and blur element', async () => {
      const button = await harness.button();
      expect(activeElementText()).not.toBe(await button.text());
      await button.focus();
      expect(activeElementText()).toBe(await button.text());
      await button.blur();
      expect(activeElementText()).not.toBe(await button.text());
    });

    it('should be able to get the value of a property', async () => {
      const input = await harness.input();
      await input.sendKeys('Hello');
      expect(await input.getProperty('value')).toBe('Hello');
    });

    it('should check if selector matches', async () => {
      const button = await harness.button();
      expect(await button.matchesSelector('button:not(.fake-class)')).toBe(true);
      expect(await button.matchesSelector('button:disabled')).toBe(false);
    });

    it('should get TestElements and ComponentHarnesses', async () => {
      const results = await harness.subcomponentHarnessesAndElements();
      expect(results.length).toBe(5);

      // The counter should appear in the DOM before the test-sub elements.
      await checkIsElement(results[0], '#counter');

      // Followed by the SubComponentHarness instances in the correct order.
      await checkIsHarness(results[1], SubComponentHarness, async subHarness =>
          expect(await subHarness.titleText()).toBe('List of test tools'));
      await checkIsHarness(results[2], SubComponentHarness, async subHarness =>
          expect(await subHarness.titleText()).toBe('List of test methods'));
      await checkIsHarness(results[3], SubComponentHarness, async subHarness =>
          expect(await subHarness.titleText()).toBe('List of other 1'));
      await checkIsHarness(results[4], SubComponentHarness, async subHarness =>
          expect(await subHarness.titleText()).toBe('List of other 2'));
    });

    it('should get TestElements and ComponentHarnesses with redundant queries', async () => {
      const results = await harness.subcomponentHarnessAndElementsRedundant();
      expect(results.length).toBe(8);

      // Each subcomponent should have a TestElement result and a SubComponentHarness result.
      // For the first two elements, the harness should come first, as it matches the first query
      // to locatorForAll, the HarnessPredicate.
      await checkIsHarness(results[0], SubComponentHarness, async subHarness =>
          expect(await subHarness.titleText()).toBe('List of test tools'));
      await checkIsElement(results[1], '.subcomponents test-sub:nth-child(1)');
      await checkIsHarness(results[2], SubComponentHarness, async subHarness =>
          expect(await subHarness.titleText()).toBe('List of test methods'));
      await checkIsElement(results[3], '.subcomponents test-sub:nth-child(2)');

      // For the last two elements, the harness should come second, as they do not match the first
      // query, therefore the second query, the TestElement selector is the first to match.
      await checkIsElement(results[4], '.other test-sub:nth-child(1)');
      await checkIsHarness(results[5], SubComponentHarness, async subHarness =>
          expect(await subHarness.titleText()).toBe('List of other 1'));
      await checkIsElement(results[6], '.other test-sub:nth-child(2)');
      await checkIsHarness(results[7], SubComponentHarness, async subHarness =>
          expect(await subHarness.titleText()).toBe('List of other 2'));
    });

    it('should get harnesses of different types matching same element', async () => {
      const results = await harness.subcomponentAndSpecialHarnesses();
      expect(results.length).toBe(5);

      // The first element should have a SubComponentHarness and a SubComponentSpecialHarness.
      await checkIsHarness(results[0], SubComponentHarness, async subHarness =>
          expect(await subHarness.titleText()).toBe('List of test tools'));
      await checkIsHarness(results[1], SubComponentSpecialHarness, async subHarness =>
          expect(await subHarness.titleText()).toBe('List of test tools'));

      // The rest only have a SubComponentHarness.
      await checkIsHarness(results[2], SubComponentHarness, async subHarness =>
          expect(await subHarness.titleText()).toBe('List of test methods'));
      await checkIsHarness(results[3], SubComponentHarness, async subHarness =>
          expect(await subHarness.titleText()).toBe('List of other 1'));
      await checkIsHarness(results[4], SubComponentHarness, async subHarness =>
          expect(await subHarness.titleText()).toBe('List of other 2'));
    });

    it('should throw when multiple queries fail to match', async () => {
      await expectAsyncError(() => harness.missingElementsAndHarnesses(),
          'Error: Failed to find element matching one of the following queries:' +
          '\n(TestElement for element matching selector: ".not-found"),' +
          '\n(SubComponentHarness with host element matching selector: "test-sub" satisfying' +
          ' the constraints: title = /not found/)');
    });
  });

  describe('HarnessPredicate', () => {
    let harness: MainComponentHarness;

    beforeEach(async () => {
      harness =
          await TestbedHarnessEnvironment.harnessForFixture(fixture, MainComponentHarness);
    });

    it('should find subcomponents with specific item count', async () => {
      const fourItemLists = await harness.fourItemLists();
      expect(fourItemLists.length).toBe(1);
      expect(await (await fourItemLists[0].title()).text()).toBe('List of test methods');
    });

    it('should find subcomponents with specific title', async () => {
      const toolsLists = await harness.toolsLists();
      expect(toolsLists.length).toBe(1);
      expect(await (await toolsLists[0].title()).text()).toBe('List of test tools');
    });

    it('should find no subcomponents if predicate does not match', async () => {
      const fourItemToolsLists = await harness.fourItemToolsLists();
      expect(fourItemToolsLists.length).toBe(0);
    });

    it('should find subcomponents with title regex', async () => {
      const testLists = await harness.testLists();
      expect(testLists.length).toBe(2);
      expect(await (await testLists[0].title()).text()).toBe('List of test tools');
      expect(await (await testLists[1].title()).text()).toBe('List of test methods');
    });

    it('should find subcomponents that match selector', async () => {
      const lastList = await harness.lastList();
      expect(await (await lastList.title()).text()).toBe('List of test methods');
    });

    it('should error if predicate does not match but a harness is required', async () => {
      try {
        await harness.requiredFourIteamToolsLists();
        fail('Expected to throw');
      } catch (e) {
        expect(e.message).toBe(
            'Failed to find element matching one of the following queries:' +
            '\n(SubComponentHarness with host element matching selector: "test-sub" satisfying' +
            ' the constraints: title = "List of test tools", item count = 4)');
      }
    });
  });
});

async function checkIsElement(result: ComponentHarness | TestElement, selector?: string) {
  expect(result instanceof ComponentHarness).toBe(false);
  if (selector) {
    expect(await (result as TestElement).matchesSelector(selector)).toBe(true);
  }
}

async function checkIsHarness<T extends ComponentHarness>(
    result: ComponentHarness | TestElement,
    harnessType: ComponentHarnessConstructor<T>,
    finalCheck?: (harness: T) => Promise<unknown>) {
  expect(result.constructor === harnessType).toBe(true);
  if (finalCheck) {
    await finalCheck(result as T);
  }
}
