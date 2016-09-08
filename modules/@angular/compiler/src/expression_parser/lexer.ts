/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable} from '@angular/core';
import * as chars from '../chars';
import {NumberWrapper, StringJoiner, StringWrapper, isPresent} from '../facade/lang';

export enum TokenType {
  Character,
  Identifier,
  Keyword,
  String,
  Operator,
  Number,
  Error
}

const KEYWORDS = ['var', 'let', 'null', 'undefined', 'true', 'false', 'if', 'else', 'this'];

@Injectable()
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
      public index: number, public type: TokenType, public numValue: number,
      public strValue: string) {}

  isCharacter(code: number): boolean {
    return this.type == TokenType.Character && this.numValue == code;
  }

  isNumber(): boolean { return this.type == TokenType.Number; }

  isString(): boolean { return this.type == TokenType.String; }

  isOperator(operater: string): boolean {
    return this.type == TokenType.Operator && this.strValue == operater;
  }

  isIdentifier(): boolean { return this.type == TokenType.Identifier; }

  isKeyword(): boolean { return this.type == TokenType.Keyword; }

  isKeywordLet(): boolean { return this.type == TokenType.Keyword && this.strValue == 'let'; }

  isKeywordNull(): boolean { return this.type == TokenType.Keyword && this.strValue == 'null'; }

  isKeywordUndefined(): boolean {
    return this.type == TokenType.Keyword && this.strValue == 'undefined';
  }

  isKeywordTrue(): boolean { return this.type == TokenType.Keyword && this.strValue == 'true'; }

  isKeywordFalse(): boolean { return this.type == TokenType.Keyword && this.strValue == 'false'; }

  isKeywordThis(): boolean { return this.type == TokenType.Keyword && this.strValue == 'this'; }

  isError(): boolean { return this.type == TokenType.Error; }

  toNumber(): number { return this.type == TokenType.Number ? this.numValue : -1; }

  toString(): string {
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

function newCharacterToken(index: number, code: number): Token {
  return new Token(index, TokenType.Character, code, StringWrapper.fromCharCode(code));
}

function newIdentifierToken(index: number, text: string): Token {
  return new Token(index, TokenType.Identifier, 0, text);
}

function newKeywordToken(index: number, text: string): Token {
  return new Token(index, TokenType.Keyword, 0, text);
}

function newOperatorToken(index: number, text: string): Token {
  return new Token(index, TokenType.Operator, 0, text);
}

function newStringToken(index: number, text: string): Token {
  return new Token(index, TokenType.String, 0, text);
}

function newNumberToken(index: number, n: number): Token {
  return new Token(index, TokenType.Number, n, '');
}

function newErrorToken(index: number, message: string): Token {
  return new Token(index, TokenType.Error, 0, message);
}

export var EOF: Token = new Token(-1, TokenType.Character, 0, '');

class _Scanner {
  length: number;
  peek: number = 0;
  index: number = -1;

  constructor(public input: string) {
    this.length = input.length;
    this.advance();
  }

  advance() {
    this.peek =
        ++this.index >= this.length ? chars.$EOF : StringWrapper.charCodeAt(this.input, this.index);
  }

  scanToken(): Token {
    var input = this.input, length = this.length, peek = this.peek, index = this.index;

    // Skip whitespace.
    while (peek <= chars.$SPACE) {
      if (++index >= length) {
        peek = chars.$EOF;
        break;
      } else {
        peek = StringWrapper.charCodeAt(input, index);
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

    var start: number = index;
    switch (peek) {
      case chars.$PERIOD:
        this.advance();
        return chars.isDigit(this.peek) ? this.scanNumber(start) :
                                          newCharacterToken(start, chars.$PERIOD);
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
        return this.scanOperator(start, StringWrapper.fromCharCode(peek));
      case chars.$QUESTION:
        return this.scanComplexOperator(start, '?', chars.$PERIOD, '.');
      case chars.$LT:
      case chars.$GT:
        return this.scanComplexOperator(start, StringWrapper.fromCharCode(peek), chars.$EQ, '=');
      case chars.$BANG:
      case chars.$EQ:
        return this.scanComplexOperator(
            start, StringWrapper.fromCharCode(peek), chars.$EQ, '=', chars.$EQ, '=');
      case chars.$AMPERSAND:
        return this.scanComplexOperator(start, '&', chars.$AMPERSAND, '&');
      case chars.$BAR:
        return this.scanComplexOperator(start, '|', chars.$BAR, '|');
      case chars.$NBSP:
        while (chars.isWhitespace(this.peek)) this.advance();
        return this.scanToken();
    }

    this.advance();
    return this.error(`Unexpected character [${StringWrapper.fromCharCode(peek)}]`, 0);
  }

  scanCharacter(start: number, code: number): Token {
    this.advance();
    return newCharacterToken(start, code);
  }


  scanOperator(start: number, str: string): Token {
    this.advance();
    return newOperatorToken(start, str);
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
   * @returns {Token}
   */
  scanComplexOperator(
      start: number, one: string, twoCode: number, two: string, threeCode?: number,
      three?: string): Token {
    this.advance();
    var str: string = one;
    if (this.peek == twoCode) {
      this.advance();
      str += two;
    }
    if (isPresent(threeCode) && this.peek == threeCode) {
      this.advance();
      str += three;
    }
    return newOperatorToken(start, str);
  }

  scanIdentifier(): Token {
    var start: number = this.index;
    this.advance();
    while (isIdentifierPart(this.peek)) this.advance();
    var str: string = this.input.substring(start, this.index);
    return KEYWORDS.indexOf(str) > -1 ? newKeywordToken(start, str) :
                                        newIdentifierToken(start, str);
  }

  scanNumber(start: number): Token {
    var simple: boolean = (this.index === start);
    this.advance();  // Skip initial digit.
    while (true) {
      if (chars.isDigit(this.peek)) {
        // Do nothing.
      } else if (this.peek == chars.$PERIOD) {
        simple = false;
      } else if (isExponentStart(this.peek)) {
        this.advance();
        if (isExponentSign(this.peek)) this.advance();
        if (!chars.isDigit(this.peek)) return this.error('Invalid exponent', -1);
        simple = false;
      } else {
        break;
      }
      this.advance();
    }
    var str: string = this.input.substring(start, this.index);
    var value: number = simple ? NumberWrapper.parseIntAutoRadix(str) : parseFloat(str);
    return newNumberToken(start, value);
  }

  scanString(): Token {
    var start: number = this.index;
    var quote: number = this.peek;
    this.advance();  // Skip initial quote.

    var buffer: StringJoiner;
    var marker: number = this.index;
    var input: string = this.input;

    while (this.peek != quote) {
      if (this.peek == chars.$BACKSLASH) {
        if (buffer == null) buffer = new StringJoiner();
        buffer.add(input.substring(marker, this.index));
        this.advance();
        var unescapedCode: number;
        if (this.peek == chars.$u) {
          // 4 character hex code for unicode character.
          var hex: string = input.substring(this.index + 1, this.index + 5);
          try {
            unescapedCode = NumberWrapper.parseInt(hex, 16);
          } catch (e) {
            return this.error(`Invalid unicode escape [\\u${hex}]`, 0);
          }
          for (var i: number = 0; i < 5; i++) {
            this.advance();
          }
        } else {
          unescapedCode = unescape(this.peek);
          this.advance();
        }
        buffer.add(StringWrapper.fromCharCode(unescapedCode));
        marker = this.index;
      } else if (this.peek == chars.$EOF) {
        return this.error('Unterminated quote', 0);
      } else {
        this.advance();
      }
    }

    var last: string = input.substring(marker, this.index);
    this.advance();  // Skip terminating quote.

    // Compute the unescaped string value.
    var unescaped: string = last;
    if (buffer != null) {
      buffer.add(last);
      unescaped = buffer.toString();
    }
    return newStringToken(start, unescaped);
  }

  error(message: string, offset: number): Token {
    const position: number = this.index + offset;
    return newErrorToken(
        position, `Lexer Error: ${message} at column ${position} in expression [${this.input}]`);
  }
}

function isIdentifierStart(code: number): boolean {
  return (chars.$a <= code && code <= chars.$z) || (chars.$A <= code && code <= chars.$Z) ||
      (code == chars.$_) || (code == chars.$$);
}

export function isIdentifier(input: string): boolean {
  if (input.length == 0) return false;
  var scanner = new _Scanner(input);
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
