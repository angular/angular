/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Lexer, Token} from '@angular/compiler/src/expression_parser/lexer';

function lex(text: string): any[] {
  return new Lexer().tokenize(text);
}

function expectToken(token: any, index: number, end: number) {
  expect(token instanceof Token).toBe(true);
  expect(token.index).toEqual(index);
  expect(token.end).toEqual(end);
}

function expectCharacterToken(token: any, index: number, end: number, character: string) {
  expect(character.length).toBe(1);
  expectToken(token, index, end);
  expect(token.isCharacter(character.charCodeAt(0))).toBe(true);
}

function expectOperatorToken(token: any, index: number, end: number, operator: string) {
  expectToken(token, index, end);
  expect(token.isOperator(operator)).toBe(true);
}

function expectNumberToken(token: any, index: number, end: number, n: number) {
  expectToken(token, index, end);
  expect(token.isNumber()).toBe(true);
  expect(token.toNumber()).toEqual(n);
}

function expectStringToken(token: any, index: number, end: number, str: string) {
  expectToken(token, index, end);
  expect(token.isString()).toBe(true);
  expect(token.toString()).toEqual(str);
}

function expectIdentifierToken(token: any, index: number, end: number, identifier: string) {
  expectToken(token, index, end);
  expect(token.isIdentifier()).toBe(true);
  expect(token.toString()).toEqual(identifier);
}

function expectPrivateIdentifierToken(token: any, index: number, end: number, identifier: string) {
  expectToken(token, index, end);
  expect(token.isPrivateIdentifier()).toBe(true);
  expect(token.toString()).toEqual(identifier);
}


function expectKeywordToken(token: any, index: number, end: number, keyword: string) {
  expectToken(token, index, end);
  expect(token.isKeyword()).toBe(true);
  expect(token.toString()).toEqual(keyword);
}

function expectErrorToken(token: Token, index: any, end: number, message: string) {
  expectToken(token, index, end);
  expect(token.isError()).toBe(true);
  expect(token.toString()).toEqual(message);
}

