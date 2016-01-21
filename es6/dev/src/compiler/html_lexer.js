import { StringWrapper, NumberWrapper, isPresent, isBlank } from 'angular2/src/facade/lang';
import { ListWrapper } from 'angular2/src/facade/collection';
import { ParseLocation, ParseError, ParseSourceFile, ParseSourceSpan } from './parse_util';
import { getHtmlTagDefinition, HtmlTagContentType, NAMED_ENTITIES } from './html_tags';
export var HtmlTokenType;
(function (HtmlTokenType) {
    HtmlTokenType[HtmlTokenType["TAG_OPEN_START"] = 0] = "TAG_OPEN_START";
    HtmlTokenType[HtmlTokenType["TAG_OPEN_END"] = 1] = "TAG_OPEN_END";
    HtmlTokenType[HtmlTokenType["TAG_OPEN_END_VOID"] = 2] = "TAG_OPEN_END_VOID";
    HtmlTokenType[HtmlTokenType["TAG_CLOSE"] = 3] = "TAG_CLOSE";
    HtmlTokenType[HtmlTokenType["TEXT"] = 4] = "TEXT";
    HtmlTokenType[HtmlTokenType["ESCAPABLE_RAW_TEXT"] = 5] = "ESCAPABLE_RAW_TEXT";
    HtmlTokenType[HtmlTokenType["RAW_TEXT"] = 6] = "RAW_TEXT";
    HtmlTokenType[HtmlTokenType["COMMENT_START"] = 7] = "COMMENT_START";
    HtmlTokenType[HtmlTokenType["COMMENT_END"] = 8] = "COMMENT_END";
    HtmlTokenType[HtmlTokenType["CDATA_START"] = 9] = "CDATA_START";
    HtmlTokenType[HtmlTokenType["CDATA_END"] = 10] = "CDATA_END";
    HtmlTokenType[HtmlTokenType["ATTR_NAME"] = 11] = "ATTR_NAME";
    HtmlTokenType[HtmlTokenType["ATTR_VALUE"] = 12] = "ATTR_VALUE";
    HtmlTokenType[HtmlTokenType["DOC_TYPE"] = 13] = "DOC_TYPE";
    HtmlTokenType[HtmlTokenType["EOF"] = 14] = "EOF";
})(HtmlTokenType || (HtmlTokenType = {}));
export class HtmlToken {
    constructor(type, parts, sourceSpan) {
        this.type = type;
        this.parts = parts;
        this.sourceSpan = sourceSpan;
    }
}
export class HtmlTokenError extends ParseError {
    constructor(errorMsg, tokenType, location) {
        super(location, errorMsg);
        this.tokenType = tokenType;
    }
}
export class HtmlTokenizeResult {
    constructor(tokens, errors) {
        this.tokens = tokens;
        this.errors = errors;
    }
}
export function tokenizeHtml(sourceContent, sourceUrl) {
    return new _HtmlTokenizer(new ParseSourceFile(sourceContent, sourceUrl)).tokenize();
}
const $EOF = 0;
const $TAB = 9;
const $LF = 10;
const $FF = 12;
const $CR = 13;
const $SPACE = 32;
const $BANG = 33;
const $DQ = 34;
const $HASH = 35;
const $$ = 36;
const $AMPERSAND = 38;
const $SQ = 39;
const $MINUS = 45;
const $SLASH = 47;
const $0 = 48;
const $SEMICOLON = 59;
const $9 = 57;
const $COLON = 58;
const $LT = 60;
const $EQ = 61;
const $GT = 62;
const $QUESTION = 63;
const $LBRACKET = 91;
const $RBRACKET = 93;
const $A = 65;
const $F = 70;
const $X = 88;
const $Z = 90;
const $a = 97;
const $f = 102;
const $z = 122;
const $x = 120;
const $NBSP = 160;
var CR_OR_CRLF_REGEXP = /\r\n?/g;
function unexpectedCharacterErrorMsg(charCode) {
    var char = charCode === $EOF ? 'EOF' : StringWrapper.fromCharCode(charCode);
    return `Unexpected character "${char}"`;
}
function unknownEntityErrorMsg(entitySrc) {
    return `Unknown entity "${entitySrc}" - use the "&#<decimal>;" or  "&#x<hex>;" syntax`;
}
class ControlFlowError {
    constructor(error) {
        this.error = error;
    }
}
// See http://www.w3.org/TR/html51/syntax.html#writing
class _HtmlTokenizer {
    constructor(file) {
        this.file = file;
        // Note: this is always lowercase!
        this.peek = -1;
        this.index = -1;
        this.line = 0;
        this.column = -1;
        this.tokens = [];
        this.errors = [];
        this.input = file.content;
        this.length = file.content.length;
        this._advance();
    }
    _processCarriageReturns(content) {
        // http://www.w3.org/TR/html5/syntax.html#preprocessing-the-input-stream
        // In order to keep the original position in the source, we can not pre-process it.
        // Instead CRs are processed right before instantiating the tokens.
        return StringWrapper.replaceAll(content, CR_OR_CRLF_REGEXP, '\n');
    }
    tokenize() {
        while (this.peek !== $EOF) {
            var start = this._getLocation();
            try {
                if (this._attemptCharCode($LT)) {
                    if (this._attemptCharCode($BANG)) {
                        if (this._attemptCharCode($LBRACKET)) {
                            this._consumeCdata(start);
                        }
                        else if (this._attemptCharCode($MINUS)) {
                            this._consumeComment(start);
                        }
                        else {
                            this._consumeDocType(start);
                        }
                    }
                    else if (this._attemptCharCode($SLASH)) {
                        this._consumeTagClose(start);
                    }
                    else {
                        this._consumeTagOpen(start);
                    }
                }
                else {
                    this._consumeText();
                }
            }
            catch (e) {
                if (e instanceof ControlFlowError) {
                    this.errors.push(e.error);
                }
                else {
                    throw e;
                }
            }
        }
        this._beginToken(HtmlTokenType.EOF);
        this._endToken([]);
        return new HtmlTokenizeResult(mergeTextTokens(this.tokens), this.errors);
    }
    _getLocation() {
        return new ParseLocation(this.file, this.index, this.line, this.column);
    }
    _beginToken(type, start = null) {
        if (isBlank(start)) {
            start = this._getLocation();
        }
        this.currentTokenStart = start;
        this.currentTokenType = type;
    }
    _endToken(parts, end = null) {
        if (isBlank(end)) {
            end = this._getLocation();
        }
        var token = new HtmlToken(this.currentTokenType, parts, new ParseSourceSpan(this.currentTokenStart, end));
        this.tokens.push(token);
        this.currentTokenStart = null;
        this.currentTokenType = null;
        return token;
    }
    _createError(msg, position) {
        var error = new HtmlTokenError(msg, this.currentTokenType, position);
        this.currentTokenStart = null;
        this.currentTokenType = null;
        return new ControlFlowError(error);
    }
    _advance() {
        if (this.index >= this.length) {
            throw this._createError(unexpectedCharacterErrorMsg($EOF), this._getLocation());
        }
        if (this.peek === $LF) {
            this.line++;
            this.column = 0;
        }
        else if (this.peek !== $LF && this.peek !== $CR) {
            this.column++;
        }
        this.index++;
        this.peek = this.index >= this.length ? $EOF : StringWrapper.charCodeAt(this.input, this.index);
    }
    _attemptCharCode(charCode) {
        if (this.peek === charCode) {
            this._advance();
            return true;
        }
        return false;
    }
    _attemptCharCodeCaseInsensitive(charCode) {
        if (compareCharCodeCaseInsensitive(this.peek, charCode)) {
            this._advance();
            return true;
        }
        return false;
    }
    _requireCharCode(charCode) {
        var location = this._getLocation();
        if (!this._attemptCharCode(charCode)) {
            throw this._createError(unexpectedCharacterErrorMsg(this.peek), location);
        }
    }
    _attemptStr(chars) {
        for (var i = 0; i < chars.length; i++) {
            if (!this._attemptCharCode(StringWrapper.charCodeAt(chars, i))) {
                return false;
            }
        }
        return true;
    }
    _attemptStrCaseInsensitive(chars) {
        for (var i = 0; i < chars.length; i++) {
            if (!this._attemptCharCodeCaseInsensitive(StringWrapper.charCodeAt(chars, i))) {
                return false;
            }
        }
        return true;
    }
    _requireStr(chars) {
        var location = this._getLocation();
        if (!this._attemptStr(chars)) {
            throw this._createError(unexpectedCharacterErrorMsg(this.peek), location);
        }
    }
    _attemptCharCodeUntilFn(predicate) {
        while (!predicate(this.peek)) {
            this._advance();
        }
    }
    _requireCharCodeUntilFn(predicate, len) {
        var start = this._getLocation();
        this._attemptCharCodeUntilFn(predicate);
        if (this.index - start.offset < len) {
            throw this._createError(unexpectedCharacterErrorMsg(this.peek), start);
        }
    }
    _attemptUntilChar(char) {
        while (this.peek !== char) {
            this._advance();
        }
    }
    _readChar(decodeEntities) {
        if (decodeEntities && this.peek === $AMPERSAND) {
            return this._decodeEntity();
        }
        else {
            var index = this.index;
            this._advance();
            return this.input[index];
        }
    }
    _decodeEntity() {
        var start = this._getLocation();
        this._advance();
        if (this._attemptCharCode($HASH)) {
            let isHex = this._attemptCharCode($x) || this._attemptCharCode($X);
            let numberStart = this._getLocation().offset;
            this._attemptCharCodeUntilFn(isDigitEntityEnd);
            if (this.peek != $SEMICOLON) {
                throw this._createError(unexpectedCharacterErrorMsg(this.peek), this._getLocation());
            }
            this._advance();
            let strNum = this.input.substring(numberStart, this.index - 1);
            try {
                let charCode = NumberWrapper.parseInt(strNum, isHex ? 16 : 10);
                return StringWrapper.fromCharCode(charCode);
            }
            catch (e) {
                let entity = this.input.substring(start.offset + 1, this.index - 1);
                throw this._createError(unknownEntityErrorMsg(entity), start);
            }
        }
        else {
            let startPosition = this._savePosition();
            this._attemptCharCodeUntilFn(isNamedEntityEnd);
            if (this.peek != $SEMICOLON) {
                this._restorePosition(startPosition);
                return '&';
            }
            this._advance();
            let name = this.input.substring(start.offset + 1, this.index - 1);
            let char = NAMED_ENTITIES[name];
            if (isBlank(char)) {
                throw this._createError(unknownEntityErrorMsg(name), start);
            }
            return char;
        }
    }
    _consumeRawText(decodeEntities, firstCharOfEnd, attemptEndRest) {
        var tagCloseStart;
        var textStart = this._getLocation();
        this._beginToken(decodeEntities ? HtmlTokenType.ESCAPABLE_RAW_TEXT : HtmlTokenType.RAW_TEXT, textStart);
        var parts = [];
        while (true) {
            tagCloseStart = this._getLocation();
            if (this._attemptCharCode(firstCharOfEnd) && attemptEndRest()) {
                break;
            }
            if (this.index > tagCloseStart.offset) {
                parts.push(this.input.substring(tagCloseStart.offset, this.index));
            }
            while (this.peek !== firstCharOfEnd) {
                parts.push(this._readChar(decodeEntities));
            }
        }
        return this._endToken([this._processCarriageReturns(parts.join(''))], tagCloseStart);
    }
    _consumeComment(start) {
        this._beginToken(HtmlTokenType.COMMENT_START, start);
        this._requireCharCode($MINUS);
        this._endToken([]);
        var textToken = this._consumeRawText(false, $MINUS, () => this._attemptStr('->'));
        this._beginToken(HtmlTokenType.COMMENT_END, textToken.sourceSpan.end);
        this._endToken([]);
    }
    _consumeCdata(start) {
        this._beginToken(HtmlTokenType.CDATA_START, start);
        this._requireStr('CDATA[');
        this._endToken([]);
        var textToken = this._consumeRawText(false, $RBRACKET, () => this._attemptStr(']>'));
        this._beginToken(HtmlTokenType.CDATA_END, textToken.sourceSpan.end);
        this._endToken([]);
    }
    _consumeDocType(start) {
        this._beginToken(HtmlTokenType.DOC_TYPE, start);
        this._attemptUntilChar($GT);
        this._advance();
        this._endToken([this.input.substring(start.offset + 2, this.index - 1)]);
    }
    _consumePrefixAndName() {
        var nameOrPrefixStart = this.index;
        var prefix = null;
        while (this.peek !== $COLON && !isPrefixEnd(this.peek)) {
            this._advance();
        }
        var nameStart;
        if (this.peek === $COLON) {
            this._advance();
            prefix = this.input.substring(nameOrPrefixStart, this.index - 1);
            nameStart = this.index;
        }
        else {
            nameStart = nameOrPrefixStart;
        }
        this._requireCharCodeUntilFn(isNameEnd, this.index === nameStart ? 1 : 0);
        var name = this.input.substring(nameStart, this.index);
        return [prefix, name];
    }
    _consumeTagOpen(start) {
        let savedPos = this._savePosition();
        let lowercaseTagName;
        try {
            if (!isAsciiLetter(this.peek)) {
                throw this._createError(unexpectedCharacterErrorMsg(this.peek), this._getLocation());
            }
            var nameStart = this.index;
            this._consumeTagOpenStart(start);
            lowercaseTagName = this.input.substring(nameStart, this.index).toLowerCase();
            this._attemptCharCodeUntilFn(isNotWhitespace);
            while (this.peek !== $SLASH && this.peek !== $GT) {
                this._consumeAttributeName();
                this._attemptCharCodeUntilFn(isNotWhitespace);
                if (this._attemptCharCode($EQ)) {
                    this._attemptCharCodeUntilFn(isNotWhitespace);
                    this._consumeAttributeValue();
                }
                this._attemptCharCodeUntilFn(isNotWhitespace);
            }
            this._consumeTagOpenEnd();
        }
        catch (e) {
            if (e instanceof ControlFlowError) {
                // When the start tag is invalid, assume we want a "<"
                this._restorePosition(savedPos);
                // Back to back text tokens are merged at the end
                this._beginToken(HtmlTokenType.TEXT, start);
                this._endToken(['<']);
                return;
            }
            throw e;
        }
        var contentTokenType = getHtmlTagDefinition(lowercaseTagName).contentType;
        if (contentTokenType === HtmlTagContentType.RAW_TEXT) {
            this._consumeRawTextWithTagClose(lowercaseTagName, false);
        }
        else if (contentTokenType === HtmlTagContentType.ESCAPABLE_RAW_TEXT) {
            this._consumeRawTextWithTagClose(lowercaseTagName, true);
        }
    }
    _consumeRawTextWithTagClose(lowercaseTagName, decodeEntities) {
        var textToken = this._consumeRawText(decodeEntities, $LT, () => {
            if (!this._attemptCharCode($SLASH))
                return false;
            this._attemptCharCodeUntilFn(isNotWhitespace);
            if (!this._attemptStrCaseInsensitive(lowercaseTagName))
                return false;
            this._attemptCharCodeUntilFn(isNotWhitespace);
            if (!this._attemptCharCode($GT))
                return false;
            return true;
        });
        this._beginToken(HtmlTokenType.TAG_CLOSE, textToken.sourceSpan.end);
        this._endToken([null, lowercaseTagName]);
    }
    _consumeTagOpenStart(start) {
        this._beginToken(HtmlTokenType.TAG_OPEN_START, start);
        var parts = this._consumePrefixAndName();
        this._endToken(parts);
    }
    _consumeAttributeName() {
        this._beginToken(HtmlTokenType.ATTR_NAME);
        var prefixAndName = this._consumePrefixAndName();
        this._endToken(prefixAndName);
    }
    _consumeAttributeValue() {
        this._beginToken(HtmlTokenType.ATTR_VALUE);
        var value;
        if (this.peek === $SQ || this.peek === $DQ) {
            var quoteChar = this.peek;
            this._advance();
            var parts = [];
            while (this.peek !== quoteChar) {
                parts.push(this._readChar(true));
            }
            value = parts.join('');
            this._advance();
        }
        else {
            var valueStart = this.index;
            this._requireCharCodeUntilFn(isNameEnd, 1);
            value = this.input.substring(valueStart, this.index);
        }
        this._endToken([this._processCarriageReturns(value)]);
    }
    _consumeTagOpenEnd() {
        var tokenType = this._attemptCharCode($SLASH) ? HtmlTokenType.TAG_OPEN_END_VOID :
            HtmlTokenType.TAG_OPEN_END;
        this._beginToken(tokenType);
        this._requireCharCode($GT);
        this._endToken([]);
    }
    _consumeTagClose(start) {
        this._beginToken(HtmlTokenType.TAG_CLOSE, start);
        this._attemptCharCodeUntilFn(isNotWhitespace);
        var prefixAndName;
        prefixAndName = this._consumePrefixAndName();
        this._attemptCharCodeUntilFn(isNotWhitespace);
        this._requireCharCode($GT);
        this._endToken(prefixAndName);
    }
    _consumeText() {
        var start = this._getLocation();
        this._beginToken(HtmlTokenType.TEXT, start);
        var parts = [this._readChar(true)];
        while (!isTextEnd(this.peek)) {
            parts.push(this._readChar(true));
        }
        this._endToken([this._processCarriageReturns(parts.join(''))]);
    }
    _savePosition() {
        return [this.peek, this.index, this.column, this.line, this.tokens.length];
    }
    _restorePosition(position) {
        this.peek = position[0];
        this.index = position[1];
        this.column = position[2];
        this.line = position[3];
        let nbTokens = position[4];
        if (nbTokens < this.tokens.length) {
            // remove any extra tokens
            this.tokens = ListWrapper.slice(this.tokens, 0, nbTokens);
        }
    }
}
function isNotWhitespace(code) {
    return !isWhitespace(code) || code === $EOF;
}
function isWhitespace(code) {
    return (code >= $TAB && code <= $SPACE) || (code === $NBSP);
}
function isNameEnd(code) {
    return isWhitespace(code) || code === $GT || code === $SLASH || code === $SQ || code === $DQ ||
        code === $EQ;
}
function isPrefixEnd(code) {
    return (code < $a || $z < code) && (code < $A || $Z < code) && (code < $0 || code > $9);
}
function isDigitEntityEnd(code) {
    return code == $SEMICOLON || code == $EOF || !isAsciiHexDigit(code);
}
function isNamedEntityEnd(code) {
    return code == $SEMICOLON || code == $EOF || !isAsciiLetter(code);
}
function isTextEnd(code) {
    return code === $LT || code === $EOF;
}
function isAsciiLetter(code) {
    return code >= $a && code <= $z || code >= $A && code <= $Z;
}
function isAsciiHexDigit(code) {
    return code >= $a && code <= $f || code >= $A && code <= $F || code >= $0 && code <= $9;
}
function compareCharCodeCaseInsensitive(code1, code2) {
    return toUpperCaseCharCode(code1) == toUpperCaseCharCode(code2);
}
function toUpperCaseCharCode(code) {
    return code >= $a && code <= $z ? code - $a + $A : code;
}
function mergeTextTokens(srcTokens) {
    let dstTokens = [];
    let lastDstToken;
    for (let i = 0; i < srcTokens.length; i++) {
        let token = srcTokens[i];
        if (isPresent(lastDstToken) && lastDstToken.type == HtmlTokenType.TEXT &&
            token.type == HtmlTokenType.TEXT) {
            lastDstToken.parts[0] += token.parts[0];
            lastDstToken.sourceSpan.end = token.sourceSpan.end;
        }
        else {
            lastDstToken = token;
            dstTokens.push(lastDstToken);
        }
    }
    return dstTokens;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHRtbF9sZXhlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb21waWxlci9odG1sX2xleGVyLnRzIl0sIm5hbWVzIjpbIkh0bWxUb2tlblR5cGUiLCJIdG1sVG9rZW4iLCJIdG1sVG9rZW4uY29uc3RydWN0b3IiLCJIdG1sVG9rZW5FcnJvciIsIkh0bWxUb2tlbkVycm9yLmNvbnN0cnVjdG9yIiwiSHRtbFRva2VuaXplUmVzdWx0IiwiSHRtbFRva2VuaXplUmVzdWx0LmNvbnN0cnVjdG9yIiwidG9rZW5pemVIdG1sIiwidW5leHBlY3RlZENoYXJhY3RlckVycm9yTXNnIiwidW5rbm93bkVudGl0eUVycm9yTXNnIiwiQ29udHJvbEZsb3dFcnJvciIsIkNvbnRyb2xGbG93RXJyb3IuY29uc3RydWN0b3IiLCJfSHRtbFRva2VuaXplciIsIl9IdG1sVG9rZW5pemVyLmNvbnN0cnVjdG9yIiwiX0h0bWxUb2tlbml6ZXIuX3Byb2Nlc3NDYXJyaWFnZVJldHVybnMiLCJfSHRtbFRva2VuaXplci50b2tlbml6ZSIsIl9IdG1sVG9rZW5pemVyLl9nZXRMb2NhdGlvbiIsIl9IdG1sVG9rZW5pemVyLl9iZWdpblRva2VuIiwiX0h0bWxUb2tlbml6ZXIuX2VuZFRva2VuIiwiX0h0bWxUb2tlbml6ZXIuX2NyZWF0ZUVycm9yIiwiX0h0bWxUb2tlbml6ZXIuX2FkdmFuY2UiLCJfSHRtbFRva2VuaXplci5fYXR0ZW1wdENoYXJDb2RlIiwiX0h0bWxUb2tlbml6ZXIuX2F0dGVtcHRDaGFyQ29kZUNhc2VJbnNlbnNpdGl2ZSIsIl9IdG1sVG9rZW5pemVyLl9yZXF1aXJlQ2hhckNvZGUiLCJfSHRtbFRva2VuaXplci5fYXR0ZW1wdFN0ciIsIl9IdG1sVG9rZW5pemVyLl9hdHRlbXB0U3RyQ2FzZUluc2Vuc2l0aXZlIiwiX0h0bWxUb2tlbml6ZXIuX3JlcXVpcmVTdHIiLCJfSHRtbFRva2VuaXplci5fYXR0ZW1wdENoYXJDb2RlVW50aWxGbiIsIl9IdG1sVG9rZW5pemVyLl9yZXF1aXJlQ2hhckNvZGVVbnRpbEZuIiwiX0h0bWxUb2tlbml6ZXIuX2F0dGVtcHRVbnRpbENoYXIiLCJfSHRtbFRva2VuaXplci5fcmVhZENoYXIiLCJfSHRtbFRva2VuaXplci5fZGVjb2RlRW50aXR5IiwiX0h0bWxUb2tlbml6ZXIuX2NvbnN1bWVSYXdUZXh0IiwiX0h0bWxUb2tlbml6ZXIuX2NvbnN1bWVDb21tZW50IiwiX0h0bWxUb2tlbml6ZXIuX2NvbnN1bWVDZGF0YSIsIl9IdG1sVG9rZW5pemVyLl9jb25zdW1lRG9jVHlwZSIsIl9IdG1sVG9rZW5pemVyLl9jb25zdW1lUHJlZml4QW5kTmFtZSIsIl9IdG1sVG9rZW5pemVyLl9jb25zdW1lVGFnT3BlbiIsIl9IdG1sVG9rZW5pemVyLl9jb25zdW1lUmF3VGV4dFdpdGhUYWdDbG9zZSIsIl9IdG1sVG9rZW5pemVyLl9jb25zdW1lVGFnT3BlblN0YXJ0IiwiX0h0bWxUb2tlbml6ZXIuX2NvbnN1bWVBdHRyaWJ1dGVOYW1lIiwiX0h0bWxUb2tlbml6ZXIuX2NvbnN1bWVBdHRyaWJ1dGVWYWx1ZSIsIl9IdG1sVG9rZW5pemVyLl9jb25zdW1lVGFnT3BlbkVuZCIsIl9IdG1sVG9rZW5pemVyLl9jb25zdW1lVGFnQ2xvc2UiLCJfSHRtbFRva2VuaXplci5fY29uc3VtZVRleHQiLCJfSHRtbFRva2VuaXplci5fc2F2ZVBvc2l0aW9uIiwiX0h0bWxUb2tlbml6ZXIuX3Jlc3RvcmVQb3NpdGlvbiIsImlzTm90V2hpdGVzcGFjZSIsImlzV2hpdGVzcGFjZSIsImlzTmFtZUVuZCIsImlzUHJlZml4RW5kIiwiaXNEaWdpdEVudGl0eUVuZCIsImlzTmFtZWRFbnRpdHlFbmQiLCJpc1RleHRFbmQiLCJpc0FzY2lpTGV0dGVyIiwiaXNBc2NpaUhleERpZ2l0IiwiY29tcGFyZUNoYXJDb2RlQ2FzZUluc2Vuc2l0aXZlIiwidG9VcHBlckNhc2VDaGFyQ29kZSIsIm1lcmdlVGV4dFRva2VucyJdLCJtYXBwaW5ncyI6Ik9BQU8sRUFDTCxh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Q0FBQ0E7WUFDbkVBLElBQUlBLFdBQVdBLEdBQUdBLElBQUlBLENBQUNBLFlBQVlBLEVBQUVBLENBQUNBLE1BQU1BLENBQUNBO1lBQzdDQSxJQUFJQSxDQUFDQSx1QkFBdUJBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsQ0FBQ0E7WUFDL0NBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLElBQUlBLFVBQVVBLENBQUNBLENBQUNBLENBQUNBO2dCQUM1QkEsTUFBTUEsSUFBSUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsMkJBQTJCQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxJQUFJQSxDQUFDQSxZQUFZQSxFQUFFQSxDQUFDQSxDQUFDQTtZQUN2RkEsQ0FBQ0E7WUFDREEsSUFBSUEsQ0FBQ0EsUUFBUUEsRUFBRUEsQ0FBQ0E7WUFDaEJBLElBQUlBLE1BQU1BLEdBQUdBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLFNBQVNBLENBQUNBLFdBQVdBLEVBQUVBLElBQUlBLENBQUNBLEtBQUtBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBO1lBQy9EQSxJQUFJQSxDQUFDQTtnQkFDSEEsSUFBSUEsUUFBUUEsR0FBR0EsYUFBYUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsTUFBTUEsRUFBRUEsS0FBS0EsR0FBR0EsRUFBRUEsR0FBR0EsRUFBRUEsQ0FBQ0EsQ0FBQ0E7Z0JBQy9EQSxNQUFNQSxDQUFDQSxhQUFhQSxDQUFDQSxZQUFZQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQTtZQUM5Q0EsQ0FBRUE7WUFBQUEsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ1hBLElBQUlBLE1BQU1BLEdBQUdBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLFNBQVNBLENBQUNBLEtBQUtBLENBQUNBLE1BQU1BLEdBQUdBLENBQUNBLEVBQUVBLElBQUlBLENBQUNBLEtBQUtBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBO2dCQUNwRUEsTUFBTUEsSUFBSUEsQ0FBQ0EsWUFBWUEsQ0FB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QSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNsQ0EsMEJBQTBCQTtZQUMxQkEsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBR0EsV0FBV0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0EsRUFBRUEsUUFBUUEsQ0FBQ0EsQ0FBQ0E7UUFDNURBLENBQUNBO0lBQ0hBLENBQUNBO0FBQ0hsQyxDQUFDQTtBQUVELHlCQUF5QixJQUFZO0lBQ25DbUMsTUFBTUEsQ0FBQ0EsQ0FBQ0EsWUFBWUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsSUFBSUEsS0FBS0EsSUFBSUEsQ0FBQ0E7QUFDOUNBLENBQUNBO0FBRUQsc0JBQXNCLElBQVk7SUFDaENDLE1BQU1BLENBQUNBLENBQUNBLElBQUlBLElBQUlBLElBQUlBLElBQUlBLElBQUlBLElBQUlBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLElBQUlBLEtBQUtBLEtBQUtBLENBQUNBLENBQUNBO0FBQzlEQSxDQUFDQTtBQUVELG1CQUFtQixJQUFZO0lBQzdCQyxNQUFNQSxDQUFDQSxZQUFZQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxJQUFJQSxLQUFLQSxHQUFHQSxJQUFJQSxJQUFJQSxLQUFLQSxNQUFNQSxJQUFJQSxJQUFJQSxLQUFLQSxHQUFHQSxJQUFJQSxJQUFJQSxLQUFLQSxHQUFHQTtRQUNyRkEsSUFBSUEsS0FBS0EsR0FBR0EsQ0FBQ0E7QUFDdEJBLENBQUNBO0FBRUQscUJBQXFCLElBQVk7SUFDL0JDLE1BQU1BLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLEVBQUVBLElBQUlBLEVBQUVBLEdBQUdBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLEdBQUdBLEVBQUVBLElBQUlBLEVBQUVBLEdBQUdBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLEdBQUdBLEVBQUVBLElBQUlBLElBQUlBLEdBQUdBLEVBQUVBLENBQUNBLENBQUNBO0FBQzFGQSxDQUFDQTtBQUVE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cGVyLFxuICBpc1ByZXNlbnQsXG4gIGlzQmxhbmssXG4gIENPTlNUX0VYUFIsXG4gIHNlcmlhbGl6ZUVudW1cbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7TGlzdFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge1BhcnNlTG9jYXRpb24sIFBhcnNlRXJyb3IsIFBhcnNlU291cmNlRmlsZSwgUGFyc2VTb3VyY2VTcGFufSBmcm9tICcuL3BhcnNlX3V0aWwnO1xuaW1wb3J0IHtnZXRIdG1sVGFnRGVmaW5pdGlvbiwgSHRtbFRhZ0NvbnRlbnRUeXBlLCBOQU1FRF9FTlRJVElFU30gZnJvbSAnLi9odG1sX3RhZ3MnO1xuXG5leHBvcnQgZW51bSBIdG1sVG9rZW5UeXBlIHtcbiAgVEFHX09QRU5fU1RBUlQsXG4gIFRBR19PUEVOX0VORCxcbiAgVEFHX09QRU5fRU5EX1ZPSUQsXG4gIFRBR19DTE9TRSxcbiAgVEVYVCxcbiAgRVNDQVBBQkxFX1JBV19URVhULFxuICBSQVdfVEVYVCxcbiAgQ09NTUVOVF9TVEFSVCxcbiAgQ09NTUVOVF9FTkQsXG4gIENEQVRBX1NUQVJULFxuICBDREFUQV9FTkQsXG4gIEFUVFJfTkFNRSxcbiAgQVRUUl9WQUxVRSxcbiAgRE9DX1RZUEUsXG4gIEVPRlxufVxuXG5leHBvcnQgY2xhc3MgSHRtbFRva2VuIHtcbiAgY29uc3RydWN0b3IocHVibGljIHR5cGU6IEh0bWxUb2tlblR5cGUsIHB1YmxpYyBwYXJ0czogc3RyaW5nW10sXG4gICAgICAgICAgICAgIHB1YmxpYyBzb3VyY2VTcGFuOiBQYXJzZVNvdXJjZVNwYW4pIHt9XG59XG5cbmV4cG9ydCBjbGFzcyBIdG1sVG9rZW5FcnJvciBleHRlbmRzIFBhcnNlRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihlcnJvck1zZzogc3RyaW5nLCBwdWJsaWMgdG9rZW5UeXBlOiBIdG1sVG9rZW5UeXBlLCBsb2NhdGlvbjogUGFyc2VMb2NhdGlvbikge1xuICAgIHN1cGVyKGxvY2F0aW9uLCBlcnJvck1zZyk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEh0bWxUb2tlbml6ZVJlc3VsdCB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB0b2tlbnM6IEh0bWxUb2tlbltdLCBwdWJsaWMgZXJyb3JzOiBIdG1sVG9rZW5FcnJvcltdKSB7fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdG9rZW5pemVIdG1sKHNvdXJjZUNvbnRlbnQ6IHN0cmluZywgc291cmNlVXJsOiBzdHJpbmcpOiBIdG1sVG9rZW5pemVSZXN1bHQge1xuICByZXR1cm4gbmV3IF9IdG1sVG9rZW5pemVyKG5ldyBQYXJzZVNvdXJjZUZpbGUoc291cmNlQ29udGVudCwgc291cmNlVXJsKSkudG9rZW5pemUoKTtcbn1cblxuY29uc3QgJEVPRiA9IDA7XG5jb25zdCAkVEFCID0gOTtcbmNvbnN0ICRMRiA9IDEwO1xuY29uc3QgJEZGID0gMTI7XG5jb25zdCAkQ1IgPSAxMztcblxuY29uc3QgJFNQQUNFID0gMzI7XG5cbmNvbnN0ICRCQU5HID0gMzM7XG5jb25zdCAkRFEgPSAzNDtcbmNvbnN0ICRIQVNIID0gMzU7XG5jb25zdCAkJCA9IDM2O1xuY29uc3QgJEFNUEVSU0FORCA9IDM4O1xuY29uc3QgJFNRID0gMzk7XG5jb25zdCAkTUlOVVMgPSA0NTtcbmNvbnN0ICRTTEFTSCA9IDQ3O1xuY29uc3QgJDAgPSA0ODtcblxuY29uc3QgJFNFTUlDT0xPTiA9IDU5O1xuXG5jb25zdCAkOSA9IDU3O1xuY29uc3QgJENPTE9OID0gNTg7XG5jb25zdCAkTFQgPSA2MDtcbmNvbnN0ICRFUSA9IDYxO1xuY29uc3QgJEdUID0gNjI7XG5jb25zdCAkUVVFU1RJT04gPSA2MztcbmNvbnN0ICRMQlJBQ0tFVCA9IDkxO1xuY29uc3QgJFJCUkFDS0VUID0gOTM7XG5jb25zdCAkQSA9IDY1O1xuY29uc3QgJEYgPSA3MDtcbmNvbnN0ICRYID0gODg7XG5jb25zdCAkWiA9IDkwO1xuXG5jb25zdCAkYSA9IDk3O1xuY29uc3QgJGYgPSAxMDI7XG5jb25zdCAkeiA9IDEyMjtcbmNvbnN0ICR4ID0gMTIwO1xuXG5jb25zdCAkTkJTUCA9IDE2MDtcblxudmFyIENSX09SX0NSTEZfUkVHRVhQID0gL1xcclxcbj8vZztcblxuZnVuY3Rpb24gdW5leHBlY3RlZENoYXJhY3RlckVycm9yTXNnKGNoYXJDb2RlOiBudW1iZXIpOiBzdHJpbmcge1xuICB2YXIgY2hhciA9IGNoYXJDb2RlID09PSAkRU9GID8gJ0VPRicgOiBTdHJpbmdXcmFwcGVyLmZyb21DaGFyQ29kZShjaGFyQ29kZSk7XG4gIHJldHVybiBgVW5leHBlY3RlZCBjaGFyYWN0ZXIgXCIke2NoYXJ9XCJgO1xufVxuXG5mdW5jdGlvbiB1bmtub3duRW50aXR5RXJyb3JNc2coZW50aXR5U3JjOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gYFVua25vd24gZW50aXR5IFwiJHtlbnRpdHlTcmN9XCIgLSB1c2UgdGhlIFwiJiM8ZGVjaW1hbD47XCIgb3IgIFwiJiN4PGhleD47XCIgc3ludGF4YDtcbn1cblxuY2xhc3MgQ29udHJvbEZsb3dFcnJvciB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBlcnJvcjogSHRtbFRva2VuRXJyb3IpIHt9XG59XG5cbi8vIFNlZSBodHRwOi8vd3d3LnczLm9yZy9UUi9odG1sNTEvc3ludGF4Lmh0bWwjd3JpdGluZ1xuY2xhc3MgX0h0bWxUb2tlbml6ZXIge1xuICBwcml2YXRlIGlucHV0OiBzdHJpbmc7XG4gIHByaXZhdGUgbGVuZ3RoOiBudW1iZXI7XG4gIC8vIE5vdGU6IHRoaXMgaXMgYWx3YXlzIGxvd2VyY2FzZSFcbiAgcHJpdmF0ZSBwZWVrOiBudW1iZXIgPSAtMTtcbiAgcHJpdmF0ZSBpbmRleDogbnVtYmVyID0gLTE7XG4gIHByaXZhdGUgbGluZTogbnVtYmVyID0gMDtcbiAgcHJpdmF0ZSBjb2x1bW46IG51bWJlciA9IC0xO1xuICBwcml2YXRlIGN1cnJlbnRUb2tlblN0YXJ0OiBQYXJzZUxvY2F0aW9uO1xuICBwcml2YXRlIGN1cnJlbnRUb2tlblR5cGU6IEh0bWxUb2tlblR5cGU7XG5cbiAgdG9rZW5zOiBIdG1sVG9rZW5bXSA9IFtdO1xuICBlcnJvcnM6IEh0bWxUb2tlbkVycm9yW10gPSBbXTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGZpbGU6IFBhcnNlU291cmNlRmlsZSkge1xuICAgIHRoaXMuaW5wdXQgPSBmaWxlLmNvbnRlbnQ7XG4gICAgdGhpcy5sZW5ndGggPSBmaWxlLmNvbnRlbnQubGVuZ3RoO1xuICAgIHRoaXMuX2FkdmFuY2UoKTtcbiAgfVxuXG4gIHByaXZhdGUgX3Byb2Nlc3NDYXJyaWFnZVJldHVybnMoY29udGVudDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAvLyBodHRwOi8vd3d3LnczLm9yZy9UUi9odG1sNS9zeW50YXguaHRtbCNwcmVwcm9jZXNzaW5nLXRoZS1pbnB1dC1zdHJlYW1cbiAgICAvLyBJbiBvcmRlciB0byBrZWVwIHRoZSBvcmlnaW5hbCBwb3NpdGlvbiBpbiB0aGUgc291cmNlLCB3ZSBjYW4gbm90IHByZS1wcm9jZXNzIGl0LlxuICAgIC8vIEluc3RlYWQgQ1JzIGFyZSBwcm9jZXNzZWQgcmlnaHQgYmVmb3JlIGluc3RhbnRpYXRpbmcgdGhlIHRva2Vucy5cbiAgICByZXR1cm4gU3RyaW5nV3JhcHBlci5yZXBsYWNlQWxsKGNvbnRlbnQsIENSX09SX0NSTEZfUkVHRVhQLCAnXFxuJyk7XG4gIH1cblxuICB0b2tlbml6ZSgpOiBIdG1sVG9rZW5pemVSZXN1bHQge1xuICAgIHdoaWxlICh0aGlzLnBlZWsgIT09ICRFT0YpIHtcbiAgICAgIHZhciBzdGFydCA9IHRoaXMuX2dldExvY2F0aW9uKCk7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAodGhpcy5fYXR0ZW1wdENoYXJDb2RlKCRMVCkpIHtcbiAgICAgICAgICBpZiAodGhpcy5fYXR0ZW1wdENoYXJDb2RlKCRCQU5HKSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuX2F0dGVtcHRDaGFyQ29kZSgkTEJSQUNLRVQpKSB7XG4gICAgICAgICAgICAgIHRoaXMuX2NvbnN1bWVDZGF0YShzdGFydCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2F0dGVtcHRDaGFyQ29kZSgkTUlOVVMpKSB7XG4gICAgICAgICAgICAgIHRoaXMuX2NvbnN1bWVDb21tZW50KHN0YXJ0KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHRoaXMuX2NvbnN1bWVEb2NUeXBlKHN0YXJ0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2F0dGVtcHRDaGFyQ29kZSgkU0xBU0gpKSB7XG4gICAgICAgICAgICB0aGlzLl9jb25zdW1lVGFnQ2xvc2Uoc3RhcnQpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9jb25zdW1lVGFnT3BlbihzdGFydCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX2NvbnN1bWVUZXh0KCk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgaWYgKGUgaW5zdGFuY2VvZiBDb250cm9sRmxvd0Vycm9yKSB7XG4gICAgICAgICAgdGhpcy5lcnJvcnMucHVzaChlLmVycm9yKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuX2JlZ2luVG9rZW4oSHRtbFRva2VuVHlwZS5FT0YpO1xuICAgIHRoaXMuX2VuZFRva2VuKFtdKTtcbiAgICByZXR1cm4gbmV3IEh0bWxUb2tlbml6ZVJlc3VsdChtZXJnZVRleHRUb2tlbnModGhpcy50b2tlbnMpLCB0aGlzLmVycm9ycyk7XG4gIH1cblxuICBwcml2YXRlIF9nZXRMb2NhdGlvbigpOiBQYXJzZUxvY2F0aW9uIHtcbiAgICByZXR1cm4gbmV3IFBhcnNlTG9jYXRpb24odGhpcy5maWxlLCB0aGlzLmluZGV4LCB0aGlzLmxpbmUsIHRoaXMuY29sdW1uKTtcbiAgfVxuXG4gIHByaXZhdGUgX2JlZ2luVG9rZW4odHlwZTogSHRtbFRva2VuVHlwZSwgc3RhcnQ6IFBhcnNlTG9jYXRpb24gPSBudWxsKSB7XG4gICAgaWYgKGlzQmxhbmsoc3RhcnQpKSB7XG4gICAgICBzdGFydCA9IHRoaXMuX2dldExvY2F0aW9uKCk7XG4gICAgfVxuICAgIHRoaXMuY3VycmVudFRva2VuU3RhcnQgPSBzdGFydDtcbiAgICB0aGlzLmN1cnJlbnRUb2tlblR5cGUgPSB0eXBlO1xuICB9XG5cbiAgcHJpdmF0ZSBfZW5kVG9rZW4ocGFydHM6IHN0cmluZ1tdLCBlbmQ6IFBhcnNlTG9jYXRpb24gPSBudWxsKTogSHRtbFRva2VuIHtcbiAgICBpZiAoaXNCbGFuayhlbmQpKSB7XG4gICAgICBlbmQgPSB0aGlzLl9nZXRMb2NhdGlvbigpO1xuICAgIH1cbiAgICB2YXIgdG9rZW4gPSBuZXcgSHRtbFRva2VuKHRoaXMuY3VycmVudFRva2VuVHlwZSwgcGFydHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgUGFyc2VTb3VyY2VTcGFuKHRoaXMuY3VycmVudFRva2VuU3RhcnQsIGVuZCkpO1xuICAgIHRoaXMudG9rZW5zLnB1c2godG9rZW4pO1xuICAgIHRoaXMuY3VycmVudFRva2VuU3RhcnQgPSBudWxsO1xuICAgIHRoaXMuY3VycmVudFRva2VuVHlwZSA9IG51bGw7XG4gICAgcmV0dXJuIHRva2VuO1xuICB9XG5cbiAgcHJpdmF0ZSBfY3JlYXRlRXJyb3IobXNnOiBzdHJpbmcsIHBvc2l0aW9uOiBQYXJzZUxvY2F0aW9uKTogQ29udHJvbEZsb3dFcnJvciB7XG4gICAgdmFyIGVycm9yID0gbmV3IEh0bWxUb2tlbkVycm9yKG1zZywgdGhpcy5jdXJyZW50VG9rZW5UeXBlLCBwb3NpdGlvbik7XG4gICAgdGhpcy5jdXJyZW50VG9rZW5TdGFydCA9IG51bGw7XG4gICAgdGhpcy5jdXJyZW50VG9rZW5UeXBlID0gbnVsbDtcbiAgICByZXR1cm4gbmV3IENvbnRyb2xGbG93RXJyb3IoZXJyb3IpO1xuICB9XG5cbiAgcHJpdmF0ZSBfYWR2YW5jZSgpIHtcbiAgICBpZiAodGhpcy5pbmRleCA+PSB0aGlzLmxlbmd0aCkge1xuICAgICAgdGhyb3cgdGhpcy5fY3JlYXRlRXJyb3IodW5leHBlY3RlZENoYXJhY3RlckVycm9yTXNnKCRFT0YpLCB0aGlzLl9nZXRMb2NhdGlvbigpKTtcbiAgICB9XG4gICAgaWYgKHRoaXMucGVlayA9PT0gJExGKSB7XG4gICAgICB0aGlzLmxpbmUrKztcbiAgICAgIHRoaXMuY29sdW1uID0gMDtcbiAgICB9IGVsc2UgaWYgKHRoaXMucGVlayAhPT0gJExGICYmIHRoaXMucGVlayAhPT0gJENSKSB7XG4gICAgICB0aGlzLmNvbHVtbisrO1xuICAgIH1cbiAgICB0aGlzLmluZGV4Kys7XG4gICAgdGhpcy5wZWVrID0gdGhpcy5pbmRleCA+PSB0aGlzLmxlbmd0aCA/ICRFT0YgOiBTdHJpbmdXcmFwcGVyLmNoYXJDb2RlQXQodGhpcy5pbnB1dCwgdGhpcy5pbmRleCk7XG4gIH1cblxuICBwcml2YXRlIF9hdHRlbXB0Q2hhckNvZGUoY2hhckNvZGU6IG51bWJlcik6IGJvb2xlYW4ge1xuICAgIGlmICh0aGlzLnBlZWsgPT09IGNoYXJDb2RlKSB7XG4gICAgICB0aGlzLl9hZHZhbmNlKCk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcHJpdmF0ZSBfYXR0ZW1wdENoYXJDb2RlQ2FzZUluc2Vuc2l0aXZlKGNoYXJDb2RlOiBudW1iZXIpOiBib29sZWFuIHtcbiAgICBpZiAoY29tcGFyZUNoYXJDb2RlQ2FzZUluc2Vuc2l0aXZlKHRoaXMucGVlaywgY2hhckNvZGUpKSB7XG4gICAgICB0aGlzLl9hZHZhbmNlKCk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcHJpdmF0ZSBfcmVxdWlyZUNoYXJDb2RlKGNoYXJDb2RlOiBudW1iZXIpIHtcbiAgICB2YXIgbG9jYXRpb24gPSB0aGlzLl9nZXRMb2NhdGlvbigpO1xuICAgIGlmICghdGhpcy5fYXR0ZW1wdENoYXJDb2RlKGNoYXJDb2RlKSkge1xuICAgICAgdGhyb3cgdGhpcy5fY3JlYXRlRXJyb3IodW5leHBlY3RlZENoYXJhY3RlckVycm9yTXNnKHRoaXMucGVlayksIGxvY2F0aW9uKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9hdHRlbXB0U3RyKGNoYXJzOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNoYXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoIXRoaXMuX2F0dGVtcHRDaGFyQ29kZShTdHJpbmdXcmFwcGVyLmNoYXJDb2RlQXQoY2hhcnMsIGkpKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcHJpdmF0ZSBfYXR0ZW1wdFN0ckNhc2VJbnNlbnNpdGl2ZShjaGFyczogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGFycy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKCF0aGlzLl9hdHRlbXB0Q2hhckNvZGVDYXNlSW5zZW5zaXRpdmUoU3RyaW5nV3JhcHBlci5jaGFyQ29kZUF0KGNoYXJzLCBpKSkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHByaXZhdGUgX3JlcXVpcmVTdHIoY2hhcnM6IHN0cmluZykge1xuICAgIHZhciBsb2NhdGlvbiA9IHRoaXMuX2dldExvY2F0aW9uKCk7XG4gICAgaWYgKCF0aGlzLl9hdHRlbXB0U3RyKGNoYXJzKSkge1xuICAgICAgdGhyb3cgdGhpcy5fY3JlYXRlRXJyb3IodW5leHBlY3RlZENoYXJhY3RlckVycm9yTXNnKHRoaXMucGVlayksIGxvY2F0aW9uKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9hdHRlbXB0Q2hhckNvZGVVbnRpbEZuKHByZWRpY2F0ZTogRnVuY3Rpb24pIHtcbiAgICB3aGlsZSAoIXByZWRpY2F0ZSh0aGlzLnBlZWspKSB7XG4gICAgICB0aGlzLl9hZHZhbmNlKCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfcmVxdWlyZUNoYXJDb2RlVW50aWxGbihwcmVkaWNhdGU6IEZ1bmN0aW9uLCBsZW46IG51bWJlcikge1xuICAgIHZhciBzdGFydCA9IHRoaXMuX2dldExvY2F0aW9uKCk7XG4gICAgdGhpcy5fYXR0ZW1wdENoYXJDb2RlVW50aWxGbihwcmVkaWNhdGUpO1xuICAgIGlmICh0aGlzLmluZGV4IC0gc3RhcnQub2Zmc2V0IDwgbGVuKSB7XG4gICAgICB0aHJvdyB0aGlzLl9jcmVhdGVFcnJvcih1bmV4cGVjdGVkQ2hhcmFjdGVyRXJyb3JNc2codGhpcy5wZWVrKSwgc3RhcnQpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2F0dGVtcHRVbnRpbENoYXIoY2hhcjogbnVtYmVyKSB7XG4gICAgd2hpbGUgKHRoaXMucGVlayAhPT0gY2hhcikge1xuICAgICAgdGhpcy5fYWR2YW5jZSgpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3JlYWRDaGFyKGRlY29kZUVudGl0aWVzOiBib29sZWFuKTogc3RyaW5nIHtcbiAgICBpZiAoZGVjb2RlRW50aXRpZXMgJiYgdGhpcy5wZWVrID09PSAkQU1QRVJTQU5EKSB7XG4gICAgICByZXR1cm4gdGhpcy5fZGVjb2RlRW50aXR5KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBpbmRleCA9IHRoaXMuaW5kZXg7XG4gICAgICB0aGlzLl9hZHZhbmNlKCk7XG4gICAgICByZXR1cm4gdGhpcy5pbnB1dFtpbmRleF07XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfZGVjb2RlRW50aXR5KCk6IHN0cmluZyB7XG4gICAgdmFyIHN0YXJ0ID0gdGhpcy5fZ2V0TG9jYXRpb24oKTtcbiAgICB0aGlzLl9hZHZhbmNlKCk7XG4gICAgaWYgKHRoaXMuX2F0dGVtcHRDaGFyQ29kZSgkSEFTSCkpIHtcbiAgICAgIGxldCBpc0hleCA9IHRoaXMuX2F0dGVtcHRDaGFyQ29kZSgkeCkgfHwgdGhpcy5fYXR0ZW1wdENoYXJDb2RlKCRYKTtcbiAgICAgIGxldCBudW1iZXJTdGFydCA9IHRoaXMuX2dldExvY2F0aW9uKCkub2Zmc2V0O1xuICAgICAgdGhpcy5fYXR0ZW1wdENoYXJDb2RlVW50aWxGbihpc0RpZ2l0RW50aXR5RW5kKTtcbiAgICAgIGlmICh0aGlzLnBlZWsgIT0gJFNFTUlDT0xPTikge1xuICAgICAgICB0aHJvdyB0aGlzLl9jcmVhdGVFcnJvcih1bmV4cGVjdGVkQ2hhcmFjdGVyRXJyb3JNc2codGhpcy5wZWVrKSwgdGhpcy5fZ2V0TG9jYXRpb24oKSk7XG4gICAgICB9XG4gICAgICB0aGlzLl9hZHZhbmNlKCk7XG4gICAgICBsZXQgc3RyTnVtID0gdGhpcy5pbnB1dC5zdWJzdHJpbmcobnVtYmVyU3RhcnQsIHRoaXMuaW5kZXggLSAxKTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGxldCBjaGFyQ29kZSA9IE51bWJlcldyYXBwZXIucGFyc2VJbnQoc3RyTnVtLCBpc0hleCA/IDE2IDogMTApO1xuICAgICAgICByZXR1cm4gU3RyaW5nV3JhcHBlci5mcm9tQ2hhckNvZGUoY2hhckNvZGUpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBsZXQgZW50aXR5ID0gdGhpcy5pbnB1dC5zdWJzdHJpbmcoc3RhcnQub2Zmc2V0ICsgMSwgdGhpcy5pbmRleCAtIDEpO1xuICAgICAgICB0aHJvdyB0aGlzLl9jcmVhdGVFcnJvcih1bmtub3duRW50aXR5RXJyb3JNc2coZW50aXR5KSwgc3RhcnQpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgc3RhcnRQb3NpdGlvbiA9IHRoaXMuX3NhdmVQb3NpdGlvbigpO1xuICAgICAgdGhpcy5fYXR0ZW1wdENoYXJDb2RlVW50aWxGbihpc05hbWVkRW50aXR5RW5kKTtcbiAgICAgIGlmICh0aGlzLnBlZWsgIT0gJFNFTUlDT0xPTikge1xuICAgICAgICB0aGlzLl9yZXN0b3JlUG9zaXRpb24oc3RhcnRQb3NpdGlvbik7XG4gICAgICAgIHJldHVybiAnJic7XG4gICAgICB9XG4gICAgICB0aGlzLl9hZHZhbmNlKCk7XG4gICAgICBsZXQgbmFtZSA9IHRoaXMuaW5wdXQuc3Vic3RyaW5nKHN0YXJ0Lm9mZnNldCArIDEsIHRoaXMuaW5kZXggLSAxKTtcbiAgICAgIGxldCBjaGFyID0gTkFNRURfRU5USVRJRVNbbmFtZV07XG4gICAgICBpZiAoaXNCbGFuayhjaGFyKSkge1xuICAgICAgICB0aHJvdyB0aGlzLl9jcmVhdGVFcnJvcih1bmtub3duRW50aXR5RXJyb3JNc2cobmFtZSksIHN0YXJ0KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBjaGFyO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2NvbnN1bWVSYXdUZXh0KGRlY29kZUVudGl0aWVzOiBib29sZWFuLCBmaXJzdENoYXJPZkVuZDogbnVtYmVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBhdHRlbXB0RW5kUmVzdDogRnVuY3Rpb24pOiBIdG1sVG9rZW4ge1xuICAgIHZhciB0YWdDbG9zZVN0YXJ0O1xuICAgIHZhciB0ZXh0U3RhcnQgPSB0aGlzLl9nZXRMb2NhdGlvbigpO1xuICAgIHRoaXMuX2JlZ2luVG9rZW4oZGVjb2RlRW50aXRpZXMgPyBIdG1sVG9rZW5UeXBlLkVTQ0FQQUJMRV9SQVdfVEVYVCA6IEh0bWxUb2tlblR5cGUuUkFXX1RFWFQsXG4gICAgICAgICAgICAgICAgICAgICB0ZXh0U3RhcnQpO1xuICAgIHZhciBwYXJ0cyA9IFtdO1xuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICB0YWdDbG9zZVN0YXJ0ID0gdGhpcy5fZ2V0TG9jYXRpb24oKTtcbiAgICAgIGlmICh0aGlzLl9hdHRlbXB0Q2hhckNvZGUoZmlyc3RDaGFyT2ZFbmQpICYmIGF0dGVtcHRFbmRSZXN0KCkpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5pbmRleCA+IHRhZ0Nsb3NlU3RhcnQub2Zmc2V0KSB7XG4gICAgICAgIHBhcnRzLnB1c2godGhpcy5pbnB1dC5zdWJzdHJpbmcodGFnQ2xvc2VTdGFydC5vZmZzZXQsIHRoaXMuaW5kZXgpKTtcbiAgICAgIH1cbiAgICAgIHdoaWxlICh0aGlzLnBlZWsgIT09IGZpcnN0Q2hhck9mRW5kKSB7XG4gICAgICAgIHBhcnRzLnB1c2godGhpcy5fcmVhZENoYXIoZGVjb2RlRW50aXRpZXMpKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2VuZFRva2VuKFt0aGlzLl9wcm9jZXNzQ2FycmlhZ2VSZXR1cm5zKHBhcnRzLmpvaW4oJycpKV0sIHRhZ0Nsb3NlU3RhcnQpO1xuICB9XG5cbiAgcHJpdmF0ZSBfY29uc3VtZUNvbW1lbnQoc3RhcnQ6IFBhcnNlTG9jYXRpb24pIHtcbiAgICB0aGlzLl9iZWdpblRva2VuKEh0bWxUb2tlblR5cGUuQ09NTUVOVF9TVEFSVCwgc3RhcnQpO1xuICAgIHRoaXMuX3JlcXVpcmVDaGFyQ29kZSgkTUlOVVMpO1xuICAgIHRoaXMuX2VuZFRva2VuKFtdKTtcbiAgICB2YXIgdGV4dFRva2VuID0gdGhpcy5fY29uc3VtZVJhd1RleHQoZmFsc2UsICRNSU5VUywgKCkgPT4gdGhpcy5fYXR0ZW1wdFN0cignLT4nKSk7XG4gICAgdGhpcy5fYmVnaW5Ub2tlbihIdG1sVG9rZW5UeXBlLkNPTU1FTlRfRU5ELCB0ZXh0VG9rZW4uc291cmNlU3Bhbi5lbmQpO1xuICAgIHRoaXMuX2VuZFRva2VuKFtdKTtcbiAgfVxuXG4gIHByaXZhdGUgX2NvbnN1bWVDZGF0YShzdGFydDogUGFyc2VMb2NhdGlvbikge1xuICAgIHRoaXMuX2JlZ2luVG9rZW4oSHRtbFRva2VuVHlwZS5DREFUQV9TVEFSVCwgc3RhcnQpO1xuICAgIHRoaXMuX3JlcXVpcmVTdHIoJ0NEQVRBWycpO1xuICAgIHRoaXMuX2VuZFRva2VuKFtdKTtcbiAgICB2YXIgdGV4dFRva2VuID0gdGhpcy5fY29uc3VtZVJhd1RleHQoZmFsc2UsICRSQlJBQ0tFVCwgKCkgPT4gdGhpcy5fYXR0ZW1wdFN0cignXT4nKSk7XG4gICAgdGhpcy5fYmVnaW5Ub2tlbihIdG1sVG9rZW5UeXBlLkNEQVRBX0VORCwgdGV4dFRva2VuLnNvdXJjZVNwYW4uZW5kKTtcbiAgICB0aGlzLl9lbmRUb2tlbihbXSk7XG4gIH1cblxuICBwcml2YXRlIF9jb25zdW1lRG9jVHlwZShzdGFydDogUGFyc2VMb2NhdGlvbikge1xuICAgIHRoaXMuX2JlZ2luVG9rZW4oSHRtbFRva2VuVHlwZS5ET0NfVFlQRSwgc3RhcnQpO1xuICAgIHRoaXMuX2F0dGVtcHRVbnRpbENoYXIoJEdUKTtcbiAgICB0aGlzLl9hZHZhbmNlKCk7XG4gICAgdGhpcy5fZW5kVG9rZW4oW3RoaXMuaW5wdXQuc3Vic3RyaW5nKHN0YXJ0Lm9mZnNldCArIDIsIHRoaXMuaW5kZXggLSAxKV0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfY29uc3VtZVByZWZpeEFuZE5hbWUoKTogc3RyaW5nW10ge1xuICAgIHZhciBuYW1lT3JQcmVmaXhTdGFydCA9IHRoaXMuaW5kZXg7XG4gICAgdmFyIHByZWZpeCA9IG51bGw7XG4gICAgd2hpbGUgKHRoaXMucGVlayAhPT0gJENPTE9OICYmICFpc1ByZWZpeEVuZCh0aGlzLnBlZWspKSB7XG4gICAgICB0aGlzLl9hZHZhbmNlKCk7XG4gICAgfVxuICAgIHZhciBuYW1lU3RhcnQ7XG4gICAgaWYgKHRoaXMucGVlayA9PT0gJENPTE9OKSB7XG4gICAgICB0aGlzLl9hZHZhbmNlKCk7XG4gICAgICBwcmVmaXggPSB0aGlzLmlucHV0LnN1YnN0cmluZyhuYW1lT3JQcmVmaXhTdGFydCwgdGhpcy5pbmRleCAtIDEpO1xuICAgICAgbmFtZVN0YXJ0ID0gdGhpcy5pbmRleDtcbiAgICB9IGVsc2Uge1xuICAgICAgbmFtZVN0YXJ0ID0gbmFtZU9yUHJlZml4U3RhcnQ7XG4gICAgfVxuICAgIHRoaXMuX3JlcXVpcmVDaGFyQ29kZVVudGlsRm4oaXNOYW1lRW5kLCB0aGlzLmluZGV4ID09PSBuYW1lU3RhcnQgPyAxIDogMCk7XG4gICAgdmFyIG5hbWUgPSB0aGlzLmlucHV0LnN1YnN0cmluZyhuYW1lU3RhcnQsIHRoaXMuaW5kZXgpO1xuICAgIHJldHVybiBbcHJlZml4LCBuYW1lXTtcbiAgfVxuXG4gIHByaXZhdGUgX2NvbnN1bWVUYWdPcGVuKHN0YXJ0OiBQYXJzZUxvY2F0aW9uKSB7XG4gICAgbGV0IHNhdmVkUG9zID0gdGhpcy5fc2F2ZVBvc2l0aW9uKCk7XG4gICAgbGV0IGxvd2VyY2FzZVRhZ05hbWU7XG4gICAgdHJ5IHtcbiAgICAgIGlmICghaXNBc2NpaUxldHRlcih0aGlzLnBlZWspKSB7XG4gICAgICAgIHRocm93IHRoaXMuX2NyZWF0ZUVycm9yKHVuZXhwZWN0ZWRDaGFyYWN0ZXJFcnJvck1zZyh0aGlzLnBlZWspLCB0aGlzLl9nZXRMb2NhdGlvbigpKTtcbiAgICAgIH1cbiAgICAgIHZhciBuYW1lU3RhcnQgPSB0aGlzLmluZGV4O1xuICAgICAgdGhpcy5fY29uc3VtZVRhZ09wZW5TdGFydChzdGFydCk7XG4gICAgICBsb3dlcmNhc2VUYWdOYW1lID0gdGhpcy5pbnB1dC5zdWJzdHJpbmcobmFtZVN0YXJ0LCB0aGlzLmluZGV4KS50b0xvd2VyQ2FzZSgpO1xuICAgICAgdGhpcy5fYXR0ZW1wdENoYXJDb2RlVW50aWxGbihpc05vdFdoaXRlc3BhY2UpO1xuICAgICAgd2hpbGUgKHRoaXMucGVlayAhPT0gJFNMQVNIICYmIHRoaXMucGVlayAhPT0gJEdUKSB7XG4gICAgICAgIHRoaXMuX2NvbnN1bWVBdHRyaWJ1dGVOYW1lKCk7XG4gICAgICAgIHRoaXMuX2F0dGVtcHRDaGFyQ29kZVVudGlsRm4oaXNOb3RXaGl0ZXNwYWNlKTtcbiAgICAgICAgaWYgKHRoaXMuX2F0dGVtcHRDaGFyQ29kZSgkRVEpKSB7XG4gICAgICAgICAgdGhpcy5fYXR0ZW1wdENoYXJDb2RlVW50aWxGbihpc05vdFdoaXRlc3BhY2UpO1xuICAgICAgICAgIHRoaXMuX2NvbnN1bWVBdHRyaWJ1dGVWYWx1ZSgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2F0dGVtcHRDaGFyQ29kZVVudGlsRm4oaXNOb3RXaGl0ZXNwYWNlKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2NvbnN1bWVUYWdPcGVuRW5kKCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgaWYgKGUgaW5zdGFuY2VvZiBDb250cm9sRmxvd0Vycm9yKSB7XG4gICAgICAgIC8vIFdoZW4gdGhlIHN0YXJ0IHRhZyBpcyBpbnZhbGlkLCBhc3N1bWUgd2Ugd2FudCBhIFwiPFwiXG4gICAgICAgIHRoaXMuX3Jlc3RvcmVQb3NpdGlvbihzYXZlZFBvcyk7XG4gICAgICAgIC8vIEJhY2sgdG8gYmFjayB0ZXh0IHRva2VucyBhcmUgbWVyZ2VkIGF0IHRoZSBlbmRcbiAgICAgICAgdGhpcy5fYmVnaW5Ub2tlbihIdG1sVG9rZW5UeXBlLlRFWFQsIHN0YXJ0KTtcbiAgICAgICAgdGhpcy5fZW5kVG9rZW4oWyc8J10pO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHRocm93IGU7XG4gICAgfVxuXG4gICAgdmFyIGNvbnRlbnRUb2tlblR5cGUgPSBnZXRIdG1sVGFnRGVmaW5pdGlvbihsb3dlcmNhc2VUYWdOYW1lKS5jb250ZW50VHlwZTtcbiAgICBpZiAoY29udGVudFRva2VuVHlwZSA9PT0gSHRtbFRhZ0NvbnRlbnRUeXBlLlJBV19URVhUKSB7XG4gICAgICB0aGlzLl9jb25zdW1lUmF3VGV4dFdpdGhUYWdDbG9zZShsb3dlcmNhc2VUYWdOYW1lLCBmYWxzZSk7XG4gICAgfSBlbHNlIGlmIChjb250ZW50VG9rZW5UeXBlID09PSBIdG1sVGFnQ29udGVudFR5cGUuRVNDQVBBQkxFX1JBV19URVhUKSB7XG4gICAgICB0aGlzLl9jb25zdW1lUmF3VGV4dFdpdGhUYWdDbG9zZShsb3dlcmNhc2VUYWdOYW1lLCB0cnVlKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9jb25zdW1lUmF3VGV4dFdpdGhUYWdDbG9zZShsb3dlcmNhc2VUYWdOYW1lOiBzdHJpbmcsIGRlY29kZUVudGl0aWVzOiBib29sZWFuKSB7XG4gICAgdmFyIHRleHRUb2tlbiA9IHRoaXMuX2NvbnN1bWVSYXdUZXh0KGRlY29kZUVudGl0aWVzLCAkTFQsICgpID0+IHtcbiAgICAgIGlmICghdGhpcy5fYXR0ZW1wdENoYXJDb2RlKCRTTEFTSCkpIHJldHVybiBmYWxzZTtcbiAgICAgIHRoaXMuX2F0dGVtcHRDaGFyQ29kZVVudGlsRm4oaXNOb3RXaGl0ZXNwYWNlKTtcbiAgICAgIGlmICghdGhpcy5fYXR0ZW1wdFN0ckNhc2VJbnNlbnNpdGl2ZShsb3dlcmNhc2VUYWdOYW1lKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgdGhpcy5fYXR0ZW1wdENoYXJDb2RlVW50aWxGbihpc05vdFdoaXRlc3BhY2UpO1xuICAgICAgaWYgKCF0aGlzLl9hdHRlbXB0Q2hhckNvZGUoJEdUKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSk7XG4gICAgdGhpcy5fYmVnaW5Ub2tlbihIdG1sVG9rZW5UeXBlLlRBR19DTE9TRSwgdGV4dFRva2VuLnNvdXJjZVNwYW4uZW5kKTtcbiAgICB0aGlzLl9lbmRUb2tlbihbbnVsbCwgbG93ZXJjYXNlVGFnTmFtZV0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfY29uc3VtZVRhZ09wZW5TdGFydChzdGFydDogUGFyc2VMb2NhdGlvbikge1xuICAgIHRoaXMuX2JlZ2luVG9rZW4oSHRtbFRva2VuVHlwZS5UQUdfT1BFTl9TVEFSVCwgc3RhcnQpO1xuICAgIHZhciBwYXJ0cyA9IHRoaXMuX2NvbnN1bWVQcmVmaXhBbmROYW1lKCk7XG4gICAgdGhpcy5fZW5kVG9rZW4ocGFydHMpO1xuICB9XG5cbiAgcHJpdmF0ZSBfY29uc3VtZUF0dHJpYnV0ZU5hbWUoKSB7XG4gICAgdGhpcy5fYmVnaW5Ub2tlbihIdG1sVG9rZW5UeXBlLkFUVFJfTkFNRSk7XG4gICAgdmFyIHByZWZpeEFuZE5hbWUgPSB0aGlzLl9jb25zdW1lUHJlZml4QW5kTmFtZSgpO1xuICAgIHRoaXMuX2VuZFRva2VuKHByZWZpeEFuZE5hbWUpO1xuICB9XG5cbiAgcHJpdmF0ZSBfY29uc3VtZUF0dHJpYnV0ZVZhbHVlKCkge1xuICAgIHRoaXMuX2JlZ2luVG9rZW4oSHRtbFRva2VuVHlwZS5BVFRSX1ZBTFVFKTtcbiAgICB2YXIgdmFsdWU7XG4gICAgaWYgKHRoaXMucGVlayA9PT0gJFNRIHx8IHRoaXMucGVlayA9PT0gJERRKSB7XG4gICAgICB2YXIgcXVvdGVDaGFyID0gdGhpcy5wZWVrO1xuICAgICAgdGhpcy5fYWR2YW5jZSgpO1xuICAgICAgdmFyIHBhcnRzID0gW107XG4gICAgICB3aGlsZSAodGhpcy5wZWVrICE9PSBxdW90ZUNoYXIpIHtcbiAgICAgICAgcGFydHMucHVzaCh0aGlzLl9yZWFkQ2hhcih0cnVlKSk7XG4gICAgICB9XG4gICAgICB2YWx1ZSA9IHBhcnRzLmpvaW4oJycpO1xuICAgICAgdGhpcy5fYWR2YW5jZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgdmFsdWVTdGFydCA9IHRoaXMuaW5kZXg7XG4gICAgICB0aGlzLl9yZXF1aXJlQ2hhckNvZGVVbnRpbEZuKGlzTmFtZUVuZCwgMSk7XG4gICAgICB2YWx1ZSA9IHRoaXMuaW5wdXQuc3Vic3RyaW5nKHZhbHVlU3RhcnQsIHRoaXMuaW5kZXgpO1xuICAgIH1cbiAgICB0aGlzLl9lbmRUb2tlbihbdGhpcy5fcHJvY2Vzc0NhcnJpYWdlUmV0dXJucyh2YWx1ZSldKTtcbiAgfVxuXG4gIHByaXZhdGUgX2NvbnN1bWVUYWdPcGVuRW5kKCkge1xuICAgIHZhciB0b2tlblR5cGUgPSB0aGlzLl9hdHRlbXB0Q2hhckNvZGUoJFNMQVNIKSA/IEh0bWxUb2tlblR5cGUuVEFHX09QRU5fRU5EX1ZPSUQgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEh0bWxUb2tlblR5cGUuVEFHX09QRU5fRU5EO1xuICAgIHRoaXMuX2JlZ2luVG9rZW4odG9rZW5UeXBlKTtcbiAgICB0aGlzLl9yZXF1aXJlQ2hhckNvZGUoJEdUKTtcbiAgICB0aGlzLl9lbmRUb2tlbihbXSk7XG4gIH1cblxuICBwcml2YXRlIF9jb25zdW1lVGFnQ2xvc2Uoc3RhcnQ6IFBhcnNlTG9jYXRpb24pIHtcbiAgICB0aGlzLl9iZWdpblRva2VuKEh0bWxUb2tlblR5cGUuVEFHX0NMT1NFLCBzdGFydCk7XG4gICAgdGhpcy5fYXR0ZW1wdENoYXJDb2RlVW50aWxGbihpc05vdFdoaXRlc3BhY2UpO1xuICAgIHZhciBwcmVmaXhBbmROYW1lO1xuICAgIHByZWZpeEFuZE5hbWUgPSB0aGlzLl9jb25zdW1lUHJlZml4QW5kTmFtZSgpO1xuICAgIHRoaXMuX2F0dGVtcHRDaGFyQ29kZVVudGlsRm4oaXNOb3RXaGl0ZXNwYWNlKTtcbiAgICB0aGlzLl9yZXF1aXJlQ2hhckNvZGUoJEdUKTtcbiAgICB0aGlzLl9lbmRUb2tlbihwcmVmaXhBbmROYW1lKTtcbiAgfVxuXG4gIHByaXZhdGUgX2NvbnN1bWVUZXh0KCkge1xuICAgIHZhciBzdGFydCA9IHRoaXMuX2dldExvY2F0aW9uKCk7XG4gICAgdGhpcy5fYmVnaW5Ub2tlbihIdG1sVG9rZW5UeXBlLlRFWFQsIHN0YXJ0KTtcbiAgICB2YXIgcGFydHMgPSBbdGhpcy5fcmVhZENoYXIodHJ1ZSldO1xuICAgIHdoaWxlICghaXNUZXh0RW5kKHRoaXMucGVlaykpIHtcbiAgICAgIHBhcnRzLnB1c2godGhpcy5fcmVhZENoYXIodHJ1ZSkpO1xuICAgIH1cbiAgICB0aGlzLl9lbmRUb2tlbihbdGhpcy5fcHJvY2Vzc0NhcnJpYWdlUmV0dXJucyhwYXJ0cy5qb2luKCcnKSldKTtcbiAgfVxuXG4gIHByaXZhdGUgX3NhdmVQb3NpdGlvbigpOiBudW1iZXJbXSB7XG4gICAgcmV0dXJuIFt0aGlzLnBlZWssIHRoaXMuaW5kZXgsIHRoaXMuY29sdW1uLCB0aGlzLmxpbmUsIHRoaXMudG9rZW5zLmxlbmd0aF07XG4gIH1cblxuICBwcml2YXRlIF9yZXN0b3JlUG9zaXRpb24ocG9zaXRpb246IG51bWJlcltdKTogdm9pZCB7XG4gICAgdGhpcy5wZWVrID0gcG9zaXRpb25bMF07XG4gICAgdGhpcy5pbmRleCA9IHBvc2l0aW9uWzFdO1xuICAgIHRoaXMuY29sdW1uID0gcG9zaXRpb25bMl07XG4gICAgdGhpcy5saW5lID0gcG9zaXRpb25bM107XG4gICAgbGV0IG5iVG9rZW5zID0gcG9zaXRpb25bNF07XG4gICAgaWYgKG5iVG9rZW5zIDwgdGhpcy50b2tlbnMubGVuZ3RoKSB7XG4gICAgICAvLyByZW1vdmUgYW55IGV4dHJhIHRva2Vuc1xuICAgICAgdGhpcy50b2tlbnMgPSBMaXN0V3JhcHBlci5zbGljZSh0aGlzLnRva2VucywgMCwgbmJUb2tlbnMpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBpc05vdFdoaXRlc3BhY2UoY29kZTogbnVtYmVyKTogYm9vbGVhbiB7XG4gIHJldHVybiAhaXNXaGl0ZXNwYWNlKGNvZGUpIHx8IGNvZGUgPT09ICRFT0Y7XG59XG5cbmZ1bmN0aW9uIGlzV2hpdGVzcGFjZShjb2RlOiBudW1iZXIpOiBib29sZWFuIHtcbiAgcmV0dXJuIChjb2RlID49ICRUQUIgJiYgY29kZSA8PSAkU1BBQ0UpIHx8IChjb2RlID09PSAkTkJTUCk7XG59XG5cbmZ1bmN0aW9uIGlzTmFtZUVuZChjb2RlOiBudW1iZXIpOiBib29sZWFuIHtcbiAgcmV0dXJuIGlzV2hpdGVzcGFjZShjb2RlKSB8fCBjb2RlID09PSAkR1QgfHwgY29kZSA9PT0gJFNMQVNIIHx8IGNvZGUgPT09ICRTUSB8fCBjb2RlID09PSAkRFEgfHxcbiAgICAgICAgIGNvZGUgPT09ICRFUTtcbn1cblxuZnVuY3Rpb24gaXNQcmVmaXhFbmQoY29kZTogbnVtYmVyKTogYm9vbGVhbiB7XG4gIHJldHVybiAoY29kZSA8ICRhIHx8ICR6IDwgY29kZSkgJiYgKGNvZGUgPCAkQSB8fCAkWiA8IGNvZGUpICYmIChjb2RlIDwgJDAgfHwgY29kZSA+ICQ5KTtcbn1cblxuZnVuY3Rpb24gaXNEaWdpdEVudGl0eUVuZChjb2RlOiBudW1iZXIpOiBib29sZWFuIHtcbiAgcmV0dXJuIGNvZGUgPT0gJFNFTUlDT0xPTiB8fCBjb2RlID09ICRFT0YgfHwgIWlzQXNjaWlIZXhEaWdpdChjb2RlKTtcbn1cblxuZnVuY3Rpb24gaXNOYW1lZEVudGl0eUVuZChjb2RlOiBudW1iZXIpOiBib29sZWFuIHtcbiAgcmV0dXJuIGNvZGUgPT0gJFNFTUlDT0xPTiB8fCBjb2RlID09ICRFT0YgfHwgIWlzQXNjaWlMZXR0ZXIoY29kZSk7XG59XG5cbmZ1bmN0aW9uIGlzVGV4dEVuZChjb2RlOiBudW1iZXIpOiBib29sZWFuIHtcbiAgcmV0dXJuIGNvZGUgPT09ICRMVCB8fCBjb2RlID09PSAkRU9GO1xufVxuXG5mdW5jdGlvbiBpc0FzY2lpTGV0dGVyKGNvZGU6IG51bWJlcik6IGJvb2xlYW4ge1xuICByZXR1cm4gY29kZSA+PSAkYSAmJiBjb2RlIDw9ICR6IHx8IGNvZGUgPj0gJEEgJiYgY29kZSA8PSAkWjtcbn1cblxuZnVuY3Rpb24gaXNBc2NpaUhleERpZ2l0KGNvZGU6IG51bWJlcik6IGJvb2xlYW4ge1xuICByZXR1cm4gY29kZSA+PSAkYSAmJiBjb2RlIDw9ICRmIHx8IGNvZGUgPj0gJEEgJiYgY29kZSA8PSAkRiB8fCBjb2RlID49ICQwICYmIGNvZGUgPD0gJDk7XG59XG5cbmZ1bmN0aW9uIGNvbXBhcmVDaGFyQ29kZUNhc2VJbnNlbnNpdGl2ZShjb2RlMTogbnVtYmVyLCBjb2RlMjogbnVtYmVyKTogYm9vbGVhbiB7XG4gIHJldHVybiB0b1VwcGVyQ2FzZUNoYXJDb2RlKGNvZGUxKSA9PSB0b1VwcGVyQ2FzZUNoYXJDb2RlKGNvZGUyKTtcbn1cblxuZnVuY3Rpb24gdG9VcHBlckNhc2VDaGFyQ29kZShjb2RlOiBudW1iZXIpOiBudW1iZXIge1xuICByZXR1cm4gY29kZSA+PSAkYSAmJiBjb2RlIDw9ICR6ID8gY29kZSAtICRhICsgJEEgOiBjb2RlO1xufVxuXG5mdW5jdGlvbiBtZXJnZVRleHRUb2tlbnMoc3JjVG9rZW5zOiBIdG1sVG9rZW5bXSk6IEh0bWxUb2tlbltdIHtcbiAgbGV0IGRzdFRva2VucyA9IFtdO1xuICBsZXQgbGFzdERzdFRva2VuOiBIdG1sVG9rZW47XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc3JjVG9rZW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgbGV0IHRva2VuID0gc3JjVG9rZW5zW2ldO1xuICAgIGlmIChpc1ByZXNlbnQobGFzdERzdFRva2VuKSAmJiBsYXN0RHN0VG9rZW4udHlwZSA9PSBIdG1sVG9rZW5UeXBlLlRFWFQgJiZcbiAgICAgICAgdG9rZW4udHlwZSA9PSBIdG1sVG9rZW5UeXBlLlRFWFQpIHtcbiAgICAgIGxhc3REc3RUb2tlbi5wYXJ0c1swXSArPSB0b2tlbi5wYXJ0c1swXTtcbiAgICAgIGxhc3REc3RUb2tlbi5zb3VyY2VTcGFuLmVuZCA9IHRva2VuLnNvdXJjZVNwYW4uZW5kO1xuICAgIH0gZWxzZSB7XG4gICAgICBsYXN0RHN0VG9rZW4gPSB0b2tlbjtcbiAgICAgIGRzdFRva2Vucy5wdXNoKGxhc3REc3RUb2tlbik7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGRzdFRva2Vucztcbn1cbiJdfQ==