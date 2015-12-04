'use strict';var collection_1 = require('angular2/src/facade/collection');
var lang_1 = require('angular2/src/facade/lang');
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
var ShadowCss = (function () {
    function ShadowCss() {
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
    ShadowCss.prototype.shimCssText = function (cssText, selector, hostSelector) {
        if (hostSelector === void 0) { hostSelector = ''; }
        cssText = stripComments(cssText);
        cssText = this._insertDirectives(cssText);
        return this._scopeCssText(cssText, selector, hostSelector);
    };
    ShadowCss.prototype._insertDirectives = function (cssText) {
        cssText = this._insertPolyfillDirectivesInCssText(cssText);
        return this._insertPolyfillRulesInCssText(cssText);
    };
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
    ShadowCss.prototype._insertPolyfillDirectivesInCssText = function (cssText) {
        // Difference with webcomponents.js: does not handle comments
        return lang_1.StringWrapper.replaceAllMapped(cssText, _cssContentNextSelectorRe, function (m) { return m[1] + '{'; });
    };
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
    ShadowCss.prototype._insertPolyfillRulesInCssText = function (cssText) {
        // Difference with webcomponents.js: does not handle comments
        return lang_1.StringWrapper.replaceAllMapped(cssText, _cssContentRuleRe, function (m) {
            var rule = m[0];
            rule = lang_1.StringWrapper.replace(rule, m[1], '');
            rule = lang_1.StringWrapper.replace(rule, m[2], '');
            return m[3] + rule;
        });
    };
    /* Ensure styles are scoped. Pseudo-scoping takes a rule like:
     *
     *  .foo {... }
     *
     *  and converts this to
     *
     *  scopeName .foo { ... }
    */
    ShadowCss.prototype._scopeCssText = function (cssText, scopeSelector, hostSelector) {
        var unscoped = this._extractUnscopedRulesFromCssText(cssText);
        cssText = this._insertPolyfillHostInCssText(cssText);
        cssText = this._convertColonHost(cssText);
        cssText = this._convertColonHostContext(cssText);
        cssText = this._convertShadowDOMSelectors(cssText);
        if (lang_1.isPresent(scopeSelector)) {
            cssText = this._scopeSelectors(cssText, scopeSelector, hostSelector);
        }
        cssText = cssText + '\n' + unscoped;
        return cssText.trim();
    };
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
    ShadowCss.prototype._extractUnscopedRulesFromCssText = function (cssText) {
        // Difference with webcomponents.js: does not handle comments
        var r = '', m;
        var matcher = lang_1.RegExpWrapper.matcher(_cssContentUnscopedRuleRe, cssText);
        while (lang_1.isPresent(m = lang_1.RegExpMatcherWrapper.next(matcher))) {
            var rule = m[0];
            rule = lang_1.StringWrapper.replace(rule, m[2], '');
            rule = lang_1.StringWrapper.replace(rule, m[1], m[3]);
            r += rule + '\n\n';
        }
        return r;
    };
    /*
     * convert a rule like :host(.foo) > .bar { }
     *
     * to
     *
     * scopeName.foo > .bar
    */
    ShadowCss.prototype._convertColonHost = function (cssText) {
        return this._convertColonRule(cssText, _cssColonHostRe, this._colonHostPartReplacer);
    };
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
    ShadowCss.prototype._convertColonHostContext = function (cssText) {
        return this._convertColonRule(cssText, _cssColonHostContextRe, this._colonHostContextPartReplacer);
    };
    ShadowCss.prototype._convertColonRule = function (cssText, regExp, partReplacer) {
        // p1 = :host, p2 = contents of (), p3 rest of rule
        return lang_1.StringWrapper.replaceAllMapped(cssText, regExp, function (m) {
            if (lang_1.isPresent(m[2])) {
                var parts = m[2].split(','), r = [];
                for (var i = 0; i < parts.length; i++) {
                    var p = parts[i];
                    if (lang_1.isBlank(p))
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
    };
    ShadowCss.prototype._colonHostContextPartReplacer = function (host, part, suffix) {
        if (lang_1.StringWrapper.contains(part, _polyfillHost)) {
            return this._colonHostPartReplacer(host, part, suffix);
        }
        else {
            return host + part + suffix + ', ' + part + ' ' + host + suffix;
        }
    };
    ShadowCss.prototype._colonHostPartReplacer = function (host, part, suffix) {
        return host + lang_1.StringWrapper.replace(part, _polyfillHost, '') + suffix;
    };
    /*
     * Convert combinators like ::shadow and pseudo-elements like ::content
     * by replacing with space.
    */
    ShadowCss.prototype._convertShadowDOMSelectors = function (cssText) {
        for (var i = 0; i < _shadowDOMSelectorsRe.length; i++) {
            cssText = lang_1.StringWrapper.replaceAll(cssText, _shadowDOMSelectorsRe[i], ' ');
        }
        return cssText;
    };
    // change a selector like 'div' to 'name div'
    ShadowCss.prototype._scopeSelectors = function (cssText, scopeSelector, hostSelector) {
        var _this = this;
        return processRules(cssText, function (rule) {
            var selector = rule.selector;
            var content = rule.content;
            if (rule.selector[0] != '@' || rule.selector.startsWith('@page')) {
                selector =
                    _this._scopeSelector(rule.selector, scopeSelector, hostSelector, _this.strictStyling);
            }
            else if (rule.selector.startsWith('@media')) {
                content = _this._scopeSelectors(rule.content, scopeSelector, hostSelector);
            }
            return new CssRule(selector, content);
        });
    };
    ShadowCss.prototype._scopeSelector = function (selector, scopeSelector, hostSelector, strict) {
        var r = [], parts = selector.split(',');
        for (var i = 0; i < parts.length; i++) {
            var p = parts[i];
            p = p.trim();
            if (this._selectorNeedsScoping(p, scopeSelector)) {
                p = strict && !lang_1.StringWrapper.contains(p, _polyfillHostNoCombinator) ?
                    this._applyStrictSelectorScope(p, scopeSelector) :
                    this._applySelectorScope(p, scopeSelector, hostSelector);
            }
            r.push(p);
        }
        return r.join(', ');
    };
    ShadowCss.prototype._selectorNeedsScoping = function (selector, scopeSelector) {
        var re = this._makeScopeMatcher(scopeSelector);
        return !lang_1.isPresent(lang_1.RegExpWrapper.firstMatch(re, selector));
    };
    ShadowCss.prototype._makeScopeMatcher = function (scopeSelector) {
        var lre = /\[/g;
        var rre = /\]/g;
        scopeSelector = lang_1.StringWrapper.replaceAll(scopeSelector, lre, '\\[');
        scopeSelector = lang_1.StringWrapper.replaceAll(scopeSelector, rre, '\\]');
        return lang_1.RegExpWrapper.create('^(' + scopeSelector + ')' + _selectorReSuffix, 'm');
    };
    ShadowCss.prototype._applySelectorScope = function (selector, scopeSelector, hostSelector) {
        // Difference from webcomponentsjs: scopeSelector could not be an array
        return this._applySimpleSelectorScope(selector, scopeSelector, hostSelector);
    };
    // scope via name and [is=name]
    ShadowCss.prototype._applySimpleSelectorScope = function (selector, scopeSelector, hostSelector) {
        if (lang_1.isPresent(lang_1.RegExpWrapper.firstMatch(_polyfillHostRe, selector))) {
            var replaceBy = this.strictStyling ? "[" + hostSelector + "]" : scopeSelector;
            selector = lang_1.StringWrapper.replace(selector, _polyfillHostNoCombinator, replaceBy);
            return lang_1.StringWrapper.replaceAll(selector, _polyfillHostRe, replaceBy + ' ');
        }
        else {
            return scopeSelector + ' ' + selector;
        }
    };
    // return a selector with [name] suffix on each simple selector
    // e.g. .foo.bar > .zot becomes .foo[name].bar[name] > .zot[name]  /** @internal */
    ShadowCss.prototype._applyStrictSelectorScope = function (selector, scopeSelector) {
        var isRe = /\[is=([^\]]*)\]/g;
        scopeSelector = lang_1.StringWrapper.replaceAllMapped(scopeSelector, isRe, function (m) { return m[1]; });
        var splits = [' ', '>', '+', '~'], scoped = selector, attrName = '[' + scopeSelector + ']';
        for (var i = 0; i < splits.length; i++) {
            var sep = splits[i];
            var parts = scoped.split(sep);
            scoped = parts.map(function (p) {
                // remove :host since it should be unnecessary
                var t = lang_1.StringWrapper.replaceAll(p.trim(), _polyfillHostRe, '');
                if (t.length > 0 && !collection_1.ListWrapper.contains(splits, t) &&
                    !lang_1.StringWrapper.contains(t, attrName)) {
                    var re = /([^:]*)(:*)(.*)/g;
                    var m = lang_1.RegExpWrapper.firstMatch(re, t);
                    if (lang_1.isPresent(m)) {
                        p = m[1] + attrName + m[2] + m[3];
                    }
                }
                return p;
            })
                .join(sep);
        }
        return scoped;
    };
    ShadowCss.prototype._insertPolyfillHostInCssText = function (selector) {
        selector = lang_1.StringWrapper.replaceAll(selector, _colonHostContextRe, _polyfillHostContext);
        selector = lang_1.StringWrapper.replaceAll(selector, _colonHostRe, _polyfillHost);
        return selector;
    };
    return ShadowCss;
})();
exports.ShadowCss = ShadowCss;
var _cssContentNextSelectorRe = /polyfill-next-selector[^}]*content:[\s]*?['"](.*?)['"][;\s]*}([^{]*?){/gim;
var _cssContentRuleRe = /(polyfill-rule)[^}]*(content:[\s]*['"](.*?)['"])[;\s]*[^}]*}/gim;
var _cssContentUnscopedRuleRe = /(polyfill-unscoped-rule)[^}]*(content:[\s]*['"](.*?)['"])[;\s]*[^}]*}/gim;
var _polyfillHost = '-shadowcsshost';
// note: :host-context pre-processed to -shadowcsshostcontext.
var _polyfillHostContext = '-shadowcsscontext';
var _parenSuffix = ')(?:\\((' +
    '(?:\\([^)(]*\\)|[^)(]*)+?' +
    ')\\))?([^,{]*)';
var _cssColonHostRe = lang_1.RegExpWrapper.create('(' + _polyfillHost + _parenSuffix, 'im');
var _cssColonHostContextRe = lang_1.RegExpWrapper.create('(' + _polyfillHostContext + _parenSuffix, 'im');
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
var _polyfillHostRe = lang_1.RegExpWrapper.create(_polyfillHost, 'im');
var _colonHostRe = /:host/gim;
var _colonHostContextRe = /:host-context/gim;
var _commentRe = /\/\*[\s\S]*?\*\//g;
function stripComments(input) {
    return lang_1.StringWrapper.replaceAllMapped(input, _commentRe, function (_) { return ''; });
}
var _ruleRe = /(\s*)([^;\{\}]+?)(\s*)((?:{%BLOCK%}?\s*;?)|(?:\s*;))/g;
var _curlyRe = /([{}])/g;
var OPEN_CURLY = '{';
var CLOSE_CURLY = '}';
var BLOCK_PLACEHOLDER = '%BLOCK%';
var CssRule = (function () {
    function CssRule(selector, content) {
        this.selector = selector;
        this.content = content;
    }
    return CssRule;
})();
exports.CssRule = CssRule;
function processRules(input, ruleCallback) {
    var inputWithEscapedBlocks = escapeBlocks(input);
    var nextBlockIndex = 0;
    return lang_1.StringWrapper.replaceAllMapped(inputWithEscapedBlocks.escapedString, _ruleRe, function (m) {
        var selector = m[2];
        var content = '';
        var suffix = m[4];
        var contentPrefix = '';
        if (lang_1.isPresent(m[4]) && m[4].startsWith('{' + BLOCK_PLACEHOLDER)) {
            content = inputWithEscapedBlocks.blocks[nextBlockIndex++];
            suffix = m[4].substring(BLOCK_PLACEHOLDER.length + 1);
            contentPrefix = '{';
        }
        var rule = ruleCallback(new CssRule(selector, content));
        return "" + m[1] + rule.selector + m[3] + contentPrefix + rule.content + suffix;
    });
}
exports.processRules = processRules;
var StringWithEscapedBlocks = (function () {
    function StringWithEscapedBlocks(escapedString, blocks) {
        this.escapedString = escapedString;
        this.blocks = blocks;
    }
    return StringWithEscapedBlocks;
})();
function escapeBlocks(input) {
    var inputParts = lang_1.StringWrapper.split(input, _curlyRe);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hhZG93X2Nzcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb21waWxlci9zaGFkb3dfY3NzLnRzIl0sIm5hbWVzIjpbIlNoYWRvd0NzcyIsIlNoYWRvd0Nzcy5jb25zdHJ1Y3RvciIsIlNoYWRvd0Nzcy5zaGltQ3NzVGV4dCIsIlNoYWRvd0Nzcy5faW5zZXJ0RGlyZWN0aXZlcyIsIlNoYWRvd0Nzcy5faW5zZXJ0UG9seWZpbGxEaXJlY3RpdmVzSW5Dc3NUZXh0IiwiU2hhZG93Q3NzLl9pbnNlcnRQb2x5ZmlsbFJ1bGVzSW5Dc3NUZXh0IiwiU2hhZG93Q3NzLl9zY29wZUNzc1RleHQiLCJTaGFkb3dDc3MuX2V4dHJhY3RVbnNjb3BlZFJ1bGVzRnJvbUNzc1RleHQiLCJTaGFkb3dDc3MuX2NvbnZlcnRDb2xvbkhvc3QiLCJTaGFkb3dDc3MuX2NvbnZlcnRDb2xvbkhvc3RDb250ZXh0IiwiU2hhZG93Q3NzLl9jb252ZXJ0Q29sb25SdWxlIiwiU2hhZG93Q3NzLl9jb2xvbkhvc3RDb250ZXh0UGFydFJlcGxhY2VyIiwiU2hhZG93Q3NzLl9jb2xvbkhvc3RQYXJ0UmVwbGFjZXIiLCJTaGFkb3dDc3MuX2NvbnZlcnRTaGFkb3dET01TZWxlY3RvcnMiLCJTaGFkb3dDc3MuX3Njb3BlU2VsZWN0b3JzIiwiU2hhZG93Q3NzLl9zY29wZVNlbGVjdG9yIiwiU2hhZG93Q3NzLl9zZWxlY3Rvck5lZWRzU2NvcGluZyIsIlNoYWRvd0Nzcy5fbWFrZVNjb3BlTWF0Y2hlciIsIlNoYWRvd0Nzcy5fYXBwbHlTZWxlY3RvclNjb3BlIiwiU2hhZG93Q3NzLl9hcHBseVNpbXBsZVNlbGVjdG9yU2NvcGUiLCJTaGFkb3dDc3MuX2FwcGx5U3RyaWN0U2VsZWN0b3JTY29wZSIsIlNoYWRvd0Nzcy5faW5zZXJ0UG9seWZpbGxIb3N0SW5Dc3NUZXh0Iiwic3RyaXBDb21tZW50cyIsIkNzc1J1bGUiLCJDc3NSdWxlLmNvbnN0cnVjdG9yIiwicHJvY2Vzc1J1bGVzIiwiU3RyaW5nV2l0aEVzY2FwZWRCbG9ja3MiLCJTdHJpbmdXaXRoRXNjYXBlZEJsb2Nrcy5jb25zdHJ1Y3RvciIsImVzY2FwZUJsb2NrcyJdLCJtYXBwaW5ncyI6IkFBQUEsMkJBQTBCLGdDQUFnQyxDQUFDLENBQUE7QUFDM0QscUJBT08sMEJBQTBCLENBQUMsQ0FBQTtBQUVsQzs7Ozs7Ozs7O0dBU0c7QUFFSDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUFpSEU7QUFFRjtJQUdFQTtRQUZBQyxrQkFBYUEsR0FBWUEsSUFBSUEsQ0FBQ0E7SUFFZkEsQ0FBQ0E7SUFFaEJEOzs7Ozs7O01BT0VBO0lBQ0ZBLCtCQUFXQSxHQUFYQSxVQUFZQSxPQUFlQSxFQUFFQSxRQUFnQkEsRUFBRUEsWUFBeUJBO1FBQXpCRSw0QkFBeUJBLEdBQXpCQSxpQkFBeUJBO1FBQ3RFQSxPQUFPQSxHQUFHQSxhQUFhQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQTtRQUNqQ0EsT0FBT0EsR0FBR0EsSUFBSUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQTtRQUMxQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsT0FBT0EsRUFBRUEsUUFBUUEsRUFBRUEsWUFBWUEsQ0FBQ0EsQ0FBQ0E7SUFDN0RBLENBQUNBO0lBRU9GLHFDQUFpQkEsR0FBekJBLFVBQTBCQSxPQUFlQTtRQUN2Q0csT0FBT0EsR0FBR0EsSUFBSUEsQ0FBQ0Esa0NBQWtDQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQTtRQUMzREEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsNkJBQTZCQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQTtJQUNyREEsQ0FBQ0E7SUFFREg7Ozs7Ozs7Ozs7Ozs7T0FhR0E7SUFDS0Esc0RBQWtDQSxHQUExQ0EsVUFBMkNBLE9BQWVBO1FB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LENBQUNBO1FBQ2pDQSxhQUFhQSxDQUFDQSxJQUFJQSxDQUFDQSxpQkFBaUJBLENBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO1FBQy9DQSxXQUFXQSxDQUFDQSxJQUFJQSxDQUFDQSxpQkFBaUJBLENBQUNBLENBQUNBO0lBQ3RDQSxDQUFDQTtJQUNEQSxNQUFNQSxDQUFDQSxJQUFJQSx1QkFBdUJBLENBQUNBLFdBQVdBLENBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLGFBQWFBLENBQUNBLENBQUNBO0FBQzFFQSxDQUFDQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7TGlzdFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge1xuICBTdHJpbmdXcmFwcGVyLFxuICBSZWdFeHAsXG4gIFJlZ0V4cFdyYXBwZXIsXG4gIFJlZ0V4cE1hdGNoZXJXcmFwcGVyLFxuICBpc1ByZXNlbnQsXG4gIGlzQmxhbmtcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcblxuLyoqXG4gKiBUaGlzIGZpbGUgaXMgYSBwb3J0IG9mIHNoYWRvd0NTUyBmcm9tIHdlYmNvbXBvbmVudHMuanMgdG8gVHlwZVNjcmlwdC5cbiAqXG4gKiBQbGVhc2UgbWFrZSBzdXJlIHRvIGtlZXAgdG8gZWRpdHMgaW4gc3luYyB3aXRoIHRoZSBzb3VyY2UgZmlsZS5cbiAqXG4gKiBTb3VyY2U6XG4gKiBodHRwczovL2dpdGh1Yi5jb20vd2ViY29tcG9uZW50cy93ZWJjb21wb25lbnRzanMvYmxvYi80ZWZlY2Q3ZTBlL3NyYy9TaGFkb3dDU1MvU2hhZG93Q1NTLmpzXG4gKlxuICogVGhlIG9yaWdpbmFsIGZpbGUgbGV2ZWwgY29tbWVudCBpcyByZXByb2R1Y2VkIGJlbG93XG4gKi9cblxuLypcbiAgVGhpcyBpcyBhIGxpbWl0ZWQgc2hpbSBmb3IgU2hhZG93RE9NIGNzcyBzdHlsaW5nLlxuICBodHRwczovL2R2Y3MudzMub3JnL2hnL3dlYmNvbXBvbmVudHMvcmF3LWZpbGUvdGlwL3NwZWMvc2hhZG93L2luZGV4Lmh0bWwjc3R5bGVzXG5cbiAgVGhlIGludGVudGlvbiBoZXJlIGlzIHRvIHN1cHBvcnQgb25seSB0aGUgc3R5bGluZyBmZWF0dXJlcyB3aGljaCBjYW4gYmVcbiAgcmVsYXRpdmVseSBzaW1wbHkgaW1wbGVtZW50ZWQuIFRoZSBnb2FsIGlzIHRvIGFsbG93IHVzZXJzIHRvIGF2b2lkIHRoZVxuICBtb3N0IG9idmlvdXMgcGl0ZmFsbHMgYW5kIGRvIHNvIHdpdGhvdXQgY29tcHJvbWlzaW5nIHBlcmZvcm1hbmNlIHNpZ25pZmljYW50bHkuXG4gIEZvciBTaGFkb3dET00gc3R5bGluZyB0aGF0J3Mgbm90IGNvdmVyZWQgaGVyZSwgYSBzZXQgb2YgYmVzdCBwcmFjdGljZXNcbiAgY2FuIGJlIHByb3ZpZGVkIHRoYXQgc2hvdWxkIGFsbG93IHVzZXJzIHRvIGFjY29tcGxpc2ggbW9yZSBjb21wbGV4IHN0eWxpbmcuXG5cbiAgVGhlIGZvbGxvd2luZyBpcyBhIGxpc3Qgb2Ygc3BlY2lmaWMgU2hhZG93RE9NIHN0eWxpbmcgZmVhdHVyZXMgYW5kIGEgYnJpZWZcbiAgZGlzY3Vzc2lvbiBvZiB0aGUgYXBwcm9hY2ggdXNlZCB0byBzaGltLlxuXG4gIFNoaW1tZWQgZmVhdHVyZXM6XG5cbiAgKiA6aG9zdCwgOmhvc3QtY29udGV4dDogU2hhZG93RE9NIGFsbG93cyBzdHlsaW5nIG9mIHRoZSBzaGFkb3dSb290J3MgaG9zdFxuICBlbGVtZW50IHVzaW5nIHRoZSA6aG9zdCBydWxlLiBUbyBzaGltIHRoaXMgZmVhdHVyZSwgdGhlIDpob3N0IHN0eWxlcyBhcmVcbiAgcmVmb3JtYXR0ZWQgYW5kIHByZWZpeGVkIHdpdGggYSBnaXZlbiBzY29wZSBuYW1lIGFuZCBwcm9tb3RlZCB0byBhXG4gIGRvY3VtZW50IGxldmVsIHN0eWxlc2hlZXQuXG4gIEZvciBleGFtcGxlLCBnaXZlbiBhIHNjb3BlIG5hbWUgb2YgLmZvbywgYSBydWxlIGxpa2UgdGhpczpcblxuICAgIDpob3N0IHtcbiAgICAgICAgYmFja2dyb3VuZDogcmVkO1xuICAgICAgfVxuICAgIH1cblxuICBiZWNvbWVzOlxuXG4gICAgLmZvbyB7XG4gICAgICBiYWNrZ3JvdW5kOiByZWQ7XG4gICAgfVxuXG4gICogZW5jYXBzdWx0aW9uOiBTdHlsZXMgZGVmaW5lZCB3aXRoaW4gU2hhZG93RE9NLCBhcHBseSBvbmx5IHRvXG4gIGRvbSBpbnNpZGUgdGhlIFNoYWRvd0RPTS4gUG9seW1lciB1c2VzIG9uZSBvZiB0d28gdGVjaG5pcXVlcyB0byBpbWxlbWVudFxuICB0aGlzIGZlYXR1cmUuXG5cbiAgQnkgZGVmYXVsdCwgcnVsZXMgYXJlIHByZWZpeGVkIHdpdGggdGhlIGhvc3QgZWxlbWVudCB0YWcgbmFtZVxuICBhcyBhIGRlc2NlbmRhbnQgc2VsZWN0b3IuIFRoaXMgZW5zdXJlcyBzdHlsaW5nIGRvZXMgbm90IGxlYWsgb3V0IG9mIHRoZSAndG9wJ1xuICBvZiB0aGUgZWxlbWVudCdzIFNoYWRvd0RPTS4gRm9yIGV4YW1wbGUsXG5cbiAgZGl2IHtcbiAgICAgIGZvbnQtd2VpZ2h0OiBib2xkO1xuICAgIH1cblxuICBiZWNvbWVzOlxuXG4gIHgtZm9vIGRpdiB7XG4gICAgICBmb250LXdlaWdodDogYm9sZDtcbiAgICB9XG5cbiAgYmVjb21lczpcblxuXG4gIEFsdGVybmF0aXZlbHksIGlmIFdlYkNvbXBvbmVudHMuU2hhZG93Q1NTLnN0cmljdFN0eWxpbmcgaXMgc2V0IHRvIHRydWUgdGhlblxuICBzZWxlY3RvcnMgYXJlIHNjb3BlZCBieSBhZGRpbmcgYW4gYXR0cmlidXRlIHNlbGVjdG9yIHN1ZmZpeCB0byBlYWNoXG4gIHNpbXBsZSBzZWxlY3RvciB0aGF0IGNvbnRhaW5zIHRoZSBob3N0IGVsZW1lbnQgdGFnIG5hbWUuIEVhY2ggZWxlbWVudFxuICBpbiB0aGUgZWxlbWVudCdzIFNoYWRvd0RPTSB0ZW1wbGF0ZSBpcyBhbHNvIGdpdmVuIHRoZSBzY29wZSBhdHRyaWJ1dGUuXG4gIFRodXMsIHRoZXNlIHJ1bGVzIG1hdGNoIG9ubHkgZWxlbWVudHMgdGhhdCBoYXZlIHRoZSBzY29wZSBhdHRyaWJ1dGUuXG4gIEZvciBleGFtcGxlLCBnaXZlbiBhIHNjb3BlIG5hbWUgb2YgeC1mb28sIGEgcnVsZSBsaWtlIHRoaXM6XG5cbiAgICBkaXYge1xuICAgICAgZm9udC13ZWlnaHQ6IGJvbGQ7XG4gICAgfVxuXG4gIGJlY29tZXM6XG5cbiAgICBkaXZbeC1mb29dIHtcbiAgICAgIGZvbnQtd2VpZ2h0OiBib2xkO1xuICAgIH1cblxuICBOb3RlIHRoYXQgZWxlbWVudHMgdGhhdCBhcmUgZHluYW1pY2FsbHkgYWRkZWQgdG8gYSBzY29wZSBtdXN0IGhhdmUgdGhlIHNjb3BlXG4gIHNlbGVjdG9yIGFkZGVkIHRvIHRoZW0gbWFudWFsbHkuXG5cbiAgKiB1cHBlci9sb3dlciBib3VuZCBlbmNhcHN1bGF0aW9uOiBTdHlsZXMgd2hpY2ggYXJlIGRlZmluZWQgb3V0c2lkZSBhXG4gIHNoYWRvd1Jvb3Qgc2hvdWxkIG5vdCBjcm9zcyB0aGUgU2hhZG93RE9NIGJvdW5kYXJ5IGFuZCBzaG91bGQgbm90IGFwcGx5XG4gIGluc2lkZSBhIHNoYWRvd1Jvb3QuXG5cbiAgVGhpcyBzdHlsaW5nIGJlaGF2aW9yIGlzIG5vdCBlbXVsYXRlZC4gU29tZSBwb3NzaWJsZSB3YXlzIHRvIGRvIHRoaXMgdGhhdFxuICB3ZXJlIHJlamVjdGVkIGR1ZSB0byBjb21wbGV4aXR5IGFuZC9vciBwZXJmb3JtYW5jZSBjb25jZXJucyBpbmNsdWRlOiAoMSkgcmVzZXRcbiAgZXZlcnkgcG9zc2libGUgcHJvcGVydHkgZm9yIGV2ZXJ5IHBvc3NpYmxlIHNlbGVjdG9yIGZvciBhIGdpdmVuIHNjb3BlIG5hbWU7XG4gICgyKSByZS1pbXBsZW1lbnQgY3NzIGluIGphdmFzY3JpcHQuXG5cbiAgQXMgYW4gYWx0ZXJuYXRpdmUsIHVzZXJzIHNob3VsZCBtYWtlIHN1cmUgdG8gdXNlIHNlbGVjdG9yc1xuICBzcGVjaWZpYyB0byB0aGUgc2NvcGUgaW4gd2hpY2ggdGhleSBhcmUgd29ya2luZy5cblxuICAqIDo6ZGlzdHJpYnV0ZWQ6IFRoaXMgYmVoYXZpb3IgaXMgbm90IGVtdWxhdGVkLiBJdCdzIG9mdGVuIG5vdCBuZWNlc3NhcnlcbiAgdG8gc3R5bGUgdGhlIGNvbnRlbnRzIG9mIGEgc3BlY2lmaWMgaW5zZXJ0aW9uIHBvaW50IGFuZCBpbnN0ZWFkLCBkZXNjZW5kYW50c1xuICBvZiB0aGUgaG9zdCBlbGVtZW50IGNhbiBiZSBzdHlsZWQgc2VsZWN0aXZlbHkuIFVzZXJzIGNhbiBhbHNvIGNyZWF0ZSBhblxuICBleHRyYSBub2RlIGFyb3VuZCBhbiBpbnNlcnRpb24gcG9pbnQgYW5kIHN0eWxlIHRoYXQgbm9kZSdzIGNvbnRlbnRzXG4gIHZpYSBkZXNjZW5kZW50IHNlbGVjdG9ycy4gRm9yIGV4YW1wbGUsIHdpdGggYSBzaGFkb3dSb290IGxpa2UgdGhpczpcblxuICAgIDxzdHlsZT5cbiAgICAgIDo6Y29udGVudChkaXYpIHtcbiAgICAgICAgYmFja2dyb3VuZDogcmVkO1xuICAgICAgfVxuICAgIDwvc3R5bGU+XG4gICAgPGNvbnRlbnQ+PC9jb250ZW50PlxuXG4gIGNvdWxkIGJlY29tZTpcblxuICAgIDxzdHlsZT5cbiAgICAgIC8gKkBwb2x5ZmlsbCAuY29udGVudC1jb250YWluZXIgZGl2ICogL1xuICAgICAgOjpjb250ZW50KGRpdikge1xuICAgICAgICBiYWNrZ3JvdW5kOiByZWQ7XG4gICAgICB9XG4gICAgPC9zdHlsZT5cbiAgICA8ZGl2IGNsYXNzPVwiY29udGVudC1jb250YWluZXJcIj5cbiAgICAgIDxjb250ZW50PjwvY29udGVudD5cbiAgICA8L2Rpdj5cblxuICBOb3RlIHRoZSB1c2Ugb2YgQHBvbHlmaWxsIGluIHRoZSBjb21tZW50IGFib3ZlIGEgU2hhZG93RE9NIHNwZWNpZmljIHN0eWxlXG4gIGRlY2xhcmF0aW9uLiBUaGlzIGlzIGEgZGlyZWN0aXZlIHRvIHRoZSBzdHlsaW5nIHNoaW0gdG8gdXNlIHRoZSBzZWxlY3RvclxuICBpbiBjb21tZW50cyBpbiBsaWV1IG9mIHRoZSBuZXh0IHNlbGVjdG9yIHdoZW4gcnVubmluZyB1bmRlciBwb2x5ZmlsbC5cbiovXG5cbmV4cG9ydCBjbGFzcyBTaGFkb3dDc3Mge1xuICBzdHJpY3RTdHlsaW5nOiBib29sZWFuID0gdHJ1ZTtcblxuICBjb25zdHJ1Y3RvcigpIHt9XG5cbiAgLypcbiAgKiBTaGltIHNvbWUgY3NzVGV4dCB3aXRoIHRoZSBnaXZlbiBzZWxlY3Rvci4gUmV0dXJucyBjc3NUZXh0IHRoYXQgY2FuXG4gICogYmUgaW5jbHVkZWQgaW4gdGhlIGRvY3VtZW50IHZpYSBXZWJDb21wb25lbnRzLlNoYWRvd0NTUy5hZGRDc3NUb0RvY3VtZW50KGNzcykuXG4gICpcbiAgKiBXaGVuIHN0cmljdFN0eWxpbmcgaXMgdHJ1ZTpcbiAgKiAtIHNlbGVjdG9yIGlzIHRoZSBhdHRyaWJ1dGUgYWRkZWQgdG8gYWxsIGVsZW1lbnRzIGluc2lkZSB0aGUgaG9zdCxcbiAgKiAtIGhvc3RTZWxlY3RvciBpcyB0aGUgYXR0cmlidXRlIGFkZGVkIHRvIHRoZSBob3N0IGl0c2VsZi5cbiAgKi9cbiAgc2hpbUNzc1RleHQoY3NzVGV4dDogc3RyaW5nLCBzZWxlY3Rvcjogc3RyaW5nLCBob3N0U2VsZWN0b3I6IHN0cmluZyA9ICcnKTogc3RyaW5nIHtcbiAgICBjc3NUZXh0ID0gc3RyaXBDb21tZW50cyhjc3NUZXh0KTtcbiAgICBjc3NUZXh0ID0gdGhpcy5faW5zZXJ0RGlyZWN0aXZlcyhjc3NUZXh0KTtcbiAgICByZXR1cm4gdGhpcy5fc2NvcGVDc3NUZXh0KGNzc1RleHQsIHNlbGVjdG9yLCBob3N0U2VsZWN0b3IpO1xuICB9XG5cbiAgcHJpdmF0ZSBfaW5zZXJ0RGlyZWN0aXZlcyhjc3NUZXh0OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGNzc1RleHQgPSB0aGlzLl9pbnNlcnRQb2x5ZmlsbERpcmVjdGl2ZXNJbkNzc1RleHQoY3NzVGV4dCk7XG4gICAgcmV0dXJuIHRoaXMuX2luc2VydFBvbHlmaWxsUnVsZXNJbkNzc1RleHQoY3NzVGV4dCk7XG4gIH1cblxuICAvKlxuICAgKiBQcm9jZXNzIHN0eWxlcyB0byBjb252ZXJ0IG5hdGl2ZSBTaGFkb3dET00gcnVsZXMgdGhhdCB3aWxsIHRyaXBcbiAgICogdXAgdGhlIGNzcyBwYXJzZXI7IHdlIHJlbHkgb24gZGVjb3JhdGluZyB0aGUgc3R5bGVzaGVldCB3aXRoIGluZXJ0IHJ1bGVzLlxuICAgKlxuICAgKiBGb3IgZXhhbXBsZSwgd2UgY29udmVydCB0aGlzIHJ1bGU6XG4gICAqXG4gICAqIHBvbHlmaWxsLW5leHQtc2VsZWN0b3IgeyBjb250ZW50OiAnOmhvc3QgbWVudS1pdGVtJzsgfVxuICAgKiA6OmNvbnRlbnQgbWVudS1pdGVtIHtcbiAgICpcbiAgICogdG8gdGhpczpcbiAgICpcbiAgICogc2NvcGVOYW1lIG1lbnUtaXRlbSB7XG4gICAqXG4gICoqL1xuICBwcml2YXRlIF9pbnNlcnRQb2x5ZmlsbERpcmVjdGl2ZXNJbkNzc1RleHQoY3NzVGV4dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAvLyBEaWZmZXJlbmNlIHdpdGggd2ViY29tcG9uZW50cy5qczogZG9lcyBub3QgaGFuZGxlIGNvbW1lbnRzXG4gICAgcmV0dXJuIFN0cmluZ1dyYXBwZXIucmVwbGFjZUFsbE1hcHBlZChjc3NUZXh0LCBfY3NzQ29udGVudE5leHRTZWxlY3RvclJlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24obSkgeyByZXR1cm4gbVsxXSArICd7JzsgfSk7XG4gIH1cblxuICAvKlxuICAgKiBQcm9jZXNzIHN0eWxlcyB0byBhZGQgcnVsZXMgd2hpY2ggd2lsbCBvbmx5IGFwcGx5IHVuZGVyIHRoZSBwb2x5ZmlsbFxuICAgKlxuICAgKiBGb3IgZXhhbXBsZSwgd2UgY29udmVydCB0aGlzIHJ1bGU6XG4gICAqXG4gICAqIHBvbHlmaWxsLXJ1bGUge1xuICAgKiAgIGNvbnRlbnQ6ICc6aG9zdCBtZW51LWl0ZW0nO1xuICAgKiAuLi5cbiAgICogfVxuICAgKlxuICAgKiB0byB0aGlzOlxuICAgKlxuICAgKiBzY29wZU5hbWUgbWVudS1pdGVtIHsuLi59XG4gICAqXG4gICoqL1xuICBwcml2YXRlIF9pbnNlcnRQb2x5ZmlsbFJ1bGVzSW5Dc3NUZXh0KGNzc1RleHQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgLy8gRGlmZmVyZW5jZSB3aXRoIHdlYmNvbXBvbmVudHMuanM6IGRvZXMgbm90IGhhbmRsZSBjb21tZW50c1xuICAgIHJldHVybiBTdHJpbmdXcmFwcGVyLnJlcGxhY2VBbGxNYXBwZWQoY3NzVGV4dCwgX2Nzc0NvbnRlbnRSdWxlUmUsIGZ1bmN0aW9uKG0pIHtcbiAgICAgIHZhciBydWxlID0gbVswXTtcbiAgICAgIHJ1bGUgPSBTdHJpbmdXcmFwcGVyLnJlcGxhY2UocnVsZSwgbVsxXSwgJycpO1xuICAgICAgcnVsZSA9IFN0cmluZ1dyYXBwZXIucmVwbGFjZShydWxlLCBtWzJdLCAnJyk7XG4gICAgICByZXR1cm4gbVszXSArIHJ1bGU7XG4gICAgfSk7XG4gIH1cblxuICAvKiBFbnN1cmUgc3R5bGVzIGFyZSBzY29wZWQuIFBzZXVkby1zY29waW5nIHRha2VzIGEgcnVsZSBsaWtlOlxuICAgKlxuICAgKiAgLmZvbyB7Li4uIH1cbiAgICpcbiAgICogIGFuZCBjb252ZXJ0cyB0aGlzIHRvXG4gICAqXG4gICAqICBzY29wZU5hbWUgLmZvbyB7IC4uLiB9XG4gICovXG4gIHByaXZhdGUgX3Njb3BlQ3NzVGV4dChjc3NUZXh0OiBzdHJpbmcsIHNjb3BlU2VsZWN0b3I6IHN0cmluZywgaG9zdFNlbGVjdG9yOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHZhciB1bnNjb3BlZCA9IHRoaXMuX2V4dHJhY3RVbnNjb3BlZFJ1bGVzRnJvbUNzc1RleHQoY3NzVGV4dCk7XG4gICAgY3NzVGV4dCA9IHRoaXMuX2luc2VydFBvbHlmaWxsSG9zdEluQ3NzVGV4dChjc3NUZXh0KTtcbiAgICBjc3NUZXh0ID0gdGhpcy5fY29udmVydENvbG9uSG9zdChjc3NUZXh0KTtcbiAgICBjc3NUZXh0ID0gdGhpcy5fY29udmVydENvbG9uSG9zdENvbnRleHQoY3NzVGV4dCk7XG4gICAgY3NzVGV4dCA9IHRoaXMuX2NvbnZlcnRTaGFkb3dET01TZWxlY3RvcnMoY3NzVGV4dCk7XG4gICAgaWYgKGlzUHJlc2VudChzY29wZVNlbGVjdG9yKSkge1xuICAgICAgY3NzVGV4dCA9IHRoaXMuX3Njb3BlU2VsZWN0b3JzKGNzc1RleHQsIHNjb3BlU2VsZWN0b3IsIGhvc3RTZWxlY3Rvcik7XG4gICAgfVxuICAgIGNzc1RleHQgPSBjc3NUZXh0ICsgJ1xcbicgKyB1bnNjb3BlZDtcbiAgICByZXR1cm4gY3NzVGV4dC50cmltKCk7XG4gIH1cblxuICAvKlxuICAgKiBQcm9jZXNzIHN0eWxlcyB0byBhZGQgcnVsZXMgd2hpY2ggd2lsbCBvbmx5IGFwcGx5IHVuZGVyIHRoZSBwb2x5ZmlsbFxuICAgKiBhbmQgZG8gbm90IHByb2Nlc3MgdmlhIENTU09NLiAoQ1NTT00gaXMgZGVzdHJ1Y3RpdmUgdG8gcnVsZXMgb24gcmFyZVxuICAgKiBvY2Nhc2lvbnMsIGUuZy4gLXdlYmtpdC1jYWxjIG9uIFNhZmFyaS4pXG4gICAqIEZvciBleGFtcGxlLCB3ZSBjb252ZXJ0IHRoaXMgcnVsZTpcbiAgICpcbiAgICogQHBvbHlmaWxsLXVuc2NvcGVkLXJ1bGUge1xuICAgKiAgIGNvbnRlbnQ6ICdtZW51LWl0ZW0nO1xuICAgKiAuLi4gfVxuICAgKlxuICAgKiB0byB0aGlzOlxuICAgKlxuICAgKiBtZW51LWl0ZW0gey4uLn1cbiAgICpcbiAgKiovXG4gIHByaXZhdGUgX2V4dHJhY3RVbnNjb3BlZFJ1bGVzRnJvbUNzc1RleHQoY3NzVGV4dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAvLyBEaWZmZXJlbmNlIHdpdGggd2ViY29tcG9uZW50cy5qczogZG9lcyBub3QgaGFuZGxlIGNvbW1lbnRzXG4gICAgdmFyIHIgPSAnJywgbTtcbiAgICB2YXIgbWF0Y2hlciA9IFJlZ0V4cFdyYXBwZXIubWF0Y2hlcihfY3NzQ29udGVudFVuc2NvcGVkUnVsZVJlLCBjc3NUZXh0KTtcbiAgICB3aGlsZSAoaXNQcmVzZW50KG0gPSBSZWdFeHBNYXRjaGVyV3JhcHBlci5uZXh0KG1hdGNoZXIpKSkge1xuICAgICAgdmFyIHJ1bGUgPSBtWzBdO1xuICAgICAgcnVsZSA9IFN0cmluZ1dyYXBwZXIucmVwbGFjZShydWxlLCBtWzJdLCAnJyk7XG4gICAgICBydWxlID0gU3RyaW5nV3JhcHBlci5yZXBsYWNlKHJ1bGUsIG1bMV0sIG1bM10pO1xuICAgICAgciArPSBydWxlICsgJ1xcblxcbic7XG4gICAgfVxuICAgIHJldHVybiByO1xuICB9XG5cbiAgLypcbiAgICogY29udmVydCBhIHJ1bGUgbGlrZSA6aG9zdCguZm9vKSA+IC5iYXIgeyB9XG4gICAqXG4gICAqIHRvXG4gICAqXG4gICAqIHNjb3BlTmFtZS5mb28gPiAuYmFyXG4gICovXG4gIHByaXZhdGUgX2NvbnZlcnRDb2xvbkhvc3QoY3NzVGV4dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fY29udmVydENvbG9uUnVsZShjc3NUZXh0LCBfY3NzQ29sb25Ib3N0UmUsIHRoaXMuX2NvbG9uSG9zdFBhcnRSZXBsYWNlcik7XG4gIH1cblxuICAvKlxuICAgKiBjb252ZXJ0IGEgcnVsZSBsaWtlIDpob3N0LWNvbnRleHQoLmZvbykgPiAuYmFyIHsgfVxuICAgKlxuICAgKiB0b1xuICAgKlxuICAgKiBzY29wZU5hbWUuZm9vID4gLmJhciwgLmZvbyBzY29wZU5hbWUgPiAuYmFyIHsgfVxuICAgKlxuICAgKiBhbmRcbiAgICpcbiAgICogOmhvc3QtY29udGV4dCguZm9vOmhvc3QpIC5iYXIgeyAuLi4gfVxuICAgKlxuICAgKiB0b1xuICAgKlxuICAgKiBzY29wZU5hbWUuZm9vIC5iYXIgeyAuLi4gfVxuICAqL1xuICBwcml2YXRlIF9jb252ZXJ0Q29sb25Ib3N0Q29udGV4dChjc3NUZXh0OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9jb252ZXJ0Q29sb25SdWxlKGNzc1RleHQsIF9jc3NDb2xvbkhvc3RDb250ZXh0UmUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fY29sb25Ib3N0Q29udGV4dFBhcnRSZXBsYWNlcik7XG4gIH1cblxuICBwcml2YXRlIF9jb252ZXJ0Q29sb25SdWxlKGNzc1RleHQ6IHN0cmluZywgcmVnRXhwOiBSZWdFeHAsIHBhcnRSZXBsYWNlcjogRnVuY3Rpb24pOiBzdHJpbmcge1xuICAgIC8vIHAxID0gOmhvc3QsIHAyID0gY29udGVudHMgb2YgKCksIHAzIHJlc3Qgb2YgcnVsZVxuICAgIHJldHVybiBTdHJpbmdXcmFwcGVyLnJlcGxhY2VBbGxNYXBwZWQoY3NzVGV4dCwgcmVnRXhwLCBmdW5jdGlvbihtKSB7XG4gICAgICBpZiAoaXNQcmVzZW50KG1bMl0pKSB7XG4gICAgICAgIHZhciBwYXJ0cyA9IG1bMl0uc3BsaXQoJywnKSwgciA9IFtdO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhcnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgdmFyIHAgPSBwYXJ0c1tpXTtcbiAgICAgICAgICBpZiAoaXNCbGFuayhwKSkgYnJlYWs7XG4gICAgICAgICAgcCA9IHAudHJpbSgpO1xuICAgICAgICAgIHIucHVzaChwYXJ0UmVwbGFjZXIoX3BvbHlmaWxsSG9zdE5vQ29tYmluYXRvciwgcCwgbVszXSkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByLmpvaW4oJywnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBfcG9seWZpbGxIb3N0Tm9Db21iaW5hdG9yICsgbVszXTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2NvbG9uSG9zdENvbnRleHRQYXJ0UmVwbGFjZXIoaG9zdDogc3RyaW5nLCBwYXJ0OiBzdHJpbmcsIHN1ZmZpeDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBpZiAoU3RyaW5nV3JhcHBlci5jb250YWlucyhwYXJ0LCBfcG9seWZpbGxIb3N0KSkge1xuICAgICAgcmV0dXJuIHRoaXMuX2NvbG9uSG9zdFBhcnRSZXBsYWNlcihob3N0LCBwYXJ0LCBzdWZmaXgpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gaG9zdCArIHBhcnQgKyBzdWZmaXggKyAnLCAnICsgcGFydCArICcgJyArIGhvc3QgKyBzdWZmaXg7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfY29sb25Ib3N0UGFydFJlcGxhY2VyKGhvc3Q6IHN0cmluZywgcGFydDogc3RyaW5nLCBzdWZmaXg6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGhvc3QgKyBTdHJpbmdXcmFwcGVyLnJlcGxhY2UocGFydCwgX3BvbHlmaWxsSG9zdCwgJycpICsgc3VmZml4O1xuICB9XG5cbiAgLypcbiAgICogQ29udmVydCBjb21iaW5hdG9ycyBsaWtlIDo6c2hhZG93IGFuZCBwc2V1ZG8tZWxlbWVudHMgbGlrZSA6OmNvbnRlbnRcbiAgICogYnkgcmVwbGFjaW5nIHdpdGggc3BhY2UuXG4gICovXG4gIHByaXZhdGUgX2NvbnZlcnRTaGFkb3dET01TZWxlY3RvcnMoY3NzVGV4dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IF9zaGFkb3dET01TZWxlY3RvcnNSZS5sZW5ndGg7IGkrKykge1xuICAgICAgY3NzVGV4dCA9IFN0cmluZ1dyYXBwZXIucmVwbGFjZUFsbChjc3NUZXh0LCBfc2hhZG93RE9NU2VsZWN0b3JzUmVbaV0sICcgJyk7XG4gICAgfVxuICAgIHJldHVybiBjc3NUZXh0O1xuICB9XG5cbiAgLy8gY2hhbmdlIGEgc2VsZWN0b3IgbGlrZSAnZGl2JyB0byAnbmFtZSBkaXYnXG4gIHByaXZhdGUgX3Njb3BlU2VsZWN0b3JzKGNzc1RleHQ6IHN0cmluZywgc2NvcGVTZWxlY3Rvcjogc3RyaW5nLCBob3N0U2VsZWN0b3I6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHByb2Nlc3NSdWxlcyhjc3NUZXh0LCAocnVsZTogQ3NzUnVsZSkgPT4ge1xuICAgICAgdmFyIHNlbGVjdG9yID0gcnVsZS5zZWxlY3RvcjtcbiAgICAgIHZhciBjb250ZW50ID0gcnVsZS5jb250ZW50O1xuICAgICAgaWYgKHJ1bGUuc2VsZWN0b3JbMF0gIT0gJ0AnIHx8IHJ1bGUuc2VsZWN0b3Iuc3RhcnRzV2l0aCgnQHBhZ2UnKSkge1xuICAgICAgICBzZWxlY3RvciA9XG4gICAgICAgICAgICB0aGlzLl9zY29wZVNlbGVjdG9yKHJ1bGUuc2VsZWN0b3IsIHNjb3BlU2VsZWN0b3IsIGhvc3RTZWxlY3RvciwgdGhpcy5zdHJpY3RTdHlsaW5nKTtcbiAgICAgIH0gZWxzZSBpZiAocnVsZS5zZWxlY3Rvci5zdGFydHNXaXRoKCdAbWVkaWEnKSkge1xuICAgICAgICBjb250ZW50ID0gdGhpcy5fc2NvcGVTZWxlY3RvcnMocnVsZS5jb250ZW50LCBzY29wZVNlbGVjdG9yLCBob3N0U2VsZWN0b3IpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyBDc3NSdWxlKHNlbGVjdG9yLCBjb250ZW50KTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX3Njb3BlU2VsZWN0b3Ioc2VsZWN0b3I6IHN0cmluZywgc2NvcGVTZWxlY3Rvcjogc3RyaW5nLCBob3N0U2VsZWN0b3I6IHN0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgICBzdHJpY3Q6IGJvb2xlYW4pOiBzdHJpbmcge1xuICAgIHZhciByID0gW10sIHBhcnRzID0gc2VsZWN0b3Iuc3BsaXQoJywnKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhcnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgcCA9IHBhcnRzW2ldO1xuICAgICAgcCA9IHAudHJpbSgpO1xuICAgICAgaWYgKHRoaXMuX3NlbGVjdG9yTmVlZHNTY29waW5nKHAsIHNjb3BlU2VsZWN0b3IpKSB7XG4gICAgICAgIHAgPSBzdHJpY3QgJiYgIVN0cmluZ1dyYXBwZXIuY29udGFpbnMocCwgX3BvbHlmaWxsSG9zdE5vQ29tYmluYXRvcikgP1xuICAgICAgICAgICAgICAgIHRoaXMuX2FwcGx5U3RyaWN0U2VsZWN0b3JTY29wZShwLCBzY29wZVNlbGVjdG9yKSA6XG4gICAgICAgICAgICAgICAgdGhpcy5fYXBwbHlTZWxlY3RvclNjb3BlKHAsIHNjb3BlU2VsZWN0b3IsIGhvc3RTZWxlY3Rvcik7XG4gICAgICB9XG4gICAgICByLnB1c2gocCk7XG4gICAgfVxuICAgIHJldHVybiByLmpvaW4oJywgJyk7XG4gIH1cblxuICBwcml2YXRlIF9zZWxlY3Rvck5lZWRzU2NvcGluZyhzZWxlY3Rvcjogc3RyaW5nLCBzY29wZVNlbGVjdG9yOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICB2YXIgcmUgPSB0aGlzLl9tYWtlU2NvcGVNYXRjaGVyKHNjb3BlU2VsZWN0b3IpO1xuICAgIHJldHVybiAhaXNQcmVzZW50KFJlZ0V4cFdyYXBwZXIuZmlyc3RNYXRjaChyZSwgc2VsZWN0b3IpKTtcbiAgfVxuXG4gIHByaXZhdGUgX21ha2VTY29wZU1hdGNoZXIoc2NvcGVTZWxlY3Rvcjogc3RyaW5nKTogUmVnRXhwIHtcbiAgICB2YXIgbHJlID0gL1xcWy9nO1xuICAgIHZhciBycmUgPSAvXFxdL2c7XG4gICAgc2NvcGVTZWxlY3RvciA9IFN0cmluZ1dyYXBwZXIucmVwbGFjZUFsbChzY29wZVNlbGVjdG9yLCBscmUsICdcXFxcWycpO1xuICAgIHNjb3BlU2VsZWN0b3IgPSBTdHJpbmdXcmFwcGVyLnJlcGxhY2VBbGwoc2NvcGVTZWxlY3RvciwgcnJlLCAnXFxcXF0nKTtcbiAgICByZXR1cm4gUmVnRXhwV3JhcHBlci5jcmVhdGUoJ14oJyArIHNjb3BlU2VsZWN0b3IgKyAnKScgKyBfc2VsZWN0b3JSZVN1ZmZpeCwgJ20nKTtcbiAgfVxuXG4gIHByaXZhdGUgX2FwcGx5U2VsZWN0b3JTY29wZShzZWxlY3Rvcjogc3RyaW5nLCBzY29wZVNlbGVjdG9yOiBzdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBob3N0U2VsZWN0b3I6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgLy8gRGlmZmVyZW5jZSBmcm9tIHdlYmNvbXBvbmVudHNqczogc2NvcGVTZWxlY3RvciBjb3VsZCBub3QgYmUgYW4gYXJyYXlcbiAgICByZXR1cm4gdGhpcy5fYXBwbHlTaW1wbGVTZWxlY3RvclNjb3BlKHNlbGVjdG9yLCBzY29wZVNlbGVjdG9yLCBob3N0U2VsZWN0b3IpO1xuICB9XG5cbiAgLy8gc2NvcGUgdmlhIG5hbWUgYW5kIFtpcz1uYW1lXVxuICBwcml2YXRlIF9hcHBseVNpbXBsZVNlbGVjdG9yU2NvcGUoc2VsZWN0b3I6IHN0cmluZywgc2NvcGVTZWxlY3Rvcjogc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaG9zdFNlbGVjdG9yOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGlmIChpc1ByZXNlbnQoUmVnRXhwV3JhcHBlci5maXJzdE1hdGNoKF9wb2x5ZmlsbEhvc3RSZSwgc2VsZWN0b3IpKSkge1xuICAgICAgdmFyIHJlcGxhY2VCeSA9IHRoaXMuc3RyaWN0U3R5bGluZyA/IGBbJHtob3N0U2VsZWN0b3J9XWAgOiBzY29wZVNlbGVjdG9yO1xuICAgICAgc2VsZWN0b3IgPSBTdHJpbmdXcmFwcGVyLnJlcGxhY2Uoc2VsZWN0b3IsIF9wb2x5ZmlsbEhvc3ROb0NvbWJpbmF0b3IsIHJlcGxhY2VCeSk7XG4gICAgICByZXR1cm4gU3RyaW5nV3JhcHBlci5yZXBsYWNlQWxsKHNlbGVjdG9yLCBfcG9seWZpbGxIb3N0UmUsIHJlcGxhY2VCeSArICcgJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBzY29wZVNlbGVjdG9yICsgJyAnICsgc2VsZWN0b3I7XG4gICAgfVxuICB9XG5cbiAgLy8gcmV0dXJuIGEgc2VsZWN0b3Igd2l0aCBbbmFtZV0gc3VmZml4IG9uIGVhY2ggc2ltcGxlIHNlbGVjdG9yXG4gIC8vIGUuZy4gLmZvby5iYXIgPiAuem90IGJlY29tZXMgLmZvb1tuYW1lXS5iYXJbbmFtZV0gPiAuem90W25hbWVdICAvKiogQGludGVybmFsICovXG4gIHByaXZhdGUgX2FwcGx5U3RyaWN0U2VsZWN0b3JTY29wZShzZWxlY3Rvcjogc3RyaW5nLCBzY29wZVNlbGVjdG9yOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHZhciBpc1JlID0gL1xcW2lzPShbXlxcXV0qKVxcXS9nO1xuICAgIHNjb3BlU2VsZWN0b3IgPSBTdHJpbmdXcmFwcGVyLnJlcGxhY2VBbGxNYXBwZWQoc2NvcGVTZWxlY3RvciwgaXNSZSwgKG0pID0+IG1bMV0pO1xuICAgIHZhciBzcGxpdHMgPSBbJyAnLCAnPicsICcrJywgJ34nXSwgc2NvcGVkID0gc2VsZWN0b3IsIGF0dHJOYW1lID0gJ1snICsgc2NvcGVTZWxlY3RvciArICddJztcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNwbGl0cy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHNlcCA9IHNwbGl0c1tpXTtcbiAgICAgIHZhciBwYXJ0cyA9IHNjb3BlZC5zcGxpdChzZXApO1xuICAgICAgc2NvcGVkID0gcGFydHMubWFwKHAgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgIC8vIHJlbW92ZSA6aG9zdCBzaW5jZSBpdCBzaG91bGQgYmUgdW5uZWNlc3NhcnlcbiAgICAgICAgICAgICAgICAgICAgICB2YXIgdCA9IFN0cmluZ1dyYXBwZXIucmVwbGFjZUFsbChwLnRyaW0oKSwgX3BvbHlmaWxsSG9zdFJlLCAnJyk7XG4gICAgICAgICAgICAgICAgICAgICAgaWYgKHQubGVuZ3RoID4gMCAmJiAhTGlzdFdyYXBwZXIuY29udGFpbnMoc3BsaXRzLCB0KSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAhU3RyaW5nV3JhcHBlci5jb250YWlucyh0LCBhdHRyTmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciByZSA9IC8oW146XSopKDoqKSguKikvZztcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBtID0gUmVnRXhwV3JhcHBlci5maXJzdE1hdGNoKHJlLCB0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc1ByZXNlbnQobSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcCA9IG1bMV0gKyBhdHRyTmFtZSArIG1bMl0gKyBtWzNdO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcDtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAuam9pbihzZXApO1xuICAgIH1cbiAgICByZXR1cm4gc2NvcGVkO1xuICB9XG5cbiAgcHJpdmF0ZSBfaW5zZXJ0UG9seWZpbGxIb3N0SW5Dc3NUZXh0KHNlbGVjdG9yOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHNlbGVjdG9yID0gU3RyaW5nV3JhcHBlci5yZXBsYWNlQWxsKHNlbGVjdG9yLCBfY29sb25Ib3N0Q29udGV4dFJlLCBfcG9seWZpbGxIb3N0Q29udGV4dCk7XG4gICAgc2VsZWN0b3IgPSBTdHJpbmdXcmFwcGVyLnJlcGxhY2VBbGwoc2VsZWN0b3IsIF9jb2xvbkhvc3RSZSwgX3BvbHlmaWxsSG9zdCk7XG4gICAgcmV0dXJuIHNlbGVjdG9yO1xuICB9XG59XG52YXIgX2Nzc0NvbnRlbnROZXh0U2VsZWN0b3JSZSA9XG4gICAgL3BvbHlmaWxsLW5leHQtc2VsZWN0b3JbXn1dKmNvbnRlbnQ6W1xcc10qP1snXCJdKC4qPylbJ1wiXVs7XFxzXSp9KFtee10qPyl7L2dpbTtcbnZhciBfY3NzQ29udGVudFJ1bGVSZSA9IC8ocG9seWZpbGwtcnVsZSlbXn1dKihjb250ZW50OltcXHNdKlsnXCJdKC4qPylbJ1wiXSlbO1xcc10qW159XSp9L2dpbTtcbnZhciBfY3NzQ29udGVudFVuc2NvcGVkUnVsZVJlID1cbiAgICAvKHBvbHlmaWxsLXVuc2NvcGVkLXJ1bGUpW159XSooY29udGVudDpbXFxzXSpbJ1wiXSguKj8pWydcIl0pWztcXHNdKltefV0qfS9naW07XG52YXIgX3BvbHlmaWxsSG9zdCA9ICctc2hhZG93Y3NzaG9zdCc7XG4vLyBub3RlOiA6aG9zdC1jb250ZXh0IHByZS1wcm9jZXNzZWQgdG8gLXNoYWRvd2Nzc2hvc3Rjb250ZXh0LlxudmFyIF9wb2x5ZmlsbEhvc3RDb250ZXh0ID0gJy1zaGFkb3djc3Njb250ZXh0JztcbnZhciBfcGFyZW5TdWZmaXggPSAnKSg/OlxcXFwoKCcgK1xuICAgICAgICAgICAgICAgICAgICcoPzpcXFxcKFteKShdKlxcXFwpfFteKShdKikrPycgK1xuICAgICAgICAgICAgICAgICAgICcpXFxcXCkpPyhbXix7XSopJztcbnZhciBfY3NzQ29sb25Ib3N0UmUgPSBSZWdFeHBXcmFwcGVyLmNyZWF0ZSgnKCcgKyBfcG9seWZpbGxIb3N0ICsgX3BhcmVuU3VmZml4LCAnaW0nKTtcbnZhciBfY3NzQ29sb25Ib3N0Q29udGV4dFJlID0gUmVnRXhwV3JhcHBlci5jcmVhdGUoJygnICsgX3BvbHlmaWxsSG9zdENvbnRleHQgKyBfcGFyZW5TdWZmaXgsICdpbScpO1xudmFyIF9wb2x5ZmlsbEhvc3ROb0NvbWJpbmF0b3IgPSBfcG9seWZpbGxIb3N0ICsgJy1uby1jb21iaW5hdG9yJztcbnZhciBfc2hhZG93RE9NU2VsZWN0b3JzUmUgPSBbXG4gIC8+Pj4vZyxcbiAgLzo6c2hhZG93L2csXG4gIC86OmNvbnRlbnQvZyxcbiAgLy8gRGVwcmVjYXRlZCBzZWxlY3RvcnNcbiAgLy8gVE9ETyh2aWNiKTogc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2NsYW5nLWZvcm1hdC9pc3N1ZXMvMTZcbiAgLy8gY2xhbmctZm9ybWF0IG9mZlxuICAvXFwvZGVlcFxcLy9nLCAgICAgICAgIC8vIGZvcm1lciA+Pj5cbiAgL1xcL3NoYWRvdy1kZWVwXFwvL2csICAvLyBmb3JtZXIgL2RlZXAvXG4gIC9cXC9zaGFkb3dcXC8vZywgICAgICAgLy8gZm9ybWVyIDo6c2hhZG93XG4gIC8vIGNsYW5mLWZvcm1hdCBvblxuXTtcbnZhciBfc2VsZWN0b3JSZVN1ZmZpeCA9ICcoWz5cXFxcc34rXFxbLix7Ol1bXFxcXHNcXFxcU10qKT8kJztcbnZhciBfcG9seWZpbGxIb3N0UmUgPSBSZWdFeHBXcmFwcGVyLmNyZWF0ZShfcG9seWZpbGxIb3N0LCAnaW0nKTtcbnZhciBfY29sb25Ib3N0UmUgPSAvOmhvc3QvZ2ltO1xudmFyIF9jb2xvbkhvc3RDb250ZXh0UmUgPSAvOmhvc3QtY29udGV4dC9naW07XG5cbnZhciBfY29tbWVudFJlID0gL1xcL1xcKltcXHNcXFNdKj9cXCpcXC8vZztcblxuZnVuY3Rpb24gc3RyaXBDb21tZW50cyhpbnB1dDpzdHJpbmcpOnN0cmluZyB7XG4gIHJldHVybiBTdHJpbmdXcmFwcGVyLnJlcGxhY2VBbGxNYXBwZWQoaW5wdXQsIF9jb21tZW50UmUsIChfKSA9PiAnJyk7XG59XG5cbnZhciBfcnVsZVJlID0gLyhcXHMqKShbXjtcXHtcXH1dKz8pKFxccyopKCg/OnslQkxPQ0slfT9cXHMqOz8pfCg/Olxccyo7KSkvZztcbnZhciBfY3VybHlSZSA9IC8oW3t9XSkvZztcbmNvbnN0IE9QRU5fQ1VSTFkgPSAneyc7XG5jb25zdCBDTE9TRV9DVVJMWSA9ICd9JztcbmNvbnN0IEJMT0NLX1BMQUNFSE9MREVSID0gJyVCTE9DSyUnO1xuXG5leHBvcnQgY2xhc3MgQ3NzUnVsZSB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBzZWxlY3RvcjpzdHJpbmcsIHB1YmxpYyBjb250ZW50OnN0cmluZykge31cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByb2Nlc3NSdWxlcyhpbnB1dDpzdHJpbmcsIHJ1bGVDYWxsYmFjazpGdW5jdGlvbik6c3RyaW5nIHtcbiAgdmFyIGlucHV0V2l0aEVzY2FwZWRCbG9ja3MgPSBlc2NhcGVCbG9ja3MoaW5wdXQpO1xuICB2YXIgbmV4dEJsb2NrSW5kZXggPSAwO1xuICByZXR1cm4gU3RyaW5nV3JhcHBlci5yZXBsYWNlQWxsTWFwcGVkKGlucHV0V2l0aEVzY2FwZWRCbG9ja3MuZXNjYXBlZFN0cmluZywgX3J1bGVSZSwgZnVuY3Rpb24obSkge1xuICAgIHZhciBzZWxlY3RvciA9IG1bMl07XG4gICAgdmFyIGNvbnRlbnQgPSAnJztcbiAgICB2YXIgc3VmZml4ID0gbVs0XTtcbiAgICB2YXIgY29udGVudFByZWZpeCA9ICcnO1xuICAgIGlmIChpc1ByZXNlbnQobVs0XSkgJiYgbVs0XS5zdGFydHNXaXRoKCd7JytCTE9DS19QTEFDRUhPTERFUikpIHtcbiAgICAgIGNvbnRlbnQgPSBpbnB1dFdpdGhFc2NhcGVkQmxvY2tzLmJsb2Nrc1tuZXh0QmxvY2tJbmRleCsrXTtcbiAgICAgIHN1ZmZpeCA9IG1bNF0uc3Vic3RyaW5nKEJMT0NLX1BMQUNFSE9MREVSLmxlbmd0aCsxKTtcbiAgICAgIGNvbnRlbnRQcmVmaXggPSAneyc7XG4gICAgfVxuICAgIHZhciBydWxlID0gcnVsZUNhbGxiYWNrKG5ldyBDc3NSdWxlKHNlbGVjdG9yLCBjb250ZW50KSk7XG4gICAgcmV0dXJuIGAke21bMV19JHtydWxlLnNlbGVjdG9yfSR7bVszXX0ke2NvbnRlbnRQcmVmaXh9JHtydWxlLmNvbnRlbnR9JHtzdWZmaXh9YDtcbiAgfSk7XG59XG5cbmNsYXNzIFN0cmluZ1dpdGhFc2NhcGVkQmxvY2tzIHtcbiAgY29uc3RydWN0b3IocHVibGljIGVzY2FwZWRTdHJpbmc6c3RyaW5nLCBwdWJsaWMgYmxvY2tzOnN0cmluZ1tdKSB7fVxufVxuXG5mdW5jdGlvbiBlc2NhcGVCbG9ja3MoaW5wdXQ6c3RyaW5nKTpTdHJpbmdXaXRoRXNjYXBlZEJsb2NrcyB7XG4gIHZhciBpbnB1dFBhcnRzID0gU3RyaW5nV3JhcHBlci5zcGxpdChpbnB1dCwgX2N1cmx5UmUpO1xuICB2YXIgcmVzdWx0UGFydHMgPSBbXTtcbiAgdmFyIGVzY2FwZWRCbG9ja3MgPSBbXTtcbiAgdmFyIGJyYWNrZXRDb3VudCA9IDA7XG4gIHZhciBjdXJyZW50QmxvY2tQYXJ0cyA9IFtdO1xuICBmb3IgKHZhciBwYXJ0SW5kZXggPSAwOyBwYXJ0SW5kZXg8aW5wdXRQYXJ0cy5sZW5ndGg7IHBhcnRJbmRleCsrKSB7XG4gICAgdmFyIHBhcnQgPSBpbnB1dFBhcnRzW3BhcnRJbmRleF07XG4gICAgaWYgKHBhcnQgPT0gQ0xPU0VfQ1VSTFkpIHtcbiAgICAgIGJyYWNrZXRDb3VudC0tO1xuICAgIH1cbiAgICBpZiAoYnJhY2tldENvdW50ID4gMCkge1xuICAgICAgY3VycmVudEJsb2NrUGFydHMucHVzaChwYXJ0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGN1cnJlbnRCbG9ja1BhcnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgZXNjYXBlZEJsb2Nrcy5wdXNoKGN1cnJlbnRCbG9ja1BhcnRzLmpvaW4oJycpKTtcbiAgICAgICAgcmVzdWx0UGFydHMucHVzaChCTE9DS19QTEFDRUhPTERFUik7XG4gICAgICAgIGN1cnJlbnRCbG9ja1BhcnRzID0gW107XG4gICAgICB9XG4gICAgICByZXN1bHRQYXJ0cy5wdXNoKHBhcnQpO1xuICAgIH1cbiAgICBpZiAocGFydCA9PSBPUEVOX0NVUkxZKSB7XG4gICAgICBicmFja2V0Q291bnQrKztcbiAgICB9XG4gIH1cbiAgaWYgKGN1cnJlbnRCbG9ja1BhcnRzLmxlbmd0aCA+IDApIHtcbiAgICBlc2NhcGVkQmxvY2tzLnB1c2goY3VycmVudEJsb2NrUGFydHMuam9pbignJykpO1xuICAgIHJlc3VsdFBhcnRzLnB1c2goQkxPQ0tfUExBQ0VIT0xERVIpO1xuICB9XG4gIHJldHVybiBuZXcgU3RyaW5nV2l0aEVzY2FwZWRCbG9ja3MocmVzdWx0UGFydHMuam9pbignJyksIGVzY2FwZWRCbG9ja3MpO1xufVxuIl19