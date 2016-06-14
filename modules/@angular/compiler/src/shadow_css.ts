import {BaseException} from './facade/exceptions';
import {ListWrapper} from './facade/collection';
import {RegExp, RegExpMatcherWrapper, RegExpWrapper, StringWrapper, isBlank, isPresent} from './facade/lang';

import {CssLexer, CssTokenType} from './css/lexer';
import {BlockType, CssAST, CssASTVisitor, CssAtRulePredicateAST, CssBlockAST, CssBlockDefinitionRuleAST, CssBlockRuleAST, CssDefinitionAST, CssInlineRuleAST, CssKeyframeDefinitionAST, CssKeyframeRuleAST, CssMediaQueryRuleAST, CssParseError, CssParser, CssPseudoSelectorAST, CssRuleAST, CssSelectorAST, CssSelectorRuleAST, CssSimpleSelectorAST, CssStyleSheetAST, CssStyleValueAST, CssStylesBlockAST, CssToken, CssUnknownRuleAST, CssUnknownTokenListAST, ParsedCssResult} from './css/parser';

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
  strictStyling: boolean = true;

  constructor() {}

  /*
  * Shim some cssText with the given selector. Returns cssText that can
  * be included in the document via WebComponents.ShadowCSS.addCssToDocument(css).
  *
  * When strictStyling is true:
  * - scopeSelector is the attribute added to all elements inside the host,
  * - hostSelector is the attribute added to the host itself.
  */
  shimCssText(cssText: string, scopeSelector: string, hostSelector: string = ''): string {
    cssText = stripComments(cssText);

    var cssFileName = 'some-fake-file-name.css';  // TODO (matsko): get the name in here
    var output = _parseCssCode(cssFileName, cssText);

    // var errors = output.errors;
    // if (errors.length > 0) {
    // throw new BaseException(errors.map((error: CssParseError) => error.msg).join(', '));
    //}

    var context =
        new _CssShimSourceContext(cssText, scopeSelector, hostSelector, this.strictStyling);

    var visitor = new _ShadowShimVisitor(cssText, output.ast);
    cssText = visitor.transformCssText(context);

    return cssText;
  }
}

const COMMENT_RE = /\/\*[\s\S]*?\*\//g;
function stripComments(input: string): string {
  return StringWrapper.replaceAllMapped(input, COMMENT_RE, (_: any) => '');
}

export class CssRule {
  constructor(
      public selector: string, public content: string, private _selectorAst: CssAST = null,
      private _contentAst: CssAST = null) {}

  get selectorAST(): CssAST { return this._selectorAst; }
  get contentAST(): CssAST { return this._contentAst; }
}

export function processRules(input: string, ruleCallback: Function): string {
  var fakeCssFile = 'process-rules-inline.css';
  var output = _parseCssCode(fakeCssFile, input);
  var ast = output.ast;

  var visitor = new CssRuleCaptureVisitor();
  var cssTextContext = new _CssSourceContext(input);
  visitor.collectRules(ast).forEach(rule => {
    var newRule = <CssRule>ruleCallback(rule);
    if (newRule.selector != rule.selector) {
      var start = rule.selectorAST.start;
      var end = rule.selectorAST.end;
      cssTextContext.replaceText(start, end, newRule.selector);
    }
    if (newRule.content != rule.content) {
      var start = rule.contentAST.start;
      var end = rule.contentAST.end;
      cssTextContext.replaceText(start, end, '{' + newRule.content + '}');
    }
  });

  return cssTextContext.cssText;
}

class CssRuleCaptureVisitor implements CssASTVisitor {
  collectRules(ast: CssStyleSheetAST): CssRule[] { return ast.visit(this, null); }

  visitCssStyleSheet(ast: CssStyleSheetAST, context: any): CssRule[] {
    var combinedRules: CssRule[] = [];
    ast.rules.forEach(ruleAst => {
      var ruleResults = <CssRule[]>ruleAst.visit(this, context);
      if (isPresent(ruleResults) && ruleResults.length > 0) {
        ListWrapper.addAll(combinedRules, ruleResults);
      }
    });
    return combinedRules;
  }

