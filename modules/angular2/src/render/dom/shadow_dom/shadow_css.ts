import {DOM} from 'angular2/src/dom/dom_adapter';
import {List, ListWrapper} from 'angular2/src/facade/collection';
import {
  StringWrapper,
  RegExp,
  RegExpWrapper,
  RegExpMatcherWrapper,
  isPresent,
  isBlank,
  BaseException
} from 'angular2/src/facade/lang';

/**
 * This file is a port of shadowCSS from webcomponents.js to AtScript.
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
  strictStyling: boolean = true;

  constructor() {}

  /*
  * Shim a style element with the given selector. Returns cssText that can
  * be included in the document via WebComponents.ShadowCSS.addCssToDocument(css).
  */
  shimStyle(style, selector: string, hostSelector: string = ''): string {
    var cssText = DOM.getText(style);
    return this.shimCssText(cssText, selector, hostSelector);
  }

  /*
  * Shim some cssText with the given selector. Returns cssText that can
  * be included in the document via WebComponents.ShadowCSS.addCssToDocument(css).
  *
  * When strictStyling is true:
  * - selector is the attribute added to all elements inside the host,
  * - hostSelector is the attribute added to the host itself.
  */
  shimCssText(cssText: string, selector: string, hostSelector: string = ''): string {
    cssText = this._insertDirectives(cssText);
    return this._scopeCssText(cssText, selector, hostSelector);
  }

  _insertDirectives(cssText: string): string {
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
  _insertPolyfillDirectivesInCssText(cssText: string): string {
    // Difference with webcomponents.js: does not handle comments
    return StringWrapper.replaceAllMapped(cssText, _cssContentNextSelectorRe,
                                          function(m) { return m[1] + '{'; });
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
  _insertPolyfillRulesInCssText(cssText: string): string {
    // Difference with webcomponents.js: does not handle comments
    return StringWrapper.replaceAllMapped(cssText, _cssContentRuleRe, function(m) {
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
  _scopeCssText(cssText: string, scopeSelector: string, hostSelector: string): string {
    var unscoped = this._extractUnscopedRulesFromCssText(cssText);
    cssText = this._insertPolyfillHostInCssText(cssText);
    cssText = this._convertColonHost(cssText);
    cssText = this._convertColonHostContext(cssText);
    cssText = this._convertShadowDOMSelectors(cssText);
    if (isPresent(scopeSelector)) {
      _withCssRules(cssText,
                    (rules) => { cssText = this._scopeRules(rules, scopeSelector, hostSelector); });
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
  _extractUnscopedRulesFromCssText(cssText: string): string {
    // Difference with webcomponents.js: does not handle comments
    var r = '', m;
    var matcher = RegExpWrapper.matcher(_cssContentUnscopedRuleRe, cssText);
    while (isPresent(m = RegExpMatcherWrapper.next(matcher))) {
      var rule = m[0];
      rule = StringWrapper.replace(rule, m[2], '');
      rule = StringWrapper.replace(rule, m[1], m[3]);
      r = rule + '\n\n';
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
  _convertColonHost(cssText: string): string {
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
  _convertColonHostContext(cssText: string): string {
    return this._convertColonRule(cssText, _cssColonHostContextRe,
                                  this._colonHostContextPartReplacer);
  }

  _convertColonRule(cssText: string, regExp: RegExp, partReplacer: Function): string {
    // p1 = :host, p2 = contents of (), p3 rest of rule
    return StringWrapper.replaceAllMapped(cssText, regExp, function(m) {
      if (isPresent(m[2])) {
        var parts = m[2].split(','), r = [];
        for (var i = 0; i < parts.length; i++) {
          var p = parts[i];
          if (isBlank(p)) break;
          p = p.trim();
          ListWrapper.push(r, partReplacer(_polyfillHostNoCombinator, p, m[3]));
        }
        return r.join(',');
      } else {
        return _polyfillHostNoCombinator + m[3];
      }
    });
  }

  _colonHostContextPartReplacer(host: string, part: string, suffix: string): string {
    if (StringWrapper.contains(part, _polyfillHost)) {
      return this._colonHostPartReplacer(host, part, suffix);
    } else {
      return host + part + suffix + ', ' + part + ' ' + host + suffix;
    }
  }

  _colonHostPartReplacer(host: string, part: string, suffix: string): string {
    return host + StringWrapper.replace(part, _polyfillHost, '') + suffix;
  }

  /*
   * Convert combinators like ::shadow and pseudo-elements like ::content
   * by replacing with space.
  */
  _convertShadowDOMSelectors(cssText: string): string {
    for (var i = 0; i < _shadowDOMSelectorsRe.length; i++) {
      cssText = StringWrapper.replaceAll(cssText, _shadowDOMSelectorsRe[i], ' ');
    }
    return cssText;
  }

  // change a selector like 'div' to 'name div'
  _scopeRules(cssRules, scopeSelector: string, hostSelector: string): string {
    var cssText = '';
    if (isPresent(cssRules)) {
      for (var i = 0; i < cssRules.length; i++) {
        var rule = cssRules[i];
        if (DOM.isStyleRule(rule) || DOM.isPageRule(rule)) {
          cssText += this._scopeSelector(rule.selectorText, scopeSelector, hostSelector,
                                         this.strictStyling) +
                     ' {\n';
          cssText += this._propertiesFromRule(rule) + '\n}\n\n';
        } else if (DOM.isMediaRule(rule)) {
          cssText += '@media ' + rule.media.mediaText + ' {\n';
          cssText += this._scopeRules(rule.cssRules, scopeSelector, hostSelector);
          cssText += '\n}\n\n';
        } else {
          // KEYFRAMES_RULE in IE throws when we query cssText
          // when it contains a -webkit- property.
          // if this happens, we fallback to constructing the rule
          // from the CSSRuleSet
          // https://connect.microsoft.com/IE/feedbackdetail/view/955703/accessing-csstext-of-a-keyframe-rule-that-contains-a-webkit-property-via-cssom-generates-exception
          try {
            if (isPresent(rule.cssText)) {
              cssText += rule.cssText + '\n\n';
            }
          } catch (x) {
            if (DOM.isKeyframesRule(rule) && isPresent(rule.cssRules)) {
              cssText += this._ieSafeCssTextFromKeyFrameRule(rule);
            }
          }
        }
      }
    }
    return cssText;
  }

  _ieSafeCssTextFromKeyFrameRule(rule): string {
    var cssText = '@keyframes ' + rule.name + ' {';
    for (var i = 0; i < rule.cssRules.length; i++) {
      var r = rule.cssRules[i];
      cssText += ' ' + r.keyText + ' {' + r.style.cssText + '}';
    }
    cssText += ' }';
    return cssText;
  }

  _scopeSelector(selector: string, scopeSelector: string, hostSelector: string,
                 strict: boolean): string {
    var r = [], parts = selector.split(',');
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      p = p.trim();
      if (this._selectorNeedsScoping(p, scopeSelector)) {
        p = strict && !StringWrapper.contains(p, _polyfillHostNoCombinator) ?
                this._applyStrictSelectorScope(p, scopeSelector) :
                this._applySelectorScope(p, scopeSelector, hostSelector);
      }
      ListWrapper.push(r, p);
    }
    return r.join(', ');
  }

  _selectorNeedsScoping(selector: string, scopeSelector: string): boolean {
    var re = this._makeScopeMatcher(scopeSelector);
    return !isPresent(RegExpWrapper.firstMatch(re, selector));
  }

  _makeScopeMatcher(scopeSelector: string): RegExp {
    var lre = RegExpWrapper.create('\\[');
    var rre = RegExpWrapper.create('\\]');
    scopeSelector = StringWrapper.replaceAll(scopeSelector, lre, '\\[');
    scopeSelector = StringWrapper.replaceAll(scopeSelector, rre, '\\]');
    return RegExpWrapper.create('^(' + scopeSelector + ')' + _selectorReSuffix, 'm');
  }

  _applySelectorScope(selector: string, scopeSelector: string, hostSelector: string): string {
    // Difference from webcomponentsjs: scopeSelector could not be an array
    return this._applySimpleSelectorScope(selector, scopeSelector, hostSelector);
  }

  // scope via name and [is=name]
  _applySimpleSelectorScope(selector: string, scopeSelector: string, hostSelector: string): string {
    if (isPresent(RegExpWrapper.firstMatch(_polyfillHostRe, selector))) {
      var replaceBy = this.strictStyling ? `[${hostSelector}]` : scopeSelector;
      selector = StringWrapper.replace(selector, _polyfillHostNoCombinator, replaceBy);
      return StringWrapper.replaceAll(selector, _polyfillHostRe, replaceBy + ' ');
    } else {
      return scopeSelector + ' ' + selector;
    }
  }

  // return a selector with [name] suffix on each simple selector
  // e.g. .foo.bar > .zot becomes .foo[name].bar[name] > .zot[name]
  _applyStrictSelectorScope(selector: string, scopeSelector: string): string {
    var isRe = RegExpWrapper.create('\\[is=([^\\]]*)\\]');
    scopeSelector = StringWrapper.replaceAllMapped(scopeSelector, isRe, (m) => m[1]);
    var splits = [' ', '>', '+', '~'], scoped = selector, attrName = '[' + scopeSelector + ']';
    for (var i = 0; i < splits.length; i++) {
      var sep = splits[i];
      var parts = scoped.split(sep);
      scoped = ListWrapper.map(parts, function(p) {
                            // remove :host since it should be unnecessary
                            var t = StringWrapper.replaceAll(p.trim(), _polyfillHostRe, '');
                            if (t.length > 0 && !ListWrapper.contains(splits, t) &&
                                !StringWrapper.contains(t, attrName)) {
                              var re = RegExpWrapper.create('([^:]*)(:*)(.*)');
                              var m = RegExpWrapper.firstMatch(re, t);
                              if (isPresent(m)) {
                                p = m[1] + attrName + m[2] + m[3];
                              }
                            }
                            return p;
                          }).join(sep);
    }
    return scoped;
  }

  _insertPolyfillHostInCssText(selector: string): string {
    selector = StringWrapper.replaceAll(selector, _colonHostContextRe, _polyfillHostContext);
    selector = StringWrapper.replaceAll(selector, _colonHostRe, _polyfillHost);
    return selector;
  }

  _propertiesFromRule(rule): string {
    var cssText = rule.style.cssText;
    // TODO(sorvell): Safari cssom incorrectly removes quotes from the content
    // property. (https://bugs.webkit.org/show_bug.cgi?id=118045)
    // don't replace attr rules
    var attrRe = RegExpWrapper.create('[\'"]+|attr');
    if (rule.style.content.length > 0 &&
        !isPresent(RegExpWrapper.firstMatch(attrRe, rule.style.content))) {
      var contentRe = RegExpWrapper.create('content:[^;]*;');
      cssText =
          StringWrapper.replaceAll(cssText, contentRe, 'content: \'' + rule.style.content + '\';');
    }
    // TODO(sorvell): we can workaround this issue here, but we need a list
    // of troublesome properties to fix https://github.com/Polymer/platform/issues/53
    //
    // inherit rules can be omitted from cssText
    // TODO(sorvell): remove when Blink bug is fixed:
    // https://code.google.com/p/chromium/issues/detail?id=358273
    // var style = rule.style;
    // for (var i = 0; i < style.length; i++) {
    //  var name = style.item(i);
    //  var value = style.getPropertyValue(name);
    //  if (value == 'initial') {
    //    cssText += name + ': initial; ';
    //  }
    //}
    return cssText;
  }
}

var _cssContentNextSelectorRe = RegExpWrapper.create(
    'polyfill-next-selector[^}]*content:[\\s]*?[\'"](.*?)[\'"][;\\s]*}([^{]*?){', 'im');
var _cssContentRuleRe =
    RegExpWrapper.create('(polyfill-rule)[^}]*(content:[\\s]*[\'"](.*?)[\'"])[;\\s]*[^}]*}', 'im');
var _cssContentUnscopedRuleRe = RegExpWrapper.create(
    '(polyfill-unscoped-rule)[^}]*(content:[\\s]*[\'"](.*?)[\'"])[;\\s]*[^}]*}', 'im');
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
  RegExpWrapper.create('>>>'),
  RegExpWrapper.create('::shadow'),
  RegExpWrapper.create('::content'),
  // Deprecated selectors
  RegExpWrapper.create('/deep/'),         // former >>>
  RegExpWrapper.create('/shadow-deep/'),  // former /deep/
  RegExpWrapper.create('/shadow/'),       // former ::shadow
];
var _selectorReSuffix = '([>\\s~+\[.,{:][\\s\\S]*)?$';
var _polyfillHostRe = RegExpWrapper.create(_polyfillHost, 'im');
var _colonHostRe = RegExpWrapper.create(':host', 'im');
var _colonHostContextRe = RegExpWrapper.create(':host-context', 'im');

function _cssToRules(cssText: string) {
  return DOM.cssToRules(cssText);
}

function _withCssRules(cssText: string, callback: Function) {
  // Difference from webcomponentjs: remove the workaround for an old bug in Chrome
  if (isBlank(callback)) return;
  var rules = _cssToRules(cssText);
  callback(rules);
}
