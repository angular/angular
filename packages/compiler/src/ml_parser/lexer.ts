/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as chars from '../chars';
import {ParseError, ParseLocation, ParseSourceFile, ParseSourceSpan} from '../parse_util';

import {DEFAULT_INTERPOLATION_CONFIG, InterpolationConfig} from './interpolation_config';
import {NAMED_ENTITIES, TagContentType, TagDefinition} from './tags';

export enum TokenType {
  TAG_OPEN_START,
  TAG_OPEN_END,
  TAG_OPEN_END_VOID,
  TAG_CLOSE,
  TEXT,
  ESCAPABLE_RAW_TEXT,
  RAW_TEXT,
  COMMENT_START,
  COMMENT_END,
  CDATA_START,
  CDATA_END,
  ATTR_NAME,
  ATTR_VALUE,
  DOC_TYPE,
  EXPANSION_FORM_START,
  EXPANSION_CASE_VALUE,
  EXPANSION_CASE_EXP_START,
  EXPANSION_CASE_EXP_END,
  EXPANSION_FORM_END,
  EOF
}

export class Token {
  constructor(
      public type: TokenType|null, public parts: string[], public sourceSpan: ParseSourceSpan) {}
}

export class TokenError extends ParseError {
  constructor(errorMsg: string, public tokenType: TokenType|null, span: ParseSourceSpan) {
    super(span, errorMsg);
  }
}

export class TokenizeResult {
  constructor(public tokens: Token[], public errors: TokenError[]) {}
}

export interface LexerRange {
  startPos: number;
  startLine: number;
  startCol: number;
  endPos: number;
}

/**
 * Options that modify how the text is tokenized.
 */
export interface TokenizeOptions {
  /** Whether to tokenize ICU messages (considered as text nodes when false). */
  tokenizeExpansionForms?: boolean;
  /** How to tokenize interpolation markers. */
  interpolationConfig?: InterpolationConfig;
  /**
   * The start and end point of the text to parse within the `source` string.
   * The entire `source` string is parsed if this is not provided.
   * */
  range?: LexerRange;
}

export function tokenize(
    source: string, url: string, getTagDefinition: (tagName: string) => TagDefinition,
    options: TokenizeOptions = {}): TokenizeResult {
  return new _Tokenizer(new ParseSourceFile(source, url), getTagDefinition, options).tokenize();
}

const _CR_OR_CRLF_REGEXP = /\r\n?/g;

function _unexpectedCharacterErrorMsg(charCode: number): string {
  const char = charCode === chars.$EOF ? 'EOF' : String.fromCharCode(charCode);
  return `Unexpected character "${char}"`;
}

function _unknownEntityErrorMsg(entitySrc: string): string {
  return `Unknown entity "${entitySrc}" - use the "&#<decimal>;" or  "&#x<hex>;" syntax`;
}

class _ControlFlowError {
  constructor(public error: TokenError) {}
}

// See http://www.w3.org/TR/html51/syntax.html#writing
class _Tokenizer {
  private _input: string;
  private _end: number;
  private _tokenizeIcu: boolean;
  private _interpolationConfig: InterpolationConfig;
  private _peek: number = -1;
  private _nextPeek: number = -1;
  private _index: number;
  private _line: number;
  private _column: number;
  private _currentTokenStart: ParseLocation|null = null;
  private _currentTokenType: TokenType|null = null;
  private _expansionCaseStack: TokenType[] = [];
  private _inInterpolation: boolean = false;

  tokens: Token[] = [];
  errors: TokenError[] = [];

  /**
   * @param _file The html source
   * @param _getTagDefinition
   * @param _tokenizeIcu Whether to tokenize ICU messages (considered as text nodes when false)
   * @param _interpolationConfig
   */
  constructor(
      private _file: ParseSourceFile, private _getTagDefinition: (tagName: string) => TagDefinition,
      options: TokenizeOptions) {
    this._tokenizeIcu = options.tokenizeExpansionForms || false;
    this._interpolationConfig = options.interpolationConfig || DEFAULT_INTERPOLATION_CONFIG;
    this._input = _file.content;
    if (options.range) {
      this._end = options.range.endPos;
      this._index = options.range.startPos;
      this._line = options.range.startLine;
      this._column = options.range.startCol;
    } else {
      this._end = this._input.length;
      this._index = 0;
      this._line = 0;
      this._column = 0;
    }
    try {
      this._initPeek();
    } catch (e) {
      if (e instanceof _ControlFlowError) {
        this.errors.push(e.error);
      } else {
        throw e;
      }
    }
  }