  visitCssSelectorRule(ast: CssSelectorRuleAST, context: any): CssRule[] {
    var blockAst = ast.block;
    var contentStr = blockAst.visit(this, context);
    return ast.selectors.map(selectorAst => {
      var selectorStr = selectorAst.visit(this, context);
      return new CssRule(selectorStr, contentStr, selectorAst, blockAst);
    });
  }

  visitUnknownTokenList(ast: CssUnknownTokenListAST, context: _CssShimSourceContext): CssRule[] {
    var rules: CssRule[] = [];
    var ruleStr = '';
    ast.tokens.forEach(token => { ruleStr += token.strValue; });
    if (ruleStr.length > 0) {
      rules.push(new CssRule(ruleStr, ''));
    }
    return rules;
  }

  visitCssSelector(ast: CssSelectorAST, context: any): string { return ast.strValue; }

  visitCssBlock(ast: CssBlockAST, context: any): CssRule[] {
    var combinedRules: CssRule[] = [];
    ast.entries.forEach(entryAst => {
      entryAst.visit(this, context).forEach((rule: CssRule) => { combinedRules.push(rule); });
    });
    return combinedRules;
  }

  visitCssStylesBlock(ast: CssStylesBlockAST, context: any): string {
    var defStrings = ast.definitions.map((defAst: CssDefinitionAST) => defAst.visit(this, context));
    return defStrings.join(';');
  }

  visitCssDefinition(ast: CssDefinitionAST, context: any): string {
    var styleValue = isPresent(ast.value) ? ast.value.visit(this, context) : '';
    return _formatStyle(ast.property.strValue, styleValue);
  }

  visitCssValue(ast: CssStyleValueAST, context: any): string { return ast.strValue; }

  visitInlineCssRule(ast: CssInlineRuleAST, context: any): CssRule[] {
    var selector = '';
    var value = '';
    var rules: CssRule[] = [];
    switch (ast.type) {
      case BlockType.Import:
        selector = `@import ${ast.value.strValue}`;
        break;
    }
    if (selector.length > 0) {
      rules.push(new CssRule(selector, value, ast, ast.value));
    }
    return rules;
  }

  visitCssAtRulePredicate(ast: CssAtRulePredicateAST, context: any): string { return ast.strValue; }

  visitCssMediaQueryRule(ast: CssMediaQueryRuleAST, context: any): CssRule[] {
    return ast.block.visit(this, context);
  }

  visitUnknownRule(ast: CssUnknownRuleAST, context: any): any { return null; }
  visitCssKeyframeRule(ast: CssKeyframeRuleAST, context: any): any { return null; }
  visitCssKeyframeDefinition(ast: CssKeyframeDefinitionAST, context: any): any { return null; }
  visitCssSimpleSelector(ast: CssSimpleSelectorAST, context: any): any { return null; }
  visitCssPseudoSelector(ast: CssPseudoSelectorAST, context: any): any { return null; }
}

class _CssSourceContext {
  public indexOffset: number = 0;

  constructor(public cssText: string) {}

  replaceText(start: number, end: number, value: string) {
    if (start == -1 || end == -1) return;

    end++;

    var oldLength = end - start;
    var newLength = value.length;

    start += this.indexOffset;
    end += this.indexOffset;

    this.indexOffset += newLength - oldLength;

    var inner = this.cssText.substring(start, end);

    var lhs = this.cssText.substring(0, start);
    var rhs = this.cssText.substring(end);
    this.cssText = lhs + value + rhs;
  }
}

class _CssShimSourceContext extends _CssSourceContext {
  constructor(
      cssText: string, public scopeSelector: string, public hostSelector: string,
      public strictStyling: boolean) {
    super(cssText);
  }
  public nextSelectorRuleAst: CssSelectorRuleAST;
  public skipNextRule: boolean = false;
}

class _ShadowShimVisitor implements CssASTVisitor {
  constructor(public cssText: string, public ast: CssStyleSheetAST) {}

  visitCssValue(ast: CssStyleValueAST, context: _CssShimSourceContext): void {
    // nothing yet
  }

