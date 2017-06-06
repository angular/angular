import { BaseException } from 'angular2/src/facade/exceptions';
export { $EOF, $AT, $RBRACE, $LBRACE, $LBRACKET, $RBRACKET, $LPAREN, $RPAREN, $COMMA, $COLON, $SEMICOLON, isWhitespace } from "angular2/src/compiler/chars";
export declare enum CssTokenType {
    EOF = 0,
    String = 1,
    Comment = 2,
    Identifier = 3,
    Number = 4,
    IdentifierOrNumber = 5,
    AtKeyword = 6,
    Character = 7,
    Whitespace = 8,
    Invalid = 9,
}
export declare enum CssLexerMode {
    ALL = 0,
    ALL_TRACK_WS = 1,
    SELECTOR = 2,
    PSEUDO_SELECTOR = 3,
    ATTRIBUTE_SELECTOR = 4,
    AT_RULE_QUERY = 5,
    MEDIA_QUERY = 6,
    BLOCK = 7,
    KEYFRAME_BLOCK = 8,
    STYLE_BLOCK = 9,
    STYLE_VALUE = 10,
    STYLE_VALUE_FUNCTION = 11,
    STYLE_CALC_FUNCTION = 12,
}
export declare class LexedCssResult {
    error: CssScannerError;
    token: CssToken;
    constructor(error: CssScannerError, token: CssToken);
}
export declare function generateErrorMessage(input: string, message: string, errorValue: string, index: number, row: number, column: number): string;
export declare function findProblemCode(input: string, errorValue: string, index: number, column: number): string;
export declare class CssToken {
    index: number;
    column: number;
    line: number;
    type: CssTokenType;
    strValue: string;
    numValue: number;
    constructor(index: number, column: number, line: number, type: CssTokenType, strValue: string);
}
export declare class CssLexer {
    scan(text: string, trackComments?: boolean): CssScanner;
}
export declare class CssScannerError extends BaseException {
    token: CssToken;
    rawMessage: string;
    message: string;
    constructor(token: CssToken, message: any);
    toString(): string;
}
export declare class CssScanner {
    input: string;
    private _trackComments;
    peek: number;
    peekPeek: number;
    length: number;
    index: number;
    column: number;
    line: number;
    constructor(input: string, _trackComments?: boolean);
    getMode(): CssLexerMode;
    setMode(mode: CssLexerMode): void;
    advance(): void;
    peekAt(index: number): number;
    consumeEmptyStatements(): void;
    consumeWhitespace(): void;
    consume(type: CssTokenType, value?: string): LexedCssResult;
    scan(): LexedCssResult;
    scanComment(): CssToken;
    scanWhitespace(): CssToken;
    scanString(): CssToken;
    scanNumber(): CssToken;
    scanIdentifier(): CssToken;
    scanCssValueFunction(): CssToken;
    scanCharacter(): CssToken;
    scanAtExpression(): CssToken;
    assertCondition(status: boolean, errorMessage: string): boolean;
    error(message: string, errorTokenValue?: string, doNotAdvance?: boolean): CssToken;
}
export declare function isNewline(code: any): boolean;