  private _processCarriageReturns(content: string): string {
    // http://www.w3.org/TR/html5/syntax.html#preprocessing-the-input-stream
    // In order to keep the original position in the source, we can not
    // pre-process it.
    // Instead CRs are processed right before instantiating the tokens.
    return content.replace(_CR_OR_CRLF_REGEXP, '\n');
  }

  tokenize(): TokenizeResult {
    while (this._peek !== chars.$EOF) {
      const start = this._getLocation();
      try {
        if (this._attemptCharCode(chars.$LT)) {
          if (this._attemptCharCode(chars.$BANG)) {
            if (this._attemptCharCode(chars.$LBRACKET)) {
              this._consumeCdata(start);
            } else if (this._attemptCharCode(chars.$MINUS)) {
              this._consumeComment(start);
            } else {
              this._consumeDocType(start);
            }
          } else if (this._attemptCharCode(chars.$SLASH)) {
            this._consumeTagClose(start);
          } else {
            this._consumeTagOpen(start);
          }
        } else if (!(this._tokenizeIcu && this._tokenizeExpansionForm())) {
          this._consumeText();
        }
      } catch (e) {
        if (e instanceof _ControlFlowError) {
          this.errors.push(e.error);
        } else {
          throw e;
        }
      }
    }
    this._beginToken(TokenType.EOF);
    this._endToken([]);
    return new TokenizeResult(mergeTextTokens(this.tokens), this.errors);
  }

  /**
   * @returns whether an ICU token has been created
   * @internal
   */
  private _tokenizeExpansionForm(): boolean {
    if (isExpansionFormStart(this._input, this._index, this._interpolationConfig)) {
      this._consumeExpansionFormStart();
      return true;
    }

    if (isExpansionCaseStart(this._peek) && this._isInExpansionForm()) {
      this._consumeExpansionCaseStart();
      return true;
    }

    if (this._peek === chars.$RBRACE) {
      if (this._isInExpansionCase()) {
        this._consumeExpansionCaseEnd();
        return true;
      }

      if (this._isInExpansionForm()) {
        this._consumeExpansionFormEnd();
        return true;
      }
    }

    return false;
  }

  private _getLocation(): ParseLocation {
    return new ParseLocation(this._file, this._index, this._line, this._column);
  }

  private _getSpan(
      start: ParseLocation = this._getLocation(),
      end: ParseLocation = this._getLocation()): ParseSourceSpan {
    return new ParseSourceSpan(start, end);
  }

  private _beginToken(type: TokenType, start: ParseLocation = this._getLocation()) {
    this._currentTokenStart = start;
    this._currentTokenType = type;
  }

  private _endToken(parts: string[], end: ParseLocation = this._getLocation()): Token {
    if (this._currentTokenStart === null) {
      throw new TokenError(
          'Programming error - attempted to end a token when there was no start to the token',
          this._currentTokenType, this._getSpan(end, end));
    }
    if (this._currentTokenType === null) {
      throw new TokenError(
          'Programming error - attempted to end a token which has no token type', null,
          this._getSpan(this._currentTokenStart, end));
    }
    const token =
        new Token(this._currentTokenType, parts, new ParseSourceSpan(this._currentTokenStart, end));
    this.tokens.push(token);
    this._currentTokenStart = null;
    this._currentTokenType = null;
    return token;
  }

  private _createError(msg: string, span: ParseSourceSpan): _ControlFlowError {
    if (this._isInExpansionForm()) {
      msg += ` (Do you have an unescaped "{" in your template? Use "{{ '{' }}") to escape it.)`;
    }
    const error = new TokenError(msg, this._currentTokenType, span);
    this._currentTokenStart = null !;
    this._currentTokenType = null !;
    return new _ControlFlowError(error);
  }

  private _advance(processingEscapeSequence?: boolean) {
    if (this._index >= this._end) {
      throw this._createError(_unexpectedCharacterErrorMsg(chars.$EOF), this._getSpan());
    }
    if (this._peek === chars.$LF) {
      this._line++;
      this._column = 0;
    } else if (this._peek !== chars.$LF && this._peek !== chars.$CR) {
      this._column++;
    }
    this._index++;
    this._initPeek(processingEscapeSequence);
  }

