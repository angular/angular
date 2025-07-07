/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as chars from '../chars';

export enum TokenType {
  Character,
  Identifier,
  PrivateIdentifier,
  Keyword,
  String,
  Operator,
  Number,
  Error,
}

export enum StringTokenKind {
  Plain,
  TemplateLiteralPart,
  TemplateLiteralEnd,
}

const KEYWORDS = [
  'var',
  'let',
  'as',
  'null',
  'undefined',
  'true',
  'false',
  'if',
  'else',
  'this',
  'typeof',
  'void',
  'in',
];

export class Lexer {
  tokenize(text: string): Token[] {
    return new _Scanner(text).scan();
  }
}

export class Token {
  constructor(
    public index: number,
    public end: number,
    public type: TokenType,
    public numValue: number,
    public strValue: string,
  ) {}

  isCharacter(code: number): boolean {
    return this.type === TokenType.Character && this.numValue === code;
  }

  isNumber(): boolean {
    return this.type === TokenType.Number;
  }

  isString(): this is StringToken {
    return this.type === TokenType.String;
  }

  isOperator(operator: string): boolean {
    return this.type === TokenType.Operator && this.strValue === operator;
  }

  isIdentifier(): boolean {
    return this.type === TokenType.Identifier;
  }

  isPrivateIdentifier(): boolean {
    return this.type === TokenType.PrivateIdentifier;
  }

  isKeyword(): boolean {
    return this.type === TokenType.Keyword;
  }

  isKeywordLet(): boolean {
    return this.type === TokenType.Keyword && this.strValue === 'let';
  }

  isKeywordAs(): boolean {
    return this.type === TokenType.Keyword && this.strValue === 'as';
  }

  isKeywordNull(): boolean {
    return this.type === TokenType.Keyword && this.strValue === 'null';
  }

  isKeywordUndefined(): boolean {
    return this.type === TokenType.Keyword && this.strValue === 'undefined';
  }

  isKeywordTrue(): boolean {
    return this.type === TokenType.Keyword && this.strValue === 'true';
  }

  isKeywordFalse(): boolean {
    return this.type === TokenType.Keyword && this.strValue === 'false';
  }

  isKeywordThis(): boolean {
    return this.type === TokenType.Keyword && this.strValue === 'this';
  }

  isKeywordTypeof(): boolean {
    return this.type === TokenType.Keyword && this.strValue === 'typeof';
  }

  isKeywordVoid(): boolean {
    return this.type === TokenType.Keyword && this.strValue === 'void';
  }

  isKeywordIn(): boolean {
    return this.type === TokenType.Keyword && this.strValue === 'in';
  }

  isError(): boolean {
    return this.type === TokenType.Error;
  }

  toNumber(): number {
    return this.type === TokenType.Number ? this.numValue : -1;
  }

  isTemplateLiteralPart(): this is StringToken {
    // Note: Explicit type is needed for Closure.
    return this.isString() && (this as StringToken).kind === StringTokenKind.TemplateLiteralPart;
  }

  isTemplateLiteralEnd(): this is StringToken {
    // Note: Explicit type is needed for Closure.
    return this.isString() && (this as StringToken).kind === StringTokenKind.TemplateLiteralEnd;
  }

  isTemplateLiteralInterpolationStart(): boolean {
    return this.isOperator('${');
  }

  isTemplateLiteralInterpolationEnd(): boolean {
    return this.isOperator('}');
  }

