/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {describe, expect, it} from '../../../core/testing/src/testing_internal';
import {CssLexer, CssLexerMode, CssToken, CssTokenType, cssScannerError, getRawMessage, getToken} from '../../src/css_parser/css_lexer';

(function() {
  function tokenize(
      code: string, trackComments: boolean = false,
      mode: CssLexerMode = CssLexerMode.ALL): CssToken[] {
    const scanner = new CssLexer().scan(code, trackComments);
    scanner.setMode(mode);

    const tokens: CssToken[] = [];
    let output = scanner.scan();
    while (output != null) {
      const error = output.error;
      if (error != null) {
        throw cssScannerError(getToken(error), getRawMessage(error));
      }
      tokens.push(output.token);
      output = scanner.scan();
    }

    return tokens;
  }

  describe('CssLexer', () => {
    it('should lex newline characters as whitespace when whitespace mode is on', () => {
      const newlines = ['\n', '\r\n', '\r', '\f'];
      newlines.forEach((line) => {
        const token = tokenize(line, false, CssLexerMode.ALL_TRACK_WS)[0];
        expect(token.type).toEqual(CssTokenType.Whitespace);
      });
    });

    it('should combined newline characters as one newline token when whitespace mode is on', () => {
      const newlines = ['\n', '\r\n', '\r', '\f'].join('');
      const tokens = tokenize(newlines, false, CssLexerMode.ALL_TRACK_WS);
      expect(tokens.length).toEqual(1);
      expect(tokens[0].type).toEqual(CssTokenType.Whitespace);
    });

    it('should not consider whitespace or newline values at all when whitespace mode is off',
       () => {
         const newlines = ['\n', '\r\n', '\r', '\f'].join('');
         const tokens = tokenize(newlines);
         expect(tokens.length).toEqual(0);
       });

    it('should lex simple selectors and their inner properties', () => {
      const cssCode = '\n' +
          '  .selector { my-prop: my-value; }\n';
      const tokens = tokenize(cssCode);

      expect(tokens[0].type).toEqual(CssTokenType.Character);
      expect(tokens[0].strValue).toEqual('.');

      expect(tokens[1].type).toEqual(CssTokenType.Identifier);
      expect(tokens[1].strValue).toEqual('selector');

      expect(tokens[2].type).toEqual(CssTokenType.Character);
      expect(tokens[2].strValue).toEqual('{');

      expect(tokens[3].type).toEqual(CssTokenType.Identifier);
      expect(tokens[3].strValue).toEqual('my-prop');

      expect(tokens[4].type).toEqual(CssTokenType.Character);
      expect(tokens[4].strValue).toEqual(':');

      expect(tokens[5].type).toEqual(CssTokenType.Identifier);
      expect(tokens[5].strValue).toEqual('my-value');

      expect(tokens[6].type).toEqual(CssTokenType.Character);
      expect(tokens[6].strValue).toEqual(';');

      expect(tokens[7].type).toEqual(CssTokenType.Character);
      expect(tokens[7].strValue).toEqual('}');
    });

    it('should capture the column and line values for each token', () => {
      const cssCode = '#id {\n' +
          '  prop:value;\n' +
          '}';

      const tokens = tokenize(cssCode);

      // #
      expect(tokens[0].type).toEqual(CssTokenType.Character);
      expect(tokens[0].column).toEqual(0);
      expect(tokens[0].line).toEqual(0);

      // id
      expect(tokens[1].type).toEqual(CssTokenType.Identifier);
      expect(tokens[1].column).toEqual(1);
      expect(tokens[1].line).toEqual(0);

      // {
      expect(tokens[2].type).toEqual(CssTokenType.Character);
      expect(tokens[2].column).toEqual(4);
      expect(tokens[2].line).toEqual(0);

      // prop
      expect(tokens[3].type).toEqual(CssTokenType.Identifier);
      expect(tokens[3].column).toEqual(2);
      expect(tokens[3].line).toEqual(1);

      // :
      expect(tokens[4].type).toEqual(CssTokenType.Character);
      expect(tokens[4].column).toEqual(6);
      expect(tokens[4].line).toEqual(1);

      // value
      expect(tokens[5].type).toEqual(CssTokenType.Identifier);
      expect(tokens[5].column).toEqual(7);
      expect(tokens[5].line).toEqual(1);

      // ;
      expect(tokens[6].type).toEqual(CssTokenType.Character);
      expect(tokens[6].column).toEqual(12);
      expect(tokens[6].line).toEqual(1);

      // }
      expect(tokens[7].type).toEqual(CssTokenType.Character);
      expect(tokens[7].column).toEqual(0);
      expect(tokens[7].line).toEqual(2);
    });

    it('should lex quoted strings and escape accordingly', () => {
      const cssCode = 'prop: \'some { value } \\\' that is quoted\'';
      const tokens = tokenize(cssCode);

      expect(tokens[0].type).toEqual(CssTokenType.Identifier);
      expect(tokens[1].type).toEqual(CssTokenType.Character);
      expect(tokens[2].type).toEqual(CssTokenType.String);
      expect(tokens[2].strValue).toEqual('\'some { value } \\\' that is quoted\'');
    });

    it('should treat attribute operators as regular characters', () => {
      tokenize('^|~+*').forEach((token) => { expect(token.type).toEqual(CssTokenType.Character); });
    });

    it('should lex numbers properly and set them as numbers', () => {
      const cssCode = '0 1 -2 3.0 -4.001';
      const tokens = tokenize(cssCode);

      expect(tokens[0].type).toEqual(CssTokenType.Number);
      expect(tokens[0].strValue).toEqual('0');

      expect(tokens[1].type).toEqual(CssTokenType.Number);
      expect(tokens[1].strValue).toEqual('1');

      expect(tokens[2].type).toEqual(CssTokenType.Number);
      expect(tokens[2].strValue).toEqual('-2');

      expect(tokens[3].type).toEqual(CssTokenType.Number);
      expect(tokens[3].strValue).toEqual('3.0');

      expect(tokens[4].type).toEqual(CssTokenType.Number);
      expect(tokens[4].strValue).toEqual('-4.001');
    });

    it('should lex @keywords', () => {
      const cssCode = '@import()@something';
      const tokens = tokenize(cssCode);

      expect(tokens[0].type).toEqual(CssTokenType.AtKeyword);
      expect(tokens[0].strValue).toEqual('@import');

      expect(tokens[1].type).toEqual(CssTokenType.Character);
      expect(tokens[1].strValue).toEqual('(');

      expect(tokens[2].type).toEqual(CssTokenType.Character);
      expect(tokens[2].strValue).toEqual(')');

      expect(tokens[3].type).toEqual(CssTokenType.AtKeyword);
      expect(tokens[3].strValue).toEqual('@something');
    });

    it('should still lex a number even if it has a dimension suffix', () => {
      const cssCode = '40% is 40 percent';
      const tokens = tokenize(cssCode);

      expect(tokens[0].type).toEqual(CssTokenType.Number);
      expect(tokens[0].strValue).toEqual('40');

      expect(tokens[1].type).toEqual(CssTokenType.Character);
      expect(tokens[1].strValue).toEqual('%');

      expect(tokens[2].type).toEqual(CssTokenType.Identifier);
      expect(tokens[2].strValue).toEqual('is');

      expect(tokens[3].type).toEqual(CssTokenType.Number);
      expect(tokens[3].strValue).toEqual('40');
    });

    it('should allow escaped character and unicode character-strings in CSS selectors', () => {
      const cssCode = '\\123456 .some\\thing \{\}';
      const tokens = tokenize(cssCode);

      expect(tokens[0].type).toEqual(CssTokenType.Identifier);
      expect(tokens[0].strValue).toEqual('\\123456');

      expect(tokens[1].type).toEqual(CssTokenType.Character);
      expect(tokens[2].type).toEqual(CssTokenType.Identifier);
      expect(tokens[2].strValue).toEqual('some\\thing');
    });

    it('should distinguish identifiers and numbers from special characters', () => {
      const cssCode = 'one*two=-4+three-4-equals_value$';
      const tokens = tokenize(cssCode);

      expect(tokens[0].type).toEqual(CssTokenType.Identifier);
      expect(tokens[0].strValue).toEqual('one');

      expect(tokens[1].type).toEqual(CssTokenType.Character);
      expect(tokens[1].strValue).toEqual('*');

      expect(tokens[2].type).toEqual(CssTokenType.Identifier);
      expect(tokens[2].strValue).toEqual('two');

      expect(tokens[3].type).toEqual(CssTokenType.Character);
      expect(tokens[3].strValue).toEqual('=');

      expect(tokens[4].type).toEqual(CssTokenType.Number);
      expect(tokens[4].strValue).toEqual('-4');

      expect(tokens[5].type).toEqual(CssTokenType.Character);
      expect(tokens[5].strValue).toEqual('+');

      expect(tokens[6].type).toEqual(CssTokenType.Identifier);
      expect(tokens[6].strValue).toEqual('three-4-equals_value');

      expect(tokens[7].type).toEqual(CssTokenType.Character);
      expect(tokens[7].strValue).toEqual('$');
    });

    it('should filter out comments and whitespace by default', () => {
      const cssCode = '.selector /* comment */ { /* value */ }';
      const tokens = tokenize(cssCode);

      expect(tokens[0].strValue).toEqual('.');
      expect(tokens[1].strValue).toEqual('selector');
      expect(tokens[2].strValue).toEqual('{');
      expect(tokens[3].strValue).toEqual('}');
    });

    it('should track comments when the flag is set to true', () => {
      const cssCode = '.selector /* comment */ { /* value */ }';
      const trackComments = true;
      const tokens = tokenize(cssCode, trackComments, CssLexerMode.ALL_TRACK_WS);

      expect(tokens[0].strValue).toEqual('.');
      expect(tokens[1].strValue).toEqual('selector');
      expect(tokens[2].strValue).toEqual(' ');

      expect(tokens[3].type).toEqual(CssTokenType.Comment);
      expect(tokens[3].strValue).toEqual('/* comment */');

      expect(tokens[4].strValue).toEqual(' ');
      expect(tokens[5].strValue).toEqual('{');
      expect(tokens[6].strValue).toEqual(' ');

      expect(tokens[7].type).toEqual(CssTokenType.Comment);
      expect(tokens[7].strValue).toEqual('/* value */');
    });

    describe('Selector Mode', () => {
      it('should throw an error if a selector is being parsed while in the wrong mode', () => {
        const cssCode = '.class > tag';

        let capturedMessage: string|null = null;
        try {
          tokenize(cssCode, false, CssLexerMode.STYLE_BLOCK);
        } catch (e) {
          capturedMessage = getRawMessage(e);
        }

        expect(capturedMessage).toMatch(/Unexpected character \[\>\] at column 0:7 in expression/g);

        capturedMessage = null;
        try {
          tokenize(cssCode, false, CssLexerMode.SELECTOR);
        } catch (e) {
          capturedMessage = getRawMessage(e);
        }

        expect(capturedMessage).toEqual(null);
      });
    });

    describe('Attribute Mode', () => {
      it('should consider attribute selectors as valid input and throw when an invalid modifier is used',
         () => {
           function tokenizeAttr(modifier: string) {
             const cssCode = 'value' + modifier + '=\'something\'';
             return tokenize(cssCode, false, CssLexerMode.ATTRIBUTE_SELECTOR);
           }

           expect(tokenizeAttr('*').length).toEqual(4);
           expect(tokenizeAttr('|').length).toEqual(4);
           expect(tokenizeAttr('^').length).toEqual(4);
           expect(tokenizeAttr('$').length).toEqual(4);
           expect(tokenizeAttr('~').length).toEqual(4);
           expect(tokenizeAttr('').length).toEqual(3);

           expect(() => { tokenizeAttr('+'); }).toThrow();
         });
    });

    describe('Media Query Mode', () => {
      it('should validate media queries with a reduced subset of valid characters', () => {
        function tokenizeQuery(code: string) {
          return tokenize(code, false, CssLexerMode.MEDIA_QUERY);
        }

        // the reason why the numbers are so high is because MediaQueries keep
        // track of the whitespace values
        expect(tokenizeQuery('(prop: value)').length).toEqual(5);
        expect(tokenizeQuery('(prop: value) and (prop2: value2)').length).toEqual(11);
        expect(tokenizeQuery('tv and (prop: value)').length).toEqual(7);
        expect(tokenizeQuery('print and ((prop: value) or (prop2: value2))').length).toEqual(15);
        expect(tokenizeQuery('(content: \'something $ crazy inside &\')').length).toEqual(5);

        expect(() => { tokenizeQuery('(max-height: 10 + 20)'); }).toThrow();

        expect(() => { tokenizeQuery('(max-height: fifty < 100)'); }).toThrow();
      });
    });

    describe('Pseudo Selector Mode', () => {
      it('should validate pseudo selector identifiers with a reduced subset of valid characters',
         () => {
           function tokenizePseudo(code: string, withArgs = false): CssToken[] {
             const mode = withArgs ? CssLexerMode.PSEUDO_SELECTOR_WITH_ARGUMENTS :
                                     CssLexerMode.PSEUDO_SELECTOR;
             return tokenize(code, false, mode);
           }

           expect(tokenizePseudo('hover').length).toEqual(1);
           expect(tokenizePseudo('focus').length).toEqual(1);
           expect(tokenizePseudo('lang(en-us)', true).length).toEqual(4);

           expect(() => { tokenizePseudo('lang(something:broken)', true); }).toThrow();

           expect(() => { tokenizePseudo('not(.selector)', true); }).toThrow();
         });
    });

    describe(
        'Style Block Mode', () => {
          it('should style blocks with a reduced subset of valid characters',
             () => {
               function tokenizeStyles(code: string) {
                 return tokenize(code, false, CssLexerMode.STYLE_BLOCK);
               }

               expect(tokenizeStyles(`
          key: value;
          prop: 100;
          style: value3!important;
        `).length).toEqual(14);

               expect(() => tokenizeStyles(` key$: value; `)).toThrow();
               expect(() => tokenizeStyles(` key: value$; `)).toThrow();
               expect(() => tokenizeStyles(` key: value + 10; `)).toThrow();
               expect(() => tokenizeStyles(` key: &value; `)).toThrow();
             });
        });
  });
})();
