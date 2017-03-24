/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


import * as chars from '../chars';

export enum CssTokenType {
  EOF,
  String,
  Comment,
  Identifier,
  Number,
  IdentifierOrNumber,
  AtKeyword,
  Character,
  Whitespace,
  Invalid
}

export enum CssLexerMode {
  ALL,
  ALL_TRACK_WS,
  SELECTOR,
  PSEUDO_SELECTOR,
  PSEUDO_SELECTOR_WITH_ARGUMENTS,
  ATTRIBUTE_SELECTOR,
  AT_RULE_QUERY,
  MEDIA_QUERY,
  BLOCK,
  KEYFRAME_BLOCK,
  STYLE_BLOCK,
  STYLE_VALUE,
  STYLE_VALUE_FUNCTION,
  STYLE_CALC_FUNCTION
}

export class LexedCssResult {
  constructor(public error: Error|null, public token: CssToken) {}
}

export function generateErrorMessage(
    input: string, message: string, errorValue: string, index: number, row: number,
    column: number): string {
  return `${message} at column ${row}:${column} in expression [` +
      findProblemCode(input, errorValue, index, column) + ']';
}

export function findProblemCode(
    input: string, errorValue: string, index: number, column: number): string {
  let endOfProblemLine = index;
  let current = charCode(input, index);
  while (current > 0 && !isNewline(current)) {
    current = charCode(input, ++endOfProblemLine);
  }
  const choppedString = input.substring(0, endOfProblemLine);
  let pointerPadding = '';
  for (let i = 0; i < column; i++) {
    pointerPadding += ' ';
  }
  let pointerString = '';
  for (let i = 0; i < errorValue.length; i++) {
    pointerString += '^';
  }
  return choppedString + '\n' + pointerPadding + pointerString + '\n';
}

export class CssToken {
  numValue: number;
  constructor(
      public index: number, public column: number, public line: number, public type: CssTokenType,
      public strValue: string) {
    this.numValue = charCode(strValue, 0);
  }
}

export class CssLexer {
  scan(text: string, trackComments: boolean = false): CssScanner {
    return new CssScanner(text, trackComments);
  }
}

export function cssScannerError(token: CssToken, message: string): Error {
  const error = Error('CssParseError: ' + message);
  (error as any)[ERROR_RAW_MESSAGE] = message;
  (error as any)[ERROR_TOKEN] = token;
  return error;
}

const ERROR_TOKEN = 'ngToken';
const ERROR_RAW_MESSAGE = 'ngRawMessage';

export function getRawMessage(error: Error): string {
  return (error as any)[ERROR_RAW_MESSAGE];
}

export function getToken(error: Error): CssToken {
  return (error as any)[ERROR_TOKEN];
}

function _trackWhitespace(mode: CssLexerMode) {
  switch (mode) {
    case CssLexerMode.SELECTOR:
    case CssLexerMode.PSEUDO_SELECTOR:
    case CssLexerMode.ALL_TRACK_WS:
    case CssLexerMode.STYLE_VALUE:
      return true;

    default:
      return false;
  }
}

export class CssScanner {
  peek: number;
  peekPeek: number;
  length: number = 0;
  index: number = -1;
  column: number = -1;
  line: number = 0;

  /** @internal */
  _currentMode: CssLexerMode = CssLexerMode.BLOCK;
  /** @internal */
  _currentError: Error|null = null;

  constructor(public input: string, private _trackComments: boolean = false) {
    this.length = this.input.length;
    this.peekPeek = this.peekAt(0);
    this.advance();
  }

  getMode(): CssLexerMode { return this._currentMode; }

  setMode(mode: CssLexerMode) {
    if (this._currentMode != mode) {
      if (_trackWhitespace(this._currentMode) && !_trackWhitespace(mode)) {
        this.consumeWhitespace();
      }
      this._currentMode = mode;
    }
  }

  advance(): void {
    if (isNewline(this.peek)) {
      this.column = 0;
      this.line++;
    } else {
      this.column++;
    }

    this.index++;
    this.peek = this.peekPeek;
    this.peekPeek = this.peekAt(this.index + 1);
  }

