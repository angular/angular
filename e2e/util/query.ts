import {ElementFinder, by, element, ProtractorBy, browser} from 'protractor';

/**
 * Normalizes either turning a selector into an
 * ElementFinder or returning the finder itself.
 */
export function getElement(el: FinderResult): ElementFinder {
  return typeof el === 'string' ? element(by.css(el)) : el;
}

/**
 * Waits for an element to be rendered.
 */
export function waitForElement(selector: string) {
  return browser.isElementPresent(by.css(selector) as ProtractorBy);
}

export type FinderResult = ElementFinder | string;
