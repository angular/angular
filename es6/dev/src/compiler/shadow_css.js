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
  dom inside the ShadowDOM. Polymer uses one of two techniques to imlement
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hhZG93X2Nzcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb21waWxlci9zaGFkb3dfY3NzLnRzIl0sIm5hbWVzIjpbIlNoYWRvd0NzcyIsIlNoYWRvd0Nzcy5jb25zdHJ1Y3RvciIsIlNoYWRvd0Nzcy5zaGltQ3NzVGV4dCIsIlNoYWRvd0Nzcy5faW5zZXJ0RGlyZWN0aXZlcyIsIlNoYWRvd0Nzcy5faW5zZXJ0UG9seWZpbGxEaXJlY3RpdmVzSW5Dc3NUZXh0IiwiU2hhZG93Q3NzLl9pbnNlcnRQb2x5ZmlsbFJ1bGVzSW5Dc3NUZXh0IiwiU2hhZG93Q3NzLl9zY29wZUNzc1RleHQiLCJTaGFkb3dDc3MuX2V4dHJhY3RVbnNjb3BlZFJ1bGVzRnJvbUNzc1RleHQiLCJTaGFkb3dDc3MuX2NvbnZlcnRDb2xvbkhvc3QiLCJTaGFkb3dDc3MuX2NvbnZlcnRDb2xvbkhvc3RDb250ZXh0IiwiU2hhZG93Q3NzLl9jb252ZXJ0Q29sb25SdWxlIiwiU2hhZG93Q3NzLl9jb2xvbkhvc3RDb250ZXh0UGFydFJlcGxhY2VyIiwiU2hhZG93Q3NzLl9jb2xvbkhvc3RQYXJ0UmVwbGFjZXIiLCJTaGFkb3dDc3MuX2NvbnZlcnRTaGFkb3dET01TZWxlY3RvcnMiLCJTaGFkb3dDc3MuX3Njb3BlU2VsZWN0b3JzIiwiU2hhZG93Q3NzLl9zY29wZVNlbGVjdG9yIiwiU2hhZG93Q3NzLl9zZWxlY3Rvck5lZWRzU2NvcGluZyIsIlNoYWRvd0Nzcy5fbWFrZVNjb3BlTWF0Y2hlciIsIlNoYWRvd0Nzcy5fYXBwbHlTZWxlY3RvclNjb3BlIiwiU2hhZG93Q3NzLl9hcHBseVNpbXBsZVNlbGVjdG9yU2NvcGUiLCJTaGFkb3dDc3MuX2FwcGx5U3RyaWN0U2VsZWN0b3JTY29wZSIsIlNoYWRvd0Nzcy5faW5zZXJ0UG9seWZpbGxIb3N0SW5Dc3NUZXh0Iiwic3RyaXBDb21tZW50cyIsIkNzc1J1bGUiLCJDc3NSdWxlLmNvbnN0cnVjdG9yIiwicHJvY2Vzc1J1bGVzIiwiU3RyaW5nV2l0aEVzY2FwZWRCbG9ja3MiLCJTdHJpbmdXaXRoRXNjYXBlZEJsb2Nrcy5jb25zdHJ1Y3RvciIsImVzY2FwZUJsb2NrcyJdLCJtYXBwaW5ncyI6Ik9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSxnQ0FBZ0M7T0FDbkQsRUFDTCxhQUFhLEVBRWIsYUFBYSxFQUNiLG9CQUFvQixFQUNwQixTQUFTLEVBQ1QsT0FBTyxFQUNSLE1BQU0sMEJBQTBCO0FBRWpDOzs7Ozs7Ozs7R0FTRztBQUVIOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztFQWlIRTtBQUVGO0lBR0VBO1FBRkFDLGtCQUFhQSxHQUFZQSxJQUFJQSxDQUFDQTtJQUVmQSxDQUFDQTtJQUVoQkQ7Ozs7Ozs7TUFPRUE7SUFDRkEsV0FBV0EsQ0FBQ0EsT0FBZUEsRUFBRUEsUUFBZ0JBLEVBQUVBLFlBQVlBLEdBQVdBLEVBQUVBO1FBQ3RFRSxPQUFPQSxHQUFHQSxhQUFhQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQTtRQUNqQ0EsT0FBT0EsR0FBR0EsSUFBSUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQTtRQUMxQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsT0FBT0EsRUFBRUEsUUFBUUEsRUFBRUEsWUFBWUEsQ0FBQ0EsQ0FBQ0E7SUFDN0RBLENBQUNBO0lBRU9GLGlCQUFpQkEsQ0FBQ0EsT0FBZUE7UUFDdkNHLE9BQU9BLEdBQUdBLElBQUlBLENBQUNBLGtDQUFrQ0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0E7UUFDM0RBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLDZCQUE2QkEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0E7SUFDckRBLENBQUNBO0lBRURIOzs7Ozs7Ozs7Ozs7O09BYUdBO0lBQ0tBLGtDQUFrQ0EsQ0FBQ0Es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Q0EsQ0FBQ0E7UUFDL0JBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLENBQUNBO1lBQ05BLEVBQUVBLENBQUNBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ2pDQSxhQUFhQSxDQUFDQSxJQUFJQSxDQUFDQSxpQkFBaUJBLENBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO2dCQUMvQ0EsV0FBV0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxDQUFDQTtnQkFDcENBLGlCQUFpQkEsR0FBR0EsRUFBRUEsQ0FBQ0E7WUFDekJBLENBQUNBO1lBQ0RBLFdBQVdBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ3pCQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxJQUFJQSxVQUFVQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN2QkEsWUFBWUEsRUFBRUEsQ0FBQ0E7UUFDakJBLENBQUNBO0lBQ0hBLENBQUNBO0lBQ0RBLEVBQUVBLENBQUNBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDakNBLGFBQWFBLENBQUNBLElBQUlBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDL0NBLFdBQVdBLENBQUNBLElBQUlBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsQ0FBQ0E7SUFDdENBLENBQUNBO0lBQ0RBLE1BQU1BLENBQUNBLElBQUlBLHVCQUF1QkEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsRUFBRUEsYUFBYUEsQ0FBQ0EsQ0FBQ0E7QUFDMUVBLENBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtMaXN0V3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7XG4gIFN0cmluZ1dyYXBwZXIsXG4gIFJlZ0V4cCxcbiAgUmVnRXhwV3JhcHBlcixcbiAgUmVnRXhwTWF0Y2hlcldyYXBwZXIsXG4gIGlzUHJlc2VudCxcbiAgaXNCbGFua1xufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuXG4vKipcbiAqIFRoaXMgZmlsZSBpcyBhIHBvcnQgb2Ygc2hhZG93Q1NTIGZyb20gd2ViY29tcG9uZW50cy5qcyB0byBUeXBlU2NyaXB0LlxuICpcbiAqIFBsZWFzZSBtYWtlIHN1cmUgdG8ga2VlcCB0byBlZGl0cyBpbiBzeW5jIHdpdGggdGhlIHNvdXJjZSBmaWxlLlxuICpcbiAqIFNvdXJjZTpcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS93ZWJjb21wb25lbnRzL3dlYmNvbXBvbmVudHNqcy9ibG9iLzRlZmVjZDdlMGUvc3JjL1NoYWRvd0NTUy9TaGFkb3dDU1MuanNcbiAqXG4gKiBUaGUgb3JpZ2luYWwgZmlsZSBsZXZlbCBjb21tZW50IGlzIHJlcHJvZHVjZWQgYmVsb3dcbiAqL1xuXG4vKlxuICBUaGlzIGlzIGEgbGltaXRlZCBzaGltIGZvciBTaGFkb3dET00gY3NzIHN0eWxpbmcuXG4gIGh0dHBzOi8vZHZjcy53My5vcmcvaGcvd2ViY29tcG9uZW50cy9yYXctZmlsZS90aXAvc3BlYy9zaGFkb3cvaW5kZXguaHRtbCNzdHlsZXNcblxuICBUaGUgaW50ZW50aW9uIGhlcmUgaXMgdG8gc3VwcG9ydCBvbmx5IHRoZSBzdHlsaW5nIGZlYXR1cmVzIHdoaWNoIGNhbiBiZVxuICByZWxhdGl2ZWx5IHNpbXBseSBpbXBsZW1lbnRlZC4gVGhlIGdvYWwgaXMgdG8gYWxsb3cgdXNlcnMgdG8gYXZvaWQgdGhlXG4gIG1vc3Qgb2J2aW91cyBwaXRmYWxscyBhbmQgZG8gc28gd2l0aG91dCBjb21wcm9taXNpbmcgcGVyZm9ybWFuY2Ugc2lnbmlmaWNhbnRseS5cbiAgRm9yIFNoYWRvd0RPTSBzdHlsaW5nIHRoYXQncyBub3QgY292ZXJlZCBoZXJlLCBhIHNldCBvZiBiZXN0IHByYWN0aWNlc1xuICBjYW4gYmUgcHJvdmlkZWQgdGhhdCBzaG91bGQgYWxsb3cgdXNlcnMgdG8gYWNjb21wbGlzaCBtb3JlIGNvbXBsZXggc3R5bGluZy5cblxuICBUaGUgZm9sbG93aW5nIGlzIGEgbGlzdCBvZiBzcGVjaWZpYyBTaGFkb3dET00gc3R5bGluZyBmZWF0dXJlcyBhbmQgYSBicmllZlxuICBkaXNjdXNzaW9uIG9mIHRoZSBhcHByb2FjaCB1c2VkIHRvIHNoaW0uXG5cbiAgU2hpbW1lZCBmZWF0dXJlczpcblxuICAqIDpob3N0LCA6aG9zdC1jb250ZXh0OiBTaGFkb3dET00gYWxsb3dzIHN0eWxpbmcgb2YgdGhlIHNoYWRvd1Jvb3QncyBob3N0XG4gIGVsZW1lbnQgdXNpbmcgdGhlIDpob3N0IHJ1bGUuIFRvIHNoaW0gdGhpcyBmZWF0dXJlLCB0aGUgOmhvc3Qgc3R5bGVzIGFyZVxuICByZWZvcm1hdHRlZCBhbmQgcHJlZml4ZWQgd2l0aCBhIGdpdmVuIHNjb3BlIG5hbWUgYW5kIHByb21vdGVkIHRvIGFcbiAgZG9jdW1lbnQgbGV2ZWwgc3R5bGVzaGVldC5cbiAgRm9yIGV4YW1wbGUsIGdpdmVuIGEgc2NvcGUgbmFtZSBvZiAuZm9vLCBhIHJ1bGUgbGlrZSB0aGlzOlxuXG4gICAgOmhvc3Qge1xuICAgICAgICBiYWNrZ3JvdW5kOiByZWQ7XG4gICAgICB9XG4gICAgfVxuXG4gIGJlY29tZXM6XG5cbiAgICAuZm9vIHtcbiAgICAgIGJhY2tncm91bmQ6IHJlZDtcbiAgICB9XG5cbiAgKiBlbmNhcHN1bHRpb246IFN0eWxlcyBkZWZpbmVkIHdpdGhpbiBTaGFkb3dET00sIGFwcGx5IG9ubHkgdG9cbiAgZG9tIGluc2lkZSB0aGUgU2hhZG93RE9NLiBQb2x5bWVyIHVzZXMgb25lIG9mIHR3byB0ZWNobmlxdWVzIHRvIGltbGVtZW50XG4gIHRoaXMgZmVhdHVyZS5cblxuICBCeSBkZWZhdWx0LCBydWxlcyBhcmUgcHJlZml4ZWQgd2l0aCB0aGUgaG9zdCBlbGVtZW50IHRhZyBuYW1lXG4gIGFzIGEgZGVzY2VuZGFudCBzZWxlY3Rvci4gVGhpcyBlbnN1cmVzIHN0eWxpbmcgZG9lcyBub3QgbGVhayBvdXQgb2YgdGhlICd0b3AnXG4gIG9mIHRoZSBlbGVtZW50J3MgU2hhZG93RE9NLiBGb3IgZXhhbXBsZSxcblxuICBkaXYge1xuICAgICAgZm9udC13ZWlnaHQ6IGJvbGQ7XG4gICAgfVxuXG4gIGJlY29tZXM6XG5cbiAgeC1mb28gZGl2IHtcbiAgICAgIGZvbnQtd2VpZ2h0OiBib2xkO1xuICAgIH1cblxuICBiZWNvbWVzOlxuXG5cbiAgQWx0ZXJuYXRpdmVseSwgaWYgV2ViQ29tcG9uZW50cy5TaGFkb3dDU1Muc3RyaWN0U3R5bGluZyBpcyBzZXQgdG8gdHJ1ZSB0aGVuXG4gIHNlbGVjdG9ycyBhcmUgc2NvcGVkIGJ5IGFkZGluZyBhbiBhdHRyaWJ1dGUgc2VsZWN0b3Igc3VmZml4IHRvIGVhY2hcbiAgc2ltcGxlIHNlbGVjdG9yIHRoYXQgY29udGFpbnMgdGhlIGhvc3QgZWxlbWVudCB0YWcgbmFtZS4gRWFjaCBlbGVtZW50XG4gIGluIHRoZSBlbGVtZW50J3MgU2hhZG93RE9NIHRlbXBsYXRlIGlzIGFsc28gZ2l2ZW4gdGhlIHNjb3BlIGF0dHJpYnV0ZS5cbiAgVGh1cywgdGhlc2UgcnVsZXMgbWF0Y2ggb25seSBlbGVtZW50cyB0aGF0IGhhdmUgdGhlIHNjb3BlIGF0dHJpYnV0ZS5cbiAgRm9yIGV4YW1wbGUsIGdpdmVuIGEgc2NvcGUgbmFtZSBvZiB4LWZvbywgYSBydWxlIGxpa2UgdGhpczpcblxuICAgIGRpdiB7XG4gICAgICBmb250LXdlaWdodDogYm9sZDtcbiAgICB9XG5cbiAgYmVjb21lczpcblxuICAgIGRpdlt4LWZvb10ge1xuICAgICAgZm9udC13ZWlnaHQ6IGJvbGQ7XG4gICAgfVxuXG4gIE5vdGUgdGhhdCBlbGVtZW50cyB0aGF0IGFyZSBkeW5hbWljYWxseSBhZGRlZCB0byBhIHNjb3BlIG11c3QgaGF2ZSB0aGUgc2NvcGVcbiAgc2VsZWN0b3IgYWRkZWQgdG8gdGhlbSBtYW51YWxseS5cblxuICAqIHVwcGVyL2xvd2VyIGJvdW5kIGVuY2Fwc3VsYXRpb246IFN0eWxlcyB3aGljaCBhcmUgZGVmaW5lZCBvdXRzaWRlIGFcbiAgc2hhZG93Um9vdCBzaG91bGQgbm90IGNyb3NzIHRoZSBTaGFkb3dET00gYm91bmRhcnkgYW5kIHNob3VsZCBub3QgYXBwbHlcbiAgaW5zaWRlIGEgc2hhZG93Um9vdC5cblxuICBUaGlzIHN0eWxpbmcgYmVoYXZpb3IgaXMgbm90IGVtdWxhdGVkLiBTb21lIHBvc3NpYmxlIHdheXMgdG8gZG8gdGhpcyB0aGF0XG4gIHdlcmUgcmVqZWN0ZWQgZHVlIHRvIGNvbXBsZXhpdHkgYW5kL29yIHBlcmZvcm1hbmNlIGNvbmNlcm5zIGluY2x1ZGU6ICgxKSByZXNldFxuICBldmVyeSBwb3NzaWJsZSBwcm9wZXJ0eSBmb3IgZXZlcnkgcG9zc2libGUgc2VsZWN0b3IgZm9yIGEgZ2l2ZW4gc2NvcGUgbmFtZTtcbiAgKDIpIHJlLWltcGxlbWVudCBjc3MgaW4gamF2YXNjcmlwdC5cblxuICBBcyBhbiBhbHRlcm5hdGl2ZSwgdXNlcnMgc2hvdWxkIG1ha2Ugc3VyZSB0byB1c2Ugc2VsZWN0b3JzXG4gIHNwZWNpZmljIHRvIHRoZSBzY29wZSBpbiB3aGljaCB0aGV5IGFyZSB3b3JraW5nLlxuXG4gICogOjpkaXN0cmlidXRlZDogVGhpcyBiZWhhdmlvciBpcyBub3QgZW11bGF0ZWQuIEl0J3Mgb2Z0ZW4gbm90IG5lY2Vzc2FyeVxuICB0byBzdHlsZSB0aGUgY29udGVudHMgb2YgYSBzcGVjaWZpYyBpbnNlcnRpb24gcG9pbnQgYW5kIGluc3RlYWQsIGRlc2NlbmRhbnRzXG4gIG9mIHRoZSBob3N0IGVsZW1lbnQgY2FuIGJlIHN0eWxlZCBzZWxlY3RpdmVseS4gVXNlcnMgY2FuIGFsc28gY3JlYXRlIGFuXG4gIGV4dHJhIG5vZGUgYXJvdW5kIGFuIGluc2VydGlvbiBwb2ludCBhbmQgc3R5bGUgdGhhdCBub2RlJ3MgY29udGVudHNcbiAgdmlhIGRlc2NlbmRlbnQgc2VsZWN0b3JzLiBGb3IgZXhhbXBsZSwgd2l0aCBhIHNoYWRvd1Jvb3QgbGlrZSB0aGlzOlxuXG4gICAgPHN0eWxlPlxuICAgICAgOjpjb250ZW50KGRpdikge1xuICAgICAgICBiYWNrZ3JvdW5kOiByZWQ7XG4gICAgICB9XG4gICAgPC9zdHlsZT5cbiAgICA8Y29udGVudD48L2NvbnRlbnQ+XG5cbiAgY291bGQgYmVjb21lOlxuXG4gICAgPHN0eWxlPlxuICAgICAgLyAqQHBvbHlmaWxsIC5jb250ZW50LWNvbnRhaW5lciBkaXYgKiAvXG4gICAgICA6OmNvbnRlbnQoZGl2KSB7XG4gICAgICAgIGJhY2tncm91bmQ6IHJlZDtcbiAgICAgIH1cbiAgICA8L3N0eWxlPlxuICAgIDxkaXYgY2xhc3M9XCJjb250ZW50LWNvbnRhaW5lclwiPlxuICAgICAgPGNvbnRlbnQ+PC9jb250ZW50PlxuICAgIDwvZGl2PlxuXG4gIE5vdGUgdGhlIHVzZSBvZiBAcG9seWZpbGwgaW4gdGhlIGNvbW1lbnQgYWJvdmUgYSBTaGFkb3dET00gc3BlY2lmaWMgc3R5bGVcbiAgZGVjbGFyYXRpb24uIFRoaXMgaXMgYSBkaXJlY3RpdmUgdG8gdGhlIHN0eWxpbmcgc2hpbSB0byB1c2UgdGhlIHNlbGVjdG9yXG4gIGluIGNvbW1lbnRzIGluIGxpZXUgb2YgdGhlIG5leHQgc2VsZWN0b3Igd2hlbiBydW5uaW5nIHVuZGVyIHBvbHlmaWxsLlxuKi9cblxuZXhwb3J0IGNsYXNzIFNoYWRvd0NzcyB7XG4gIHN0cmljdFN0eWxpbmc6IGJvb2xlYW4gPSB0cnVlO1xuXG4gIGNvbnN0cnVjdG9yKCkge31cblxuICAvKlxuICAqIFNoaW0gc29tZSBjc3NUZXh0IHdpdGggdGhlIGdpdmVuIHNlbGVjdG9yLiBSZXR1cm5zIGNzc1RleHQgdGhhdCBjYW5cbiAgKiBiZSBpbmNsdWRlZCBpbiB0aGUgZG9jdW1lbnQgdmlhIFdlYkNvbXBvbmVudHMuU2hhZG93Q1NTLmFkZENzc1RvRG9jdW1lbnQoY3NzKS5cbiAgKlxuICAqIFdoZW4gc3RyaWN0U3R5bGluZyBpcyB0cnVlOlxuICAqIC0gc2VsZWN0b3IgaXMgdGhlIGF0dHJpYnV0ZSBhZGRlZCB0byBhbGwgZWxlbWVudHMgaW5zaWRlIHRoZSBob3N0LFxuICAqIC0gaG9zdFNlbGVjdG9yIGlzIHRoZSBhdHRyaWJ1dGUgYWRkZWQgdG8gdGhlIGhvc3QgaXRzZWxmLlxuICAqL1xuICBzaGltQ3NzVGV4dChjc3NUZXh0OiBzdHJpbmcsIHNlbGVjdG9yOiBzdHJpbmcsIGhvc3RTZWxlY3Rvcjogc3RyaW5nID0gJycpOiBzdHJpbmcge1xuICAgIGNzc1RleHQgPSBzdHJpcENvbW1lbnRzKGNzc1RleHQpO1xuICAgIGNzc1RleHQgPSB0aGlzLl9pbnNlcnREaXJlY3RpdmVzKGNzc1RleHQpO1xuICAgIHJldHVybiB0aGlzLl9zY29wZUNzc1RleHQoY3NzVGV4dCwgc2VsZWN0b3IsIGhvc3RTZWxlY3Rvcik7XG4gIH1cblxuICBwcml2YXRlIF9pbnNlcnREaXJlY3RpdmVzKGNzc1RleHQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgY3NzVGV4dCA9IHRoaXMuX2luc2VydFBvbHlmaWxsRGlyZWN0aXZlc0luQ3NzVGV4dChjc3NUZXh0KTtcbiAgICByZXR1cm4gdGhpcy5faW5zZXJ0UG9seWZpbGxSdWxlc0luQ3NzVGV4dChjc3NUZXh0KTtcbiAgfVxuXG4gIC8qXG4gICAqIFByb2Nlc3Mgc3R5bGVzIHRvIGNvbnZlcnQgbmF0aXZlIFNoYWRvd0RPTSBydWxlcyB0aGF0IHdpbGwgdHJpcFxuICAgKiB1cCB0aGUgY3NzIHBhcnNlcjsgd2UgcmVseSBvbiBkZWNvcmF0aW5nIHRoZSBzdHlsZXNoZWV0IHdpdGggaW5lcnQgcnVsZXMuXG4gICAqXG4gICAqIEZvciBleGFtcGxlLCB3ZSBjb252ZXJ0IHRoaXMgcnVsZTpcbiAgICpcbiAgICogcG9seWZpbGwtbmV4dC1zZWxlY3RvciB7IGNvbnRlbnQ6ICc6aG9zdCBtZW51LWl0ZW0nOyB9XG4gICAqIDo6Y29udGVudCBtZW51LWl0ZW0ge1xuICAgKlxuICAgKiB0byB0aGlzOlxuICAgKlxuICAgKiBzY29wZU5hbWUgbWVudS1pdGVtIHtcbiAgICpcbiAgKiovXG4gIHByaXZhdGUgX2luc2VydFBvbHlmaWxsRGlyZWN0aXZlc0luQ3NzVGV4dChjc3NUZXh0OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIC8vIERpZmZlcmVuY2Ugd2l0aCB3ZWJjb21wb25lbnRzLmpzOiBkb2VzIG5vdCBoYW5kbGUgY29tbWVudHNcbiAgICByZXR1cm4gU3RyaW5nV3JhcHBlci5yZXBsYWNlQWxsTWFwcGVkKGNzc1RleHQsIF9jc3NDb250ZW50TmV4dFNlbGVjdG9yUmUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbihtKSB7IHJldHVybiBtWzFdICsgJ3snOyB9KTtcbiAgfVxuXG4gIC8qXG4gICAqIFByb2Nlc3Mgc3R5bGVzIHRvIGFkZCBydWxlcyB3aGljaCB3aWxsIG9ubHkgYXBwbHkgdW5kZXIgdGhlIHBvbHlmaWxsXG4gICAqXG4gICAqIEZvciBleGFtcGxlLCB3ZSBjb252ZXJ0IHRoaXMgcnVsZTpcbiAgICpcbiAgICogcG9seWZpbGwtcnVsZSB7XG4gICAqICAgY29udGVudDogJzpob3N0IG1lbnUtaXRlbSc7XG4gICAqIC4uLlxuICAgKiB9XG4gICAqXG4gICAqIHRvIHRoaXM6XG4gICAqXG4gICAqIHNjb3BlTmFtZSBtZW51LWl0ZW0gey4uLn1cbiAgICpcbiAgKiovXG4gIHByaXZhdGUgX2luc2VydFBvbHlmaWxsUnVsZXNJbkNzc1RleHQoY3NzVGV4dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAvLyBEaWZmZXJlbmNlIHdpdGggd2ViY29tcG9uZW50cy5qczogZG9lcyBub3QgaGFuZGxlIGNvbW1lbnRzXG4gICAgcmV0dXJuIFN0cmluZ1dyYXBwZXIucmVwbGFjZUFsbE1hcHBlZChjc3NUZXh0LCBfY3NzQ29udGVudFJ1bGVSZSwgZnVuY3Rpb24obSkge1xuICAgICAgdmFyIHJ1bGUgPSBtWzBdO1xuICAgICAgcnVsZSA9IFN0cmluZ1dyYXBwZXIucmVwbGFjZShydWxlLCBtWzFdLCAnJyk7XG4gICAgICBydWxlID0gU3RyaW5nV3JhcHBlci5yZXBsYWNlKHJ1bGUsIG1bMl0sICcnKTtcbiAgICAgIHJldHVybiBtWzNdICsgcnVsZTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qIEVuc3VyZSBzdHlsZXMgYXJlIHNjb3BlZC4gUHNldWRvLXNjb3BpbmcgdGFrZXMgYSBydWxlIGxpa2U6XG4gICAqXG4gICAqICAuZm9vIHsuLi4gfVxuICAgKlxuICAgKiAgYW5kIGNvbnZlcnRzIHRoaXMgdG9cbiAgICpcbiAgICogIHNjb3BlTmFtZSAuZm9vIHsgLi4uIH1cbiAgKi9cbiAgcHJpdmF0ZSBfc2NvcGVDc3NUZXh0KGNzc1RleHQ6IHN0cmluZywgc2NvcGVTZWxlY3Rvcjogc3RyaW5nLCBob3N0U2VsZWN0b3I6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgdmFyIHVuc2NvcGVkID0gdGhpcy5fZXh0cmFjdFVuc2NvcGVkUnVsZXNGcm9tQ3NzVGV4dChjc3NUZXh0KTtcbiAgICBjc3NUZXh0ID0gdGhpcy5faW5zZXJ0UG9seWZpbGxIb3N0SW5Dc3NUZXh0KGNzc1RleHQpO1xuICAgIGNzc1RleHQgPSB0aGlzLl9jb252ZXJ0Q29sb25Ib3N0KGNzc1RleHQpO1xuICAgIGNzc1RleHQgPSB0aGlzLl9jb252ZXJ0Q29sb25Ib3N0Q29udGV4dChjc3NUZXh0KTtcbiAgICBjc3NUZXh0ID0gdGhpcy5fY29udmVydFNoYWRvd0RPTVNlbGVjdG9ycyhjc3NUZXh0KTtcbiAgICBpZiAoaXNQcmVzZW50KHNjb3BlU2VsZWN0b3IpKSB7XG4gICAgICBjc3NUZXh0ID0gdGhpcy5fc2NvcGVTZWxlY3RvcnMoY3NzVGV4dCwgc2NvcGVTZWxlY3RvciwgaG9zdFNlbGVjdG9yKTtcbiAgICB9XG4gICAgY3NzVGV4dCA9IGNzc1RleHQgKyAnXFxuJyArIHVuc2NvcGVkO1xuICAgIHJldHVybiBjc3NUZXh0LnRyaW0oKTtcbiAgfVxuXG4gIC8qXG4gICAqIFByb2Nlc3Mgc3R5bGVzIHRvIGFkZCBydWxlcyB3aGljaCB3aWxsIG9ubHkgYXBwbHkgdW5kZXIgdGhlIHBvbHlmaWxsXG4gICAqIGFuZCBkbyBub3QgcHJvY2VzcyB2aWEgQ1NTT00uIChDU1NPTSBpcyBkZXN0cnVjdGl2ZSB0byBydWxlcyBvbiByYXJlXG4gICAqIG9jY2FzaW9ucywgZS5nLiAtd2Via2l0LWNhbGMgb24gU2FmYXJpLilcbiAgICogRm9yIGV4YW1wbGUsIHdlIGNvbnZlcnQgdGhpcyBydWxlOlxuICAgKlxuICAgKiBAcG9seWZpbGwtdW5zY29wZWQtcnVsZSB7XG4gICAqICAgY29udGVudDogJ21lbnUtaXRlbSc7XG4gICAqIC4uLiB9XG4gICAqXG4gICAqIHRvIHRoaXM6XG4gICAqXG4gICAqIG1lbnUtaXRlbSB7Li4ufVxuICAgKlxuICAqKi9cbiAgcHJpdmF0ZSBfZXh0cmFjdFVuc2NvcGVkUnVsZXNGcm9tQ3NzVGV4dChjc3NUZXh0OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIC8vIERpZmZlcmVuY2Ugd2l0aCB3ZWJjb21wb25lbnRzLmpzOiBkb2VzIG5vdCBoYW5kbGUgY29tbWVudHNcbiAgICB2YXIgciA9ICcnLCBtO1xuICAgIHZhciBtYXRjaGVyID0gUmVnRXhwV3JhcHBlci5tYXRjaGVyKF9jc3NDb250ZW50VW5zY29wZWRSdWxlUmUsIGNzc1RleHQpO1xuICAgIHdoaWxlIChpc1ByZXNlbnQobSA9IFJlZ0V4cE1hdGNoZXJXcmFwcGVyLm5leHQobWF0Y2hlcikpKSB7XG4gICAgICB2YXIgcnVsZSA9IG1bMF07XG4gICAgICBydWxlID0gU3RyaW5nV3JhcHBlci5yZXBsYWNlKHJ1bGUsIG1bMl0sICcnKTtcbiAgICAgIHJ1bGUgPSBTdHJpbmdXcmFwcGVyLnJlcGxhY2UocnVsZSwgbVsxXSwgbVszXSk7XG4gICAgICByICs9IHJ1bGUgKyAnXFxuXFxuJztcbiAgICB9XG4gICAgcmV0dXJuIHI7XG4gIH1cblxuICAvKlxuICAgKiBjb252ZXJ0IGEgcnVsZSBsaWtlIDpob3N0KC5mb28pID4gLmJhciB7IH1cbiAgICpcbiAgICogdG9cbiAgICpcbiAgICogc2NvcGVOYW1lLmZvbyA+IC5iYXJcbiAgKi9cbiAgcHJpdmF0ZSBfY29udmVydENvbG9uSG9zdChjc3NUZXh0OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9jb252ZXJ0Q29sb25SdWxlKGNzc1RleHQsIF9jc3NDb2xvbkhvc3RSZSwgdGhpcy5fY29sb25Ib3N0UGFydFJlcGxhY2VyKTtcbiAgfVxuXG4gIC8qXG4gICAqIGNvbnZlcnQgYSBydWxlIGxpa2UgOmhvc3QtY29udGV4dCguZm9vKSA+IC5iYXIgeyB9XG4gICAqXG4gICAqIHRvXG4gICAqXG4gICAqIHNjb3BlTmFtZS5mb28gPiAuYmFyLCAuZm9vIHNjb3BlTmFtZSA+IC5iYXIgeyB9XG4gICAqXG4gICAqIGFuZFxuICAgKlxuICAgKiA6aG9zdC1jb250ZXh0KC5mb286aG9zdCkgLmJhciB7IC4uLiB9XG4gICAqXG4gICAqIHRvXG4gICAqXG4gICAqIHNjb3BlTmFtZS5mb28gLmJhciB7IC4uLiB9XG4gICovXG4gIHByaXZhdGUgX2NvbnZlcnRDb2xvbkhvc3RDb250ZXh0KGNzc1RleHQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbnZlcnRDb2xvblJ1bGUoY3NzVGV4dCwgX2Nzc0NvbG9uSG9zdENvbnRleHRSZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9jb2xvbkhvc3RDb250ZXh0UGFydFJlcGxhY2VyKTtcbiAgfVxuXG4gIHByaXZhdGUgX2NvbnZlcnRDb2xvblJ1bGUoY3NzVGV4dDogc3RyaW5nLCByZWdFeHA6IFJlZ0V4cCwgcGFydFJlcGxhY2VyOiBGdW5jdGlvbik6IHN0cmluZyB7XG4gICAgLy8gcDEgPSA6aG9zdCwgcDIgPSBjb250ZW50cyBvZiAoKSwgcDMgcmVzdCBvZiBydWxlXG4gICAgcmV0dXJuIFN0cmluZ1dyYXBwZXIucmVwbGFjZUFsbE1hcHBlZChjc3NUZXh0LCByZWdFeHAsIGZ1bmN0aW9uKG0pIHtcbiAgICAgIGlmIChpc1ByZXNlbnQobVsyXSkpIHtcbiAgICAgICAgdmFyIHBhcnRzID0gbVsyXS5zcGxpdCgnLCcpLCByID0gW107XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGFydHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICB2YXIgcCA9IHBhcnRzW2ldO1xuICAgICAgICAgIGlmIChpc0JsYW5rKHApKSBicmVhaztcbiAgICAgICAgICBwID0gcC50cmltKCk7XG4gICAgICAgICAgci5wdXNoKHBhcnRSZXBsYWNlcihfcG9seWZpbGxIb3N0Tm9Db21iaW5hdG9yLCBwLCBtWzNdKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHIuam9pbignLCcpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIF9wb2x5ZmlsbEhvc3ROb0NvbWJpbmF0b3IgKyBtWzNdO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfY29sb25Ib3N0Q29udGV4dFBhcnRSZXBsYWNlcihob3N0OiBzdHJpbmcsIHBhcnQ6IHN0cmluZywgc3VmZml4OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGlmIChTdHJpbmdXcmFwcGVyLmNvbnRhaW5zKHBhcnQsIF9wb2x5ZmlsbEhvc3QpKSB7XG4gICAgICByZXR1cm4gdGhpcy5fY29sb25Ib3N0UGFydFJlcGxhY2VyKGhvc3QsIHBhcnQsIHN1ZmZpeCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBob3N0ICsgcGFydCArIHN1ZmZpeCArICcsICcgKyBwYXJ0ICsgJyAnICsgaG9zdCArIHN1ZmZpeDtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9jb2xvbkhvc3RQYXJ0UmVwbGFjZXIoaG9zdDogc3RyaW5nLCBwYXJ0OiBzdHJpbmcsIHN1ZmZpeDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gaG9zdCArIFN0cmluZ1dyYXBwZXIucmVwbGFjZShwYXJ0LCBfcG9seWZpbGxIb3N0LCAnJykgKyBzdWZmaXg7XG4gIH1cblxuICAvKlxuICAgKiBDb252ZXJ0IGNvbWJpbmF0b3JzIGxpa2UgOjpzaGFkb3cgYW5kIHBzZXVkby1lbGVtZW50cyBsaWtlIDo6Y29udGVudFxuICAgKiBieSByZXBsYWNpbmcgd2l0aCBzcGFjZS5cbiAgKi9cbiAgcHJpdmF0ZSBfY29udmVydFNoYWRvd0RPTVNlbGVjdG9ycyhjc3NUZXh0OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgX3NoYWRvd0RPTVNlbGVjdG9yc1JlLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjc3NUZXh0ID0gU3RyaW5nV3JhcHBlci5yZXBsYWNlQWxsKGNzc1RleHQsIF9zaGFkb3dET01TZWxlY3RvcnNSZVtpXSwgJyAnKTtcbiAgICB9XG4gICAgcmV0dXJuIGNzc1RleHQ7XG4gIH1cblxuICAvLyBjaGFuZ2UgYSBzZWxlY3RvciBsaWtlICdkaXYnIHRvICduYW1lIGRpdidcbiAgcHJpdmF0ZSBfc2NvcGVTZWxlY3RvcnMoY3NzVGV4dDogc3RyaW5nLCBzY29wZVNlbGVjdG9yOiBzdHJpbmcsIGhvc3RTZWxlY3Rvcjogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gcHJvY2Vzc1J1bGVzKGNzc1RleHQsIChydWxlOiBDc3NSdWxlKSA9PiB7XG4gICAgICB2YXIgc2VsZWN0b3IgPSBydWxlLnNlbGVjdG9yO1xuICAgICAgdmFyIGNvbnRlbnQgPSBydWxlLmNvbnRlbnQ7XG4gICAgICBpZiAocnVsZS5zZWxlY3RvclswXSAhPSAnQCcgfHwgcnVsZS5zZWxlY3Rvci5zdGFydHNXaXRoKCdAcGFnZScpKSB7XG4gICAgICAgIHNlbGVjdG9yID1cbiAgICAgICAgICAgIHRoaXMuX3Njb3BlU2VsZWN0b3IocnVsZS5zZWxlY3Rvciwgc2NvcGVTZWxlY3RvciwgaG9zdFNlbGVjdG9yLCB0aGlzLnN0cmljdFN0eWxpbmcpO1xuICAgICAgfSBlbHNlIGlmIChydWxlLnNlbGVjdG9yLnN0YXJ0c1dpdGgoJ0BtZWRpYScpKSB7XG4gICAgICAgIGNvbnRlbnQgPSB0aGlzLl9zY29wZVNlbGVjdG9ycyhydWxlLmNvbnRlbnQsIHNjb3BlU2VsZWN0b3IsIGhvc3RTZWxlY3Rvcik7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IENzc1J1bGUoc2VsZWN0b3IsIGNvbnRlbnQpO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfc2NvcGVTZWxlY3RvcihzZWxlY3Rvcjogc3RyaW5nLCBzY29wZVNlbGVjdG9yOiBzdHJpbmcsIGhvc3RTZWxlY3Rvcjogc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgIHN0cmljdDogYm9vbGVhbik6IHN0cmluZyB7XG4gICAgdmFyIHIgPSBbXSwgcGFydHMgPSBzZWxlY3Rvci5zcGxpdCgnLCcpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGFydHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBwID0gcGFydHNbaV07XG4gICAgICBwID0gcC50cmltKCk7XG4gICAgICBpZiAodGhpcy5fc2VsZWN0b3JOZWVkc1Njb3BpbmcocCwgc2NvcGVTZWxlY3RvcikpIHtcbiAgICAgICAgcCA9IHN0cmljdCAmJiAhU3RyaW5nV3JhcHBlci5jb250YWlucyhwLCBfcG9seWZpbGxIb3N0Tm9Db21iaW5hdG9yKSA/XG4gICAgICAgICAgICAgICAgdGhpcy5fYXBwbHlTdHJpY3RTZWxlY3RvclNjb3BlKHAsIHNjb3BlU2VsZWN0b3IpIDpcbiAgICAgICAgICAgICAgICB0aGlzLl9hcHBseVNlbGVjdG9yU2NvcGUocCwgc2NvcGVTZWxlY3RvciwgaG9zdFNlbGVjdG9yKTtcbiAgICAgIH1cbiAgICAgIHIucHVzaChwKTtcbiAgICB9XG4gICAgcmV0dXJuIHIuam9pbignLCAnKTtcbiAgfVxuXG4gIHByaXZhdGUgX3NlbGVjdG9yTmVlZHNTY29waW5nKHNlbGVjdG9yOiBzdHJpbmcsIHNjb3BlU2VsZWN0b3I6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHZhciByZSA9IHRoaXMuX21ha2VTY29wZU1hdGNoZXIoc2NvcGVTZWxlY3Rvcik7XG4gICAgcmV0dXJuICFpc1ByZXNlbnQoUmVnRXhwV3JhcHBlci5maXJzdE1hdGNoKHJlLCBzZWxlY3RvcikpO1xuICB9XG5cbiAgcHJpdmF0ZSBfbWFrZVNjb3BlTWF0Y2hlcihzY29wZVNlbGVjdG9yOiBzdHJpbmcpOiBSZWdFeHAge1xuICAgIHZhciBscmUgPSAvXFxbL2c7XG4gICAgdmFyIHJyZSA9IC9cXF0vZztcbiAgICBzY29wZVNlbGVjdG9yID0gU3RyaW5nV3JhcHBlci5yZXBsYWNlQWxsKHNjb3BlU2VsZWN0b3IsIGxyZSwgJ1xcXFxbJyk7XG4gICAgc2NvcGVTZWxlY3RvciA9IFN0cmluZ1dyYXBwZXIucmVwbGFjZUFsbChzY29wZVNlbGVjdG9yLCBycmUsICdcXFxcXScpO1xuICAgIHJldHVybiBSZWdFeHBXcmFwcGVyLmNyZWF0ZSgnXignICsgc2NvcGVTZWxlY3RvciArICcpJyArIF9zZWxlY3RvclJlU3VmZml4LCAnbScpO1xuICB9XG5cbiAgcHJpdmF0ZSBfYXBwbHlTZWxlY3RvclNjb3BlKHNlbGVjdG9yOiBzdHJpbmcsIHNjb3BlU2VsZWN0b3I6IHN0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhvc3RTZWxlY3Rvcjogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAvLyBEaWZmZXJlbmNlIGZyb20gd2ViY29tcG9uZW50c2pzOiBzY29wZVNlbGVjdG9yIGNvdWxkIG5vdCBiZSBhbiBhcnJheVxuICAgIHJldHVybiB0aGlzLl9hcHBseVNpbXBsZVNlbGVjdG9yU2NvcGUoc2VsZWN0b3IsIHNjb3BlU2VsZWN0b3IsIGhvc3RTZWxlY3Rvcik7XG4gIH1cblxuICAvLyBzY29wZSB2aWEgbmFtZSBhbmQgW2lzPW5hbWVdXG4gIHByaXZhdGUgX2FwcGx5U2ltcGxlU2VsZWN0b3JTY29wZShzZWxlY3Rvcjogc3RyaW5nLCBzY29wZVNlbGVjdG9yOiBzdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBob3N0U2VsZWN0b3I6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgaWYgKGlzUHJlc2VudChSZWdFeHBXcmFwcGVyLmZpcnN0TWF0Y2goX3BvbHlmaWxsSG9zdFJlLCBzZWxlY3RvcikpKSB7XG4gICAgICB2YXIgcmVwbGFjZUJ5ID0gdGhpcy5zdHJpY3RTdHlsaW5nID8gYFske2hvc3RTZWxlY3Rvcn1dYCA6IHNjb3BlU2VsZWN0b3I7XG4gICAgICBzZWxlY3RvciA9IFN0cmluZ1dyYXBwZXIucmVwbGFjZShzZWxlY3RvciwgX3BvbHlmaWxsSG9zdE5vQ29tYmluYXRvciwgcmVwbGFjZUJ5KTtcbiAgICAgIHJldHVybiBTdHJpbmdXcmFwcGVyLnJlcGxhY2VBbGwoc2VsZWN0b3IsIF9wb2x5ZmlsbEhvc3RSZSwgcmVwbGFjZUJ5ICsgJyAnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHNjb3BlU2VsZWN0b3IgKyAnICcgKyBzZWxlY3RvcjtcbiAgICB9XG4gIH1cblxuICAvLyByZXR1cm4gYSBzZWxlY3RvciB3aXRoIFtuYW1lXSBzdWZmaXggb24gZWFjaCBzaW1wbGUgc2VsZWN0b3JcbiAgLy8gZS5nLiAuZm9vLmJhciA+IC56b3QgYmVjb21lcyAuZm9vW25hbWVdLmJhcltuYW1lXSA+IC56b3RbbmFtZV0gIC8qKiBAaW50ZXJuYWwgKi9cbiAgcHJpdmF0ZSBfYXBwbHlTdHJpY3RTZWxlY3RvclNjb3BlKHNlbGVjdG9yOiBzdHJpbmcsIHNjb3BlU2VsZWN0b3I6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgdmFyIGlzUmUgPSAvXFxbaXM9KFteXFxdXSopXFxdL2c7XG4gICAgc2NvcGVTZWxlY3RvciA9IFN0cmluZ1dyYXBwZXIucmVwbGFjZUFsbE1hcHBlZChzY29wZVNlbGVjdG9yLCBpc1JlLCAobSkgPT4gbVsxXSk7XG4gICAgdmFyIHNwbGl0cyA9IFsnICcsICc+JywgJysnLCAnfiddLCBzY29wZWQgPSBzZWxlY3RvciwgYXR0ck5hbWUgPSAnWycgKyBzY29wZVNlbGVjdG9yICsgJ10nO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3BsaXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgc2VwID0gc3BsaXRzW2ldO1xuICAgICAgdmFyIHBhcnRzID0gc2NvcGVkLnNwbGl0KHNlcCk7XG4gICAgICBzY29wZWQgPSBwYXJ0cy5tYXAocCA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgLy8gcmVtb3ZlIDpob3N0IHNpbmNlIGl0IHNob3VsZCBiZSB1bm5lY2Vzc2FyeVxuICAgICAgICAgICAgICAgICAgICAgIHZhciB0ID0gU3RyaW5nV3JhcHBlci5yZXBsYWNlQWxsKHAudHJpbSgpLCBfcG9seWZpbGxIb3N0UmUsICcnKTtcbiAgICAgICAgICAgICAgICAgICAgICBpZiAodC5sZW5ndGggPiAwICYmICFMaXN0V3JhcHBlci5jb250YWlucyhzcGxpdHMsIHQpICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICFTdHJpbmdXcmFwcGVyLmNvbnRhaW5zKHQsIGF0dHJOYW1lKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlID0gLyhbXjpdKikoOiopKC4qKS9nO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG0gPSBSZWdFeHBXcmFwcGVyLmZpcnN0TWF0Y2gocmUsIHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlzUHJlc2VudChtKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBwID0gbVsxXSArIGF0dHJOYW1lICsgbVsyXSArIG1bM107XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgIC5qb2luKHNlcCk7XG4gICAgfVxuICAgIHJldHVybiBzY29wZWQ7XG4gIH1cblxuICBwcml2YXRlIF9pbnNlcnRQb2x5ZmlsbEhvc3RJbkNzc1RleHQoc2VsZWN0b3I6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgc2VsZWN0b3IgPSBTdHJpbmdXcmFwcGVyLnJlcGxhY2VBbGwoc2VsZWN0b3IsIF9jb2xvbkhvc3RDb250ZXh0UmUsIF9wb2x5ZmlsbEhvc3RDb250ZXh0KTtcbiAgICBzZWxlY3RvciA9IFN0cmluZ1dyYXBwZXIucmVwbGFjZUFsbChzZWxlY3RvciwgX2NvbG9uSG9zdFJlLCBfcG9seWZpbGxIb3N0KTtcbiAgICByZXR1cm4gc2VsZWN0b3I7XG4gIH1cbn1cbnZhciBfY3NzQ29udGVudE5leHRTZWxlY3RvclJlID1cbiAgICAvcG9seWZpbGwtbmV4dC1zZWxlY3RvcltefV0qY29udGVudDpbXFxzXSo/WydcIl0oLio/KVsnXCJdWztcXHNdKn0oW157XSo/KXsvZ2ltO1xudmFyIF9jc3NDb250ZW50UnVsZVJlID0gLyhwb2x5ZmlsbC1ydWxlKVtefV0qKGNvbnRlbnQ6W1xcc10qWydcIl0oLio/KVsnXCJdKVs7XFxzXSpbXn1dKn0vZ2ltO1xudmFyIF9jc3NDb250ZW50VW5zY29wZWRSdWxlUmUgPVxuICAgIC8ocG9seWZpbGwtdW5zY29wZWQtcnVsZSlbXn1dKihjb250ZW50OltcXHNdKlsnXCJdKC4qPylbJ1wiXSlbO1xcc10qW159XSp9L2dpbTtcbnZhciBfcG9seWZpbGxIb3N0ID0gJy1zaGFkb3djc3Nob3N0Jztcbi8vIG5vdGU6IDpob3N0LWNvbnRleHQgcHJlLXByb2Nlc3NlZCB0byAtc2hhZG93Y3NzaG9zdGNvbnRleHQuXG52YXIgX3BvbHlmaWxsSG9zdENvbnRleHQgPSAnLXNoYWRvd2Nzc2NvbnRleHQnO1xudmFyIF9wYXJlblN1ZmZpeCA9ICcpKD86XFxcXCgoJyArXG4gICAgICAgICAgICAgICAgICAgJyg/OlxcXFwoW14pKF0qXFxcXCl8W14pKF0qKSs/JyArXG4gICAgICAgICAgICAgICAgICAgJylcXFxcKSk/KFteLHtdKiknO1xudmFyIF9jc3NDb2xvbkhvc3RSZSA9IFJlZ0V4cFdyYXBwZXIuY3JlYXRlKCcoJyArIF9wb2x5ZmlsbEhvc3QgKyBfcGFyZW5TdWZmaXgsICdpbScpO1xudmFyIF9jc3NDb2xvbkhvc3RDb250ZXh0UmUgPSBSZWdFeHBXcmFwcGVyLmNyZWF0ZSgnKCcgKyBfcG9seWZpbGxIb3N0Q29udGV4dCArIF9wYXJlblN1ZmZpeCwgJ2ltJyk7XG52YXIgX3BvbHlmaWxsSG9zdE5vQ29tYmluYXRvciA9IF9wb2x5ZmlsbEhvc3QgKyAnLW5vLWNvbWJpbmF0b3InO1xudmFyIF9zaGFkb3dET01TZWxlY3RvcnNSZSA9IFtcbiAgLz4+Pi9nLFxuICAvOjpzaGFkb3cvZyxcbiAgLzo6Y29udGVudC9nLFxuICAvLyBEZXByZWNhdGVkIHNlbGVjdG9yc1xuICAvLyBUT0RPKHZpY2IpOiBzZWUgaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvY2xhbmctZm9ybWF0L2lzc3Vlcy8xNlxuICAvLyBjbGFuZy1mb3JtYXQgb2ZmXG4gIC9cXC9kZWVwXFwvL2csICAgICAgICAgLy8gZm9ybWVyID4+PlxuICAvXFwvc2hhZG93LWRlZXBcXC8vZywgIC8vIGZvcm1lciAvZGVlcC9cbiAgL1xcL3NoYWRvd1xcLy9nLCAgICAgICAvLyBmb3JtZXIgOjpzaGFkb3dcbiAgLy8gY2xhbmYtZm9ybWF0IG9uXG5dO1xudmFyIF9zZWxlY3RvclJlU3VmZml4ID0gJyhbPlxcXFxzfitcXFsuLHs6XVtcXFxcc1xcXFxTXSopPyQnO1xudmFyIF9wb2x5ZmlsbEhvc3RSZSA9IFJlZ0V4cFdyYXBwZXIuY3JlYXRlKF9wb2x5ZmlsbEhvc3QsICdpbScpO1xudmFyIF9jb2xvbkhvc3RSZSA9IC86aG9zdC9naW07XG52YXIgX2NvbG9uSG9zdENvbnRleHRSZSA9IC86aG9zdC1jb250ZXh0L2dpbTtcblxudmFyIF9jb21tZW50UmUgPSAvXFwvXFwqW1xcc1xcU10qP1xcKlxcLy9nO1xuXG5mdW5jdGlvbiBzdHJpcENvbW1lbnRzKGlucHV0OnN0cmluZyk6c3RyaW5nIHtcbiAgcmV0dXJuIFN0cmluZ1dyYXBwZXIucmVwbGFjZUFsbE1hcHBlZChpbnB1dCwgX2NvbW1lbnRSZSwgKF8pID0+ICcnKTtcbn1cblxudmFyIF9ydWxlUmUgPSAvKFxccyopKFteO1xce1xcfV0rPykoXFxzKikoKD86eyVCTE9DSyV9P1xccyo7Pyl8KD86XFxzKjspKS9nO1xudmFyIF9jdXJseVJlID0gLyhbe31dKS9nO1xuY29uc3QgT1BFTl9DVVJMWSA9ICd7JztcbmNvbnN0IENMT1NFX0NVUkxZID0gJ30nO1xuY29uc3QgQkxPQ0tfUExBQ0VIT0xERVIgPSAnJUJMT0NLJSc7XG5cbmV4cG9ydCBjbGFzcyBDc3NSdWxlIHtcbiAgY29uc3RydWN0b3IocHVibGljIHNlbGVjdG9yOnN0cmluZywgcHVibGljIGNvbnRlbnQ6c3RyaW5nKSB7fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJvY2Vzc1J1bGVzKGlucHV0OnN0cmluZywgcnVsZUNhbGxiYWNrOkZ1bmN0aW9uKTpzdHJpbmcge1xuICB2YXIgaW5wdXRXaXRoRXNjYXBlZEJsb2NrcyA9IGVzY2FwZUJsb2NrcyhpbnB1dCk7XG4gIHZhciBuZXh0QmxvY2tJbmRleCA9IDA7XG4gIHJldHVybiBTdHJpbmdXcmFwcGVyLnJlcGxhY2VBbGxNYXBwZWQoaW5wdXRXaXRoRXNjYXBlZEJsb2Nrcy5lc2NhcGVkU3RyaW5nLCBfcnVsZVJlLCBmdW5jdGlvbihtKSB7XG4gICAgdmFyIHNlbGVjdG9yID0gbVsyXTtcbiAgICB2YXIgY29udGVudCA9ICcnO1xuICAgIHZhciBzdWZmaXggPSBtWzRdO1xuICAgIHZhciBjb250ZW50UHJlZml4ID0gJyc7XG4gICAgaWYgKGlzUHJlc2VudChtWzRdKSAmJiBtWzRdLnN0YXJ0c1dpdGgoJ3snK0JMT0NLX1BMQUNFSE9MREVSKSkge1xuICAgICAgY29udGVudCA9IGlucHV0V2l0aEVzY2FwZWRCbG9ja3MuYmxvY2tzW25leHRCbG9ja0luZGV4KytdO1xuICAgICAgc3VmZml4ID0gbVs0XS5zdWJzdHJpbmcoQkxPQ0tfUExBQ0VIT0xERVIubGVuZ3RoKzEpO1xuICAgICAgY29udGVudFByZWZpeCA9ICd7JztcbiAgICB9XG4gICAgdmFyIHJ1bGUgPSBydWxlQ2FsbGJhY2sobmV3IENzc1J1bGUoc2VsZWN0b3IsIGNvbnRlbnQpKTtcbiAgICByZXR1cm4gYCR7bVsxXX0ke3J1bGUuc2VsZWN0b3J9JHttWzNdfSR7Y29udGVudFByZWZpeH0ke3J1bGUuY29udGVudH0ke3N1ZmZpeH1gO1xuICB9KTtcbn1cblxuY2xhc3MgU3RyaW5nV2l0aEVzY2FwZWRCbG9ja3Mge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgZXNjYXBlZFN0cmluZzpzdHJpbmcsIHB1YmxpYyBibG9ja3M6c3RyaW5nW10pIHt9XG59XG5cbmZ1bmN0aW9uIGVzY2FwZUJsb2NrcyhpbnB1dDpzdHJpbmcpOlN0cmluZ1dpdGhFc2NhcGVkQmxvY2tzIHtcbiAgdmFyIGlucHV0UGFydHMgPSBTdHJpbmdXcmFwcGVyLnNwbGl0KGlucHV0LCBfY3VybHlSZSk7XG4gIHZhciByZXN1bHRQYXJ0cyA9IFtdO1xuICB2YXIgZXNjYXBlZEJsb2NrcyA9IFtdO1xuICB2YXIgYnJhY2tldENvdW50ID0gMDtcbiAgdmFyIGN1cnJlbnRCbG9ja1BhcnRzID0gW107XG4gIGZvciAodmFyIHBhcnRJbmRleCA9IDA7IHBhcnRJbmRleDxpbnB1dFBhcnRzLmxlbmd0aDsgcGFydEluZGV4KyspIHtcbiAgICB2YXIgcGFydCA9IGlucHV0UGFydHNbcGFydEluZGV4XTtcbiAgICBpZiAocGFydCA9PSBDTE9TRV9DVVJMWSkge1xuICAgICAgYnJhY2tldENvdW50LS07XG4gICAgfVxuICAgIGlmIChicmFja2V0Q291bnQgPiAwKSB7XG4gICAgICBjdXJyZW50QmxvY2tQYXJ0cy5wdXNoKHBhcnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoY3VycmVudEJsb2NrUGFydHMubGVuZ3RoID4gMCkge1xuICAgICAgICBlc2NhcGVkQmxvY2tzLnB1c2goY3VycmVudEJsb2NrUGFydHMuam9pbignJykpO1xuICAgICAgICByZXN1bHRQYXJ0cy5wdXNoKEJMT0NLX1BMQUNFSE9MREVSKTtcbiAgICAgICAgY3VycmVudEJsb2NrUGFydHMgPSBbXTtcbiAgICAgIH1cbiAgICAgIHJlc3VsdFBhcnRzLnB1c2gocGFydCk7XG4gICAgfVxuICAgIGlmIChwYXJ0ID09IE9QRU5fQ1VSTFkpIHtcbiAgICAgIGJyYWNrZXRDb3VudCsrO1xuICAgIH1cbiAgfVxuICBpZiAoY3VycmVudEJsb2NrUGFydHMubGVuZ3RoID4gMCkge1xuICAgIGVzY2FwZWRCbG9ja3MucHVzaChjdXJyZW50QmxvY2tQYXJ0cy5qb2luKCcnKSk7XG4gICAgcmVzdWx0UGFydHMucHVzaChCTE9DS19QTEFDRUhPTERFUik7XG4gIH1cbiAgcmV0dXJuIG5ldyBTdHJpbmdXaXRoRXNjYXBlZEJsb2NrcyhyZXN1bHRQYXJ0cy5qb2luKCcnKSwgZXNjYXBlZEJsb2Nrcyk7XG59XG4iXX0=