  /**
   * Initialize the _peek and _nextPeek properties based on the current _index.
   * @param processingEscapeSequence whether we are in the middle of processing an escape sequence.
   */
  private _initPeek(processingEscapeSequence?: boolean) {
    this._peek = this._index >= this._end ? chars.$EOF : this._input.charCodeAt(this._index);
    this._nextPeek =
        this._index + 1 >= this._end ? chars.$EOF : this._input.charCodeAt(this._index + 1);
  }

  private _attemptCharCode(charCode: number): boolean {
    if (this._peek === charCode) {
      this._advance();
      return true;
    }
    return false;
  }

  private _attemptCharCodeCaseInsensitive(charCode: number): boolean {
    if (compareCharCodeCaseInsensitive(this._peek, charCode)) {
      this._advance();
      return true;
    }
    return false;
  }

  private _requireCharCode(charCode: number) {
    const location = this._getLocation();
    if (!this._attemptCharCode(charCode)) {
      throw this._createError(
          _unexpectedCharacterErrorMsg(this._peek), this._getSpan(location, location));
    }
  }

  private _attemptStr(chars: string): boolean {
    const len = chars.length;
    if (this._index + len > this._end) {
      return false;
    }
    const initialPosition = this._savePosition();
    for (let i = 0; i < len; i++) {
      if (!this._attemptCharCode(chars.charCodeAt(i))) {
        // If attempting to parse the string fails, we want to reset the parser
        // to where it was before the attempt
        this._restorePosition(initialPosition);
        return false;
      }
    }
    return true;
  }

  private _attemptStrCaseInsensitive(chars: string): boolean {
    for (let i = 0; i < chars.length; i++) {
      if (!this._attemptCharCodeCaseInsensitive(chars.charCodeAt(i))) {
        return false;
      }
    }
    return true;
  }

  private _requireStr(chars: string) {
    const location = this._getLocation();
    if (!this._attemptStr(chars)) {
      throw this._createError(_unexpectedCharacterErrorMsg(this._peek), this._getSpan(location));
    }
  }

  private _attemptCharCodeUntilFn(predicate: (code: number) => boolean) {
    while (!predicate(this._peek)) {
      this._advance();
    }
  }

  private _requireCharCodeUntilFn(predicate: (code: number) => boolean, len: number) {
    const start = this._getLocation();
    this._attemptCharCodeUntilFn(predicate);
    if (this._index - start.offset < len) {
      throw this._createError(
          _unexpectedCharacterErrorMsg(this._peek), this._getSpan(start, start));
    }
  }

  private _attemptUntilChar(char: number) {
    while (this._peek !== char) {
      this._advance();
    }
  }

  private _readChar(decodeEntities: boolean): string {
    if (decodeEntities && this._peek === chars.$AMPERSAND) {
      return this._decodeEntity();
    } else {
      const index = this._index;
      this._advance();
      return this._input[index];
    }
  }

  private _decodeEntity(): string {
    const start = this._getLocation();
    this._advance();
    if (this._attemptCharCode(chars.$HASH)) {
      const isHex = this._attemptCharCode(chars.$x) || this._attemptCharCode(chars.$X);
      const numberStart = this._getLocation().offset;
      this._attemptCharCodeUntilFn(isDigitEntityEnd);
      if (this._peek != chars.$SEMICOLON) {
        throw this._createError(_unexpectedCharacterErrorMsg(this._peek), this._getSpan());
      }
      this._advance();
      const strNum = this._input.substring(numberStart, this._index - 1);
      try {
        const charCode = parseInt(strNum, isHex ? 16 : 10);
        return String.fromCharCode(charCode);
      } catch {
        const entity = this._input.substring(start.offset + 1, this._index - 1);
        throw this._createError(_unknownEntityErrorMsg(entity), this._getSpan(start));
      }
    } else {
      const startPosition = this._savePosition();
      this._attemptCharCodeUntilFn(isNamedEntityEnd);
      if (this._peek != chars.$SEMICOLON) {
        this._restorePosition(startPosition);
        return '&';
      }
      this._advance();
      const name = this._input.substring(start.offset + 1, this._index - 1);
      const char = NAMED_ENTITIES[name];
      if (!char) {
        throw this._createError(_unknownEntityErrorMsg(name), this._getSpan(start));
      }
      return char;
    }
  }

