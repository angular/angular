/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * A css selector contains an element name,
 * css classes and attribute/value pairs with the purpose
 * of selecting subsets out of them.
 */
export declare class CssSelector {
    element: string | null;
    classNames: string[];
    /**
     * The selectors are encoded in pairs where:
     * - even locations are attribute names
     * - odd locations are attribute values.
     *
     * Example:
     * Selector: `[key1=value1][key2]` would parse to:
     * ```
     * ['key1', 'value1', 'key2', '']
     * ```
     */
    attrs: string[];
    notSelectors: CssSelector[];
    static parse(selector: string): CssSelector[];
    /**
     * Unescape `\$` sequences from the CSS attribute selector.
     *
     * This is needed because `$` can have a special meaning in CSS selectors,
     * but we might want to match an attribute that contains `$`.
     * [MDN web link for more
     * info](https://developer.mozilla.org/en-US/docs/Web/CSS/Attribute_selectors).
     * @param attr the attribute to unescape.
     * @returns the unescaped string.
     */
    unescapeAttribute(attr: string): string;
    /**
     * Escape `$` sequences from the CSS attribute selector.
     *
     * This is needed because `$` can have a special meaning in CSS selectors,
     * with this method we are escaping `$` with `\$'.
     * [MDN web link for more
     * info](https://developer.mozilla.org/en-US/docs/Web/CSS/Attribute_selectors).
     * @param attr the attribute to escape.
     * @returns the escaped string.
     */
    escapeAttribute(attr: string): string;
    isElementSelector(): boolean;
    hasElementSelector(): boolean;
    setElement(element?: string | null): void;
    getAttrs(): string[];
    addAttribute(name: string, value?: string): void;
    addClassName(name: string): void;
    toString(): string;
}
/**
 * Reads a list of CssSelectors and allows to calculate which ones
 * are contained in a given CssSelector.
 */
export declare class SelectorMatcher<T = any> {
    static createNotMatcher(notSelectors: CssSelector[]): SelectorMatcher<null>;
    private _elementMap;
    private _elementPartialMap;
    private _classMap;
    private _classPartialMap;
    private _attrValueMap;
    private _attrValuePartialMap;
    private _listContexts;
    addSelectables(cssSelectors: CssSelector[], callbackCtxt?: T): void;
    /**
     * Add an object that can be found later on by calling `match`.
     * @param cssSelector A css selector
     * @param callbackCtxt An opaque object that will be given to the callback of the `match` function
     */
    private _addSelectable;
    private _addTerminal;
    private _addPartial;
    /**
     * Find the objects that have been added via `addSelectable`
     * whose css selector is contained in the given css selector.
     * @param cssSelector A css selector
     * @param matchedCallback This callback will be called with the object handed into `addSelectable`
     * @return boolean true if a match was found
     */
    match(cssSelector: CssSelector, matchedCallback: ((c: CssSelector, a: T) => void) | null): boolean;
    /** @internal */
    _matchTerminal(map: Map<string, SelectorContext<T>[]>, name: string, cssSelector: CssSelector, matchedCallback: ((c: CssSelector, a: any) => void) | null): boolean;
    /** @internal */
    _matchPartial(map: Map<string, SelectorMatcher<T>>, name: string, cssSelector: CssSelector, matchedCallback: ((c: CssSelector, a: any) => void) | null): boolean;
}
export declare class SelectorListContext {
    selectors: CssSelector[];
    alreadyMatched: boolean;
    constructor(selectors: CssSelector[]);
}
export declare class SelectorContext<T = any> {
    selector: CssSelector;
    cbContext: T;
    listContext: SelectorListContext;
    notSelectors: CssSelector[];
    constructor(selector: CssSelector, cbContext: T, listContext: SelectorListContext);
    finalize(cssSelector: CssSelector, callback: ((c: CssSelector, a: T) => void) | null): boolean;
}
export declare class SelectorlessMatcher<T = unknown> {
    private registry;
    constructor(registry: Map<string, T[]>);
    match(name: string): T[];
}
