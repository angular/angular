/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as chars from '../chars';

export enum TokenType {
  Character,
  Identifier,
  Keyword,
  String,
  Operator,
  Number,
  Error
}

const KEYWORDS = ['var', 'let', 'as', 'null', 'undefined', 'true', 'false', 'if', 'else', 'this'];

export class Lexer {
  tokenize(text: string): Token[] {
    const scanner = new _Scanner(text);
    const tokens: Token[] = [];
    let token = scanner.scanToken();
    while (token != null) {
      tokens.push(token);
      token = scanner.scanToken();
    }
    return tokens;
  }
}

export class Token {
  constructor(
      public index: number, public end: number, public type: TokenType, public numValue: number,
      public strValue: string) {}

  isCharacter(code: number): boolean {
    return this.type == TokenType.Character && this.numValue == code;
  }

  isNumber(): boolean {
    return this.type == TokenType.Number;
  }

  isString(): boolean {
    return this.type == TokenType.String;
  }

  isOperator(operator: string): boolean {
    return this.type == TokenType.Operator && this.strValue == operator;
  }

  isIdentifier(): boolean {
    return this.type == TokenType.Identifier;
  }

  isKeyword(): boolean {
    return this.type == TokenType.Keyword;
  }

  isKeywordLet(): boolean {
    return this.type == TokenType.Keyword && this.strValue == 'let';
  }

  isKeywordAs(): boolean {
    return this.type == TokenType.Keyword && this.strValue == 'as';
  }

  isKeywordNull(): boolean {
    return this.type == TokenType.Keyword && this.strValue == 'null';
  }

  isKeywordUndefined(): boolean {
    return this.type == TokenType.Keyword && this.strValue == 'undefined';
  }

  isKeywordTrue(): boolean {
    return this.type == TokenType.Keyword && this.strValue == 'true';
  }

  isKeywordFalse(): boolean {
    return this.type == TokenType.Keyword && this.strValue == 'false';
  }

  isKeywordThis(): boolean {
    return this.type == TokenType.Keyword && this.strValue == 'this';
  }

  isError(): boolean {
    return this.type == TokenType.Error;
  }

  toNumber(): number {
    return this.type == TokenType.Number ? this.numValue : -1;
  }

  toString(): string|null {
    switch (this.type) {
      case TokenType.Character:
      case TokenType.Identifier:
      case TokenType.Keyword:
      case TokenType.Operator:
      case TokenType.String:
      case TokenType.Error:
        return this.strValue;
      case TokenType.Number:
        return this.numValue.toString();
      default:
        return null;
    }
  }
}

function newCharacterToken(index: number, end: number, code: number): Token {
  return new Token(index, end, TokenType.Character, code, String.fromCharCode(code));
}

function newIdentifierToken(index: number, end: number, text: string): Token {
  return new Token(index, end, TokenType.Identifier, 0, text);
}

function newKeywordToken(index: number, end: number, text: string): Token {
  return new Token(index, end, TokenType.Keyword, 0, text);
}

function newOperatorToken(index: number, end: number, text: string): Token {
  return new Token(index, end, TokenType.Operator, 0, text);
}

function newStringToken(index: number, end: number, text: string): Token {
  return new Token(index, end, TokenType.String, 0, text);
}

function newNumberToken(index: number, end: number, n: number): Token {
  return new Token(index, end, TokenType.Number, n, '');
}

function newErrorToken(index: number, end: number, message: string): Token {
  return new Token(index, end, TokenType.Error, 0, message);
}

export const EOF: Token = new Token(-1, -1, TokenType.Character, 0, '');

class _Scanner {
  length: number;
  peek: number = 0;
  index: number = -1;

  constructor(public input: string) {
    this.length = input.length;
    this.advance();
  }

  advance() {
    this.peek = ++this.index >= this.length ? chars.$EOF : this.input.charCodeAt(this.index);
  }

