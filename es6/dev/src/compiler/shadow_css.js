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
            var p = parts[i];
            p = p.trim();
            if (this._selectorNeedsScoping(p, scopeSelector)) {
                p = strict && !StringWrapper.contains(p, _polyfillHostNoCombinator) ?
                    this._applyStrictSelectorScope(p, scopeSelector) :
                    this._applySelectorScope(p, scopeSelector, hostSelector);
            }
            r.push(p);
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
    />>>/g,
    /::shadow/g,
    /::content/g,
    // Deprecated selectors
    // TODO(vicb): see https://github.com/angular/clang-format/issues/16
    // clang-format off
    /\/deep\//g,
    /\/shadow-deep\//g,
    /\/shadow\//g,
];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hhZG93X2Nzcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb21waWxlci9zaGFkb3dfY3NzLnRzIl0sIm5hbWVzIjpbIlNoYWRvd0NzcyIsIlNoYWRvd0Nzcy5jb25zdHJ1Y3RvciIsIlNoYWRvd0Nzcy5zaGltQ3NzVGV4dCIsIlNoYWRvd0Nzcy5faW5zZXJ0RGlyZWN0aXZlcyIsIlNoYWRvd0Nzcy5faW5zZXJ0UG9seWZpbGxEaXJlY3RpdmVzSW5Dc3NUZXh0IiwiU2hhZG93Q3NzLl9pbnNlcnRQb2x5ZmlsbFJ1bGVzSW5Dc3NUZXh0IiwiU2hhZG93Q3NzLl9zY29wZUNzc1RleHQiLCJTaGFkb3dDc3MuX2V4dHJhY3RVbnNjb3BlZFJ1bGVzRnJvbUNzc1RleHQiLCJTaGFkb3dDc3MuX2NvbnZlcnRDb2xvbkhvc3QiLCJTaGFkb3dDc3MuX2NvbnZlcnRDb2xvbkhvc3RDb250ZXh0IiwiU2hhZG93Q3NzLl9jb252ZXJ0Q29sb25SdWxlIiwiU2hhZG93Q3NzLl9jb2xvbkhvc3RDb250ZXh0UGFydFJlcGxhY2VyIiwiU2hhZG93Q3NzLl9jb2xvbkhvc3RQYXJ0UmVwbGFjZXIiLCJTaGFkb3dDc3MuX2NvbnZlcnRTaGFkb3dET01TZWxlY3RvcnMiLCJTaGFkb3dDc3MuX3Njb3BlU2VsZWN0b3JzIiwiU2hhZG93Q3NzLl9zY29wZVNlbGVjdG9yIiwiU2hhZG93Q3NzLl9zZWxlY3Rvck5lZWRzU2NvcGluZyIsIlNoYWRvd0Nzcy5fbWFrZVNjb3BlTWF0Y2hlciIsIlNoYWRvd0Nzcy5fYXBwbHlTZWxlY3RvclNjb3BlIiwiU2hhZG93Q3NzLl9hcHBseVNpbXBsZVNlbGVjdG9yU2NvcGUiLCJTaGFkb3dDc3MuX2FwcGx5U3RyaWN0U2VsZWN0b3JTY29wZSIsIlNoYWRvd0Nzcy5faW5zZXJ0UG9seWZpbGxIb3N0SW5Dc3NUZXh0Iiwic3RyaXBDb21tZW50cyIsIkNzc1J1bGUiLCJDc3NSdWxlLmNvbnN0cnVjdG9yIiwicHJvY2Vzc1J1bGVzIiwiU3RyaW5nV2l0aEVzY2FwZWRCbG9ja3MiLCJTdHJpbmdXaXRoRXNjYXBlZEJsb2Nrcy5jb25zdHJ1Y3RvciIsImVzY2FwZUJsb2NrcyJdLCJtYXBwaW5ncyI6Ik9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSxnQ0FBZ0M7T0FDbkQsRUFDTCxhQUFhLEVBRWIsYUFBYSxFQUNiLG9CQUFvQixFQUNwQixTQUFTLEVBQ1QsT0FBTyxFQUNSLE1BQU0sMEJBQTBCO0FBRWpDOzs7Ozs7Ozs7R0FTRztBQUVIOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztFQWlIRTtBQUVGO0lBR0VBO1FBRkFDLGtCQUFhQSxHQUFZQSxJQUFJQSxDQUFDQTtJQUVmQSxDQUFDQTtJQUVoQkQ7Ozs7Ozs7TUFPRUE7SUFDRkEsV0FBV0EsQ0FBQ0EsT0FBZUEsRUFBRUEsUUFBZ0JBLEVBQUVBLFlBQVlBLEdBQVdBLEVBQUVBO1FBQ3RFRSxPQUFPQSxHQUFHQSxhQUFhQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQTtRQUNqQ0EsT0FBT0EsR0FBR0EsSUFBSUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQTtRQUMxQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsT0FBT0EsRUFBRUEsUUFBUUEsRUFBRUEsWUFBWUEsQ0FBQ0EsQ0FBQ0E7SUFDN0RBLENBQUNBO0lBRU9GLGlCQUFpQkEsQ0FBQ0EsT0FBZUE7UUFDdkNHLE9BQU9BLEdBQUdBLElBQUlBLENBQUNBLGtDQUFrQ0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0E7UUFDM0RBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLDZCQUE2QkEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0E7SUFDckRBLENBQUNBO0lBRURIOzs7Ozs7Ozs7Ozs7O09BYUdBO0lBQ0tBLGtDQUFrQ0EsQ0FBQ0Es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Q0EsQ0FBQ0E7UUFDL0JBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLENBQUNBO1lBQ05BLEVBQUVBLENBQUNBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ2pDQSxhQUFhQSxDQUFDQSxJQUFJQSxDQUFDQSxpQkFBaUJBLENBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO2dCQUMvQ0EsV0FBV0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxDQUFDQTtnQkFDcENBLGlCQUFpQkEsR0FBR0EsRUFBRUEsQ0FBQ0E7WUFDekJBLENBQUNBO1lBQ0RBLFdBQVdBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ3pCQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxJQUFJQSxVQUFVQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN2QkEsWUFBWUEsRUFBRUEsQ0FBQ0E7UUFDakJBLENBQUNBO0lBQ0hBLENBQUNBO0lBQ0RBLEVBQUVBLENBQUNBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDakNBLGFBQWFBLENBQUNBLElBQUlBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDL0NBLFdBQVdBLENBQUNBLElBQUlBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsQ0FBQ0E7SUFDdENBLENBQUNBO0lBQ0RBLE1BQU1BLENBQUNBLElBQUlBLHVCQUF1QkEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsRUFBRUEsYUFBYUEsQ0FBQ0EsQ0FBQ0E7QUFDMUVBLENBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtMaXN0V3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7XG4gIFN0cmluZ1dyYXBwZXIsXG4gIFJlZ0V4cCxcbiAgUmVnRXhwV3JhcHBlcixcbiAgUmVnRXhwTWF0Y2hlcldyYXBwZXIsXG4gIGlzUHJlc2VudCxcbiAgaXNCbGFua1xufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuXG4vKipcbiAqIFRoaXMgZmlsZSBpcyBhIHBvcnQgb2Ygc2hhZG93Q1NTIGZyb20gd2ViY29tcG9uZW50cy5qcyB0byBUeXBlU2NyaXB0LlxuICpcbiAqIFBsZWFzZSBtYWtlIHN1cmUgdG8ga2VlcCB0byBlZGl0cyBpbiBzeW5jIHdpdGggdGhlIHNvdXJjZSBmaWxlLlxuICpcbiAqIFNvdXJjZTpcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS93ZWJjb21wb25lbnRzL3dlYmNvbXBvbmVudHNqcy9ibG9iLzRlZmVjZDdlMGUvc3JjL1NoYWRvd0NTUy9TaGFkb3dDU1MuanNcbiAqXG4gKiBUaGUgb3JpZ2luYWwgZmlsZSBsZXZlbCBjb21tZW50IGlzIHJlcHJvZHVjZWQgYmVsb3dcbiAqL1xuXG4vKlxuICBUaGlzIGlzIGEgbGltaXRlZCBzaGltIGZvciBTaGFkb3dET00gY3NzIHN0eWxpbmcuXG4gIGh0dHBzOi8vZHZjcy53My5vcmcvaGcvd2ViY29tcG9uZW50cy9yYXctZmlsZS90aXAvc3BlYy9zaGFkb3cvaW5kZXguaHRtbCNzdHlsZXNcblxuICBUaGUgaW50ZW50aW9uIGhlcmUgaXMgdG8gc3VwcG9ydCBvbmx5IHRoZSBzdHlsaW5nIGZlYXR1cmVzIHdoaWNoIGNhbiBiZVxuICByZWxhdGl2ZWx5IHNpbXBseSBpbXBsZW1lbnRlZC4gVGhlIGdvYWwgaXMgdG8gYWxsb3cgdXNlcnMgdG8gYXZvaWQgdGhlXG4gIG1vc3Qgb2J2aW91cyBwaXRmYWxscyBhbmQgZG8gc28gd2l0aG91dCBjb21wcm9taXNpbmcgcGVyZm9ybWFuY2Ugc2lnbmlmaWNhbnRseS5cbiAgRm9yIFNoYWRvd0RPTSBzdHlsaW5nIHRoYXQncyBub3QgY292ZXJlZCBoZXJlLCBhIHNldCBvZiBiZXN0IHByYWN0aWNlc1xuICBjYW4gYmUgcHJvdmlkZWQgdGhhdCBzaG91bGQgYWxsb3cgdXNlcnMgdG8gYWNjb21wbGlzaCBtb3JlIGNvbXBsZXggc3R5bGluZy5cblxuICBUaGUgZm9sbG93aW5nIGlzIGEgbGlzdCBvZiBzcGVjaWZpYyBTaGFkb3dET00gc3R5bGluZyBmZWF0dXJlcyBhbmQgYSBicmllZlxuICBkaXNjdXNzaW9uIG9mIHRoZSBhcHByb2FjaCB1c2VkIHRvIHNoaW0uXG5cbiAgU2hpbW1lZCBmZWF0dXJlczpcblxuICAqIDpob3N0LCA6aG9zdC1jb250ZXh0OiBTaGFkb3dET00gYWxsb3dzIHN0eWxpbmcgb2YgdGhlIHNoYWRvd1Jvb3QncyBob3N0XG4gIGVsZW1lbnQgdXNpbmcgdGhlIDpob3N0IHJ1bGUuIFRvIHNoaW0gdGhpcyBmZWF0dXJlLCB0aGUgOmhvc3Qgc3R5bGVzIGFyZVxuICByZWZvcm1hdHRlZCBhbmQgcHJlZml4ZWQgd2l0aCBhIGdpdmVuIHNjb3BlIG5hbWUgYW5kIHByb21vdGVkIHRvIGFcbiAgZG9jdW1lbnQgbGV2ZWwgc3R5bGVzaGVldC5cbiAgRm9yIGV4YW1wbGUsIGdpdmVuIGEgc2NvcGUgbmFtZSBvZiAuZm9vLCBhIHJ1bGUgbGlrZSB0aGlzOlxuXG4gICAgOmhvc3Qge1xuICAgICAgICBiYWNrZ3JvdW5kOiByZWQ7XG4gICAgICB9XG4gICAgfVxuXG4gIGJlY29tZXM6XG5cbiAgICAuZm9vIHtcbiAgICAgIGJhY2tncm91bmQ6IHJlZDtcbiAgICB9XG5cbiAgKiBlbmNhcHN1bHRpb246IFN0eWxlcyBkZWZpbmVkIHdpdGhpbiBTaGFkb3dET00sIGFwcGx5IG9ubHkgdG9cbiAgZG9tIGluc2lkZSB0aGUgU2hhZG93RE9NLiBQb2x5bWVyIHVzZXMgb25lIG9mIHR3byB0ZWNobmlxdWVzIHRvIGltcGxlbWVudFxuICB0aGlzIGZlYXR1cmUuXG5cbiAgQnkgZGVmYXVsdCwgcnVsZXMgYXJlIHByZWZpeGVkIHdpdGggdGhlIGhvc3QgZWxlbWVudCB0YWcgbmFtZVxuICBhcyBhIGRlc2NlbmRhbnQgc2VsZWN0b3IuIFRoaXMgZW5zdXJlcyBzdHlsaW5nIGRvZXMgbm90IGxlYWsgb3V0IG9mIHRoZSAndG9wJ1xuICBvZiB0aGUgZWxlbWVudCdzIFNoYWRvd0RPTS4gRm9yIGV4YW1wbGUsXG5cbiAgZGl2IHtcbiAgICAgIGZvbnQtd2VpZ2h0OiBib2xkO1xuICAgIH1cblxuICBiZWNvbWVzOlxuXG4gIHgtZm9vIGRpdiB7XG4gICAgICBmb250LXdlaWdodDogYm9sZDtcbiAgICB9XG5cbiAgYmVjb21lczpcblxuXG4gIEFsdGVybmF0aXZlbHksIGlmIFdlYkNvbXBvbmVudHMuU2hhZG93Q1NTLnN0cmljdFN0eWxpbmcgaXMgc2V0IHRvIHRydWUgdGhlblxuICBzZWxlY3RvcnMgYXJlIHNjb3BlZCBieSBhZGRpbmcgYW4gYXR0cmlidXRlIHNlbGVjdG9yIHN1ZmZpeCB0byBlYWNoXG4gIHNpbXBsZSBzZWxlY3RvciB0aGF0IGNvbnRhaW5zIHRoZSBob3N0IGVsZW1lbnQgdGFnIG5hbWUuIEVhY2ggZWxlbWVudFxuICBpbiB0aGUgZWxlbWVudCdzIFNoYWRvd0RPTSB0ZW1wbGF0ZSBpcyBhbHNvIGdpdmVuIHRoZSBzY29wZSBhdHRyaWJ1dGUuXG4gIFRodXMsIHRoZXNlIHJ1bGVzIG1hdGNoIG9ubHkgZWxlbWVudHMgdGhhdCBoYXZlIHRoZSBzY29wZSBhdHRyaWJ1dGUuXG4gIEZvciBleGFtcGxlLCBnaXZlbiBhIHNjb3BlIG5hbWUgb2YgeC1mb28sIGEgcnVsZSBsaWtlIHRoaXM6XG5cbiAgICBkaXYge1xuICAgICAgZm9udC13ZWlnaHQ6IGJvbGQ7XG4gICAgfVxuXG4gIGJlY29tZXM6XG5cbiAgICBkaXZbeC1mb29dIHtcbiAgICAgIGZvbnQtd2VpZ2h0OiBib2xkO1xuICAgIH1cblxuICBOb3RlIHRoYXQgZWxlbWVudHMgdGhhdCBhcmUgZHluYW1pY2FsbHkgYWRkZWQgdG8gYSBzY29wZSBtdXN0IGhhdmUgdGhlIHNjb3BlXG4gIHNlbGVjdG9yIGFkZGVkIHRvIHRoZW0gbWFudWFsbHkuXG5cbiAgKiB1cHBlci9sb3dlciBib3VuZCBlbmNhcHN1bGF0aW9uOiBTdHlsZXMgd2hpY2ggYXJlIGRlZmluZWQgb3V0c2lkZSBhXG4gIHNoYWRvd1Jvb3Qgc2hvdWxkIG5vdCBjcm9zcyB0aGUgU2hhZG93RE9NIGJvdW5kYXJ5IGFuZCBzaG91bGQgbm90IGFwcGx5XG4gIGluc2lkZSBhIHNoYWRvd1Jvb3QuXG5cbiAgVGhpcyBzdHlsaW5nIGJlaGF2aW9yIGlzIG5vdCBlbXVsYXRlZC4gU29tZSBwb3NzaWJsZSB3YXlzIHRvIGRvIHRoaXMgdGhhdFxuICB3ZXJlIHJlamVjdGVkIGR1ZSB0byBjb21wbGV4aXR5IGFuZC9vciBwZXJmb3JtYW5jZSBjb25jZXJucyBpbmNsdWRlOiAoMSkgcmVzZXRcbiAgZXZlcnkgcG9zc2libGUgcHJvcGVydHkgZm9yIGV2ZXJ5IHBvc3NpYmxlIHNlbGVjdG9yIGZvciBhIGdpdmVuIHNjb3BlIG5hbWU7XG4gICgyKSByZS1pbXBsZW1lbnQgY3NzIGluIGphdmFzY3JpcHQuXG5cbiAgQXMgYW4gYWx0ZXJuYXRpdmUsIHVzZXJzIHNob3VsZCBtYWtlIHN1cmUgdG8gdXNlIHNlbGVjdG9yc1xuICBzcGVjaWZpYyB0byB0aGUgc2NvcGUgaW4gd2hpY2ggdGhleSBhcmUgd29ya2luZy5cblxuICAqIDo6ZGlzdHJpYnV0ZWQ6IFRoaXMgYmVoYXZpb3IgaXMgbm90IGVtdWxhdGVkLiBJdCdzIG9mdGVuIG5vdCBuZWNlc3NhcnlcbiAgdG8gc3R5bGUgdGhlIGNvbnRlbnRzIG9mIGEgc3BlY2lmaWMgaW5zZXJ0aW9uIHBvaW50IGFuZCBpbnN0ZWFkLCBkZXNjZW5kYW50c1xuICBvZiB0aGUgaG9zdCBlbGVtZW50IGNhbiBiZSBzdHlsZWQgc2VsZWN0aXZlbHkuIFVzZXJzIGNhbiBhbHNvIGNyZWF0ZSBhblxuICBleHRyYSBub2RlIGFyb3VuZCBhbiBpbnNlcnRpb24gcG9pbnQgYW5kIHN0eWxlIHRoYXQgbm9kZSdzIGNvbnRlbnRzXG4gIHZpYSBkZXNjZW5kZW50IHNlbGVjdG9ycy4gRm9yIGV4YW1wbGUsIHdpdGggYSBzaGFkb3dSb290IGxpa2UgdGhpczpcblxuICAgIDxzdHlsZT5cbiAgICAgIDo6Y29udGVudChkaXYpIHtcbiAgICAgICAgYmFja2dyb3VuZDogcmVkO1xuICAgICAgfVxuICAgIDwvc3R5bGU+XG4gICAgPGNvbnRlbnQ+PC9jb250ZW50PlxuXG4gIGNvdWxkIGJlY29tZTpcblxuICAgIDxzdHlsZT5cbiAgICAgIC8gKkBwb2x5ZmlsbCAuY29udGVudC1jb250YWluZXIgZGl2ICogL1xuICAgICAgOjpjb250ZW50KGRpdikge1xuICAgICAgICBiYWNrZ3JvdW5kOiByZWQ7XG4gICAgICB9XG4gICAgPC9zdHlsZT5cbiAgICA8ZGl2IGNsYXNzPVwiY29udGVudC1jb250YWluZXJcIj5cbiAgICAgIDxjb250ZW50PjwvY29udGVudD5cbiAgICA8L2Rpdj5cblxuICBOb3RlIHRoZSB1c2Ugb2YgQHBvbHlmaWxsIGluIHRoZSBjb21tZW50IGFib3ZlIGEgU2hhZG93RE9NIHNwZWNpZmljIHN0eWxlXG4gIGRlY2xhcmF0aW9uLiBUaGlzIGlzIGEgZGlyZWN0aXZlIHRvIHRoZSBzdHlsaW5nIHNoaW0gdG8gdXNlIHRoZSBzZWxlY3RvclxuICBpbiBjb21tZW50cyBpbiBsaWV1IG9mIHRoZSBuZXh0IHNlbGVjdG9yIHdoZW4gcnVubmluZyB1bmRlciBwb2x5ZmlsbC5cbiovXG5cbmV4cG9ydCBjbGFzcyBTaGFkb3dDc3Mge1xuICBzdHJpY3RTdHlsaW5nOiBib29sZWFuID0gdHJ1ZTtcblxuICBjb25zdHJ1Y3RvcigpIHt9XG5cbiAgLypcbiAgKiBTaGltIHNvbWUgY3NzVGV4dCB3aXRoIHRoZSBnaXZlbiBzZWxlY3Rvci4gUmV0dXJucyBjc3NUZXh0IHRoYXQgY2FuXG4gICogYmUgaW5jbHVkZWQgaW4gdGhlIGRvY3VtZW50IHZpYSBXZWJDb21wb25lbnRzLlNoYWRvd0NTUy5hZGRDc3NUb0RvY3VtZW50KGNzcykuXG4gICpcbiAgKiBXaGVuIHN0cmljdFN0eWxpbmcgaXMgdHJ1ZTpcbiAgKiAtIHNlbGVjdG9yIGlzIHRoZSBhdHRyaWJ1dGUgYWRkZWQgdG8gYWxsIGVsZW1lbnRzIGluc2lkZSB0aGUgaG9zdCxcbiAgKiAtIGhvc3RTZWxlY3RvciBpcyB0aGUgYXR0cmlidXRlIGFkZGVkIHRvIHRoZSBob3N0IGl0c2VsZi5cbiAgKi9cbiAgc2hpbUNzc1RleHQoY3NzVGV4dDogc3RyaW5nLCBzZWxlY3Rvcjogc3RyaW5nLCBob3N0U2VsZWN0b3I6IHN0cmluZyA9ICcnKTogc3RyaW5nIHtcbiAgICBjc3NUZXh0ID0gc3RyaXBDb21tZW50cyhjc3NUZXh0KTtcbiAgICBjc3NUZXh0ID0gdGhpcy5faW5zZXJ0RGlyZWN0aXZlcyhjc3NUZXh0KTtcbiAgICByZXR1cm4gdGhpcy5fc2NvcGVDc3NUZXh0KGNzc1RleHQsIHNlbGVjdG9yLCBob3N0U2VsZWN0b3IpO1xuICB9XG5cbiAgcHJpdmF0ZSBfaW5zZXJ0RGlyZWN0aXZlcyhjc3NUZXh0OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGNzc1RleHQgPSB0aGlzLl9pbnNlcnRQb2x5ZmlsbERpcmVjdGl2ZXNJbkNzc1RleHQoY3NzVGV4dCk7XG4gICAgcmV0dXJuIHRoaXMuX2luc2VydFBvbHlmaWxsUnVsZXNJbkNzc1RleHQoY3NzVGV4dCk7XG4gIH1cblxuICAvKlxuICAgKiBQcm9jZXNzIHN0eWxlcyB0byBjb252ZXJ0IG5hdGl2ZSBTaGFkb3dET00gcnVsZXMgdGhhdCB3aWxsIHRyaXBcbiAgICogdXAgdGhlIGNzcyBwYXJzZXI7IHdlIHJlbHkgb24gZGVjb3JhdGluZyB0aGUgc3R5bGVzaGVldCB3aXRoIGluZXJ0IHJ1bGVzLlxuICAgKlxuICAgKiBGb3IgZXhhbXBsZSwgd2UgY29udmVydCB0aGlzIHJ1bGU6XG4gICAqXG4gICAqIHBvbHlmaWxsLW5leHQtc2VsZWN0b3IgeyBjb250ZW50OiAnOmhvc3QgbWVudS1pdGVtJzsgfVxuICAgKiA6OmNvbnRlbnQgbWVudS1pdGVtIHtcbiAgICpcbiAgICogdG8gdGhpczpcbiAgICpcbiAgICogc2NvcGVOYW1lIG1lbnUtaXRlbSB7XG4gICAqXG4gICoqL1xuICBwcml2YXRlIF9pbnNlcnRQb2x5ZmlsbERpcmVjdGl2ZXNJbkNzc1RleHQoY3NzVGV4dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAvLyBEaWZmZXJlbmNlIHdpdGggd2ViY29tcG9uZW50cy5qczogZG9lcyBub3QgaGFuZGxlIGNvbW1lbnRzXG4gICAgcmV0dXJuIFN0cmluZ1dyYXBwZXIucmVwbGFjZUFsbE1hcHBlZChjc3NUZXh0LCBfY3NzQ29udGVudE5leHRTZWxlY3RvclJlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24obSkgeyByZXR1cm4gbVsxXSArICd7JzsgfSk7XG4gIH1cblxuICAvKlxuICAgKiBQcm9jZXNzIHN0eWxlcyB0byBhZGQgcnVsZXMgd2hpY2ggd2lsbCBvbmx5IGFwcGx5IHVuZGVyIHRoZSBwb2x5ZmlsbFxuICAgKlxuICAgKiBGb3IgZXhhbXBsZSwgd2UgY29udmVydCB0aGlzIHJ1bGU6XG4gICAqXG4gICAqIHBvbHlmaWxsLXJ1bGUge1xuICAgKiAgIGNvbnRlbnQ6ICc6aG9zdCBtZW51LWl0ZW0nO1xuICAgKiAuLi5cbiAgICogfVxuICAgKlxuICAgKiB0byB0aGlzOlxuICAgKlxuICAgKiBzY29wZU5hbWUgbWVudS1pdGVtIHsuLi59XG4gICAqXG4gICoqL1xuICBwcml2YXRlIF9pbnNlcnRQb2x5ZmlsbFJ1bGVzSW5Dc3NUZXh0KGNzc1RleHQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgLy8gRGlmZmVyZW5jZSB3aXRoIHdlYmNvbXBvbmVudHMuanM6IGRvZXMgbm90IGhhbmRsZSBjb21tZW50c1xuICAgIHJldHVybiBTdHJpbmdXcmFwcGVyLnJlcGxhY2VBbGxNYXBwZWQoY3NzVGV4dCwgX2Nzc0NvbnRlbnRSdWxlUmUsIGZ1bmN0aW9uKG0pIHtcbiAgICAgIHZhciBydWxlID0gbVswXTtcbiAgICAgIHJ1bGUgPSBTdHJpbmdXcmFwcGVyLnJlcGxhY2UocnVsZSwgbVsxXSwgJycpO1xuICAgICAgcnVsZSA9IFN0cmluZ1dyYXBwZXIucmVwbGFjZShydWxlLCBtWzJdLCAnJyk7XG4gICAgICByZXR1cm4gbVszXSArIHJ1bGU7XG4gICAgfSk7XG4gIH1cblxuICAvKiBFbnN1cmUgc3R5bGVzIGFyZSBzY29wZWQuIFBzZXVkby1zY29waW5nIHRha2VzIGEgcnVsZSBsaWtlOlxuICAgKlxuICAgKiAgLmZvbyB7Li4uIH1cbiAgICpcbiAgICogIGFuZCBjb252ZXJ0cyB0aGlzIHRvXG4gICAqXG4gICAqICBzY29wZU5hbWUgLmZvbyB7IC4uLiB9XG4gICovXG4gIHByaXZhdGUgX3Njb3BlQ3NzVGV4dChjc3NUZXh0OiBzdHJpbmcsIHNjb3BlU2VsZWN0b3I6IHN0cmluZywgaG9zdFNlbGVjdG9yOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHZhciB1bnNjb3BlZCA9IHRoaXMuX2V4dHJhY3RVbnNjb3BlZFJ1bGVzRnJvbUNzc1RleHQoY3NzVGV4dCk7XG4gICAgY3NzVGV4dCA9IHRoaXMuX2luc2VydFBvbHlmaWxsSG9zdEluQ3NzVGV4dChjc3NUZXh0KTtcbiAgICBjc3NUZXh0ID0gdGhpcy5fY29udmVydENvbG9uSG9zdChjc3NUZXh0KTtcbiAgICBjc3NUZXh0ID0gdGhpcy5fY29udmVydENvbG9uSG9zdENvbnRleHQoY3NzVGV4dCk7XG4gICAgY3NzVGV4dCA9IHRoaXMuX2NvbnZlcnRTaGFkb3dET01TZWxlY3RvcnMoY3NzVGV4dCk7XG4gICAgaWYgKGlzUHJlc2VudChzY29wZVNlbGVjdG9yKSkge1xuICAgICAgY3NzVGV4dCA9IHRoaXMuX3Njb3BlU2VsZWN0b3JzKGNzc1RleHQsIHNjb3BlU2VsZWN0b3IsIGhvc3RTZWxlY3Rvcik7XG4gICAgfVxuICAgIGNzc1RleHQgPSBjc3NUZXh0ICsgJ1xcbicgKyB1bnNjb3BlZDtcbiAgICByZXR1cm4gY3NzVGV4dC50cmltKCk7XG4gIH1cblxuICAvKlxuICAgKiBQcm9jZXNzIHN0eWxlcyB0byBhZGQgcnVsZXMgd2hpY2ggd2lsbCBvbmx5IGFwcGx5IHVuZGVyIHRoZSBwb2x5ZmlsbFxuICAgKiBhbmQgZG8gbm90IHByb2Nlc3MgdmlhIENTU09NLiAoQ1NTT00gaXMgZGVzdHJ1Y3RpdmUgdG8gcnVsZXMgb24gcmFyZVxuICAgKiBvY2Nhc2lvbnMsIGUuZy4gLXdlYmtpdC1jYWxjIG9uIFNhZmFyaS4pXG4gICAqIEZvciBleGFtcGxlLCB3ZSBjb252ZXJ0IHRoaXMgcnVsZTpcbiAgICpcbiAgICogQHBvbHlmaWxsLXVuc2NvcGVkLXJ1bGUge1xuICAgKiAgIGNvbnRlbnQ6ICdtZW51LWl0ZW0nO1xuICAgKiAuLi4gfVxuICAgKlxuICAgKiB0byB0aGlzOlxuICAgKlxuICAgKiBtZW51LWl0ZW0gey4uLn1cbiAgICpcbiAgKiovXG4gIHByaXZhdGUgX2V4dHJhY3RVbnNjb3BlZFJ1bGVzRnJvbUNzc1RleHQoY3NzVGV4dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAvLyBEaWZmZXJlbmNlIHdpdGggd2ViY29tcG9uZW50cy5qczogZG9lcyBub3QgaGFuZGxlIGNvbW1lbnRzXG4gICAgdmFyIHIgPSAnJywgbTtcbiAgICB2YXIgbWF0Y2hlciA9IFJlZ0V4cFdyYXBwZXIubWF0Y2hlcihfY3NzQ29udGVudFVuc2NvcGVkUnVsZVJlLCBjc3NUZXh0KTtcbiAgICB3aGlsZSAoaXNQcmVzZW50KG0gPSBSZWdFeHBNYXRjaGVyV3JhcHBlci5uZXh0KG1hdGNoZXIpKSkge1xuICAgICAgdmFyIHJ1bGUgPSBtWzBdO1xuICAgICAgcnVsZSA9IFN0cmluZ1dyYXBwZXIucmVwbGFjZShydWxlLCBtWzJdLCAnJyk7XG4gICAgICBydWxlID0gU3RyaW5nV3JhcHBlci5yZXBsYWNlKHJ1bGUsIG1bMV0sIG1bM10pO1xuICAgICAgciArPSBydWxlICsgJ1xcblxcbic7XG4gICAgfVxuICAgIHJldHVybiByO1xuICB9XG5cbiAgLypcbiAgICogY29udmVydCBhIHJ1bGUgbGlrZSA6aG9zdCguZm9vKSA+IC5iYXIgeyB9XG4gICAqXG4gICAqIHRvXG4gICAqXG4gICAqIHNjb3BlTmFtZS5mb28gPiAuYmFyXG4gICovXG4gIHByaXZhdGUgX2NvbnZlcnRDb2xvbkhvc3QoY3NzVGV4dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fY29udmVydENvbG9uUnVsZShjc3NUZXh0LCBfY3NzQ29sb25Ib3N0UmUsIHRoaXMuX2NvbG9uSG9zdFBhcnRSZXBsYWNlcik7XG4gIH1cblxuICAvKlxuICAgKiBjb252ZXJ0IGEgcnVsZSBsaWtlIDpob3N0LWNvbnRleHQoLmZvbykgPiAuYmFyIHsgfVxuICAgKlxuICAgKiB0b1xuICAgKlxuICAgKiBzY29wZU5hbWUuZm9vID4gLmJhciwgLmZvbyBzY29wZU5hbWUgPiAuYmFyIHsgfVxuICAgKlxuICAgKiBhbmRcbiAgICpcbiAgICogOmhvc3QtY29udGV4dCguZm9vOmhvc3QpIC5iYXIgeyAuLi4gfVxuICAgKlxuICAgKiB0b1xuICAgKlxuICAgKiBzY29wZU5hbWUuZm9vIC5iYXIgeyAuLi4gfVxuICAqL1xuICBwcml2YXRlIF9jb252ZXJ0Q29sb25Ib3N0Q29udGV4dChjc3NUZXh0OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9jb252ZXJ0Q29sb25SdWxlKGNzc1RleHQsIF9jc3NDb2xvbkhvc3RDb250ZXh0UmUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fY29sb25Ib3N0Q29udGV4dFBhcnRSZXBsYWNlcik7XG4gIH1cblxuICBwcml2YXRlIF9jb252ZXJ0Q29sb25SdWxlKGNzc1RleHQ6IHN0cmluZywgcmVnRXhwOiBSZWdFeHAsIHBhcnRSZXBsYWNlcjogRnVuY3Rpb24pOiBzdHJpbmcge1xuICAgIC8vIHAxID0gOmhvc3QsIHAyID0gY29udGVudHMgb2YgKCksIHAzIHJlc3Qgb2YgcnVsZVxuICAgIHJldHVybiBTdHJpbmdXcmFwcGVyLnJlcGxhY2VBbGxNYXBwZWQoY3NzVGV4dCwgcmVnRXhwLCBmdW5jdGlvbihtKSB7XG4gICAgICBpZiAoaXNQcmVzZW50KG1bMl0pKSB7XG4gICAgICAgIHZhciBwYXJ0cyA9IG1bMl0uc3BsaXQoJywnKSwgciA9IFtdO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhcnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgdmFyIHAgPSBwYXJ0c1tpXTtcbiAgICAgICAgICBpZiAoaXNCbGFuayhwKSkgYnJlYWs7XG4gICAgICAgICAgcCA9IHAudHJpbSgpO1xuICAgICAgICAgIHIucHVzaChwYXJ0UmVwbGFjZXIoX3BvbHlmaWxsSG9zdE5vQ29tYmluYXRvciwgcCwgbVszXSkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByLmpvaW4oJywnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBfcG9seWZpbGxIb3N0Tm9Db21iaW5hdG9yICsgbVszXTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2NvbG9uSG9zdENvbnRleHRQYXJ0UmVwbGFjZXIoaG9zdDogc3RyaW5nLCBwYXJ0OiBzdHJpbmcsIHN1ZmZpeDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBpZiAoU3RyaW5nV3JhcHBlci5jb250YWlucyhwYXJ0LCBfcG9seWZpbGxIb3N0KSkge1xuICAgICAgcmV0dXJuIHRoaXMuX2NvbG9uSG9zdFBhcnRSZXBsYWNlcihob3N0LCBwYXJ0LCBzdWZmaXgpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gaG9zdCArIHBhcnQgKyBzdWZmaXggKyAnLCAnICsgcGFydCArICcgJyArIGhvc3QgKyBzdWZmaXg7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfY29sb25Ib3N0UGFydFJlcGxhY2VyKGhvc3Q6IHN0cmluZywgcGFydDogc3RyaW5nLCBzdWZmaXg6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGhvc3QgKyBTdHJpbmdXcmFwcGVyLnJlcGxhY2UocGFydCwgX3BvbHlmaWxsSG9zdCwgJycpICsgc3VmZml4O1xuICB9XG5cbiAgLypcbiAgICogQ29udmVydCBjb21iaW5hdG9ycyBsaWtlIDo6c2hhZG93IGFuZCBwc2V1ZG8tZWxlbWVudHMgbGlrZSA6OmNvbnRlbnRcbiAgICogYnkgcmVwbGFjaW5nIHdpdGggc3BhY2UuXG4gICovXG4gIHByaXZhdGUgX2NvbnZlcnRTaGFkb3dET01TZWxlY3RvcnMoY3NzVGV4dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IF9zaGFkb3dET01TZWxlY3RvcnNSZS5sZW5ndGg7IGkrKykge1xuICAgICAgY3NzVGV4dCA9IFN0cmluZ1dyYXBwZXIucmVwbGFjZUFsbChjc3NUZXh0LCBfc2hhZG93RE9NU2VsZWN0b3JzUmVbaV0sICcgJyk7XG4gICAgfVxuICAgIHJldHVybiBjc3NUZXh0O1xuICB9XG5cbiAgLy8gY2hhbmdlIGEgc2VsZWN0b3IgbGlrZSAnZGl2JyB0byAnbmFtZSBkaXYnXG4gIHByaXZhdGUgX3Njb3BlU2VsZWN0b3JzKGNzc1RleHQ6IHN0cmluZywgc2NvcGVTZWxlY3Rvcjogc3RyaW5nLCBob3N0U2VsZWN0b3I6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHByb2Nlc3NSdWxlcyhjc3NUZXh0LCAocnVsZTogQ3NzUnVsZSkgPT4ge1xuICAgICAgdmFyIHNlbGVjdG9yID0gcnVsZS5zZWxlY3RvcjtcbiAgICAgIHZhciBjb250ZW50ID0gcnVsZS5jb250ZW50O1xuICAgICAgaWYgKHJ1bGUuc2VsZWN0b3JbMF0gIT0gJ0AnIHx8IHJ1bGUuc2VsZWN0b3Iuc3RhcnRzV2l0aCgnQHBhZ2UnKSkge1xuICAgICAgICBzZWxlY3RvciA9XG4gICAgICAgICAgICB0aGlzLl9zY29wZVNlbGVjdG9yKHJ1bGUuc2VsZWN0b3IsIHNjb3BlU2VsZWN0b3IsIGhvc3RTZWxlY3RvciwgdGhpcy5zdHJpY3RTdHlsaW5nKTtcbiAgICAgIH0gZWxzZSBpZiAocnVsZS5zZWxlY3Rvci5zdGFydHNXaXRoKCdAbWVkaWEnKSkge1xuICAgICAgICBjb250ZW50ID0gdGhpcy5fc2NvcGVTZWxlY3RvcnMocnVsZS5jb250ZW50LCBzY29wZVNlbGVjdG9yLCBob3N0U2VsZWN0b3IpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyBDc3NSdWxlKHNlbGVjdG9yLCBjb250ZW50KTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX3Njb3BlU2VsZWN0b3Ioc2VsZWN0b3I6IHN0cmluZywgc2NvcGVTZWxlY3Rvcjogc3RyaW5nLCBob3N0U2VsZWN0b3I6IHN0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgICBzdHJpY3Q6IGJvb2xlYW4pOiBzdHJpbmcge1xuICAgIHZhciByID0gW10sIHBhcnRzID0gc2VsZWN0b3Iuc3BsaXQoJywnKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhcnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgcCA9IHBhcnRzW2ldO1xuICAgICAgcCA9IHAudHJpbSgpO1xuICAgICAgaWYgKHRoaXMuX3NlbGVjdG9yTmVlZHNTY29waW5nKHAsIHNjb3BlU2VsZWN0b3IpKSB7XG4gICAgICAgIHAgPSBzdHJpY3QgJiYgIVN0cmluZ1dyYXBwZXIuY29udGFpbnMocCwgX3BvbHlmaWxsSG9zdE5vQ29tYmluYXRvcikgP1xuICAgICAgICAgICAgICAgIHRoaXMuX2FwcGx5U3RyaWN0U2VsZWN0b3JTY29wZShwLCBzY29wZVNlbGVjdG9yKSA6XG4gICAgICAgICAgICAgICAgdGhpcy5fYXBwbHlTZWxlY3RvclNjb3BlKHAsIHNjb3BlU2VsZWN0b3IsIGhvc3RTZWxlY3Rvcik7XG4gICAgICB9XG4gICAgICByLnB1c2gocCk7XG4gICAgfVxuICAgIHJldHVybiByLmpvaW4oJywgJyk7XG4gIH1cblxuICBwcml2YXRlIF9zZWxlY3Rvck5lZWRzU2NvcGluZyhzZWxlY3Rvcjogc3RyaW5nLCBzY29wZVNlbGVjdG9yOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICB2YXIgcmUgPSB0aGlzLl9tYWtlU2NvcGVNYXRjaGVyKHNjb3BlU2VsZWN0b3IpO1xuICAgIHJldHVybiAhaXNQcmVzZW50KFJlZ0V4cFdyYXBwZXIuZmlyc3RNYXRjaChyZSwgc2VsZWN0b3IpKTtcbiAgfVxuXG4gIHByaXZhdGUgX21ha2VTY29wZU1hdGNoZXIoc2NvcGVTZWxlY3Rvcjogc3RyaW5nKTogUmVnRXhwIHtcbiAgICB2YXIgbHJlID0gL1xcWy9nO1xuICAgIHZhciBycmUgPSAvXFxdL2c7XG4gICAgc2NvcGVTZWxlY3RvciA9IFN0cmluZ1dyYXBwZXIucmVwbGFjZUFsbChzY29wZVNlbGVjdG9yLCBscmUsICdcXFxcWycpO1xuICAgIHNjb3BlU2VsZWN0b3IgPSBTdHJpbmdXcmFwcGVyLnJlcGxhY2VBbGwoc2NvcGVTZWxlY3RvciwgcnJlLCAnXFxcXF0nKTtcbiAgICByZXR1cm4gUmVnRXhwV3JhcHBlci5jcmVhdGUoJ14oJyArIHNjb3BlU2VsZWN0b3IgKyAnKScgKyBfc2VsZWN0b3JSZVN1ZmZpeCwgJ20nKTtcbiAgfVxuXG4gIHByaXZhdGUgX2FwcGx5U2VsZWN0b3JTY29wZShzZWxlY3Rvcjogc3RyaW5nLCBzY29wZVNlbGVjdG9yOiBzdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBob3N0U2VsZWN0b3I6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgLy8gRGlmZmVyZW5jZSBmcm9tIHdlYmNvbXBvbmVudHNqczogc2NvcGVTZWxlY3RvciBjb3VsZCBub3QgYmUgYW4gYXJyYXlcbiAgICByZXR1cm4gdGhpcy5fYXBwbHlTaW1wbGVTZWxlY3RvclNjb3BlKHNlbGVjdG9yLCBzY29wZVNlbGVjdG9yLCBob3N0U2VsZWN0b3IpO1xuICB9XG5cbiAgLy8gc2NvcGUgdmlhIG5hbWUgYW5kIFtpcz1uYW1lXVxuICBwcml2YXRlIF9hcHBseVNpbXBsZVNlbGVjdG9yU2NvcGUoc2VsZWN0b3I6IHN0cmluZywgc2NvcGVTZWxlY3Rvcjogc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaG9zdFNlbGVjdG9yOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGlmIChpc1ByZXNlbnQoUmVnRXhwV3JhcHBlci5maXJzdE1hdGNoKF9wb2x5ZmlsbEhvc3RSZSwgc2VsZWN0b3IpKSkge1xuICAgICAgdmFyIHJlcGxhY2VCeSA9IHRoaXMuc3RyaWN0U3R5bGluZyA/IGBbJHtob3N0U2VsZWN0b3J9XWAgOiBzY29wZVNlbGVjdG9yO1xuICAgICAgc2VsZWN0b3IgPSBTdHJpbmdXcmFwcGVyLnJlcGxhY2Uoc2VsZWN0b3IsIF9wb2x5ZmlsbEhvc3ROb0NvbWJpbmF0b3IsIHJlcGxhY2VCeSk7XG4gICAgICByZXR1cm4gU3RyaW5nV3JhcHBlci5yZXBsYWNlQWxsKHNlbGVjdG9yLCBfcG9seWZpbGxIb3N0UmUsIHJlcGxhY2VCeSArICcgJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBzY29wZVNlbGVjdG9yICsgJyAnICsgc2VsZWN0b3I7XG4gICAgfVxuICB9XG5cbiAgLy8gcmV0dXJuIGEgc2VsZWN0b3Igd2l0aCBbbmFtZV0gc3VmZml4IG9uIGVhY2ggc2ltcGxlIHNlbGVjdG9yXG4gIC8vIGUuZy4gLmZvby5iYXIgPiAuem90IGJlY29tZXMgLmZvb1tuYW1lXS5iYXJbbmFtZV0gPiAuem90W25hbWVdICAvKiogQGludGVybmFsICovXG4gIHByaXZhdGUgX2FwcGx5U3RyaWN0U2VsZWN0b3JTY29wZShzZWxlY3Rvcjogc3RyaW5nLCBzY29wZVNlbGVjdG9yOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHZhciBpc1JlID0gL1xcW2lzPShbXlxcXV0qKVxcXS9nO1xuICAgIHNjb3BlU2VsZWN0b3IgPSBTdHJpbmdXcmFwcGVyLnJlcGxhY2VBbGxNYXBwZWQoc2NvcGVTZWxlY3RvciwgaXNSZSwgKG0pID0+IG1bMV0pO1xuICAgIHZhciBzcGxpdHMgPSBbJyAnLCAnPicsICcrJywgJ34nXSwgc2NvcGVkID0gc2VsZWN0b3IsIGF0dHJOYW1lID0gJ1snICsgc2NvcGVTZWxlY3RvciArICddJztcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNwbGl0cy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHNlcCA9IHNwbGl0c1tpXTtcbiAgICAgIHZhciBwYXJ0cyA9IHNjb3BlZC5zcGxpdChzZXApO1xuICAgICAgc2NvcGVkID0gcGFydHMubWFwKHAgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgIC8vIHJlbW92ZSA6aG9zdCBzaW5jZSBpdCBzaG91bGQgYmUgdW5uZWNlc3NhcnlcbiAgICAgICAgICAgICAgICAgICAgICB2YXIgdCA9IFN0cmluZ1dyYXBwZXIucmVwbGFjZUFsbChwLnRyaW0oKSwgX3BvbHlmaWxsSG9zdFJlLCAnJyk7XG4gICAgICAgICAgICAgICAgICAgICAgaWYgKHQubGVuZ3RoID4gMCAmJiAhTGlzdFdyYXBwZXIuY29udGFpbnMoc3BsaXRzLCB0KSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAhU3RyaW5nV3JhcHBlci5jb250YWlucyh0LCBhdHRyTmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciByZSA9IC8oW146XSopKDoqKSguKikvZztcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBtID0gUmVnRXhwV3JhcHBlci5maXJzdE1hdGNoKHJlLCB0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc1ByZXNlbnQobSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcCA9IG1bMV0gKyBhdHRyTmFtZSArIG1bMl0gKyBtWzNdO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcDtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAuam9pbihzZXApO1xuICAgIH1cbiAgICByZXR1cm4gc2NvcGVkO1xuICB9XG5cbiAgcHJpdmF0ZSBfaW5zZXJ0UG9seWZpbGxIb3N0SW5Dc3NUZXh0KHNlbGVjdG9yOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHNlbGVjdG9yID0gU3RyaW5nV3JhcHBlci5yZXBsYWNlQWxsKHNlbGVjdG9yLCBfY29sb25Ib3N0Q29udGV4dFJlLCBfcG9seWZpbGxIb3N0Q29udGV4dCk7XG4gICAgc2VsZWN0b3IgPSBTdHJpbmdXcmFwcGVyLnJlcGxhY2VBbGwoc2VsZWN0b3IsIF9jb2xvbkhvc3RSZSwgX3BvbHlmaWxsSG9zdCk7XG4gICAgcmV0dXJuIHNlbGVjdG9yO1xuICB9XG59XG52YXIgX2Nzc0NvbnRlbnROZXh0U2VsZWN0b3JSZSA9XG4gICAgL3BvbHlmaWxsLW5leHQtc2VsZWN0b3JbXn1dKmNvbnRlbnQ6W1xcc10qP1snXCJdKC4qPylbJ1wiXVs7XFxzXSp9KFtee10qPyl7L2dpbTtcbnZhciBfY3NzQ29udGVudFJ1bGVSZSA9IC8ocG9seWZpbGwtcnVsZSlbXn1dKihjb250ZW50OltcXHNdKlsnXCJdKC4qPylbJ1wiXSlbO1xcc10qW159XSp9L2dpbTtcbnZhciBfY3NzQ29udGVudFVuc2NvcGVkUnVsZVJlID1cbiAgICAvKHBvbHlmaWxsLXVuc2NvcGVkLXJ1bGUpW159XSooY29udGVudDpbXFxzXSpbJ1wiXSguKj8pWydcIl0pWztcXHNdKltefV0qfS9naW07XG52YXIgX3BvbHlmaWxsSG9zdCA9ICctc2hhZG93Y3NzaG9zdCc7XG4vLyBub3RlOiA6aG9zdC1jb250ZXh0IHByZS1wcm9jZXNzZWQgdG8gLXNoYWRvd2Nzc2hvc3Rjb250ZXh0LlxudmFyIF9wb2x5ZmlsbEhvc3RDb250ZXh0ID0gJy1zaGFkb3djc3Njb250ZXh0JztcbnZhciBfcGFyZW5TdWZmaXggPSAnKSg/OlxcXFwoKCcgK1xuICAgICAgICAgICAgICAgICAgICcoPzpcXFxcKFteKShdKlxcXFwpfFteKShdKikrPycgK1xuICAgICAgICAgICAgICAgICAgICcpXFxcXCkpPyhbXix7XSopJztcbnZhciBfY3NzQ29sb25Ib3N0UmUgPSBSZWdFeHBXcmFwcGVyLmNyZWF0ZSgnKCcgKyBfcG9seWZpbGxIb3N0ICsgX3BhcmVuU3VmZml4LCAnaW0nKTtcbnZhciBfY3NzQ29sb25Ib3N0Q29udGV4dFJlID0gUmVnRXhwV3JhcHBlci5jcmVhdGUoJygnICsgX3BvbHlmaWxsSG9zdENvbnRleHQgKyBfcGFyZW5TdWZmaXgsICdpbScpO1xudmFyIF9wb2x5ZmlsbEhvc3ROb0NvbWJpbmF0b3IgPSBfcG9seWZpbGxIb3N0ICsgJy1uby1jb21iaW5hdG9yJztcbnZhciBfc2hhZG93RE9NU2VsZWN0b3JzUmUgPSBbXG4gIC8+Pj4vZyxcbiAgLzo6c2hhZG93L2csXG4gIC86OmNvbnRlbnQvZyxcbiAgLy8gRGVwcmVjYXRlZCBzZWxlY3RvcnNcbiAgLy8gVE9ETyh2aWNiKTogc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2NsYW5nLWZvcm1hdC9pc3N1ZXMvMTZcbiAgLy8gY2xhbmctZm9ybWF0IG9mZlxuICAvXFwvZGVlcFxcLy9nLCAgICAgICAgIC8vIGZvcm1lciA+Pj5cbiAgL1xcL3NoYWRvdy1kZWVwXFwvL2csICAvLyBmb3JtZXIgL2RlZXAvXG4gIC9cXC9zaGFkb3dcXC8vZywgICAgICAgLy8gZm9ybWVyIDo6c2hhZG93XG4gIC8vIGNsYW5mLWZvcm1hdCBvblxuXTtcbnZhciBfc2VsZWN0b3JSZVN1ZmZpeCA9ICcoWz5cXFxcc34rXFxbLix7Ol1bXFxcXHNcXFxcU10qKT8kJztcbnZhciBfcG9seWZpbGxIb3N0UmUgPSBSZWdFeHBXcmFwcGVyLmNyZWF0ZShfcG9seWZpbGxIb3N0LCAnaW0nKTtcbnZhciBfY29sb25Ib3N0UmUgPSAvOmhvc3QvZ2ltO1xudmFyIF9jb2xvbkhvc3RDb250ZXh0UmUgPSAvOmhvc3QtY29udGV4dC9naW07XG5cbnZhciBfY29tbWVudFJlID0gL1xcL1xcKltcXHNcXFNdKj9cXCpcXC8vZztcblxuZnVuY3Rpb24gc3RyaXBDb21tZW50cyhpbnB1dDpzdHJpbmcpOnN0cmluZyB7XG4gIHJldHVybiBTdHJpbmdXcmFwcGVyLnJlcGxhY2VBbGxNYXBwZWQoaW5wdXQsIF9jb21tZW50UmUsIChfKSA9PiAnJyk7XG59XG5cbnZhciBfcnVsZVJlID0gLyhcXHMqKShbXjtcXHtcXH1dKz8pKFxccyopKCg/OnslQkxPQ0slfT9cXHMqOz8pfCg/Olxccyo7KSkvZztcbnZhciBfY3VybHlSZSA9IC8oW3t9XSkvZztcbmNvbnN0IE9QRU5fQ1VSTFkgPSAneyc7XG5jb25zdCBDTE9TRV9DVVJMWSA9ICd9JztcbmNvbnN0IEJMT0NLX1BMQUNFSE9MREVSID0gJyVCTE9DSyUnO1xuXG5leHBvcnQgY2xhc3MgQ3NzUnVsZSB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBzZWxlY3RvcjpzdHJpbmcsIHB1YmxpYyBjb250ZW50OnN0cmluZykge31cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByb2Nlc3NSdWxlcyhpbnB1dDpzdHJpbmcsIHJ1bGVDYWxsYmFjazpGdW5jdGlvbik6c3RyaW5nIHtcbiAgdmFyIGlucHV0V2l0aEVzY2FwZWRCbG9ja3MgPSBlc2NhcGVCbG9ja3MoaW5wdXQpO1xuICB2YXIgbmV4dEJsb2NrSW5kZXggPSAwO1xuICByZXR1cm4gU3RyaW5nV3JhcHBlci5yZXBsYWNlQWxsTWFwcGVkKGlucHV0V2l0aEVzY2FwZWRCbG9ja3MuZXNjYXBlZFN0cmluZywgX3J1bGVSZSwgZnVuY3Rpb24obSkge1xuICAgIHZhciBzZWxlY3RvciA9IG1bMl07XG4gICAgdmFyIGNvbnRlbnQgPSAnJztcbiAgICB2YXIgc3VmZml4ID0gbVs0XTtcbiAgICB2YXIgY29udGVudFByZWZpeCA9ICcnO1xuICAgIGlmIChpc1ByZXNlbnQobVs0XSkgJiYgbVs0XS5zdGFydHNXaXRoKCd7JytCTE9DS19QTEFDRUhPTERFUikpIHtcbiAgICAgIGNvbnRlbnQgPSBpbnB1dFdpdGhFc2NhcGVkQmxvY2tzLmJsb2Nrc1tuZXh0QmxvY2tJbmRleCsrXTtcbiAgICAgIHN1ZmZpeCA9IG1bNF0uc3Vic3RyaW5nKEJMT0NLX1BMQUNFSE9MREVSLmxlbmd0aCsxKTtcbiAgICAgIGNvbnRlbnRQcmVmaXggPSAneyc7XG4gICAgfVxuICAgIHZhciBydWxlID0gcnVsZUNhbGxiYWNrKG5ldyBDc3NSdWxlKHNlbGVjdG9yLCBjb250ZW50KSk7XG4gICAgcmV0dXJuIGAke21bMV19JHtydWxlLnNlbGVjdG9yfSR7bVszXX0ke2NvbnRlbnRQcmVmaXh9JHtydWxlLmNvbnRlbnR9JHtzdWZmaXh9YDtcbiAgfSk7XG59XG5cbmNsYXNzIFN0cmluZ1dpdGhFc2NhcGVkQmxvY2tzIHtcbiAgY29uc3RydWN0b3IocHVibGljIGVzY2FwZWRTdHJpbmc6c3RyaW5nLCBwdWJsaWMgYmxvY2tzOnN0cmluZ1tdKSB7fVxufVxuXG5mdW5jdGlvbiBlc2NhcGVCbG9ja3MoaW5wdXQ6c3RyaW5nKTpTdHJpbmdXaXRoRXNjYXBlZEJsb2NrcyB7XG4gIHZhciBpbnB1dFBhcnRzID0gU3RyaW5nV3JhcHBlci5zcGxpdChpbnB1dCwgX2N1cmx5UmUpO1xuICB2YXIgcmVzdWx0UGFydHMgPSBbXTtcbiAgdmFyIGVzY2FwZWRCbG9ja3MgPSBbXTtcbiAgdmFyIGJyYWNrZXRDb3VudCA9IDA7XG4gIHZhciBjdXJyZW50QmxvY2tQYXJ0cyA9IFtdO1xuICBmb3IgKHZhciBwYXJ0SW5kZXggPSAwOyBwYXJ0SW5kZXg8aW5wdXRQYXJ0cy5sZW5ndGg7IHBhcnRJbmRleCsrKSB7XG4gICAgdmFyIHBhcnQgPSBpbnB1dFBhcnRzW3BhcnRJbmRleF07XG4gICAgaWYgKHBhcnQgPT0gQ0xPU0VfQ1VSTFkpIHtcbiAgICAgIGJyYWNrZXRDb3VudC0tO1xuICAgIH1cbiAgICBpZiAoYnJhY2tldENvdW50ID4gMCkge1xuICAgICAgY3VycmVudEJsb2NrUGFydHMucHVzaChwYXJ0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGN1cnJlbnRCbG9ja1BhcnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgZXNjYXBlZEJsb2Nrcy5wdXNoKGN1cnJlbnRCbG9ja1BhcnRzLmpvaW4oJycpKTtcbiAgICAgICAgcmVzdWx0UGFydHMucHVzaChCTE9DS19QTEFDRUhPTERFUik7XG4gICAgICAgIGN1cnJlbnRCbG9ja1BhcnRzID0gW107XG4gICAgICB9XG4gICAgICByZXN1bHRQYXJ0cy5wdXNoKHBhcnQpO1xuICAgIH1cbiAgICBpZiAocGFydCA9PSBPUEVOX0NVUkxZKSB7XG4gICAgICBicmFja2V0Q291bnQrKztcbiAgICB9XG4gIH1cbiAgaWYgKGN1cnJlbnRCbG9ja1BhcnRzLmxlbmd0aCA+IDApIHtcbiAgICBlc2NhcGVkQmxvY2tzLnB1c2goY3VycmVudEJsb2NrUGFydHMuam9pbignJykpO1xuICAgIHJlc3VsdFBhcnRzLnB1c2goQkxPQ0tfUExBQ0VIT0xERVIpO1xuICB9XG4gIHJldHVybiBuZXcgU3RyaW5nV2l0aEVzY2FwZWRCbG9ja3MocmVzdWx0UGFydHMuam9pbignJyksIGVzY2FwZWRCbG9ja3MpO1xufVxuIl19