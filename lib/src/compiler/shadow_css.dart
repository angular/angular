library angular2.src.compiler.shadow_css;

import "package:angular2/src/facade/collection.dart" show ListWrapper;
import "package:angular2/src/facade/lang.dart"
    show
        StringWrapper,
        RegExp,
        RegExpWrapper,
        RegExpMatcherWrapper,
        isPresent,
        isBlank;
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
class ShadowCss {
  bool strictStyling = true;
  ShadowCss() {}
  /*
  * Shim some cssText with the given selector. Returns cssText that can
  * be included in the document via WebComponents.ShadowCSS.addCssToDocument(css).
  *
  * When strictStyling is true:
  * - selector is the attribute added to all elements inside the host,
  * - hostSelector is the attribute added to the host itself.
  */
  String shimCssText(String cssText, String selector,
      [String hostSelector = ""]) {
    cssText = stripComments(cssText);
    cssText = this._insertDirectives(cssText);
    return this._scopeCssText(cssText, selector, hostSelector);
  }

  String _insertDirectives(String cssText) {
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
  String _insertPolyfillDirectivesInCssText(String cssText) {
    // Difference with webcomponents.js: does not handle comments
    return StringWrapper.replaceAllMapped(cssText, _cssContentNextSelectorRe,
        (m) {
      return m[1] + "{";
    });
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
  String _insertPolyfillRulesInCssText(String cssText) {
    // Difference with webcomponents.js: does not handle comments
    return StringWrapper.replaceAllMapped(cssText, _cssContentRuleRe, (m) {
      var rule = m[0];
      rule = StringWrapper.replace(rule, m[1], "");
      rule = StringWrapper.replace(rule, m[2], "");
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
  String _scopeCssText(
      String cssText, String scopeSelector, String hostSelector) {
    var unscoped = this._extractUnscopedRulesFromCssText(cssText);
    cssText = this._insertPolyfillHostInCssText(cssText);
    cssText = this._convertColonHost(cssText);
    cssText = this._convertColonHostContext(cssText);
    cssText = this._convertShadowDOMSelectors(cssText);
    if (isPresent(scopeSelector)) {
      cssText = this._scopeSelectors(cssText, scopeSelector, hostSelector);
    }
    cssText = cssText + "\n" + unscoped;
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
  String _extractUnscopedRulesFromCssText(String cssText) {
    // Difference with webcomponents.js: does not handle comments
    var r = "", m;
    var matcher = RegExpWrapper.matcher(_cssContentUnscopedRuleRe, cssText);
    while (isPresent(m = RegExpMatcherWrapper.next(matcher))) {
      var rule = m[0];
      rule = StringWrapper.replace(rule, m[2], "");
      rule = StringWrapper.replace(rule, m[1], m[3]);
      r += rule + "\n\n";
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
  String _convertColonHost(String cssText) {
    return this._convertColonRule(
        cssText, _cssColonHostRe, this._colonHostPartReplacer);
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
  String _convertColonHostContext(String cssText) {
    return this._convertColonRule(
        cssText, _cssColonHostContextRe, this._colonHostContextPartReplacer);
  }

  String _convertColonRule(
      String cssText, RegExp regExp, Function partReplacer) {
    // p1 = :host, p2 = contents of (), p3 rest of rule
    return StringWrapper.replaceAllMapped(cssText, regExp, (m) {
      if (isPresent(m[2])) {
        var parts = m[2].split(","), r = [];
        for (var i = 0; i < parts.length; i++) {
          var p = parts[i];
          if (isBlank(p)) break;
          p = p.trim();
          r.add(partReplacer(_polyfillHostNoCombinator, p, m[3]));
        }
        return r.join(",");
      } else {
        return _polyfillHostNoCombinator + m[3];
      }
    });
  }

  String _colonHostContextPartReplacer(
      String host, String part, String suffix) {
    if (StringWrapper.contains(part, _polyfillHost)) {
      return this._colonHostPartReplacer(host, part, suffix);
    } else {
      return host + part + suffix + ", " + part + " " + host + suffix;
    }
  }

  String _colonHostPartReplacer(String host, String part, String suffix) {
    return host + StringWrapper.replace(part, _polyfillHost, "") + suffix;
  }

  /*
   * Convert combinators like ::shadow and pseudo-elements like ::content
   * by replacing with space.
  */
  String _convertShadowDOMSelectors(String cssText) {
    for (var i = 0; i < _shadowDOMSelectorsRe.length; i++) {
      cssText =
          StringWrapper.replaceAll(cssText, _shadowDOMSelectorsRe[i], " ");
    }
    return cssText;
  }

  // change a selector like 'div' to 'name div'
  String _scopeSelectors(
      String cssText, String scopeSelector, String hostSelector) {
    return processRules(cssText, (CssRule rule) {
      var selector = rule.selector;
      var content = rule.content;
      if (rule.selector[0] != "@" || rule.selector.startsWith("@page")) {
        selector = this._scopeSelector(
            rule.selector, scopeSelector, hostSelector, this.strictStyling);
      } else if (rule.selector.startsWith("@media")) {
        content =
            this._scopeSelectors(rule.content, scopeSelector, hostSelector);
      }
      return new CssRule(selector, content);
    });
  }

  String _scopeSelector(
      String selector, String scopeSelector, String hostSelector, bool strict) {
    var r = [], parts = selector.split(",");
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      p = p.trim();
      if (this._selectorNeedsScoping(p, scopeSelector)) {
        p = strict && !StringWrapper.contains(p, _polyfillHostNoCombinator)
            ? this._applyStrictSelectorScope(p, scopeSelector)
            : this._applySelectorScope(p, scopeSelector, hostSelector);
      }
      r.add(p);
    }
    return r.join(", ");
  }

  bool _selectorNeedsScoping(String selector, String scopeSelector) {
    var re = this._makeScopeMatcher(scopeSelector);
    return !isPresent(RegExpWrapper.firstMatch(re, selector));
  }

  RegExp _makeScopeMatcher(String scopeSelector) {
    var lre = new RegExp(r'\[');
    var rre = new RegExp(r'\]');
    scopeSelector = StringWrapper.replaceAll(scopeSelector, lre, "\\[");
    scopeSelector = StringWrapper.replaceAll(scopeSelector, rre, "\\]");
    return RegExpWrapper.create(
        "^(" + scopeSelector + ")" + _selectorReSuffix, "m");
  }

  String _applySelectorScope(
      String selector, String scopeSelector, String hostSelector) {
    // Difference from webcomponentsjs: scopeSelector could not be an array
    return this
        ._applySimpleSelectorScope(selector, scopeSelector, hostSelector);
  }

  // scope via name and [is=name]
  String _applySimpleSelectorScope(
      String selector, String scopeSelector, String hostSelector) {
    if (isPresent(RegExpWrapper.firstMatch(_polyfillHostRe, selector))) {
      var replaceBy =
          this.strictStyling ? '''[${ hostSelector}]''' : scopeSelector;
      selector =
          StringWrapper.replace(selector, _polyfillHostNoCombinator, replaceBy);
      return StringWrapper.replaceAll(
          selector, _polyfillHostRe, replaceBy + " ");
    } else {
      return scopeSelector + " " + selector;
    }
  }
  // return a selector with [name] suffix on each simple selector

  // e.g. .foo.bar > .zot becomes .foo[name].bar[name] > .zot[name]  /** @internal */
  String _applyStrictSelectorScope(String selector, String scopeSelector) {
    var isRe = new RegExp(r'\[is=([^\]]*)\]');
    scopeSelector =
        StringWrapper.replaceAllMapped(scopeSelector, isRe, (m) => m[1]);
    var splits = [" ", ">", "+", "~"],
        scoped = selector,
        attrName = "[" + scopeSelector + "]";
    for (var i = 0; i < splits.length; i++) {
      var sep = splits[i];
      var parts = scoped.split(sep);
      scoped = parts.map((p) {
        // remove :host since it should be unnecessary
        var t = StringWrapper.replaceAll(p.trim(), _polyfillHostRe, "");
        if (t.length > 0 &&
            !ListWrapper.contains(splits, t) &&
            !StringWrapper.contains(t, attrName)) {
          var re = new RegExp(r'([^:]*)(:*)(.*)');
          var m = RegExpWrapper.firstMatch(re, t);
          if (isPresent(m)) {
            p = m[1] + attrName + m[2] + m[3];
          }
        }
        return p;
      }).toList().join(sep);
    }
    return scoped;
  }

  String _insertPolyfillHostInCssText(String selector) {
    selector = StringWrapper.replaceAll(
        selector, _colonHostContextRe, _polyfillHostContext);
    selector = StringWrapper.replaceAll(selector, _colonHostRe, _polyfillHost);
    return selector;
  }
}

var _cssContentNextSelectorRe = new RegExp(
    r'polyfill-next-selector[^}]*content:[\s]*?[' +
        "'" +
        r'"](.*?)[' +
        "'" +
        r'"][;\s]*}([^{]*?){',
    multiLine: true,
    caseSensitive: false);
var _cssContentRuleRe = new RegExp(
    r'(polyfill-rule)[^}]*(content:[\s]*[' +
        "'" +
        r'"](.*?)[' +
        "'" +
        r'"])[;\s]*[^}]*}',
    multiLine: true,
    caseSensitive: false);
var _cssContentUnscopedRuleRe = new RegExp(
    r'(polyfill-unscoped-rule)[^}]*(content:[\s]*[' +
        "'" +
        r'"](.*?)[' +
        "'" +
        r'"])[;\s]*[^}]*}',
    multiLine: true,
    caseSensitive: false);
var _polyfillHost = "-shadowcsshost";
// note: :host-context pre-processed to -shadowcsshostcontext.
var _polyfillHostContext = "-shadowcsscontext";
var _parenSuffix = ")(?:\\((" + "(?:\\([^)(]*\\)|[^)(]*)+?" + ")\\))?([^,{]*)";
var _cssColonHostRe =
    RegExpWrapper.create("(" + _polyfillHost + _parenSuffix, "im");
var _cssColonHostContextRe =
    RegExpWrapper.create("(" + _polyfillHostContext + _parenSuffix, "im");
var _polyfillHostNoCombinator = _polyfillHost + "-no-combinator";
var _shadowDOMSelectorsRe = [
  new RegExp(r'>>>'), new RegExp(r'::shadow'), new RegExp(r'::content'),
  // Deprecated selectors

  // TODO(vicb): see https://github.com/angular/clang-format/issues/16

  // clang-format off
  new RegExp(r'\/deep\/'), new RegExp(r'\/shadow-deep\/'),
  new RegExp(r'\/shadow\/')
];
var _selectorReSuffix = "([>\\s~+[.,{:][\\s\\S]*)?\$";
var _polyfillHostRe = RegExpWrapper.create(_polyfillHost, "im");
var _colonHostRe = new RegExp(r':host', multiLine: true, caseSensitive: false);
var _colonHostContextRe =
    new RegExp(r':host-context', multiLine: true, caseSensitive: false);
var _commentRe = new RegExp(r'\/\*[\s\S]*?\*\/');
String stripComments(String input) {
  return StringWrapper.replaceAllMapped(input, _commentRe, (_) => "");
}

var _ruleRe =
    new RegExp(r'(\s*)([^;\{\}]+?)(\s*)((?:{%BLOCK%}?\s*;?)|(?:\s*;))');
var _curlyRe = new RegExp(r'([{}])');
const OPEN_CURLY = "{";
const CLOSE_CURLY = "}";
const BLOCK_PLACEHOLDER = "%BLOCK%";

class CssRule {
  String selector;
  String content;
  CssRule(this.selector, this.content) {}
}

String processRules(String input, Function ruleCallback) {
  var inputWithEscapedBlocks = escapeBlocks(input);
  var nextBlockIndex = 0;
  return StringWrapper.replaceAllMapped(
      inputWithEscapedBlocks.escapedString, _ruleRe, (m) {
    var selector = m[2];
    var content = "";
    var suffix = m[4];
    var contentPrefix = "";
    if (isPresent(m[4]) && m[4].startsWith("{" + BLOCK_PLACEHOLDER)) {
      content = inputWithEscapedBlocks.blocks[nextBlockIndex++];
      suffix = m[4].substring(BLOCK_PLACEHOLDER.length + 1);
      contentPrefix = "{";
    }
    var rule = ruleCallback(new CssRule(selector, content));
    return '''${ m [ 1 ]}${ rule . selector}${ m [ 3 ]}${ contentPrefix}${ rule . content}${ suffix}''';
  });
}

class StringWithEscapedBlocks {
  String escapedString;
  List<String> blocks;
  StringWithEscapedBlocks(this.escapedString, this.blocks) {}
}

StringWithEscapedBlocks escapeBlocks(String input) {
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
      currentBlockParts.add(part);
    } else {
      if (currentBlockParts.length > 0) {
        escapedBlocks.add(currentBlockParts.join(""));
        resultParts.add(BLOCK_PLACEHOLDER);
        currentBlockParts = [];
      }
      resultParts.add(part);
    }
    if (part == OPEN_CURLY) {
      bracketCount++;
    }
  }
  if (currentBlockParts.length > 0) {
    escapedBlocks.add(currentBlockParts.join(""));
    resultParts.add(BLOCK_PLACEHOLDER);
  }
  return new StringWithEscapedBlocks(resultParts.join(""), escapedBlocks);
}
