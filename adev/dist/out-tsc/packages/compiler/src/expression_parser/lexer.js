/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as chars from '../chars';
export var TokenType;
(function (TokenType) {
  TokenType[(TokenType['Character'] = 0)] = 'Character';
  TokenType[(TokenType['Identifier'] = 1)] = 'Identifier';
  TokenType[(TokenType['PrivateIdentifier'] = 2)] = 'PrivateIdentifier';
  TokenType[(TokenType['Keyword'] = 3)] = 'Keyword';
  TokenType[(TokenType['String'] = 4)] = 'String';
  TokenType[(TokenType['Operator'] = 5)] = 'Operator';
  TokenType[(TokenType['Number'] = 6)] = 'Number';
  TokenType[(TokenType['RegExpBody'] = 7)] = 'RegExpBody';
  TokenType[(TokenType['RegExpFlags'] = 8)] = 'RegExpFlags';
  TokenType[(TokenType['Error'] = 9)] = 'Error';
})(TokenType || (TokenType = {}));
export var StringTokenKind;
(function (StringTokenKind) {
  StringTokenKind[(StringTokenKind['Plain'] = 0)] = 'Plain';
  StringTokenKind[(StringTokenKind['TemplateLiteralPart'] = 1)] = 'TemplateLiteralPart';
  StringTokenKind[(StringTokenKind['TemplateLiteralEnd'] = 2)] = 'TemplateLiteralEnd';
})(StringTokenKind || (StringTokenKind = {}));
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
  tokenize(text) {
    return new _Scanner(text).scan();
  }
}
export class Token {
  index;
  end;
  type;
  numValue;
  strValue;
  constructor(index, end, type, numValue, strValue) {
    this.index = index;
    this.end = end;
    this.type = type;
    this.numValue = numValue;
    this.strValue = strValue;
  }
  isCharacter(code) {
    return this.type === TokenType.Character && this.numValue === code;
  }
  isNumber() {
    return this.type === TokenType.Number;
  }
  isString() {
    return this.type === TokenType.String;
  }
  isOperator(operator) {
    return this.type === TokenType.Operator && this.strValue === operator;
  }
  isIdentifier() {
    return this.type === TokenType.Identifier;
  }
  isPrivateIdentifier() {
    return this.type === TokenType.PrivateIdentifier;
  }
  isKeyword() {
    return this.type === TokenType.Keyword;
  }
  isKeywordLet() {
    return this.type === TokenType.Keyword && this.strValue === 'let';
  }
  isKeywordAs() {
    return this.type === TokenType.Keyword && this.strValue === 'as';
  }
  isKeywordNull() {
    return this.type === TokenType.Keyword && this.strValue === 'null';
  }
  isKeywordUndefined() {
    return this.type === TokenType.Keyword && this.strValue === 'undefined';
  }
  isKeywordTrue() {
    return this.type === TokenType.Keyword && this.strValue === 'true';
  }
  isKeywordFalse() {
    return this.type === TokenType.Keyword && this.strValue === 'false';
  }
  isKeywordThis() {
    return this.type === TokenType.Keyword && this.strValue === 'this';
  }
  isKeywordTypeof() {
    return this.type === TokenType.Keyword && this.strValue === 'typeof';
  }
  isKeywordVoid() {
    return this.type === TokenType.Keyword && this.strValue === 'void';
  }
  isKeywordIn() {
    return this.type === TokenType.Keyword && this.strValue === 'in';
  }
  isError() {
    return this.type === TokenType.Error;
  }
  isRegExpBody() {
    return this.type === TokenType.RegExpBody;
  }
  isRegExpFlags() {
    return this.type === TokenType.RegExpFlags;
  }
  toNumber() {
    return this.type === TokenType.Number ? this.numValue : -1;
  }
  isTemplateLiteralPart() {
    // Note: Explicit type is needed for Closure.
    return this.isString() && this.kind === StringTokenKind.TemplateLiteralPart;
  }
  isTemplateLiteralEnd() {
    // Note: Explicit type is needed for Closure.
    return this.isString() && this.kind === StringTokenKind.TemplateLiteralEnd;
  }
  isTemplateLiteralInterpolationStart() {
    return this.isOperator('${');
  }
  isTemplateLiteralInterpolationEnd() {
    return this.isOperator('}');
  }
  toString() {
    switch (this.type) {
      case TokenType.Character:
      case TokenType.Identifier:
      case TokenType.Keyword:
      case TokenType.Operator:
      case TokenType.PrivateIdentifier:
      case TokenType.String:
      case TokenType.Error:
      case TokenType.RegExpBody:
      case TokenType.RegExpFlags:
        return this.strValue;
      case TokenType.Number:
        return this.numValue.toString();
      default:
        return null;
    }
  }
}
export class StringToken extends Token {
  kind;
  constructor(index, end, strValue, kind) {
    super(index, end, TokenType.String, 0, strValue);
    this.kind = kind;
  }
}
function newCharacterToken(index, end, code) {
  return new Token(index, end, TokenType.Character, code, String.fromCharCode(code));
}
function newIdentifierToken(index, end, text) {
  return new Token(index, end, TokenType.Identifier, 0, text);
}
function newPrivateIdentifierToken(index, end, text) {
  return new Token(index, end, TokenType.PrivateIdentifier, 0, text);
}
function newKeywordToken(index, end, text) {
  return new Token(index, end, TokenType.Keyword, 0, text);
}
function newOperatorToken(index, end, text) {
  return new Token(index, end, TokenType.Operator, 0, text);
}
function newNumberToken(index, end, n) {
  return new Token(index, end, TokenType.Number, n, '');
}
function newErrorToken(index, end, message) {
  return new Token(index, end, TokenType.Error, 0, message);
}
function newRegExpBodyToken(index, end, text) {
  return new Token(index, end, TokenType.RegExpBody, 0, text);
}
function newRegExpFlagsToken(index, end, text) {
  return new Token(index, end, TokenType.RegExpFlags, 0, text);
}
export const EOF = new Token(-1, -1, TokenType.Character, 0, '');
class _Scanner {
  input;
  tokens = [];
  length;
  peek = 0;
  index = -1;
  braceStack = [];
  constructor(input) {
    this.input = input;
    this.length = input.length;
    this.advance();
  }
  scan() {
    let token = this.scanToken();
    while (token !== null) {
      this.tokens.push(token);
      token = this.scanToken();
    }
    return this.tokens;
  }
  advance() {
    this.peek = ++this.index >= this.length ? chars.$EOF : this.input.charCodeAt(this.index);
  }
  scanToken() {
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
    const start = index;
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
        return this.scanComplexOperator(start, '+', chars.$EQ, '=');
      case chars.$MINUS:
        return this.scanComplexOperator(start, '-', chars.$EQ, '=');
      case chars.$SLASH:
        return this.isStartOfRegex()
          ? this.scanRegex(index)
          : this.scanComplexOperator(start, '/', chars.$EQ, '=');
      case chars.$PERCENT:
        return this.scanComplexOperator(start, '%', chars.$EQ, '=');
      case chars.$CARET:
        return this.scanOperator(start, '^');
      case chars.$STAR:
        return this.scanStar(start);
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
        return this.scanComplexOperator(start, '&', chars.$AMPERSAND, '&', chars.$EQ, '=');
      case chars.$BAR:
        return this.scanComplexOperator(start, '|', chars.$BAR, '|', chars.$EQ, '=');
      case chars.$NBSP:
        while (chars.isWhitespace(this.peek)) this.advance();
        return this.scanToken();
    }
    this.advance();
    return this.error(`Unexpected character [${String.fromCharCode(peek)}]`, 0);
  }
  scanCharacter(start, code) {
    this.advance();
    return newCharacterToken(start, this.index, code);
  }
  scanOperator(start, str) {
    this.advance();
    return newOperatorToken(start, this.index, str);
  }
  scanOpenBrace(start, code) {
    this.braceStack.push('expression');
    this.advance();
    return newCharacterToken(start, this.index, code);
  }
  scanCloseBrace(start, code) {
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
  scanComplexOperator(start, one, twoCode, two, threeCode, three) {
    this.advance();
    let str = one;
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
  scanIdentifier() {
    const start = this.index;
    this.advance();
    while (isIdentifierPart(this.peek)) this.advance();
    const str = this.input.substring(start, this.index);
    return KEYWORDS.indexOf(str) > -1
      ? newKeywordToken(start, this.index, str)
      : newIdentifierToken(start, this.index, str);
  }
  /** Scans an ECMAScript private identifier. */
  scanPrivateIdentifier() {
    const start = this.index;
    this.advance();
    if (!isIdentifierStart(this.peek)) {
      return this.error('Invalid character [#]', -1);
    }
    while (isIdentifierPart(this.peek)) this.advance();
    const identifierName = this.input.substring(start, this.index);
    return newPrivateIdentifierToken(start, this.index, identifierName);
  }
  scanNumber(start) {
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
  scanString() {
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
    const last = input.substring(marker, this.index);
    this.advance(); // Skip terminating quote.
    return new StringToken(start, this.index, buffer + last, StringTokenKind.Plain);
  }
  scanQuestion(start) {
    this.advance();
    let operator = '?';
    // `a ?? b` or `a ??= b`.
    if (this.peek === chars.$QUESTION) {
      operator += '?';
      this.advance();
      // @ts-expect-error
      if (this.peek === chars.$EQ) {
        operator += '=';
        this.advance();
      }
    } else if (this.peek === chars.$PERIOD) {
      // `a?.b`
      operator += '.';
      this.advance();
    }
    return newOperatorToken(start, this.index, operator);
  }
  scanTemplateLiteralPart(start) {
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
  error(message, offset) {
    const position = this.index + offset;
    return newErrorToken(
      position,
      this.index,
      `Lexer Error: ${message} at column ${position} in expression [${this.input}]`,
    );
  }
  scanStringBackslash(buffer, marker) {
    buffer += this.input.substring(marker, this.index);
    let unescapedCode;
    this.advance();
    if (this.peek === chars.$u) {
      // 4 character hex code for unicode character.
      const hex = this.input.substring(this.index + 1, this.index + 5);
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
  scanStar(start) {
    this.advance();
    // `*`, `**`, `**=` or `*=`
    let operator = '*';
    if (this.peek === chars.$STAR) {
      operator += '*';
      this.advance();
      // @ts-expect-error
      if (this.peek === chars.$EQ) {
        operator += '=';
        this.advance();
      }
    } else if (this.peek === chars.$EQ) {
      operator += '=';
      this.advance();
    }
    return newOperatorToken(start, this.index, operator);
  }
  isStartOfRegex() {
    if (this.tokens.length === 0) {
      return true;
    }
    const prevToken = this.tokens[this.tokens.length - 1];
    // If a slash is preceded by a `!` operator, we need to distinguish whether it's a
    // negation or a non-null assertion. Regexes can only be precded by negations.
    if (prevToken.isOperator('!')) {
      const beforePrevToken = this.tokens.length > 1 ? this.tokens[this.tokens.length - 2] : null;
      const isNegation =
        beforePrevToken === null ||
        (beforePrevToken.type !== TokenType.Identifier &&
          !beforePrevToken.isCharacter(chars.$RPAREN) &&
          !beforePrevToken.isCharacter(chars.$RBRACKET));
      return isNegation;
    }
    // Only consider the slash a regex if it's preceded either by:
    // - Any operator, aside from `!` which is special-cased above.
    // - Opening paren (e.g. `(/a/)`).
    // - Opening bracket (e.g. `[/a/]`).
    // - A comma (e.g. `[1, /a/]`).
    // - A colon (e.g. `{foo: /a/}`).
    return (
      prevToken.type === TokenType.Operator ||
      prevToken.isCharacter(chars.$LPAREN) ||
      prevToken.isCharacter(chars.$LBRACKET) ||
      prevToken.isCharacter(chars.$COMMA) ||
      prevToken.isCharacter(chars.$COLON)
    );
  }
  scanRegex(tokenStart) {
    this.advance();
    const textStart = this.index;
    let inEscape = false;
    let inCharacterClass = false;
    while (true) {
      const peek = this.peek;
      if (peek === chars.$EOF) {
        return this.error('Unterminated regular expression', 0);
      }
      if (inEscape) {
        inEscape = false;
      } else if (peek === chars.$BACKSLASH) {
        inEscape = true;
      } else if (peek === chars.$LBRACKET) {
        inCharacterClass = true;
      } else if (peek === chars.$RBRACKET) {
        inCharacterClass = false;
      } else if (peek === chars.$SLASH && !inCharacterClass) {
        break;
      }
      this.advance();
    }
    // Note that we want the text without the slashes,
    // but we still want the slashes to be part of the span.
    const value = this.input.substring(textStart, this.index);
    this.advance();
    const bodyToken = newRegExpBodyToken(tokenStart, this.index, value);
    const flagsToken = this.scanRegexFlags(this.index);
    if (flagsToken !== null) {
      this.tokens.push(bodyToken);
      return flagsToken;
    }
    return bodyToken;
  }
  scanRegexFlags(start) {
    if (!chars.isAsciiLetter(this.peek)) {
      return null;
    }
    while (chars.isAsciiLetter(this.peek)) {
      this.advance();
    }
    return newRegExpFlagsToken(start, this.index, this.input.substring(start, this.index));
  }
}
function isIdentifierStart(code) {
  return (
    (chars.$a <= code && code <= chars.$z) ||
    (chars.$A <= code && code <= chars.$Z) ||
    code == chars.$_ ||
    code == chars.$$
  );
}
function isIdentifierPart(code) {
  return chars.isAsciiLetter(code) || chars.isDigit(code) || code == chars.$_ || code == chars.$$;
}
function isExponentStart(code) {
  return code == chars.$e || code == chars.$E;
}
function isExponentSign(code) {
  return code == chars.$MINUS || code == chars.$PLUS;
}
function unescape(code) {
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
function parseIntAutoRadix(text) {
  const result = parseInt(text);
  if (isNaN(result)) {
    throw new Error('Invalid integer literal when parsing ' + text);
  }
  return result;
}
//# sourceMappingURL=lexer.js.map
