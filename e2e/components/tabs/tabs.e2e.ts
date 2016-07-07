import ElementArrayFinder = protractor.ElementArrayFinder;
import ElementFinder = protractor.ElementFinder;

describe('tabs', () => {
  describe('basic behavior', () => {
    let tabGroup: ElementFinder;
    let tabLabels: ElementArrayFinder;
    let tabBodies: ElementArrayFinder;

    beforeEach(() => {
      browser.get('/tabs');
      tabGroup = element(by.css('md-tab-group'));
      tabLabels = element.all(by.css('.md-tab-label'));
      tabBodies = element.all(by.css('.md-tab-body'));
    });

    it('should change tabs when the label is clicked', () => {
      tabLabels.get(1).click();
      expect(getActiveStates(tabLabels)).toEqual([false, true, false]);
      expect(getActiveStates(tabBodies)).toEqual([false, true, false]);

      tabLabels.get(0).click();
      expect(getActiveStates(tabLabels)).toEqual([true, false, false]);
      expect(getActiveStates(tabBodies)).toEqual([true, false, false]);
    });

    it('should change focus with keyboard interaction', () => {
      tabLabels.get(0).click();
      expect(getFocusStates(tabLabels)).toEqual([true, false, false]);

      pressKey(protractor.Key.RIGHT);
      expect(getFocusStates(tabLabels)).toEqual([false, true, false]);

      pressKey(protractor.Key.RIGHT);
      expect(getFocusStates(tabLabels)).toEqual([false, false, true]);

      pressKey(protractor.Key.RIGHT);
      expect(getFocusStates(tabLabels)).toEqual([false, false, true]);

      pressKey(protractor.Key.LEFT);
      expect(getFocusStates(tabLabels)).toEqual([false, true, false]);

      pressKey(protractor.Key.LEFT);
      expect(getFocusStates(tabLabels)).toEqual([true, false, false]);

      pressKey(protractor.Key.LEFT);
      expect(getFocusStates(tabLabels)).toEqual([true, false, false]);
    });
  });
});

/**
 * A helper function to perform the sendKey action
 * @param key
 */
function pressKey(key: string) {
  browser.actions().sendKeys(key).perform();
}

/**
 * Returns an array of true/false that represents the focus states of the provided elements
 * @param elements
 * @returns {webdriver.promise.Promise<Promise<boolean>[]>|webdriver.promise.Promise<T[]>}
 */
function getFocusStates(elements: ElementArrayFinder) {
  return elements.map(element => {
    return element.getText().then(elementText => {
      return browser.driver.switchTo().activeElement().getText().then(activeText => {
        return activeText === elementText;
      });
    });
  });
}

/**
 * Returns an array of true/false that represents the active states for the provided elements
 * @param elements
 * @returns {webdriver.promise.Promise<Promise<boolean>[]>|webdriver.promise.Promise<T[]>}
 */
function getActiveStates(elements: ElementArrayFinder) {
  return getClassStates(elements, 'md-active');
}

/**
 * Returns an array of true/false values that represents whether the provided className is on
 * each element
 * @param elements
 * @param className
 * @returns {webdriver.promise.Promise<Promise<boolean>[]>|webdriver.promise.Promise<T[]>}
 */
function getClassStates(elements: ElementArrayFinder, className: string) {
  return elements.map(element => {
    return element.getAttribute('class').then(classes => {
      return classes.split(/ +/g).indexOf(className) >= 0;
    });
  });
}
