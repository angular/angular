'use strict';"use strict";
var collection_1 = require('angular2/src/facade/collection');
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
            var p = parts[i].trim();
            var deepParts = lang_1.StringWrapper.split(p, _shadowDeepSelectors);
            var shallowPart = deepParts[0];
            if (this._selectorNeedsScoping(shallowPart, scopeSelector)) {
                deepParts[0] = strict && !lang_1.StringWrapper.contains(shallowPart, _polyfillHostNoCombinator) ?
                    this._applyStrictSelectorScope(shallowPart, scopeSelector) :
                    this._applySelectorScope(shallowPart, scopeSelector, hostSelector);
            }
            // replace /deep/ with a space for child selectors
            r.push(deepParts.join(' '));
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
}());
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
}());
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
}());
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hhZG93X2Nzcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtcjVQckpLOWgudG1wL2FuZ3VsYXIyL3NyYy9jb21waWxlci9zaGFkb3dfY3NzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSwyQkFBMEIsZ0NBQWdDLENBQUMsQ0FBQTtBQUMzRCxxQkFPTywwQkFBMEIsQ0FBQyxDQUFBO0FBRWxDOzs7Ozs7Ozs7R0FTRztBQUVIOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztFQWlIRTtBQUVGO0lBR0U7UUFGQSxrQkFBYSxHQUFZLElBQUksQ0FBQztJQUVmLENBQUM7SUFFaEI7Ozs7Ozs7TUFPRTtJQUNGLCtCQUFXLEdBQVgsVUFBWSxPQUFlLEVBQUUsUUFBZ0IsRUFBRSxZQUF5QjtRQUF6Qiw0QkFBeUIsR0FBekIsaUJBQXlCO1FBQ3RFLE9BQU8sR0FBRyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDakMsT0FBTyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMxQyxNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLFlBQVksQ0FBQyxDQUFDO0lBQzdELENBQUM7SUFFTyxxQ0FBaUIsR0FBekIsVUFBMEIsT0FBZTtRQUN2QyxPQUFPLEdBQUcsSUFBSSxDQUFDLGtDQUFrQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzNELE1BQU0sQ0FBQyxJQUFJLENBQUMsNkJBQTZCLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDckQsQ0FBQztJQUVEOzs7Ozs7Ozs7Ozs7O09BYUc7SUFDSyxzREFBa0MsR0FBMUMsVUFBMkMsT0FBZTtRQUN4RCw2REFBNkQ7UUFDN0QsTUFBTSxDQUFDLG9CQUFhLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLHlCQUF5QixFQUNsQyxVQUFTLENBQUMsSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzVFLENBQUM7SUFFRDs7Ozs7Ozs7Ozs7Ozs7T0FjRztJQUNLLGlEQUE2QixHQUFyQyxVQUFzQyxPQUFlO1FBQ25ELDZEQUE2RDtRQUM3RCxNQUFNLENBQUMsb0JBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsVUFBUyxDQUFDO1lBQzFFLElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNoQixJQUFJLEdBQUcsb0JBQWEsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUM3QyxJQUFJLEdBQUcsb0JBQWEsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUM3QyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztRQUNyQixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRDs7Ozs7OztNQU9FO0lBQ00saUNBQWEsR0FBckIsVUFBc0IsT0FBZSxFQUFFLGFBQXFCLEVBQUUsWUFBb0I7UUFDaEYsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLGdDQUFnQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzlELE9BQU8sR0FBRyxJQUFJLENBQUMsNEJBQTRCLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDckQsT0FBTyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMxQyxPQUFPLEdBQUcsSUFBSSxDQUFDLHdCQUF3QixDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2pELE9BQU8sR0FBRyxJQUFJLENBQUMsMEJBQTBCLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDbkQsRUFBRSxDQUFDLENBQUMsZ0JBQVMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDN0IsT0FBTyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFLGFBQWEsRUFBRSxZQUFZLENBQUMsQ0FBQztRQUN2RSxDQUFDO1FBQ0QsT0FBTyxHQUFHLE9BQU8sR0FBRyxJQUFJLEdBQUcsUUFBUSxDQUFDO1FBQ3BDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDeEIsQ0FBQztJQUVEOzs7Ozs7Ozs7Ozs7OztPQWNHO0lBQ0ssb0RBQWdDLEdBQXhDLFVBQXlDLE9BQWU7UUFDdEQsNkRBQTZEO1FBQzdELElBQUksQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDZCxJQUFJLE9BQU8sR0FBRyxvQkFBYSxDQUFDLE9BQU8sQ0FBQyx5QkFBeUIsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUN4RSxPQUFPLGdCQUFTLENBQUMsQ0FBQyxHQUFHLDJCQUFvQixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDekQsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2hCLElBQUksR0FBRyxvQkFBYSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQzdDLElBQUksR0FBRyxvQkFBYSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQy9DLENBQUMsSUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLENBQUM7UUFDRCxNQUFNLENBQUMsQ0FBQyxDQUFDO0lBQ1gsQ0FBQztJQUVEOzs7Ozs7TUFNRTtJQUNNLHFDQUFpQixHQUF6QixVQUEwQixPQUFlO1FBQ3ZDLE1BQU0sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsT0FBTyxFQUFFLGVBQWUsRUFBRSxJQUFJLENBQUMsc0JBQXNCLENBQUMsQ0FBQztJQUN2RixDQUFDO0lBRUQ7Ozs7Ozs7Ozs7Ozs7O01BY0U7SUFDTSw0Q0FBd0IsR0FBaEMsVUFBaUMsT0FBZTtRQUM5QyxNQUFNLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sRUFBRSxzQkFBc0IsRUFDL0IsSUFBSSxDQUFDLDZCQUE2QixDQUFDLENBQUM7SUFDcEUsQ0FBQztJQUVPLHFDQUFpQixHQUF6QixVQUEwQixPQUFlLEVBQUUsTUFBYyxFQUFFLFlBQXNCO1FBQy9FLG1EQUFtRDtRQUNuRCxNQUFNLENBQUMsb0JBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLFVBQVMsQ0FBQztZQUMvRCxFQUFFLENBQUMsQ0FBQyxnQkFBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDcEIsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDO2dCQUNwQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztvQkFDdEMsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNqQixFQUFFLENBQUMsQ0FBQyxjQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQUMsS0FBSyxDQUFDO29CQUN0QixDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO29CQUNiLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLHlCQUF5QixFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMzRCxDQUFDO2dCQUNELE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3JCLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDTixNQUFNLENBQUMseUJBQXlCLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzFDLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFTyxpREFBNkIsR0FBckMsVUFBc0MsSUFBWSxFQUFFLElBQVksRUFBRSxNQUFjO1FBQzlFLEVBQUUsQ0FBQyxDQUFDLG9CQUFhLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDaEQsTUFBTSxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ3pELENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNOLE1BQU0sQ0FBQyxJQUFJLEdBQUcsSUFBSSxHQUFHLE1BQU0sR0FBRyxJQUFJLEdBQUcsSUFBSSxHQUFHLEdBQUcsR0FBRyxJQUFJLEdBQUcsTUFBTSxDQUFDO1FBQ2xFLENBQUM7SUFDSCxDQUFDO0lBRU8sMENBQXNCLEdBQTlCLFVBQStCLElBQVksRUFBRSxJQUFZLEVBQUUsTUFBYztRQUN2RSxNQUFNLENBQUMsSUFBSSxHQUFHLG9CQUFhLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxhQUFhLEVBQUUsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDO0lBQ3hFLENBQUM7SUFFRDs7O01BR0U7SUFDTSw4Q0FBMEIsR0FBbEMsVUFBbUMsT0FBZTtRQUNoRCxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLHFCQUFxQixDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ3RELE9BQU8sR0FBRyxvQkFBYSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUscUJBQXFCLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDN0UsQ0FBQztRQUNELE1BQU0sQ0FBQyxPQUFPLENBQUM7SUFDakIsQ0FBQztJQUVELDZDQUE2QztJQUNyQyxtQ0FBZSxHQUF2QixVQUF3QixPQUFlLEVBQUUsYUFBcUIsRUFBRSxZQUFvQjtRQUFwRixpQkFZQztRQVhDLE1BQU0sQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLFVBQUMsSUFBYTtZQUN6QyxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO1lBQzdCLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7WUFDM0IsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNqRSxRQUFRO29CQUNKLEtBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxhQUFhLEVBQUUsWUFBWSxFQUFFLEtBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUMxRixDQUFDO1lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDOUMsT0FBTyxHQUFHLEtBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxhQUFhLEVBQUUsWUFBWSxDQUFDLENBQUM7WUFDNUUsQ0FBQztZQUNELE1BQU0sQ0FBQyxJQUFJLE9BQU8sQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDeEMsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRU8sa0NBQWMsR0FBdEIsVUFBdUIsUUFBZ0IsRUFBRSxhQUFxQixFQUFFLFlBQW9CLEVBQzdELE1BQWU7UUFDcEMsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLEtBQUssR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3hDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ3RDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUN4QixJQUFJLFNBQVMsR0FBRyxvQkFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztZQUM3RCxJQUFJLFdBQVcsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDL0IsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFdBQVcsRUFBRSxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzNELFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxNQUFNLElBQUksQ0FBQyxvQkFBYSxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUseUJBQXlCLENBQUM7b0JBQ3JFLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxXQUFXLEVBQUUsYUFBYSxDQUFDO29CQUMxRCxJQUFJLENBQUMsbUJBQW1CLENBQUMsV0FBVyxFQUFFLGFBQWEsRUFBRSxZQUFZLENBQUMsQ0FBQztZQUN4RixDQUFDO1lBQ0Qsa0RBQWtEO1lBQ2xELENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzlCLENBQUM7UUFDRCxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN0QixDQUFDO0lBRU8seUNBQXFCLEdBQTdCLFVBQThCLFFBQWdCLEVBQUUsYUFBcUI7UUFDbkUsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQy9DLE1BQU0sQ0FBQyxDQUFDLGdCQUFTLENBQUMsb0JBQWEsQ0FBQyxVQUFVLENBQUMsRUFBRSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7SUFDNUQsQ0FBQztJQUVPLHFDQUFpQixHQUF6QixVQUEwQixhQUFxQjtRQUM3QyxJQUFJLEdBQUcsR0FBRyxLQUFLLENBQUM7UUFDaEIsSUFBSSxHQUFHLEdBQUcsS0FBSyxDQUFDO1FBQ2hCLGFBQWEsR0FBRyxvQkFBYSxDQUFDLFVBQVUsQ0FBQyxhQUFhLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3BFLGFBQWEsR0FBRyxvQkFBYSxDQUFDLFVBQVUsQ0FBQyxhQUFhLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3BFLE1BQU0sQ0FBQyxvQkFBYSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsYUFBYSxHQUFHLEdBQUcsR0FBRyxpQkFBaUIsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNuRixDQUFDO0lBRU8sdUNBQW1CLEdBQTNCLFVBQTRCLFFBQWdCLEVBQUUsYUFBcUIsRUFDdkMsWUFBb0I7UUFDOUMsdUVBQXVFO1FBQ3ZFLE1BQU0sQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUMsUUFBUSxFQUFFLGFBQWEsRUFBRSxZQUFZLENBQUMsQ0FBQztJQUMvRSxDQUFDO0lBRUQsK0JBQStCO0lBQ3ZCLDZDQUF5QixHQUFqQyxVQUFrQyxRQUFnQixFQUFFLGFBQXFCLEVBQ3ZDLFlBQW9CO1FBQ3BELEVBQUUsQ0FBQyxDQUFDLGdCQUFTLENBQUMsb0JBQWEsQ0FBQyxVQUFVLENBQUMsZUFBZSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25FLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxhQUFhLEdBQUcsTUFBSSxZQUFZLE1BQUcsR0FBRyxhQUFhLENBQUM7WUFDekUsUUFBUSxHQUFHLG9CQUFhLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSx5QkFBeUIsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUNqRixNQUFNLENBQUMsb0JBQWEsQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLGVBQWUsRUFBRSxTQUFTLEdBQUcsR0FBRyxDQUFDLENBQUM7UUFDOUUsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ04sTUFBTSxDQUFDLGFBQWEsR0FBRyxHQUFHLEdBQUcsUUFBUSxDQUFDO1FBQ3hDLENBQUM7SUFDSCxDQUFDO0lBRUQsK0RBQStEO0lBQy9ELG1GQUFtRjtJQUMzRSw2Q0FBeUIsR0FBakMsVUFBa0MsUUFBZ0IsRUFBRSxhQUFxQjtRQUN2RSxJQUFJLElBQUksR0FBRyxrQkFBa0IsQ0FBQztRQUM5QixhQUFhLEdBQUcsb0JBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLEVBQUUsSUFBSSxFQUFFLFVBQUMsQ0FBQyxJQUFLLE9BQUEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFKLENBQUksQ0FBQyxDQUFDO1FBQ2pGLElBQUksTUFBTSxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsTUFBTSxHQUFHLFFBQVEsRUFBRSxRQUFRLEdBQUcsR0FBRyxHQUFHLGFBQWEsR0FBRyxHQUFHLENBQUM7UUFDM0YsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDdkMsSUFBSSxHQUFHLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3BCLElBQUksS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDOUIsTUFBTSxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBQSxDQUFDO2dCQUNKLDhDQUE4QztnQkFDOUMsSUFBSSxDQUFDLEdBQUcsb0JBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLGVBQWUsRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFDaEUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksQ0FBQyx3QkFBVyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO29CQUNoRCxDQUFDLG9CQUFhLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3pDLElBQUksRUFBRSxHQUFHLGtCQUFrQixDQUFDO29CQUM1QixJQUFJLENBQUMsR0FBRyxvQkFBYSxDQUFDLFVBQVUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7b0JBQ3hDLEVBQUUsQ0FBQyxDQUFDLGdCQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUNqQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLFFBQVEsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNwQyxDQUFDO2dCQUNILENBQUM7Z0JBQ0QsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUNYLENBQUMsQ0FBQztpQkFDRixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDMUIsQ0FBQztRQUNELE1BQU0sQ0FBQyxNQUFNLENBQUM7SUFDaEIsQ0FBQztJQUVPLGdEQUE0QixHQUFwQyxVQUFxQyxRQUFnQjtRQUNuRCxRQUFRLEdBQUcsb0JBQWEsQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLG1CQUFtQixFQUFFLG9CQUFvQixDQUFDLENBQUM7UUFDekYsUUFBUSxHQUFHLG9CQUFhLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxZQUFZLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFDM0UsTUFBTSxDQUFDLFFBQVEsQ0FBQztJQUNsQixDQUFDO0lBQ0gsZ0JBQUM7QUFBRCxDQUFDLEFBOVJELElBOFJDO0FBOVJZLGlCQUFTLFlBOFJyQixDQUFBO0FBQ0QsSUFBSSx5QkFBeUIsR0FDekIsMkVBQTJFLENBQUM7QUFDaEYsSUFBSSxpQkFBaUIsR0FBRyxpRUFBaUUsQ0FBQztBQUMxRixJQUFJLHlCQUF5QixHQUN6QiwwRUFBMEUsQ0FBQztBQUMvRSxJQUFJLGFBQWEsR0FBRyxnQkFBZ0IsQ0FBQztBQUNyQyw4REFBOEQ7QUFDOUQsSUFBSSxvQkFBb0IsR0FBRyxtQkFBbUIsQ0FBQztBQUMvQyxJQUFJLFlBQVksR0FBRyxVQUFVO0lBQ1YsMkJBQTJCO0lBQzNCLGdCQUFnQixDQUFDO0FBQ3BDLElBQUksZUFBZSxHQUFHLG9CQUFhLENBQUMsTUFBTSxDQUFDLEdBQUcsR0FBRyxhQUFhLEdBQUcsWUFBWSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ3JGLElBQUksc0JBQXNCLEdBQUcsb0JBQWEsQ0FBQyxNQUFNLENBQUMsR0FBRyxHQUFHLG9CQUFvQixHQUFHLFlBQVksRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNuRyxJQUFJLHlCQUF5QixHQUFHLGFBQWEsR0FBRyxnQkFBZ0IsQ0FBQztBQUNqRSxJQUFJLHFCQUFxQixHQUFHO0lBQzFCLFdBQVc7SUFDWCxZQUFZO0lBQ1osdUJBQXVCO0lBQ3ZCLG9FQUFvRTtJQUNwRSxtQkFBbUI7SUFDbkIsa0JBQWtCO0lBQ2xCLGFBQWE7Q0FFZCxDQUFDO0FBQ0YsSUFBSSxvQkFBb0IsR0FBRyx1QkFBdUIsQ0FBQztBQUNuRCxJQUFJLGlCQUFpQixHQUFHLDZCQUE2QixDQUFDO0FBQ3RELElBQUksZUFBZSxHQUFHLG9CQUFhLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNoRSxJQUFJLFlBQVksR0FBRyxVQUFVLENBQUM7QUFDOUIsSUFBSSxtQkFBbUIsR0FBRyxrQkFBa0IsQ0FBQztBQUU3QyxJQUFJLFVBQVUsR0FBRyxtQkFBbUIsQ0FBQztBQUVyQyx1QkFBdUIsS0FBWTtJQUNqQyxNQUFNLENBQUMsb0JBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUUsVUFBVSxFQUFFLFVBQUMsQ0FBQyxJQUFLLE9BQUEsRUFBRSxFQUFGLENBQUUsQ0FBQyxDQUFDO0FBQ3RFLENBQUM7QUFFRCxJQUFJLE9BQU8sR0FBRyx1REFBdUQsQ0FBQztBQUN0RSxJQUFJLFFBQVEsR0FBRyxTQUFTLENBQUM7QUFDekIsSUFBTSxVQUFVLEdBQUcsR0FBRyxDQUFDO0FBQ3ZCLElBQU0sV0FBVyxHQUFHLEdBQUcsQ0FBQztBQUN4QixJQUFNLGlCQUFpQixHQUFHLFNBQVMsQ0FBQztBQUVwQztJQUNFLGlCQUFtQixRQUFlLEVBQVMsT0FBYztRQUF0QyxhQUFRLEdBQVIsUUFBUSxDQUFPO1FBQVMsWUFBTyxHQUFQLE9BQU8sQ0FBTztJQUFHLENBQUM7SUFDL0QsY0FBQztBQUFELENBQUMsQUFGRCxJQUVDO0FBRlksZUFBTyxVQUVuQixDQUFBO0FBRUQsc0JBQTZCLEtBQVksRUFBRSxZQUFxQjtJQUM5RCxJQUFJLHNCQUFzQixHQUFHLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNqRCxJQUFJLGNBQWMsR0FBRyxDQUFDLENBQUM7SUFDdkIsTUFBTSxDQUFDLG9CQUFhLENBQUMsZ0JBQWdCLENBQUMsc0JBQXNCLENBQUMsYUFBYSxFQUFFLE9BQU8sRUFBRSxVQUFTLENBQUM7UUFDN0YsSUFBSSxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3BCLElBQUksT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUNqQixJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbEIsSUFBSSxhQUFhLEdBQUcsRUFBRSxDQUFDO1FBQ3ZCLEVBQUUsQ0FBQyxDQUFDLGdCQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxHQUFHLEdBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDOUQsT0FBTyxHQUFHLHNCQUFzQixDQUFDLE1BQU0sQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDO1lBQzFELE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLGlCQUFpQixDQUFDLE1BQU0sR0FBQyxDQUFDLENBQUMsQ0FBQztZQUNwRCxhQUFhLEdBQUcsR0FBRyxDQUFDO1FBQ3RCLENBQUM7UUFDRCxJQUFJLElBQUksR0FBRyxZQUFZLENBQUMsSUFBSSxPQUFPLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDeEQsTUFBTSxDQUFDLEtBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLGFBQWEsR0FBRyxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQVEsQ0FBQztJQUNsRixDQUFDLENBQUMsQ0FBQztBQUNMLENBQUM7QUFoQmUsb0JBQVksZUFnQjNCLENBQUE7QUFFRDtJQUNFLGlDQUFtQixhQUFvQixFQUFTLE1BQWU7UUFBNUMsa0JBQWEsR0FBYixhQUFhLENBQU87UUFBUyxXQUFNLEdBQU4sTUFBTSxDQUFTO0lBQUcsQ0FBQztJQUNyRSw4QkFBQztBQUFELENBQUMsQUFGRCxJQUVDO0FBRUQsc0JBQXNCLEtBQVk7SUFDaEMsSUFBSSxVQUFVLEdBQUcsb0JBQWEsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ3RELElBQUksV0FBVyxHQUFHLEVBQUUsQ0FBQztJQUNyQixJQUFJLGFBQWEsR0FBRyxFQUFFLENBQUM7SUFDdkIsSUFBSSxZQUFZLEdBQUcsQ0FBQyxDQUFDO0lBQ3JCLElBQUksaUJBQWlCLEdBQUcsRUFBRSxDQUFDO0lBQzNCLEdBQUcsQ0FBQyxDQUFDLElBQUksU0FBUyxHQUFHLENBQUMsRUFBRSxTQUFTLEdBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUUsRUFBRSxDQUFDO1FBQ2pFLElBQUksSUFBSSxHQUFHLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNqQyxFQUFFLENBQUMsQ0FBQyxJQUFJLElBQUksV0FBVyxDQUFDLENBQUMsQ0FBQztZQUN4QixZQUFZLEVBQUUsQ0FBQztRQUNqQixDQUFDO1FBQ0QsRUFBRSxDQUFDLENBQUMsWUFBWSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckIsaUJBQWlCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQy9CLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNOLEVBQUUsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNqQyxhQUFhLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUMvQyxXQUFXLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7Z0JBQ3BDLGlCQUFpQixHQUFHLEVBQUUsQ0FBQztZQUN6QixDQUFDO1lBQ0QsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN6QixDQUFDO1FBQ0QsRUFBRSxDQUFDLENBQUMsSUFBSSxJQUFJLFVBQVUsQ0FBQyxDQUFDLENBQUM7WUFDdkIsWUFBWSxFQUFFLENBQUM7UUFDakIsQ0FBQztJQUNILENBQUM7SUFDRCxFQUFFLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNqQyxhQUFhLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQy9DLFdBQVcsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztJQUN0QyxDQUFDO0lBQ0QsTUFBTSxDQUFDLElBQUksdUJBQXVCLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxhQUFhLENBQUMsQ0FBQztBQUMxRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtMaXN0V3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7XG4gIFN0cmluZ1dyYXBwZXIsXG4gIFJlZ0V4cCxcbiAgUmVnRXhwV3JhcHBlcixcbiAgUmVnRXhwTWF0Y2hlcldyYXBwZXIsXG4gIGlzUHJlc2VudCxcbiAgaXNCbGFua1xufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuXG4vKipcbiAqIFRoaXMgZmlsZSBpcyBhIHBvcnQgb2Ygc2hhZG93Q1NTIGZyb20gd2ViY29tcG9uZW50cy5qcyB0byBUeXBlU2NyaXB0LlxuICpcbiAqIFBsZWFzZSBtYWtlIHN1cmUgdG8ga2VlcCB0byBlZGl0cyBpbiBzeW5jIHdpdGggdGhlIHNvdXJjZSBmaWxlLlxuICpcbiAqIFNvdXJjZTpcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS93ZWJjb21wb25lbnRzL3dlYmNvbXBvbmVudHNqcy9ibG9iLzRlZmVjZDdlMGUvc3JjL1NoYWRvd0NTUy9TaGFkb3dDU1MuanNcbiAqXG4gKiBUaGUgb3JpZ2luYWwgZmlsZSBsZXZlbCBjb21tZW50IGlzIHJlcHJvZHVjZWQgYmVsb3dcbiAqL1xuXG4vKlxuICBUaGlzIGlzIGEgbGltaXRlZCBzaGltIGZvciBTaGFkb3dET00gY3NzIHN0eWxpbmcuXG4gIGh0dHBzOi8vZHZjcy53My5vcmcvaGcvd2ViY29tcG9uZW50cy9yYXctZmlsZS90aXAvc3BlYy9zaGFkb3cvaW5kZXguaHRtbCNzdHlsZXNcblxuICBUaGUgaW50ZW50aW9uIGhlcmUgaXMgdG8gc3VwcG9ydCBvbmx5IHRoZSBzdHlsaW5nIGZlYXR1cmVzIHdoaWNoIGNhbiBiZVxuICByZWxhdGl2ZWx5IHNpbXBseSBpbXBsZW1lbnRlZC4gVGhlIGdvYWwgaXMgdG8gYWxsb3cgdXNlcnMgdG8gYXZvaWQgdGhlXG4gIG1vc3Qgb2J2aW91cyBwaXRmYWxscyBhbmQgZG8gc28gd2l0aG91dCBjb21wcm9taXNpbmcgcGVyZm9ybWFuY2Ugc2lnbmlmaWNhbnRseS5cbiAgRm9yIFNoYWRvd0RPTSBzdHlsaW5nIHRoYXQncyBub3QgY292ZXJlZCBoZXJlLCBhIHNldCBvZiBiZXN0IHByYWN0aWNlc1xuICBjYW4gYmUgcHJvdmlkZWQgdGhhdCBzaG91bGQgYWxsb3cgdXNlcnMgdG8gYWNjb21wbGlzaCBtb3JlIGNvbXBsZXggc3R5bGluZy5cblxuICBUaGUgZm9sbG93aW5nIGlzIGEgbGlzdCBvZiBzcGVjaWZpYyBTaGFkb3dET00gc3R5bGluZyBmZWF0dXJlcyBhbmQgYSBicmllZlxuICBkaXNjdXNzaW9uIG9mIHRoZSBhcHByb2FjaCB1c2VkIHRvIHNoaW0uXG5cbiAgU2hpbW1lZCBmZWF0dXJlczpcblxuICAqIDpob3N0LCA6aG9zdC1jb250ZXh0OiBTaGFkb3dET00gYWxsb3dzIHN0eWxpbmcgb2YgdGhlIHNoYWRvd1Jvb3QncyBob3N0XG4gIGVsZW1lbnQgdXNpbmcgdGhlIDpob3N0IHJ1bGUuIFRvIHNoaW0gdGhpcyBmZWF0dXJlLCB0aGUgOmhvc3Qgc3R5bGVzIGFyZVxuICByZWZvcm1hdHRlZCBhbmQgcHJlZml4ZWQgd2l0aCBhIGdpdmVuIHNjb3BlIG5hbWUgYW5kIHByb21vdGVkIHRvIGFcbiAgZG9jdW1lbnQgbGV2ZWwgc3R5bGVzaGVldC5cbiAgRm9yIGV4YW1wbGUsIGdpdmVuIGEgc2NvcGUgbmFtZSBvZiAuZm9vLCBhIHJ1bGUgbGlrZSB0aGlzOlxuXG4gICAgOmhvc3Qge1xuICAgICAgICBiYWNrZ3JvdW5kOiByZWQ7XG4gICAgICB9XG4gICAgfVxuXG4gIGJlY29tZXM6XG5cbiAgICAuZm9vIHtcbiAgICAgIGJhY2tncm91bmQ6IHJlZDtcbiAgICB9XG5cbiAgKiBlbmNhcHN1bHRpb246IFN0eWxlcyBkZWZpbmVkIHdpdGhpbiBTaGFkb3dET00sIGFwcGx5IG9ubHkgdG9cbiAgZG9tIGluc2lkZSB0aGUgU2hhZG93RE9NLiBQb2x5bWVyIHVzZXMgb25lIG9mIHR3byB0ZWNobmlxdWVzIHRvIGltcGxlbWVudFxuICB0aGlzIGZlYXR1cmUuXG5cbiAgQnkgZGVmYXVsdCwgcnVsZXMgYXJlIHByZWZpeGVkIHdpdGggdGhlIGhvc3QgZWxlbWVudCB0YWcgbmFtZVxuICBhcyBhIGRlc2NlbmRhbnQgc2VsZWN0b3IuIFRoaXMgZW5zdXJlcyBzdHlsaW5nIGRvZXMgbm90IGxlYWsgb3V0IG9mIHRoZSAndG9wJ1xuICBvZiB0aGUgZWxlbWVudCdzIFNoYWRvd0RPTS4gRm9yIGV4YW1wbGUsXG5cbiAgZGl2IHtcbiAgICAgIGZvbnQtd2VpZ2h0OiBib2xkO1xuICAgIH1cblxuICBiZWNvbWVzOlxuXG4gIHgtZm9vIGRpdiB7XG4gICAgICBmb250LXdlaWdodDogYm9sZDtcbiAgICB9XG5cbiAgYmVjb21lczpcblxuXG4gIEFsdGVybmF0aXZlbHksIGlmIFdlYkNvbXBvbmVudHMuU2hhZG93Q1NTLnN0cmljdFN0eWxpbmcgaXMgc2V0IHRvIHRydWUgdGhlblxuICBzZWxlY3RvcnMgYXJlIHNjb3BlZCBieSBhZGRpbmcgYW4gYXR0cmlidXRlIHNlbGVjdG9yIHN1ZmZpeCB0byBlYWNoXG4gIHNpbXBsZSBzZWxlY3RvciB0aGF0IGNvbnRhaW5zIHRoZSBob3N0IGVsZW1lbnQgdGFnIG5hbWUuIEVhY2ggZWxlbWVudFxuICBpbiB0aGUgZWxlbWVudCdzIFNoYWRvd0RPTSB0ZW1wbGF0ZSBpcyBhbHNvIGdpdmVuIHRoZSBzY29wZSBhdHRyaWJ1dGUuXG4gIFRodXMsIHRoZXNlIHJ1bGVzIG1hdGNoIG9ubHkgZWxlbWVudHMgdGhhdCBoYXZlIHRoZSBzY29wZSBhdHRyaWJ1dGUuXG4gIEZvciBleGFtcGxlLCBnaXZlbiBhIHNjb3BlIG5hbWUgb2YgeC1mb28sIGEgcnVsZSBsaWtlIHRoaXM6XG5cbiAgICBkaXYge1xuICAgICAgZm9udC13ZWlnaHQ6IGJvbGQ7XG4gICAgfVxuXG4gIGJlY29tZXM6XG5cbiAgICBkaXZbeC1mb29dIHtcbiAgICAgIGZvbnQtd2VpZ2h0OiBib2xkO1xuICAgIH1cblxuICBOb3RlIHRoYXQgZWxlbWVudHMgdGhhdCBhcmUgZHluYW1pY2FsbHkgYWRkZWQgdG8gYSBzY29wZSBtdXN0IGhhdmUgdGhlIHNjb3BlXG4gIHNlbGVjdG9yIGFkZGVkIHRvIHRoZW0gbWFudWFsbHkuXG5cbiAgKiB1cHBlci9sb3dlciBib3VuZCBlbmNhcHN1bGF0aW9uOiBTdHlsZXMgd2hpY2ggYXJlIGRlZmluZWQgb3V0c2lkZSBhXG4gIHNoYWRvd1Jvb3Qgc2hvdWxkIG5vdCBjcm9zcyB0aGUgU2hhZG93RE9NIGJvdW5kYXJ5IGFuZCBzaG91bGQgbm90IGFwcGx5XG4gIGluc2lkZSBhIHNoYWRvd1Jvb3QuXG5cbiAgVGhpcyBzdHlsaW5nIGJlaGF2aW9yIGlzIG5vdCBlbXVsYXRlZC4gU29tZSBwb3NzaWJsZSB3YXlzIHRvIGRvIHRoaXMgdGhhdFxuICB3ZXJlIHJlamVjdGVkIGR1ZSB0byBjb21wbGV4aXR5IGFuZC9vciBwZXJmb3JtYW5jZSBjb25jZXJucyBpbmNsdWRlOiAoMSkgcmVzZXRcbiAgZXZlcnkgcG9zc2libGUgcHJvcGVydHkgZm9yIGV2ZXJ5IHBvc3NpYmxlIHNlbGVjdG9yIGZvciBhIGdpdmVuIHNjb3BlIG5hbWU7XG4gICgyKSByZS1pbXBsZW1lbnQgY3NzIGluIGphdmFzY3JpcHQuXG5cbiAgQXMgYW4gYWx0ZXJuYXRpdmUsIHVzZXJzIHNob3VsZCBtYWtlIHN1cmUgdG8gdXNlIHNlbGVjdG9yc1xuICBzcGVjaWZpYyB0byB0aGUgc2NvcGUgaW4gd2hpY2ggdGhleSBhcmUgd29ya2luZy5cblxuICAqIDo6ZGlzdHJpYnV0ZWQ6IFRoaXMgYmVoYXZpb3IgaXMgbm90IGVtdWxhdGVkLiBJdCdzIG9mdGVuIG5vdCBuZWNlc3NhcnlcbiAgdG8gc3R5bGUgdGhlIGNvbnRlbnRzIG9mIGEgc3BlY2lmaWMgaW5zZXJ0aW9uIHBvaW50IGFuZCBpbnN0ZWFkLCBkZXNjZW5kYW50c1xuICBvZiB0aGUgaG9zdCBlbGVtZW50IGNhbiBiZSBzdHlsZWQgc2VsZWN0aXZlbHkuIFVzZXJzIGNhbiBhbHNvIGNyZWF0ZSBhblxuICBleHRyYSBub2RlIGFyb3VuZCBhbiBpbnNlcnRpb24gcG9pbnQgYW5kIHN0eWxlIHRoYXQgbm9kZSdzIGNvbnRlbnRzXG4gIHZpYSBkZXNjZW5kZW50IHNlbGVjdG9ycy4gRm9yIGV4YW1wbGUsIHdpdGggYSBzaGFkb3dSb290IGxpa2UgdGhpczpcblxuICAgIDxzdHlsZT5cbiAgICAgIDo6Y29udGVudChkaXYpIHtcbiAgICAgICAgYmFja2dyb3VuZDogcmVkO1xuICAgICAgfVxuICAgIDwvc3R5bGU+XG4gICAgPGNvbnRlbnQ+PC9jb250ZW50PlxuXG4gIGNvdWxkIGJlY29tZTpcblxuICAgIDxzdHlsZT5cbiAgICAgIC8gKkBwb2x5ZmlsbCAuY29udGVudC1jb250YWluZXIgZGl2ICogL1xuICAgICAgOjpjb250ZW50KGRpdikge1xuICAgICAgICBiYWNrZ3JvdW5kOiByZWQ7XG4gICAgICB9XG4gICAgPC9zdHlsZT5cbiAgICA8ZGl2IGNsYXNzPVwiY29udGVudC1jb250YWluZXJcIj5cbiAgICAgIDxjb250ZW50PjwvY29udGVudD5cbiAgICA8L2Rpdj5cblxuICBOb3RlIHRoZSB1c2Ugb2YgQHBvbHlmaWxsIGluIHRoZSBjb21tZW50IGFib3ZlIGEgU2hhZG93RE9NIHNwZWNpZmljIHN0eWxlXG4gIGRlY2xhcmF0aW9uLiBUaGlzIGlzIGEgZGlyZWN0aXZlIHRvIHRoZSBzdHlsaW5nIHNoaW0gdG8gdXNlIHRoZSBzZWxlY3RvclxuICBpbiBjb21tZW50cyBpbiBsaWV1IG9mIHRoZSBuZXh0IHNlbGVjdG9yIHdoZW4gcnVubmluZyB1bmRlciBwb2x5ZmlsbC5cbiovXG5cbmV4cG9ydCBjbGFzcyBTaGFkb3dDc3Mge1xuICBzdHJpY3RTdHlsaW5nOiBib29sZWFuID0gdHJ1ZTtcblxuICBjb25zdHJ1Y3RvcigpIHt9XG5cbiAgLypcbiAgKiBTaGltIHNvbWUgY3NzVGV4dCB3aXRoIHRoZSBnaXZlbiBzZWxlY3Rvci4gUmV0dXJucyBjc3NUZXh0IHRoYXQgY2FuXG4gICogYmUgaW5jbHVkZWQgaW4gdGhlIGRvY3VtZW50IHZpYSBXZWJDb21wb25lbnRzLlNoYWRvd0NTUy5hZGRDc3NUb0RvY3VtZW50KGNzcykuXG4gICpcbiAgKiBXaGVuIHN0cmljdFN0eWxpbmcgaXMgdHJ1ZTpcbiAgKiAtIHNlbGVjdG9yIGlzIHRoZSBhdHRyaWJ1dGUgYWRkZWQgdG8gYWxsIGVsZW1lbnRzIGluc2lkZSB0aGUgaG9zdCxcbiAgKiAtIGhvc3RTZWxlY3RvciBpcyB0aGUgYXR0cmlidXRlIGFkZGVkIHRvIHRoZSBob3N0IGl0c2VsZi5cbiAgKi9cbiAgc2hpbUNzc1RleHQoY3NzVGV4dDogc3RyaW5nLCBzZWxlY3Rvcjogc3RyaW5nLCBob3N0U2VsZWN0b3I6IHN0cmluZyA9ICcnKTogc3RyaW5nIHtcbiAgICBjc3NUZXh0ID0gc3RyaXBDb21tZW50cyhjc3NUZXh0KTtcbiAgICBjc3NUZXh0ID0gdGhpcy5faW5zZXJ0RGlyZWN0aXZlcyhjc3NUZXh0KTtcbiAgICByZXR1cm4gdGhpcy5fc2NvcGVDc3NUZXh0KGNzc1RleHQsIHNlbGVjdG9yLCBob3N0U2VsZWN0b3IpO1xuICB9XG5cbiAgcHJpdmF0ZSBfaW5zZXJ0RGlyZWN0aXZlcyhjc3NUZXh0OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGNzc1RleHQgPSB0aGlzLl9pbnNlcnRQb2x5ZmlsbERpcmVjdGl2ZXNJbkNzc1RleHQoY3NzVGV4dCk7XG4gICAgcmV0dXJuIHRoaXMuX2luc2VydFBvbHlmaWxsUnVsZXNJbkNzc1RleHQoY3NzVGV4dCk7XG4gIH1cblxuICAvKlxuICAgKiBQcm9jZXNzIHN0eWxlcyB0byBjb252ZXJ0IG5hdGl2ZSBTaGFkb3dET00gcnVsZXMgdGhhdCB3aWxsIHRyaXBcbiAgICogdXAgdGhlIGNzcyBwYXJzZXI7IHdlIHJlbHkgb24gZGVjb3JhdGluZyB0aGUgc3R5bGVzaGVldCB3aXRoIGluZXJ0IHJ1bGVzLlxuICAgKlxuICAgKiBGb3IgZXhhbXBsZSwgd2UgY29udmVydCB0aGlzIHJ1bGU6XG4gICAqXG4gICAqIHBvbHlmaWxsLW5leHQtc2VsZWN0b3IgeyBjb250ZW50OiAnOmhvc3QgbWVudS1pdGVtJzsgfVxuICAgKiA6OmNvbnRlbnQgbWVudS1pdGVtIHtcbiAgICpcbiAgICogdG8gdGhpczpcbiAgICpcbiAgICogc2NvcGVOYW1lIG1lbnUtaXRlbSB7XG4gICAqXG4gICoqL1xuICBwcml2YXRlIF9pbnNlcnRQb2x5ZmlsbERpcmVjdGl2ZXNJbkNzc1RleHQoY3NzVGV4dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAvLyBEaWZmZXJlbmNlIHdpdGggd2ViY29tcG9uZW50cy5qczogZG9lcyBub3QgaGFuZGxlIGNvbW1lbnRzXG4gICAgcmV0dXJuIFN0cmluZ1dyYXBwZXIucmVwbGFjZUFsbE1hcHBlZChjc3NUZXh0LCBfY3NzQ29udGVudE5leHRTZWxlY3RvclJlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24obSkgeyByZXR1cm4gbVsxXSArICd7JzsgfSk7XG4gIH1cblxuICAvKlxuICAgKiBQcm9jZXNzIHN0eWxlcyB0byBhZGQgcnVsZXMgd2hpY2ggd2lsbCBvbmx5IGFwcGx5IHVuZGVyIHRoZSBwb2x5ZmlsbFxuICAgKlxuICAgKiBGb3IgZXhhbXBsZSwgd2UgY29udmVydCB0aGlzIHJ1bGU6XG4gICAqXG4gICAqIHBvbHlmaWxsLXJ1bGUge1xuICAgKiAgIGNvbnRlbnQ6ICc6aG9zdCBtZW51LWl0ZW0nO1xuICAgKiAuLi5cbiAgICogfVxuICAgKlxuICAgKiB0byB0aGlzOlxuICAgKlxuICAgKiBzY29wZU5hbWUgbWVudS1pdGVtIHsuLi59XG4gICAqXG4gICoqL1xuICBwcml2YXRlIF9pbnNlcnRQb2x5ZmlsbFJ1bGVzSW5Dc3NUZXh0KGNzc1RleHQ6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgLy8gRGlmZmVyZW5jZSB3aXRoIHdlYmNvbXBvbmVudHMuanM6IGRvZXMgbm90IGhhbmRsZSBjb21tZW50c1xuICAgIHJldHVybiBTdHJpbmdXcmFwcGVyLnJlcGxhY2VBbGxNYXBwZWQoY3NzVGV4dCwgX2Nzc0NvbnRlbnRSdWxlUmUsIGZ1bmN0aW9uKG0pIHtcbiAgICAgIHZhciBydWxlID0gbVswXTtcbiAgICAgIHJ1bGUgPSBTdHJpbmdXcmFwcGVyLnJlcGxhY2UocnVsZSwgbVsxXSwgJycpO1xuICAgICAgcnVsZSA9IFN0cmluZ1dyYXBwZXIucmVwbGFjZShydWxlLCBtWzJdLCAnJyk7XG4gICAgICByZXR1cm4gbVszXSArIHJ1bGU7XG4gICAgfSk7XG4gIH1cblxuICAvKiBFbnN1cmUgc3R5bGVzIGFyZSBzY29wZWQuIFBzZXVkby1zY29waW5nIHRha2VzIGEgcnVsZSBsaWtlOlxuICAgKlxuICAgKiAgLmZvbyB7Li4uIH1cbiAgICpcbiAgICogIGFuZCBjb252ZXJ0cyB0aGlzIHRvXG4gICAqXG4gICAqICBzY29wZU5hbWUgLmZvbyB7IC4uLiB9XG4gICovXG4gIHByaXZhdGUgX3Njb3BlQ3NzVGV4dChjc3NUZXh0OiBzdHJpbmcsIHNjb3BlU2VsZWN0b3I6IHN0cmluZywgaG9zdFNlbGVjdG9yOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHZhciB1bnNjb3BlZCA9IHRoaXMuX2V4dHJhY3RVbnNjb3BlZFJ1bGVzRnJvbUNzc1RleHQoY3NzVGV4dCk7XG4gICAgY3NzVGV4dCA9IHRoaXMuX2luc2VydFBvbHlmaWxsSG9zdEluQ3NzVGV4dChjc3NUZXh0KTtcbiAgICBjc3NUZXh0ID0gdGhpcy5fY29udmVydENvbG9uSG9zdChjc3NUZXh0KTtcbiAgICBjc3NUZXh0ID0gdGhpcy5fY29udmVydENvbG9uSG9zdENvbnRleHQoY3NzVGV4dCk7XG4gICAgY3NzVGV4dCA9IHRoaXMuX2NvbnZlcnRTaGFkb3dET01TZWxlY3RvcnMoY3NzVGV4dCk7XG4gICAgaWYgKGlzUHJlc2VudChzY29wZVNlbGVjdG9yKSkge1xuICAgICAgY3NzVGV4dCA9IHRoaXMuX3Njb3BlU2VsZWN0b3JzKGNzc1RleHQsIHNjb3BlU2VsZWN0b3IsIGhvc3RTZWxlY3Rvcik7XG4gICAgfVxuICAgIGNzc1RleHQgPSBjc3NUZXh0ICsgJ1xcbicgKyB1bnNjb3BlZDtcbiAgICByZXR1cm4gY3NzVGV4dC50cmltKCk7XG4gIH1cblxuICAvKlxuICAgKiBQcm9jZXNzIHN0eWxlcyB0byBhZGQgcnVsZXMgd2hpY2ggd2lsbCBvbmx5IGFwcGx5IHVuZGVyIHRoZSBwb2x5ZmlsbFxuICAgKiBhbmQgZG8gbm90IHByb2Nlc3MgdmlhIENTU09NLiAoQ1NTT00gaXMgZGVzdHJ1Y3RpdmUgdG8gcnVsZXMgb24gcmFyZVxuICAgKiBvY2Nhc2lvbnMsIGUuZy4gLXdlYmtpdC1jYWxjIG9uIFNhZmFyaS4pXG4gICAqIEZvciBleGFtcGxlLCB3ZSBjb252ZXJ0IHRoaXMgcnVsZTpcbiAgICpcbiAgICogQHBvbHlmaWxsLXVuc2NvcGVkLXJ1bGUge1xuICAgKiAgIGNvbnRlbnQ6ICdtZW51LWl0ZW0nO1xuICAgKiAuLi4gfVxuICAgKlxuICAgKiB0byB0aGlzOlxuICAgKlxuICAgKiBtZW51LWl0ZW0gey4uLn1cbiAgICpcbiAgKiovXG4gIHByaXZhdGUgX2V4dHJhY3RVbnNjb3BlZFJ1bGVzRnJvbUNzc1RleHQoY3NzVGV4dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAvLyBEaWZmZXJlbmNlIHdpdGggd2ViY29tcG9uZW50cy5qczogZG9lcyBub3QgaGFuZGxlIGNvbW1lbnRzXG4gICAgdmFyIHIgPSAnJywgbTtcbiAgICB2YXIgbWF0Y2hlciA9IFJlZ0V4cFdyYXBwZXIubWF0Y2hlcihfY3NzQ29udGVudFVuc2NvcGVkUnVsZVJlLCBjc3NUZXh0KTtcbiAgICB3aGlsZSAoaXNQcmVzZW50KG0gPSBSZWdFeHBNYXRjaGVyV3JhcHBlci5uZXh0KG1hdGNoZXIpKSkge1xuICAgICAgdmFyIHJ1bGUgPSBtWzBdO1xuICAgICAgcnVsZSA9IFN0cmluZ1dyYXBwZXIucmVwbGFjZShydWxlLCBtWzJdLCAnJyk7XG4gICAgICBydWxlID0gU3RyaW5nV3JhcHBlci5yZXBsYWNlKHJ1bGUsIG1bMV0sIG1bM10pO1xuICAgICAgciArPSBydWxlICsgJ1xcblxcbic7XG4gICAgfVxuICAgIHJldHVybiByO1xuICB9XG5cbiAgLypcbiAgICogY29udmVydCBhIHJ1bGUgbGlrZSA6aG9zdCguZm9vKSA+IC5iYXIgeyB9XG4gICAqXG4gICAqIHRvXG4gICAqXG4gICAqIHNjb3BlTmFtZS5mb28gPiAuYmFyXG4gICovXG4gIHByaXZhdGUgX2NvbnZlcnRDb2xvbkhvc3QoY3NzVGV4dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fY29udmVydENvbG9uUnVsZShjc3NUZXh0LCBfY3NzQ29sb25Ib3N0UmUsIHRoaXMuX2NvbG9uSG9zdFBhcnRSZXBsYWNlcik7XG4gIH1cblxuICAvKlxuICAgKiBjb252ZXJ0IGEgcnVsZSBsaWtlIDpob3N0LWNvbnRleHQoLmZvbykgPiAuYmFyIHsgfVxuICAgKlxuICAgKiB0b1xuICAgKlxuICAgKiBzY29wZU5hbWUuZm9vID4gLmJhciwgLmZvbyBzY29wZU5hbWUgPiAuYmFyIHsgfVxuICAgKlxuICAgKiBhbmRcbiAgICpcbiAgICogOmhvc3QtY29udGV4dCguZm9vOmhvc3QpIC5iYXIgeyAuLi4gfVxuICAgKlxuICAgKiB0b1xuICAgKlxuICAgKiBzY29wZU5hbWUuZm9vIC5iYXIgeyAuLi4gfVxuICAqL1xuICBwcml2YXRlIF9jb252ZXJ0Q29sb25Ib3N0Q29udGV4dChjc3NUZXh0OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9jb252ZXJ0Q29sb25SdWxlKGNzc1RleHQsIF9jc3NDb2xvbkhvc3RDb250ZXh0UmUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fY29sb25Ib3N0Q29udGV4dFBhcnRSZXBsYWNlcik7XG4gIH1cblxuICBwcml2YXRlIF9jb252ZXJ0Q29sb25SdWxlKGNzc1RleHQ6IHN0cmluZywgcmVnRXhwOiBSZWdFeHAsIHBhcnRSZXBsYWNlcjogRnVuY3Rpb24pOiBzdHJpbmcge1xuICAgIC8vIHAxID0gOmhvc3QsIHAyID0gY29udGVudHMgb2YgKCksIHAzIHJlc3Qgb2YgcnVsZVxuICAgIHJldHVybiBTdHJpbmdXcmFwcGVyLnJlcGxhY2VBbGxNYXBwZWQoY3NzVGV4dCwgcmVnRXhwLCBmdW5jdGlvbihtKSB7XG4gICAgICBpZiAoaXNQcmVzZW50KG1bMl0pKSB7XG4gICAgICAgIHZhciBwYXJ0cyA9IG1bMl0uc3BsaXQoJywnKSwgciA9IFtdO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhcnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgdmFyIHAgPSBwYXJ0c1tpXTtcbiAgICAgICAgICBpZiAoaXNCbGFuayhwKSkgYnJlYWs7XG4gICAgICAgICAgcCA9IHAudHJpbSgpO1xuICAgICAgICAgIHIucHVzaChwYXJ0UmVwbGFjZXIoX3BvbHlmaWxsSG9zdE5vQ29tYmluYXRvciwgcCwgbVszXSkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByLmpvaW4oJywnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBfcG9seWZpbGxIb3N0Tm9Db21iaW5hdG9yICsgbVszXTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2NvbG9uSG9zdENvbnRleHRQYXJ0UmVwbGFjZXIoaG9zdDogc3RyaW5nLCBwYXJ0OiBzdHJpbmcsIHN1ZmZpeDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBpZiAoU3RyaW5nV3JhcHBlci5jb250YWlucyhwYXJ0LCBfcG9seWZpbGxIb3N0KSkge1xuICAgICAgcmV0dXJuIHRoaXMuX2NvbG9uSG9zdFBhcnRSZXBsYWNlcihob3N0LCBwYXJ0LCBzdWZmaXgpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gaG9zdCArIHBhcnQgKyBzdWZmaXggKyAnLCAnICsgcGFydCArICcgJyArIGhvc3QgKyBzdWZmaXg7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfY29sb25Ib3N0UGFydFJlcGxhY2VyKGhvc3Q6IHN0cmluZywgcGFydDogc3RyaW5nLCBzdWZmaXg6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGhvc3QgKyBTdHJpbmdXcmFwcGVyLnJlcGxhY2UocGFydCwgX3BvbHlmaWxsSG9zdCwgJycpICsgc3VmZml4O1xuICB9XG5cbiAgLypcbiAgICogQ29udmVydCBjb21iaW5hdG9ycyBsaWtlIDo6c2hhZG93IGFuZCBwc2V1ZG8tZWxlbWVudHMgbGlrZSA6OmNvbnRlbnRcbiAgICogYnkgcmVwbGFjaW5nIHdpdGggc3BhY2UuXG4gICovXG4gIHByaXZhdGUgX2NvbnZlcnRTaGFkb3dET01TZWxlY3RvcnMoY3NzVGV4dDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IF9zaGFkb3dET01TZWxlY3RvcnNSZS5sZW5ndGg7IGkrKykge1xuICAgICAgY3NzVGV4dCA9IFN0cmluZ1dyYXBwZXIucmVwbGFjZUFsbChjc3NUZXh0LCBfc2hhZG93RE9NU2VsZWN0b3JzUmVbaV0sICcgJyk7XG4gICAgfVxuICAgIHJldHVybiBjc3NUZXh0O1xuICB9XG5cbiAgLy8gY2hhbmdlIGEgc2VsZWN0b3IgbGlrZSAnZGl2JyB0byAnbmFtZSBkaXYnXG4gIHByaXZhdGUgX3Njb3BlU2VsZWN0b3JzKGNzc1RleHQ6IHN0cmluZywgc2NvcGVTZWxlY3Rvcjogc3RyaW5nLCBob3N0U2VsZWN0b3I6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHByb2Nlc3NSdWxlcyhjc3NUZXh0LCAocnVsZTogQ3NzUnVsZSkgPT4ge1xuICAgICAgdmFyIHNlbGVjdG9yID0gcnVsZS5zZWxlY3RvcjtcbiAgICAgIHZhciBjb250ZW50ID0gcnVsZS5jb250ZW50O1xuICAgICAgaWYgKHJ1bGUuc2VsZWN0b3JbMF0gIT0gJ0AnIHx8IHJ1bGUuc2VsZWN0b3Iuc3RhcnRzV2l0aCgnQHBhZ2UnKSkge1xuICAgICAgICBzZWxlY3RvciA9XG4gICAgICAgICAgICB0aGlzLl9zY29wZVNlbGVjdG9yKHJ1bGUuc2VsZWN0b3IsIHNjb3BlU2VsZWN0b3IsIGhvc3RTZWxlY3RvciwgdGhpcy5zdHJpY3RTdHlsaW5nKTtcbiAgICAgIH0gZWxzZSBpZiAocnVsZS5zZWxlY3Rvci5zdGFydHNXaXRoKCdAbWVkaWEnKSkge1xuICAgICAgICBjb250ZW50ID0gdGhpcy5fc2NvcGVTZWxlY3RvcnMocnVsZS5jb250ZW50LCBzY29wZVNlbGVjdG9yLCBob3N0U2VsZWN0b3IpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyBDc3NSdWxlKHNlbGVjdG9yLCBjb250ZW50KTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX3Njb3BlU2VsZWN0b3Ioc2VsZWN0b3I6IHN0cmluZywgc2NvcGVTZWxlY3Rvcjogc3RyaW5nLCBob3N0U2VsZWN0b3I6IHN0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgICBzdHJpY3Q6IGJvb2xlYW4pOiBzdHJpbmcge1xuICAgIHZhciByID0gW10sIHBhcnRzID0gc2VsZWN0b3Iuc3BsaXQoJywnKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhcnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgcCA9IHBhcnRzW2ldLnRyaW0oKTtcbiAgICAgIHZhciBkZWVwUGFydHMgPSBTdHJpbmdXcmFwcGVyLnNwbGl0KHAsIF9zaGFkb3dEZWVwU2VsZWN0b3JzKTtcbiAgICAgIHZhciBzaGFsbG93UGFydCA9IGRlZXBQYXJ0c1swXTtcbiAgICAgIGlmICh0aGlzLl9zZWxlY3Rvck5lZWRzU2NvcGluZyhzaGFsbG93UGFydCwgc2NvcGVTZWxlY3RvcikpIHtcbiAgICAgICAgZGVlcFBhcnRzWzBdID0gc3RyaWN0ICYmICFTdHJpbmdXcmFwcGVyLmNvbnRhaW5zKHNoYWxsb3dQYXJ0LCBfcG9seWZpbGxIb3N0Tm9Db21iaW5hdG9yKSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9hcHBseVN0cmljdFNlbGVjdG9yU2NvcGUoc2hhbGxvd1BhcnQsIHNjb3BlU2VsZWN0b3IpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2FwcGx5U2VsZWN0b3JTY29wZShzaGFsbG93UGFydCwgc2NvcGVTZWxlY3RvciwgaG9zdFNlbGVjdG9yKTtcbiAgICAgIH1cbiAgICAgIC8vIHJlcGxhY2UgL2RlZXAvIHdpdGggYSBzcGFjZSBmb3IgY2hpbGQgc2VsZWN0b3JzXG4gICAgICByLnB1c2goZGVlcFBhcnRzLmpvaW4oJyAnKSk7XG4gICAgfVxuICAgIHJldHVybiByLmpvaW4oJywgJyk7XG4gIH1cblxuICBwcml2YXRlIF9zZWxlY3Rvck5lZWRzU2NvcGluZyhzZWxlY3Rvcjogc3RyaW5nLCBzY29wZVNlbGVjdG9yOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICB2YXIgcmUgPSB0aGlzLl9tYWtlU2NvcGVNYXRjaGVyKHNjb3BlU2VsZWN0b3IpO1xuICAgIHJldHVybiAhaXNQcmVzZW50KFJlZ0V4cFdyYXBwZXIuZmlyc3RNYXRjaChyZSwgc2VsZWN0b3IpKTtcbiAgfVxuXG4gIHByaXZhdGUgX21ha2VTY29wZU1hdGNoZXIoc2NvcGVTZWxlY3Rvcjogc3RyaW5nKTogUmVnRXhwIHtcbiAgICB2YXIgbHJlID0gL1xcWy9nO1xuICAgIHZhciBycmUgPSAvXFxdL2c7XG4gICAgc2NvcGVTZWxlY3RvciA9IFN0cmluZ1dyYXBwZXIucmVwbGFjZUFsbChzY29wZVNlbGVjdG9yLCBscmUsICdcXFxcWycpO1xuICAgIHNjb3BlU2VsZWN0b3IgPSBTdHJpbmdXcmFwcGVyLnJlcGxhY2VBbGwoc2NvcGVTZWxlY3RvciwgcnJlLCAnXFxcXF0nKTtcbiAgICByZXR1cm4gUmVnRXhwV3JhcHBlci5jcmVhdGUoJ14oJyArIHNjb3BlU2VsZWN0b3IgKyAnKScgKyBfc2VsZWN0b3JSZVN1ZmZpeCwgJ20nKTtcbiAgfVxuXG4gIHByaXZhdGUgX2FwcGx5U2VsZWN0b3JTY29wZShzZWxlY3Rvcjogc3RyaW5nLCBzY29wZVNlbGVjdG9yOiBzdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBob3N0U2VsZWN0b3I6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgLy8gRGlmZmVyZW5jZSBmcm9tIHdlYmNvbXBvbmVudHNqczogc2NvcGVTZWxlY3RvciBjb3VsZCBub3QgYmUgYW4gYXJyYXlcbiAgICByZXR1cm4gdGhpcy5fYXBwbHlTaW1wbGVTZWxlY3RvclNjb3BlKHNlbGVjdG9yLCBzY29wZVNlbGVjdG9yLCBob3N0U2VsZWN0b3IpO1xuICB9XG5cbiAgLy8gc2NvcGUgdmlhIG5hbWUgYW5kIFtpcz1uYW1lXVxuICBwcml2YXRlIF9hcHBseVNpbXBsZVNlbGVjdG9yU2NvcGUoc2VsZWN0b3I6IHN0cmluZywgc2NvcGVTZWxlY3Rvcjogc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaG9zdFNlbGVjdG9yOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGlmIChpc1ByZXNlbnQoUmVnRXhwV3JhcHBlci5maXJzdE1hdGNoKF9wb2x5ZmlsbEhvc3RSZSwgc2VsZWN0b3IpKSkge1xuICAgICAgdmFyIHJlcGxhY2VCeSA9IHRoaXMuc3RyaWN0U3R5bGluZyA/IGBbJHtob3N0U2VsZWN0b3J9XWAgOiBzY29wZVNlbGVjdG9yO1xuICAgICAgc2VsZWN0b3IgPSBTdHJpbmdXcmFwcGVyLnJlcGxhY2Uoc2VsZWN0b3IsIF9wb2x5ZmlsbEhvc3ROb0NvbWJpbmF0b3IsIHJlcGxhY2VCeSk7XG4gICAgICByZXR1cm4gU3RyaW5nV3JhcHBlci5yZXBsYWNlQWxsKHNlbGVjdG9yLCBfcG9seWZpbGxIb3N0UmUsIHJlcGxhY2VCeSArICcgJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBzY29wZVNlbGVjdG9yICsgJyAnICsgc2VsZWN0b3I7XG4gICAgfVxuICB9XG5cbiAgLy8gcmV0dXJuIGEgc2VsZWN0b3Igd2l0aCBbbmFtZV0gc3VmZml4IG9uIGVhY2ggc2ltcGxlIHNlbGVjdG9yXG4gIC8vIGUuZy4gLmZvby5iYXIgPiAuem90IGJlY29tZXMgLmZvb1tuYW1lXS5iYXJbbmFtZV0gPiAuem90W25hbWVdICAvKiogQGludGVybmFsICovXG4gIHByaXZhdGUgX2FwcGx5U3RyaWN0U2VsZWN0b3JTY29wZShzZWxlY3Rvcjogc3RyaW5nLCBzY29wZVNlbGVjdG9yOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHZhciBpc1JlID0gL1xcW2lzPShbXlxcXV0qKVxcXS9nO1xuICAgIHNjb3BlU2VsZWN0b3IgPSBTdHJpbmdXcmFwcGVyLnJlcGxhY2VBbGxNYXBwZWQoc2NvcGVTZWxlY3RvciwgaXNSZSwgKG0pID0+IG1bMV0pO1xuICAgIHZhciBzcGxpdHMgPSBbJyAnLCAnPicsICcrJywgJ34nXSwgc2NvcGVkID0gc2VsZWN0b3IsIGF0dHJOYW1lID0gJ1snICsgc2NvcGVTZWxlY3RvciArICddJztcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNwbGl0cy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHNlcCA9IHNwbGl0c1tpXTtcbiAgICAgIHZhciBwYXJ0cyA9IHNjb3BlZC5zcGxpdChzZXApO1xuICAgICAgc2NvcGVkID0gcGFydHMubWFwKHAgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgIC8vIHJlbW92ZSA6aG9zdCBzaW5jZSBpdCBzaG91bGQgYmUgdW5uZWNlc3NhcnlcbiAgICAgICAgICAgICAgICAgICAgICB2YXIgdCA9IFN0cmluZ1dyYXBwZXIucmVwbGFjZUFsbChwLnRyaW0oKSwgX3BvbHlmaWxsSG9zdFJlLCAnJyk7XG4gICAgICAgICAgICAgICAgICAgICAgaWYgKHQubGVuZ3RoID4gMCAmJiAhTGlzdFdyYXBwZXIuY29udGFpbnMoc3BsaXRzLCB0KSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAhU3RyaW5nV3JhcHBlci5jb250YWlucyh0LCBhdHRyTmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciByZSA9IC8oW146XSopKDoqKSguKikvZztcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBtID0gUmVnRXhwV3JhcHBlci5maXJzdE1hdGNoKHJlLCB0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc1ByZXNlbnQobSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcCA9IG1bMV0gKyBhdHRyTmFtZSArIG1bMl0gKyBtWzNdO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcDtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAuam9pbihzZXApO1xuICAgIH1cbiAgICByZXR1cm4gc2NvcGVkO1xuICB9XG5cbiAgcHJpdmF0ZSBfaW5zZXJ0UG9seWZpbGxIb3N0SW5Dc3NUZXh0KHNlbGVjdG9yOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHNlbGVjdG9yID0gU3RyaW5nV3JhcHBlci5yZXBsYWNlQWxsKHNlbGVjdG9yLCBfY29sb25Ib3N0Q29udGV4dFJlLCBfcG9seWZpbGxIb3N0Q29udGV4dCk7XG4gICAgc2VsZWN0b3IgPSBTdHJpbmdXcmFwcGVyLnJlcGxhY2VBbGwoc2VsZWN0b3IsIF9jb2xvbkhvc3RSZSwgX3BvbHlmaWxsSG9zdCk7XG4gICAgcmV0dXJuIHNlbGVjdG9yO1xuICB9XG59XG52YXIgX2Nzc0NvbnRlbnROZXh0U2VsZWN0b3JSZSA9XG4gICAgL3BvbHlmaWxsLW5leHQtc2VsZWN0b3JbXn1dKmNvbnRlbnQ6W1xcc10qP1snXCJdKC4qPylbJ1wiXVs7XFxzXSp9KFtee10qPyl7L2dpbTtcbnZhciBfY3NzQ29udGVudFJ1bGVSZSA9IC8ocG9seWZpbGwtcnVsZSlbXn1dKihjb250ZW50OltcXHNdKlsnXCJdKC4qPylbJ1wiXSlbO1xcc10qW159XSp9L2dpbTtcbnZhciBfY3NzQ29udGVudFVuc2NvcGVkUnVsZVJlID1cbiAgICAvKHBvbHlmaWxsLXVuc2NvcGVkLXJ1bGUpW159XSooY29udGVudDpbXFxzXSpbJ1wiXSguKj8pWydcIl0pWztcXHNdKltefV0qfS9naW07XG52YXIgX3BvbHlmaWxsSG9zdCA9ICctc2hhZG93Y3NzaG9zdCc7XG4vLyBub3RlOiA6aG9zdC1jb250ZXh0IHByZS1wcm9jZXNzZWQgdG8gLXNoYWRvd2Nzc2hvc3Rjb250ZXh0LlxudmFyIF9wb2x5ZmlsbEhvc3RDb250ZXh0ID0gJy1zaGFkb3djc3Njb250ZXh0JztcbnZhciBfcGFyZW5TdWZmaXggPSAnKSg/OlxcXFwoKCcgK1xuICAgICAgICAgICAgICAgICAgICcoPzpcXFxcKFteKShdKlxcXFwpfFteKShdKikrPycgK1xuICAgICAgICAgICAgICAgICAgICcpXFxcXCkpPyhbXix7XSopJztcbnZhciBfY3NzQ29sb25Ib3N0UmUgPSBSZWdFeHBXcmFwcGVyLmNyZWF0ZSgnKCcgKyBfcG9seWZpbGxIb3N0ICsgX3BhcmVuU3VmZml4LCAnaW0nKTtcbnZhciBfY3NzQ29sb25Ib3N0Q29udGV4dFJlID0gUmVnRXhwV3JhcHBlci5jcmVhdGUoJygnICsgX3BvbHlmaWxsSG9zdENvbnRleHQgKyBfcGFyZW5TdWZmaXgsICdpbScpO1xudmFyIF9wb2x5ZmlsbEhvc3ROb0NvbWJpbmF0b3IgPSBfcG9seWZpbGxIb3N0ICsgJy1uby1jb21iaW5hdG9yJztcbnZhciBfc2hhZG93RE9NU2VsZWN0b3JzUmUgPSBbXG4gIC86OnNoYWRvdy9nLFxuICAvOjpjb250ZW50L2csXG4gIC8vIERlcHJlY2F0ZWQgc2VsZWN0b3JzXG4gIC8vIFRPRE8odmljYik6IHNlZSBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9jbGFuZy1mb3JtYXQvaXNzdWVzLzE2XG4gIC8vIGNsYW5nLWZvcm1hdCBvZmZcbiAgL1xcL3NoYWRvdy1kZWVwXFwvL2csICAvLyBmb3JtZXIgL2RlZXAvXG4gIC9cXC9zaGFkb3dcXC8vZywgICAgICAgLy8gZm9ybWVyIDo6c2hhZG93XG4gIC8vIGNsYW5mLWZvcm1hdCBvblxuXTtcbnZhciBfc2hhZG93RGVlcFNlbGVjdG9ycyA9IC8oPzo+Pj4pfCg/OlxcL2RlZXBcXC8pL2c7XG52YXIgX3NlbGVjdG9yUmVTdWZmaXggPSAnKFs+XFxcXHN+K1xcWy4sezpdW1xcXFxzXFxcXFNdKik/JCc7XG52YXIgX3BvbHlmaWxsSG9zdFJlID0gUmVnRXhwV3JhcHBlci5jcmVhdGUoX3BvbHlmaWxsSG9zdCwgJ2ltJyk7XG52YXIgX2NvbG9uSG9zdFJlID0gLzpob3N0L2dpbTtcbnZhciBfY29sb25Ib3N0Q29udGV4dFJlID0gLzpob3N0LWNvbnRleHQvZ2ltO1xuXG52YXIgX2NvbW1lbnRSZSA9IC9cXC9cXCpbXFxzXFxTXSo/XFwqXFwvL2c7XG5cbmZ1bmN0aW9uIHN0cmlwQ29tbWVudHMoaW5wdXQ6c3RyaW5nKTpzdHJpbmcge1xuICByZXR1cm4gU3RyaW5nV3JhcHBlci5yZXBsYWNlQWxsTWFwcGVkKGlucHV0LCBfY29tbWVudFJlLCAoXykgPT4gJycpO1xufVxuXG52YXIgX3J1bGVSZSA9IC8oXFxzKikoW147XFx7XFx9XSs/KShcXHMqKSgoPzp7JUJMT0NLJX0/XFxzKjs/KXwoPzpcXHMqOykpL2c7XG52YXIgX2N1cmx5UmUgPSAvKFt7fV0pL2c7XG5jb25zdCBPUEVOX0NVUkxZID0gJ3snO1xuY29uc3QgQ0xPU0VfQ1VSTFkgPSAnfSc7XG5jb25zdCBCTE9DS19QTEFDRUhPTERFUiA9ICclQkxPQ0slJztcblxuZXhwb3J0IGNsYXNzIENzc1J1bGUge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgc2VsZWN0b3I6c3RyaW5nLCBwdWJsaWMgY29udGVudDpzdHJpbmcpIHt9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcm9jZXNzUnVsZXMoaW5wdXQ6c3RyaW5nLCBydWxlQ2FsbGJhY2s6RnVuY3Rpb24pOnN0cmluZyB7XG4gIHZhciBpbnB1dFdpdGhFc2NhcGVkQmxvY2tzID0gZXNjYXBlQmxvY2tzKGlucHV0KTtcbiAgdmFyIG5leHRCbG9ja0luZGV4ID0gMDtcbiAgcmV0dXJuIFN0cmluZ1dyYXBwZXIucmVwbGFjZUFsbE1hcHBlZChpbnB1dFdpdGhFc2NhcGVkQmxvY2tzLmVzY2FwZWRTdHJpbmcsIF9ydWxlUmUsIGZ1bmN0aW9uKG0pIHtcbiAgICB2YXIgc2VsZWN0b3IgPSBtWzJdO1xuICAgIHZhciBjb250ZW50ID0gJyc7XG4gICAgdmFyIHN1ZmZpeCA9IG1bNF07XG4gICAgdmFyIGNvbnRlbnRQcmVmaXggPSAnJztcbiAgICBpZiAoaXNQcmVzZW50KG1bNF0pICYmIG1bNF0uc3RhcnRzV2l0aCgneycrQkxPQ0tfUExBQ0VIT0xERVIpKSB7XG4gICAgICBjb250ZW50ID0gaW5wdXRXaXRoRXNjYXBlZEJsb2Nrcy5ibG9ja3NbbmV4dEJsb2NrSW5kZXgrK107XG4gICAgICBzdWZmaXggPSBtWzRdLnN1YnN0cmluZyhCTE9DS19QTEFDRUhPTERFUi5sZW5ndGgrMSk7XG4gICAgICBjb250ZW50UHJlZml4ID0gJ3snO1xuICAgIH1cbiAgICB2YXIgcnVsZSA9IHJ1bGVDYWxsYmFjayhuZXcgQ3NzUnVsZShzZWxlY3RvciwgY29udGVudCkpO1xuICAgIHJldHVybiBgJHttWzFdfSR7cnVsZS5zZWxlY3Rvcn0ke21bM119JHtjb250ZW50UHJlZml4fSR7cnVsZS5jb250ZW50fSR7c3VmZml4fWA7XG4gIH0pO1xufVxuXG5jbGFzcyBTdHJpbmdXaXRoRXNjYXBlZEJsb2NrcyB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBlc2NhcGVkU3RyaW5nOnN0cmluZywgcHVibGljIGJsb2NrczpzdHJpbmdbXSkge31cbn1cblxuZnVuY3Rpb24gZXNjYXBlQmxvY2tzKGlucHV0OnN0cmluZyk6U3RyaW5nV2l0aEVzY2FwZWRCbG9ja3Mge1xuICB2YXIgaW5wdXRQYXJ0cyA9IFN0cmluZ1dyYXBwZXIuc3BsaXQoaW5wdXQsIF9jdXJseVJlKTtcbiAgdmFyIHJlc3VsdFBhcnRzID0gW107XG4gIHZhciBlc2NhcGVkQmxvY2tzID0gW107XG4gIHZhciBicmFja2V0Q291bnQgPSAwO1xuICB2YXIgY3VycmVudEJsb2NrUGFydHMgPSBbXTtcbiAgZm9yICh2YXIgcGFydEluZGV4ID0gMDsgcGFydEluZGV4PGlucHV0UGFydHMubGVuZ3RoOyBwYXJ0SW5kZXgrKykge1xuICAgIHZhciBwYXJ0ID0gaW5wdXRQYXJ0c1twYXJ0SW5kZXhdO1xuICAgIGlmIChwYXJ0ID09IENMT1NFX0NVUkxZKSB7XG4gICAgICBicmFja2V0Q291bnQtLTtcbiAgICB9XG4gICAgaWYgKGJyYWNrZXRDb3VudCA+IDApIHtcbiAgICAgIGN1cnJlbnRCbG9ja1BhcnRzLnB1c2gocGFydCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChjdXJyZW50QmxvY2tQYXJ0cy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGVzY2FwZWRCbG9ja3MucHVzaChjdXJyZW50QmxvY2tQYXJ0cy5qb2luKCcnKSk7XG4gICAgICAgIHJlc3VsdFBhcnRzLnB1c2goQkxPQ0tfUExBQ0VIT0xERVIpO1xuICAgICAgICBjdXJyZW50QmxvY2tQYXJ0cyA9IFtdO1xuICAgICAgfVxuICAgICAgcmVzdWx0UGFydHMucHVzaChwYXJ0KTtcbiAgICB9XG4gICAgaWYgKHBhcnQgPT0gT1BFTl9DVVJMWSkge1xuICAgICAgYnJhY2tldENvdW50Kys7XG4gICAgfVxuICB9XG4gIGlmIChjdXJyZW50QmxvY2tQYXJ0cy5sZW5ndGggPiAwKSB7XG4gICAgZXNjYXBlZEJsb2Nrcy5wdXNoKGN1cnJlbnRCbG9ja1BhcnRzLmpvaW4oJycpKTtcbiAgICByZXN1bHRQYXJ0cy5wdXNoKEJMT0NLX1BMQUNFSE9MREVSKTtcbiAgfVxuICByZXR1cm4gbmV3IFN0cmluZ1dpdGhFc2NhcGVkQmxvY2tzKHJlc3VsdFBhcnRzLmpvaW4oJycpLCBlc2NhcGVkQmxvY2tzKTtcbn1cbiJdfQ==