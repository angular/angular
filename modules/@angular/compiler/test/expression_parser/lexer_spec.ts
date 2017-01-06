/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Lexer, Token} from '@angular/compiler/src/expression_parser/lexer';

function lex(text: string): any[] {
  return new Lexer().tokenize(text);
}

function expectToken(token: any, index: number) {
  expect(token instanceof Token).toBe(true);
  expect(token.index).toEqual(index);
}

function expectCharacterToken(token: any, index: number, character: string) {
  expect(character.length).toBe(1);
  expectToken(token, index);
  expect(token.isCharacter(character.charCodeAt(0))).toBe(true);
}

function expectOperatorToken(token: any, index: number, operator: string) {
  expectToken(token, index);
  expect(token.isOperator(operator)).toBe(true);
}

function expectNumberToken(token: any, index: number, n: number) {
  expectToken(token, index);
  expect(token.isNumber()).toBe(true);
  expect(token.toNumber()).toEqual(n);
}

function expectStringToken(token: any, index: number, str: string) {
  expectToken(token, index);
  expect(token.isString()).toBe(true);
  expect(token.toString()).toEqual(str);
}

function expectIdentifierToken(token: any, index: number, identifier: string) {
  expectToken(token, index);
  expect(token.isIdentifier()).toBe(true);
  expect(token.toString()).toEqual(identifier);
}

function expectKeywordToken(token: any, index: number, keyword: string) {
  expectToken(token, index);
  expect(token.isKeyword()).toBe(true);
  expect(token.toString()).toEqual(keyword);
}

function expectErrorToken(token: Token, index: any, message: string) {
  expectToken(token, index);
  expect(token.isError()).toBe(true);
  expect(token.toString()).toEqual(message);
}

