import {
  ddescribe,
  describe,
  it,
  iit,
  xit,
  expect,
  beforeEach,
  afterEach
} from 'angular2/testing_internal';

import {NumberWrapper, StringWrapper, isPresent} from "angular2/src/facade/lang";
import {BaseException} from 'angular2/src/facade/exceptions';

import {
  CssToken,
  CssParser,
  CssParseError,
  BlockType,
  CssAST,
  CssSelectorRuleAST,
  CssKeyframeRuleAST,
  CssKeyframeDefinitionAST,
  CssBlockDefinitionRuleAST,
  CssMediaQueryRuleAST,
  CssBlockRuleAST,
  CssInlineRuleAST,
  CssStyleValueAST,
  CssSelectorAST,
  CssDefinitionAST,
  CssStyleSheetAST,
  CssRuleAST,
  CssBlockAST,
  CssASTVisitor,
  CssUnknownTokenListAST
} from 'angular2/src/compiler/css/parser';

import {CssLexer} from 'angular2/src/compiler/css/lexer';

function _assertTokens(tokens, valuesArr) {
  for (var i = 0; i < tokens.length; i++) {
    expect(tokens[i].strValue == valuesArr[i]);
  }
}

class MyVisitor implements CssASTVisitor {
  captures: {[key: string]: any[]} = {};

  _capture(method, ast, context) {
    this.captures[method] = isPresent(this.captures[method]) ? this.captures[method] : [];
    this.captures[method].push([ast, context]);
  }

  constructor(ast: CssStyleSheetAST, context?: any) { ast.visit(this, context); }

  visitCssValue(ast, context?: any): void { this._capture("visitCssValue", ast, context); }

  visitInlineCssRule(ast, context?: any): void {
    this._capture("visitInlineCssRule", ast, context);
  }

  visitCssKeyframeRule(ast: CssKeyframeRuleAST, context?: any): void {
    this._capture("visitCssKeyframeRule", ast, context);
    ast.block.visit(this, context);
  }

  visitCssKeyframeDefinition(ast: CssKeyframeDefinitionAST, context?: any): void {
    this._capture("visitCssKeyframeDefinition", ast, context);
    ast.block.visit(this, context);
  }

  visitCssMediaQueryRule(ast: CssMediaQueryRuleAST, context?: any): void {
    this._capture("visitCssMediaQueryRule", ast, context);
    ast.block.visit(this, context);
  }

  visitCssSelectorRule(ast: CssSelectorRuleAST, context?: any): void {
    this._capture("visitCssSelectorRule", ast, context);
    ast.selectors.forEach((selAST: CssSelectorAST) => { selAST.visit(this, context); });
    ast.block.visit(this, context);
  }

  visitCssSelector(ast: CssSelectorAST, context?: any): void {
    this._capture("visitCssSelector", ast, context);
  }

  visitCssDefinition(ast: CssDefinitionAST, context?: any): void {
    this._capture("visitCssDefinition", ast, context);
    ast.value.visit(this, context);
  }

  visitCssBlock(ast: CssBlockAST, context?: any): void {
    this._capture("visitCssBlock", ast, context);
    ast.entries.forEach((entryAST: CssAST) => { entryAST.visit(this, context); });
  }

  visitCssStyleSheet(ast: CssStyleSheetAST, context?: any): void {
    this._capture("visitCssStyleSheet", ast, context);
    ast.rules.forEach((ruleAST: CssRuleAST) => { ruleAST.visit(this, context); });
  }

  visitUnkownRule(ast: CssUnknownTokenListAST, context?: any): void {
    // nothing
  }
}

