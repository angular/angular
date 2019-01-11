import {browser} from 'protractor';
import {getElement, FinderResult} from './query';

/**
 * Presses a single key or a sequence of keys.
 */
export async function pressKeys(...keys: string[]) {
  const actions = browser.actions();
  await actions.sendKeys.call(actions, keys).perform();
}

/**
 * Clicks an element at a specific point. Useful if there's another element
 * that covers part of the target and can catch the click.
 */
export async function clickElementAtPoint(element: FinderResult, coords: Point) {
  const webElement = await getElement(element).getWebElement();
  await browser.actions().mouseMove(webElement, coords).click().perform();
}

export interface Point { x: number; y: number; }