export function main() {
  describe('lexer', () => {
    describe('token', () => {
      it('should tokenize a simple identifier', () => {
        const tokens: number[] = lex('j');
        expect(tokens.length).toEqual(1);
        expectIdentifierToken(tokens[0], 0, 'j');
      });

      it('should tokenize "this"', () => {
        const tokens: number[] = lex('this');
        expect(tokens.length).toEqual(1);
        expectKeywordToken(tokens[0], 0, 'this');
      });

      it('should tokenize a dotted identifier', () => {
        const tokens: number[] = lex('j.k');
        expect(tokens.length).toEqual(3);
        expectIdentifierToken(tokens[0], 0, 'j');
        expectCharacterToken(tokens[1], 1, '.');
        expectIdentifierToken(tokens[2], 2, 'k');
      });

      it('should tokenize an operator', () => {
        const tokens: number[] = lex('j-k');
        expect(tokens.length).toEqual(3);
        expectOperatorToken(tokens[1], 1, '-');
      });

      it('should tokenize an indexed operator', () => {
        const tokens: number[] = lex('j[k]');
        expect(tokens.length).toEqual(4);
        expectCharacterToken(tokens[1], 1, '[');
        expectCharacterToken(tokens[3], 3, ']');
      });

      it('should tokenize numbers', () => {
        const tokens: number[] = lex('88');
        expect(tokens.length).toEqual(1);
        expectNumberToken(tokens[0], 0, 88);
      });

      it('should tokenize numbers within index ops',
         () => { expectNumberToken(lex('a[22]')[2], 2, 22); });

      it('should tokenize simple quoted strings',
         () => { expectStringToken(lex('"a"')[0], 0, 'a'); });

      it('should tokenize quoted strings with escaped quotes',
         () => { expectStringToken(lex('"a\\""')[0], 0, 'a"'); });

      it('should tokenize a string', () => {
        const tokens: Token[] = lex('j-a.bc[22]+1.3|f:\'a\\\'c\':"d\\"e"');
        expectIdentifierToken(tokens[0], 0, 'j');
        expectOperatorToken(tokens[1], 1, '-');
        expectIdentifierToken(tokens[2], 2, 'a');
        expectCharacterToken(tokens[3], 3, '.');
        expectIdentifierToken(tokens[4], 4, 'bc');
        expectCharacterToken(tokens[5], 6, '[');
        expectNumberToken(tokens[6], 7, 22);
        expectCharacterToken(tokens[7], 9, ']');
        expectOperatorToken(tokens[8], 10, '+');
        expectNumberToken(tokens[9], 11, 1.3);
        expectOperatorToken(tokens[10], 14, '|');
        expectIdentifierToken(tokens[11], 15, 'f');
        expectCharacterToken(tokens[12], 16, ':');
        expectStringToken(tokens[13], 17, 'a\'c');
        expectCharacterToken(tokens[14], 23, ':');
        expectStringToken(tokens[15], 24, 'd"e');
      });

      it('should tokenize undefined', () => {
        const tokens: Token[] = lex('undefined');
        expectKeywordToken(tokens[0], 0, 'undefined');
        expect(tokens[0].isKeywordUndefined()).toBe(true);
      });

      it('should ignore whitespace', () => {
        const tokens: Token[] = lex('a \t \n \r b');
        expectIdentifierToken(tokens[0], 0, 'a');
        expectIdentifierToken(tokens[1], 8, 'b');
      });

      it('should tokenize quoted string', () => {
        const str = '[\'\\\'\', "\\""]';
        const tokens: Token[] = lex(str);
        expectStringToken(tokens[1], 1, '\'');
        expectStringToken(tokens[3], 7, '"');
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
        expectOperatorToken(tokens[0], 0, '!');
        expectOperatorToken(tokens[1], 2, '==');
        expectOperatorToken(tokens[2], 5, '!=');
        expectOperatorToken(tokens[3], 8, '<');
        expectOperatorToken(tokens[4], 10, '>');
        expectOperatorToken(tokens[5], 12, '<=');
        expectOperatorToken(tokens[6], 15, '>=');
        expectOperatorToken(tokens[7], 18, '===');
        expectOperatorToken(tokens[8], 22, '!==');
      });

      it('should tokenize statements', () => {
        const tokens: Token[] = lex('a;b;');
        expectIdentifierToken(tokens[0], 0, 'a');
        expectCharacterToken(tokens[1], 1, ';');
        expectIdentifierToken(tokens[2], 2, 'b');
        expectCharacterToken(tokens[3], 3, ';');
      });

      it('should tokenize function invocation', () => {
        const tokens: Token[] = lex('a()');
        expectIdentifierToken(tokens[0], 0, 'a');
        expectCharacterToken(tokens[1], 1, '(');
        expectCharacterToken(tokens[2], 2, ')');
      });

      it('should tokenize simple method invocations', () => {
        const tokens: Token[] = lex('a.method()');
        expectIdentifierToken(tokens[2], 2, 'method');
      });

      it('should tokenize method invocation', () => {
        const tokens: Token[] = lex('a.b.c (d) - e.f()');
        expectIdentifierToken(tokens[0], 0, 'a');
        expectCharacterToken(tokens[1], 1, '.');
        expectIdentifierToken(tokens[2], 2, 'b');
        expectCharacterToken(tokens[3], 3, '.');
        expectIdentifierToken(tokens[4], 4, 'c');
        expectCharacterToken(tokens[5], 6, '(');
        expectIdentifierToken(tokens[6], 7, 'd');
        expectCharacterToken(tokens[7], 8, ')');
        expectOperatorToken(tokens[8], 10, '-');
        expectIdentifierToken(tokens[9], 12, 'e');
        expectCharacterToken(tokens[10], 13, '.');
        expectIdentifierToken(tokens[11], 14, 'f');
        expectCharacterToken(tokens[12], 15, '(');
        expectCharacterToken(tokens[13], 16, ')');
      });

      it('should tokenize number', () => { expectNumberToken(lex('0.5')[0], 0, 0.5); });

      it('should tokenize number with exponent', () => {
        let tokens: Token[] = lex('0.5E-10');
        expect(tokens.length).toEqual(1);
        expectNumberToken(tokens[0], 0, 0.5E-10);
        tokens = lex('0.5E+10');
        expectNumberToken(tokens[0], 0, 0.5E+10);
      });

      it('should return exception for invalid exponent', () => {
        expectErrorToken(
            lex('0.5E-')[0], 4, 'Lexer Error: Invalid exponent at column 4 in expression [0.5E-]');

        expectErrorToken(
            lex('0.5E-A')[0], 4,
            'Lexer Error: Invalid exponent at column 4 in expression [0.5E-A]');
      });

      it('should tokenize number starting with a dot',
         () => { expectNumberToken(lex('.5')[0], 0, 0.5); });

      it('should throw error on invalid unicode', () => {
        expectErrorToken(
            lex('\'\\u1\'\'bla\'')[0], 2,
            'Lexer Error: Invalid unicode escape [\\u1\'\'b] at column 2 in expression [\'\\u1\'\'bla\']');
      });

      it('should tokenize hash as operator', () => { expectOperatorToken(lex('#')[0], 0, '#'); });

      it('should tokenize ?. as operator', () => { expectOperatorToken(lex('?.')[0], 0, '?.'); });
    });
  });
}