  scanToken(): Token|null {
    const input = this.input, length = this.length;
    let peek = this.peek, index = this.index;

    // Skip whitespace.
    while (peek <= chars.$SPACE) {
      if (++index >= length) {
        peek = chars.$EOF;
        break;
      } else {
        peek = input.charCodeAt(index);
      }
    }

    this.peek = peek;
    this.index = index;

    if (index >= length) {
      return null;
    }

    // Handle identifiers and numbers.
    if (isIdentifierStart(peek)) return this.scanIdentifier();
    if (chars.isDigit(peek)) return this.scanNumber(index);

    const start: number = index;
    switch (peek) {
      case chars.$PERIOD:
        this.advance();
        return chars.isDigit(this.peek) ? this.scanNumber(start) :
                                          newCharacterToken(start, this.index, chars.$PERIOD);
      case chars.$LPAREN:
      case chars.$RPAREN:
      case chars.$LBRACE:
      case chars.$RBRACE:
      case chars.$LBRACKET:
      case chars.$RBRACKET:
      case chars.$COMMA:
      case chars.$COLON:
      case chars.$SEMICOLON:
        return this.scanCharacter(start, peek);
      case chars.$SQ:
      case chars.$DQ:
        return this.scanString();
      case chars.$HASH:
      case chars.$PLUS:
      case chars.$MINUS:
      case chars.$STAR:
      case chars.$SLASH:
      case chars.$PERCENT:
      case chars.$CARET:
        return this.scanOperator(start, String.fromCharCode(peek));
      case chars.$QUESTION:
        return this.scanComplexOperator(start, '?', chars.$PERIOD, '.');
      case chars.$LT:
      case chars.$GT:
        return this.scanComplexOperator(start, String.fromCharCode(peek), chars.$EQ, '=');
      case chars.$BANG:
      case chars.$EQ:
        return this.scanComplexOperator(
            start, String.fromCharCode(peek), chars.$EQ, '=', chars.$EQ, '=');
      case chars.$AMPERSAND:
        return this.scanComplexOperator(start, '&', chars.$AMPERSAND, '&');
      case chars.$BAR:
        return this.scanComplexOperator(start, '|', chars.$BAR, '|');
      case chars.$NBSP:
        while (chars.isWhitespace(this.peek)) this.advance();
        return this.scanToken();
    }

    this.advance();
    return this.error(`Unexpected character [${String.fromCharCode(peek)}]`, 0);
  }

  scanCharacter(start: number, code: number): Token {
    this.advance();
    return newCharacterToken(start, this.index, code);
  }


  scanOperator(start: number, str: string): Token {
    this.advance();
    return newOperatorToken(start, this.index, str);
  }

  /**
   * Tokenize a 2/3 char long operator
   *
   * @param start start index in the expression
   * @param one first symbol (always part of the operator)
   * @param twoCode code point for the second symbol
   * @param two second symbol (part of the operator when the second code point matches)
   * @param threeCode code point for the third symbol
   * @param three third symbol (part of the operator when provided and matches source expression)
   */
  scanComplexOperator(
      start: number, one: string, twoCode: number, two: string, threeCode?: number,
      three?: string): Token {
    this.advance();
    let str: string = one;
    if (this.peek == twoCode) {
      this.advance();
      str += two;
    }
    if (threeCode != null && this.peek == threeCode) {
      this.advance();
      str += three;
    }
    return newOperatorToken(start, this.index, str);
  }

  scanIdentifier(): Token {
    const start: number = this.index;
    this.advance();
    while (isIdentifierPart(this.peek)) this.advance();
    const str: string = this.input.substring(start, this.index);
    return KEYWORDS.indexOf(str) > -1 ? newKeywordToken(start, this.index, str) :
                                        newIdentifierToken(start, this.index, str);
  }

  scanNumber(start: number): Token {
    let simple: boolean = (this.index === start);
    let radix: number|null = simple ? null : 10;  // null for not determined yet

    while (true) {
      if (this.index === start && this.peek != chars.$0) {
        radix = 10;
      } else if (radix == null && this.index === start + 1) {
        if (isHexadecimalSeparator(this.peek)) {
          radix = 16;
        } else if (isOctalSeparator(this.peek)) {
          radix = 8;
        } else if (isBinarySeparator(this.peek)) {
          radix = 2;
        } else if (chars.isDigit(this.peek)) {
          // Leading zero followed by digits
          // return this.error(`Legacy octal literals are not allowed in strict mode`, -1);

          // To align ourselves with JavaScript parsing rules we should throw, but instead
          // we are going to assume '10' so that we don't break anyone.
          radix = 10;
        } else {
          radix = 10;
        }

        if (radix !== 10) {
          this.advance();
          continue;
        }
      }

      if ((chars.isAsciiHexDigit(this.peek)) && !(radix === 10 && isExponentStart(this.peek))) {
        if (!isDigitInRange(this.peek, radix)) {
          // radix won't be null here
          return this.error(
              `Out of range digit '${String.fromCharCode(this.peek)}' under radix '${radix}'`, 0);
        }
      } else if (this.peek == chars.$PERIOD) {
        simple = false;
        if (radix == null) radix = 10;
      } else if (isExponentStart(this.peek)) {
        this.advance();
        if (isExponentSign(this.peek)) this.advance();
        if (!chars.isDigit(this.peek)) return this.error('Invalid exponent', -1);
        simple = false;
        if (radix == null) radix = 10;
      } else {
        break;
      }
      this.advance();
    }
    if (!simple && radix !== 10) {
      return this.error(`Invalid number format`, start - this.index);
    }
    const str: string = this.input.substring(start, this.index);
    radix = radix != null ? radix : 10;
    const value: number = simple ? parseIntWithRadix(str, radix) : parseFloat(str);
    return newNumberToken(start, this.index, value);
  }