  visitInlineCssRule(ast: CssInlineRuleAST, context: _CssShimSourceContext): void {
    // nothing yet
  }

  visitCssAtRulePredicate(ast: CssAtRulePredicateAST, context: any): void {
    // nothing
  }

  visitCssKeyframeRule(ast: CssKeyframeRuleAST, context: _CssShimSourceContext): void {
    ast.block.visit(this, context);
  }

  visitCssKeyframeDefinition(ast: CssKeyframeDefinitionAST, context: _CssShimSourceContext): void {
    ast.block.visit(this, context);
  }

  visitCssMediaQueryRule(ast: CssMediaQueryRuleAST, context: _CssShimSourceContext): void {
    ast.block.visit(this, context);
  }

  visitCssSelectorRule(ast: CssSelectorRuleAST, context: _CssShimSourceContext): void {
    var transformer = _resolveCssRuleTransformer(ast, context.nextSelectorRuleAst);
    var skipNextRule = false;
    if (isPresent(transformer)) {
      skipNextRule = transformer.skipNextRule();
      this._replaceUsingTransformer(transformer, context);
    } else {
      ast.selectors.forEach((selAST: CssSelectorAST) => { selAST.visit(this, context); });
      ast.block.visit(this, context);
    }
    context.skipNextRule = skipNextRule;
  }

  visitCssSelector(ast: CssSelectorAST, context: _CssShimSourceContext): void {
    var transformer = _resolveCssSelectorTransformer(ast);
    this._replaceUsingTransformer(transformer, context);
  }

  /** @internal */
  _replaceUsingTransformer(transformer: CssSourceTransformer, context: _CssShimSourceContext):
      void {
    if (context.strictStyling) {
      var hostReplacementSelector: string = '';
      var scopeReplacementSelector: string = '';

      if (context.hostSelector.length > 0) {
        hostReplacementSelector = '[' + context.hostSelector + ']';
      }

      if (context.scopeSelector.length > 0) {
        scopeReplacementSelector = '[' + context.scopeSelector + ']';
      }

      var replaceDetails =
          transformer.generateCssString(hostReplacementSelector, scopeReplacementSelector);
      context.replaceText(replaceDetails.start, replaceDetails.end, replaceDetails.content);
    }
  }

  visitCssSimpleSelector(ast: CssSimpleSelectorAST, context: any): any {
    // nothing
  }

  visitCssPseudoSelector(ast: CssPseudoSelectorAST, context: _CssShimSourceContext): void {
    // nothing
  }

  visitUnknownRule(ast: CssUnknownRuleAST, context: _CssShimSourceContext): void {
    // nothing
  }

  visitUnknownTokenList(ast: CssUnknownTokenListAST, context: _CssShimSourceContext): void {
    // nothing
  }

  visitCssDefinition(ast: CssDefinitionAST, context: _CssShimSourceContext): void {
    if (isPresent(ast.value)) {
      ast.value.visit(this, context);
    }
  }

  visitCssBlock(ast: CssBlockAST, context: _CssShimSourceContext): void {
    ast.entries.forEach((entryAST: CssAST) => { entryAST.visit(this, context); });
  }

  visitCssStylesBlock(ast: CssStylesBlockAST, context: any): void {
    ast.definitions.forEach((defAst: CssDefinitionAST) => { defAst.visit(this, context); });
  }

  visitCssStyleSheet(ast: CssStyleSheetAST, context: _CssShimSourceContext): void {
    var rules = ast.rules;
    var limit = rules.length - 1;
    for (var i = 0; i <= limit; i++) {
      let ruleAst = rules[i];
      let nextRuleAst: CssRuleAST = i < limit ? rules[i + 1] : null;
      if (isPresent(nextRuleAst) && nextRuleAst instanceof CssSelectorRuleAST) {
        context.nextSelectorRuleAst = nextRuleAst;
      }
      ruleAst.visit(this, context);
      if (context.skipNextRule) {
        i++;
      }
    }
  }

  transformCssText(context: _CssShimSourceContext) {
    this.ast.visit(this, context);
    return context.cssText;
  }
}