  private _consumeRawText(
      decodeEntities: boolean, firstCharOfEnd: number, attemptEndRest: () => boolean): Token {
    let tagCloseStart: ParseLocation;
    const textStart = this._getLocation();
    this._beginToken(decodeEntities ? TokenType.ESCAPABLE_RAW_TEXT : TokenType.RAW_TEXT, textStart);
    const parts: string[] = [];
    while (true) {
      tagCloseStart = this._getLocation();
      if (this._attemptCharCode(firstCharOfEnd) && attemptEndRest()) {
        break;
      }
      if (this._index > tagCloseStart.offset) {
        // add the characters consumed by the previous if statement to the output
        parts.push(this._input.substring(tagCloseStart.offset, this._index));
      }
      while (this._peek !== firstCharOfEnd) {
        parts.push(this._readChar(decodeEntities));
      }
    }
    return this._endToken([this._processCarriageReturns(parts.join(''))], tagCloseStart);
  }

  private _consumeComment(start: ParseLocation) {
    this._beginToken(TokenType.COMMENT_START, start);
    this._requireCharCode(chars.$MINUS);
    this._endToken([]);
    const textToken = this._consumeRawText(false, chars.$MINUS, () => this._attemptStr('->'));
    this._beginToken(TokenType.COMMENT_END, textToken.sourceSpan.end);
    this._endToken([]);
  }

  private _consumeCdata(start: ParseLocation) {
    this._beginToken(TokenType.CDATA_START, start);
    this._requireStr('CDATA[');
    this._endToken([]);
    const textToken = this._consumeRawText(false, chars.$RBRACKET, () => this._attemptStr(']>'));
    this._beginToken(TokenType.CDATA_END, textToken.sourceSpan.end);
    this._endToken([]);
  }

  private _consumeDocType(start: ParseLocation) {
    this._beginToken(TokenType.DOC_TYPE, start);
    this._attemptUntilChar(chars.$GT);
    this._advance();
    this._endToken([this._input.substring(start.offset + 2, this._index - 1)]);
  }

  private _consumePrefixAndName(): string[] {
    const nameOrPrefixStart = this._index;
    let prefix: string = null !;
    while (this._peek !== chars.$COLON && !isPrefixEnd(this._peek)) {
      this._advance();
    }
    let nameStart: number;
    if (this._peek === chars.$COLON) {
      this._advance();
      prefix = this._input.substring(nameOrPrefixStart, this._index - 1);
      nameStart = this._index;
    } else {
      nameStart = nameOrPrefixStart;
    }
    this._requireCharCodeUntilFn(isNameEnd, this._index === nameStart ? 1 : 0);
    const name = this._input.substring(nameStart, this._index);
    return [prefix, name];
  }

  private _consumeTagOpen(start: ParseLocation) {
    const savedPos = this._savePosition();
    let tagName: string;
    let lowercaseTagName: string;
    try {
      if (!chars.isAsciiLetter(this._peek)) {
        throw this._createError(_unexpectedCharacterErrorMsg(this._peek), this._getSpan());
      }
      const nameStart = this._index;
      this._consumeTagOpenStart(start);
      tagName = this._input.substring(nameStart, this._index);
      lowercaseTagName = tagName.toLowerCase();
      this._attemptCharCodeUntilFn(isNotWhitespace);
      while (this._peek !== chars.$SLASH && this._peek !== chars.$GT) {
        this._consumeAttributeName();
        this._attemptCharCodeUntilFn(isNotWhitespace);
        if (this._attemptCharCode(chars.$EQ)) {
          this._attemptCharCodeUntilFn(isNotWhitespace);
          this._consumeAttributeValue();
        }
        this._attemptCharCodeUntilFn(isNotWhitespace);
      }
      this._consumeTagOpenEnd();
    } catch (e) {
      if (e instanceof _ControlFlowError) {
        // When the start tag is invalid, assume we want a "<"
        this._restorePosition(savedPos);
        // Back to back text tokens are merged at the end
        this._beginToken(TokenType.TEXT, start);
        this._endToken(['<']);
        return;
      }

      throw e;
    }

    const contentTokenType = this._getTagDefinition(tagName).contentType;

    if (contentTokenType === TagContentType.RAW_TEXT) {
      this._consumeRawTextWithTagClose(lowercaseTagName, false);
    } else if (contentTokenType === TagContentType.ESCAPABLE_RAW_TEXT) {
      this._consumeRawTextWithTagClose(lowercaseTagName, true);
    }
  }