  peekAt(index: number): number {
    return index >= this.length ? chars.$EOF : this.input.charCodeAt(index);
  }

  consumeEmptyStatements(): void {
    this.consumeWhitespace();
    while (this.peek == chars.$SEMICOLON) {
      this.advance();
      this.consumeWhitespace();
    }
  }

  consumeWhitespace(): void {
    while (chars.isWhitespace(this.peek) || isNewline(this.peek)) {
      this.advance();
      if (!this._trackComments && isCommentStart(this.peek, this.peekPeek)) {
        this.advance();  // /
        this.advance();  // *
        while (!isCommentEnd(this.peek, this.peekPeek)) {
          if (this.peek == chars.$EOF) {
            this.error('Unterminated comment');
          }
          this.advance();
        }
        this.advance();  // *
        this.advance();  // /
      }
    }
  }

  consume(type: CssTokenType, value: string|null = null): LexedCssResult {
    const mode = this._currentMode;

    this.setMode(_trackWhitespace(mode) ? CssLexerMode.ALL_TRACK_WS : CssLexerMode.ALL);

    const previousIndex = this.index;
    const previousLine = this.line;
    const previousColumn = this.column;

    let next: CssToken = undefined !;
    const output = this.scan();
    if (output != null) {
      // just incase the inner scan method returned an error
      if (output.error != null) {
        this.setMode(mode);
        return output;
      }

      next = output.token;
    }

    if (next == null) {
      next = new CssToken(this.index, this.column, this.line, CssTokenType.EOF, 'end of file');
    }

    let isMatchingType: boolean = false;
    if (type == CssTokenType.IdentifierOrNumber) {
      // TODO (matsko): implement array traversal for lookup here
      isMatchingType = next.type == CssTokenType.Number || next.type == CssTokenType.Identifier;
    } else {
      isMatchingType = next.type == type;
    }

    // before throwing the error we need to bring back the former
    // mode so that the parser can recover...
    this.setMode(mode);

    let error: Error|null = null;
    if (!isMatchingType || (value != null && value != next.strValue)) {
      let errorMessage =
          CssTokenType[next.type] + ' does not match expected ' + CssTokenType[type] + ' value';

      if (value != null) {
        errorMessage += ' ("' + next.strValue + '" should match "' + value + '")';
      }

      error = cssScannerError(
          next, generateErrorMessage(
                    this.input, errorMessage, next.strValue, previousIndex, previousLine,
                    previousColumn));
    }

    return new LexedCssResult(error, next);
  }


  scan(): LexedCssResult|null {
    const trackWS = _trackWhitespace(this._currentMode);
    if (this.index == 0 && !trackWS) {  // first scan
      this.consumeWhitespace();
    }

    const token = this._scan();
    if (token == null) return null;

    const error = this._currentError !;
    this._currentError = null;

    if (!trackWS) {
      this.consumeWhitespace();
    }
    return new LexedCssResult(error, token);
  }

  /** @internal */
  _scan(): CssToken|null {
    let peek = this.peek;
    let peekPeek = this.peekPeek;
    if (peek == chars.$EOF) return null;

    if (isCommentStart(peek, peekPeek)) {
      // even if comments are not tracked we still lex the
      // comment so we can move the pointer forward
      const commentToken = this.scanComment();
      if (this._trackComments) {
        return commentToken;
      }
    }

    if (_trackWhitespace(this._currentMode) && (chars.isWhitespace(peek) || isNewline(peek))) {
      return this.scanWhitespace();
    }

    peek = this.peek;
    peekPeek = this.peekPeek;
    if (peek == chars.$EOF) return null;

    if (isStringStart(peek, peekPeek)) {
      return this.scanString();
    }

    // something like url(cool)
    if (this._currentMode == CssLexerMode.STYLE_VALUE_FUNCTION) {
      return this.scanCssValueFunction();
    }

    const isModifier = peek == chars.$PLUS || peek == chars.$MINUS;
    const digitA = isModifier ? false : chars.isDigit(peek);
    const digitB = chars.isDigit(peekPeek);
    if (digitA || (isModifier && (peekPeek == chars.$PERIOD || digitB)) ||
        (peek == chars.$PERIOD && digitB)) {
      return this.scanNumber();
    }

    if (peek == chars.$AT) {
      return this.scanAtExpression();
    }

    if (isIdentifierStart(peek, peekPeek)) {
      return this.scanIdentifier();
    }

    if (isValidCssCharacter(peek, this._currentMode)) {
      return this.scanCharacter();
    }

    return this.error(`Unexpected character [${String.fromCharCode(peek)}]`);
  }