  toString(): string | null {
    switch (this.type) {
      case TokenType.Character:
      case TokenType.Identifier:
      case TokenType.Keyword:
      case TokenType.Operator:
      case TokenType.PrivateIdentifier:
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

export class StringToken extends Token {
  constructor(
    index: number,
    end: number,
    strValue: string,
    readonly kind: StringTokenKind,
  ) {
    super(index, end, TokenType.String, 0, strValue);
  }
}

function newCharacterToken(index: number, end: number, code: number): Token {
  return new Token(index, end, TokenType.Character, code, String.fromCharCode(code));
}

function newIdentifierToken(index: number, end: number, text: string): Token {
  return new Token(index, end, TokenType.Identifier, 0, text);
}

function newPrivateIdentifierToken(index: number, end: number, text: string): Token {
  return new Token(index, end, TokenType.PrivateIdentifier, 0, text);
}

function newKeywordToken(index: number, end: number, text: string): Token {
  return new Token(index, end, TokenType.Keyword, 0, text);
}

function newOperatorToken(index: number, end: number, text: string): Token {
  return new Token(index, end, TokenType.Operator, 0, text);
}

function newNumberToken(index: number, end: number, n: number): Token {
  return new Token(index, end, TokenType.Number, n, '');
}

function newErrorToken(index: number, end: number, message: string): Token {
  return new Token(index, end, TokenType.Error, 0, message);
}

export const EOF: Token = new Token(-1, -1, TokenType.Character, 0, '');

class _Scanner {
  private readonly tokens: Token[] = [];
  private readonly length: number;
  private peek = 0;
  private index = -1;
  private braceStack: ('interpolation' | 'expression')[] = [];

  constructor(private readonly input: string) {
    this.length = input.length;
    this.advance();
  }

  scan(): Token[] {
    let token = this.scanToken();

    while (token !== null) {
      this.tokens.push(token);
      token = this.scanToken();
    }

    return this.tokens;
  }

  private advance() {
    this.peek = ++this.index >= this.length ? chars.$EOF : this.input.charCodeAt(this.index);
  }

  private scanToken(): Token | null {
    const input = this.input;
    const length = this.length;
    let peek = this.peek;
    let index = this.index;

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
    if (isIdentifierStart(peek)) {
      return this.scanIdentifier();
    }

    if (chars.isDigit(peek)) {
      return this.scanNumber(index);
    }

    const start: number = index;
    switch (peek) {
      case chars.$PERIOD:
        this.advance();
        return chars.isDigit(this.peek)
          ? this.scanNumber(start)
          : newCharacterToken(start, this.index, chars.$PERIOD);
      case chars.$LPAREN:
      case chars.$RPAREN:
      case chars.$LBRACKET:
      case chars.$RBRACKET:
      case chars.$COMMA:
      case chars.$COLON:
      case chars.$SEMICOLON:
        return this.scanCharacter(start, peek);
      case chars.$LBRACE:
        return this.scanOpenBrace(start, peek);
      case chars.$RBRACE:
        return this.scanCloseBrace(start, peek);
      case chars.$SQ:
      case chars.$DQ:
        return this.scanString();
      case chars.$BT:
        this.advance();
        return this.scanTemplateLiteralPart(start);
      case chars.$HASH:
        return this.scanPrivateIdentifier();
      case chars.$PLUS:
      case chars.$MINUS:
      case chars.$SLASH:
      case chars.$PERCENT:
      case chars.$CARET:
        return this.scanOperator(start, String.fromCharCode(peek));
      case chars.$STAR:
        return this.scanComplexOperator(start, '*', chars.$STAR, '*');
      case chars.$QUESTION:
        return this.scanQuestion(start);
      case chars.$LT:
      case chars.$GT:
        return this.scanComplexOperator(start, String.fromCharCode(peek), chars.$EQ, '=');
      case chars.$BANG:
      case chars.$EQ:
        return this.scanComplexOperator(
          start,
          String.fromCharCode(peek),
          chars.$EQ,
          '=',
          chars.$EQ,
          '=',
        );
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

  private scanCharacter(start: number, code: number): Token {
    this.advance();
    return newCharacterToken(start, this.index, code);
  }

  private scanOperator(start: number, str: string): Token {
    this.advance();
    return newOperatorToken(start, this.index, str);
  }

  private scanOpenBrace(start: number, code: number): Token {
    this.braceStack.push('expression');
    this.advance();
    return newCharacterToken(start, this.index, code);
  }

  private scanCloseBrace(start: number, code: number): Token {
    this.advance();

    const currentBrace = this.braceStack.pop();
    if (currentBrace === 'interpolation') {
      this.tokens.push(newOperatorToken(start, this.index, '}'));
      return this.scanTemplateLiteralPart(this.index);
    }

    return newCharacterToken(start, this.index, code);
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
  private scanComplexOperator(
    start: number,
    one: string,
    twoCode: number,
    two: string,
    threeCode?: number,
    three?: string,
  ): Token {
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

  private scanIdentifier(): Token {
    const start: number = this.index;
    this.advance();
    while (isIdentifierPart(this.peek)) this.advance();
    const str: string = this.input.substring(start, this.index);
    return KEYWORDS.indexOf(str) > -1
      ? newKeywordToken(start, this.index, str)
      : newIdentifierToken(start, this.index, str);
  }

  /** Scans an ECMAScript private identifier. */
  private scanPrivateIdentifier(): Token {
    const start: number = this.index;
    this.advance();
    if (!isIdentifierStart(this.peek)) {
      return this.error('Invalid character [#]', -1);
    }
    while (isIdentifierPart(this.peek)) this.advance();
    const identifierName: string = this.input.substring(start, this.index);
    return newPrivateIdentifierToken(start, this.index, identifierName);
  }

  private scanNumber(start: number): Token {
    let simple = this.index === start;
    let hasSeparators = false;
    this.advance(); // Skip initial digit.
    while (true) {
      if (chars.isDigit(this.peek)) {
        // Do nothing.
      } else if (this.peek === chars.$_) {
        // Separators are only valid when they're surrounded by digits. E.g. `1_0_1` is
        // valid while `_101` and `101_` are not. The separator can't be next to the decimal
        // point or another separator either. Note that it's unlikely that we'll hit a case where
        // the underscore is at the start, because that's a valid identifier and it will be picked
        // up earlier in the parsing. We validate for it anyway just in case.
        if (
          !chars.isDigit(this.input.charCodeAt(this.index - 1)) ||
          !chars.isDigit(this.input.charCodeAt(this.index + 1))
        ) {
          return this.error('Invalid numeric separator', 0);
        }
        hasSeparators = true;
      } else if (this.peek === chars.$PERIOD) {
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

    let str = this.input.substring(start, this.index);
    if (hasSeparators) {
      str = str.replace(/_/g, '');
    }
    const value = simple ? parseIntAutoRadix(str) : parseFloat(str);
    return newNumberToken(start, this.index, value);
  }

  private scanString(): Token {
    const start = this.index;
    const quote = this.peek;
    this.advance(); // Skip initial quote.

    let buffer = '';
    let marker = this.index;
    const input = this.input;

    while (this.peek != quote) {
      if (this.peek == chars.$BACKSLASH) {
        const result = this.scanStringBackslash(buffer, marker);
        if (typeof result !== 'string') {
          return result; // Error
        }
        buffer = result;
        marker = this.index;
      } else if (this.peek == chars.$EOF) {
        return this.error('Unterminated quote', 0);
      } else {
        this.advance();
      }
    }

    const last: string = input.substring(marker, this.index);
    this.advance(); // Skip terminating quote.

    return new StringToken(start, this.index, buffer + last, StringTokenKind.Plain);
  }

  private scanQuestion(start: number): Token {
    this.advance();
    let str: string = '?';
    // Either `a ?? b` or 'a?.b'.
    if (this.peek === chars.$QUESTION || this.peek === chars.$PERIOD) {
      str += this.peek === chars.$PERIOD ? '.' : '?';
      this.advance();
    }
    return newOperatorToken(start, this.index, str);
  }

  private scanTemplateLiteralPart(start: number): Token {
    let buffer = '';
    let marker = this.index;

    while (this.peek !== chars.$BT) {
      if (this.peek === chars.$BACKSLASH) {
        const result = this.scanStringBackslash(buffer, marker);
        if (typeof result !== 'string') {
          return result; // Error
        }
        buffer = result;
        marker = this.index;
      } else if (this.peek === chars.$$) {
        const dollar = this.index;
        this.advance();

        // @ts-expect-error
        if (this.peek === chars.$LBRACE) {
          this.braceStack.push('interpolation');
          this.tokens.push(
            new StringToken(
              start,
              dollar,
              buffer + this.input.substring(marker, dollar),
              StringTokenKind.TemplateLiteralPart,
            ),
          );
          this.advance();
          return newOperatorToken(dollar, this.index, this.input.substring(dollar, this.index));
        }
      } else if (this.peek === chars.$EOF) {
        return this.error('Unterminated template literal', 0);
      } else {
        this.advance();
      }
    }

    const last = this.input.substring(marker, this.index);
    this.advance();
    return new StringToken(start, this.index, buffer + last, StringTokenKind.TemplateLiteralEnd);
  }

  private error(message: string, offset: number): Token & {type: TokenType.Error} {
    const position: number = this.index + offset;
    return newErrorToken(
      position,
      this.index,
      `Lexer Error: ${message} at column ${position} in expression [${this.input}]`,
    ) as Token & {type: TokenType.Error};
  }

  private scanStringBackslash(
    buffer: string,
    marker: number,
  ): string | (Token & {type: TokenType.Error}) {
    buffer += this.input.substring(marker, this.index);
    let unescapedCode: number;
    this.advance();
    if (this.peek === chars.$u) {
      // 4 character hex code for unicode character.
      const hex: string = this.input.substring(this.index + 1, this.index + 5);
      if (/^[0-9a-f]+$/i.test(hex)) {
        unescapedCode = parseInt(hex, 16);
      } else {
        return this.error(`Invalid unicode escape [\\u${hex}]`, 0);
      }
      for (let i = 0; i < 5; i++) {
        this.advance();
      }
    } else {
      unescapedCode = unescape(this.peek);
      this.advance();
    }
    buffer += String.fromCharCode(unescapedCode);
    return buffer;
  }
}

function isIdentifierStart(code: number): boolean {
  return (
    (chars.$a <= code && code <= chars.$z) ||
    (chars.$A <= code && code <= chars.$Z) ||
    code == chars.$_ ||
    code == chars.$$
  );
}

function isIdentifierPart(code: number): boolean {
  return chars.isAsciiLetter(code) || chars.isDigit(code) || code == chars.$_ || code == chars.$$;
}

function isExponentStart(code: number): boolean {
  return code == chars.$e || code == chars.$E;
}

function isExponentSign(code: number): boolean {
  return code == chars.$MINUS || code == chars.$PLUS;
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

function parseIntAutoRadix(text: string): number {
  const result: number = parseInt(text);
  if (isNaN(result)) {
    throw new Error('Invalid integer literal when parsing ' + text);
  }
  return result;
}
