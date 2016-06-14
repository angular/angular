import {CssLexer} from '@angular/compiler/src/css/lexer';
import {BlockType, CssAST, CssASTVisitor, CssAtRulePredicateAST, CssBlockAST, CssBlockDefinitionRuleAST, CssBlockRuleAST, CssDefinitionAST, CssInlineRuleAST, CssKeyframeDefinitionAST, CssKeyframeRuleAST, CssMediaQueryRuleAST, CssParseError, CssParser, CssPseudoSelectorAST, CssRuleAST, CssSelectorAST, CssSelectorRuleAST, CssSimpleSelectorAST, CssStyleSheetAST, CssStyleValueAST, CssStylesBlockAST, CssToken, CssUnknownRuleAST, CssUnknownTokenListAST} from '@angular/compiler/src/css/parser';
import {afterEach, beforeEach, ddescribe, describe, expect, iit, it, xit} from '@angular/core/testing/testing_internal';

import {BaseException} from '../../src/facade/exceptions';
import {NumberWrapper, StringWrapper, isPresent} from '../../src/facade/lang';

function _assertTokens(tokens: CssToken[], valuesArr: string[]): void {
  expect(tokens.length).toEqual(valuesArr.length);
  for (var i = 0; i < tokens.length; i++) {
    expect(tokens[i].strValue == valuesArr[i]);
  }
}

class MyVisitor implements CssASTVisitor {
  captures: {[key: string]: any[]} = {};

  _capture(method: string, ast: CssAST, context: any) {
    this.captures[method] = isPresent(this.captures[method]) ? this.captures[method] : [];
    this.captures[method].push([ast, context]);
  }

  constructor(ast: CssStyleSheetAST, context: any) { ast.visit(this, context); }

  visitCssValue(ast: CssStyleValueAST, context: any): void {
    this._capture('visitCssValue', ast, context);
  }

  visitCssInlineRule(ast: CssInlineRuleAST, context: any): void {
    this._capture('visitInlineCssRule', ast, context);
  }

  visitCssAtRulePredicate(ast: CssAtRulePredicateAST, context: any): void {
    this._capture('visitCssAtRulePredicate', ast, context);
  }

  visitCssKeyframeRule(ast: CssKeyframeRuleAST, context: any): void {
    this._capture('visitCssKeyframeRule', ast, context);
    ast.block.visit(this, context);
  }

  visitCssKeyframeDefinition(ast: CssKeyframeDefinitionAST, context: any): void {
    this._capture('visitCssKeyframeDefinition', ast, context);
    ast.block.visit(this, context);
  }

  visitCssMediaQueryRule(ast: CssMediaQueryRuleAST, context: any): void {
    this._capture('visitCssMediaQueryRule', ast, context);
    ast.query.visit(this, context);
    ast.block.visit(this, context);
  }

  visitCssSelectorRule(ast: CssSelectorRuleAST, context: any): void {
    this._capture('visitCssSelectorRule', ast, context);
    ast.selectors.forEach((selAST: CssSelectorAST) => { selAST.visit(this, context); });
    ast.block.visit(this, context);
  }

  visitCssSelector(ast: CssSelectorAST, context: any): void {
    this._capture('visitCssSelector', ast, context);
    ast.selectorParts.forEach(
        (simpleAst: CssSimpleSelectorAST) => { simpleAst.visit(this, context); });
  }

  visitCssSimpleSelector(ast: CssSimpleSelectorAST, context: any): void {
    this._capture('visitCssSimpleSelector', ast, context);
    ast.pseudoSelectors.forEach(
        (pseudoAst: CssPseudoSelectorAST) => { pseudoAst.visit(this, context); });
  }

  visitCssDefinition(ast: CssDefinitionAST, context: any): void {
    this._capture('visitCssDefinition', ast, context);
    ast.value.visit(this, context);
  }

  visitCssBlock(ast: CssBlockAST, context: any): void {
    this._capture('visitCssBlock', ast, context);
    ast.entries.forEach((entryAST: CssAST) => { entryAST.visit(this, context); });
  }

  visitCssStylesBlock(ast: CssStylesBlockAST, context: any): void {
    this._capture('visitCssStylesBlock', ast, context);
    ast.definitions.forEach(
        (definitionAst: CssDefinitionAST) => { definitionAst.visit(this, context); });
  }