function _resolveCssSelectorTransformer(ast: CssSelectorAST): CssSourceTransformer {
  if (ast.selectorParts.length == 0) return new NoOpSelectorTransformer(ast);

  var firstPart = ast.selectorParts[0];
  var totalPseudos = firstPart.pseudoSelectors.length;

  if (totalPseudos > 0) {
    var pseudo = firstPart.pseudoSelectors[0];
    var first = pseudo.tokens[0];
    var second = pseudo.tokens[1];
    if (first.strValue == ':') {
      var nameToken = second;
      if (second.strValue == ':') {
        nameToken = pseudo.tokens[2];
      }
      var pseudoName = nameToken.strValue.toLowerCase();
      switch (pseudoName) {
        case 'host':
          return new CssHostLevelTransformer(ast);

        case 'host-context':
          return new CssHostContextTransformer(ast);

        case 'shadow':
          return new CssShadowSelectorTransformer(ast);
      }
    }
  }

  return new CssSelectorTransformer(ast);
}

function _parseCssCode(cssFileName: string, cssText: string): ParsedCssResult {
  var lexer = new CssLexer();
  var scanner = lexer.scan(cssText);
  var parser = new CssParser(scanner, cssFileName);
  return parser.parse();
}

function _resolveCssRuleTransformer(
    ruleAst: CssSelectorRuleAST, nextRuleAst: CssSelectorRuleAST): CssSourceTransformer {
  var firstRuleName: string;
  var firstSelector: CssSelectorAST;
  try {
    firstSelector = ruleAst.selectors[0];
    var firstPart = firstSelector.selectorParts[0];
    var firstToken = firstPart.tokens[0];
    firstRuleName = firstToken.strValue.toLowerCase();
  } catch (e) {
    firstRuleName = '';
  }

  // match for "polyfill-" selector
  if (firstRuleName.substring(0, 9) == 'polyfill-') {
    return new CssPolyfillRuleTransformer(firstRuleName, ruleAst, nextRuleAst);
  }

  if (isPresent(firstSelector)) {
    // match for "/deep/" selector
    var parts = firstSelector.selectorParts;
    for (var i = 0; i < parts.length; i++) {
      let part = parts[i];
      let operator = part.operator;
      if (isPresent(part.operator)) {
        let operatorStr = part.operator.strValue.toLowerCase();
        switch (operatorStr) {
          case TRIPLE_GT_OPERATOR:
          case DEEP_OPERATOR:
            return new CssShadowOperatorTransformer(firstSelector);
        }
      }
    }
  }

  return null;
}

const SPACE_OPERATOR = ' ';
const DEEP_OPERATOR = '/deep/';
const TRIPLE_GT_OPERATOR = '>>>';

interface CssSourceTransformer {
  skipNextRule(): boolean;
  generateCssString(hostReplacementSelector: string, scopeReplacementSelector: string):
      _SourceReplacementEntry;
}

class NoOpSelectorTransformer implements CssSourceTransformer {
  constructor(public selector: CssSelectorAST) {}

  skipNextRule(): boolean { return false; }

  // input = a
  // output = a
  generateCssString(hostReplacementSelector: string, scopeReplacementSelector: string):
      _SourceReplacementEntry {
    return new _SourceReplacementEntry(
        this.selector.start, this.selector.end, this.selector.strValue);
  }
}

class CssShadowSelectorTransformer implements CssSourceTransformer {
  constructor(public selector: CssSelectorAST) {}

  skipNextRule(): boolean { return false; }

  // input = x::shadow > y {}
  // output = x[a] > y[a] {}
  generateCssString(hostReplacementSelector: string, scopeReplacementSelector: string):
      _SourceReplacementEntry {
    var content = _transformSimpleSelectorsWithSuffix(
        this.selector.selectorParts, scopeReplacementSelector, true);
    return new _SourceReplacementEntry(this.selector.start, this.selector.end, content);
  }
}

class CssShadowOperatorTransformer implements CssSourceTransformer {
  public targets = [DEEP_OPERATOR, TRIPLE_GT_OPERATOR];

  constructor(public selector: CssSelectorAST) {}

  skipNextRule(): boolean { return false; }

