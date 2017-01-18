import {browser} from 'protractor';
import {getElement, FinderResult} from './query';

/**
 * Presses a single key or a sequence of keys.
 */
export function pressKeys(...keys: string[]): void {
  let actions = browser.actions();
  actions.sendKeys.call(actions, keys).perform();
}

/**
 * Clicks an element at a specific point. Useful if there's another element
 * that covers part of the target and can catch the click.
 */
export function clickElementAtPoint(element: FinderResult, coords: Point): void {
  let webElement = getElement(element).getWebElement();
  browser.actions().mouseMove(webElement, coords).click().perform();
}

export interface Point { x: number; y: number; }
