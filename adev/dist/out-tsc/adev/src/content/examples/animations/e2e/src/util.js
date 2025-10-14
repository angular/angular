import {browser, by, element} from 'protractor';
/**
 *
 * locate(finder1, finder2) => element(finder1).element(finder2).element(finderN);
 */
export function locate(locator, ...locators) {
  return locators.reduce((current, next) => current.element(next), element(locator));
}
export async function sleepFor(time = 1000) {
  return await browser.sleep(time);
}
export function getLinkById(id) {
  return element(by.css(`a[id=${id}]`));
}
//# sourceMappingURL=util.js.map