  // input = x /deep/ y {}
  // output = x[a] y {}
  // input = x >>> y {}
  // output = x[a] y {}
  generateCssString(hostReplacementSelector: string, scopeReplacementSelector: string):
      _SourceReplacementEntry {
    var cssText = '';

    // we always compare the first operator with the next
    // value (which we expect to be a OPERATOR value). If so
    // then we decorate the first value with accordingly.
    this.selector.selectorParts.forEach(part => {
      if (cssText.length > 0) {
        cssText += ' ';
      }

      var suffix = '';
      if (isPresent(part.operator) && this.targets.indexOf(part.operator.strValue) >= 0) {
        suffix = scopeReplacementSelector;
      }
      cssText += _transformSimpleSelectorsWithSuffix([part], suffix, true, true);
    });

    return new _SourceReplacementEntry(this.selector.start, this.selector.end, cssText);
  }
}

class CssHostContextTransformer implements CssSourceTransformer {
  constructor(public selector: CssSelectorAST) {}

  skipNextRule(): boolean { return false; }

  // input = host-context(a)
  // output = [a]a, a [a]
  generateCssString(hostReplacementSelector: string, scopeReplacementSelector: string):
      _SourceReplacementEntry {
    var remainingSelectorStr = '';
    var parts = this.selector.selectorParts;
    var limit = parts.length - 1;
    parts.forEach((part, index) => {
      // the first part will always only be ":host"
      // and, since that is only a pseudoSelector, there
      // will never be any simpleSelectors attached to it
      // therefore we can skip the first part entirely
      if (index > 0) {
        remainingSelectorStr += part.strValue;
      }

      if (index < limit) {
        var operator = part.operator;
        if (isPresent(operator) && operator.type != CssTokenType.Whitespace) {
          remainingSelectorStr += ' ' + operator.strValue + ' ';
        }
      }
    });


    var firstPart = parts[0];
    var hostPseudo = firstPart.pseudoSelectors[0];
    var hostSelectors = hostPseudo.innerSelectors;

    var replacementStr = '';

    hostSelectors.forEach((selector, index) => {
      if (index > 0) {
        replacementStr += ', ';
      }
      replacementStr += this._generateAttrHostContext(hostReplacementSelector, selector.strValue);
      replacementStr += remainingSelectorStr;
      replacementStr += ', ';
      replacementStr += this._generateParentHostContext(hostReplacementSelector, selector.strValue);
      replacementStr += remainingSelectorStr;
    });

    return new _SourceReplacementEntry(this.selector.start, this.selector.end, replacementStr);
  }

  /** @internal */
  _generateAttrHostContext(hostReplacementSelector: string, innerSelectorVal: string): string {
    return hostReplacementSelector + innerSelectorVal;
  }

  /** @internal */
  _generateParentHostContext(hostReplacementSelector: string, innerSelectorVal: string): string {
    return innerSelectorVal + ' ' + hostReplacementSelector;
  }
}

class CssHostLevelTransformer implements CssSourceTransformer {
  constructor(public selector: CssSelectorAST) {}

  skipNextRule(): boolean { return false; }

  // input = :host(a,.b,[c]) > d
  // output = [a]a > d, [a].b > d, [a][c] > d
  generateCssString(hostReplacementSelector: string, scopeReplacementSelector: string):
      _SourceReplacementEntry {
    var parts = this.selector.selectorParts;

    // the first part will always only be ":host"
    // but in the event that there are classes/tags
    // associated with it then it should be fully valid
    // to place those properties on the same selector
    var hostLevelSelectorStr = '';
    var firstPart = parts[0];
    firstPart.tokens.forEach(token => { hostLevelSelectorStr += token.strValue; });

    var remainingSelectorStr = '';
    var limit = parts.length - 1;
    parts.forEach((part, index) => {
      if (index > 0) {
        remainingSelectorStr += part.strValue;
      }
      if (index < limit) {
        var operator = part.operator;
        if (isPresent(operator) && operator.type != CssTokenType.Whitespace) {
          remainingSelectorStr += ' ' + operator.strValue + ' ';
        }
      }
    });

    var firstPart = parts[0];
    var hostPseudo = firstPart.pseudoSelectors[0];
    var hostSelectors = hostPseudo.innerSelectors;

    var replacementStr = hostLevelSelectorStr;

    if (hostSelectors.length > 0) {
      hostSelectors.forEach((selector, index) => {
        if (index > 0) {
          replacementStr += ', ';
        }
        replacementStr += hostReplacementSelector + selector.strValue;
        if (remainingSelectorStr.length > 0) {
          replacementStr += ' ' + remainingSelectorStr;
        }
      });
    } else {
      // special case for ":host" or ":host()" values
      replacementStr += hostReplacementSelector;
      if (remainingSelectorStr.length > 0) {
        replacementStr += ' ' + remainingSelectorStr;
      }
    }

    return new _SourceReplacementEntry(this.selector.start, this.selector.end, replacementStr);
  }
}

