/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as chars from '../chars';
import {ParseError, ParseLocation, ParseSourceFile, ParseSourceSpan} from '../parse_util';
import {DEFAULT_INTERPOLATION_CONFIG} from './defaults';
import {NAMED_ENTITIES} from './entities';
import {TagContentType} from './tags';
export class TokenizeResult {
  constructor(tokens, errors, nonNormalizedIcuExpressions) {
    this.tokens = tokens;
    this.errors = errors;
    this.nonNormalizedIcuExpressions = nonNormalizedIcuExpressions;
  }
}
export function tokenize(source, url, getTagDefinition, options = {}) {
  const tokenizer = new _Tokenizer(new ParseSourceFile(source, url), getTagDefinition, options);
  tokenizer.tokenize();
  return new TokenizeResult(
    mergeTextTokens(tokenizer.tokens),
    tokenizer.errors,
    tokenizer.nonNormalizedIcuExpressions,
  );
}
const _CR_OR_CRLF_REGEXP = /\r\n?/g;
function _unexpectedCharacterErrorMsg(charCode) {
  const char = charCode === chars.$EOF ? 'EOF' : String.fromCharCode(charCode);
  return `Unexpected character "${char}"`;
}
function _unknownEntityErrorMsg(entitySrc) {
  return `Unknown entity "${entitySrc}" - use the "&#<decimal>;" or  "&#x<hex>;" syntax`;
}
function _unparsableEntityErrorMsg(type, entityStr) {
  return `Unable to parse entity "${entityStr}" - ${type} character reference entities must end with ";"`;
}
var CharacterReferenceType;
(function (CharacterReferenceType) {
  CharacterReferenceType['HEX'] = 'hexadecimal';
  CharacterReferenceType['DEC'] = 'decimal';
})(CharacterReferenceType || (CharacterReferenceType = {}));
const SUPPORTED_BLOCKS = [
  '@if',
  '@else', // Covers `@else if` as well
  '@for',
  '@switch',
  '@case',
  '@default',
  '@empty',
  '@defer',
  '@placeholder',
  '@loading',
  '@error',
];
// See https://www.w3.org/TR/html51/syntax.html#writing-html-documents
class _Tokenizer {
  /**
   * @param _file The html source file being tokenized.
   * @param _getTagDefinition A function that will retrieve a tag definition for a given tag name.
   * @param options Configuration of the tokenization.
   */
  constructor(_file, _getTagDefinition, options) {
    this._getTagDefinition = _getTagDefinition;
    this._currentTokenStart = null;
    this._currentTokenType = null;
    this._expansionCaseStack = [];
    this._openDirectiveCount = 0;
    this._inInterpolation = false;
    this.tokens = [];
    this.errors = [];
    this.nonNormalizedIcuExpressions = [];
    this._tokenizeIcu = options.tokenizeExpansionForms || false;
    this._interpolationConfig = options.interpolationConfig || DEFAULT_INTERPOLATION_CONFIG;
    this._leadingTriviaCodePoints =
      options.leadingTriviaChars && options.leadingTriviaChars.map((c) => c.codePointAt(0) || 0);
    const range = options.range || {
      endPos: _file.content.length,
      startPos: 0,
      startLine: 0,
      startCol: 0,
    };
    this._cursor = options.escapedString
      ? new EscapedCharacterCursor(_file, range)
      : new PlainCharacterCursor(_file, range);
    this._preserveLineEndings = options.preserveLineEndings || false;
    this._i18nNormalizeLineEndingsInICUs = options.i18nNormalizeLineEndingsInICUs || false;
    this._tokenizeBlocks = options.tokenizeBlocks ?? true;
    this._tokenizeLet = options.tokenizeLet ?? true;
    this._selectorlessEnabled = options.selectorlessEnabled ?? false;
    try {
      this._cursor.init();
    } catch (e) {
      this.handleError(e);
    }
  }
  _processCarriageReturns(content) {
    if (this._preserveLineEndings) {
      return content;
    }
    // https://www.w3.org/TR/html51/syntax.html#preprocessing-the-input-stream
    // In order to keep the original position in the source, we can not
    // pre-process it.
    // Instead CRs are processed right before instantiating the tokens.
    return content.replace(_CR_OR_CRLF_REGEXP, '\n');
  }
  tokenize() {
    while (this._cursor.peek() !== chars.$EOF) {
      const start = this._cursor.clone();
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
        } else if (
          this._tokenizeLet &&
          // Use `peek` instead of `attempCharCode` since we
          // don't want to advance in case it's not `@let`.
          this._cursor.peek() === chars.$AT &&
          !this._inInterpolation &&
          this._isLetStart()
        ) {
          this._consumeLetDeclaration(start);
        } else if (this._tokenizeBlocks && this._isBlockStart()) {
          this._consumeBlockStart(start);
        } else if (
          this._tokenizeBlocks &&
          !this._inInterpolation &&
          !this._isInExpansionCase() &&
          !this._isInExpansionForm() &&
          this._attemptCharCode(chars.$RBRACE)
        ) {
          this._consumeBlockEnd(start);
        } else if (!(this._tokenizeIcu && this._tokenizeExpansionForm())) {
          // In (possibly interpolated) text the end of the text is given by `isTextEnd()`, while
          // the premature end of an interpolation is given by the start of a new HTML element.
          this._consumeWithInterpolation(
            5 /* TokenType.TEXT */,
            8 /* TokenType.INTERPOLATION */,
            () => this._isTextEnd(),
            () => this._isTagStart(),
          );
        }
      } catch (e) {
        this.handleError(e);
      }
    }
    this._beginToken(41 /* TokenType.EOF */);
    this._endToken([]);
  }
  _getBlockName() {
    // This allows us to capture up something like `@else if`, but not `@ if`.
    let spacesInNameAllowed = false;
    const nameCursor = this._cursor.clone();
    this._attemptCharCodeUntilFn((code) => {
      if (chars.isWhitespace(code)) {
        return !spacesInNameAllowed;
      }
      if (isBlockNameChar(code)) {
        spacesInNameAllowed = true;
        return false;
      }
      return true;
    });
    return this._cursor.getChars(nameCursor).trim();
  }
  _consumeBlockStart(start) {
    this._requireCharCode(chars.$AT);
    this._beginToken(24 /* TokenType.BLOCK_OPEN_START */, start);
    const startToken = this._endToken([this._getBlockName()]);
    if (this._cursor.peek() === chars.$LPAREN) {
      // Advance past the opening paren.
      this._cursor.advance();
      // Capture the parameters.
      this._consumeBlockParameters();
      // Allow spaces before the closing paren.
      this._attemptCharCodeUntilFn(isNotWhitespace);
      if (this._attemptCharCode(chars.$RPAREN)) {
        // Allow spaces after the paren.
        this._attemptCharCodeUntilFn(isNotWhitespace);
      } else {
        startToken.type = 28 /* TokenType.INCOMPLETE_BLOCK_OPEN */;
        return;
      }
    }
    if (this._attemptCharCode(chars.$LBRACE)) {
      this._beginToken(25 /* TokenType.BLOCK_OPEN_END */);
      this._endToken([]);
    } else {
      startToken.type = 28 /* TokenType.INCOMPLETE_BLOCK_OPEN */;
    }
  }
  _consumeBlockEnd(start) {
    this._beginToken(26 /* TokenType.BLOCK_CLOSE */, start);
    this._endToken([]);
  }
  _consumeBlockParameters() {
    // Trim the whitespace until the first parameter.
    this._attemptCharCodeUntilFn(isBlockParameterChar);
    while (this._cursor.peek() !== chars.$RPAREN && this._cursor.peek() !== chars.$EOF) {
      this._beginToken(27 /* TokenType.BLOCK_PARAMETER */);
      const start = this._cursor.clone();
      let inQuote = null;
      let openParens = 0;
      // Consume the parameter until the next semicolon or brace.
      // Note that we skip over semicolons/braces inside of strings.
      while (
        (this._cursor.peek() !== chars.$SEMICOLON && this._cursor.peek() !== chars.$EOF) ||
        inQuote !== null
      ) {
        const char = this._cursor.peek();
        // Skip to the next character if it was escaped.
        if (char === chars.$BACKSLASH) {
          this._cursor.advance();
        } else if (char === inQuote) {
          inQuote = null;
        } else if (inQuote === null && chars.isQuote(char)) {
          inQuote = char;
        } else if (char === chars.$LPAREN && inQuote === null) {
          openParens++;
        } else if (char === chars.$RPAREN && inQuote === null) {
          if (openParens === 0) {
            break;
          } else if (openParens > 0) {
            openParens--;
          }
        }
        this._cursor.advance();
      }
      this._endToken([this._cursor.getChars(start)]);
      // Skip to the next parameter.
      this._attemptCharCodeUntilFn(isBlockParameterChar);
    }
  }
  _consumeLetDeclaration(start) {
    this._requireStr('@let');
    this._beginToken(29 /* TokenType.LET_START */, start);
    // Require at least one white space after the `@let`.
    if (chars.isWhitespace(this._cursor.peek())) {
      this._attemptCharCodeUntilFn(isNotWhitespace);
    } else {
      const token = this._endToken([this._cursor.getChars(start)]);
      token.type = 32 /* TokenType.INCOMPLETE_LET */;
      return;
    }
    const startToken = this._endToken([this._getLetDeclarationName()]);
    // Skip over white space before the equals character.
    this._attemptCharCodeUntilFn(isNotWhitespace);
    // Expect an equals sign.
    if (!this._attemptCharCode(chars.$EQ)) {
      startToken.type = 32 /* TokenType.INCOMPLETE_LET */;
      return;
    }
    // Skip spaces after the equals.
    this._attemptCharCodeUntilFn((code) => isNotWhitespace(code) && !chars.isNewLine(code));
    this._consumeLetDeclarationValue();
    // Terminate the `@let` with a semicolon.
    const endChar = this._cursor.peek();
    if (endChar === chars.$SEMICOLON) {
      this._beginToken(31 /* TokenType.LET_END */);
      this._endToken([]);
      this._cursor.advance();
    } else {
      startToken.type = 32 /* TokenType.INCOMPLETE_LET */;
      startToken.sourceSpan = this._cursor.getSpan(start);
    }
  }
  _getLetDeclarationName() {
    const nameCursor = this._cursor.clone();
    let allowDigit = false;
    this._attemptCharCodeUntilFn((code) => {
      if (
        chars.isAsciiLetter(code) ||
        code === chars.$$ ||
        code === chars.$_ ||
        // `@let` names can't start with a digit, but digits are valid anywhere else in the name.
        (allowDigit && chars.isDigit(code))
      ) {
        allowDigit = true;
        return false;
      }
      return true;
    });
    return this._cursor.getChars(nameCursor).trim();
  }
  _consumeLetDeclarationValue() {
    const start = this._cursor.clone();
    this._beginToken(30 /* TokenType.LET_VALUE */, start);
    while (this._cursor.peek() !== chars.$EOF) {
      const char = this._cursor.peek();
      // `@let` declarations terminate with a semicolon.
      if (char === chars.$SEMICOLON) {
        break;
      }
      // If we hit a quote, skip over its content since we don't care what's inside.
      if (chars.isQuote(char)) {
        this._cursor.advance();
        this._attemptCharCodeUntilFn((inner) => {
          if (inner === chars.$BACKSLASH) {
            this._cursor.advance();
            return false;
          }
          return inner === char;
        });
      }
      this._cursor.advance();
    }
    this._endToken([this._cursor.getChars(start)]);
  }
  /**
   * @returns whether an ICU token has been created
   * @internal
   */
  _tokenizeExpansionForm() {
    if (this.isExpansionFormStart()) {
      this._consumeExpansionFormStart();
      return true;
    }
    if (isExpansionCaseStart(this._cursor.peek()) && this._isInExpansionForm()) {
      this._consumeExpansionCaseStart();
      return true;
    }
    if (this._cursor.peek() === chars.$RBRACE) {
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
  _beginToken(type, start = this._cursor.clone()) {
    this._currentTokenStart = start;
    this._currentTokenType = type;
  }
  _endToken(parts, end) {
    if (this._currentTokenStart === null) {
      throw new ParseError(
        this._cursor.getSpan(end),
        'Programming error - attempted to end a token when there was no start to the token',
      );
    }
    if (this._currentTokenType === null) {
      throw new ParseError(
        this._cursor.getSpan(this._currentTokenStart),
        'Programming error - attempted to end a token which has no token type',
      );
    }
    const token = {
      type: this._currentTokenType,
      parts,
      sourceSpan: (end ?? this._cursor).getSpan(
        this._currentTokenStart,
        this._leadingTriviaCodePoints,
      ),
    };
    this.tokens.push(token);
    this._currentTokenStart = null;
    this._currentTokenType = null;
    return token;
  }
  _createError(msg, span) {
    if (this._isInExpansionForm()) {
      msg += ` (Do you have an unescaped "{" in your template? Use "{{ '{' }}") to escape it.)`;
    }
    const error = new ParseError(span, msg);
    this._currentTokenStart = null;
    this._currentTokenType = null;
    return error;
  }
  handleError(e) {
    if (e instanceof CursorError) {
      e = this._createError(e.msg, this._cursor.getSpan(e.cursor));
    }
    if (e instanceof ParseError) {
      this.errors.push(e);
    } else {
      throw e;
    }
  }
  _attemptCharCode(charCode) {
    if (this._cursor.peek() === charCode) {
      this._cursor.advance();
      return true;
    }
    return false;
  }
  _attemptCharCodeCaseInsensitive(charCode) {
    if (compareCharCodeCaseInsensitive(this._cursor.peek(), charCode)) {
      this._cursor.advance();
      return true;
    }
    return false;
  }
  _requireCharCode(charCode) {
    const location = this._cursor.clone();
    if (!this._attemptCharCode(charCode)) {
      throw this._createError(
        _unexpectedCharacterErrorMsg(this._cursor.peek()),
        this._cursor.getSpan(location),
      );
    }
  }
  _attemptStr(chars) {
    const len = chars.length;
    if (this._cursor.charsLeft() < len) {
      return false;
    }
    const initialPosition = this._cursor.clone();
    for (let i = 0; i < len; i++) {
      if (!this._attemptCharCode(chars.charCodeAt(i))) {
        // If attempting to parse the string fails, we want to reset the parser
        // to where it was before the attempt
        this._cursor = initialPosition;
        return false;
      }
    }
    return true;
  }
  _attemptStrCaseInsensitive(chars) {
    for (let i = 0; i < chars.length; i++) {
      if (!this._attemptCharCodeCaseInsensitive(chars.charCodeAt(i))) {
        return false;
      }
    }
    return true;
  }
  _requireStr(chars) {
    const location = this._cursor.clone();
    if (!this._attemptStr(chars)) {
      throw this._createError(
        _unexpectedCharacterErrorMsg(this._cursor.peek()),
        this._cursor.getSpan(location),
      );
    }
  }
  _attemptCharCodeUntilFn(predicate) {
    while (!predicate(this._cursor.peek())) {
      this._cursor.advance();
    }
  }
  _requireCharCodeUntilFn(predicate, len) {
    const start = this._cursor.clone();
    this._attemptCharCodeUntilFn(predicate);
    if (this._cursor.diff(start) < len) {
      throw this._createError(
        _unexpectedCharacterErrorMsg(this._cursor.peek()),
        this._cursor.getSpan(start),
      );
    }
  }
  _attemptUntilChar(char) {
    while (this._cursor.peek() !== char) {
      this._cursor.advance();
    }
  }
  _readChar() {
    // Don't rely upon reading directly from `_input` as the actual char value
    // may have been generated from an escape sequence.
    const char = String.fromCodePoint(this._cursor.peek());
    this._cursor.advance();
    return char;
  }
  _peekStr(chars) {
    const len = chars.length;
    if (this._cursor.charsLeft() < len) {
      return false;
    }
    const cursor = this._cursor.clone();
    for (let i = 0; i < len; i++) {
      if (cursor.peek() !== chars.charCodeAt(i)) {
        return false;
      }
      cursor.advance();
    }
    return true;
  }
  _isBlockStart() {
    return (
      this._cursor.peek() === chars.$AT &&
      SUPPORTED_BLOCKS.some((blockName) => this._peekStr(blockName))
    );
  }
  _isLetStart() {
    return this._cursor.peek() === chars.$AT && this._peekStr('@let');
  }
  _consumeEntity(textTokenType) {
    this._beginToken(9 /* TokenType.ENCODED_ENTITY */);
    const start = this._cursor.clone();
    this._cursor.advance();
    if (this._attemptCharCode(chars.$HASH)) {
      const isHex = this._attemptCharCode(chars.$x) || this._attemptCharCode(chars.$X);
      const codeStart = this._cursor.clone();
      this._attemptCharCodeUntilFn(isDigitEntityEnd);
      if (this._cursor.peek() != chars.$SEMICOLON) {
        // Advance cursor to include the peeked character in the string provided to the error
        // message.
        this._cursor.advance();
        const entityType = isHex ? CharacterReferenceType.HEX : CharacterReferenceType.DEC;
        throw this._createError(
          _unparsableEntityErrorMsg(entityType, this._cursor.getChars(start)),
          this._cursor.getSpan(),
        );
      }
      const strNum = this._cursor.getChars(codeStart);
      this._cursor.advance();
      try {
        const charCode = parseInt(strNum, isHex ? 16 : 10);
        this._endToken([String.fromCharCode(charCode), this._cursor.getChars(start)]);
      } catch {
        throw this._createError(
          _unknownEntityErrorMsg(this._cursor.getChars(start)),
          this._cursor.getSpan(),
        );
      }
    } else {
      const nameStart = this._cursor.clone();
      this._attemptCharCodeUntilFn(isNamedEntityEnd);
      if (this._cursor.peek() != chars.$SEMICOLON) {
        // No semicolon was found so abort the encoded entity token that was in progress, and treat
        // this as a text token
        this._beginToken(textTokenType, start);
        this._cursor = nameStart;
        this._endToken(['&']);
      } else {
        const name = this._cursor.getChars(nameStart);
        this._cursor.advance();
        const char = NAMED_ENTITIES.hasOwnProperty(name) && NAMED_ENTITIES[name];
        if (!char) {
          throw this._createError(_unknownEntityErrorMsg(name), this._cursor.getSpan(start));
        }
        this._endToken([char, `&${name};`]);
      }
    }
  }
  _consumeRawText(consumeEntities, endMarkerPredicate) {
    this._beginToken(
      consumeEntities ? 6 /* TokenType.ESCAPABLE_RAW_TEXT */ : 7 /* TokenType.RAW_TEXT */,
    );
    const parts = [];
    while (true) {
      const tagCloseStart = this._cursor.clone();
      const foundEndMarker = endMarkerPredicate();
      this._cursor = tagCloseStart;
      if (foundEndMarker) {
        break;
      }
      if (consumeEntities && this._cursor.peek() === chars.$AMPERSAND) {
        this._endToken([this._processCarriageReturns(parts.join(''))]);
        parts.length = 0;
        this._consumeEntity(6 /* TokenType.ESCAPABLE_RAW_TEXT */);
        this._beginToken(6 /* TokenType.ESCAPABLE_RAW_TEXT */);
      } else {
        parts.push(this._readChar());
      }
    }
    this._endToken([this._processCarriageReturns(parts.join(''))]);
  }
  _consumeComment(start) {
    this._beginToken(10 /* TokenType.COMMENT_START */, start);
    this._requireCharCode(chars.$MINUS);
    this._endToken([]);
    this._consumeRawText(false, () => this._attemptStr('-->'));
    this._beginToken(11 /* TokenType.COMMENT_END */);
    this._requireStr('-->');
    this._endToken([]);
  }
  _consumeCdata(start) {
    this._beginToken(12 /* TokenType.CDATA_START */, start);
    this._requireStr('CDATA[');
    this._endToken([]);
    this._consumeRawText(false, () => this._attemptStr(']]>'));
    this._beginToken(13 /* TokenType.CDATA_END */);
    this._requireStr(']]>');
    this._endToken([]);
  }
  _consumeDocType(start) {
    this._beginToken(18 /* TokenType.DOC_TYPE */, start);
    const contentStart = this._cursor.clone();
    this._attemptUntilChar(chars.$GT);
    const content = this._cursor.getChars(contentStart);
    this._cursor.advance();
    this._endToken([content]);
  }
  _consumePrefixAndName(endPredicate) {
    const nameOrPrefixStart = this._cursor.clone();
    let prefix = '';
    while (this._cursor.peek() !== chars.$COLON && !isPrefixEnd(this._cursor.peek())) {
      this._cursor.advance();
    }
    let nameStart;
    if (this._cursor.peek() === chars.$COLON) {
      prefix = this._cursor.getChars(nameOrPrefixStart);
      this._cursor.advance();
      nameStart = this._cursor.clone();
    } else {
      nameStart = nameOrPrefixStart;
    }
    this._requireCharCodeUntilFn(endPredicate, prefix === '' ? 0 : 1);
    const name = this._cursor.getChars(nameStart);
    return [prefix, name];
  }
  _consumeTagOpen(start) {
    let tagName;
    let prefix;
    let closingTagName;
    let openToken;
    try {
      if (this._selectorlessEnabled && isSelectorlessNameStart(this._cursor.peek())) {
        openToken = this._consumeComponentOpenStart(start);
        [closingTagName, prefix, tagName] = openToken.parts;
        if (prefix) {
          closingTagName += `:${prefix}`;
        }
        if (tagName) {
          closingTagName += `:${tagName}`;
        }
        this._attemptCharCodeUntilFn(isNotWhitespace);
      } else {
        if (!chars.isAsciiLetter(this._cursor.peek())) {
          throw this._createError(
            _unexpectedCharacterErrorMsg(this._cursor.peek()),
            this._cursor.getSpan(start),
          );
        }
        openToken = this._consumeTagOpenStart(start);
        prefix = openToken.parts[0];
        tagName = closingTagName = openToken.parts[1];
        this._attemptCharCodeUntilFn(isNotWhitespace);
      }
      while (!isAttributeTerminator(this._cursor.peek())) {
        if (this._selectorlessEnabled && this._cursor.peek() === chars.$AT) {
          const start = this._cursor.clone();
          const nameStart = start.clone();
          nameStart.advance();
          if (isSelectorlessNameStart(nameStart.peek())) {
            this._consumeDirective(start, nameStart);
          }
        } else {
          this._consumeAttribute();
        }
      }
      if (openToken.type === 33 /* TokenType.COMPONENT_OPEN_START */) {
        this._consumeComponentOpenEnd();
      } else {
        this._consumeTagOpenEnd();
      }
    } catch (e) {
      if (e instanceof ParseError) {
        if (openToken) {
          // We errored before we could close the opening tag, so it is incomplete.
          openToken.type =
            openToken.type === 33 /* TokenType.COMPONENT_OPEN_START */
              ? 37 /* TokenType.INCOMPLETE_COMPONENT_OPEN */
              : 4 /* TokenType.INCOMPLETE_TAG_OPEN */;
        } else {
          // When the start tag is invalid, assume we want a "<" as text.
          // Back to back text tokens are merged at the end.
          this._beginToken(5 /* TokenType.TEXT */, start);
          this._endToken(['<']);
        }
        return;
      }
      throw e;
    }
    const contentTokenType = this._getTagDefinition(tagName).getContentType(prefix);
    if (contentTokenType === TagContentType.RAW_TEXT) {
      this._consumeRawTextWithTagClose(openToken, closingTagName, false);
    } else if (contentTokenType === TagContentType.ESCAPABLE_RAW_TEXT) {
      this._consumeRawTextWithTagClose(openToken, closingTagName, true);
    }
  }
  _consumeRawTextWithTagClose(openToken, tagName, consumeEntities) {
    this._consumeRawText(consumeEntities, () => {
      if (!this._attemptCharCode(chars.$LT)) return false;
      if (!this._attemptCharCode(chars.$SLASH)) return false;
      this._attemptCharCodeUntilFn(isNotWhitespace);
      if (!this._attemptStrCaseInsensitive(tagName)) return false;
      this._attemptCharCodeUntilFn(isNotWhitespace);
      return this._attemptCharCode(chars.$GT);
    });
    this._beginToken(
      openToken.type === 33 /* TokenType.COMPONENT_OPEN_START */
        ? 36 /* TokenType.COMPONENT_CLOSE */
        : 3 /* TokenType.TAG_CLOSE */,
    );
    this._requireCharCodeUntilFn((code) => code === chars.$GT, 3);
    this._cursor.advance(); // Consume the `>`
    this._endToken(openToken.parts);
  }
  _consumeTagOpenStart(start) {
    this._beginToken(0 /* TokenType.TAG_OPEN_START */, start);
    const parts = this._consumePrefixAndName(isNameEnd);
    return this._endToken(parts);
  }
  _consumeComponentOpenStart(start) {
    this._beginToken(33 /* TokenType.COMPONENT_OPEN_START */, start);
    const parts = this._consumeComponentName();
    return this._endToken(parts);
  }
  _consumeComponentName() {
    const nameStart = this._cursor.clone();
    while (isSelectorlessNameChar(this._cursor.peek())) {
      this._cursor.advance();
    }
    const name = this._cursor.getChars(nameStart);
    let prefix = '';
    let tagName = '';
    if (this._cursor.peek() === chars.$COLON) {
      this._cursor.advance();
      [prefix, tagName] = this._consumePrefixAndName(isNameEnd);
    }
    return [name, prefix, tagName];
  }
  _consumeAttribute() {
    this._consumeAttributeName();
    this._attemptCharCodeUntilFn(isNotWhitespace);
    if (this._attemptCharCode(chars.$EQ)) {
      this._attemptCharCodeUntilFn(isNotWhitespace);
      this._consumeAttributeValue();
    }
    this._attemptCharCodeUntilFn(isNotWhitespace);
  }
  _consumeAttributeName() {
    const attrNameStart = this._cursor.peek();
    if (attrNameStart === chars.$SQ || attrNameStart === chars.$DQ) {
      throw this._createError(_unexpectedCharacterErrorMsg(attrNameStart), this._cursor.getSpan());
    }
    this._beginToken(14 /* TokenType.ATTR_NAME */);
    let nameEndPredicate;
    if (this._openDirectiveCount > 0) {
      // If we're parsing attributes inside of directive syntax, we have to terminate the name
      // on the first non-matching closing paren. For example, if we have `@Dir(someAttr)`,
      // `@Dir` and `(` will have already been captured as `DIRECTIVE_NAME` and `DIRECTIVE_OPEN`
      // respectively, but the `)` will get captured as a part of the name for `someAttr`
      // because normally that would be an event binding.
      let openParens = 0;
      nameEndPredicate = (code) => {
        if (this._openDirectiveCount > 0) {
          if (code === chars.$LPAREN) {
            openParens++;
          } else if (code === chars.$RPAREN) {
            if (openParens === 0) {
              return true;
            }
            openParens--;
          }
        }
        return isNameEnd(code);
      };
    } else if (attrNameStart === chars.$LBRACKET) {
      let openBrackets = 0;
      // Be more permissive for which characters are allowed inside square-bracketed attributes,
      // because they usually end up being bound as attribute values. Some third-party packages
      // like Tailwind take advantage of this.
      nameEndPredicate = (code) => {
        if (code === chars.$LBRACKET) {
          openBrackets++;
        } else if (code === chars.$RBRACKET) {
          openBrackets--;
        }
        // Only check for name-ending characters if the brackets are balanced or mismatched.
        // Also interrupt the matching on new lines.
        return openBrackets <= 0 ? isNameEnd(code) : chars.isNewLine(code);
      };
    } else {
      nameEndPredicate = isNameEnd;
    }
    const prefixAndName = this._consumePrefixAndName(nameEndPredicate);
    this._endToken(prefixAndName);
  }
  _consumeAttributeValue() {
    if (this._cursor.peek() === chars.$SQ || this._cursor.peek() === chars.$DQ) {
      const quoteChar = this._cursor.peek();
      this._consumeQuote(quoteChar);
      // In an attribute then end of the attribute value and the premature end to an interpolation
      // are both triggered by the `quoteChar`.
      const endPredicate = () => this._cursor.peek() === quoteChar;
      this._consumeWithInterpolation(
        16 /* TokenType.ATTR_VALUE_TEXT */,
        17 /* TokenType.ATTR_VALUE_INTERPOLATION */,
        endPredicate,
        endPredicate,
      );
      this._consumeQuote(quoteChar);
    } else {
      const endPredicate = () => isNameEnd(this._cursor.peek());
      this._consumeWithInterpolation(
        16 /* TokenType.ATTR_VALUE_TEXT */,
        17 /* TokenType.ATTR_VALUE_INTERPOLATION */,
        endPredicate,
        endPredicate,
      );
    }
  }
  _consumeQuote(quoteChar) {
    this._beginToken(15 /* TokenType.ATTR_QUOTE */);
    this._requireCharCode(quoteChar);
    this._endToken([String.fromCodePoint(quoteChar)]);
  }
  _consumeTagOpenEnd() {
    const tokenType = this._attemptCharCode(chars.$SLASH)
      ? 2 /* TokenType.TAG_OPEN_END_VOID */
      : 1; /* TokenType.TAG_OPEN_END */
    this._beginToken(tokenType);
    this._requireCharCode(chars.$GT);
    this._endToken([]);
  }
  _consumeComponentOpenEnd() {
    const tokenType = this._attemptCharCode(chars.$SLASH)
      ? 35 /* TokenType.COMPONENT_OPEN_END_VOID */
      : 34; /* TokenType.COMPONENT_OPEN_END */
    this._beginToken(tokenType);
    this._requireCharCode(chars.$GT);
    this._endToken([]);
  }
  _consumeTagClose(start) {
    if (this._selectorlessEnabled) {
      const clone = start.clone();
      while (clone.peek() !== chars.$GT && !isSelectorlessNameStart(clone.peek())) {
        clone.advance();
      }
      if (isSelectorlessNameStart(clone.peek())) {
        this._beginToken(36 /* TokenType.COMPONENT_CLOSE */, start);
        const parts = this._consumeComponentName();
        this._attemptCharCodeUntilFn(isNotWhitespace);
        this._requireCharCode(chars.$GT);
        this._endToken(parts);
        return;
      }
    }
    this._beginToken(3 /* TokenType.TAG_CLOSE */, start);
    this._attemptCharCodeUntilFn(isNotWhitespace);
    const prefixAndName = this._consumePrefixAndName(isNameEnd);
    this._attemptCharCodeUntilFn(isNotWhitespace);
    this._requireCharCode(chars.$GT);
    this._endToken(prefixAndName);
  }
  _consumeExpansionFormStart() {
    this._beginToken(19 /* TokenType.EXPANSION_FORM_START */);
    this._requireCharCode(chars.$LBRACE);
    this._endToken([]);
    this._expansionCaseStack.push(19 /* TokenType.EXPANSION_FORM_START */);
    this._beginToken(7 /* TokenType.RAW_TEXT */);
    const condition = this._readUntil(chars.$COMMA);
    const normalizedCondition = this._processCarriageReturns(condition);
    if (this._i18nNormalizeLineEndingsInICUs) {
      // We explicitly want to normalize line endings for this text.
      this._endToken([normalizedCondition]);
    } else {
      // We are not normalizing line endings.
      const conditionToken = this._endToken([condition]);
      if (normalizedCondition !== condition) {
        this.nonNormalizedIcuExpressions.push(conditionToken);
      }
    }
    this._requireCharCode(chars.$COMMA);
    this._attemptCharCodeUntilFn(isNotWhitespace);
    this._beginToken(7 /* TokenType.RAW_TEXT */);
    const type = this._readUntil(chars.$COMMA);
    this._endToken([type]);
    this._requireCharCode(chars.$COMMA);
    this._attemptCharCodeUntilFn(isNotWhitespace);
  }
  _consumeExpansionCaseStart() {
    this._beginToken(20 /* TokenType.EXPANSION_CASE_VALUE */);
    const value = this._readUntil(chars.$LBRACE).trim();
    this._endToken([value]);
    this._attemptCharCodeUntilFn(isNotWhitespace);
    this._beginToken(21 /* TokenType.EXPANSION_CASE_EXP_START */);
    this._requireCharCode(chars.$LBRACE);
    this._endToken([]);
    this._attemptCharCodeUntilFn(isNotWhitespace);
    this._expansionCaseStack.push(21 /* TokenType.EXPANSION_CASE_EXP_START */);
  }
  _consumeExpansionCaseEnd() {
    this._beginToken(22 /* TokenType.EXPANSION_CASE_EXP_END */);
    this._requireCharCode(chars.$RBRACE);
    this._endToken([]);
    this._attemptCharCodeUntilFn(isNotWhitespace);
    this._expansionCaseStack.pop();
  }
  _consumeExpansionFormEnd() {
    this._beginToken(23 /* TokenType.EXPANSION_FORM_END */);
    this._requireCharCode(chars.$RBRACE);
    this._endToken([]);
    this._expansionCaseStack.pop();
  }
  /**
   * Consume a string that may contain interpolation expressions.
   *
   * The first token consumed will be of `tokenType` and then there will be alternating
   * `interpolationTokenType` and `tokenType` tokens until the `endPredicate()` returns true.
   *
   * If an interpolation token ends prematurely it will have no end marker in its `parts` array.
   *
   * @param textTokenType the kind of tokens to interleave around interpolation tokens.
   * @param interpolationTokenType the kind of tokens that contain interpolation.
   * @param endPredicate a function that should return true when we should stop consuming.
   * @param endInterpolation a function that should return true if there is a premature end to an
   *     interpolation expression - i.e. before we get to the normal interpolation closing marker.
   */
  _consumeWithInterpolation(textTokenType, interpolationTokenType, endPredicate, endInterpolation) {
    this._beginToken(textTokenType);
    const parts = [];
    while (!endPredicate()) {
      const current = this._cursor.clone();
      if (this._interpolationConfig && this._attemptStr(this._interpolationConfig.start)) {
        this._endToken([this._processCarriageReturns(parts.join(''))], current);
        parts.length = 0;
        this._consumeInterpolation(interpolationTokenType, current, endInterpolation);
        this._beginToken(textTokenType);
      } else if (this._cursor.peek() === chars.$AMPERSAND) {
        this._endToken([this._processCarriageReturns(parts.join(''))]);
        parts.length = 0;
        this._consumeEntity(textTokenType);
        this._beginToken(textTokenType);
      } else {
        parts.push(this._readChar());
      }
    }
    // It is possible that an interpolation was started but not ended inside this text token.
    // Make sure that we reset the state of the lexer correctly.
    this._inInterpolation = false;
    this._endToken([this._processCarriageReturns(parts.join(''))]);
  }
  /**
   * Consume a block of text that has been interpreted as an Angular interpolation.
   *
   * @param interpolationTokenType the type of the interpolation token to generate.
   * @param interpolationStart a cursor that points to the start of this interpolation.
   * @param prematureEndPredicate a function that should return true if the next characters indicate
   *     an end to the interpolation before its normal closing marker.
   */
  _consumeInterpolation(interpolationTokenType, interpolationStart, prematureEndPredicate) {
    const parts = [];
    this._beginToken(interpolationTokenType, interpolationStart);
    parts.push(this._interpolationConfig.start);
    // Find the end of the interpolation, ignoring content inside quotes.
    const expressionStart = this._cursor.clone();
    let inQuote = null;
    let inComment = false;
    while (
      this._cursor.peek() !== chars.$EOF &&
      (prematureEndPredicate === null || !prematureEndPredicate())
    ) {
      const current = this._cursor.clone();
      if (this._isTagStart()) {
        // We are starting what looks like an HTML element in the middle of this interpolation.
        // Reset the cursor to before the `<` character and end the interpolation token.
        // (This is actually wrong but here for backward compatibility).
        this._cursor = current;
        parts.push(this._getProcessedChars(expressionStart, current));
        this._endToken(parts);
        return;
      }
      if (inQuote === null) {
        if (this._attemptStr(this._interpolationConfig.end)) {
          // We are not in a string, and we hit the end interpolation marker
          parts.push(this._getProcessedChars(expressionStart, current));
          parts.push(this._interpolationConfig.end);
          this._endToken(parts);
          return;
        } else if (this._attemptStr('//')) {
          // Once we are in a comment we ignore any quotes
          inComment = true;
        }
      }
      const char = this._cursor.peek();
      this._cursor.advance();
      if (char === chars.$BACKSLASH) {
        // Skip the next character because it was escaped.
        this._cursor.advance();
      } else if (char === inQuote) {
        // Exiting the current quoted string
        inQuote = null;
      } else if (!inComment && inQuote === null && chars.isQuote(char)) {
        // Entering a new quoted string
        inQuote = char;
      }
    }
    // We hit EOF without finding a closing interpolation marker
    parts.push(this._getProcessedChars(expressionStart, this._cursor));
    this._endToken(parts);
  }
  _consumeDirective(start, nameStart) {
    this._requireCharCode(chars.$AT);
    // Skip over the @ since it's not part of the name.
    this._cursor.advance();
    // Capture the rest of the name.
    while (isSelectorlessNameChar(this._cursor.peek())) {
      this._cursor.advance();
    }
    // Capture the opening token.
    this._beginToken(38 /* TokenType.DIRECTIVE_NAME */, start);
    const name = this._cursor.getChars(nameStart);
    this._endToken([name]);
    this._attemptCharCodeUntilFn(isNotWhitespace);
    // Optionally there might be attributes bound to the specific directive.
    // Stop parsing if there's no opening character for them.
    if (this._cursor.peek() !== chars.$LPAREN) {
      return;
    }
    this._openDirectiveCount++;
    this._beginToken(39 /* TokenType.DIRECTIVE_OPEN */);
    this._cursor.advance();
    this._endToken([]);
    this._attemptCharCodeUntilFn(isNotWhitespace);
    // Capture all the attributes until we hit a closing paren.
    while (!isAttributeTerminator(this._cursor.peek()) && this._cursor.peek() !== chars.$RPAREN) {
      this._consumeAttribute();
    }
    // Trim any trailing whitespace.
    this._attemptCharCodeUntilFn(isNotWhitespace);
    this._openDirectiveCount--;
    if (this._cursor.peek() !== chars.$RPAREN) {
      // Stop parsing, instead of throwing, if we've hit the end of the tag.
      // This can be handled better later when turning the tokens into AST.
      if (this._cursor.peek() === chars.$GT || this._cursor.peek() === chars.$SLASH) {
        return;
      }
      throw this._createError(
        _unexpectedCharacterErrorMsg(this._cursor.peek()),
        this._cursor.getSpan(start),
      );
    }
    // Capture the closing token.
    this._beginToken(40 /* TokenType.DIRECTIVE_CLOSE */);
    this._cursor.advance();
    this._endToken([]);
    this._attemptCharCodeUntilFn(isNotWhitespace);
  }
  _getProcessedChars(start, end) {
    return this._processCarriageReturns(end.getChars(start));
  }
  _isTextEnd() {
    if (this._isTagStart() || this._cursor.peek() === chars.$EOF) {
      return true;
    }
    if (this._tokenizeIcu && !this._inInterpolation) {
      if (this.isExpansionFormStart()) {
        // start of an expansion form
        return true;
      }
      if (this._cursor.peek() === chars.$RBRACE && this._isInExpansionCase()) {
        // end of and expansion case
        return true;
      }
    }
    if (
      this._tokenizeBlocks &&
      !this._inInterpolation &&
      !this._isInExpansion() &&
      (this._isBlockStart() || this._isLetStart() || this._cursor.peek() === chars.$RBRACE)
    ) {
      return true;
    }
    return false;
  }
  /**
   * Returns true if the current cursor is pointing to the start of a tag
   * (opening/closing/comments/cdata/etc).
   */
  _isTagStart() {
    if (this._cursor.peek() === chars.$LT) {
      // We assume that `<` followed by whitespace is not the start of an HTML element.
      const tmp = this._cursor.clone();
      tmp.advance();
      // If the next character is alphabetic, ! nor / then it is a tag start
      const code = tmp.peek();
      if (
        (chars.$a <= code && code <= chars.$z) ||
        (chars.$A <= code && code <= chars.$Z) ||
        code === chars.$SLASH ||
        code === chars.$BANG
      ) {
        return true;
      }
    }
    return false;
  }
  _readUntil(char) {
    const start = this._cursor.clone();
    this._attemptUntilChar(char);
    return this._cursor.getChars(start);
  }
  _isInExpansion() {
    return this._isInExpansionCase() || this._isInExpansionForm();
  }
  _isInExpansionCase() {
    return (
      this._expansionCaseStack.length > 0 &&
      this._expansionCaseStack[this._expansionCaseStack.length - 1] ===
        21 /* TokenType.EXPANSION_CASE_EXP_START */
    );
  }
  _isInExpansionForm() {
    return (
      this._expansionCaseStack.length > 0 &&
      this._expansionCaseStack[this._expansionCaseStack.length - 1] ===
        19 /* TokenType.EXPANSION_FORM_START */
    );
  }
  isExpansionFormStart() {
    if (this._cursor.peek() !== chars.$LBRACE) {
      return false;
    }
    if (this._interpolationConfig) {
      const start = this._cursor.clone();
      const isInterpolation = this._attemptStr(this._interpolationConfig.start);
      this._cursor = start;
      return !isInterpolation;
    }
    return true;
  }
}
function isNotWhitespace(code) {
  return !chars.isWhitespace(code) || code === chars.$EOF;
}
function isNameEnd(code) {
  return (
    chars.isWhitespace(code) ||
    code === chars.$GT ||
    code === chars.$LT ||
    code === chars.$SLASH ||
    code === chars.$SQ ||
    code === chars.$DQ ||
    code === chars.$EQ ||
    code === chars.$EOF
  );
}
function isPrefixEnd(code) {
  return (
    (code < chars.$a || chars.$z < code) &&
    (code < chars.$A || chars.$Z < code) &&
    (code < chars.$0 || code > chars.$9)
  );
}
function isDigitEntityEnd(code) {
  return code === chars.$SEMICOLON || code === chars.$EOF || !chars.isAsciiHexDigit(code);
}
function isNamedEntityEnd(code) {
  return code === chars.$SEMICOLON || code === chars.$EOF || !chars.isAsciiLetter(code);
}
function isExpansionCaseStart(peek) {
  return peek !== chars.$RBRACE;
}
function compareCharCodeCaseInsensitive(code1, code2) {
  return toUpperCaseCharCode(code1) === toUpperCaseCharCode(code2);
}
function toUpperCaseCharCode(code) {
  return code >= chars.$a && code <= chars.$z ? code - chars.$a + chars.$A : code;
}
function isBlockNameChar(code) {
  return chars.isAsciiLetter(code) || chars.isDigit(code) || code === chars.$_;
}
function isBlockParameterChar(code) {
  return code !== chars.$SEMICOLON && isNotWhitespace(code);
}
function isSelectorlessNameStart(code) {
  return code === chars.$_ || (code >= chars.$A && code <= chars.$Z);
}
function isSelectorlessNameChar(code) {
  return chars.isAsciiLetter(code) || chars.isDigit(code) || code === chars.$_;
}
function isAttributeTerminator(code) {
  return code === chars.$SLASH || code === chars.$GT || code === chars.$LT || code === chars.$EOF;
}
function mergeTextTokens(srcTokens) {
  const dstTokens = [];
  let lastDstToken = undefined;
  for (let i = 0; i < srcTokens.length; i++) {
    const token = srcTokens[i];
    if (
      (lastDstToken &&
        lastDstToken.type === 5 /* TokenType.TEXT */ &&
        token.type === 5) /* TokenType.TEXT */ ||
      (lastDstToken &&
        lastDstToken.type === 16 /* TokenType.ATTR_VALUE_TEXT */ &&
        token.type === 16) /* TokenType.ATTR_VALUE_TEXT */
    ) {
      lastDstToken.parts[0] += token.parts[0];
      lastDstToken.sourceSpan.end = token.sourceSpan.end;
    } else {
      lastDstToken = token;
      dstTokens.push(lastDstToken);
    }
  }
  return dstTokens;
}
class PlainCharacterCursor {
  constructor(fileOrCursor, range) {
    if (fileOrCursor instanceof PlainCharacterCursor) {
      this.file = fileOrCursor.file;
      this.input = fileOrCursor.input;
      this.end = fileOrCursor.end;
      const state = fileOrCursor.state;
      // Note: avoid using `{...fileOrCursor.state}` here as that has a severe performance penalty.
      // In ES5 bundles the object spread operator is translated into the `__assign` helper, which
      // is not optimized by VMs as efficiently as a raw object literal. Since this constructor is
      // called in tight loops, this difference matters.
      this.state = {
        peek: state.peek,
        offset: state.offset,
        line: state.line,
        column: state.column,
      };
    } else {
      if (!range) {
        throw new Error(
          'Programming error: the range argument must be provided with a file argument.',
        );
      }
      this.file = fileOrCursor;
      this.input = fileOrCursor.content;
      this.end = range.endPos;
      this.state = {
        peek: -1,
        offset: range.startPos,
        line: range.startLine,
        column: range.startCol,
      };
    }
  }
  clone() {
    return new PlainCharacterCursor(this);
  }
  peek() {
    return this.state.peek;
  }
  charsLeft() {
    return this.end - this.state.offset;
  }
  diff(other) {
    return this.state.offset - other.state.offset;
  }
  advance() {
    this.advanceState(this.state);
  }
  init() {
    this.updatePeek(this.state);
  }
  getSpan(start, leadingTriviaCodePoints) {
    start = start || this;
    let fullStart = start;
    if (leadingTriviaCodePoints) {
      while (this.diff(start) > 0 && leadingTriviaCodePoints.indexOf(start.peek()) !== -1) {
        if (fullStart === start) {
          start = start.clone();
        }
        start.advance();
      }
    }
    const startLocation = this.locationFromCursor(start);
    const endLocation = this.locationFromCursor(this);
    const fullStartLocation =
      fullStart !== start ? this.locationFromCursor(fullStart) : startLocation;
    return new ParseSourceSpan(startLocation, endLocation, fullStartLocation);
  }
  getChars(start) {
    return this.input.substring(start.state.offset, this.state.offset);
  }
  charAt(pos) {
    return this.input.charCodeAt(pos);
  }
  advanceState(state) {
    if (state.offset >= this.end) {
      this.state = state;
      throw new CursorError('Unexpected character "EOF"', this);
    }
    const currentChar = this.charAt(state.offset);
    if (currentChar === chars.$LF) {
      state.line++;
      state.column = 0;
    } else if (!chars.isNewLine(currentChar)) {
      state.column++;
    }
    state.offset++;
    this.updatePeek(state);
  }
  updatePeek(state) {
    state.peek = state.offset >= this.end ? chars.$EOF : this.charAt(state.offset);
  }
  locationFromCursor(cursor) {
    return new ParseLocation(
      cursor.file,
      cursor.state.offset,
      cursor.state.line,
      cursor.state.column,
    );
  }
}
class EscapedCharacterCursor extends PlainCharacterCursor {
  constructor(fileOrCursor, range) {
    if (fileOrCursor instanceof EscapedCharacterCursor) {
      super(fileOrCursor);
      this.internalState = {...fileOrCursor.internalState};
    } else {
      super(fileOrCursor, range);
      this.internalState = this.state;
    }
  }
  advance() {
    this.state = this.internalState;
    super.advance();
    this.processEscapeSequence();
  }
  init() {
    super.init();
    this.processEscapeSequence();
  }
  clone() {
    return new EscapedCharacterCursor(this);
  }
  getChars(start) {
    const cursor = start.clone();
    let chars = '';
    while (cursor.internalState.offset < this.internalState.offset) {
      chars += String.fromCodePoint(cursor.peek());
      cursor.advance();
    }
    return chars;
  }
  /**
   * Process the escape sequence that starts at the current position in the text.
   *
   * This method is called to ensure that `peek` has the unescaped value of escape sequences.
   */
  processEscapeSequence() {
    const peek = () => this.internalState.peek;
    if (peek() === chars.$BACKSLASH) {
      // We have hit an escape sequence so we need the internal state to become independent
      // of the external state.
      this.internalState = {...this.state};
      // Move past the backslash
      this.advanceState(this.internalState);
      // First check for standard control char sequences
      if (peek() === chars.$n) {
        this.state.peek = chars.$LF;
      } else if (peek() === chars.$r) {
        this.state.peek = chars.$CR;
      } else if (peek() === chars.$v) {
        this.state.peek = chars.$VTAB;
      } else if (peek() === chars.$t) {
        this.state.peek = chars.$TAB;
      } else if (peek() === chars.$b) {
        this.state.peek = chars.$BSPACE;
      } else if (peek() === chars.$f) {
        this.state.peek = chars.$FF;
      }
      // Now consider more complex sequences
      else if (peek() === chars.$u) {
        // Unicode code-point sequence
        this.advanceState(this.internalState); // advance past the `u` char
        if (peek() === chars.$LBRACE) {
          // Variable length Unicode, e.g. `\x{123}`
          this.advanceState(this.internalState); // advance past the `{` char
          // Advance past the variable number of hex digits until we hit a `}` char
          const digitStart = this.clone();
          let length = 0;
          while (peek() !== chars.$RBRACE) {
            this.advanceState(this.internalState);
            length++;
          }
          this.state.peek = this.decodeHexDigits(digitStart, length);
        } else {
          // Fixed length Unicode, e.g. `\u1234`
          const digitStart = this.clone();
          this.advanceState(this.internalState);
          this.advanceState(this.internalState);
          this.advanceState(this.internalState);
          this.state.peek = this.decodeHexDigits(digitStart, 4);
        }
      } else if (peek() === chars.$x) {
        // Hex char code, e.g. `\x2F`
        this.advanceState(this.internalState); // advance past the `x` char
        const digitStart = this.clone();
        this.advanceState(this.internalState);
        this.state.peek = this.decodeHexDigits(digitStart, 2);
      } else if (chars.isOctalDigit(peek())) {
        // Octal char code, e.g. `\012`,
        let octal = '';
        let length = 0;
        let previous = this.clone();
        while (chars.isOctalDigit(peek()) && length < 3) {
          previous = this.clone();
          octal += String.fromCodePoint(peek());
          this.advanceState(this.internalState);
          length++;
        }
        this.state.peek = parseInt(octal, 8);
        // Backup one char
        this.internalState = previous.internalState;
      } else if (chars.isNewLine(this.internalState.peek)) {
        // Line continuation `\` followed by a new line
        this.advanceState(this.internalState); // advance over the newline
        this.state = this.internalState;
      } else {
        // If none of the `if` blocks were executed then we just have an escaped normal character.
        // In that case we just, effectively, skip the backslash from the character.
        this.state.peek = this.internalState.peek;
      }
    }
  }
  decodeHexDigits(start, length) {
    const hex = this.input.slice(start.internalState.offset, start.internalState.offset + length);
    const charCode = parseInt(hex, 16);
    if (!isNaN(charCode)) {
      return charCode;
    } else {
      start.state = start.internalState;
      throw new CursorError('Invalid hexadecimal escape sequence', start);
    }
  }
}
export class CursorError extends Error {
  constructor(msg, cursor) {
    super(msg);
    this.msg = msg;
    this.cursor = cursor;
    // Extending `Error` does not always work when code is transpiled. See:
    // https://stackoverflow.com/questions/41102060/typescript-extending-error-class
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
//# sourceMappingURL=lexer.js.map