  visitCssStyleSheet(ast: CssStyleSheetAST, context: any): void {
    this._capture('visitCssStyleSheet', ast, context);
    ast.rules.forEach((ruleAST: CssRuleAST) => { ruleAST.visit(this, context); });
  }

  visitCssUnknownRule(ast: CssUnknownRuleAST, context: any): void {
    this._capture('visitUnknownRule', ast, context);
  }

  visitCssUnknownTokenList(ast: CssUnknownTokenListAST, context: any): void {
    this._capture('visitUnknownTokenList', ast, context);
  }

  visitCssPseudoSelector(ast: CssPseudoSelectorAST, context: any): void {
    this._capture('visitCssPseudoSelector', ast, context);
  }
}

function _getCaptureAst(capture: any[], index = 0): CssAST {
  return <CssAST>capture[index][0];
}

export function main() {
  function parse(cssCode: string, ignoreErrors: boolean = false) {
    var lexer = new CssLexer();
    var scanner = lexer.scan(cssCode);
    var parser = new CssParser(scanner, 'some-fake-file-name.css');
    var output = parser.parse();
    var errors = output.errors;
    if (errors.length > 0 && !ignoreErrors) {
      throw new BaseException(errors.map((error: CssParseError) => error.msg).join(', '));
    }
    return output.ast;
  }

  describe('CSS parsing and visiting', () => {
    var ast: any /** TODO #9100 */;
    var context = {};

    beforeEach(() => {
      var cssCode = `
        .rule1 { prop1: value1 }
        .rule2 { prop2: value2 }

        @media all (max-width: 100px) {
          #id { prop3 :value3; }
        }

        @import url(file.css);

        @keyframes rotate {
          from {
            prop4: value4;
          }
          50%, 100% {
            prop5: value5;
          }
        }
      `;
      ast = parse(cssCode);
    });

    it('should parse and visit a stylesheet', () => {
      var visitor = new MyVisitor(ast, context);
      var captures = visitor.captures['visitCssStyleSheet'];

      expect(captures.length).toEqual(1);

      var capture = captures[0];
      expect(capture[0]).toEqual(ast);
      expect(capture[1]).toEqual(context);
    });

    it('should parse and visit each of the stylesheet selectors', () => {
      var visitor = new MyVisitor(ast, context);
      var captures = visitor.captures['visitCssSelectorRule'];

      expect(captures.length).toEqual(3);

      var rule1 = <CssSelectorRuleAST>_getCaptureAst(captures, 0);
      expect(rule1).toEqual(ast.rules[0]);

      var firstSelector = rule1.selectors[0];
      var firstSimpleSelector = firstSelector.selectorParts[0];
      _assertTokens(firstSimpleSelector.tokens, ['.', 'rule1']);

      var rule2 = <CssSelectorRuleAST>_getCaptureAst(captures, 1);
      expect(rule2).toEqual(ast.rules[1]);

      var secondSelector = rule2.selectors[0];
      var secondSimpleSelector = secondSelector.selectorParts[0];
      _assertTokens(secondSimpleSelector.tokens, ['.', 'rule2']);

      var rule3 = <CssSelectorRuleAST>_getCaptureAst(captures, 2);
      expect(rule3).toEqual((<CssMediaQueryRuleAST>ast.rules[2]).block.entries[0]);

      var thirdSelector = rule3.selectors[0];
      var thirdSimpleSelector = thirdSelector.selectorParts[0];
      _assertTokens(thirdSimpleSelector.tokens, ['#', 'rule3']);
    });

    it('should parse and visit each of the stylesheet style key/value definitions', () => {
      var visitor = new MyVisitor(ast, context);
      var captures = visitor.captures['visitCssDefinition'];

      expect(captures.length).toEqual(5);

      var def1 = <CssDefinitionAST>_getCaptureAst(captures, 0);
      expect(def1.property.strValue).toEqual('prop1');
      expect(def1.value.tokens[0].strValue).toEqual('value1');

      var def2 = <CssDefinitionAST>_getCaptureAst(captures, 1);
      expect(def2.property.strValue).toEqual('prop2');
      expect(def2.value.tokens[0].strValue).toEqual('value2');

      var def3 = <CssDefinitionAST>_getCaptureAst(captures, 2);
      expect(def3.property.strValue).toEqual('prop3');
      expect(def3.value.tokens[0].strValue).toEqual('value3');

      var def4 = <CssDefinitionAST>_getCaptureAst(captures, 3);
      expect(def4.property.strValue).toEqual('prop4');
      expect(def4.value.tokens[0].strValue).toEqual('value4');

      var def5 = <CssDefinitionAST>_getCaptureAst(captures, 4);
      expect(def5.property.strValue).toEqual('prop5');
      expect(def5.value.tokens[0].strValue).toEqual('value5');
    });

    it('should parse and visit the associated media query values', () => {
      var visitor = new MyVisitor(ast, context);
      var captures = visitor.captures['visitCssMediaQueryRule'];

      expect(captures.length).toEqual(1);

      var query1 = <CssMediaQueryRuleAST>_getCaptureAst(captures, 0);
      _assertTokens(query1.query.tokens, ['all', 'and', '(', 'max-width', '100', 'px', ')']);
      expect(query1.block.entries.length).toEqual(1);
    });

    it('should capture the media query predicate', () => {
      var visitor = new MyVisitor(ast, context);
      var captures = visitor.captures['visitCssAtRulePredicate'];

      expect(captures.length).toEqual(1);

      var predicate = <CssAtRulePredicateAST>_getCaptureAst(captures, 0);
      expect(predicate.strValue).toEqual('@media all (max-width: 100px)');
    });

    it('should parse and visit the associated "@inline" rule values', () => {
      var visitor = new MyVisitor(ast, context);
      var captures = visitor.captures['visitCssInlineRule'];

      expect(captures.length).toEqual(1);

      var inline1 = <CssInlineRuleAST>_getCaptureAst(captures, 0);
      expect(inline1.type).toEqual(BlockType.Import);
      _assertTokens(inline1.value.tokens, ['url', '(', 'file.css', ')']);
    });

    it('should parse and visit the keyframe blocks', () => {
      var visitor = new MyVisitor(ast, context);
      var captures = visitor.captures['visitCssKeyframeRule'];

      expect(captures.length).toEqual(1);

      var keyframe1 = <CssKeyframeRuleAST>_getCaptureAst(captures, 0);
      expect(keyframe1.name.strValue).toEqual('rotate');
      expect(keyframe1.block.entries.length).toEqual(2);
    });

    it('should parse and visit the associated keyframe rules', () => {
      var visitor = new MyVisitor(ast, context);
      var captures = visitor.captures['visitCssKeyframeDefinition'];

      expect(captures.length).toEqual(2);

      var def1 = <CssKeyframeDefinitionAST>_getCaptureAst(captures, 0);
      _assertTokens(def1.steps, ['from']);
      expect(def1.block.entries.length).toEqual(1);

      var def2 = <CssKeyframeDefinitionAST>_getCaptureAst(captures, 1);
      _assertTokens(def2.steps, ['50%', '100%']);
      expect(def2.block.entries.length).toEqual(1);
    });

    it('should visit an unknown `@` rule', () => {
      var cssCode = `
        @someUnknownRule param {
          one two three
        }
      `;
      ast = parse(cssCode, true);
      var visitor = new MyVisitor(ast, context);
      var captures = visitor.captures['visitCssUnknownRule'];

      expect(captures.length).toEqual(1);

      var rule = <CssUnknownRuleAST>_getCaptureAst(captures, 0);
      expect(rule.ruleName).toEqual('@someUnknownRule');

      _assertTokens(rule.tokens, ['param', '{', 'one', 'two', 'three', '}']);
    });

    it('should collect an invalid list of tokens before a valid selector', () => {
      var cssCode = 'one two three four five; selector { }';
      ast = parse(cssCode, true);
      var visitor = new MyVisitor(ast, context);
      var captures = visitor.captures['visitCssUnknownTokenList'];

      expect(captures.length).toEqual(1);

      var rule = <CssUnknownTokenListAST>_getCaptureAst(captures, 0);
      _assertTokens(rule.tokens, ['one', 'two', 'three', 'four', 'five']);
    });

    it('should collect an invalid list of tokens after a valid selector', () => {
      var cssCode = 'selector { } six seven eight';
      ast = parse(cssCode, true);
      var visitor = new MyVisitor(ast, context);
      var captures = visitor.captures['visitCssUnknownTokenList'];

      expect(captures.length).toEqual(1);

      var rule = <CssUnknownTokenListAST>_getCaptureAst(captures, 0);
      _assertTokens(rule.tokens, ['six', 'seven', 'eight']);
    });
  });
}