class CssSelectorTransformer implements CssSourceTransformer {
  constructor(public selector: CssSelectorAST) {}

  skipNextRule(): boolean { return false; }

  // input = .a > [b] > d
  // output = .a[a] > [b][a] > d[a]
  generateCssString(hostReplacementSelector: string, scopeReplacementSelector: string):
      _SourceReplacementEntry {
    var cssText =
        _transformSimpleSelectorsWithSuffix(this.selector.selectorParts, scopeReplacementSelector);
    return new _SourceReplacementEntry(this.selector.start, this.selector.end, cssText);
  }
}

class CssPolyfillRuleTransformer implements CssSourceTransformer {
  public block: CssBlockAST;
  public selector: CssSimpleSelectorAST;
  public start: number;
  public end: number;

  skipNextRule(): boolean { return this.name == 'polyfill-next-selector'; }

  constructor(
      public name: string, public rule: CssSelectorRuleAST, public nextRule: CssSelectorRuleAST) {
    this.block = rule.block;
    this.selector = rule.selectors[0].selectorParts[0];
  }

  generateCssString(hostReplacementSelector: string, scopeReplacementSelector: string):
      _SourceReplacementEntry {
    switch (this.name) {
      case 'polyfill-next-selector':
        return this._generatePolyfillNextSelector(scopeReplacementSelector);

      case 'polyfill-unscoped-rule':
        return this._generatePolyfillUnscopedRule();

      case 'polyfill-rule':
        return this._generatePolyfillScopedRule(hostReplacementSelector, scopeReplacementSelector);

      default:
        return new _SourceReplacementEntry(0, 0, '');
    }
  }

  /** @internal */
  _parseCssIntoAST(cssText: string): CssStyleSheetAST {
    var fakeCssFile = this.name + '.css';
    var output = _parseCssCode(fakeCssFile, cssText);
    return <CssStyleSheetAST>output.ast;
  }

  /** @internal */
  _generatePolyfillUnscopedRuleContent(): string {
    var entry = _extractPolyfillRuleContentAndStyles(this.block);
    return _formatCssRuleFromExtractedEntry(entry);
  }

  // input = polyfill-unscoped-rule {content: '#menu > .bar';color: blue;}
  // output = #menu > .bar {;color:blue;}
  /** @internal */
  _generatePolyfillUnscopedRule(): _SourceReplacementEntry {
    var entry = _extractPolyfillRuleContentAndStyles(this.block);
    var cssText = this._generatePolyfillUnscopedRuleContent();
    return new _SourceReplacementEntry(this.rule.start, this.rule.end, cssText);
  }

  // input = polyfill-next-selector {content: 'x > y'} z {}
  // output = x[a] > y[a]{}
  /** @internal */
  _generatePolyfillNextSelector(hostContainerVal: string): _SourceReplacementEntry {
    var unscopedCss = this._generatePolyfillUnscopedRuleContent();
    var ast = this._parseCssIntoAST(unscopedCss);
    var rule = <CssSelectorRuleAST>ast.rules[0];
    var selectorParts = rule.selectors[0].selectorParts;

    var nextRule = this.nextRule;
    var start = this.rule.start;
    var end = this.rule.end;

    try {
      var nextRuleLastSelector = nextRule.selectors[nextRule.selectors.length - 1];
      var nextRuleLastSelectorPart =
          nextRuleLastSelector.selectorParts[nextRuleLastSelector.selectorParts.length - 1];
      end = nextRuleLastSelectorPart.end;
    } catch (e) {
      throw new BaseException(
          'polyfill-next-selector must be followed by a valid CSS selector rule');
    }

    var cssText = _transformSimpleSelectorsWithSuffix(selectorParts, hostContainerVal);
    return new _SourceReplacementEntry(start, end, cssText);
  }