  private _consumeRawTextWithTagClose(lowercaseTagName: string, decodeEntities: boolean) {
    const textToken = this._consumeRawText(decodeEntities, chars.$LT, () => {
      if (!this._attemptCharCode(chars.$SLASH)) return false;
      this._attemptCharCodeUntilFn(isNotWhitespace);
      if (!this._attemptStrCaseInsensitive(lowercaseTagName)) return false;
      this._attemptCharCodeUntilFn(isNotWhitespace);
      return this._attemptCharCode(chars.$GT);
    });
    this._beginToken(TokenType.TAG_CLOSE, textToken.sourceSpan.end);
    this._endToken([null !, lowercaseTagName]);
  }

  private _consumeTagOpenStart(start: ParseLocation) {
    this._beginToken(TokenType.TAG_OPEN_START, start);
    const parts = this._consumePrefixAndName();
    this._endToken(parts);
  }

  private _consumeAttributeName() {
    this._beginToken(TokenType.ATTR_NAME);
    const prefixAndName = this._consumePrefixAndName();
    this._endToken(prefixAndName);
  }

  private _consumeAttributeValue() {
    this._beginToken(TokenType.ATTR_VALUE);
    let value: string;
    if (this._peek === chars.$SQ || this._peek === chars.$DQ) {
      const quoteChar = this._peek;
      this._advance();
      const parts: string[] = [];
      while (this._peek !== quoteChar) {
        parts.push(this._readChar(true));
      }
      value = parts.join('');
      this._advance();
    } else {
      const valueStart = this._index;
      this._requireCharCodeUntilFn(isNameEnd, 1);
      value = this._input.substring(valueStart, this._index);
    }
    this._endToken([this._processCarriageReturns(value)]);
  }

  private _consumeTagOpenEnd() {
    const tokenType =
        this._attemptCharCode(chars.$SLASH) ? TokenType.TAG_OPEN_END_VOID : TokenType.TAG_OPEN_END;
    this._beginToken(tokenType);
    this._requireCharCode(chars.$GT);
    this._endToken([]);
  }

  private _consumeTagClose(start: ParseLocation) {
    this._beginToken(TokenType.TAG_CLOSE, start);
    this._attemptCharCodeUntilFn(isNotWhitespace);
    const prefixAndName = this._consumePrefixAndName();
    this._attemptCharCodeUntilFn(isNotWhitespace);
    this._requireCharCode(chars.$GT);
    this._endToken(prefixAndName);
  }

  private _consumeExpansionFormStart() {
    this._beginToken(TokenType.EXPANSION_FORM_START, this._getLocation());
    this._requireCharCode(chars.$LBRACE);
    this._endToken([]);

    this._expansionCaseStack.push(TokenType.EXPANSION_FORM_START);

    this._beginToken(TokenType.RAW_TEXT, this._getLocation());
    const condition = this._readUntil(chars.$COMMA);
    this._endToken([condition], this._getLocation());
    this._requireCharCode(chars.$COMMA);
    this._attemptCharCodeUntilFn(isNotWhitespace);

    this._beginToken(TokenType.RAW_TEXT, this._getLocation());
    const type = this._readUntil(chars.$COMMA);
    this._endToken([type], this._getLocation());
    this._requireCharCode(chars.$COMMA);
    this._attemptCharCodeUntilFn(isNotWhitespace);
  }

  private _consumeExpansionCaseStart() {
    this._beginToken(TokenType.EXPANSION_CASE_VALUE, this._getLocation());
    const value = this._readUntil(chars.$LBRACE).trim();
    this._endToken([value], this._getLocation());
    this._attemptCharCodeUntilFn(isNotWhitespace);

    this._beginToken(TokenType.EXPANSION_CASE_EXP_START, this._getLocation());
    this._requireCharCode(chars.$LBRACE);
    this._endToken([], this._getLocation());
    this._attemptCharCodeUntilFn(isNotWhitespace);

    this._expansionCaseStack.push(TokenType.EXPANSION_CASE_EXP_START);
  }

  private _consumeExpansionCaseEnd() {
    this._beginToken(TokenType.EXPANSION_CASE_EXP_END, this._getLocation());
    this._requireCharCode(chars.$RBRACE);
    this._endToken([], this._getLocation());
    this._attemptCharCodeUntilFn(isNotWhitespace);

    this._expansionCaseStack.pop();
  }

  private _consumeExpansionFormEnd() {
    this._beginToken(TokenType.EXPANSION_FORM_END, this._getLocation());
    this._requireCharCode(chars.$RBRACE);
    this._endToken([]);

    this._expansionCaseStack.pop();
  }