  scanComment(): CssToken|null {
    if (this.assertCondition(
            isCommentStart(this.peek, this.peekPeek), 'Expected comment start value')) {
      return null;
    }

    const start = this.index;
    const startingColumn = this.column;
    const startingLine = this.line;

    this.advance();  // /
    this.advance();  // *

    while (!isCommentEnd(this.peek, this.peekPeek)) {
      if (this.peek == chars.$EOF) {
        this.error('Unterminated comment');
      }
      this.advance();
    }

    this.advance();  // *
    this.advance();  // /

    const str = this.input.substring(start, this.index);
    return new CssToken(start, startingColumn, startingLine, CssTokenType.Comment, str);
  }

  scanWhitespace(): CssToken {
    const start = this.index;
    const startingColumn = this.column;
    const startingLine = this.line;
    while (chars.isWhitespace(this.peek) && this.peek != chars.$EOF) {
      this.advance();
    }
    const str = this.input.substring(start, this.index);
    return new CssToken(start, startingColumn, startingLine, CssTokenType.Whitespace, str);
  }

  scanString(): CssToken|null {
    if (this.assertCondition(
            isStringStart(this.peek, this.peekPeek), 'Unexpected non-string starting value')) {
      return null;
    }

    const target = this.peek;
    const start = this.index;
    const startingColumn = this.column;
    const startingLine = this.line;
    let previous = target;
    this.advance();

    while (!isCharMatch(target, previous, this.peek)) {
      if (this.peek == chars.$EOF || isNewline(this.peek)) {
        this.error('Unterminated quote');
      }
      previous = this.peek;
      this.advance();
    }

    if (this.assertCondition(this.peek == target, 'Unterminated quote')) {
      return null;
    }
    this.advance();

    const str = this.input.substring(start, this.index);
    return new CssToken(start, startingColumn, startingLine, CssTokenType.String, str);
  }

  scanNumber(): CssToken {
    const start = this.index;
    const startingColumn = this.column;
    if (this.peek == chars.$PLUS || this.peek == chars.$MINUS) {
      this.advance();
    }
    let periodUsed = false;
    while (chars.isDigit(this.peek) || this.peek == chars.$PERIOD) {
      if (this.peek == chars.$PERIOD) {
        if (periodUsed) {
          this.error('Unexpected use of a second period value');
        }
        periodUsed = true;
      }
      this.advance();
    }
    const strValue = this.input.substring(start, this.index);
    return new CssToken(start, startingColumn, this.line, CssTokenType.Number, strValue);
  }

  scanIdentifier(): CssToken|null {
    if (this.assertCondition(
            isIdentifierStart(this.peek, this.peekPeek), 'Expected identifier starting value')) {
      return null;
    }

    const start = this.index;
    const startingColumn = this.column;
    while (isIdentifierPart(this.peek)) {
      this.advance();
    }
    const strValue = this.input.substring(start, this.index);
    return new CssToken(start, startingColumn, this.line, CssTokenType.Identifier, strValue);
  }

  scanCssValueFunction(): CssToken {
    const start = this.index;
    const startingColumn = this.column;
    let parenBalance = 1;
    while (this.peek != chars.$EOF && parenBalance > 0) {
      this.advance();
      if (this.peek == chars.$LPAREN) {
        parenBalance++;
      } else if (this.peek == chars.$RPAREN) {
        parenBalance--;
      }
    }
    const strValue = this.input.substring(start, this.index);
    return new CssToken(start, startingColumn, this.line, CssTokenType.Identifier, strValue);
  }