  // input = polyfill-rule {content: ':host.foo .bar';color: blue;}
  // output = [a-host].foo .bar {;color:blue;}
  /** @internal */
  _generatePolyfillScopedRule(hostReplacementSelector: string, scopeReplacementSelector: string):
      _SourceReplacementEntry {
    var entry = _extractPolyfillRuleContentAndStyles(this.block);
    var unscopedCssRuleText = _formatCssRuleFromExtractedEntry(entry);
    var ast = this._parseCssIntoAST(unscopedCssRuleText);
    var rule = <CssSelectorRuleAST>ast.rules[0];
    var firstSelector = rule.selectors[0];

    var cssText = unscopedCssRuleText;
    var transformer = _resolveCssSelectorTransformer(firstSelector);
    if (isPresent(transformer)) {
      var scopedCssSelectorReplacement =
          transformer.generateCssString(hostReplacementSelector, scopeReplacementSelector);
      cssText = _formatRule(scopedCssSelectorReplacement.content, entry.valuesStr);
    }

    return new _SourceReplacementEntry(this.rule.start, this.rule.end, cssText);
  }
}

class _PolyfillContentValuesEntry {
  constructor(public contentSelectorStr: string, public valuesStr: string) {}
}

function _extractPolyfillRuleContentAndStyles(block: CssBlockAST): _PolyfillContentValuesEntry {
  var contentSelectorStr: string;
  var valuesStr: string = '';
  block.entries.forEach(entry => {
    var definition = <CssDefinitionAST>entry;
    var prop = definition.property.strValue;
    var value = definition.value.strValue;
    if (prop.toLowerCase() == 'content') {
      contentSelectorStr = _deQuote(value);
    } else {
      if (valuesStr.length > 0) {
        valuesStr += '; ';
      }
      valuesStr += _formatStyle(prop, value);
    }
  });
  return new _PolyfillContentValuesEntry(contentSelectorStr, valuesStr);
}

function _formatCssRuleFromExtractedEntry(entry: _PolyfillContentValuesEntry): string {
  return _formatRule(entry.contentSelectorStr, entry.valuesStr);
}

function _formatStyle(prop: string, value: string): string {
  var result = prop;
  if (value.length > 0) {
    result += ':' + value;
  }
  return result;
}

function _formatRule(selectorText: string, stylesText: string) {
  return selectorText + ' {' + stylesText + '}';
}

function _deQuote(text: string) {
  var SQ = '\'';
  var DQ = '"';
  var start = 0;
  var firstChar = text[start];
  var end = text.length;
  var lastChar = text[end - 1];
  var expectedQuote: string = null;
  if (firstChar == SQ || firstChar == DQ) {
    expectedQuote = firstChar;
    start++;
  }
  if (lastChar == expectedQuote) {
    end--;
  }
  return text.substring(start, end);
}

function _transformSimpleSelectorsWithSuffix(
    selectorParts: CssSimpleSelectorAST[], suffix: string, ignorePseudoSelectors = false,
    ignoreOperator = false): string {
  var selectorText = '';
  selectorParts.forEach(part => {
    part.tokens.forEach(token => { selectorText += token.strValue; });
    selectorText += suffix;

    if (!ignorePseudoSelectors) {
      part.pseudoSelectors.forEach(pseudo => { selectorText += pseudo.strValue; });
    }

    var operator = part.operator;
    if (!ignoreOperator && isPresent(operator)) {
      selectorText += ' ';
      if (operator.type != CssTokenType.Whitespace) {
        selectorText += operator.strValue + ' ';
      }
    }
  });
  return selectorText;
}

class _SourceReplacementEntry {
  constructor(public start: number, public end: number, public content: string) {}
}