export function main() {
  function parse(cssCode: string) {
    var lexer = new CssLexer();
    var scanner = lexer.scan(cssCode);
    var parser = new CssParser(scanner, 'some-fake-file-name.css');
    var output = parser.parse();
    var errors = output.errors;
    if (errors.length > 0) {
      throw new BaseException(errors.map((error: CssParseError) => error.msg).join(', '));
    }
    return output.ast;
  }

  describe('CSS parsing and visiting', () => {
    var ast;
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

      var rule1 = <CssSelectorRuleAST>captures[0][0];
      expect(rule1).toEqual(ast.rules[0]);
      _assertTokens(rule1.selectors[0].tokens, ['.', 'rule1']);

      var rule2 = <CssSelectorRuleAST>captures[1][0];
      expect(rule2).toEqual(ast.rules[1]);
      _assertTokens(rule2.selectors[0].tokens, ['.', 'rule2']);

      var rule3 = captures[2][0];
      expect(rule3).toEqual((<CssMediaQueryRuleAST>ast.rules[2]).block.entries[0]);
      _assertTokens(rule3.selectors[0].tokens, ['#', 'rule3']);
    });

    it('should parse and visit each of the stylesheet style key/value definitions', () => {
      var visitor = new MyVisitor(ast, context);
      var captures = visitor.captures['visitCssDefinition'];

      expect(captures.length).toEqual(5);

      var def1 = <CssDefinitionAST>captures[0][0];
      expect(def1.property.strValue).toEqual('prop1');
      expect(def1.value.tokens[0].strValue).toEqual('value1');

      var def2 = <CssDefinitionAST>captures[1][0];
      expect(def2.property.strValue).toEqual('prop2');
      expect(def2.value.tokens[0].strValue).toEqual('value2');

      var def3 = <CssDefinitionAST>captures[2][0];
      expect(def3.property.strValue).toEqual('prop3');
      expect(def3.value.tokens[0].strValue).toEqual('value3');

      var def4 = <CssDefinitionAST>captures[3][0];
      expect(def4.property.strValue).toEqual('prop4');
      expect(def4.value.tokens[0].strValue).toEqual('value4');

      var def5 = <CssDefinitionAST>captures[4][0];
      expect(def5.property.strValue).toEqual('prop5');
      expect(def5.value.tokens[0].strValue).toEqual('value5');
    });

    it('should parse and visit the associated media query values', () => {
      var visitor = new MyVisitor(ast, context);
      var captures = visitor.captures['visitCssMediaQueryRule'];

      expect(captures.length).toEqual(1);

      var query1 = <CssMediaQueryRuleAST>captures[0][0];
      _assertTokens(query1.query, ["all", "and", "(", "max-width", "100", "px", ")"]);
      expect(query1.block.entries.length).toEqual(1);
    });

    it('should parse and visit the associated "@inline" rule values', () => {
      var visitor = new MyVisitor(ast, context);
      var captures = visitor.captures['visitInlineCssRule'];

      expect(captures.length).toEqual(1);

      var query1 = <CssInlineRuleAST>captures[0][0];
      expect(query1.type).toEqual(BlockType.Import);
      _assertTokens(query1.value.tokens, ['url', '(', 'file.css', ')']);
    });

    it('should parse and visit the keyframe blocks', () => {
      var visitor = new MyVisitor(ast, context);
      var captures = visitor.captures['visitCssKeyframeRule'];

      expect(captures.length).toEqual(1);

      var keyframe1 = <CssKeyframeRuleAST>captures[0][0];
      expect(keyframe1.name.strValue).toEqual('rotate');
      expect(keyframe1.block.entries.length).toEqual(2);
    });

    it('should parse and visit the associated keyframe rules', () => {
      var visitor = new MyVisitor(ast, context);
      var captures = visitor.captures['visitCssKeyframeDefinition'];

      expect(captures.length).toEqual(2);

      var def1 = <CssKeyframeDefinitionAST>captures[0][0];
      _assertTokens(def1.steps, ['from']);
      expect(def1.block.entries.length).toEqual(1);

      var def2 = <CssKeyframeDefinitionAST>captures[1][0];
      _assertTokens(def2.steps, ['50%', '100%']);
      expect(def2.block.entries.length).toEqual(1);
    });
  });
}
