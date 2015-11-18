/**
 * This file is a port of shadowCSS from webcomponents.js to TypeScript.
 *
 * Please make sure to keep to edits in sync with the source file.
 *
 * Source:
 * https://github.com/webcomponents/webcomponentsjs/blob/4efecd7e0e/src/ShadowCSS/ShadowCSS.js
 *
 * The original file level comment is reproduced below
 */
export declare class ShadowCss {
    strictStyling: boolean;
    constructor();
    shimCssText(cssText: string, selector: string, hostSelector?: string): string;
    private _insertDirectives(cssText);
    private _insertPolyfillDirectivesInCssText(cssText);
    private _insertPolyfillRulesInCssText(cssText);
    private _scopeCssText(cssText, scopeSelector, hostSelector);
    private _extractUnscopedRulesFromCssText(cssText);
    private _convertColonHost(cssText);
    private _convertColonHostContext(cssText);
    private _convertColonRule(cssText, regExp, partReplacer);
    private _colonHostContextPartReplacer(host, part, suffix);
    private _colonHostPartReplacer(host, part, suffix);
    private _convertShadowDOMSelectors(cssText);
    private _scopeSelectors(cssText, scopeSelector, hostSelector);
    private _scopeSelector(selector, scopeSelector, hostSelector, strict);
    private _selectorNeedsScoping(selector, scopeSelector);
    private _makeScopeMatcher(scopeSelector);
    private _applySelectorScope(selector, scopeSelector, hostSelector);
    private _applySimpleSelectorScope(selector, scopeSelector, hostSelector);
    private _insertPolyfillHostInCssText(selector);
}
export declare class CssRule {
    selector: string;
    content: string;
    constructor(selector: string, content: string);
}
export declare function processRules(input: string, ruleCallback: Function): string;
