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
const $A = 65;
const $Z = 90;
const $LBRACKET = 91;
const $RBRACKET = 93;
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
        this.inputLowercase = file.content.toLowerCase();
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
                if (this._attemptChar($LT)) {
                    if (this._attemptChar($BANG)) {
                        if (this._attemptChar($LBRACKET)) {
                            this._consumeCdata(start);
                        }
                        else if (this._attemptChar($MINUS)) {
                            this._consumeComment(start);
                        }
                        else {
                            this._consumeDocType(start);
                        }
                    }
                    else if (this._attemptChar($SLASH)) {
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
        this.peek = this.index >= this.length ? $EOF : StringWrapper.charCodeAt(this.inputLowercase, this.index);
    }
    _attemptChar(charCode) {
        if (this.peek === charCode) {
            this._advance();
            return true;
        }
        return false;
    }
    _requireChar(charCode) {
        var location = this._getLocation();
        if (!this._attemptChar(charCode)) {
            throw this._createError(unexpectedCharacterErrorMsg(this.peek), location);
        }
    }
    _attemptChars(chars) {
        for (var i = 0; i < chars.length; i++) {
            if (!this._attemptChar(StringWrapper.charCodeAt(chars, i))) {
                return false;
            }
        }
        return true;
    }
    _requireChars(chars) {
        var location = this._getLocation();
        if (!this._attemptChars(chars)) {
            throw this._createError(unexpectedCharacterErrorMsg(this.peek), location);
        }
    }
    _attemptUntilFn(predicate) {
        while (!predicate(this.peek)) {
            this._advance();
        }
    }
    _requireUntilFn(predicate, len) {
        var start = this._getLocation();
        this._attemptUntilFn(predicate);
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
        if (this._attemptChar($HASH)) {
            let isHex = this._attemptChar($x);
            let numberStart = this._getLocation().offset;
            this._attemptUntilFn(isDigitEntityEnd);
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
            this._attemptUntilFn(isNamedEntityEnd);
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
            if (this._attemptChar(firstCharOfEnd) && attemptEndRest()) {
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
        this._requireChar($MINUS);
        this._endToken([]);
        var textToken = this._consumeRawText(false, $MINUS, () => this._attemptChars('->'));
        this._beginToken(HtmlTokenType.COMMENT_END, textToken.sourceSpan.end);
        this._endToken([]);
    }
    _consumeCdata(start) {
        this._beginToken(HtmlTokenType.CDATA_START, start);
        this._requireChars('cdata[');
        this._endToken([]);
        var textToken = this._consumeRawText(false, $RBRACKET, () => this._attemptChars(']>'));
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
        this._requireUntilFn(isNameEnd, this.index === nameStart ? 1 : 0);
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
            lowercaseTagName = this.inputLowercase.substring(nameStart, this.index);
            this._attemptUntilFn(isNotWhitespace);
            while (this.peek !== $SLASH && this.peek !== $GT) {
                this._consumeAttributeName();
                this._attemptUntilFn(isNotWhitespace);
                if (this._attemptChar($EQ)) {
                    this._attemptUntilFn(isNotWhitespace);
                    this._consumeAttributeValue();
                }
                this._attemptUntilFn(isNotWhitespace);
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
            if (!this._attemptChar($SLASH))
                return false;
            this._attemptUntilFn(isNotWhitespace);
            if (!this._attemptChars(lowercaseTagName))
                return false;
            this._attemptUntilFn(isNotWhitespace);
            if (!this._attemptChar($GT))
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
            this._requireUntilFn(isNameEnd, 1);
            value = this.input.substring(valueStart, this.index);
        }
        this._endToken([this._processCarriageReturns(value)]);
    }
    _consumeTagOpenEnd() {
        var tokenType = this._attemptChar($SLASH) ? HtmlTokenType.TAG_OPEN_END_VOID : HtmlTokenType.TAG_OPEN_END;
        this._beginToken(tokenType);
        this._requireChar($GT);
        this._endToken([]);
    }
    _consumeTagClose(start) {
        this._beginToken(HtmlTokenType.TAG_CLOSE, start);
        this._attemptUntilFn(isNotWhitespace);
        var prefixAndName;
        prefixAndName = this._consumePrefixAndName();
        this._attemptUntilFn(isNotWhitespace);
        this._requireChar($GT);
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
    return code >= $a && code <= $z;
}
function isAsciiHexDigit(code) {
    return code >= $a && code <= $f || code >= $0 && code <= $9;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHRtbF9sZXhlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb21waWxlci9odG1sX2xleGVyLnRzIl0sIm5hbWVzIjpbIkh0bWxUb2tlblR5cGUiLCJIdG1sVG9rZW4iLCJIdG1sVG9rZW4uY29uc3RydWN0b3IiLCJIdG1sVG9rZW5FcnJvciIsIkh0bWxUb2tlbkVycm9yLmNvbnN0cnVjdG9yIiwiSHRtbFRva2VuaXplUmVzdWx0IiwiSHRtbFRva2VuaXplUmVzdWx0LmNvbnN0cnVjdG9yIiwidG9rZW5pemVIdG1sIiwidW5leHBlY3RlZENoYXJhY3RlckVycm9yTXNnIiwidW5rbm93bkVudGl0eUVycm9yTXNnIiwiQ29udHJvbEZsb3dFcnJvciIsIkNvbnRyb2xGbG93RXJyb3IuY29uc3RydWN0b3IiLCJfSHRtbFRva2VuaXplciIsIl9IdG1sVG9rZW5pemVyLmNvbnN0cnVjdG9yIiwiX0h0bWxUb2tlbml6ZXIuX3Byb2Nlc3NDYXJyaWFnZVJldHVybnMiLCJfSHRtbFRva2VuaXplci50b2tlbml6ZSIsIl9IdG1sVG9rZW5pemVyLl9nZXRMb2NhdGlvbiIsIl9IdG1sVG9rZW5pemVyLl9iZWdpblRva2VuIiwiX0h0bWxUb2tlbml6ZXIuX2VuZFRva2VuIiwiX0h0bWxUb2tlbml6ZXIuX2NyZWF0ZUVycm9yIiwiX0h0bWxUb2tlbml6ZXIuX2FkdmFuY2UiLCJfSHRtbFRva2VuaXplci5fYXR0ZW1wdENoYXIiLCJfSHRtbFRva2VuaXplci5fcmVxdWlyZUNoYXIiLCJfSHRtbFRva2VuaXplci5fYXR0ZW1wdENoYXJzIiwiX0h0bWxUb2tlbml6ZXIuX3JlcXVpcmVDaGFycyIsIl9IdG1sVG9rZW5pemVyLl9hdHRlbXB0VW50aWxGbiIsIl9IdG1sVG9rZW5pemVyLl9yZXF1aXJlVW50aWxGbiIsIl9IdG1sVG9rZW5pemVyLl9hdHRlbXB0VW50aWxDaGFyIiwiX0h0bWxUb2tlbml6ZXIuX3JlYWRDaGFyIiwiX0h0bWxUb2tlbml6ZXIuX2RlY29kZUVudGl0eSIsIl9IdG1sVG9rZW5pemVyLl9jb25zdW1lUmF3VGV4dCIsIl9IdG1sVG9rZW5pemVyLl9jb25zdW1lQ29tbWVudCIsIl9IdG1sVG9rZW5pemVyLl9jb25zdW1lQ2RhdGEiLCJfSHRtbFRva2VuaXplci5fY29uc3VtZURvY1R5cGUiLCJfSHRtbFRva2VuaXplci5fY29uc3VtZVByZWZpeEFuZE5hbWUiLCJfSHRtbFRva2VuaXplci5fY29uc3VtZVRhZ09wZW4iLCJfSHRtbFRva2VuaXplci5fY29uc3VtZVJhd1RleHRXaXRoVGFnQ2xvc2UiLCJfSHRtbFRva2VuaXplci5fY29uc3VtZVRhZ09wZW5TdGFydCIsIl9IdG1sVG9rZW5pemVyLl9jb25zdW1lQXR0cmlidXRlTmFtZSIsIl9IdG1sVG9rZW5pemVyLl9jb25zdW1lQXR0cmlidXRlVmFsdWUiLCJfSHRtbFRva2VuaXplci5fY29uc3VtZVRhZ09wZW5FbmQiLCJfSHRtbFRva2VuaXplci5fY29uc3VtZVRhZ0Nsb3NlIiwiX0h0bWxUb2tlbml6ZXIuX2NvbnN1bWVUZXh0IiwiX0h0bWxUb2tlbml6ZXIuX3NhdmVQb3NpdGlvbiIsIl9IdG1sVG9rZW5pemVyLl9yZXN0b3JlUG9zaXRpb24iLCJpc05vdFdoaXRlc3BhY2UiLCJpc1doaXRlc3BhY2UiLCJpc05hbWVFbmQiLCJpc1ByZWZpeEVuZCIsImlzRGlnaXRFbnRpdHlFbmQiLCJpc05hbWVkRW50aXR5RW5kIiwiaXNUZXh0RW5kIiwiaXNBc2NpaUxldHRlciIsImlzQXNjaWlIZXhEaWdpdCIsIm1lcmdlVGV4dFRva2VucyJdLCJtYXBwaW5ncyI6Ik9BQU8sRUFDTCxhQUFhLEVBQ2IsYUFBYSxFQUNiLFNBQVMsRUFDVCxPQUFPLEVBR1IsTUFBTSwwQkFBMEI7T0FDMUIsRUFBQyxXQUFXLEVBQUMsTUFBTSxnQ0FBZ0M7T0FDbkQsRUFBQyxhQUFhLEVBQUUsVUFBVSxFQUFFLGVBQWUsRUFBRSxlQUFlLEVBQUMsTUFBTSxjQUFjO09BQ2pGLEVBQUMsb0JBQW9CLEVBQUUs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SUFBSUEsS0FBS0EsR0FBR0EsSUFBSUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0E7WUFDbENBLElBQUlBLFdBQVdBLEdBQUdBLElBQUlBLENBQUNBLFlBQVlBLEVBQUVBLENBQUNBLE1BQU1BLENBQUNBO1lBQzdDQSxJQUFJQSxDQUFDQSxlQUFlQSxDQUFDQSxnQkFBZ0JBLENBQUNBLENBQUNBO1lBQ3ZDQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxJQUFJQSxVQUFVQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDNUJBLE1BQU1BLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLDJCQUEyQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsSUFBSUEsQ0FBQ0EsWUFBWUEsRUFBRUEsQ0FBQ0EsQ0FBQ0E7WUFDdkZBLENBQUNBO1lBQ0RBLElBQUlBLENBQUNBLFFBQVFBLEVBQUVBLENBQUNBO1lBQ2hCQSxJQUFJQSxNQUFNQSxHQUFHQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxTQUFTQSxDQUFDQSxXQUFXQSxFQUFFQSxJQUFJQSxDQUFDQSxLQUFLQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUMvREEsSUFBSUEsQ0FBQ0E7Z0JBQ0hBLElBQUlBLFFBQVFBLEdBQUdBLGFBQWFBLENBQUNBLFFBQVFBLENBQUNBLE1BQU1BLEVBQUVBLEtBQUtBLEdBQUdBLEVBQUVBLEdBQUdBLEVBQUVBLENBQUNBLENBQUNBO2dCQUMvREEsTUFBTUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0E7WUFDOUNBLENBQUVBO1lBQUFBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUNYQSxJQUFJQSxNQUFNQSxHQUFHQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxTQUFTQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxFQUFFQSxJQUFJQSxDQUFDQSxLQUFLQSxHQUFHQSxD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SUFBSUEsWUFBWUEsQ0FBQ0EsSUFBSUEsSUFBSUEsYUFBYUEsQ0FBQ0EsSUFBSUE7WUFDbEVBLEtBQUtBLENBQUNBLElBQUlBLElBQUlBLGFBQWFBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO1lBQ3JDQSxZQUFZQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxLQUFLQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN4Q0EsWUFBWUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsR0FBR0EsR0FBR0EsS0FBS0EsQ0FBQ0EsVUFBVUEsQ0FBQ0EsR0FBR0EsQ0FBQ0E7UUFDckRBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLENBQUNBO1lBQ05BLFlBQVlBLEdBQUdBLEtBQUtBLENBQUNBO1lBQ3JCQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxZQUFZQSxDQUFDQSxDQUFDQTtRQUMvQkEsQ0FBQ0E7SUFDSEEsQ0FBQ0E7SUFFREEsTUFBTUEsQ0FBQ0EsU0FBU0EsQ0FBQ0E7QUFDbkJBLENBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgU3RyaW5nV3JhcHBlcixcbiAgTnVtYmVyV3JhcHBlcixcbiAgaXNQcmVzZW50LFxuICBpc0JsYW5rLFxuICBDT05TVF9FWFBSLFxuICBzZXJpYWxpemVFbnVtXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0xpc3RXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtQYXJzZUxvY2F0aW9uLCBQYXJzZUVycm9yLCBQYXJzZVNvdXJjZUZpbGUsIFBhcnNlU291cmNlU3Bhbn0gZnJvbSAnLi9wYXJzZV91dGlsJztcbmltcG9ydCB7Z2V0SHRtbFRhZ0RlZmluaXRpb24sIEh0bWxUYWdDb250ZW50VHlwZSwgTkFNRURfRU5USVRJRVN9IGZyb20gJy4vaHRtbF90YWdzJztcblxuZXhwb3J0IGVudW0gSHRtbFRva2VuVHlwZSB7XG4gIFRBR19PUEVOX1NUQVJULFxuICBUQUdfT1BFTl9FTkQsXG4gIFRBR19PUEVOX0VORF9WT0lELFxuICBUQUdfQ0xPU0UsXG4gIFRFWFQsXG4gIEVTQ0FQQUJMRV9SQVdfVEVYVCxcbiAgUkFXX1RFWFQsXG4gIENPTU1FTlRfU1RBUlQsXG4gIENPTU1FTlRfRU5ELFxuICBDREFUQV9TVEFSVCxcbiAgQ0RBVEFfRU5ELFxuICBBVFRSX05BTUUsXG4gIEFUVFJfVkFMVUUsXG4gIERPQ19UWVBFLFxuICBFT0Zcbn1cblxuZXhwb3J0IGNsYXNzIEh0bWxUb2tlbiB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB0eXBlOiBIdG1sVG9rZW5UeXBlLCBwdWJsaWMgcGFydHM6IHN0cmluZ1tdLFxuICAgICAgICAgICAgICBwdWJsaWMgc291cmNlU3BhbjogUGFyc2VTb3VyY2VTcGFuKSB7fVxufVxuXG5leHBvcnQgY2xhc3MgSHRtbFRva2VuRXJyb3IgZXh0ZW5kcyBQYXJzZUVycm9yIHtcbiAgY29uc3RydWN0b3IoZXJyb3JNc2c6IHN0cmluZywgcHVibGljIHRva2VuVHlwZTogSHRtbFRva2VuVHlwZSwgbG9jYXRpb246IFBhcnNlTG9jYXRpb24pIHtcbiAgICBzdXBlcihsb2NhdGlvbiwgZXJyb3JNc2cpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBIdG1sVG9rZW5pemVSZXN1bHQge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgdG9rZW5zOiBIdG1sVG9rZW5bXSwgcHVibGljIGVycm9yczogSHRtbFRva2VuRXJyb3JbXSkge31cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRva2VuaXplSHRtbChzb3VyY2VDb250ZW50OiBzdHJpbmcsIHNvdXJjZVVybDogc3RyaW5nKTogSHRtbFRva2VuaXplUmVzdWx0IHtcbiAgcmV0dXJuIG5ldyBfSHRtbFRva2VuaXplcihuZXcgUGFyc2VTb3VyY2VGaWxlKHNvdXJjZUNvbnRlbnQsIHNvdXJjZVVybCkpLnRva2VuaXplKCk7XG59XG5cbmNvbnN0ICRFT0YgPSAwO1xuY29uc3QgJFRBQiA9IDk7XG5jb25zdCAkTEYgPSAxMDtcbmNvbnN0ICRGRiA9IDEyO1xuY29uc3QgJENSID0gMTM7XG5cbmNvbnN0ICRTUEFDRSA9IDMyO1xuXG5jb25zdCAkQkFORyA9IDMzO1xuY29uc3QgJERRID0gMzQ7XG5jb25zdCAkSEFTSCA9IDM1O1xuY29uc3QgJCQgPSAzNjtcbmNvbnN0ICRBTVBFUlNBTkQgPSAzODtcbmNvbnN0ICRTUSA9IDM5O1xuY29uc3QgJE1JTlVTID0gNDU7XG5jb25zdCAkU0xBU0ggPSA0NztcbmNvbnN0ICQwID0gNDg7XG5cbmNvbnN0ICRTRU1JQ09MT04gPSA1OTtcblxuY29uc3QgJDkgPSA1NztcbmNvbnN0ICRDT0xPTiA9IDU4O1xuY29uc3QgJExUID0gNjA7XG5jb25zdCAkRVEgPSA2MTtcbmNvbnN0ICRHVCA9IDYyO1xuY29uc3QgJFFVRVNUSU9OID0gNjM7XG5jb25zdCAkQSA9IDY1O1xuY29uc3QgJFogPSA5MDtcbmNvbnN0ICRMQlJBQ0tFVCA9IDkxO1xuY29uc3QgJFJCUkFDS0VUID0gOTM7XG5jb25zdCAkYSA9IDk3O1xuY29uc3QgJGYgPSAxMDI7XG5jb25zdCAkeiA9IDEyMjtcbmNvbnN0ICR4ID0gMTIwO1xuXG5jb25zdCAkTkJTUCA9IDE2MDtcblxudmFyIENSX09SX0NSTEZfUkVHRVhQID0gL1xcclxcbj8vZztcblxuZnVuY3Rpb24gdW5leHBlY3RlZENoYXJhY3RlckVycm9yTXNnKGNoYXJDb2RlOiBudW1iZXIpOiBzdHJpbmcge1xuICB2YXIgY2hhciA9IGNoYXJDb2RlID09PSAkRU9GID8gJ0VPRicgOiBTdHJpbmdXcmFwcGVyLmZyb21DaGFyQ29kZShjaGFyQ29kZSk7XG4gIHJldHVybiBgVW5leHBlY3RlZCBjaGFyYWN0ZXIgXCIke2NoYXJ9XCJgO1xufVxuXG5mdW5jdGlvbiB1bmtub3duRW50aXR5RXJyb3JNc2coZW50aXR5U3JjOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gYFVua25vd24gZW50aXR5IFwiJHtlbnRpdHlTcmN9XCIgLSB1c2UgdGhlIFwiJiM8ZGVjaW1hbD47XCIgb3IgIFwiJiN4PGhleD47XCIgc3ludGF4YDtcbn1cblxuY2xhc3MgQ29udHJvbEZsb3dFcnJvciB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBlcnJvcjogSHRtbFRva2VuRXJyb3IpIHt9XG59XG5cbi8vIFNlZSBodHRwOi8vd3d3LnczLm9yZy9UUi9odG1sNTEvc3ludGF4Lmh0bWwjd3JpdGluZ1xuY2xhc3MgX0h0bWxUb2tlbml6ZXIge1xuICBwcml2YXRlIGlucHV0OiBzdHJpbmc7XG4gIHByaXZhdGUgaW5wdXRMb3dlcmNhc2U6IHN0cmluZztcbiAgcHJpdmF0ZSBsZW5ndGg6IG51bWJlcjtcbiAgLy8gTm90ZTogdGhpcyBpcyBhbHdheXMgbG93ZXJjYXNlIVxuICBwcml2YXRlIHBlZWs6IG51bWJlciA9IC0xO1xuICBwcml2YXRlIGluZGV4OiBudW1iZXIgPSAtMTtcbiAgcHJpdmF0ZSBsaW5lOiBudW1iZXIgPSAwO1xuICBwcml2YXRlIGNvbHVtbjogbnVtYmVyID0gLTE7XG4gIHByaXZhdGUgY3VycmVudFRva2VuU3RhcnQ6IFBhcnNlTG9jYXRpb247XG4gIHByaXZhdGUgY3VycmVudFRva2VuVHlwZTogSHRtbFRva2VuVHlwZTtcblxuICB0b2tlbnM6IEh0bWxUb2tlbltdID0gW107XG4gIGVycm9yczogSHRtbFRva2VuRXJyb3JbXSA9IFtdO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgZmlsZTogUGFyc2VTb3VyY2VGaWxlKSB7XG4gICAgdGhpcy5pbnB1dCA9IGZpbGUuY29udGVudDtcbiAgICB0aGlzLmlucHV0TG93ZXJjYXNlID0gZmlsZS5jb250ZW50LnRvTG93ZXJDYXNlKCk7XG4gICAgdGhpcy5sZW5ndGggPSBmaWxlLmNvbnRlbnQubGVuZ3RoO1xuICAgIHRoaXMuX2FkdmFuY2UoKTtcbiAgfVxuXG4gIHByaXZhdGUgX3Byb2Nlc3NDYXJyaWFnZVJldHVybnMoY29udGVudDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAvLyBodHRwOi8vd3d3LnczLm9yZy9UUi9odG1sNS9zeW50YXguaHRtbCNwcmVwcm9jZXNzaW5nLXRoZS1pbnB1dC1zdHJlYW1cbiAgICAvLyBJbiBvcmRlciB0byBrZWVwIHRoZSBvcmlnaW5hbCBwb3NpdGlvbiBpbiB0aGUgc291cmNlLCB3ZSBjYW4gbm90IHByZS1wcm9jZXNzIGl0LlxuICAgIC8vIEluc3RlYWQgQ1JzIGFyZSBwcm9jZXNzZWQgcmlnaHQgYmVmb3JlIGluc3RhbnRpYXRpbmcgdGhlIHRva2Vucy5cbiAgICByZXR1cm4gU3RyaW5nV3JhcHBlci5yZXBsYWNlQWxsKGNvbnRlbnQsIENSX09SX0NSTEZfUkVHRVhQLCAnXFxuJyk7XG4gIH1cblxuICB0b2tlbml6ZSgpOiBIdG1sVG9rZW5pemVSZXN1bHQge1xuICAgIHdoaWxlICh0aGlzLnBlZWsgIT09ICRFT0YpIHtcbiAgICAgIHZhciBzdGFydCA9IHRoaXMuX2dldExvY2F0aW9uKCk7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAodGhpcy5fYXR0ZW1wdENoYXIoJExUKSkge1xuICAgICAgICAgIGlmICh0aGlzLl9hdHRlbXB0Q2hhcigkQkFORykpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9hdHRlbXB0Q2hhcigkTEJSQUNLRVQpKSB7XG4gICAgICAgICAgICAgIHRoaXMuX2NvbnN1bWVDZGF0YShzdGFydCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2F0dGVtcHRDaGFyKCRNSU5VUykpIHtcbiAgICAgICAgICAgICAgdGhpcy5fY29uc3VtZUNvbW1lbnQoc3RhcnQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdGhpcy5fY29uc3VtZURvY1R5cGUoc3RhcnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5fYXR0ZW1wdENoYXIoJFNMQVNIKSkge1xuICAgICAgICAgICAgdGhpcy5fY29uc3VtZVRhZ0Nsb3NlKHN0YXJ0KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fY29uc3VtZVRhZ09wZW4oc3RhcnQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLl9jb25zdW1lVGV4dCgpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGlmIChlIGluc3RhbmNlb2YgQ29udHJvbEZsb3dFcnJvcikge1xuICAgICAgICAgIHRoaXMuZXJyb3JzLnB1c2goZS5lcnJvcik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLl9iZWdpblRva2VuKEh0bWxUb2tlblR5cGUuRU9GKTtcbiAgICB0aGlzLl9lbmRUb2tlbihbXSk7XG4gICAgcmV0dXJuIG5ldyBIdG1sVG9rZW5pemVSZXN1bHQobWVyZ2VUZXh0VG9rZW5zKHRoaXMudG9rZW5zKSwgdGhpcy5lcnJvcnMpO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0TG9jYXRpb24oKTogUGFyc2VMb2NhdGlvbiB7XG4gICAgcmV0dXJuIG5ldyBQYXJzZUxvY2F0aW9uKHRoaXMuZmlsZSwgdGhpcy5pbmRleCwgdGhpcy5saW5lLCB0aGlzLmNvbHVtbik7XG4gIH1cblxuICBwcml2YXRlIF9iZWdpblRva2VuKHR5cGU6IEh0bWxUb2tlblR5cGUsIHN0YXJ0OiBQYXJzZUxvY2F0aW9uID0gbnVsbCkge1xuICAgIGlmIChpc0JsYW5rKHN0YXJ0KSkge1xuICAgICAgc3RhcnQgPSB0aGlzLl9nZXRMb2NhdGlvbigpO1xuICAgIH1cbiAgICB0aGlzLmN1cnJlbnRUb2tlblN0YXJ0ID0gc3RhcnQ7XG4gICAgdGhpcy5jdXJyZW50VG9rZW5UeXBlID0gdHlwZTtcbiAgfVxuXG4gIHByaXZhdGUgX2VuZFRva2VuKHBhcnRzOiBzdHJpbmdbXSwgZW5kOiBQYXJzZUxvY2F0aW9uID0gbnVsbCk6IEh0bWxUb2tlbiB7XG4gICAgaWYgKGlzQmxhbmsoZW5kKSkge1xuICAgICAgZW5kID0gdGhpcy5fZ2V0TG9jYXRpb24oKTtcbiAgICB9XG4gICAgdmFyIHRva2VuID0gbmV3IEh0bWxUb2tlbih0aGlzLmN1cnJlbnRUb2tlblR5cGUsIHBhcnRzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IFBhcnNlU291cmNlU3Bhbih0aGlzLmN1cnJlbnRUb2tlblN0YXJ0LCBlbmQpKTtcbiAgICB0aGlzLnRva2Vucy5wdXNoKHRva2VuKTtcbiAgICB0aGlzLmN1cnJlbnRUb2tlblN0YXJ0ID0gbnVsbDtcbiAgICB0aGlzLmN1cnJlbnRUb2tlblR5cGUgPSBudWxsO1xuICAgIHJldHVybiB0b2tlbjtcbiAgfVxuXG4gIHByaXZhdGUgX2NyZWF0ZUVycm9yKG1zZzogc3RyaW5nLCBwb3NpdGlvbjogUGFyc2VMb2NhdGlvbik6IENvbnRyb2xGbG93RXJyb3Ige1xuICAgIHZhciBlcnJvciA9IG5ldyBIdG1sVG9rZW5FcnJvcihtc2csIHRoaXMuY3VycmVudFRva2VuVHlwZSwgcG9zaXRpb24pO1xuICAgIHRoaXMuY3VycmVudFRva2VuU3RhcnQgPSBudWxsO1xuICAgIHRoaXMuY3VycmVudFRva2VuVHlwZSA9IG51bGw7XG4gICAgcmV0dXJuIG5ldyBDb250cm9sRmxvd0Vycm9yKGVycm9yKTtcbiAgfVxuXG4gIHByaXZhdGUgX2FkdmFuY2UoKSB7XG4gICAgaWYgKHRoaXMuaW5kZXggPj0gdGhpcy5sZW5ndGgpIHtcbiAgICAgIHRocm93IHRoaXMuX2NyZWF0ZUVycm9yKHVuZXhwZWN0ZWRDaGFyYWN0ZXJFcnJvck1zZygkRU9GKSwgdGhpcy5fZ2V0TG9jYXRpb24oKSk7XG4gICAgfVxuICAgIGlmICh0aGlzLnBlZWsgPT09ICRMRikge1xuICAgICAgdGhpcy5saW5lKys7XG4gICAgICB0aGlzLmNvbHVtbiA9IDA7XG4gICAgfSBlbHNlIGlmICh0aGlzLnBlZWsgIT09ICRMRiAmJiB0aGlzLnBlZWsgIT09ICRDUikge1xuICAgICAgdGhpcy5jb2x1bW4rKztcbiAgICB9XG4gICAgdGhpcy5pbmRleCsrO1xuICAgIHRoaXMucGVlayA9IHRoaXMuaW5kZXggPj0gdGhpcy5sZW5ndGggPyAkRU9GIDogU3RyaW5nV3JhcHBlci5jaGFyQ29kZUF0KHRoaXMuaW5wdXRMb3dlcmNhc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbmRleCk7XG4gIH1cblxuICBwcml2YXRlIF9hdHRlbXB0Q2hhcihjaGFyQ29kZTogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgaWYgKHRoaXMucGVlayA9PT0gY2hhckNvZGUpIHtcbiAgICAgIHRoaXMuX2FkdmFuY2UoKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBwcml2YXRlIF9yZXF1aXJlQ2hhcihjaGFyQ29kZTogbnVtYmVyKSB7XG4gICAgdmFyIGxvY2F0aW9uID0gdGhpcy5fZ2V0TG9jYXRpb24oKTtcbiAgICBpZiAoIXRoaXMuX2F0dGVtcHRDaGFyKGNoYXJDb2RlKSkge1xuICAgICAgdGhyb3cgdGhpcy5fY3JlYXRlRXJyb3IodW5leHBlY3RlZENoYXJhY3RlckVycm9yTXNnKHRoaXMucGVlayksIGxvY2F0aW9uKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9hdHRlbXB0Q2hhcnMoY2hhcnM6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hhcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmICghdGhpcy5fYXR0ZW1wdENoYXIoU3RyaW5nV3JhcHBlci5jaGFyQ29kZUF0KGNoYXJzLCBpKSkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHByaXZhdGUgX3JlcXVpcmVDaGFycyhjaGFyczogc3RyaW5nKSB7XG4gICAgdmFyIGxvY2F0aW9uID0gdGhpcy5fZ2V0TG9jYXRpb24oKTtcbiAgICBpZiAoIXRoaXMuX2F0dGVtcHRDaGFycyhjaGFycykpIHtcbiAgICAgIHRocm93IHRoaXMuX2NyZWF0ZUVycm9yKHVuZXhwZWN0ZWRDaGFyYWN0ZXJFcnJvck1zZyh0aGlzLnBlZWspLCBsb2NhdGlvbik7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfYXR0ZW1wdFVudGlsRm4ocHJlZGljYXRlOiBGdW5jdGlvbikge1xuICAgIHdoaWxlICghcHJlZGljYXRlKHRoaXMucGVlaykpIHtcbiAgICAgIHRoaXMuX2FkdmFuY2UoKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9yZXF1aXJlVW50aWxGbihwcmVkaWNhdGU6IEZ1bmN0aW9uLCBsZW46IG51bWJlcikge1xuICAgIHZhciBzdGFydCA9IHRoaXMuX2dldExvY2F0aW9uKCk7XG4gICAgdGhpcy5fYXR0ZW1wdFVudGlsRm4ocHJlZGljYXRlKTtcbiAgICBpZiAodGhpcy5pbmRleCAtIHN0YXJ0Lm9mZnNldCA8IGxlbikge1xuICAgICAgdGhyb3cgdGhpcy5fY3JlYXRlRXJyb3IodW5leHBlY3RlZENoYXJhY3RlckVycm9yTXNnKHRoaXMucGVlayksIHN0YXJ0KTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9hdHRlbXB0VW50aWxDaGFyKGNoYXI6IG51bWJlcikge1xuICAgIHdoaWxlICh0aGlzLnBlZWsgIT09IGNoYXIpIHtcbiAgICAgIHRoaXMuX2FkdmFuY2UoKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9yZWFkQ2hhcihkZWNvZGVFbnRpdGllczogYm9vbGVhbik6IHN0cmluZyB7XG4gICAgaWYgKGRlY29kZUVudGl0aWVzICYmIHRoaXMucGVlayA9PT0gJEFNUEVSU0FORCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2RlY29kZUVudGl0eSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgaW5kZXggPSB0aGlzLmluZGV4O1xuICAgICAgdGhpcy5fYWR2YW5jZSgpO1xuICAgICAgcmV0dXJuIHRoaXMuaW5wdXRbaW5kZXhdO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2RlY29kZUVudGl0eSgpOiBzdHJpbmcge1xuICAgIHZhciBzdGFydCA9IHRoaXMuX2dldExvY2F0aW9uKCk7XG4gICAgdGhpcy5fYWR2YW5jZSgpO1xuICAgIGlmICh0aGlzLl9hdHRlbXB0Q2hhcigkSEFTSCkpIHtcbiAgICAgIGxldCBpc0hleCA9IHRoaXMuX2F0dGVtcHRDaGFyKCR4KTtcbiAgICAgIGxldCBudW1iZXJTdGFydCA9IHRoaXMuX2dldExvY2F0aW9uKCkub2Zmc2V0O1xuICAgICAgdGhpcy5fYXR0ZW1wdFVudGlsRm4oaXNEaWdpdEVudGl0eUVuZCk7XG4gICAgICBpZiAodGhpcy5wZWVrICE9ICRTRU1JQ09MT04pIHtcbiAgICAgICAgdGhyb3cgdGhpcy5fY3JlYXRlRXJyb3IodW5leHBlY3RlZENoYXJhY3RlckVycm9yTXNnKHRoaXMucGVlayksIHRoaXMuX2dldExvY2F0aW9uKCkpO1xuICAgICAgfVxuICAgICAgdGhpcy5fYWR2YW5jZSgpO1xuICAgICAgbGV0IHN0ck51bSA9IHRoaXMuaW5wdXQuc3Vic3RyaW5nKG51bWJlclN0YXJ0LCB0aGlzLmluZGV4IC0gMSk7XG4gICAgICB0cnkge1xuICAgICAgICBsZXQgY2hhckNvZGUgPSBOdW1iZXJXcmFwcGVyLnBhcnNlSW50KHN0ck51bSwgaXNIZXggPyAxNiA6IDEwKTtcbiAgICAgICAgcmV0dXJuIFN0cmluZ1dyYXBwZXIuZnJvbUNoYXJDb2RlKGNoYXJDb2RlKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgbGV0IGVudGl0eSA9IHRoaXMuaW5wdXQuc3Vic3RyaW5nKHN0YXJ0Lm9mZnNldCArIDEsIHRoaXMuaW5kZXggLSAxKTtcbiAgICAgICAgdGhyb3cgdGhpcy5fY3JlYXRlRXJyb3IodW5rbm93bkVudGl0eUVycm9yTXNnKGVudGl0eSksIHN0YXJ0KTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IHN0YXJ0UG9zaXRpb24gPSB0aGlzLl9zYXZlUG9zaXRpb24oKTtcbiAgICAgIHRoaXMuX2F0dGVtcHRVbnRpbEZuKGlzTmFtZWRFbnRpdHlFbmQpO1xuICAgICAgaWYgKHRoaXMucGVlayAhPSAkU0VNSUNPTE9OKSB7XG4gICAgICAgIHRoaXMuX3Jlc3RvcmVQb3NpdGlvbihzdGFydFBvc2l0aW9uKTtcbiAgICAgICAgcmV0dXJuICcmJztcbiAgICAgIH1cbiAgICAgIHRoaXMuX2FkdmFuY2UoKTtcbiAgICAgIGxldCBuYW1lID0gdGhpcy5pbnB1dC5zdWJzdHJpbmcoc3RhcnQub2Zmc2V0ICsgMSwgdGhpcy5pbmRleCAtIDEpO1xuICAgICAgbGV0IGNoYXIgPSBOQU1FRF9FTlRJVElFU1tuYW1lXTtcbiAgICAgIGlmIChpc0JsYW5rKGNoYXIpKSB7XG4gICAgICAgIHRocm93IHRoaXMuX2NyZWF0ZUVycm9yKHVua25vd25FbnRpdHlFcnJvck1zZyhuYW1lKSwgc3RhcnQpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNoYXI7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfY29uc3VtZVJhd1RleHQoZGVjb2RlRW50aXRpZXM6IGJvb2xlYW4sIGZpcnN0Q2hhck9mRW5kOiBudW1iZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGF0dGVtcHRFbmRSZXN0OiBGdW5jdGlvbik6IEh0bWxUb2tlbiB7XG4gICAgdmFyIHRhZ0Nsb3NlU3RhcnQ7XG4gICAgdmFyIHRleHRTdGFydCA9IHRoaXMuX2dldExvY2F0aW9uKCk7XG4gICAgdGhpcy5fYmVnaW5Ub2tlbihkZWNvZGVFbnRpdGllcyA/IEh0bWxUb2tlblR5cGUuRVNDQVBBQkxFX1JBV19URVhUIDogSHRtbFRva2VuVHlwZS5SQVdfVEVYVCxcbiAgICAgICAgICAgICAgICAgICAgIHRleHRTdGFydCk7XG4gICAgdmFyIHBhcnRzID0gW107XG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIHRhZ0Nsb3NlU3RhcnQgPSB0aGlzLl9nZXRMb2NhdGlvbigpO1xuICAgICAgaWYgKHRoaXMuX2F0dGVtcHRDaGFyKGZpcnN0Q2hhck9mRW5kKSAmJiBhdHRlbXB0RW5kUmVzdCgpKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgaWYgKHRoaXMuaW5kZXggPiB0YWdDbG9zZVN0YXJ0Lm9mZnNldCkge1xuICAgICAgICBwYXJ0cy5wdXNoKHRoaXMuaW5wdXQuc3Vic3RyaW5nKHRhZ0Nsb3NlU3RhcnQub2Zmc2V0LCB0aGlzLmluZGV4KSk7XG4gICAgICB9XG4gICAgICB3aGlsZSAodGhpcy5wZWVrICE9PSBmaXJzdENoYXJPZkVuZCkge1xuICAgICAgICBwYXJ0cy5wdXNoKHRoaXMuX3JlYWRDaGFyKGRlY29kZUVudGl0aWVzKSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9lbmRUb2tlbihbdGhpcy5fcHJvY2Vzc0NhcnJpYWdlUmV0dXJucyhwYXJ0cy5qb2luKCcnKSldLCB0YWdDbG9zZVN0YXJ0KTtcbiAgfVxuXG4gIHByaXZhdGUgX2NvbnN1bWVDb21tZW50KHN0YXJ0OiBQYXJzZUxvY2F0aW9uKSB7XG4gICAgdGhpcy5fYmVnaW5Ub2tlbihIdG1sVG9rZW5UeXBlLkNPTU1FTlRfU1RBUlQsIHN0YXJ0KTtcbiAgICB0aGlzLl9yZXF1aXJlQ2hhcigkTUlOVVMpO1xuICAgIHRoaXMuX2VuZFRva2VuKFtdKTtcbiAgICB2YXIgdGV4dFRva2VuID0gdGhpcy5fY29uc3VtZVJhd1RleHQoZmFsc2UsICRNSU5VUywgKCkgPT4gdGhpcy5fYXR0ZW1wdENoYXJzKCctPicpKTtcbiAgICB0aGlzLl9iZWdpblRva2VuKEh0bWxUb2tlblR5cGUuQ09NTUVOVF9FTkQsIHRleHRUb2tlbi5zb3VyY2VTcGFuLmVuZCk7XG4gICAgdGhpcy5fZW5kVG9rZW4oW10pO1xuICB9XG5cbiAgcHJpdmF0ZSBfY29uc3VtZUNkYXRhKHN0YXJ0OiBQYXJzZUxvY2F0aW9uKSB7XG4gICAgdGhpcy5fYmVnaW5Ub2tlbihIdG1sVG9rZW5UeXBlLkNEQVRBX1NUQVJULCBzdGFydCk7XG4gICAgdGhpcy5fcmVxdWlyZUNoYXJzKCdjZGF0YVsnKTtcbiAgICB0aGlzLl9lbmRUb2tlbihbXSk7XG4gICAgdmFyIHRleHRUb2tlbiA9IHRoaXMuX2NvbnN1bWVSYXdUZXh0KGZhbHNlLCAkUkJSQUNLRVQsICgpID0+IHRoaXMuX2F0dGVtcHRDaGFycygnXT4nKSk7XG4gICAgdGhpcy5fYmVnaW5Ub2tlbihIdG1sVG9rZW5UeXBlLkNEQVRBX0VORCwgdGV4dFRva2VuLnNvdXJjZVNwYW4uZW5kKTtcbiAgICB0aGlzLl9lbmRUb2tlbihbXSk7XG4gIH1cblxuICBwcml2YXRlIF9jb25zdW1lRG9jVHlwZShzdGFydDogUGFyc2VMb2NhdGlvbikge1xuICAgIHRoaXMuX2JlZ2luVG9rZW4oSHRtbFRva2VuVHlwZS5ET0NfVFlQRSwgc3RhcnQpO1xuICAgIHRoaXMuX2F0dGVtcHRVbnRpbENoYXIoJEdUKTtcbiAgICB0aGlzLl9hZHZhbmNlKCk7XG4gICAgdGhpcy5fZW5kVG9rZW4oW3RoaXMuaW5wdXQuc3Vic3RyaW5nKHN0YXJ0Lm9mZnNldCArIDIsIHRoaXMuaW5kZXggLSAxKV0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfY29uc3VtZVByZWZpeEFuZE5hbWUoKTogc3RyaW5nW10ge1xuICAgIHZhciBuYW1lT3JQcmVmaXhTdGFydCA9IHRoaXMuaW5kZXg7XG4gICAgdmFyIHByZWZpeCA9IG51bGw7XG4gICAgd2hpbGUgKHRoaXMucGVlayAhPT0gJENPTE9OICYmICFpc1ByZWZpeEVuZCh0aGlzLnBlZWspKSB7XG4gICAgICB0aGlzLl9hZHZhbmNlKCk7XG4gICAgfVxuICAgIHZhciBuYW1lU3RhcnQ7XG4gICAgaWYgKHRoaXMucGVlayA9PT0gJENPTE9OKSB7XG4gICAgICB0aGlzLl9hZHZhbmNlKCk7XG4gICAgICBwcmVmaXggPSB0aGlzLmlucHV0LnN1YnN0cmluZyhuYW1lT3JQcmVmaXhTdGFydCwgdGhpcy5pbmRleCAtIDEpO1xuICAgICAgbmFtZVN0YXJ0ID0gdGhpcy5pbmRleDtcbiAgICB9IGVsc2Uge1xuICAgICAgbmFtZVN0YXJ0ID0gbmFtZU9yUHJlZml4U3RhcnQ7XG4gICAgfVxuICAgIHRoaXMuX3JlcXVpcmVVbnRpbEZuKGlzTmFtZUVuZCwgdGhpcy5pbmRleCA9PT0gbmFtZVN0YXJ0ID8gMSA6IDApO1xuICAgIHZhciBuYW1lID0gdGhpcy5pbnB1dC5zdWJzdHJpbmcobmFtZVN0YXJ0LCB0aGlzLmluZGV4KTtcbiAgICByZXR1cm4gW3ByZWZpeCwgbmFtZV07XG4gIH1cblxuICBwcml2YXRlIF9jb25zdW1lVGFnT3BlbihzdGFydDogUGFyc2VMb2NhdGlvbikge1xuICAgIGxldCBzYXZlZFBvcyA9IHRoaXMuX3NhdmVQb3NpdGlvbigpO1xuICAgIGxldCBsb3dlcmNhc2VUYWdOYW1lO1xuICAgIHRyeSB7XG4gICAgICBpZiAoIWlzQXNjaWlMZXR0ZXIodGhpcy5wZWVrKSkge1xuICAgICAgICB0aHJvdyB0aGlzLl9jcmVhdGVFcnJvcih1bmV4cGVjdGVkQ2hhcmFjdGVyRXJyb3JNc2codGhpcy5wZWVrKSwgdGhpcy5fZ2V0TG9jYXRpb24oKSk7XG4gICAgICB9XG4gICAgICB2YXIgbmFtZVN0YXJ0ID0gdGhpcy5pbmRleDtcbiAgICAgIHRoaXMuX2NvbnN1bWVUYWdPcGVuU3RhcnQoc3RhcnQpO1xuICAgICAgbG93ZXJjYXNlVGFnTmFtZSA9IHRoaXMuaW5wdXRMb3dlcmNhc2Uuc3Vic3RyaW5nKG5hbWVTdGFydCwgdGhpcy5pbmRleCk7XG4gICAgICB0aGlzLl9hdHRlbXB0VW50aWxGbihpc05vdFdoaXRlc3BhY2UpO1xuICAgICAgd2hpbGUgKHRoaXMucGVlayAhPT0gJFNMQVNIICYmIHRoaXMucGVlayAhPT0gJEdUKSB7XG4gICAgICAgIHRoaXMuX2NvbnN1bWVBdHRyaWJ1dGVOYW1lKCk7XG4gICAgICAgIHRoaXMuX2F0dGVtcHRVbnRpbEZuKGlzTm90V2hpdGVzcGFjZSk7XG4gICAgICAgIGlmICh0aGlzLl9hdHRlbXB0Q2hhcigkRVEpKSB7XG4gICAgICAgICAgdGhpcy5fYXR0ZW1wdFVudGlsRm4oaXNOb3RXaGl0ZXNwYWNlKTtcbiAgICAgICAgICB0aGlzLl9jb25zdW1lQXR0cmlidXRlVmFsdWUoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9hdHRlbXB0VW50aWxGbihpc05vdFdoaXRlc3BhY2UpO1xuICAgICAgfVxuICAgICAgdGhpcy5fY29uc3VtZVRhZ09wZW5FbmQoKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBpZiAoZSBpbnN0YW5jZW9mIENvbnRyb2xGbG93RXJyb3IpIHtcbiAgICAgICAgLy8gV2hlbiB0aGUgc3RhcnQgdGFnIGlzIGludmFsaWQsIGFzc3VtZSB3ZSB3YW50IGEgXCI8XCJcbiAgICAgICAgdGhpcy5fcmVzdG9yZVBvc2l0aW9uKHNhdmVkUG9zKTtcbiAgICAgICAgLy8gQmFjayB0byBiYWNrIHRleHQgdG9rZW5zIGFyZSBtZXJnZWQgYXQgdGhlIGVuZFxuICAgICAgICB0aGlzLl9iZWdpblRva2VuKEh0bWxUb2tlblR5cGUuVEVYVCwgc3RhcnQpO1xuICAgICAgICB0aGlzLl9lbmRUb2tlbihbJzwnXSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdGhyb3cgZTtcbiAgICB9XG5cbiAgICB2YXIgY29udGVudFRva2VuVHlwZSA9IGdldEh0bWxUYWdEZWZpbml0aW9uKGxvd2VyY2FzZVRhZ05hbWUpLmNvbnRlbnRUeXBlO1xuICAgIGlmIChjb250ZW50VG9rZW5UeXBlID09PSBIdG1sVGFnQ29udGVudFR5cGUuUkFXX1RFWFQpIHtcbiAgICAgIHRoaXMuX2NvbnN1bWVSYXdUZXh0V2l0aFRhZ0Nsb3NlKGxvd2VyY2FzZVRhZ05hbWUsIGZhbHNlKTtcbiAgICB9IGVsc2UgaWYgKGNvbnRlbnRUb2tlblR5cGUgPT09IEh0bWxUYWdDb250ZW50VHlwZS5FU0NBUEFCTEVfUkFXX1RFWFQpIHtcbiAgICAgIHRoaXMuX2NvbnN1bWVSYXdUZXh0V2l0aFRhZ0Nsb3NlKGxvd2VyY2FzZVRhZ05hbWUsIHRydWUpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2NvbnN1bWVSYXdUZXh0V2l0aFRhZ0Nsb3NlKGxvd2VyY2FzZVRhZ05hbWU6IHN0cmluZywgZGVjb2RlRW50aXRpZXM6IGJvb2xlYW4pIHtcbiAgICB2YXIgdGV4dFRva2VuID0gdGhpcy5fY29uc3VtZVJhd1RleHQoZGVjb2RlRW50aXRpZXMsICRMVCwgKCkgPT4ge1xuICAgICAgaWYgKCF0aGlzLl9hdHRlbXB0Q2hhcigkU0xBU0gpKSByZXR1cm4gZmFsc2U7XG4gICAgICB0aGlzLl9hdHRlbXB0VW50aWxGbihpc05vdFdoaXRlc3BhY2UpO1xuICAgICAgaWYgKCF0aGlzLl9hdHRlbXB0Q2hhcnMobG93ZXJjYXNlVGFnTmFtZSkpIHJldHVybiBmYWxzZTtcbiAgICAgIHRoaXMuX2F0dGVtcHRVbnRpbEZuKGlzTm90V2hpdGVzcGFjZSk7XG4gICAgICBpZiAoIXRoaXMuX2F0dGVtcHRDaGFyKCRHVCkpIHJldHVybiBmYWxzZTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0pO1xuICAgIHRoaXMuX2JlZ2luVG9rZW4oSHRtbFRva2VuVHlwZS5UQUdfQ0xPU0UsIHRleHRUb2tlbi5zb3VyY2VTcGFuLmVuZCk7XG4gICAgdGhpcy5fZW5kVG9rZW4oW251bGwsIGxvd2VyY2FzZVRhZ05hbWVdKTtcbiAgfVxuXG4gIHByaXZhdGUgX2NvbnN1bWVUYWdPcGVuU3RhcnQoc3RhcnQ6IFBhcnNlTG9jYXRpb24pIHtcbiAgICB0aGlzLl9iZWdpblRva2VuKEh0bWxUb2tlblR5cGUuVEFHX09QRU5fU1RBUlQsIHN0YXJ0KTtcbiAgICB2YXIgcGFydHMgPSB0aGlzLl9jb25zdW1lUHJlZml4QW5kTmFtZSgpO1xuICAgIHRoaXMuX2VuZFRva2VuKHBhcnRzKTtcbiAgfVxuXG4gIHByaXZhdGUgX2NvbnN1bWVBdHRyaWJ1dGVOYW1lKCkge1xuICAgIHRoaXMuX2JlZ2luVG9rZW4oSHRtbFRva2VuVHlwZS5BVFRSX05BTUUpO1xuICAgIHZhciBwcmVmaXhBbmROYW1lID0gdGhpcy5fY29uc3VtZVByZWZpeEFuZE5hbWUoKTtcbiAgICB0aGlzLl9lbmRUb2tlbihwcmVmaXhBbmROYW1lKTtcbiAgfVxuXG4gIHByaXZhdGUgX2NvbnN1bWVBdHRyaWJ1dGVWYWx1ZSgpIHtcbiAgICB0aGlzLl9iZWdpblRva2VuKEh0bWxUb2tlblR5cGUuQVRUUl9WQUxVRSk7XG4gICAgdmFyIHZhbHVlO1xuICAgIGlmICh0aGlzLnBlZWsgPT09ICRTUSB8fCB0aGlzLnBlZWsgPT09ICREUSkge1xuICAgICAgdmFyIHF1b3RlQ2hhciA9IHRoaXMucGVlaztcbiAgICAgIHRoaXMuX2FkdmFuY2UoKTtcbiAgICAgIHZhciBwYXJ0cyA9IFtdO1xuICAgICAgd2hpbGUgKHRoaXMucGVlayAhPT0gcXVvdGVDaGFyKSB7XG4gICAgICAgIHBhcnRzLnB1c2godGhpcy5fcmVhZENoYXIodHJ1ZSkpO1xuICAgICAgfVxuICAgICAgdmFsdWUgPSBwYXJ0cy5qb2luKCcnKTtcbiAgICAgIHRoaXMuX2FkdmFuY2UoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHZhbHVlU3RhcnQgPSB0aGlzLmluZGV4O1xuICAgICAgdGhpcy5fcmVxdWlyZVVudGlsRm4oaXNOYW1lRW5kLCAxKTtcbiAgICAgIHZhbHVlID0gdGhpcy5pbnB1dC5zdWJzdHJpbmcodmFsdWVTdGFydCwgdGhpcy5pbmRleCk7XG4gICAgfVxuICAgIHRoaXMuX2VuZFRva2VuKFt0aGlzLl9wcm9jZXNzQ2FycmlhZ2VSZXR1cm5zKHZhbHVlKV0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfY29uc3VtZVRhZ09wZW5FbmQoKSB7XG4gICAgdmFyIHRva2VuVHlwZSA9XG4gICAgICAgIHRoaXMuX2F0dGVtcHRDaGFyKCRTTEFTSCkgPyBIdG1sVG9rZW5UeXBlLlRBR19PUEVOX0VORF9WT0lEIDogSHRtbFRva2VuVHlwZS5UQUdfT1BFTl9FTkQ7XG4gICAgdGhpcy5fYmVnaW5Ub2tlbih0b2tlblR5cGUpO1xuICAgIHRoaXMuX3JlcXVpcmVDaGFyKCRHVCk7XG4gICAgdGhpcy5fZW5kVG9rZW4oW10pO1xuICB9XG5cbiAgcHJpdmF0ZSBfY29uc3VtZVRhZ0Nsb3NlKHN0YXJ0OiBQYXJzZUxvY2F0aW9uKSB7XG4gICAgdGhpcy5fYmVnaW5Ub2tlbihIdG1sVG9rZW5UeXBlLlRBR19DTE9TRSwgc3RhcnQpO1xuICAgIHRoaXMuX2F0dGVtcHRVbnRpbEZuKGlzTm90V2hpdGVzcGFjZSk7XG4gICAgdmFyIHByZWZpeEFuZE5hbWU7XG4gICAgcHJlZml4QW5kTmFtZSA9IHRoaXMuX2NvbnN1bWVQcmVmaXhBbmROYW1lKCk7XG4gICAgdGhpcy5fYXR0ZW1wdFVudGlsRm4oaXNOb3RXaGl0ZXNwYWNlKTtcbiAgICB0aGlzLl9yZXF1aXJlQ2hhcigkR1QpO1xuICAgIHRoaXMuX2VuZFRva2VuKHByZWZpeEFuZE5hbWUpO1xuICB9XG5cbiAgcHJpdmF0ZSBfY29uc3VtZVRleHQoKSB7XG4gICAgdmFyIHN0YXJ0ID0gdGhpcy5fZ2V0TG9jYXRpb24oKTtcbiAgICB0aGlzLl9iZWdpblRva2VuKEh0bWxUb2tlblR5cGUuVEVYVCwgc3RhcnQpO1xuICAgIHZhciBwYXJ0cyA9IFt0aGlzLl9yZWFkQ2hhcih0cnVlKV07XG4gICAgd2hpbGUgKCFpc1RleHRFbmQodGhpcy5wZWVrKSkge1xuICAgICAgcGFydHMucHVzaCh0aGlzLl9yZWFkQ2hhcih0cnVlKSk7XG4gICAgfVxuICAgIHRoaXMuX2VuZFRva2VuKFt0aGlzLl9wcm9jZXNzQ2FycmlhZ2VSZXR1cm5zKHBhcnRzLmpvaW4oJycpKV0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfc2F2ZVBvc2l0aW9uKCk6IG51bWJlcltdIHtcbiAgICByZXR1cm4gW3RoaXMucGVlaywgdGhpcy5pbmRleCwgdGhpcy5jb2x1bW4sIHRoaXMubGluZSwgdGhpcy50b2tlbnMubGVuZ3RoXTtcbiAgfVxuXG4gIHByaXZhdGUgX3Jlc3RvcmVQb3NpdGlvbihwb3NpdGlvbjogbnVtYmVyW10pOiB2b2lkIHtcbiAgICB0aGlzLnBlZWsgPSBwb3NpdGlvblswXTtcbiAgICB0aGlzLmluZGV4ID0gcG9zaXRpb25bMV07XG4gICAgdGhpcy5jb2x1bW4gPSBwb3NpdGlvblsyXTtcbiAgICB0aGlzLmxpbmUgPSBwb3NpdGlvblszXTtcbiAgICBsZXQgbmJUb2tlbnMgPSBwb3NpdGlvbls0XTtcbiAgICBpZiAobmJUb2tlbnMgPCB0aGlzLnRva2Vucy5sZW5ndGgpIHtcbiAgICAgIC8vIHJlbW92ZSBhbnkgZXh0cmEgdG9rZW5zXG4gICAgICB0aGlzLnRva2VucyA9IExpc3RXcmFwcGVyLnNsaWNlKHRoaXMudG9rZW5zLCAwLCBuYlRva2Vucyk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGlzTm90V2hpdGVzcGFjZShjb2RlOiBudW1iZXIpOiBib29sZWFuIHtcbiAgcmV0dXJuICFpc1doaXRlc3BhY2UoY29kZSkgfHwgY29kZSA9PT0gJEVPRjtcbn1cblxuZnVuY3Rpb24gaXNXaGl0ZXNwYWNlKGNvZGU6IG51bWJlcik6IGJvb2xlYW4ge1xuICByZXR1cm4gKGNvZGUgPj0gJFRBQiAmJiBjb2RlIDw9ICRTUEFDRSkgfHwgKGNvZGUgPT09ICROQlNQKTtcbn1cblxuZnVuY3Rpb24gaXNOYW1lRW5kKGNvZGU6IG51bWJlcik6IGJvb2xlYW4ge1xuICByZXR1cm4gaXNXaGl0ZXNwYWNlKGNvZGUpIHx8IGNvZGUgPT09ICRHVCB8fCBjb2RlID09PSAkU0xBU0ggfHwgY29kZSA9PT0gJFNRIHx8IGNvZGUgPT09ICREUSB8fFxuICAgICAgICAgY29kZSA9PT0gJEVRO1xufVxuXG5mdW5jdGlvbiBpc1ByZWZpeEVuZChjb2RlOiBudW1iZXIpOiBib29sZWFuIHtcbiAgcmV0dXJuIChjb2RlIDwgJGEgfHwgJHogPCBjb2RlKSAmJiAoY29kZSA8ICRBIHx8ICRaIDwgY29kZSkgJiYgKGNvZGUgPCAkMCB8fCBjb2RlID4gJDkpO1xufVxuXG5mdW5jdGlvbiBpc0RpZ2l0RW50aXR5RW5kKGNvZGU6IG51bWJlcik6IGJvb2xlYW4ge1xuICByZXR1cm4gY29kZSA9PSAkU0VNSUNPTE9OIHx8IGNvZGUgPT0gJEVPRiB8fCAhaXNBc2NpaUhleERpZ2l0KGNvZGUpO1xufVxuXG5mdW5jdGlvbiBpc05hbWVkRW50aXR5RW5kKGNvZGU6IG51bWJlcik6IGJvb2xlYW4ge1xuICByZXR1cm4gY29kZSA9PSAkU0VNSUNPTE9OIHx8IGNvZGUgPT0gJEVPRiB8fCAhaXNBc2NpaUxldHRlcihjb2RlKTtcbn1cblxuZnVuY3Rpb24gaXNUZXh0RW5kKGNvZGU6IG51bWJlcik6IGJvb2xlYW4ge1xuICByZXR1cm4gY29kZSA9PT0gJExUIHx8IGNvZGUgPT09ICRFT0Y7XG59XG5cbmZ1bmN0aW9uIGlzQXNjaWlMZXR0ZXIoY29kZTogbnVtYmVyKTogYm9vbGVhbiB7XG4gIHJldHVybiBjb2RlID49ICRhICYmIGNvZGUgPD0gJHo7XG59XG5cbmZ1bmN0aW9uIGlzQXNjaWlIZXhEaWdpdChjb2RlOiBudW1iZXIpOiBib29sZWFuIHtcbiAgcmV0dXJuIGNvZGUgPj0gJGEgJiYgY29kZSA8PSAkZiB8fCBjb2RlID49ICQwICYmIGNvZGUgPD0gJDk7XG59XG5cbmZ1bmN0aW9uIG1lcmdlVGV4dFRva2VucyhzcmNUb2tlbnM6IEh0bWxUb2tlbltdKTogSHRtbFRva2VuW10ge1xuICBsZXQgZHN0VG9rZW5zID0gW107XG4gIGxldCBsYXN0RHN0VG9rZW46IEh0bWxUb2tlbjtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBzcmNUb2tlbnMubGVuZ3RoOyBpKyspIHtcbiAgICBsZXQgdG9rZW4gPSBzcmNUb2tlbnNbaV07XG4gICAgaWYgKGlzUHJlc2VudChsYXN0RHN0VG9rZW4pICYmIGxhc3REc3RUb2tlbi50eXBlID09IEh0bWxUb2tlblR5cGUuVEVYVCAmJlxuICAgICAgICB0b2tlbi50eXBlID09IEh0bWxUb2tlblR5cGUuVEVYVCkge1xuICAgICAgbGFzdERzdFRva2VuLnBhcnRzWzBdICs9IHRva2VuLnBhcnRzWzBdO1xuICAgICAgbGFzdERzdFRva2VuLnNvdXJjZVNwYW4uZW5kID0gdG9rZW4uc291cmNlU3Bhbi5lbmQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxhc3REc3RUb2tlbiA9IHRva2VuO1xuICAgICAgZHN0VG9rZW5zLnB1c2gobGFzdERzdFRva2VuKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZHN0VG9rZW5zO1xufVxuIl19