  private _consumeText() {
    const start = this._getLocation();
    this._beginToken(TokenType.TEXT, start);
    const parts: string[] = [];

    do {
      if (this._interpolationConfig && this._attemptStr(this._interpolationConfig.start)) {
        parts.push(this._interpolationConfig.start);
        this._inInterpolation = true;
      } else if (
          this._interpolationConfig && this._inInterpolation &&
          this._attemptStr(this._interpolationConfig.end)) {
        parts.push(this._interpolationConfig.end);
        this._inInterpolation = false;
      } else {
        parts.push(this._readChar(true));
      }
    } while (!this._isTextEnd());

    this._endToken([this._processCarriageReturns(parts.join(''))]);
  }

  private _isTextEnd(): boolean {
    if (this._peek === chars.$LT || this._peek === chars.$EOF) {
      return true;
    }

    if (this._tokenizeIcu && !this._inInterpolation) {
      if (isExpansionFormStart(this._input, this._index, this._interpolationConfig)) {
        // start of an expansion form
        return true;
      }

      if (this._peek === chars.$RBRACE && this._isInExpansionCase()) {
        // end of and expansion case
        return true;
      }
    }

    return false;
  }

  private _savePosition(): [number, number, number, number, number] {
    return [this._peek, this._index, this._column, this._line, this.tokens.length];
  }

  private _readUntil(char: number): string {
    const start = this._index;
    this._attemptUntilChar(char);
    return this._input.substring(start, this._index);
  }

  private _restorePosition(position: [number, number, number, number, number]): void {
    this._peek = position[0];
    this._index = position[1];
    this._column = position[2];
    this._line = position[3];
    const nbTokens = position[4];
    if (nbTokens < this.tokens.length) {
      // remove any extra tokens
      this.tokens = this.tokens.slice(0, nbTokens);
    }
  }

  private _isInExpansionCase(): boolean {
    return this._expansionCaseStack.length > 0 &&
        this._expansionCaseStack[this._expansionCaseStack.length - 1] ===
        TokenType.EXPANSION_CASE_EXP_START;
  }

  private _isInExpansionForm(): boolean {
    return this._expansionCaseStack.length > 0 &&
        this._expansionCaseStack[this._expansionCaseStack.length - 1] ===
        TokenType.EXPANSION_FORM_START;
  }
}

function isNotWhitespace(code: number): boolean {
  return !chars.isWhitespace(code) || code === chars.$EOF;
}

function isNameEnd(code: number): boolean {
  return chars.isWhitespace(code) || code === chars.$GT || code === chars.$SLASH ||
      code === chars.$SQ || code === chars.$DQ || code === chars.$EQ;
}

function isPrefixEnd(code: number): boolean {
  return (code < chars.$a || chars.$z < code) && (code < chars.$A || chars.$Z < code) &&
      (code < chars.$0 || code > chars.$9);
}

function isDigitEntityEnd(code: number): boolean {
  return code == chars.$SEMICOLON || code == chars.$EOF || !chars.isAsciiHexDigit(code);
}

function isNamedEntityEnd(code: number): boolean {
  return code == chars.$SEMICOLON || code == chars.$EOF || !chars.isAsciiLetter(code);
}

function isExpansionFormStart(
    input: string, offset: number, interpolationConfig: InterpolationConfig): boolean {
  const isInterpolationStart =
      interpolationConfig ? input.indexOf(interpolationConfig.start, offset) == offset : false;

  return input.charCodeAt(offset) == chars.$LBRACE && !isInterpolationStart;
}

function isExpansionCaseStart(peek: number): boolean {
  return peek === chars.$EQ || chars.isAsciiLetter(peek) || chars.isDigit(peek);
}

function compareCharCodeCaseInsensitive(code1: number, code2: number): boolean {
  return toUpperCaseCharCode(code1) == toUpperCaseCharCode(code2);
}

function toUpperCaseCharCode(code: number): number {
  return code >= chars.$a && code <= chars.$z ? code - chars.$a + chars.$A : code;
}

function mergeTextTokens(srcTokens: Token[]): Token[] {
  const dstTokens: Token[] = [];
  let lastDstToken: Token|undefined = undefined;
  for (let i = 0; i < srcTokens.length; i++) {
    const token = srcTokens[i];
    if (lastDstToken && lastDstToken.type == TokenType.TEXT && token.type == TokenType.TEXT) {
      lastDstToken.parts[0] += token.parts[0];
      lastDstToken.sourceSpan.end = token.sourceSpan.end;
    } else {
      lastDstToken = token;
      dstTokens.push(lastDstToken);
    }
  }

  return dstTokens;
}
