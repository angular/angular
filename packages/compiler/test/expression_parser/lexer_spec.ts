/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Lexer, StringTokenKind, Token} from '../../src/expression_parser/lexer';

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

function expectStringToken(
  token: any,
  index: number,
  end: number,
  str: string,
  kind: StringTokenKind,
) {
  expectToken(token, index, end);
  expect(token.isString()).toBe(true);
  expect(token.kind).toBe(kind);
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

    it(
      'should throw an invalid character error when a hash character is discovered but ' +
        'not indicating a private identifier',
      () => {
        expectErrorToken(
          lex('#')[0],
          0,
          1,
          `Lexer Error: Invalid character [#] at column 0 in expression [#]`,
        );
        expectErrorToken(
          lex('#0')[0],
          0,
          1,
          `Lexer Error: Invalid character [#] at column 0 in expression [#0]`,
        );
      },
    );

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
      expectStringToken(lex('"a"')[0], 0, 3, 'a', StringTokenKind.Plain);
    });

    it('should tokenize quoted strings with escaped quotes', () => {
      expectStringToken(lex('"a\\""')[0], 0, 5, 'a"', StringTokenKind.Plain);
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
      expectStringToken(tokens[13], 17, 23, "a'c", StringTokenKind.Plain);
      expectCharacterToken(tokens[14], 23, 24, ':');
      expectStringToken(tokens[15], 24, 30, 'd"e', StringTokenKind.Plain);
    });

    it('should tokenize undefined', () => {
      const tokens: Token[] = lex('undefined');
      expectKeywordToken(tokens[0], 0, 9, 'undefined');
      expect(tokens[0].isKeywordUndefined()).toBe(true);
    });

    it('should tokenize typeof', () => {
      const tokens: Token[] = lex('typeof');
      expectKeywordToken(tokens[0], 0, 6, 'typeof');
      expect(tokens[0].isKeywordTypeof()).toBe(true);
    });

    it('should tokenize void', () => {
      const tokens: Token[] = lex('void');
      expectKeywordToken(tokens[0], 0, 4, 'void');
      expect(tokens[0].isKeywordVoid()).toBe(true);
    });

    it('should tokenize in keyword', () => {
      const tokens: Token[] = lex('in');
      expectKeywordToken(tokens[0], 0, 2, 'in');
      expect(tokens[0].isKeywordIn()).toBe(true);
    });

    it('should ignore whitespace', () => {
      const tokens: Token[] = lex('a \t \n \r b');
      expectIdentifierToken(tokens[0], 0, 1, 'a');
      expectIdentifierToken(tokens[1], 8, 9, 'b');
    });

    it('should tokenize quoted string', () => {
      const str = '[\'\\\'\', "\\""]';
      const tokens: Token[] = lex(str);
      expectStringToken(tokens[1], 1, 5, "'", StringTokenKind.Plain);
      expectStringToken(tokens[3], 7, 11, '"', StringTokenKind.Plain);
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

    it('should tokenize safe function invocation', () => {
      const tokens: Token[] = lex('a?.()');
      expectIdentifierToken(tokens[0], 0, 1, 'a');
      expectOperatorToken(tokens[1], 1, 3, '?.');
      expectCharacterToken(tokens[2], 3, 4, '(');
      expectCharacterToken(tokens[3], 4, 5, ')');
    });

    it('should tokenize a safe method invocations', () => {
      const tokens: Token[] = lex('a.method?.()');
      expectIdentifierToken(tokens[0], 0, 1, 'a');
      expectCharacterToken(tokens[1], 1, 2, '.');
      expectIdentifierToken(tokens[2], 2, 8, 'method');
      expectOperatorToken(tokens[3], 8, 10, '?.');
      expectCharacterToken(tokens[4], 10, 11, '(');
      expectCharacterToken(tokens[5], 11, 12, ')');
    });

    it('should tokenize number', () => {
      expectNumberToken(lex('0.5')[0], 0, 3, 0.5);
    });

    it('should tokenize multiplication and exponentiation', () => {
      const tokens: Token[] = lex('1 * 2 ** 3');
      expectNumberToken(tokens[0], 0, 1, 1);
      expectOperatorToken(tokens[1], 2, 3, '*');
      expectNumberToken(tokens[2], 4, 5, 2);
      expectOperatorToken(tokens[3], 6, 8, '**');
      expectNumberToken(tokens[4], 9, 10, 3);
    });

    it('should tokenize number with exponent', () => {
      let tokens: Token[] = lex('0.5E-10');
      expect(tokens.length).toEqual(1);
      expectNumberToken(tokens[0], 0, 7, 0.5e-10);
      tokens = lex('0.5E+10');
      expectNumberToken(tokens[0], 0, 7, 0.5e10);
    });

    it('should return exception for invalid exponent', () => {
      expectErrorToken(
        lex('0.5E-')[0],
        4,
        5,
        'Lexer Error: Invalid exponent at column 4 in expression [0.5E-]',
      );

      expectErrorToken(
        lex('0.5E-A')[0],
        4,
        5,
        'Lexer Error: Invalid exponent at column 4 in expression [0.5E-A]',
      );
    });

    it('should tokenize number starting with a dot', () => {
      expectNumberToken(lex('.5')[0], 0, 2, 0.5);
    });

    it('should throw error on invalid unicode', () => {
      expectErrorToken(
        lex("'\\u1''bla'")[0],
        2,
        2,
        "Lexer Error: Invalid unicode escape [\\u1''b] at column 2 in expression ['\\u1''bla']",
      );
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
        lex('123_')[0],
        3,
        3,
        'Lexer Error: Invalid numeric separator at column 3 in expression [123_]',
      );
      expectErrorToken(
        lex('12__3')[0],
        2,
        2,
        'Lexer Error: Invalid numeric separator at column 2 in expression [12__3]',
      );
      expectErrorToken(
        lex('1_2_3_.456')[0],
        5,
        5,
        'Lexer Error: Invalid numeric separator at column 5 in expression [1_2_3_.456]',
      );
      expectErrorToken(
        lex('1_2_3._456')[0],
        6,
        6,
        'Lexer Error: Invalid numeric separator at column 6 in expression [1_2_3._456]',
      );
    });

    describe('template literals', () => {
      it('should tokenize template literal with no interpolations', () => {
        const tokens: Token[] = lex('`hello world`');
        expect(tokens.length).toBe(1);
        expectStringToken(tokens[0], 0, 13, 'hello world', StringTokenKind.TemplateLiteralEnd);
      });

      it('should tokenize template literal containing strings', () => {
        expectStringToken(lex('`a "b" c`')[0], 0, 9, `a "b" c`, StringTokenKind.TemplateLiteralEnd);
        expectStringToken(lex("`a 'b' c`")[0], 0, 9, `a 'b' c`, StringTokenKind.TemplateLiteralEnd);
        expectStringToken(
          lex('`a \\`b\\` c`')[0],
          0,
          11,
          'a `b` c',
          StringTokenKind.TemplateLiteralEnd,
        );
        expectStringToken(
          lex('`a "\'\\`b\\`\'" c`')[0],
          0,
          15,
          `a "'\`b\`'" c`,
          StringTokenKind.TemplateLiteralEnd,
        );
      });

      it('should tokenize unicode inside a template string', () => {
        const tokens: Token[] = lex('`\\u00A0`');
        expect(tokens.length).toBe(1);
        expect(tokens[0].toString()).toBe('\u00a0');
      });

      it('should tokenize template literal with an interpolation in the end', () => {
        const tokens: Token[] = lex('`hello ${name}`');
        expect(tokens.length).toBe(5);
        expectStringToken(tokens[0], 0, 7, 'hello ', StringTokenKind.TemplateLiteralPart);
        expectOperatorToken(tokens[1], 7, 9, '${');
        expectIdentifierToken(tokens[2], 9, 13, 'name');
        expectOperatorToken(tokens[3], 13, 14, '}');
        expectStringToken(tokens[4], 14, 15, '', StringTokenKind.TemplateLiteralEnd);
      });

      it('should tokenize template literal with an interpolation in the beginning', () => {
        const tokens: Token[] = lex('`${name} Johnson`');
        expect(tokens.length).toBe(5);
        expectStringToken(tokens[0], 0, 1, '', StringTokenKind.TemplateLiteralPart);
        expectOperatorToken(tokens[1], 1, 3, '${');
        expectIdentifierToken(tokens[2], 3, 7, 'name');
        expectOperatorToken(tokens[3], 7, 8, '}');
        expectStringToken(tokens[4], 8, 17, ' Johnson', StringTokenKind.TemplateLiteralEnd);
      });

      it('should tokenize template literal with an interpolation in the middle', () => {
        const tokens: Token[] = lex('`foo${bar}baz`');
        expect(tokens.length).toBe(5);
        expectStringToken(tokens[0], 0, 4, 'foo', StringTokenKind.TemplateLiteralPart);
        expectOperatorToken(tokens[1], 4, 6, '${');
        expectIdentifierToken(tokens[2], 6, 9, 'bar');
        expectOperatorToken(tokens[3], 9, 10, '}');
        expectStringToken(tokens[4], 10, 14, 'baz', StringTokenKind.TemplateLiteralEnd);
      });

      it('should be able to use interpolation characters inside template string', () => {
        expectStringToken(lex('`foo $`')[0], 0, 7, 'foo $', StringTokenKind.TemplateLiteralEnd);
        expectStringToken(lex('`foo }`')[0], 0, 7, 'foo }', StringTokenKind.TemplateLiteralEnd);
        expectStringToken(
          lex('`foo $ {}`')[0],
          0,
          10,
          'foo $ {}',
          StringTokenKind.TemplateLiteralEnd,
        );
        expectStringToken(
          lex('`foo \\${bar}`')[0],
          0,
          13,
          'foo ${bar}',
          StringTokenKind.TemplateLiteralEnd,
        );
      });

      it('should tokenize template literal with several interpolations', () => {
        const tokens: Token[] = lex('`${a} - ${b} - ${c}`');
        expect(tokens.length).toBe(13);
        expectStringToken(tokens[0], 0, 1, '', StringTokenKind.TemplateLiteralPart);
        expectOperatorToken(tokens[1], 1, 3, '${');
        expectIdentifierToken(tokens[2], 3, 4, 'a');
        expectOperatorToken(tokens[3], 4, 5, '}');
        expectStringToken(tokens[4], 5, 8, ' - ', StringTokenKind.TemplateLiteralPart);
        expectOperatorToken(tokens[5], 8, 10, '${');
        expectIdentifierToken(tokens[6], 10, 11, 'b');
        expectOperatorToken(tokens[7], 11, 12, '}');
        expectStringToken(tokens[8], 12, 15, ' - ', StringTokenKind.TemplateLiteralPart);
        expectOperatorToken(tokens[9], 15, 17, '${');
        expectIdentifierToken(tokens[10], 17, 18, 'c');
        expectOperatorToken(tokens[11], 18, 19, '}');
      });

      it('should tokenize template literal with an object literal inside the interpolation', () => {
        const tokens: Token[] = lex('`foo ${{$: true}} baz`');
        expect(tokens.length).toBe(9);
        expectStringToken(tokens[0], 0, 5, 'foo ', StringTokenKind.TemplateLiteralPart);
        expectOperatorToken(tokens[1], 5, 7, '${');
        expectCharacterToken(tokens[2], 7, 8, '{');
        expectIdentifierToken(tokens[3], 8, 9, '$');
        expectCharacterToken(tokens[4], 9, 10, ':');
        expectKeywordToken(tokens[5], 11, 15, 'true');
        expectCharacterToken(tokens[6], 15, 16, '}');
        expectOperatorToken(tokens[7], 16, 17, '}');
        expectStringToken(tokens[8], 17, 22, ' baz', StringTokenKind.TemplateLiteralEnd);
      });

      it('should tokenize template literal with template literals inside the interpolation', () => {
        const tokens: Token[] = lex('`foo ${`hello ${`${a} - b`}`} baz`');
        expect(tokens.length).toBe(13);
        expectStringToken(tokens[0], 0, 5, 'foo ', StringTokenKind.TemplateLiteralPart);
        expectOperatorToken(tokens[1], 5, 7, '${');
        expectStringToken(tokens[2], 7, 14, 'hello ', StringTokenKind.TemplateLiteralPart);
        expectOperatorToken(tokens[3], 14, 16, '${');
        expectStringToken(tokens[4], 16, 17, '', StringTokenKind.TemplateLiteralPart);
        expectOperatorToken(tokens[5], 17, 19, '${');
        expectIdentifierToken(tokens[6], 19, 20, 'a');
        expectOperatorToken(tokens[7], 20, 21, '}');
        expectStringToken(tokens[8], 21, 26, ' - b', StringTokenKind.TemplateLiteralEnd);
        expectOperatorToken(tokens[9], 26, 27, '}');
        expectStringToken(tokens[10], 27, 28, '', StringTokenKind.TemplateLiteralEnd);
        expectOperatorToken(tokens[11], 28, 29, '}');
        expectStringToken(tokens[12], 29, 34, ' baz', StringTokenKind.TemplateLiteralEnd);
      });

      it('should tokenize two template literal right after each other', () => {
        const tokens: Token[] = lex('`hello ${name}``see ${name} later`');
        expect(tokens.length).toBe(10);
        expectStringToken(tokens[0], 0, 7, 'hello ', StringTokenKind.TemplateLiteralPart);
        expectOperatorToken(tokens[1], 7, 9, '${');
        expectIdentifierToken(tokens[2], 9, 13, 'name');
        expectOperatorToken(tokens[3], 13, 14, '}');
        expectStringToken(tokens[4], 14, 15, '', StringTokenKind.TemplateLiteralEnd);
        expectStringToken(tokens[5], 15, 20, 'see ', StringTokenKind.TemplateLiteralPart);
        expectOperatorToken(tokens[6], 20, 22, '${');
        expectIdentifierToken(tokens[7], 22, 26, 'name');
        expectOperatorToken(tokens[8], 26, 27, '}');
        expectStringToken(tokens[9], 27, 34, ' later', StringTokenKind.TemplateLiteralEnd);
      });

      it('should tokenize a concatenated template literal', () => {
        const tokens: Token[] = lex('`hello ${name}` + 123');
        expect(tokens.length).toBe(7);
        expectStringToken(tokens[0], 0, 7, 'hello ', StringTokenKind.TemplateLiteralPart);
        expectOperatorToken(tokens[1], 7, 9, '${');
        expectIdentifierToken(tokens[2], 9, 13, 'name');
        expectOperatorToken(tokens[3], 13, 14, '}');
        expectStringToken(tokens[4], 14, 15, '', StringTokenKind.TemplateLiteralEnd);
        expectOperatorToken(tokens[5], 16, 17, '+');
        expectNumberToken(tokens[6], 18, 21, 123);
      });

      it('should tokenize a template literal with a pipe inside an interpolation', () => {
        const tokens: Token[] = lex('`hello ${name | capitalize}!!!`');
        expect(tokens.length).toBe(7);
        expectStringToken(tokens[0], 0, 7, 'hello ', StringTokenKind.TemplateLiteralPart);
        expectOperatorToken(tokens[1], 7, 9, '${');
        expectIdentifierToken(tokens[2], 9, 13, 'name');
        expectOperatorToken(tokens[3], 14, 15, '|');
        expectIdentifierToken(tokens[4], 16, 26, 'capitalize');
        expectOperatorToken(tokens[5], 26, 27, '}');
        expectStringToken(tokens[6], 27, 31, '!!!', StringTokenKind.TemplateLiteralEnd);
      });

      it('should tokenize a template literal with a pipe inside a parenthesized interpolation', () => {
        const tokens: Token[] = lex('`hello ${(name | capitalize)}!!!`');
        expect(tokens.length).toBe(9);
        expectStringToken(tokens[0], 0, 7, 'hello ', StringTokenKind.TemplateLiteralPart);
        expectOperatorToken(tokens[1], 7, 9, '${');
        expectCharacterToken(tokens[2], 9, 10, '(');
        expectIdentifierToken(tokens[3], 10, 14, 'name');
        expectOperatorToken(tokens[4], 15, 16, '|');
        expectIdentifierToken(tokens[5], 17, 27, 'capitalize');
        expectCharacterToken(tokens[6], 27, 28, ')');
        expectOperatorToken(tokens[7], 28, 29, '}');
        expectStringToken(tokens[8], 29, 33, '!!!', StringTokenKind.TemplateLiteralEnd);
      });

      it('should tokenize a template literal in an literal object value', () => {
        const tokens: Token[] = lex('{foo: `${name}`}');
        expect(tokens.length).toBe(9);
        expectCharacterToken(tokens[0], 0, 1, '{');
        expectIdentifierToken(tokens[1], 1, 4, 'foo');
        expectCharacterToken(tokens[2], 4, 5, ':');
        expectStringToken(tokens[3], 6, 7, '', StringTokenKind.TemplateLiteralPart);
        expectOperatorToken(tokens[4], 7, 9, '${');
        expectIdentifierToken(tokens[5], 9, 13, 'name');
        expectOperatorToken(tokens[6], 13, 14, '}');
        expectStringToken(tokens[7], 14, 15, '', StringTokenKind.TemplateLiteralEnd);
        expectCharacterToken(tokens[8], 15, 16, '}');
      });

      it('should produce an error if a template literal is not terminated', () => {
        expectErrorToken(
          lex('`hello')[0],
          6,
          6,
          'Lexer Error: Unterminated template literal at column 6 in expression [`hello]',
        );
      });

      it('should produce an error for an unterminated template literal with an interpolation', () => {
        const tokens: Token[] = lex('`hello ${name}!');
        expect(tokens.length).toBe(5);
        expectStringToken(tokens[0], 0, 7, 'hello ', StringTokenKind.TemplateLiteralPart);
        expectOperatorToken(tokens[1], 7, 9, '${');
        expectIdentifierToken(tokens[2], 9, 13, 'name');
        expectOperatorToken(tokens[3], 13, 14, '}');
        expectErrorToken(
          tokens[4],
          15,
          15,
          'Lexer Error: Unterminated template literal at column 15 in expression [`hello ${name}!]',
        );
      });

      it('should produce an error for an unterminate template literal interpolation', () => {
        const tokens: Token[] = lex('`hello ${name!`');
        expect(tokens.length).toBe(5);
        expectStringToken(tokens[0], 0, 7, 'hello ', StringTokenKind.TemplateLiteralPart);
        expectOperatorToken(tokens[1], 7, 9, '${');
        expectIdentifierToken(tokens[2], 9, 13, 'name');
        expectOperatorToken(tokens[3], 13, 14, '!');
        expectErrorToken(
          tokens[4],
          15,
          15,
          'Lexer Error: Unterminated template literal at column 15 in expression [`hello ${name!`]',
        );
      });

      it('should tokenize tagged template literal with no interpolations', () => {
        const tokens: Token[] = lex('tag`hello world`');
        expect(tokens.length).toBe(2);
        expectIdentifierToken(tokens[0], 0, 3, 'tag');
        expectStringToken(tokens[1], 3, 16, 'hello world', StringTokenKind.TemplateLiteralEnd);
      });

      it('should tokenize nested tagged template literals', () => {
        const tokens: Token[] = lex('tag`hello ${tag`world`}`');
        expect(tokens.length).toBe(7);
        expectIdentifierToken(tokens[0], 0, 3, 'tag');
        expectStringToken(tokens[1], 3, 10, 'hello ', StringTokenKind.TemplateLiteralPart);
        expectOperatorToken(tokens[2], 10, 12, '${');
        expectIdentifierToken(tokens[3], 12, 15, 'tag');
        expectStringToken(tokens[4], 15, 22, 'world', StringTokenKind.TemplateLiteralEnd);
        expectOperatorToken(tokens[5], 22, 23, '}');
        expectStringToken(tokens[6], 23, 24, '', StringTokenKind.TemplateLiteralEnd);
      });
    });
  });
});