  scanCharacter(): CssToken|null {
    const start = this.index;
    const startingColumn = this.column;
    if (this.assertCondition(
            isValidCssCharacter(this.peek, this._currentMode),
            charStr(this.peek) + ' is not a valid CSS character')) {
      return null;
    }

    const c = this.input.substring(start, start + 1);
    this.advance();

    return new CssToken(start, startingColumn, this.line, CssTokenType.Character, c);
  }

  scanAtExpression(): CssToken|null {
    if (this.assertCondition(this.peek == chars.$AT, 'Expected @ value')) {
      return null;
    }

    const start = this.index;
    const startingColumn = this.column;
    this.advance();
    if (isIdentifierStart(this.peek, this.peekPeek)) {
      const ident = this.scanIdentifier() !;
      const strValue = '@' + ident.strValue;
      return new CssToken(start, startingColumn, this.line, CssTokenType.AtKeyword, strValue);
    } else {
      return this.scanCharacter();
    }
  }

  assertCondition(status: boolean, errorMessage: string): boolean {
    if (!status) {
      this.error(errorMessage);
      return true;
    }
    return false;
  }

  error(message: string, errorTokenValue: string|null = null, doNotAdvance: boolean = false):
      CssToken {
    const index: number = this.index;
    const column: number = this.column;
    const line: number = this.line;
    errorTokenValue = errorTokenValue || String.fromCharCode(this.peek);
    const invalidToken = new CssToken(index, column, line, CssTokenType.Invalid, errorTokenValue);
    const errorMessage =
        generateErrorMessage(this.input, message, errorTokenValue, index, line, column);
    if (!doNotAdvance) {
      this.advance();
    }
    this._currentError = cssScannerError(invalidToken, errorMessage);
    return invalidToken;
  }
}

function isCharMatch(target: number, previous: number, code: number): boolean {
  return code == target && previous != chars.$BACKSLASH;
}

function isCommentStart(code: number, next: number): boolean {
  return code == chars.$SLASH && next == chars.$STAR;
}

function isCommentEnd(code: number, next: number): boolean {
  return code == chars.$STAR && next == chars.$SLASH;
}

function isStringStart(code: number, next: number): boolean {
  let target = code;
  if (target == chars.$BACKSLASH) {
    target = next;
  }
  return target == chars.$DQ || target == chars.$SQ;
}

function isIdentifierStart(code: number, next: number): boolean {
  let target = code;
  if (target == chars.$MINUS) {
    target = next;
  }

  return chars.isAsciiLetter(target) || target == chars.$BACKSLASH || target == chars.$MINUS ||
      target == chars.$_;
}

function isIdentifierPart(target: number): boolean {
  return chars.isAsciiLetter(target) || target == chars.$BACKSLASH || target == chars.$MINUS ||
      target == chars.$_ || chars.isDigit(target);
}

function isValidPseudoSelectorCharacter(code: number): boolean {
  switch (code) {
    case chars.$LPAREN:
    case chars.$RPAREN:
      return true;
    default:
      return false;
  }
}

function isValidKeyframeBlockCharacter(code: number): boolean {
  return code == chars.$PERCENT;
}

function isValidAttributeSelectorCharacter(code: number): boolean {
  // value^*|$~=something
  switch (code) {
    case chars.$$:
    case chars.$PIPE:
    case chars.$CARET:
    case chars.$TILDA:
    case chars.$STAR:
    case chars.$EQ:
      return true;
    default:
      return false;
  }
}

function isValidSelectorCharacter(code: number): boolean {
  // selector [ key   = value ]
  // IDENT    C IDENT C IDENT C
  // #id, .class, *+~>
  // tag:PSEUDO
  switch (code) {
    case chars.$HASH:
    case chars.$PERIOD:
    case chars.$TILDA:
    case chars.$STAR:
    case chars.$PLUS:
    case chars.$GT:
    case chars.$COLON:
    case chars.$PIPE:
    case chars.$COMMA:
    case chars.$LBRACKET:
    case chars.$RBRACKET:
      return true;
    default:
      return false;
  }
}

