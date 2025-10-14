/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * Reads the jsaction parser cache from the given DOM Element.
 */
export declare function get(element: Element): {
    [key: string]: string | undefined;
} | undefined;
/**
 * Reads the jsaction parser cache for the given DOM element. If no cache is yet present,
 * creates an empty one.
 */
export declare function getDefaulted(element: Element): {
    [key: string]: string | undefined;
};
/**
 * Writes the jsaction parser cache to the given DOM Element.
 */
export declare function set(element: Element, actionMap: {
    [key: string]: string | undefined;
}): void;
/**
 * Looks up the parsed action map from the source jsaction attribute value.
 *
 * @param text Unparsed jsaction attribute value.
 * @return Parsed jsaction attribute value, if already present in the cache.
 */
export declare function getParsed(text: string): {
    [key: string]: string | undefined;
} | undefined;
/**
 * Inserts the parse result for the given source jsaction value into the cache.
 *
 * @param text Unparsed jsaction attribute value.
 * @param parsed Attribute value parsed into the action map.
 */
export declare function setParsed(text: string, parsed: {
    [key: string]: string | undefined;
}): void;
/**
 * Clears the jsaction parser cache from the given DOM Element.
 *
 * @param element .
 */
export declare function clear(element: Element): void;