  scanString(): Token {
    const start: number = this.index;
    const quote: number = this.peek;
    this.advance();  // Skip initial quote.

    let buffer: string = '';
    let marker: number = this.index;
    const input: string = this.input;

    while (this.peek != quote) {
      if (this.peek == chars.$BACKSLASH) {
        buffer += input.substring(marker, this.index);
        this.advance();
        let unescapedCode: number;
        // Workaround for TS2.1-introduced type strictness
        this.peek = this.peek;
        if (this.peek == chars.$u) {
          // 4 character hex code for unicode character.
          const hex: string = input.substring(this.index + 1, this.index + 5);
          if (/^[0-9a-f]+$/i.test(hex)) {
            unescapedCode = parseInt(hex, 16);
          } else {
            return this.error(`Invalid unicode escape [\\u${hex}]`, 0);
          }
          for (let i: number = 0; i < 5; i++) {
            this.advance();
          }
        } else {
          unescapedCode = unescape(this.peek);
          this.advance();
        }
        buffer += String.fromCharCode(unescapedCode);
        marker = this.index;
      } else if (this.peek == chars.$EOF) {
        return this.error('Unterminated quote', 0);
      } else {
        this.advance();
      }
    }

    const last: string = input.substring(marker, this.index);
    this.advance();  // Skip terminating quote.

    return newStringToken(start, this.index, buffer + last);
  }

  error(message: string, offset: number): Token {
    const position: number = this.index + offset;
    return newErrorToken(
        position, this.index,
        `Lexer Error: ${message} at column ${position} in expression [${this.input}]`);
  }
}

function isIdentifierStart(code: number): boolean {
  return (chars.$a <= code && code <= chars.$z) || (chars.$A <= code && code <= chars.$Z) ||
      (code == chars.$_) || (code == chars.$$);
}

export function isIdentifier(input: string): boolean {
  if (input.length == 0) return false;
  const scanner = new _Scanner(input);
  if (!isIdentifierStart(scanner.peek)) return false;
  scanner.advance();
  while (scanner.peek !== chars.$EOF) {
    if (!isIdentifierPart(scanner.peek)) return false;
    scanner.advance();
  }
  return true;
}

function isIdentifierPart(code: number): boolean {
  return chars.isAsciiLetter(code) || chars.isDigit(code) || (code == chars.$_) ||
      (code == chars.$$);
}

function isExponentStart(code: number): boolean {
  return code == chars.$e || code == chars.$E;
}

function isExponentSign(code: number): boolean {
  return code == chars.$MINUS || code == chars.$PLUS;
}

function isHexadecimalSeparator(code: number): boolean {
  return code == chars.$X || code == chars.$x;
}

function isOctalSeparator(code: number): boolean {
  return code == chars.$O || code == chars.$o;
}

function isBinarySeparator(code: number): boolean {
  return code == chars.$B || code == chars.$b;
}

function isDigitInRange(code: number, radix: number|null): boolean {
  switch (radix) {
    case null:
      return true;  // radix will only be null if code is 0 (leading position)
    case 16:
      return chars.isAsciiHexDigit(code);
    case 10:
      return chars.isDigit(code);
    case 8:
      return chars.isOctalDigit(code);
    case 2:
      return chars.isBinaryDigit(code);
    default:
      return false;
  }
}

export function isQuote(code: number): boolean {
  return code === chars.$SQ || code === chars.$DQ || code === chars.$BT;
}

function unescape(code: number): number {
  switch (code) {
    case chars.$n:
      return chars.$LF;
    case chars.$f:
      return chars.$FF;
    case chars.$r:
      return chars.$CR;
    case chars.$t:
      return chars.$TAB;
    case chars.$v:
      return chars.$VTAB;
    default:
      return code;
  }
}

/**
 * Parse an integer number with literal and given radix, the literal contains prefix for non-decimal
 * values
 *
 * eg. parseIntWithRadix('123', 10)
 *     parseIntWithRadix('0xABC', 16)
 *
 * @param text raw literal form of the numeric value
 * @param radix mathematical base given
 */
function parseIntWithRadix(text: string, radix: number): number {
  radix = radix != null ? radix : 10;
  const isDecimal = radix === 10;
  const digits = isDecimal ? text : text.substring(2);
  const result: number = parseInt(digits, radix);
  if (isNaN(result)) {
    throw new Error('Invalid integer literal when parsing ' + text);
  }
  return result;
}
