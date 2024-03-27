/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Property} from './property';

/**
 * Map from jsaction annotation to a parsed map from event name to action name.
 */
const parseCache: {[key: string]: {[key: string]: string}} = {};

/**
 * Reads the jsaction parser cache from the given DOM Element.
 *
 * @param element .
 * @return Map from event to qualified name of the jsaction bound to it.
 */
export function get(element: Element): {[key: string]: string} {
  // @ts-ignore
  return element[Property.JSACTION];
}

/**
 * Writes the jsaction parser cache to the given DOM Element.
 *
 * @param element .
 * @param actionMap Map from event to qualified name of the jsaction bound to
 *     it.
 */
export function set(element: Element, actionMap: {[key: string]: string}) {
  // @ts-ignore
  element[Property.JSACTION] = actionMap;
}

/**
 * Looks up the parsed action map from the source jsaction attribute value.
 *
 * @param text Unparsed jsaction attribute value.
 * @return Parsed jsaction attribute value, if already present in the cache.
 */
export function getParsed(text: string): {[key: string]: string}|undefined {
  return parseCache[text];
}

/**
 * Inserts the parse result for the given source jsaction value into the cache.
 *
 * @param text Unparsed jsaction attribute value.
 * @param parsed Attribute value parsed into the action map.
 */
export function setParsed(text: string, parsed: {[key: string]: string}) {
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

/**
 * Reads the cached jsaction namespace from the given DOM
 * Element. Undefined means there is no cached value; null is a cached
 * jsnamespace attribute that's absent.
 *
 * @param element .
 * @return .
 */
export function getNamespace(element: Element): string|null|undefined {
  // @ts-ignore
  return element[Property.JSNAMESPACE];
}

/**
 * Writes the cached jsaction namespace to the given DOM Element. Null
 * represents a jsnamespace attribute that's absent.
 *
 * @param element .
 * @param jsnamespace .
 */
export function setNamespace(element: Element, jsnamespace: string|null) {
  // @ts-ignore
  element[Property.JSNAMESPACE] = jsnamespace;
}

/**
 * Clears the cached jsaction namespace from the given DOM Element.
 *
 * @param element .
 */
export function clearNamespace(element: Element) {
  if (Property.JSNAMESPACE in element) {
    delete element[Property.JSNAMESPACE];
  }
}
