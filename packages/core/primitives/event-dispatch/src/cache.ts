/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Property} from './property';

/**
 * Map from jsaction annotation to a parsed map from event name to action name.
 */
const parseCache: {[key: string]: {[key: string]: string | undefined}} = {};

/**
 * Reads the jsaction parser cache from the given DOM Element.
 */
export function get(element: Element): {[key: string]: string | undefined} | undefined {
  return element[Property.JSACTION];
}

/**
 * Reads the jsaction parser cache for the given DOM element. If no cache is yet present,
 * creates an empty one.
 */
export function getDefaulted(element: Element): {[key: string]: string | undefined} {
  const cache = get(element) ?? {};
  set(element, cache);
  return cache;
}

/**
 * Writes the jsaction parser cache to the given DOM Element.
 */
export function set(element: Element, actionMap: {[key: string]: string | undefined}) {
  element[Property.JSACTION] = actionMap;
}

/**
 * Looks up the parsed action map from the source jsaction attribute value.
 *
 * @param text Unparsed jsaction attribute value.
 * @return Parsed jsaction attribute value, if already present in the cache.
 */
export function getParsed(text: string): {[key: string]: string | undefined} | undefined {
  return parseCache[text];
}

/**
 * Inserts the parse result for the given source jsaction value into the cache.
 *
 * @param text Unparsed jsaction attribute value.
 * @param parsed Attribute value parsed into the action map.
 */
export function setParsed(text: string, parsed: {[key: string]: string | undefined}) {
  parseCache[text] = parsed;
}

/**
 * Clears the jsaction parser cache from the given DOM Element.
 *
 * @param element .
 */
export function clear(element: Element) {
  if (Property.JSACTION in element) {
    delete element[Property.JSACTION];
  }
}
