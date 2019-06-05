import {browser, by, element} from 'protractor';

import {getElementFinder, load} from '../protractor';
import {MainComponentHarness} from './harnesses/main-component-harness';

describe('Protractor Helper Test', () => {
  let harness: MainComponentHarness;

  beforeEach(async () => {
    await browser.get('/component-harness');
    harness = await load(MainComponentHarness, 'test-main');
  });

  describe('Locator', () => {
    it('should be able to locate a element based on CSS selector', async () => {
      const title = await harness.title();
      expect(await title.text()).toBe('Main Component');
    });

    it('should be able to locate all elements based on CSS selector',
      async () => {
        const labels = await harness.allLabels();
        expect(labels.length).toBe(2);
        expect(await labels[0].text()).toBe('Count:');
        expect(await labels[1].text()).toBe('AsyncCounter:');
      });

    it('should be able to locate the sub harnesses', async () => {
      const items = await harness.getTestTools();
      expect(items.length).toBe(3);
      expect(await items[0].text()).toBe('Protractor');
      expect(await items[1].text()).toBe('TestBed');
      expect(await items[2].text()).toBe('Other');
    });

    it('should be able to locate all sub harnesses', async () => {
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
  });

  describe('Test element', () => {
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
      expect(await input.getAttribute('id'))
        .toBe(await browser.driver.switchTo().activeElement().getAttribute(
          'id'));
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
  });

  describe('Async operation', () => {
    it('should wait for async opeartion to complete', async () => {
      const asyncCounter = await harness.asyncCounter();
      expect(await asyncCounter.text()).toBe('5');
      await harness.increaseCounter(3);
      expect(await asyncCounter.text()).toBe('8');
    });
  });

  describe('Allow null', () => {
    it('should allow element to be null when setting allowNull', async () => {
      expect(await harness.nullItem()).toBe(null);
    });

    it('should allow main harness to be null when setting allowNull',
      async () => {
        const nullMainHarness = await load(
          MainComponentHarness, 'harness not present', {allowNull: true});
        expect(nullMainHarness).toBe(null);
      });

    it('should allow sub-harness to be null when setting allowNull',
      async () => {
        expect(await harness.nullComponentHarness()).toBe(null);
      });
  });

  describe('with the global option', () => {
    it('should find an element outside the root of the harness', async () => {
      const globalEl = await harness.globalEl();
      expect(await globalEl.text()).toBe('I am a sibling!');
    });

    it('should return null for a selector that does not exist', async () => {
      expect(await harness.nullGlobalEl()).toBeNull();
    });

    it('should throw an error for a selctor that does not exist ' +
      'with allowNull = false',
      async () => {
        try {
          await harness.errorGlobalEl();
          fail('Should throw error');
        } catch (err) {
          expect(err.message)
            .toBe(
              'Cannot find element based on the CSS selector: wrong locator');
        }
      });
  });

  describe('Throw error', () => {
    it('should show the correct error', async () => {
      try {
        await harness.errorItem();
        fail('Should throw error');
      } catch (err) {
        expect(err.message)
          .toBe(
            'Cannot find element based on the CSS selector: wrong locator');
      }
    });
  });

  describe('getElementFinder', () => {
    it('should return the element finder', async () => {
      const mainElement = await element(by.css('test-main'));
      const elementFromHarness = getElementFinder(harness.host());
      expect(await elementFromHarness.getId())
        .toBe(await mainElement.getId());
    });
  });
});