{
  describe('lexer', () => {
    describe('token', () => {
      it('should tokenize a simple identifier', () => {
        const tokens: number[] = lex('j');
        expect(tokens.length).toEqual(1);
        expectIdentifierToken(tokens[0], 0, 1, 'j');
      });

      it('should tokenize "this"', () => {
        const tokens: number[] = lex('this');
        expect(tokens.length).toEqual(1);
        expectKeywordToken(tokens[0], 0, 4, 'this');
      });

      it('should tokenize a dotted identifier', () => {
        const tokens: number[] = lex('j.k');
        expect(tokens.length).toEqual(3);
        expectIdentifierToken(tokens[0], 0, 1, 'j');
        expectCharacterToken(tokens[1], 1, 2, '.');
        expectIdentifierToken(tokens[2], 2, 3, 'k');
      });

      it('should tokenize a private identifier', () => {
        const tokens: number[] = lex('#a');
        expect(tokens.length).toEqual(1);
        expectPrivateIdentifierToken(tokens[0], 0, 2, '#a');
      });

      it('should tokenize a property access with private identifier', () => {
        const tokens: number[] = lex('j.#k');
        expect(tokens.length).toEqual(3);
        expectIdentifierToken(tokens[0], 0, 1, 'j');
        expectCharacterToken(tokens[1], 1, 2, '.');
        expectPrivateIdentifierToken(tokens[2], 2, 4, '#k');
      });

      it('should throw an invalid character error when a hash character is discovered but ' +
             'not indicating a private identifier',
         () => {
           expectErrorToken(
               lex('#')[0], 0, 1,
               `Lexer Error: Invalid character [#] at column 0 in expression [#]`);
           expectErrorToken(
               lex('#0')[0], 0, 1,
               `Lexer Error: Invalid character [#] at column 0 in expression [#0]`);
         });

      it('should tokenize an operator', () => {
        const tokens: number[] = lex('j-k');
        expect(tokens.length).toEqual(3);
        expectOperatorToken(tokens[1], 1, 2, '-');
      });

      it('should tokenize an indexed operator', () => {
        const tokens: number[] = lex('j[k]');
        expect(tokens.length).toEqual(4);
        expectCharacterToken(tokens[1], 1, 2, '[');
        expectCharacterToken(tokens[3], 3, 4, ']');
      });

      it('should tokenize a safe indexed operator', () => {
        const tokens: number[] = lex('j?.[k]');
        expect(tokens.length).toBe(5);
        expectOperatorToken(tokens[1], 1, 3, '?.');
        expectCharacterToken(tokens[2], 3, 4, '[');
        expectCharacterToken(tokens[4], 5, 6, ']');
      });

      it('should tokenize numbers', () => {
        const tokens: number[] = lex('88');
        expect(tokens.length).toEqual(1);
        expectNumberToken(tokens[0], 0, 2, 88);
      });

      it('should tokenize numbers within index ops', () => {
        expectNumberToken(lex('a[22]')[2], 2, 4, 22);
      });

      it('should tokenize simple quoted strings', () => {
        expectStringToken(lex('"a"')[0], 0, 3, 'a');
      });

      it('should tokenize quoted strings with escaped quotes', () => {
        expectStringToken(lex('"a\\""')[0], 0, 5, 'a"');
      });

      it('should tokenize a string', () => {
        const tokens: Token[] = lex('j-a.bc[22]+1.3|f:\'a\\\'c\':"d\\"e"');
        expectIdentifierToken(tokens[0], 0, 1, 'j');
        expectOperatorToken(tokens[1], 1, 2, '-');
        expectIdentifierToken(tokens[2], 2, 3, 'a');
        expectCharacterToken(tokens[3], 3, 4, '.');
        expectIdentifierToken(tokens[4], 4, 6, 'bc');
        expectCharacterToken(tokens[5], 6, 7, '[');
        expectNumberToken(tokens[6], 7, 9, 22);
        expectCharacterToken(tokens[7], 9, 10, ']');
        expectOperatorToken(tokens[8], 10, 11, '+');
        expectNumberToken(tokens[9], 11, 14, 1.3);
        expectOperatorToken(tokens[10], 14, 15, '|');
        expectIdentifierToken(tokens[11], 15, 16, 'f');
        expectCharacterToken(tokens[12], 16, 17, ':');
        expectStringToken(tokens[13], 17, 23, 'a\'c');
        expectCharacterToken(tokens[14], 23, 24, ':');
        expectStringToken(tokens[15], 24, 30, 'd"e');
      });

      it('should tokenize undefined', () => {
        const tokens: Token[] = lex('undefined');
        expectKeywordToken(tokens[0], 0, 9, 'undefined');
        expect(tokens[0].isKeywordUndefined()).toBe(true);
      });

      it('should ignore whitespace', () => {
        const tokens: Token[] = lex('a \t \n \r b');
        expectIdentifierToken(tokens[0], 0, 1, 'a');
        expectIdentifierToken(tokens[1], 8, 9, 'b');
      });

      it('should tokenize quoted string', () => {
        const str = '[\'\\\'\', "\\""]';
        const tokens: Token[] = lex(str);
        expectStringToken(tokens[1], 1, 5, '\'');
        expectStringToken(tokens[3], 7, 11, '"');
      });

      it('should tokenize escaped quoted string', () => {
        const str = '"\\"\\n\\f\\r\\t\\v\\u00A0"';
        const tokens: Token[] = lex(str);
        expect(tokens.length).toEqual(1);
        expect(tokens[0].toString()).toEqual('"\n\f\r\t\v\u00A0');
      });

      it('should tokenize unicode', () => {
        const tokens: Token[] = lex('"\\u00A0"');
        expect(tokens.length).toEqual(1);
        expect(tokens[0].toString()).toEqual('\u00a0');
      });

      it('should tokenize relation', () => {
        const tokens: Token[] = lex('! == != < > <= >= === !==');
        expectOperatorToken(tokens[0], 0, 1, '!');
        expectOperatorToken(tokens[1], 2, 4, '==');
        expectOperatorToken(tokens[2], 5, 7, '!=');
        expectOperatorToken(tokens[3], 8, 9, '<');
        expectOperatorToken(tokens[4], 10, 11, '>');
        expectOperatorToken(tokens[5], 12, 14, '<=');
        expectOperatorToken(tokens[6], 15, 17, '>=');
        expectOperatorToken(tokens[7], 18, 21, '===');
        expectOperatorToken(tokens[8], 22, 25, '!==');
      });

      it('should tokenize statements', () => {
        const tokens: Token[] = lex('a;b;');
        expectIdentifierToken(tokens[0], 0, 1, 'a');
        expectCharacterToken(tokens[1], 1, 2, ';');
        expectIdentifierToken(tokens[2], 2, 3, 'b');
        expectCharacterToken(tokens[3], 3, 4, ';');
      });

      it('should tokenize function invocation', () => {
        const tokens: Token[] = lex('a()');
        expectIdentifierToken(tokens[0], 0, 1, 'a');
        expectCharacterToken(tokens[1], 1, 2, '(');
        expectCharacterToken(tokens[2], 2, 3, ')');
      });

      it('should tokenize simple method invocations', () => {
        const tokens: Token[] = lex('a.method()');
        expectIdentifierToken(tokens[2], 2, 8, 'method');
      });

      it('should tokenize method invocation', () => {
        const tokens: Token[] = lex('a.b.c (d) - e.f()');
        expectIdentifierToken(tokens[0], 0, 1, 'a');
        expectCharacterToken(tokens[1], 1, 2, '.');
        expectIdentifierToken(tokens[2], 2, 3, 'b');
        expectCharacterToken(tokens[3], 3, 4, '.');
        expectIdentifierToken(tokens[4], 4, 5, 'c');
        expectCharacterToken(tokens[5], 6, 7, '(');
        expectIdentifierToken(tokens[6], 7, 8, 'd');
        expectCharacterToken(tokens[7], 8, 9, ')');
        expectOperatorToken(tokens[8], 10, 11, '-');
        expectIdentifierToken(tokens[9], 12, 13, 'e');
        expectCharacterToken(tokens[10], 13, 14, '.');
        expectIdentifierToken(tokens[11], 14, 15, 'f');
        expectCharacterToken(tokens[12], 15, 16, '(');
        expectCharacterToken(tokens[13], 16, 17, ')');
      });

      it('should tokenize number', () => {
        expectNumberToken(lex('0.5')[0], 0, 3, 0.5);
      });

      it('should tokenize number with exponent', () => {
        let tokens: Token[] = lex('0.5E-10');
        expect(tokens.length).toEqual(1);
        expectNumberToken(tokens[0], 0, 7, 0.5E-10);
        tokens = lex('0.5E+10');
        expectNumberToken(tokens[0], 0, 7, 0.5E+10);
      });

      it('should return exception for invalid exponent', () => {
        expectErrorToken(
            lex('0.5E-')[0], 4, 5,
            'Lexer Error: Invalid exponent at column 4 in expression [0.5E-]');

        expectErrorToken(
            lex('0.5E-A')[0], 4, 5,
            'Lexer Error: Invalid exponent at column 4 in expression [0.5E-A]');
      });

      it('should tokenize number starting with a dot', () => {
        expectNumberToken(lex('.5')[0], 0, 2, 0.5);
      });

      it('should throw error on invalid unicode', () => {
        expectErrorToken(
            lex('\'\\u1\'\'bla\'')[0], 2, 2,
            'Lexer Error: Invalid unicode escape [\\u1\'\'b] at column 2 in expression [\'\\u1\'\'bla\']');
      });

      it('should tokenize ?. as operator', () => {
        expectOperatorToken(lex('?.')[0], 0, 2, '?.');
      });

      it('should tokenize ?? as operator', () => {
        expectOperatorToken(lex('??')[0], 0, 2, '??');
      });

      it('should tokenize number with separator', () => {
        expectNumberToken(lex('123_456')[0], 0, 7, 123_456);
        expectNumberToken(lex('1_000_000_000')[0], 0, 13, 1_000_000_000);
        expectNumberToken(lex('123_456.78')[0], 0, 10, 123_456.78);
        expectNumberToken(lex('123_456_789.123_456_789')[0], 0, 23, 123_456_789.123_456_789);
        expectNumberToken(lex('1_2_3_4')[0], 0, 7, 1_2_3_4);
        expectNumberToken(lex('1_2_3_4.5_6_7_8')[0], 0, 15, 1_2_3_4.5_6_7_8);
      });

      it('should tokenize number starting with an underscore as an identifier', () => {
        expectIdentifierToken(lex('_123')[0], 0, 4, '_123');
        expectIdentifierToken(lex('_123_')[0], 0, 5, '_123_');
        expectIdentifierToken(lex('_1_2_3_')[0], 0, 7, '_1_2_3_');
      });

      it('should throw error for invalid number separators', () => {
        expectErrorToken(
            lex('123_')[0], 3, 3,
            'Lexer Error: Invalid numeric separator at column 3 in expression [123_]');
        expectErrorToken(
            lex('12__3')[0], 2, 2,
            'Lexer Error: Invalid numeric separator at column 2 in expression [12__3]');
        expectErrorToken(
            lex('1_2_3_.456')[0], 5, 5,
            'Lexer Error: Invalid numeric separator at column 5 in expression [1_2_3_.456]');
        expectErrorToken(
            lex('1_2_3._456')[0], 6, 6,
            'Lexer Error: Invalid numeric separator at column 6 in expression [1_2_3._456]');
      });
    });
  });
}
