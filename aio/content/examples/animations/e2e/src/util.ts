import { Locator, ElementFinder, browser, by, element } from 'protractor';

/**
 *
 * locate(finder1, finder2) => element(finder1).element(finder2).element(finderN);
 */
export function locate(locator: Locator, ...locators: Locator[]) {
  return locators.reduce((current: ElementFinder, next: Locator) => {
    return current.element(next);
  }, element(locator)) as ElementFinder;
}

export async function sleepFor(time = 1000) {
  return await browser.sleep(time);
}

export function getLinkById(id: string) {
  return element(by.css(`a[id=${id}]`));
}
