/**
 * A css selector contains an element name,
 * css classes and attribute/value pairs with the purpose
 * of selecting subsets out of them.
 */
export declare class CssSelector {
    element: string;
    classNames: string[];
    attrs: string[];
    notSelectors: CssSelector[];
    static parse(selector: string): CssSelector[];
    isElementSelector(): boolean;
    setElement(element?: string): void;
    /** Gets a template string for an element that matches the selector. */
    getMatchingElementTemplate(): string;
    addAttribute(name: string, value?: string): void;
    addClassName(name: string): void;
    toString(): string;
}
/**
 * Reads a list of CssSelectors and allows to calculate which ones
 * are contained in a given CssSelector.
 */
export declare class SelectorMatcher {
    static createNotMatcher(notSelectors: CssSelector[]): SelectorMatcher;
    private _elementMap;
    private _elementPartialMap;
    private _classMap;
    private _classPartialMap;
    private _attrValueMap;
    private _attrValuePartialMap;
    private _listContexts;
    addSelectables(cssSelectors: CssSelector[], callbackCtxt?: any): void;
    /**
     * Add an object that can be found later on by calling `match`.
     * @param cssSelector A css selector
     * @param callbackCtxt An opaque object that will be given to the callback of the `match` function
     */
    private _addSelectable(cssSelector, callbackCtxt, listContext);
    private _addTerminal(map, name, selectable);
    private _addPartial(map, name);
    /**
     * Find the objects that have been added via `addSelectable`
     * whose css selector is contained in the given css selector.
     * @param cssSelector A css selector
     * @param matchedCallback This callback will be called with the object handed into `addSelectable`
     * @return boolean true if a match was found
    */
    match(cssSelector: CssSelector, matchedCallback: (c: CssSelector, a: any) => void): boolean;
}
export declare class SelectorListContext {
    selectors: CssSelector[];
    alreadyMatched: boolean;
    constructor(selectors: CssSelector[]);
}
export declare class SelectorContext {
    selector: CssSelector;
    cbContext: any;
    listContext: SelectorListContext;
    notSelectors: CssSelector[];
    constructor(selector: CssSelector, cbContext: any, listContext: SelectorListContext);
    finalize(cssSelector: CssSelector, callback: (c: CssSelector, a: any) => void): boolean;
}
