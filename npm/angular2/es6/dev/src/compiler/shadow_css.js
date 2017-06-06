import { ListWrapper } from 'angular2/src/facade/collection';
import { StringWrapper, RegExpWrapper, RegExpMatcherWrapper, isPresent, isBlank } from 'angular2/src/facade/lang';
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
/*
  This is a limited shim for ShadowDOM css styling.
  https://dvcs.w3.org/hg/webcomponents/raw-file/tip/spec/shadow/index.html#styles

  The intention here is to support only the styling features which can be
  relatively simply implemented. The goal is to allow users to avoid the
  most obvious pitfalls and do so without compromising performance significantly.
  For ShadowDOM styling that's not covered here, a set of best practices
  can be provided that should allow users to accomplish more complex styling.

  The following is a list of specific ShadowDOM styling features and a brief
  discussion of the approach used to shim.

  Shimmed features:

  * :host, :host-context: ShadowDOM allows styling of the shadowRoot's host
  element using the :host rule. To shim this feature, the :host styles are
  reformatted and prefixed with a given scope name and promoted to a
  document level stylesheet.
  For example, given a scope name of .foo, a rule like this:

    :host {
        background: red;
      }
    }

  becomes:

    .foo {
      background: red;
    }

  * encapsultion: Styles defined within ShadowDOM, apply only to
  dom inside the ShadowDOM. Polymer uses one of two techniques to implement
  this feature.

  By default, rules are prefixed with the host element tag name
  as a descendant selector. This ensures styling does not leak out of the 'top'
  of the element's ShadowDOM. For example,

  div {
      font-weight: bold;
    }

  becomes:

  x-foo div {
      font-weight: bold;
    }

  becomes:


  Alternatively, if WebComponents.ShadowCSS.strictStyling is set to true then
  selectors are scoped by adding an attribute selector suffix to each
  simple selector that contains the host element tag name. Each element
  in the element's ShadowDOM template is also given the scope attribute.
  Thus, these rules match only elements that have the scope attribute.
  For example, given a scope name of x-foo, a rule like this:

    div {
      font-weight: bold;
    }

  becomes:

    div[x-foo] {
      font-weight: bold;
    }

  Note that elements that are dynamically added to a scope must have the scope
  selector added to them manually.

  * upper/lower bound encapsulation: Styles which are defined outside a
  shadowRoot should not cross the ShadowDOM boundary and should not apply
  inside a shadowRoot.

  This styling behavior is not emulated. Some possible ways to do this that
  were rejected due to complexity and/or performance concerns include: (1) reset
  every possible property for every possible selector for a given scope name;
  (2) re-implement css in javascript.

  As an alternative, users should make sure to use selectors
  specific to the scope in which they are working.

  * ::distributed: This behavior is not emulated. It's often not necessary
  to style the contents of a specific insertion point and instead, descendants
  of the host element can be styled selectively. Users can also create an
  extra node around an insertion point and style that node's contents
  via descendent selectors. For example, with a shadowRoot like this:

    <style>
      ::content(div) {
        background: red;
      }
    </style>
    <content></content>

  could become:

    <style>
      / *@polyfill .content-container div * /
      ::content(div) {
        background: red;
      }
    </style>
    <div class="content-container">
      <content></content>
    </div>

  Note the use of @polyfill in the comment above a ShadowDOM specific style
  declaration. This is a directive to the styling shim to use the selector
  in comments in lieu of the next selector when running under polyfill.
*/
export class ShadowCss {
    constructor() {
        this.strictStyling = true;
    }
    /*
    * Shim some cssText with the given selector. Returns cssText that can
    * be included in the document via WebComponents.ShadowCSS.addCssToDocument(css).
    *
    * When strictStyling is true:
    * - selector is the attribute added to all elements inside the host,
    * - hostSelector is the attribute added to the host itself.
    */
    shimCssText(cssText, selector, hostSelector = '') {
        cssText = stripComments(cssText);
        cssText = this._insertDirectives(cssText);
        return this._scopeCssText(cssText, selector, hostSelector);
    }
    _insertDirectives(cssText) {
        cssText = this._insertPolyfillDirectivesInCssText(cssText);
        return this._insertPolyfillRulesInCssText(cssText);
    }
    /*
     * Process styles to convert native ShadowDOM rules that will trip
     * up the css parser; we rely on decorating the stylesheet with inert rules.
     *
     * For example, we convert this rule:
     *
     * polyfill-next-selector { content: ':host menu-item'; }
     * ::content menu-item {
     *
     * to this:
     *
     * scopeName menu-item {
     *
    **/
    _insertPolyfillDirectivesInCssText(cssText) {
        // Difference with webcomponents.js: does not handle comments
        return StringWrapper.replaceAllMapped(cssText, _cssContentNextSelectorRe, function (m) { return m[1] + '{'; });
    }
    /*
     * Process styles to add rules which will only apply under the polyfill
     *
     * For example, we convert this rule:
     *
     * polyfill-rule {
     *   content: ':host menu-item';
     * ...
     * }
     *
     * to this:
     *
     * scopeName menu-item {...}
     *
    **/
    _insertPolyfillRulesInCssText(cssText) {
        // Difference with webcomponents.js: does not handle comments
        return StringWrapper.replaceAllMapped(cssText, _cssContentRuleRe, function (m) {
            var rule = m[0];
            rule = StringWrapper.replace(rule, m[1], '');
            rule = StringWrapper.replace(rule, m[2], '');
            return m[3] + rule;
        });
    }
    /* Ensure styles are scoped. Pseudo-scoping takes a rule like:
     *
     *  .foo {... }
     *
     *  and converts this to
     *
     *  scopeName .foo { ... }
    */
    _scopeCssText(cssText, scopeSelector, hostSelector) {
        var unscoped = this._extractUnscopedRulesFromCssText(cssText);
        cssText = this._insertPolyfillHostInCssText(cssText);
        cssText = this._convertColonHost(cssText);
        cssText = this._convertColonHostContext(cssText);
        cssText = this._convertShadowDOMSelectors(cssText);
        if (isPresent(scopeSelector)) {
            cssText = this._scopeSelectors(cssText, scopeSelector, hostSelector);
        }
        cssText = cssText + '\n' + unscoped;
        return cssText.trim();
    }
    /*
     * Process styles to add rules which will only apply under the polyfill
     * and do not process via CSSOM. (CSSOM is destructive to rules on rare
     * occasions, e.g. -webkit-calc on Safari.)
     * For example, we convert this rule:
     *
     * @polyfill-unscoped-rule {
     *   content: 'menu-item';
     * ... }
     *
     * to this:
     *
     * menu-item {...}
     *
    **/
    _extractUnscopedRulesFromCssText(cssText) {
        // Difference with webcomponents.js: does not handle comments
        var r = '', m;
        var matcher = RegExpWrapper.matcher(_cssContentUnscopedRuleRe, cssText);
        while (isPresent(m = RegExpMatcherWrapper.next(matcher))) {
            var rule = m[0];
            rule = StringWrapper.replace(rule, m[2], '');
            rule = StringWrapper.replace(rule, m[1], m[3]);
            r += rule + '\n\n';
        }
        return r;
    }
    /*
     * convert a rule like :host(.foo) > .bar { }
     *
     * to
     *
     * scopeName.foo > .bar
    */
    _convertColonHost(cssText) {
        return this._convertColonRule(cssText, _cssColonHostRe, this._colonHostPartReplacer);
    }
    /*
     * convert a rule like :host-context(.foo) > .bar { }
     *
     * to
     *
     * scopeName.foo > .bar, .foo scopeName > .bar { }
     *
     * and
     *
     * :host-context(.foo:host) .bar { ... }
     *
     * to
     *
     * scopeName.foo .bar { ... }
    */
    _convertColonHostContext(cssText) {
        return this._convertColonRule(cssText, _cssColonHostContextRe, this._colonHostContextPartReplacer);
    }
    _convertColonRule(cssText, regExp, partReplacer) {
        // p1 = :host, p2 = contents of (), p3 rest of rule
        return StringWrapper.replaceAllMapped(cssText, regExp, function (m) {
            if (isPresent(m[2])) {
                var parts = m[2].split(','), r = [];
                for (var i = 0; i < parts.length; i++) {
                    var p = parts[i];
                    if (isBlank(p))
                        break;
                    p = p.trim();
                    r.push(partReplacer(_polyfillHostNoCombinator, p, m[3]));
                }
                return r.join(',');
            }
            else {
                return _polyfillHostNoCombinator + m[3];
            }
        });
    }
    _colonHostContextPartReplacer(host, part, suffix) {
        if (StringWrapper.contains(part, _polyfillHost)) {
            return this._colonHostPartReplacer(host, part, suffix);
        }
        else {
            return host + part + suffix + ', ' + part + ' ' + host + suffix;
        }
    }
    _colonHostPartReplacer(host, part, suffix) {
        return host + StringWrapper.replace(part, _polyfillHost, '') + suffix;
    }
    /*
     * Convert combinators like ::shadow and pseudo-elements like ::content
     * by replacing with space.
    */
    _convertShadowDOMSelectors(cssText) {
        for (var i = 0; i < _shadowDOMSelectorsRe.length; i++) {
            cssText = StringWrapper.replaceAll(cssText, _shadowDOMSelectorsRe[i], ' ');
        }
        return cssText;
    }
    // change a selector like 'div' to 'name div'
    _scopeSelectors(cssText, scopeSelector, hostSelector) {
        return processRules(cssText, (rule) => {
            var selector = rule.selector;
            var content = rule.content;
            if (rule.selector[0] != '@' || rule.selector.startsWith('@page')) {
                selector =
                    this._scopeSelector(rule.selector, scopeSelector, hostSelector, this.strictStyling);
            }
            else if (rule.selector.startsWith('@media')) {
                content = this._scopeSelectors(rule.content, scopeSelector, hostSelector);
            }
            return new CssRule(selector, content);
        });
    }
    _scopeSelector(selector, scopeSelector, hostSelector, strict) {
        var r = [], parts = selector.split(',');
        for (var i = 0; i < parts.length; i++) {
            var p = parts[i].trim();
            var deepParts = StringWrapper.split(p, _shadowDeepSelectors);
            var shallowPart = deepParts[0];
            if (this._selectorNeedsScoping(shallowPart, scopeSelector)) {
                deepParts[0] = strict && !StringWrapper.contains(shallowPart, _polyfillHostNoCombinator) ?
                    this._applyStrictSelectorScope(shallowPart, scopeSelector) :
                    this._applySelectorScope(shallowPart, scopeSelector, hostSelector);
            }
            // replace /deep/ with a space for child selectors
            r.push(deepParts.join(' '));
        }
        return r.join(', ');
    }
    _selectorNeedsScoping(selector, scopeSelector) {
        var re = this._makeScopeMatcher(scopeSelector);
        return !isPresent(RegExpWrapper.firstMatch(re, selector));
    }
    _makeScopeMatcher(scopeSelector) {
        var lre = /\[/g;
        var rre = /\]/g;
        scopeSelector = StringWrapper.replaceAll(scopeSelector, lre, '\\[');
        scopeSelector = StringWrapper.replaceAll(scopeSelector, rre, '\\]');
        return RegExpWrapper.create('^(' + scopeSelector + ')' + _selectorReSuffix, 'm');
    }
    _applySelectorScope(selector, scopeSelector, hostSelector) {
        // Difference from webcomponentsjs: scopeSelector could not be an array
        return this._applySimpleSelectorScope(selector, scopeSelector, hostSelector);
    }
    // scope via name and [is=name]
    _applySimpleSelectorScope(selector, scopeSelector, hostSelector) {
        if (isPresent(RegExpWrapper.firstMatch(_polyfillHostRe, selector))) {
            var replaceBy = this.strictStyling ? `[${hostSelector}]` : scopeSelector;
            selector = StringWrapper.replace(selector, _polyfillHostNoCombinator, replaceBy);
            return StringWrapper.replaceAll(selector, _polyfillHostRe, replaceBy + ' ');
        }
        else {
            return scopeSelector + ' ' + selector;
        }
    }
    // return a selector with [name] suffix on each simple selector
    // e.g. .foo.bar > .zot becomes .foo[name].bar[name] > .zot[name]  /** @internal */
    _applyStrictSelectorScope(selector, scopeSelector) {
        var isRe = /\[is=([^\]]*)\]/g;
        scopeSelector = StringWrapper.replaceAllMapped(scopeSelector, isRe, (m) => m[1]);
        var splits = [' ', '>', '+', '~'], scoped = selector, attrName = '[' + scopeSelector + ']';
        for (var i = 0; i < splits.length; i++) {
            var sep = splits[i];
            var parts = scoped.split(sep);
            scoped = parts.map(p => {
                // remove :host since it should be unnecessary
                var t = StringWrapper.replaceAll(p.trim(), _polyfillHostRe, '');
                if (t.length > 0 && !ListWrapper.contains(splits, t) &&
                    !StringWrapper.contains(t, attrName)) {
                    var re = /([^:]*)(:*)(.*)/g;
                    var m = RegExpWrapper.firstMatch(re, t);
                    if (isPresent(m)) {
                        p = m[1] + attrName + m[2] + m[3];
                    }
                }
                return p;
            })
                .join(sep);
        }
        return scoped;
    }
    _insertPolyfillHostInCssText(selector) {
        selector = StringWrapper.replaceAll(selector, _colonHostContextRe, _polyfillHostContext);
        selector = StringWrapper.replaceAll(selector, _colonHostRe, _polyfillHost);
        return selector;
    }
}
var _cssContentNextSelectorRe = /polyfill-next-selector[^}]*content:[\s]*?['"](.*?)['"][;\s]*}([^{]*?){/gim;
var _cssContentRuleRe = /(polyfill-rule)[^}]*(content:[\s]*['"](.*?)['"])[;\s]*[^}]*}/gim;
var _cssContentUnscopedRuleRe = /(polyfill-unscoped-rule)[^}]*(content:[\s]*['"](.*?)['"])[;\s]*[^}]*}/gim;
var _polyfillHost = '-shadowcsshost';
// note: :host-context pre-processed to -shadowcsshostcontext.
var _polyfillHostContext = '-shadowcsscontext';
var _parenSuffix = ')(?:\\((' +
    '(?:\\([^)(]*\\)|[^)(]*)+?' +
    ')\\))?([^,{]*)';
var _cssColonHostRe = RegExpWrapper.create('(' + _polyfillHost + _parenSuffix, 'im');
var _cssColonHostContextRe = RegExpWrapper.create('(' + _polyfillHostContext + _parenSuffix, 'im');
var _polyfillHostNoCombinator = _polyfillHost + '-no-combinator';
var _shadowDOMSelectorsRe = [
    /::shadow/g,
    /::content/g,
    // Deprecated selectors
    // TODO(vicb): see https://github.com/angular/clang-format/issues/16
    // clang-format off
    /\/shadow-deep\//g,
    /\/shadow\//g,
];
var _shadowDeepSelectors = /(?:>>>)|(?:\/deep\/)/g;
var _selectorReSuffix = '([>\\s~+\[.,{:][\\s\\S]*)?$';
var _polyfillHostRe = RegExpWrapper.create(_polyfillHost, 'im');
var _colonHostRe = /:host/gim;
var _colonHostContextRe = /:host-context/gim;
var _commentRe = /\/\*[\s\S]*?\*\//g;
function stripComments(input) {
    return StringWrapper.replaceAllMapped(input, _commentRe, (_) => '');
}
var _ruleRe = /(\s*)([^;\{\}]+?)(\s*)((?:{%BLOCK%}?\s*;?)|(?:\s*;))/g;
var _curlyRe = /([{}])/g;
const OPEN_CURLY = '{';
const CLOSE_CURLY = '}';
const BLOCK_PLACEHOLDER = '%BLOCK%';
export class CssRule {
    constructor(selector, content) {
        this.selector = selector;
        this.content = content;
    }
}
export function processRules(input, ruleCallback) {
    var inputWithEscapedBlocks = escapeBlocks(input);
    var nextBlockIndex = 0;
    return StringWrapper.replaceAllMapped(inputWithEscapedBlocks.escapedString, _ruleRe, function (m) {
        var selector = m[2];
        var content = '';
        var suffix = m[4];
        var contentPrefix = '';
        if (isPresent(m[4]) && m[4].startsWith('{' + BLOCK_PLACEHOLDER)) {
            content = inputWithEscapedBlocks.blocks[nextBlockIndex++];
            suffix = m[4].substring(BLOCK_PLACEHOLDER.length + 1);
            contentPrefix = '{';
        }
        var rule = ruleCallback(new CssRule(selector, content));
        return `${m[1]}${rule.selector}${m[3]}${contentPrefix}${rule.content}${suffix}`;
    });
}
class StringWithEscapedBlocks {
    constructor(escapedString, blocks) {
        this.escapedString = escapedString;
        this.blocks = blocks;
    }
}
function escapeBlocks(input) {
    var inputParts = StringWrapper.split(input, _curlyRe);
    var resultParts = [];
    var escapedBlocks = [];
    var bracketCount = 0;
    var currentBlockParts = [];
    for (var partIndex = 0; partIndex < inputParts.length; partIndex++) {
        var part = inputParts[partIndex];
        if (part == CLOSE_CURLY) {
            bracketCount--;
        }
        if (bracketCount > 0) {
            currentBlockParts.push(part);
        }
        else {
            if (currentBlockParts.length > 0) {
                escapedBlocks.push(currentBlockParts.join(''));
                resultParts.push(BLOCK_PLACEHOLDER);
                currentBlockParts = [];
            }
            resultParts.push(part);
        }
        if (part == OPEN_CURLY) {
            bracketCount++;
        }
    }
    if (currentBlockParts.length > 0) {
        escapedBlocks.push(currentBlockParts.join(''));
        resultParts.push(BLOCK_PLACEHOLDER);
    }
    return new StringWithEscapedBlocks(resultParts.join(''), escapedBlocks);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hhZG93X2Nzcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtZ3RNN1FoRW4udG1wL2FuZ3VsYXIyL3NyYy9jb21waWxlci9zaGFkb3dfY3NzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sZ0NBQWdDO09BQ25ELEVBQ0wsYUFBYSxFQUViLGFBQWEsRUFDYixvQkFBb0IsRUFDcEIsU0FBUyxFQUNULE9BQU8sRUFDUixNQUFNLDBCQUEwQjtBQUVqQzs7Ozs7Ozs7O0dBU0c7QUFFSDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUFpSEU7QUFFRjtJQUdFO1FBRkEsa0JBQWEsR0FBWSxJQUFJLENBQUM7SUFFZixDQUFDO0lBRWhCOzs7Ozs7O01BT0U7SUFDRixXQUFXLENBQUMsT0FBZSxFQUFFLFFBQWdCLEVBQUUsWUFBWSxHQUFXLEVBQUU7UUFDdEUsT0FBTyxHQUFHLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNqQyxPQUFPLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsWUFBWSxDQUFDLENBQUM7SUFDN0QsQ0FBQztJQUVPLGlCQUFpQixDQUFDLE9BQWU7UUFDdkMsT0FBTyxHQUFHLElBQUksQ0FBQyxrQ0FBa0MsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMzRCxNQUFNLENBQUMsSUFBSSxDQUFDLDZCQUE2QixDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3JELENBQUM7SUFFRDs7Ozs7Ozs7Ozs7OztPQWFHO0lBQ0ssa0NBQWtDLENBQUMsT0FBZTtRQUN4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LENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDakMsYUFBYSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUMvQyxXQUFXLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFDdEMsQ0FBQztJQUNELE1BQU0sQ0FBQyxJQUFJLHVCQUF1QixDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsYUFBYSxDQUFDLENBQUM7QUFDMUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7TGlzdFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge1xuICBTdHJpbmdXcmFwcGVyLFxuICBSZWdFeHAsXG4gIFJlZ0V4cFdyYXBwZXIsXG4gIFJlZ0V4cE1hdGNoZXJXcmFwcGVyLFxuICBpc1ByZXNlbnQsXG4gIGlzQmxhbmtcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcblxuLyoqXG4gKiBUaGlzIGZpbGUgaXMgYSBwb3J0IG9mIHNoYWRvd0NTUyBmcm9tIHdlYmNvbXBvbmVudHMuanMgdG8gVHlwZVNjcmlwdC5cbiAqXG4gKiBQbGVhc2UgbWFrZSBzdXJlIHRvIGtlZXAgdG8gZWRpdHMgaW4gc3luYyB3aXRoIHRoZSBzb3VyY2UgZmlsZS5cbiAqXG4gKiBTb3VyY2U6XG4gKiBodHRwczovL2dpdGh1Yi5jb20vd2ViY29tcG9uZW50cy93ZWJjb21wb25lbnRzanMvYmxvYi80ZWZlY2Q3ZTBlL3NyYy9TaGFkb3dDU1MvU2hhZG93Q1NTLmpzXG4gKlxuICogVGhlIG9yaWdpbmFsIGZpbGUgbGV2ZWwgY29tbWVudCBpcyByZXByb2R1Y2VkIGJlbG93XG4gKi9cblxuLypcbiAgVGhpcyBpcyBhIGxpbWl0ZWQgc2hpbSBmb3IgU2hhZG93RE9NIGNzcyBzdHlsaW5nLlxuICBodHRwczovL2R2Y3MudzMub3JnL2hnL3dlYmNvbXBvbmVudHMvcmF3LWZpbGUvdGlwL3NwZWMvc2hhZG93L2luZGV4Lmh0bWwjc3R5bGVzXG5cbiAgVGhlIGludGVudGlvbiBoZXJlIGlzIHRvIHN1cHBvcnQgb25seSB0aGUgc3R5bGluZyBmZWF0dXJlcyB3aGljaCBjYW4gYmVcbiAgcmVsYXRpdmVseSBzaW1wbHkgaW1wbGVtZW50ZWQuIFRoZSBnb2FsIGlzIHRvIGFsbG93IHVzZXJzIHRvIGF2b2lkIHRoZVxuICBtb3N0IG9idmlvdXMgcGl0ZmFsbHMgYW5kIGRvIHNvIHdpdGhvdXQgY29tcHJvbWlzaW5nIHBlcmZvcm1hbmNlIHNpZ25pZmljYW50bHkuXG4gIEZvciBTaGFkb3dET00gc3R5bGluZyB0aGF0J3Mgbm90IGNvdmVyZWQgaGVyZSwgYSBzZXQgb2YgYmVzdCBwcmFjdGljZXNcbiAgY2FuIGJlIHByb3ZpZGVkIHRoYXQgc2hvdWxkIGFsbG93IHVzZXJzIHRvIGFjY29tcGxpc2ggbW9yZSBjb21wbGV4IHN0eWxpbmcuXG5cbiAgVGhlIGZvbGxvd2luZyBpcyBhIGxpc3Qgb2Ygc3BlY2lmaWMgU2hhZG93RE9NIHN0eWxpbmcgZmVhdHVyZXMgYW5kIGEgYnJpZWZcbiAgZGlzY3Vzc2lvbiBvZiB0aGUgYXBwcm9hY2ggdXNlZCB0byBzaGltLlxuXG4gIFNoaW1tZWQgZmVhdHVyZXM6XG5cbiAgKiA6aG9zdCwgOmhvc3QtY29udGV4dDogU2hhZG93RE9NIGFsbG93cyBzdHlsaW5nIG9mIHRoZSBzaGFkb3dSb290J3MgaG9zdFxuICBlbGVtZW50IHVzaW5nIHRoZSA6aG9zdCBydWxlLiBUbyBzaGltIHRoaXMgZmVhdHVyZSwgdGhlIDpob3N0IHN0eWxlcyBhcmVcbiAgcmVmb3JtYXR0ZWQgYW5kIHByZWZpeGVkIHdpdGggYSBnaXZlbiBzY29wZSBuYW1lIGFuZCBwcm9tb3RlZCB0byBhXG4gIGRvY3VtZW50IGxldmVsIHN0eWxlc2hlZXQuXG4gIEZvciBleGFtcGxlLCBnaXZlbiBhIHNjb3BlIG5hbWUgb2YgLmZvbywgYSBydWxlIGxpa2UgdGhpczpcblxuICAgIDpob3N0IHtcbiAgICAgICAgYmFja2dyb3VuZDogcmVkO1xuICAgICAgfVxuICAgIH1cblxuICBiZWNvbWVzOlxuXG4gICAgLmZvbyB7XG4gICAgICBiYWNrZ3JvdW5kOiByZWQ7XG4gICAgfVxuXG4gICogZW5jYXBzdWx0aW9uOiBTdHlsZXMgZGVmaW5lZCB3aXRoaW4gU2hhZG93RE9NLCBhcHBseSBvbmx5IHRvXG4gIGRvbSBpbnNpZGUgdGhlIFNoYWRvd0RPTS4gUG9seW1lciB1c2VzIG9uZSBvZiB0d28gdGVjaG5pcXVlcyB0byBpbXBsZW1lbnRcbiAgdGhpcyBmZWF0dXJlLlxuXG4gIEJ5IGRlZmF1bHQsIHJ1bGVzIGFyZSBwcmVmaXhlZCB3aXRoIHRoZSBob3N0IGVsZW1lbnQgdGFnIG5hbWVcbiAgYXMgYSBkZXNjZW5kYW50IHNlbGVjdG9yLiBUaGlzIGVuc3VyZXMgc3R5bGluZyBkb2VzIG5vdCBsZWFrIG91dCBvZiB0aGUgJ3RvcCdcbiAgb2YgdGhlIGVsZW1lbnQncyBTaGFkb3dET00uIEZvciBleGFtcGxlLFxuXG4gIGRpdiB7XG4gICAgICBmb250LXdlaWdodDogYm9sZDtcbiAgICB9XG5cbiAgYmVjb21lczpcblxuICB4LWZvbyBkaXYge1xuICAgICAgZm9udC13ZWlnaHQ6IGJvbGQ7XG4gICAgfVxuXG4gIGJlY29tZXM6XG5cblxuICBBbHRlcm5hdGl2ZWx5LCBpZiBXZWJDb21wb25lbnRzLlNoYWRvd0NTUy5zdHJpY3RTdHlsaW5nIGlzIHNldCB0byB0cnVlIHRoZW5cbiAgc2VsZWN0b3JzIGFyZSBzY29wZWQgYnkgYWRkaW5nIGFuIGF0dHJpYnV0ZSBzZWxlY3RvciBzdWZmaXggdG8gZWFjaFxuICBzaW1wbGUgc2VsZWN0b3IgdGhhdCBjb250YWlucyB0aGUgaG9zdCBlbGVtZW50IHRhZyBuYW1lLiBFYWNoIGVsZW1lbnRcbiAgaW4gdGhlIGVsZW1lbnQncyBTaGFkb3dET00gdGVtcGxhdGUgaXMgYWxzbyBnaXZlbiB0aGUgc2NvcGUgYXR0cmlidXRlLlxuICBUaHVzLCB0aGVzZSBydWxlcyBtYXRjaCBvbmx5IGVsZW1lbnRzIHRoYXQgaGF2ZSB0aGUgc2NvcGUgYXR0cmlidXRlLlxuICBGb3IgZXhhbXBsZSwgZ2l2ZW4gYSBzY29wZSBuYW1lIG9mIHgtZm9vLCBhIHJ1bGUgbGlrZSB0aGlzOlxuXG4gICAgZGl2IHtcbiAgICAgIGZvbnQtd2VpZ2h0OiBib2xkO1xuICAgIH1cblxuICBiZWNvbWVzOlxuXG4gICAgZGl2W3gtZm9vXSB7XG4gICAgICBmb250LXdlaWdodDogYm9sZDtcbiAgICB9XG5cbiAgTm90ZSB0aGF0IGVsZW1lbnRzIHRoYXQgYXJlIGR5bmFtaWNhbGx5IGFkZGVkIHRvIGEgc2NvcGUgbXVzdCBoYXZlIHRoZSBzY29wZVxuICBzZWxlY3RvciBhZGRlZCB0byB0aGVtIG1hbnVhbGx5LlxuXG4gICogdXBwZXIvbG93ZXIgYm91bmQgZW5jYXBzdWxhdGlvbjogU3R5bGVzIHdoaWNoIGFyZSBkZWZpbmVkIG91dHNpZGUgYVxuICBzaGFkb3dSb290IHNob3VsZCBub3QgY3Jvc3MgdGhlIFNoYWRvd0RPTSBib3VuZGFyeSBhbmQgc2hvdWxkIG5vdCBhcHBseVxuICBpbnNpZGUgYSBzaGFkb3dSb290LlxuXG4gIFRoaXMgc3R5bGluZyBiZWhhdmlvciBpcyBub3QgZW11bGF0ZWQuIFNvbWUgcG9zc2libGUgd2F5cyB0byBkbyB0aGlzIHRoYXRcbiAgd2VyZSByZWplY3RlZCBkdWUgdG8gY29tcGxleGl0eSBhbmQvb3IgcGVyZm9ybWFuY2UgY29uY2VybnMgaW5jbHVkZTogKDEpIHJlc2V0XG4gIGV2ZXJ5IHBvc3NpYmxlIHByb3BlcnR5IGZvciBldmVyeSBwb3NzaWJsZSBzZWxlY3RvciBmb3IgYSBnaXZlbiBzY29wZSBuYW1lO1xuICAoMikgcmUtaW1wbGVtZW50IGNzcyBpbiBqYXZhc2NyaXB0LlxuXG4gIEFzIGFuIGFsdGVybmF0aXZlLCB1c2VycyBzaG91bGQgbWFrZSBzdXJlIHRvIHVzZSBzZWxlY3RvcnNcbiAgc3BlY2lmaWMgdG8gdGhlIHNjb3BlIGluIHdoaWNoIHRoZXkgYXJlIHdvcmtpbmcuXG5cbiAgKiA6OmRpc3RyaWJ1dGVkOiBUaGlzIGJlaGF2aW9yIGlzIG5vdCBlbXVsYXRlZC4gSXQncyBvZnRlbiBub3QgbmVjZXNzYXJ5XG4gIHRvIHN0eWxlIHRoZSBjb250ZW50cyBvZiBhIHNwZWNpZmljIGluc2VydGlvbiBwb2ludCBhbmQgaW5zdGVhZCwgZGVzY2VuZGFudHNcbiAgb2YgdGhlIGhvc3QgZWxlbWVudCBjYW4gYmUgc3R5bGVkIHNlbGVjdGl2ZWx5LiBVc2VycyBjYW4gYWxzbyBjcmVhdGUgYW5cbiAgZXh0cmEgbm9kZSBhcm91bmQgYW4gaW5zZXJ0aW9uIHBvaW50IGFuZCBzdHlsZSB0aGF0IG5vZGUncyBjb250ZW50c1xuICB2aWEgZGVzY2VuZGVudCBzZWxlY3RvcnMuIEZvciBleGFtcGxlLCB3aXRoIGEgc2hhZG93Um9vdCBsaWtlIHRoaXM6XG5cbiAgICA8c3R5bGU+XG4gICAgICA6OmNvbnRlbnQoZGl2KSB7XG4gICAgICAgIGJhY2tncm91bmQ6IHJlZDtcbiAgICAgIH1cbiAgICA8L3N0eWxlPlxuICAgIDxjb250ZW50PjwvY29udGVudD5cblxuICBjb3VsZCBiZWNvbWU6XG5cbiAgICA8c3R5bGU+XG4gICAgICAvICpAcG9seWZpbGwgLmNvbnRlbnQtY29udGFpbmVyIGRpdiAqIC9cbiAgICAgIDo6Y29udGVudChkaXYpIHtcbiAgICAgICAgYmFja2dyb3VuZDogcmVkO1xuICAgICAgfVxuICAgIDwvc3R5bGU+XG4gICAgPGRpdiBjbGFzcz1cImNvbnRlbnQtY29udGFpbmVyXCI+XG4gICAgICA8Y29udGVudD48L2NvbnRlbnQ+XG4gICAgPC9kaXY+XG5cbiAgTm90ZSB0aGUgdXNlIG9mIEBwb2x5ZmlsbCBpbiB0aGUgY29tbWVudCBhYm92ZSBhIFNoYWRvd0RPTSBzcGVjaWZpYyBzdHlsZVxuICBkZWNsYXJhdGlvbi4gVGhpcyBpcyBhIGRpcmVjdGl2ZSB0byB0aGUgc3R5bGluZyBzaGltIHRvIHVzZSB0aGUgc2VsZWN0b3JcbiAgaW4gY29tbWVudHMgaW4gbGlldSBvZiB0aGUgbmV4dCBzZWxlY3RvciB3aGVuIHJ1bm5pbmcgdW5kZXIgcG9seWZpbGwuXG4qL1xuXG5leHBvcnQgY2xhc3MgU2hhZG93Q3NzIHtcbiAgc3RyaWN0U3R5bGluZzogYm9vbGVhbiA9IHRydWU7XG5cbiAgY29uc3RydWN0b3IoKSB7fVxuXG4gIC8qXG4gICogU2hpbSBzb21lIGNzc1RleHQgd2l0aCB0aGUgZ2l2ZW4gc2VsZWN0b3IuIFJldHVybnMgY3NzVGV4dCB0aGF0IGNhblxuICAqIGJlIGluY2x1ZGVkIGluIHRoZSBkb2N1bWVudCB2aWEgV2ViQ29tcG9uZW50cy5TaGFkb3dDU1MuYWRkQ3NzVG9Eb2N1bWVudChjc3MpLlxuICAqXG4gICogV2hlbiBzdHJpY3RTdHlsaW5nIGlzIHRydWU6XG4gICogLSBzZWxlY3RvciBpcyB0aGUgYXR0cmlidXRlIGFkZGVkIHRvIGFsbCBlbGVtZW50cyBpbnNpZGUgdGhlIGhvc3QsXG4gICogLSBob3N0U2VsZWN0b3IgaXMgdGhlIGF0dHJpYnV0ZSBhZGRlZCB0byB0aGUgaG9zdCBpdHNlbGYuXG4gICovXG4gIHNoaW1Dc3NUZXh0KGNzc1RleHQ6IHN0cmluZywgc2VsZWN0b3I6IHN0cmluZywgaG9zdFNlbGVjdG9yOiBzdHJpbmcgPSAnJyk6IHN0cmluZyB7XG4gICAgY3NzVGV4dCA9IHN0cmlwQ29tbWVudHMoY3NzVGV4dCk7XG4gICAgY3NzVGV4dCA9IHRoaXMuX2luc2VydERpcmVjdGl2ZXMoY3NzVGV4dCk7XG4gICAgcmV0dXJuIHRoaXMuX3Njb3BlQ3NzVGV4dChjc3NUZXh0LCBzZWxlY3RvciwgaG9zdFNlbGVjdG9yKTtcbiAgfVxuXG4gIHByaXZhdGUgX2luc2VydERpcmVjdGl2ZXMoY3NzVGV4dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBjc3NUZXh0ID0gdGhpcy5faW5zZXJ0UG9seWZpbGxEaXJlY3RpdmVzSW5Dc3NUZXh0KGNzc1RleHQpO1xuICAgIHJldHVybiB0aGlzLl9pbnNlcnRQb2x5ZmlsbFJ1bGVzSW5Dc3NUZXh0KGNzc1RleHQpO1xuICB9XG5cbiAgLypcbiAgICogUHJvY2VzcyBzdHlsZXMgdG8gY29udmVydCBuYXRpdmUgU2hhZG93RE9NIHJ1bGVzIHRoYXQgd2lsbCB0cmlwXG4gICAqIHVwIHRoZSBjc3MgcGFyc2VyOyB3ZSByZWx5IG9uIGRlY29yYXRpbmcgdGhlIHN0eWxlc2hlZXQgd2l0aCBpbmVydCBydWxlcy5cbiAgICpcbiAgICogRm9yIGV4YW1wbGUsIHdlIGNvbnZlcnQgdGhpcyBydWxlOlxuICAgKlxuICAgKiBwb2x5ZmlsbC1uZXh0LXNlbGVjdG9yIHsgY29udGVudDogJzpob3N0IG1lbnUtaXRlbSc7IH1cbiAgICogOjpjb250ZW50IG1lbnUtaXRlbSB7XG4gICAqXG4gICAqIHRvIHRoaXM6XG4gICAqXG4gICAqIHNjb3BlTmFtZSBtZW51LWl0ZW0ge1xuICAgKlxuICAqKi9cbiAgcHJpdmF0ZSBfaW5zZXJ0UG9seWZpbGxEaXJlY3RpdmVzSW5Dc3NUZXh0KGNzc1RleHQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgLy8gRGlmZmVyZW5jZSB3aXRoIHdlYmNvbXBvbmVudHMuanM6IGRvZXMgbm90IGhhbmRsZSBjb21tZW50c1xuICAgIHJldHVybiBTdHJpbmdXcmFwcGVyLnJlcGxhY2VBbGxNYXBwZWQoY3NzVGV4dCwgX2Nzc0NvbnRlbnROZXh0U2VsZWN0b3JSZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKG0pIHsgcmV0dXJuIG1bMV0gKyAneyc7IH0pO1xuICB9XG5cbiAgLypcbiAgICogUHJvY2VzcyBzdHlsZXMgdG8gYWRkIHJ1bGVzIHdoaWNoIHdpbGwgb25seSBhcHBseSB1bmRlciB0aGUgcG9seWZpbGxcbiAgICpcbiAgICogRm9yIGV4YW1wbGUsIHdlIGNvbnZlcnQgdGhpcyBydWxlOlxuICAgKlxuICAgKiBwb2x5ZmlsbC1ydWxlIHtcbiAgICogICBjb250ZW50OiAnOmhvc3QgbWVudS1pdGVtJztcbiAgICogLi4uXG4gICAqIH1cbiAgICpcbiAgICogdG8gdGhpczpcbiAgICpcbiAgICogc2NvcGVOYW1lIG1lbnUtaXRlbSB7Li4ufVxuICAgKlxuICAqKi9cbiAgcHJpdmF0ZSBfaW5zZXJ0UG9seWZpbGxSdWxlc0luQ3NzVGV4dChjc3NUZXh0OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIC8vIERpZmZlcmVuY2Ugd2l0aCB3ZWJjb21wb25lbnRzLmpzOiBkb2VzIG5vdCBoYW5kbGUgY29tbWVudHNcbiAgICByZXR1cm4gU3RyaW5nV3JhcHBlci5yZXBsYWNlQWxsTWFwcGVkKGNzc1RleHQsIF9jc3NDb250ZW50UnVsZVJlLCBmdW5jdGlvbihtKSB7XG4gICAgICB2YXIgcnVsZSA9IG1bMF07XG4gICAgICBydWxlID0gU3RyaW5nV3JhcHBlci5yZXBsYWNlKHJ1bGUsIG1bMV0sICcnKTtcbiAgICAgIHJ1bGUgPSBTdHJpbmdXcmFwcGVyLnJlcGxhY2UocnVsZSwgbVsyXSwgJycpO1xuICAgICAgcmV0dXJuIG1bM10gKyBydWxlO1xuICAgIH0pO1xuICB9XG5cbiAgLyogRW5zdXJlIHN0eWxlcyBhcmUgc2NvcGVkLiBQc2V1ZG8tc2NvcGluZyB0YWtlcyBhIHJ1bGUgbGlrZTpcbiAgICpcbiAgICogIC5mb28gey4uLiB9XG4gICAqXG4gICAqICBhbmQgY29udmVydHMgdGhpcyB0b1xuICAgKlxuICAgKiAgc2NvcGVOYW1lIC5mb28geyAuLi4gfVxuICAqL1xuICBwcml2YXRlIF9zY29wZUNzc1RleHQoY3NzVGV4dDogc3RyaW5nLCBzY29wZVNlbGVjdG9yOiBzdHJpbmcsIGhvc3RTZWxlY3Rvcjogc3RyaW5nKTogc3RyaW5nIHtcbiAgICB2YXIgdW5zY29wZWQgPSB0aGlzLl9leHRyYWN0VW5zY29wZWRSdWxlc0Zyb21Dc3NUZXh0KGNzc1RleHQpO1xuICAgIGNzc1RleHQgPSB0aGlzLl9pbnNlcnRQb2x5ZmlsbEhvc3RJbkNzc1RleHQoY3NzVGV4dCk7XG4gICAgY3NzVGV4dCA9IHRoaXMuX2NvbnZlcnRDb2xvbkhvc3QoY3NzVGV4dCk7XG4gICAgY3NzVGV4dCA9IHRoaXMuX2NvbnZlcnRDb2xvbkhvc3RDb250ZXh0KGNzc1RleHQpO1xuICAgIGNzc1RleHQgPSB0aGlzLl9jb252ZXJ0U2hhZG93RE9NU2VsZWN0b3JzKGNzc1RleHQpO1xuICAgIGlmIChpc1ByZXNlbnQoc2NvcGVTZWxlY3RvcikpIHtcbiAgICAgIGNzc1RleHQgPSB0aGlzLl9zY29wZVNlbGVjdG9ycyhjc3NUZXh0LCBzY29wZVNlbGVjdG9yLCBob3N0U2VsZWN0b3IpO1xuICAgIH1cbiAgICBjc3NUZXh0ID0gY3NzVGV4dCArICdcXG4nICsgdW5zY29wZWQ7XG4gICAgcmV0dXJuIGNzc1RleHQudHJpbSgpO1xuICB9XG5cbiAgLypcbiAgICogUHJvY2VzcyBzdHlsZXMgdG8gYWRkIHJ1bGVzIHdoaWNoIHdpbGwgb25seSBhcHBseSB1bmRlciB0aGUgcG9seWZpbGxcbiAgICogYW5kIGRvIG5vdCBwcm9jZXNzIHZpYSBDU1NPTS4gKENTU09NIGlzIGRlc3RydWN0aXZlIHRvIHJ1bGVzIG9uIHJhcmVcbiAgICogb2NjYXNpb25zLCBlLmcuIC13ZWJraXQtY2FsYyBvbiBTYWZhcmkuKVxuICAgKiBGb3IgZXhhbXBsZSwgd2UgY29udmVydCB0aGlzIHJ1bGU6XG4gICAqXG4gICAqIEBwb2x5ZmlsbC11bnNjb3BlZC1ydWxlIHtcbiAgICogICBjb250ZW50OiAnbWVudS1pdGVtJztcbiAgICogLi4uIH1cbiAgICpcbiAgICogdG8gdGhpczpcbiAgICpcbiAgICogbWVudS1pdGVtIHsuLi59XG4gICAqXG4gICoqL1xuICBwcml2YXRlIF9leHRyYWN0VW5zY29wZWRSdWxlc0Zyb21Dc3NUZXh0KGNzc1RleHQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgLy8gRGlmZmVyZW5jZSB3aXRoIHdlYmNvbXBvbmVudHMuanM6IGRvZXMgbm90IGhhbmRsZSBjb21tZW50c1xuICAgIHZhciByID0gJycsIG07XG4gICAgdmFyIG1hdGNoZXIgPSBSZWdFeHBXcmFwcGVyLm1hdGNoZXIoX2Nzc0NvbnRlbnRVbnNjb3BlZFJ1bGVSZSwgY3NzVGV4dCk7XG4gICAgd2hpbGUgKGlzUHJlc2VudChtID0gUmVnRXhwTWF0Y2hlcldyYXBwZXIubmV4dChtYXRjaGVyKSkpIHtcbiAgICAgIHZhciBydWxlID0gbVswXTtcbiAgICAgIHJ1bGUgPSBTdHJpbmdXcmFwcGVyLnJlcGxhY2UocnVsZSwgbVsyXSwgJycpO1xuICAgICAgcnVsZSA9IFN0cmluZ1dyYXBwZXIucmVwbGFjZShydWxlLCBtWzFdLCBtWzNdKTtcbiAgICAgIHIgKz0gcnVsZSArICdcXG5cXG4nO1xuICAgIH1cbiAgICByZXR1cm4gcjtcbiAgfVxuXG4gIC8qXG4gICAqIGNvbnZlcnQgYSBydWxlIGxpa2UgOmhvc3QoLmZvbykgPiAuYmFyIHsgfVxuICAgKlxuICAgKiB0b1xuICAgKlxuICAgKiBzY29wZU5hbWUuZm9vID4gLmJhclxuICAqL1xuICBwcml2YXRlIF9jb252ZXJ0Q29sb25Ib3N0KGNzc1RleHQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbnZlcnRDb2xvblJ1bGUoY3NzVGV4dCwgX2Nzc0NvbG9uSG9zdFJlLCB0aGlzLl9jb2xvbkhvc3RQYXJ0UmVwbGFjZXIpO1xuICB9XG5cbiAgLypcbiAgICogY29udmVydCBhIHJ1bGUgbGlrZSA6aG9zdC1jb250ZXh0KC5mb28pID4gLmJhciB7IH1cbiAgICpcbiAgICogdG9cbiAgICpcbiAgICogc2NvcGVOYW1lLmZvbyA+IC5iYXIsIC5mb28gc2NvcGVOYW1lID4gLmJhciB7IH1cbiAgICpcbiAgICogYW5kXG4gICAqXG4gICAqIDpob3N0LWNvbnRleHQoLmZvbzpob3N0KSAuYmFyIHsgLi4uIH1cbiAgICpcbiAgICogdG9cbiAgICpcbiAgICogc2NvcGVOYW1lLmZvbyAuYmFyIHsgLi4uIH1cbiAgKi9cbiAgcHJpdmF0ZSBfY29udmVydENvbG9uSG9zdENvbnRleHQoY3NzVGV4dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fY29udmVydENvbG9uUnVsZShjc3NUZXh0LCBfY3NzQ29sb25Ib3N0Q29udGV4dFJlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2NvbG9uSG9zdENvbnRleHRQYXJ0UmVwbGFjZXIpO1xuICB9XG5cbiAgcHJpdmF0ZSBfY29udmVydENvbG9uUnVsZShjc3NUZXh0OiBzdHJpbmcsIHJlZ0V4cDogUmVnRXhwLCBwYXJ0UmVwbGFjZXI6IEZ1bmN0aW9uKTogc3RyaW5nIHtcbiAgICAvLyBwMSA9IDpob3N0LCBwMiA9IGNvbnRlbnRzIG9mICgpLCBwMyByZXN0IG9mIHJ1bGVcbiAgICByZXR1cm4gU3RyaW5nV3JhcHBlci5yZXBsYWNlQWxsTWFwcGVkKGNzc1RleHQsIHJlZ0V4cCwgZnVuY3Rpb24obSkge1xuICAgICAgaWYgKGlzUHJlc2VudChtWzJdKSkge1xuICAgICAgICB2YXIgcGFydHMgPSBtWzJdLnNwbGl0KCcsJyksIHIgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYXJ0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIHZhciBwID0gcGFydHNbaV07XG4gICAgICAgICAgaWYgKGlzQmxhbmsocCkpIGJyZWFrO1xuICAgICAgICAgIHAgPSBwLnRyaW0oKTtcbiAgICAgICAgICByLnB1c2gocGFydFJlcGxhY2VyKF9wb2x5ZmlsbEhvc3ROb0NvbWJpbmF0b3IsIHAsIG1bM10pKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gci5qb2luKCcsJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gX3BvbHlmaWxsSG9zdE5vQ29tYmluYXRvciArIG1bM107XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIF9jb2xvbkhvc3RDb250ZXh0UGFydFJlcGxhY2VyKGhvc3Q6IHN0cmluZywgcGFydDogc3RyaW5nLCBzdWZmaXg6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgaWYgKFN0cmluZ1dyYXBwZXIuY29udGFpbnMocGFydCwgX3BvbHlmaWxsSG9zdCkpIHtcbiAgICAgIHJldHVybiB0aGlzLl9jb2xvbkhvc3RQYXJ0UmVwbGFjZXIoaG9zdCwgcGFydCwgc3VmZml4KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGhvc3QgKyBwYXJ0ICsgc3VmZml4ICsgJywgJyArIHBhcnQgKyAnICcgKyBob3N0ICsgc3VmZml4O1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2NvbG9uSG9zdFBhcnRSZXBsYWNlcihob3N0OiBzdHJpbmcsIHBhcnQ6IHN0cmluZywgc3VmZml4OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBob3N0ICsgU3RyaW5nV3JhcHBlci5yZXBsYWNlKHBhcnQsIF9wb2x5ZmlsbEhvc3QsICcnKSArIHN1ZmZpeDtcbiAgfVxuXG4gIC8qXG4gICAqIENvbnZlcnQgY29tYmluYXRvcnMgbGlrZSA6OnNoYWRvdyBhbmQgcHNldWRvLWVsZW1lbnRzIGxpa2UgOjpjb250ZW50XG4gICAqIGJ5IHJlcGxhY2luZyB3aXRoIHNwYWNlLlxuICAqL1xuICBwcml2YXRlIF9jb252ZXJ0U2hhZG93RE9NU2VsZWN0b3JzKGNzc1RleHQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBfc2hhZG93RE9NU2VsZWN0b3JzUmUubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNzc1RleHQgPSBTdHJpbmdXcmFwcGVyLnJlcGxhY2VBbGwoY3NzVGV4dCwgX3NoYWRvd0RPTVNlbGVjdG9yc1JlW2ldLCAnICcpO1xuICAgIH1cbiAgICByZXR1cm4gY3NzVGV4dDtcbiAgfVxuXG4gIC8vIGNoYW5nZSBhIHNlbGVjdG9yIGxpa2UgJ2RpdicgdG8gJ25hbWUgZGl2J1xuICBwcml2YXRlIF9zY29wZVNlbGVjdG9ycyhjc3NUZXh0OiBzdHJpbmcsIHNjb3BlU2VsZWN0b3I6IHN0cmluZywgaG9zdFNlbGVjdG9yOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBwcm9jZXNzUnVsZXMoY3NzVGV4dCwgKHJ1bGU6IENzc1J1bGUpID0+IHtcbiAgICAgIHZhciBzZWxlY3RvciA9IHJ1bGUuc2VsZWN0b3I7XG4gICAgICB2YXIgY29udGVudCA9IHJ1bGUuY29udGVudDtcbiAgICAgIGlmIChydWxlLnNlbGVjdG9yWzBdICE9ICdAJyB8fCBydWxlLnNlbGVjdG9yLnN0YXJ0c1dpdGgoJ0BwYWdlJykpIHtcbiAgICAgICAgc2VsZWN0b3IgPVxuICAgICAgICAgICAgdGhpcy5fc2NvcGVTZWxlY3RvcihydWxlLnNlbGVjdG9yLCBzY29wZVNlbGVjdG9yLCBob3N0U2VsZWN0b3IsIHRoaXMuc3RyaWN0U3R5bGluZyk7XG4gICAgICB9IGVsc2UgaWYgKHJ1bGUuc2VsZWN0b3Iuc3RhcnRzV2l0aCgnQG1lZGlhJykpIHtcbiAgICAgICAgY29udGVudCA9IHRoaXMuX3Njb3BlU2VsZWN0b3JzKHJ1bGUuY29udGVudCwgc2NvcGVTZWxlY3RvciwgaG9zdFNlbGVjdG9yKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgQ3NzUnVsZShzZWxlY3RvciwgY29udGVudCk7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIF9zY29wZVNlbGVjdG9yKHNlbGVjdG9yOiBzdHJpbmcsIHNjb3BlU2VsZWN0b3I6IHN0cmluZywgaG9zdFNlbGVjdG9yOiBzdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgc3RyaWN0OiBib29sZWFuKTogc3RyaW5nIHtcbiAgICB2YXIgciA9IFtdLCBwYXJ0cyA9IHNlbGVjdG9yLnNwbGl0KCcsJyk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYXJ0cy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHAgPSBwYXJ0c1tpXS50cmltKCk7XG4gICAgICB2YXIgZGVlcFBhcnRzID0gU3RyaW5nV3JhcHBlci5zcGxpdChwLCBfc2hhZG93RGVlcFNlbGVjdG9ycyk7XG4gICAgICB2YXIgc2hhbGxvd1BhcnQgPSBkZWVwUGFydHNbMF07XG4gICAgICBpZiAodGhpcy5fc2VsZWN0b3JOZWVkc1Njb3Bpbmcoc2hhbGxvd1BhcnQsIHNjb3BlU2VsZWN0b3IpKSB7XG4gICAgICAgIGRlZXBQYXJ0c1swXSA9IHN0cmljdCAmJiAhU3RyaW5nV3JhcHBlci5jb250YWlucyhzaGFsbG93UGFydCwgX3BvbHlmaWxsSG9zdE5vQ29tYmluYXRvcikgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fYXBwbHlTdHJpY3RTZWxlY3RvclNjb3BlKHNoYWxsb3dQYXJ0LCBzY29wZVNlbGVjdG9yKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9hcHBseVNlbGVjdG9yU2NvcGUoc2hhbGxvd1BhcnQsIHNjb3BlU2VsZWN0b3IsIGhvc3RTZWxlY3Rvcik7XG4gICAgICB9XG4gICAgICAvLyByZXBsYWNlIC9kZWVwLyB3aXRoIGEgc3BhY2UgZm9yIGNoaWxkIHNlbGVjdG9yc1xuICAgICAgci5wdXNoKGRlZXBQYXJ0cy5qb2luKCcgJykpO1xuICAgIH1cbiAgICByZXR1cm4gci5qb2luKCcsICcpO1xuICB9XG5cbiAgcHJpdmF0ZSBfc2VsZWN0b3JOZWVkc1Njb3Bpbmcoc2VsZWN0b3I6IHN0cmluZywgc2NvcGVTZWxlY3Rvcjogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgdmFyIHJlID0gdGhpcy5fbWFrZVNjb3BlTWF0Y2hlcihzY29wZVNlbGVjdG9yKTtcbiAgICByZXR1cm4gIWlzUHJlc2VudChSZWdFeHBXcmFwcGVyLmZpcnN0TWF0Y2gocmUsIHNlbGVjdG9yKSk7XG4gIH1cblxuICBwcml2YXRlIF9tYWtlU2NvcGVNYXRjaGVyKHNjb3BlU2VsZWN0b3I6IHN0cmluZyk6IFJlZ0V4cCB7XG4gICAgdmFyIGxyZSA9IC9cXFsvZztcbiAgICB2YXIgcnJlID0gL1xcXS9nO1xuICAgIHNjb3BlU2VsZWN0b3IgPSBTdHJpbmdXcmFwcGVyLnJlcGxhY2VBbGwoc2NvcGVTZWxlY3RvciwgbHJlLCAnXFxcXFsnKTtcbiAgICBzY29wZVNlbGVjdG9yID0gU3RyaW5nV3JhcHBlci5yZXBsYWNlQWxsKHNjb3BlU2VsZWN0b3IsIHJyZSwgJ1xcXFxdJyk7XG4gICAgcmV0dXJuIFJlZ0V4cFdyYXBwZXIuY3JlYXRlKCdeKCcgKyBzY29wZVNlbGVjdG9yICsgJyknICsgX3NlbGVjdG9yUmVTdWZmaXgsICdtJyk7XG4gIH1cblxuICBwcml2YXRlIF9hcHBseVNlbGVjdG9yU2NvcGUoc2VsZWN0b3I6IHN0cmluZywgc2NvcGVTZWxlY3Rvcjogc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaG9zdFNlbGVjdG9yOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIC8vIERpZmZlcmVuY2UgZnJvbSB3ZWJjb21wb25lbnRzanM6IHNjb3BlU2VsZWN0b3IgY291bGQgbm90IGJlIGFuIGFycmF5XG4gICAgcmV0dXJuIHRoaXMuX2FwcGx5U2ltcGxlU2VsZWN0b3JTY29wZShzZWxlY3Rvciwgc2NvcGVTZWxlY3RvciwgaG9zdFNlbGVjdG9yKTtcbiAgfVxuXG4gIC8vIHNjb3BlIHZpYSBuYW1lIGFuZCBbaXM9bmFtZV1cbiAgcHJpdmF0ZSBfYXBwbHlTaW1wbGVTZWxlY3RvclNjb3BlKHNlbGVjdG9yOiBzdHJpbmcsIHNjb3BlU2VsZWN0b3I6IHN0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhvc3RTZWxlY3Rvcjogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBpZiAoaXNQcmVzZW50KFJlZ0V4cFdyYXBwZXIuZmlyc3RNYXRjaChfcG9seWZpbGxIb3N0UmUsIHNlbGVjdG9yKSkpIHtcbiAgICAgIHZhciByZXBsYWNlQnkgPSB0aGlzLnN0cmljdFN0eWxpbmcgPyBgWyR7aG9zdFNlbGVjdG9yfV1gIDogc2NvcGVTZWxlY3RvcjtcbiAgICAgIHNlbGVjdG9yID0gU3RyaW5nV3JhcHBlci5yZXBsYWNlKHNlbGVjdG9yLCBfcG9seWZpbGxIb3N0Tm9Db21iaW5hdG9yLCByZXBsYWNlQnkpO1xuICAgICAgcmV0dXJuIFN0cmluZ1dyYXBwZXIucmVwbGFjZUFsbChzZWxlY3RvciwgX3BvbHlmaWxsSG9zdFJlLCByZXBsYWNlQnkgKyAnICcpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gc2NvcGVTZWxlY3RvciArICcgJyArIHNlbGVjdG9yO1xuICAgIH1cbiAgfVxuXG4gIC8vIHJldHVybiBhIHNlbGVjdG9yIHdpdGggW25hbWVdIHN1ZmZpeCBvbiBlYWNoIHNpbXBsZSBzZWxlY3RvclxuICAvLyBlLmcuIC5mb28uYmFyID4gLnpvdCBiZWNvbWVzIC5mb29bbmFtZV0uYmFyW25hbWVdID4gLnpvdFtuYW1lXSAgLyoqIEBpbnRlcm5hbCAqL1xuICBwcml2YXRlIF9hcHBseVN0cmljdFNlbGVjdG9yU2NvcGUoc2VsZWN0b3I6IHN0cmluZywgc2NvcGVTZWxlY3Rvcjogc3RyaW5nKTogc3RyaW5nIHtcbiAgICB2YXIgaXNSZSA9IC9cXFtpcz0oW15cXF1dKilcXF0vZztcbiAgICBzY29wZVNlbGVjdG9yID0gU3RyaW5nV3JhcHBlci5yZXBsYWNlQWxsTWFwcGVkKHNjb3BlU2VsZWN0b3IsIGlzUmUsIChtKSA9PiBtWzFdKTtcbiAgICB2YXIgc3BsaXRzID0gWycgJywgJz4nLCAnKycsICd+J10sIHNjb3BlZCA9IHNlbGVjdG9yLCBhdHRyTmFtZSA9ICdbJyArIHNjb3BlU2VsZWN0b3IgKyAnXSc7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzcGxpdHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBzZXAgPSBzcGxpdHNbaV07XG4gICAgICB2YXIgcGFydHMgPSBzY29wZWQuc3BsaXQoc2VwKTtcbiAgICAgIHNjb3BlZCA9IHBhcnRzLm1hcChwID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAvLyByZW1vdmUgOmhvc3Qgc2luY2UgaXQgc2hvdWxkIGJlIHVubmVjZXNzYXJ5XG4gICAgICAgICAgICAgICAgICAgICAgdmFyIHQgPSBTdHJpbmdXcmFwcGVyLnJlcGxhY2VBbGwocC50cmltKCksIF9wb2x5ZmlsbEhvc3RSZSwgJycpO1xuICAgICAgICAgICAgICAgICAgICAgIGlmICh0Lmxlbmd0aCA+IDAgJiYgIUxpc3RXcmFwcGVyLmNvbnRhaW5zKHNwbGl0cywgdCkgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIVN0cmluZ1dyYXBwZXIuY29udGFpbnModCwgYXR0ck5hbWUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcmUgPSAvKFteOl0qKSg6KikoLiopL2c7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbSA9IFJlZ0V4cFdyYXBwZXIuZmlyc3RNYXRjaChyZSwgdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNQcmVzZW50KG0pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHAgPSBtWzFdICsgYXR0ck5hbWUgKyBtWzJdICsgbVszXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHA7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgLmpvaW4oc2VwKTtcbiAgICB9XG4gICAgcmV0dXJuIHNjb3BlZDtcbiAgfVxuXG4gIHByaXZhdGUgX2luc2VydFBvbHlmaWxsSG9zdEluQ3NzVGV4dChzZWxlY3Rvcjogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBzZWxlY3RvciA9IFN0cmluZ1dyYXBwZXIucmVwbGFjZUFsbChzZWxlY3RvciwgX2NvbG9uSG9zdENvbnRleHRSZSwgX3BvbHlmaWxsSG9zdENvbnRleHQpO1xuICAgIHNlbGVjdG9yID0gU3RyaW5nV3JhcHBlci5yZXBsYWNlQWxsKHNlbGVjdG9yLCBfY29sb25Ib3N0UmUsIF9wb2x5ZmlsbEhvc3QpO1xuICAgIHJldHVybiBzZWxlY3RvcjtcbiAgfVxufVxudmFyIF9jc3NDb250ZW50TmV4dFNlbGVjdG9yUmUgPVxuICAgIC9wb2x5ZmlsbC1uZXh0LXNlbGVjdG9yW159XSpjb250ZW50OltcXHNdKj9bJ1wiXSguKj8pWydcIl1bO1xcc10qfShbXntdKj8pey9naW07XG52YXIgX2Nzc0NvbnRlbnRSdWxlUmUgPSAvKHBvbHlmaWxsLXJ1bGUpW159XSooY29udGVudDpbXFxzXSpbJ1wiXSguKj8pWydcIl0pWztcXHNdKltefV0qfS9naW07XG52YXIgX2Nzc0NvbnRlbnRVbnNjb3BlZFJ1bGVSZSA9XG4gICAgLyhwb2x5ZmlsbC11bnNjb3BlZC1ydWxlKVtefV0qKGNvbnRlbnQ6W1xcc10qWydcIl0oLio/KVsnXCJdKVs7XFxzXSpbXn1dKn0vZ2ltO1xudmFyIF9wb2x5ZmlsbEhvc3QgPSAnLXNoYWRvd2Nzc2hvc3QnO1xuLy8gbm90ZTogOmhvc3QtY29udGV4dCBwcmUtcHJvY2Vzc2VkIHRvIC1zaGFkb3djc3Nob3N0Y29udGV4dC5cbnZhciBfcG9seWZpbGxIb3N0Q29udGV4dCA9ICctc2hhZG93Y3NzY29udGV4dCc7XG52YXIgX3BhcmVuU3VmZml4ID0gJykoPzpcXFxcKCgnICtcbiAgICAgICAgICAgICAgICAgICAnKD86XFxcXChbXikoXSpcXFxcKXxbXikoXSopKz8nICtcbiAgICAgICAgICAgICAgICAgICAnKVxcXFwpKT8oW14se10qKSc7XG52YXIgX2Nzc0NvbG9uSG9zdFJlID0gUmVnRXhwV3JhcHBlci5jcmVhdGUoJygnICsgX3BvbHlmaWxsSG9zdCArIF9wYXJlblN1ZmZpeCwgJ2ltJyk7XG52YXIgX2Nzc0NvbG9uSG9zdENvbnRleHRSZSA9IFJlZ0V4cFdyYXBwZXIuY3JlYXRlKCcoJyArIF9wb2x5ZmlsbEhvc3RDb250ZXh0ICsgX3BhcmVuU3VmZml4LCAnaW0nKTtcbnZhciBfcG9seWZpbGxIb3N0Tm9Db21iaW5hdG9yID0gX3BvbHlmaWxsSG9zdCArICctbm8tY29tYmluYXRvcic7XG52YXIgX3NoYWRvd0RPTVNlbGVjdG9yc1JlID0gW1xuICAvOjpzaGFkb3cvZyxcbiAgLzo6Y29udGVudC9nLFxuICAvLyBEZXByZWNhdGVkIHNlbGVjdG9yc1xuICAvLyBUT0RPKHZpY2IpOiBzZWUgaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvY2xhbmctZm9ybWF0L2lzc3Vlcy8xNlxuICAvLyBjbGFuZy1mb3JtYXQgb2ZmXG4gIC9cXC9zaGFkb3ctZGVlcFxcLy9nLCAgLy8gZm9ybWVyIC9kZWVwL1xuICAvXFwvc2hhZG93XFwvL2csICAgICAgIC8vIGZvcm1lciA6OnNoYWRvd1xuICAvLyBjbGFuZi1mb3JtYXQgb25cbl07XG52YXIgX3NoYWRvd0RlZXBTZWxlY3RvcnMgPSAvKD86Pj4+KXwoPzpcXC9kZWVwXFwvKS9nO1xudmFyIF9zZWxlY3RvclJlU3VmZml4ID0gJyhbPlxcXFxzfitcXFsuLHs6XVtcXFxcc1xcXFxTXSopPyQnO1xudmFyIF9wb2x5ZmlsbEhvc3RSZSA9IFJlZ0V4cFdyYXBwZXIuY3JlYXRlKF9wb2x5ZmlsbEhvc3QsICdpbScpO1xudmFyIF9jb2xvbkhvc3RSZSA9IC86aG9zdC9naW07XG52YXIgX2NvbG9uSG9zdENvbnRleHRSZSA9IC86aG9zdC1jb250ZXh0L2dpbTtcblxudmFyIF9jb21tZW50UmUgPSAvXFwvXFwqW1xcc1xcU10qP1xcKlxcLy9nO1xuXG5mdW5jdGlvbiBzdHJpcENvbW1lbnRzKGlucHV0OnN0cmluZyk6c3RyaW5nIHtcbiAgcmV0dXJuIFN0cmluZ1dyYXBwZXIucmVwbGFjZUFsbE1hcHBlZChpbnB1dCwgX2NvbW1lbnRSZSwgKF8pID0+ICcnKTtcbn1cblxudmFyIF9ydWxlUmUgPSAvKFxccyopKFteO1xce1xcfV0rPykoXFxzKikoKD86eyVCTE9DSyV9P1xccyo7Pyl8KD86XFxzKjspKS9nO1xudmFyIF9jdXJseVJlID0gLyhbe31dKS9nO1xuY29uc3QgT1BFTl9DVVJMWSA9ICd7JztcbmNvbnN0IENMT1NFX0NVUkxZID0gJ30nO1xuY29uc3QgQkxPQ0tfUExBQ0VIT0xERVIgPSAnJUJMT0NLJSc7XG5cbmV4cG9ydCBjbGFzcyBDc3NSdWxlIHtcbiAgY29uc3RydWN0b3IocHVibGljIHNlbGVjdG9yOnN0cmluZywgcHVibGljIGNvbnRlbnQ6c3RyaW5nKSB7fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJvY2Vzc1J1bGVzKGlucHV0OnN0cmluZywgcnVsZUNhbGxiYWNrOkZ1bmN0aW9uKTpzdHJpbmcge1xuICB2YXIgaW5wdXRXaXRoRXNjYXBlZEJsb2NrcyA9IGVzY2FwZUJsb2NrcyhpbnB1dCk7XG4gIHZhciBuZXh0QmxvY2tJbmRleCA9IDA7XG4gIHJldHVybiBTdHJpbmdXcmFwcGVyLnJlcGxhY2VBbGxNYXBwZWQoaW5wdXRXaXRoRXNjYXBlZEJsb2Nrcy5lc2NhcGVkU3RyaW5nLCBfcnVsZVJlLCBmdW5jdGlvbihtKSB7XG4gICAgdmFyIHNlbGVjdG9yID0gbVsyXTtcbiAgICB2YXIgY29udGVudCA9ICcnO1xuICAgIHZhciBzdWZmaXggPSBtWzRdO1xuICAgIHZhciBjb250ZW50UHJlZml4ID0gJyc7XG4gICAgaWYgKGlzUHJlc2VudChtWzRdKSAmJiBtWzRdLnN0YXJ0c1dpdGgoJ3snK0JMT0NLX1BMQUNFSE9MREVSKSkge1xuICAgICAgY29udGVudCA9IGlucHV0V2l0aEVzY2FwZWRCbG9ja3MuYmxvY2tzW25leHRCbG9ja0luZGV4KytdO1xuICAgICAgc3VmZml4ID0gbVs0XS5zdWJzdHJpbmcoQkxPQ0tfUExBQ0VIT0xERVIubGVuZ3RoKzEpO1xuICAgICAgY29udGVudFByZWZpeCA9ICd7JztcbiAgICB9XG4gICAgdmFyIHJ1bGUgPSBydWxlQ2FsbGJhY2sobmV3IENzc1J1bGUoc2VsZWN0b3IsIGNvbnRlbnQpKTtcbiAgICByZXR1cm4gYCR7bVsxXX0ke3J1bGUuc2VsZWN0b3J9JHttWzNdfSR7Y29udGVudFByZWZpeH0ke3J1bGUuY29udGVudH0ke3N1ZmZpeH1gO1xuICB9KTtcbn1cblxuY2xhc3MgU3RyaW5nV2l0aEVzY2FwZWRCbG9ja3Mge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgZXNjYXBlZFN0cmluZzpzdHJpbmcsIHB1YmxpYyBibG9ja3M6c3RyaW5nW10pIHt9XG59XG5cbmZ1bmN0aW9uIGVzY2FwZUJsb2NrcyhpbnB1dDpzdHJpbmcpOlN0cmluZ1dpdGhFc2NhcGVkQmxvY2tzIHtcbiAgdmFyIGlucHV0UGFydHMgPSBTdHJpbmdXcmFwcGVyLnNwbGl0KGlucHV0LCBfY3VybHlSZSk7XG4gIHZhciByZXN1bHRQYXJ0cyA9IFtdO1xuICB2YXIgZXNjYXBlZEJsb2NrcyA9IFtdO1xuICB2YXIgYnJhY2tldENvdW50ID0gMDtcbiAgdmFyIGN1cnJlbnRCbG9ja1BhcnRzID0gW107XG4gIGZvciAodmFyIHBhcnRJbmRleCA9IDA7IHBhcnRJbmRleDxpbnB1dFBhcnRzLmxlbmd0aDsgcGFydEluZGV4KyspIHtcbiAgICB2YXIgcGFydCA9IGlucHV0UGFydHNbcGFydEluZGV4XTtcbiAgICBpZiAocGFydCA9PSBDTE9TRV9DVVJMWSkge1xuICAgICAgYnJhY2tldENvdW50LS07XG4gICAgfVxuICAgIGlmIChicmFja2V0Q291bnQgPiAwKSB7XG4gICAgICBjdXJyZW50QmxvY2tQYXJ0cy5wdXNoKHBhcnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoY3VycmVudEJsb2NrUGFydHMubGVuZ3RoID4gMCkge1xuICAgICAgICBlc2NhcGVkQmxvY2tzLnB1c2goY3VycmVudEJsb2NrUGFydHMuam9pbignJykpO1xuICAgICAgICByZXN1bHRQYXJ0cy5wdXNoKEJMT0NLX1BMQUNFSE9MREVSKTtcbiAgICAgICAgY3VycmVudEJsb2NrUGFydHMgPSBbXTtcbiAgICAgIH1cbiAgICAgIHJlc3VsdFBhcnRzLnB1c2gocGFydCk7XG4gICAgfVxuICAgIGlmIChwYXJ0ID09IE9QRU5fQ1VSTFkpIHtcbiAgICAgIGJyYWNrZXRDb3VudCsrO1xuICAgIH1cbiAgfVxuICBpZiAoY3VycmVudEJsb2NrUGFydHMubGVuZ3RoID4gMCkge1xuICAgIGVzY2FwZWRCbG9ja3MucHVzaChjdXJyZW50QmxvY2tQYXJ0cy5qb2luKCcnKSk7XG4gICAgcmVzdWx0UGFydHMucHVzaChCTE9DS19QTEFDRUhPTERFUik7XG4gIH1cbiAgcmV0dXJuIG5ldyBTdHJpbmdXaXRoRXNjYXBlZEJsb2NrcyhyZXN1bHRQYXJ0cy5qb2luKCcnKSwgZXNjYXBlZEJsb2Nrcyk7XG59XG4iXX0=