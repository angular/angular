/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


import {describe, expect, it} from '../../../core/testing/src/testing_internal';
import {CssBlockAst, CssBlockDefinitionRuleAst, CssBlockRuleAst, CssDefinitionAst, CssInlineRuleAst, CssKeyframeDefinitionAst, CssKeyframeRuleAst, CssMediaQueryRuleAst, CssSelectorRuleAst, CssStyleSheetAst, CssStyleValueAst} from '../../src/css_parser/css_ast';
import {BlockType, CssParseError, CssParser, CssToken, ParsedCssResult} from '../../src/css_parser/css_parser';
import {ParseLocation} from '../../src/parse_util';

export function assertTokens(tokens: CssToken[], valuesArr: string[]) {
  for (let i = 0; i < tokens.length; i++) {
    expect(tokens[i].strValue == valuesArr[i]);
  }
}

export function main() {
  describe('CssParser', () => {
    function parse(css: string): ParsedCssResult {
      return new CssParser().parse(css, 'some-fake-css-file.css');
    }

    function makeAst(css: string): CssStyleSheetAst {
      const output = parse(css);
      const errors = output.errors;
      if (errors.length > 0) {
        throw new Error(errors.map((error: CssParseError) => error.msg).join(', '));
      }
      return output.ast;
    }

    it('should parse CSS into a stylesheet Ast', () => {
      const styles = '.selector { prop: value123; }';

      const ast = makeAst(styles);
      expect(ast.rules.length).toEqual(1);

      const rule = <CssSelectorRuleAst>ast.rules[0];
      const selector = rule.selectors[0];
      expect(selector.strValue).toEqual('.selector');

      const block: CssBlockAst = rule.block;
      expect(block.entries.length).toEqual(1);

      const definition = <CssDefinitionAst>block.entries[0];
      expect(definition.property.strValue).toEqual('prop');

      const value = <CssStyleValueAst>definition.value;
      expect(value.tokens[0].strValue).toEqual('value123');
    });

    it('should parse multiple CSS selectors sharing the same set of styles', () => {
      const styles = `
        .class, #id, tag, [attr], key + value, * value, :-moz-any-link {
          prop: value123;
        }
      `;

      const ast = makeAst(styles);
      expect(ast.rules.length).toEqual(1);

      const rule = <CssSelectorRuleAst>ast.rules[0];
      expect(rule.selectors.length).toBe(7);

      const classRule = rule.selectors[0];
      const idRule = rule.selectors[1];
      const tagRule = rule.selectors[2];
      const attrRule = rule.selectors[3];
      const plusOpRule = rule.selectors[4];
      const starOpRule = rule.selectors[5];
      const mozRule = rule.selectors[6];

      assertTokens(classRule.selectorParts[0].tokens, ['.', 'class']);
      assertTokens(idRule.selectorParts[0].tokens, ['.', 'class']);
      assertTokens(attrRule.selectorParts[0].tokens, ['[', 'attr', ']']);

      assertTokens(plusOpRule.selectorParts[0].tokens, ['key']);
      expect(plusOpRule.selectorParts[0].operator.strValue).toEqual('+');
      assertTokens(plusOpRule.selectorParts[1].tokens, ['value']);

      assertTokens(starOpRule.selectorParts[0].tokens, ['*']);
      assertTokens(starOpRule.selectorParts[1].tokens, ['value']);

      assertTokens(mozRule.selectorParts[0].pseudoSelectors[0].tokens, [':', '-moz-any-link']);

      const style1 = <CssDefinitionAst>rule.block.entries[0];
      expect(style1.property.strValue).toEqual('prop');
      assertTokens(style1.value.tokens, ['value123']);
    });

    it('should parse keyframe rules', () => {
      const styles = `
        @keyframes rotateMe {
          from {
            transform: rotate(-360deg);
          }
          50% {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `;

      const ast = makeAst(styles);
      expect(ast.rules.length).toEqual(1);

      const rule = <CssKeyframeRuleAst>ast.rules[0];
      expect(rule.name !.strValue).toEqual('rotateMe');

      const block = <CssBlockAst>rule.block;
      const fromRule = <CssKeyframeDefinitionAst>block.entries[0];

      expect(fromRule.name !.strValue).toEqual('from');
      const fromStyle = <CssDefinitionAst>(<CssBlockAst>fromRule.block).entries[0];
      expect(fromStyle.property.strValue).toEqual('transform');
      assertTokens(fromStyle.value.tokens, ['rotate', '(', '-360', 'deg', ')']);

      const midRule = <CssKeyframeDefinitionAst>block.entries[1];

      expect(midRule.name !.strValue).toEqual('50%');
      const midStyle = <CssDefinitionAst>(<CssBlockAst>midRule.block).entries[0];
      expect(midStyle.property.strValue).toEqual('transform');
      assertTokens(midStyle.value.tokens, ['rotate', '(', '0', 'deg', ')']);

      const toRule = <CssKeyframeDefinitionAst>block.entries[2];

      expect(toRule.name !.strValue).toEqual('to');
      const toStyle = <CssDefinitionAst>(<CssBlockAst>toRule.block).entries[0];
      expect(toStyle.property.strValue).toEqual('transform');
      assertTokens(toStyle.value.tokens, ['rotate', '(', '360', 'deg', ')']);
    });

    it('should parse media queries into a stylesheet Ast', () => {
      const styles = `
        @media all and (max-width:100px) {
          .selector {
            prop: value123;
          }
        }
      `;

      const ast = makeAst(styles);
      expect(ast.rules.length).toEqual(1);

      const rule = <CssMediaQueryRuleAst>ast.rules[0];
      assertTokens(rule.query.tokens, ['all', 'and', '(', 'max-width', ':', '100', 'px', ')']);

      const block = <CssBlockAst>rule.block;
      expect(block.entries.length).toEqual(1);

      const rule2 = <CssSelectorRuleAst>block.entries[0];
      expect(rule2.selectors[0].strValue).toEqual('.selector');

      const block2 = <CssBlockAst>rule2.block;
      expect(block2.entries.length).toEqual(1);
    });

    it('should parse inline CSS values', () => {
      const styles = `
        @import url('remote.css');
        @charset "UTF-8";
        @namespace ng url(http://angular.io/namespace/ng);
      `;

      const ast = makeAst(styles);

      const importRule = <CssInlineRuleAst>ast.rules[0];
      expect(importRule.type).toEqual(BlockType.Import);
      assertTokens(importRule.value.tokens, ['url', '(', 'remote', '.', 'css', ')']);

      const charsetRule = <CssInlineRuleAst>ast.rules[1];
      expect(charsetRule.type).toEqual(BlockType.Charset);
      assertTokens(charsetRule.value.tokens, ['UTF-8']);

      const namespaceRule = <CssInlineRuleAst>ast.rules[2];
      expect(namespaceRule.type).toEqual(BlockType.Namespace);
      assertTokens(
          namespaceRule.value.tokens, ['ng', 'url', '(', 'http://angular.io/namespace/ng', ')']);
    });

    it('should parse CSS values that contain functions and leave the inner function data untokenized',
       () => {
         const styles = `
        .class {
          background: url(matias.css);
          animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060);
          height: calc(100% - 50px);
          background-image: linear-gradient( 45deg, rgba(100, 0, 0, 0.5), black );
        }
      `;

         const ast = makeAst(styles);
         expect(ast.rules.length).toEqual(1);

         const defs = (<CssSelectorRuleAst>ast.rules[0]).block.entries;
         expect(defs.length).toEqual(4);

         assertTokens((<CssDefinitionAst>defs[0]).value.tokens, ['url', '(', 'matias.css', ')']);
         assertTokens(
             (<CssDefinitionAst>defs[1]).value.tokens,
             ['cubic-bezier', '(', '0.755, 0.050, 0.855, 0.060', ')']);
         assertTokens((<CssDefinitionAst>defs[2]).value.tokens, ['calc', '(', '100% - 50px', ')']);
         assertTokens(
             (<CssDefinitionAst>defs[3]).value.tokens,
             ['linear-gradient', '(', '45deg, rgba(100, 0, 0, 0.5), black', ')']);
       });

    it('should parse un-named block-level CSS values', () => {
      const styles = `
        @font-face {
          font-family: "Matias";
          font-weight: bold;
          src: url(font-face.ttf);
        }
        @viewport {
          max-width: 100px;
          min-height: 1000px;
        }
      `;

      const ast = makeAst(styles);

      const fontFaceRule = <CssBlockRuleAst>ast.rules[0];
      expect(fontFaceRule.type).toEqual(BlockType.FontFace);
      expect(fontFaceRule.block.entries.length).toEqual(3);

      const viewportRule = <CssBlockRuleAst>ast.rules[1];
      expect(viewportRule.type).toEqual(BlockType.Viewport);
      expect(viewportRule.block.entries.length).toEqual(2);
    });

    it('should parse multiple levels of semicolons', () => {
      const styles = `
        ;;;
        @import url('something something')
        ;;;;;;;;
        ;;;;;;;;
        ;@font-face {
          ;src   :   url(font-face.ttf);;;;;;;;
          ;;;-webkit-animation:my-animation
        };;;
        @media all and (max-width:100px)
        {;
          .selector {prop: value123;};
          ;.selector2{prop:1}}
      `;

      const ast = makeAst(styles);

      const importRule = <CssInlineRuleAst>ast.rules[0];
      expect(importRule.type).toEqual(BlockType.Import);
      assertTokens(importRule.value.tokens, ['url', '(', 'something something', ')']);

      const fontFaceRule = <CssBlockRuleAst>ast.rules[1];
      expect(fontFaceRule.type).toEqual(BlockType.FontFace);
      expect(fontFaceRule.block.entries.length).toEqual(2);

      const mediaQueryRule = <CssMediaQueryRuleAst>ast.rules[2];
      assertTokens(
          mediaQueryRule.query.tokens, ['all', 'and', '(', 'max-width', ':', '100', 'px', ')']);
      expect(mediaQueryRule.block.entries.length).toEqual(2);
    });

    it('should throw an error if an unknown @value block rule is parsed', () => {
      const styles = `
        @matias { hello: there; }
      `;

      expect(() => {
        makeAst(styles);
      }).toThrowError(/^CSS Parse Error: The CSS "at" rule "@matias" is not allowed to used here/g);
    });

    it('should parse empty rules', () => {
      const styles = `
        .empty-rule { }
        .somewhat-empty-rule { /* property: value; */ }
        .non-empty-rule { property: value; }
      `;

      const ast = makeAst(styles);

      const rules = ast.rules;
      expect((<CssSelectorRuleAst>rules[0]).block.entries.length).toEqual(0);
      expect((<CssSelectorRuleAst>rules[1]).block.entries.length).toEqual(0);
      expect((<CssSelectorRuleAst>rules[2]).block.entries.length).toEqual(1);
    });

    it('should parse the @document rule', () => {
      const styles = `
        @document url(http://www.w3.org/),
                       url-prefix(http://www.w3.org/Style/),
                       domain(mozilla.org),
                       regexp("https:.*")
        {
          /* CSS rules here apply to:
             - The page "http://www.w3.org/".
             - Any page whose URL begins with "http://www.w3.org/Style/"
             - Any page whose URL's host is "mozilla.org" or ends with
               ".mozilla.org"
             - Any page whose URL starts with "https:" */

          /* make the above-mentioned pages really ugly */
          body {
            color: purple;
            background: yellow;
          }
        }
      `;

      const ast = makeAst(styles);

      const rules = ast.rules;
      const documentRule = <CssBlockDefinitionRuleAst>rules[0];
      expect(documentRule.type).toEqual(BlockType.Document);

      const rule = <CssSelectorRuleAst>documentRule.block.entries[0];
      expect(rule.strValue).toEqual('body');
    });

    it('should parse the @page rule', () => {
      const styles = `
        @page one {
          .selector { prop: value; }
        }
        @page two {
          .selector2 { prop: value2; }
        }
      `;

      const ast = makeAst(styles);

      const rules = ast.rules;

      const pageRule1 = <CssBlockDefinitionRuleAst>rules[0];
      expect(pageRule1.query.strValue).toEqual('@page one');
      expect(pageRule1.query.tokens[0].strValue).toEqual('one');
      expect(pageRule1.type).toEqual(BlockType.Page);

      const pageRule2 = <CssBlockDefinitionRuleAst>rules[1];
      expect(pageRule2.query.strValue).toEqual('@page two');
      expect(pageRule2.query.tokens[0].strValue).toEqual('two');
      expect(pageRule2.type).toEqual(BlockType.Page);

      const selectorOne = <CssSelectorRuleAst>pageRule1.block.entries[0];
      expect(selectorOne.strValue).toEqual('.selector');

      const selectorTwo = <CssSelectorRuleAst>pageRule2.block.entries[0];
      expect(selectorTwo.strValue).toEqual('.selector2');
    });

    it('should parse the @supports rule', () => {
      const styles = `
        @supports (animation-name: "rotate") {
          a:hover { animation: rotate 1s; }
        }
      `;

      const ast = makeAst(styles);

      const rules = ast.rules;

      const supportsRule = <CssBlockDefinitionRuleAst>rules[0];
      assertTokens(supportsRule.query.tokens, ['(', 'animation-name', ':', 'rotate', ')']);
      expect(supportsRule.type).toEqual(BlockType.Supports);

      const selectorOne = <CssSelectorRuleAst>supportsRule.block.entries[0];
      expect(selectorOne.strValue).toEqual('a:hover');
    });

    it('should collect multiple errors during parsing', () => {
      const styles = `
        .class$value { something: something }
        @custom { something: something }
        #id { cool^: value }
      `;

      const output = parse(styles);
      expect(output.errors.length).toEqual(3);
    });

    it('should recover from selector errors and continue parsing', () => {
      const styles = `
        tag& { key: value; }
        .%tag { key: value; }
        #tag$ { key: value; }
      `;

      const output = parse(styles);
      const errors = output.errors;
      const ast = output.ast;

      expect(errors.length).toEqual(3);

      expect(ast.rules.length).toEqual(3);

      const rule1 = <CssSelectorRuleAst>ast.rules[0];
      expect(rule1.selectors[0].strValue).toEqual('tag&');
      expect(rule1.block.entries.length).toEqual(1);

      const rule2 = <CssSelectorRuleAst>ast.rules[1];
      expect(rule2.selectors[0].strValue).toEqual('.%tag');
      expect(rule2.block.entries.length).toEqual(1);

      const rule3 = <CssSelectorRuleAst>ast.rules[2];
      expect(rule3.selectors[0].strValue).toEqual('#tag$');
      expect(rule3.block.entries.length).toEqual(1);
    });

    it('should throw an error when parsing invalid CSS Selectors', () => {
      const styles = '.class[[prop%=value}] { style: val; }';
      const output = parse(styles);
      const errors = output.errors;

      expect(errors.length).toEqual(3);

      expect(errors[0].msg).toMatch(/Unexpected character \[\[\] at column 0:7/g);

      expect(errors[1].msg).toMatch(/Unexpected character \[%\] at column 0:12/g);

      expect(errors[2].msg).toMatch(/Unexpected character \[}\] at column 0:19/g);
    });

    it('should throw an error if an attribute selector is not closed properly', () => {
      const styles = '.class[prop=value { style: val; }';
      const output = parse(styles);
      const errors = output.errors;

      expect(errors[0].msg).toMatch(/Unbalanced CSS attribute selector at column 0:12/g);
    });

    it('should throw an error if a pseudo function selector is not closed properly', () => {
      const styles = 'body:lang(en { key:value; }';
      const output = parse(styles);
      const errors = output.errors;

      expect(errors[0].msg)
          .toMatch(/Character does not match expected Character value \("{" should match "\)"\)/);
    });

    it('should raise an error when a semi colon is missing from a CSS style/pair that isn\'t the last entry',
       () => {
         const styles = `.class {
        color: red
        background: blue
      }`;

         const output = parse(styles);
         const errors = output.errors;

         expect(errors.length).toEqual(1);

         expect(errors[0].msg)
             .toMatch(/The CSS key\/value definition did not end with a semicolon at column 1:15/g);
       });

    it('should parse the inner value of a :not() pseudo-selector as a CSS selector', () => {
      const styles = `div:not(.ignore-this-div) {
        prop: value;
      }`;

      const output = parse(styles);
      const errors = output.errors;
      const ast = output.ast;

      expect(errors.length).toEqual(0);

      const rule1 = <CssSelectorRuleAst>ast.rules[0];
      expect(rule1.selectors.length).toEqual(1);

      const simpleSelector = rule1.selectors[0].selectorParts[0];
      assertTokens(simpleSelector.tokens, ['div']);

      const pseudoSelector = simpleSelector.pseudoSelectors[0];
      expect(pseudoSelector.name).toEqual('not');
      assertTokens(pseudoSelector.tokens, ['.', 'ignore-this-div']);
    });

    it('should parse the inner selectors of a :host-context selector', () => {
      const styles = `body > :host-context(.a, .b, .c:hover) {
        prop: value;
      }`;

      const output = parse(styles);
      const errors = output.errors;
      const ast = output.ast;

      expect(errors.length).toEqual(0);

      const rule1 = <CssSelectorRuleAst>ast.rules[0];
      expect(rule1.selectors.length).toEqual(1);

      const simpleSelector = rule1.selectors[0].selectorParts[1];
      const innerSelectors = simpleSelector.pseudoSelectors[0].innerSelectors;

      assertTokens(innerSelectors[0].selectorParts[0].tokens, ['.', 'a']);
      assertTokens(innerSelectors[1].selectorParts[0].tokens, ['.', 'b']);

      const finalSelector = innerSelectors[2].selectorParts[0];
      assertTokens(finalSelector.tokens, ['.', 'c', ':', 'hover']);
      assertTokens(finalSelector.pseudoSelectors[0].tokens, [':', 'hover']);
    });

    it('should raise parse errors when CSS key/value pairs are invalid', () => {
      const styles = `.class {
        background color: value;
        color: value
        font-size;
        font-weight
      }`;

      const output = parse(styles);
      const errors = output.errors;

      expect(errors.length).toEqual(4);

      expect(errors[0].msg)
          .toMatch(
              /Identifier does not match expected Character value \("color" should match ":"\) at column 1:19/g);

      expect(errors[1].msg)
          .toMatch(/The CSS key\/value definition did not end with a semicolon at column 2:15/g);

      expect(errors[2].msg)
          .toMatch(/The CSS property was not paired with a style value at column 3:8/g);

      expect(errors[3].msg)
          .toMatch(/The CSS property was not paired with a style value at column 4:8/g);
    });

    it('should recover from CSS key/value parse errors', () => {
      const styles = `
        .problem-class { background color: red; color: white; }
        .good-boy-class { background-color: red; color: white; }
       `;

      const output = parse(styles);
      const ast = output.ast;

      expect(ast.rules.length).toEqual(2);

      const rule1 = <CssSelectorRuleAst>ast.rules[0];
      expect(rule1.block.entries.length).toEqual(2);

      const style1 = <CssDefinitionAst>rule1.block.entries[0];
      expect(style1.property.strValue).toEqual('background color');
      assertTokens(style1.value.tokens, ['red']);

      const style2 = <CssDefinitionAst>rule1.block.entries[1];
      expect(style2.property.strValue).toEqual('color');
      assertTokens(style2.value.tokens, ['white']);
    });

    describe('location offsets', () => {
      let styles: string;

      function assertMatchesOffsetAndChar(
          location: ParseLocation, expectedOffset: number, expectedChar: string): void {
        expect(location.offset).toEqual(expectedOffset);
        expect(styles[expectedOffset]).toEqual(expectedChar);
      }

      it('should collect the source span location of each AST node with regular selectors', () => {
        styles = '.problem-class { border-top-right: 1px; color: white; }\n';
        styles += '#good-boy-rule_ { background-color: #fe4; color: teal; }';

        const output = parse(styles);
        const ast = output.ast;
        assertMatchesOffsetAndChar(ast.location.start, 0, '.');
        assertMatchesOffsetAndChar(ast.location.end, 111, '}');

        const rule1 = <CssSelectorRuleAst>ast.rules[0];
        assertMatchesOffsetAndChar(rule1.location.start, 0, '.');
        assertMatchesOffsetAndChar(rule1.location.end, 54, '}');

        const rule2 = <CssSelectorRuleAst>ast.rules[1];
        assertMatchesOffsetAndChar(rule2.location.start, 56, '#');
        assertMatchesOffsetAndChar(rule2.location.end, 111, '}');

        const selector1 = rule1.selectors[0];
        assertMatchesOffsetAndChar(selector1.location.start, 0, '.');
        assertMatchesOffsetAndChar(selector1.location.end, 1, 'p');  // problem-class

        const selector2 = rule2.selectors[0];
        assertMatchesOffsetAndChar(selector2.location.start, 56, '#');
        assertMatchesOffsetAndChar(selector2.location.end, 57, 'g');  // good-boy-rule_

        const block1 = rule1.block;
        assertMatchesOffsetAndChar(block1.location.start, 15, '{');
        assertMatchesOffsetAndChar(block1.location.end, 54, '}');

        const block2 = rule2.block;
        assertMatchesOffsetAndChar(block2.location.start, 72, '{');
        assertMatchesOffsetAndChar(block2.location.end, 111, '}');

        const block1def1 = <CssDefinitionAst>block1.entries[0];
        assertMatchesOffsetAndChar(block1def1.location.start, 17, 'b');  // border-top-right
        assertMatchesOffsetAndChar(block1def1.location.end, 36, 'p');    // px

        const block1def2 = <CssDefinitionAst>block1.entries[1];
        assertMatchesOffsetAndChar(block1def2.location.start, 40, 'c');  // color
        assertMatchesOffsetAndChar(block1def2.location.end, 47, 'w');    // white

        const block2def1 = <CssDefinitionAst>block2.entries[0];
        assertMatchesOffsetAndChar(block2def1.location.start, 74, 'b');  // background-color
        assertMatchesOffsetAndChar(block2def1.location.end, 93, 'f');    // fe4

        const block2def2 = <CssDefinitionAst>block2.entries[1];
        assertMatchesOffsetAndChar(block2def2.location.start, 98, 'c');  // color
        assertMatchesOffsetAndChar(block2def2.location.end, 105, 't');   // teal

        const block1value1 = block1def1.value;
        assertMatchesOffsetAndChar(block1value1.location.start, 35, '1');
        assertMatchesOffsetAndChar(block1value1.location.end, 36, 'p');

        const block1value2 = block1def2.value;
        assertMatchesOffsetAndChar(block1value2.location.start, 47, 'w');
        assertMatchesOffsetAndChar(block1value2.location.end, 47, 'w');

        const block2value1 = block2def1.value;
        assertMatchesOffsetAndChar(block2value1.location.start, 92, '#');
        assertMatchesOffsetAndChar(block2value1.location.end, 93, 'f');

        const block2value2 = block2def2.value;
        assertMatchesOffsetAndChar(block2value2.location.start, 105, 't');
        assertMatchesOffsetAndChar(block2value2.location.end, 105, 't');
      });

      it('should collect the source span location of each AST node with media query data', () => {
        styles = '@media (all and max-width: 100px) { a { display:none; } }';

        const output = parse(styles);
        const ast = output.ast;

        const mediaQuery = <CssMediaQueryRuleAst>ast.rules[0];
        assertMatchesOffsetAndChar(mediaQuery.location.start, 0, '@');
        assertMatchesOffsetAndChar(mediaQuery.location.end, 56, '}');

        const predicate = mediaQuery.query;
        assertMatchesOffsetAndChar(predicate.location.start, 0, '@');
        assertMatchesOffsetAndChar(predicate.location.end, 32, ')');

        const rule = <CssSelectorRuleAst>mediaQuery.block.entries[0];
        assertMatchesOffsetAndChar(rule.location.start, 36, 'a');
        assertMatchesOffsetAndChar(rule.location.end, 54, '}');
      });

      it('should collect the source span location of each AST node with keyframe data', () => {
        styles = '@keyframes rotateAndZoomOut { ';
        styles += 'from { transform: rotate(0deg); } ';
        styles += '100% { transform: rotate(360deg) scale(2); }';
        styles += '}';

        const output = parse(styles);
        const ast = output.ast;

        const keyframes = <CssKeyframeRuleAst>ast.rules[0];
        assertMatchesOffsetAndChar(keyframes.location.start, 0, '@');
        assertMatchesOffsetAndChar(keyframes.location.end, 108, '}');

        const step1 = <CssKeyframeDefinitionAst>keyframes.block.entries[0];
        assertMatchesOffsetAndChar(step1.location.start, 30, 'f');
        assertMatchesOffsetAndChar(step1.location.end, 62, '}');

        const step2 = <CssKeyframeDefinitionAst>keyframes.block.entries[1];
        assertMatchesOffsetAndChar(step2.location.start, 64, '1');
        assertMatchesOffsetAndChar(step2.location.end, 107, '}');
      });

      it('should collect the source span location of each AST node with an inline rule', () => {
        styles = '@import url(something.css)';

        const output = parse(styles);
        const ast = output.ast;

        const rule = <CssInlineRuleAst>ast.rules[0];
        assertMatchesOffsetAndChar(rule.location.start, 0, '@');
        assertMatchesOffsetAndChar(rule.location.end, 25, ')');

        const value = rule.value;
        assertMatchesOffsetAndChar(value.location.start, 8, 'u');
        assertMatchesOffsetAndChar(value.location.end, 25, ')');
      });

      it('should property collect the start/end locations with an invalid stylesheet', () => {
        styles = '#id { something: value';

        const output = parse(styles);
        const ast = output.ast;

        assertMatchesOffsetAndChar(ast.location.start, 0, '#');
        assertMatchesOffsetAndChar(ast.location.end, 22, undefined !);
      });
    });

    it('should parse minified CSS content properly', () => {
      // this code was taken from the angular.io webpage's CSS code
      const styles = `
.is-hidden{display:none!important}
.is-visible{display:block!important}
.is-visually-hidden{height:1px;width:1px;overflow:hidden;opacity:0.01;position:absolute;bottom:0;right:0;z-index:1}
.grid-fluid,.grid-fixed{margin:0 auto}
.grid-fluid .c1,.grid-fixed .c1,.grid-fluid .c2,.grid-fixed .c2,.grid-fluid .c3,.grid-fixed .c3,.grid-fluid .c4,.grid-fixed .c4,.grid-fluid .c5,.grid-fixed .c5,.grid-fluid .c6,.grid-fixed .c6,.grid-fluid .c7,.grid-fixed .c7,.grid-fluid .c8,.grid-fixed .c8,.grid-fluid .c9,.grid-fixed .c9,.grid-fluid .c10,.grid-fixed .c10,.grid-fluid .c11,.grid-fixed .c11,.grid-fluid .c12,.grid-fixed .c12{display:inline;float:left}
.grid-fluid .c1.grid-right,.grid-fixed .c1.grid-right,.grid-fluid .c2.grid-right,.grid-fixed .c2.grid-right,.grid-fluid .c3.grid-right,.grid-fixed .c3.grid-right,.grid-fluid .c4.grid-right,.grid-fixed .c4.grid-right,.grid-fluid .c5.grid-right,.grid-fixed .c5.grid-right,.grid-fluid .c6.grid-right,.grid-fixed .c6.grid-right,.grid-fluid .c7.grid-right,.grid-fixed .c7.grid-right,.grid-fluid .c8.grid-right,.grid-fixed .c8.grid-right,.grid-fluid .c9.grid-right,.grid-fixed .c9.grid-right,.grid-fluid .c10.grid-right,.grid-fixed .c10.grid-right,.grid-fluid .c11.grid-right,.grid-fixed .c11.grid-right,.grid-fluid .c12.grid-right,.grid-fixed .c12.grid-right{float:right}
.grid-fluid .c1.nb,.grid-fixed .c1.nb,.grid-fluid .c2.nb,.grid-fixed .c2.nb,.grid-fluid .c3.nb,.grid-fixed .c3.nb,.grid-fluid .c4.nb,.grid-fixed .c4.nb,.grid-fluid .c5.nb,.grid-fixed .c5.nb,.grid-fluid .c6.nb,.grid-fixed .c6.nb,.grid-fluid .c7.nb,.grid-fixed .c7.nb,.grid-fluid .c8.nb,.grid-fixed .c8.nb,.grid-fluid .c9.nb,.grid-fixed .c9.nb,.grid-fluid .c10.nb,.grid-fixed .c10.nb,.grid-fluid .c11.nb,.grid-fixed .c11.nb,.grid-fluid .c12.nb,.grid-fixed .c12.nb{margin-left:0}
.grid-fluid .c1.na,.grid-fixed .c1.na,.grid-fluid .c2.na,.grid-fixed .c2.na,.grid-fluid .c3.na,.grid-fixed .c3.na,.grid-fluid .c4.na,.grid-fixed .c4.na,.grid-fluid .c5.na,.grid-fixed .c5.na,.grid-fluid .c6.na,.grid-fixed .c6.na,.grid-fluid .c7.na,.grid-fixed .c7.na,.grid-fluid .c8.na,.grid-fixed .c8.na,.grid-fluid .c9.na,.grid-fixed .c9.na,.grid-fluid .c10.na,.grid-fixed .c10.na,.grid-fluid .c11.na,.grid-fixed .c11.na,.grid-fluid .c12.na,.grid-fixed .c12.na{margin-right:0}
       `;

      const output = parse(styles);
      const errors = output.errors;
      expect(errors.length).toEqual(0);

      const ast = output.ast;
      expect(ast.rules.length).toEqual(8);
    });

    it('should parse a snippet of keyframe code from animate.css properly', () => {
      // this code was taken from the angular.io webpage's CSS code
      const styles = `
@charset "UTF-8";

/*!
 * animate.css -http://daneden.me/animate
 * Version - 3.5.1
 * Licensed under the MIT license - http://opensource.org/licenses/MIT
 *
 * Copyright (c) 2016 Daniel Eden
 */

.animated {
  -webkit-animation-duration: 1s;
  animation-duration: 1s;
  -webkit-animation-fill-mode: both;
  animation-fill-mode: both;
}

.animated.infinite {
  -webkit-animation-iteration-count: infinite;
  animation-iteration-count: infinite;
}

.animated.hinge {
  -webkit-animation-duration: 2s;
  animation-duration: 2s;
}

.animated.flipOutX,
.animated.flipOutY,
.animated.bounceIn,
.animated.bounceOut {
  -webkit-animation-duration: .75s;
  animation-duration: .75s;
}

@-webkit-keyframes bounce {
  from, 20%, 53%, 80%, to {
    -webkit-animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);
    animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);
    -webkit-transform: translate3d(0,0,0);
    transform: translate3d(0,0,0);
  }

  40%, 43% {
    -webkit-animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060);
    animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060);
    -webkit-transform: translate3d(0, -30px, 0);
    transform: translate3d(0, -30px, 0);
  }

  70% {
    -webkit-animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060);
    animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060);
    -webkit-transform: translate3d(0, -15px, 0);
    transform: translate3d(0, -15px, 0);
  }

  90% {
    -webkit-transform: translate3d(0,-4px,0);
    transform: translate3d(0,-4px,0);
  }
}
       `;

      const output = parse(styles);
      const errors = output.errors;
      expect(errors.length).toEqual(0);

      const ast = output.ast;
      expect(ast.rules.length).toEqual(6);

      const finalRule = <CssBlockRuleAst>ast.rules[ast.rules.length - 1];
      expect(finalRule.type).toEqual(BlockType.Keyframes);
      expect(finalRule.block.entries.length).toEqual(4);
    });
  });
}
