import {
  browser,
  by,
  element,
  ElementArrayFinder,
  Key,
  ExpectedConditions
} from 'protractor';
import {pressKeys} from '../util/index';

describe('tabs', () => {
  describe('basic behavior', () => {
    let tabLabels: ElementArrayFinder;
    let tabBodies: ElementArrayFinder;

    beforeEach(async () => {
      await browser.get('/tabs');
      tabLabels = element.all(by.css('.mat-tab-label'));
      tabBodies = element.all(by.css('mat-tab-body'));
    });

    it('should change tabs when the label is clicked', async () => {
      await tabLabels.get(1).click();
      expect(await getLabelActiveStates(tabLabels)).toEqual([false, true, false]);
      expect(await getBodyActiveStates(tabBodies)).toEqual([false, true, false]);

      await browser.wait(ExpectedConditions.not(
        ExpectedConditions.presenceOf(element(by.css('div.mat-ripple-element')))));

      await tabLabels.get(0).click();
      expect(await getLabelActiveStates(tabLabels)).toEqual([true, false, false]);
      expect(await getBodyActiveStates(tabBodies)).toEqual([true, false, false]);

      await browser.wait(ExpectedConditions.not(
        ExpectedConditions.presenceOf(element(by.css('div.mat-ripple-element')))));
    });

    it('should change focus with keyboard interaction', async () => {
      const right = Key.RIGHT;
      const left = Key.LEFT;

      await tabLabels.get(0).click();
      expect(await getFocusStates(tabLabels)).toEqual([true, false, false]);

      await pressKeys(right);
      expect(await getFocusStates(tabLabels)).toEqual([false, true, false]);

      await pressKeys(right);
      expect(await getFocusStates(tabLabels)).toEqual([false, false, true]);

      await pressKeys(left);
      expect(await getFocusStates(tabLabels)).toEqual([false, true, false]);

      await pressKeys(left);
      expect(await getFocusStates(tabLabels)).toEqual([true, false, false]);
    });
  });
});

/**
 * Returns an array of true/false that represents the focus states of the provided elements.
 */
async function getFocusStates(elements: ElementArrayFinder) {
  return elements.map(async el => {
    const elementText = await el!.getText();
    const activeText = await browser.driver.switchTo().activeElement().getText();

    return activeText === elementText;
  });
}

/** Returns an array of true/false that represents the active states for the provided elements. */
function getLabelActiveStates(elements: ElementArrayFinder) {
  return getClassStates(elements, 'mat-tab-label-active');
}

/** Returns an array of true/false that represents the active states for the provided elements */
function getBodyActiveStates(elements: ElementArrayFinder) {
  return getClassStates(elements, 'mat-tab-body-active');
}

/**
 * Returns an array of true/false values that represents whether the provided className is on
 * each element.
 */
async function getClassStates(elements: ElementArrayFinder, className: string) {
  return elements.map(async el => {
    const classes = await el!.getAttribute('class');
    return classes.split(/ +/g).indexOf(className) > -1;
  });
}