function isValidStyleBlockCharacter(code: number): boolean {
  // key:value;
  // key:calc(something ... )
  switch (code) {
    case chars.$HASH:
    case chars.$SEMICOLON:
    case chars.$COLON:
    case chars.$PERCENT:
    case chars.$SLASH:
    case chars.$BACKSLASH:
    case chars.$BANG:
    case chars.$PERIOD:
    case chars.$LPAREN:
    case chars.$RPAREN:
      return true;
    default:
      return false;
  }
}

function isValidMediaQueryRuleCharacter(code: number): boolean {
  // (min-width: 7.5em) and (orientation: landscape)
  switch (code) {
    case chars.$LPAREN:
    case chars.$RPAREN:
    case chars.$COLON:
    case chars.$PERCENT:
    case chars.$PERIOD:
      return true;
    default:
      return false;
  }
}

function isValidAtRuleCharacter(code: number): boolean {
  // @document url(http://www.w3.org/page?something=on#hash),
  switch (code) {
    case chars.$LPAREN:
    case chars.$RPAREN:
    case chars.$COLON:
    case chars.$PERCENT:
    case chars.$PERIOD:
    case chars.$SLASH:
    case chars.$BACKSLASH:
    case chars.$HASH:
    case chars.$EQ:
    case chars.$QUESTION:
    case chars.$AMPERSAND:
    case chars.$STAR:
    case chars.$COMMA:
    case chars.$MINUS:
    case chars.$PLUS:
      return true;
    default:
      return false;
  }
}

function isValidStyleFunctionCharacter(code: number): boolean {
  switch (code) {
    case chars.$PERIOD:
    case chars.$MINUS:
    case chars.$PLUS:
    case chars.$STAR:
    case chars.$SLASH:
    case chars.$LPAREN:
    case chars.$RPAREN:
    case chars.$COMMA:
      return true;
    default:
      return false;
  }
}

function isValidBlockCharacter(code: number): boolean {
  // @something { }
  // IDENT
  return code == chars.$AT;
}

function isValidCssCharacter(code: number, mode: CssLexerMode): boolean {
  switch (mode) {
    case CssLexerMode.ALL:
    case CssLexerMode.ALL_TRACK_WS:
      return true;

    case CssLexerMode.SELECTOR:
      return isValidSelectorCharacter(code);

    case CssLexerMode.PSEUDO_SELECTOR_WITH_ARGUMENTS:
      return isValidPseudoSelectorCharacter(code);

    case CssLexerMode.ATTRIBUTE_SELECTOR:
      return isValidAttributeSelectorCharacter(code);

    case CssLexerMode.MEDIA_QUERY:
      return isValidMediaQueryRuleCharacter(code);

    case CssLexerMode.AT_RULE_QUERY:
      return isValidAtRuleCharacter(code);

    case CssLexerMode.KEYFRAME_BLOCK:
      return isValidKeyframeBlockCharacter(code);

    case CssLexerMode.STYLE_BLOCK:
    case CssLexerMode.STYLE_VALUE:
      return isValidStyleBlockCharacter(code);

    case CssLexerMode.STYLE_CALC_FUNCTION:
      return isValidStyleFunctionCharacter(code);

    case CssLexerMode.BLOCK:
      return isValidBlockCharacter(code);

    default:
      return false;
  }
}

function charCode(input: string, index: number): number {
  return index >= input.length ? chars.$EOF : input.charCodeAt(index);
}

function charStr(code: number): string {
  return String.fromCharCode(code);
}

export function isNewline(code: number): boolean {
  switch (code) {
    case chars.$FF:
    case chars.$CR:
    case chars.$LF:
    case chars.$VTAB:
      return true;

    default:
      return false;
  }
}
