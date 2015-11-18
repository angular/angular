import { BaseException } from 'angular2/src/facade/exceptions';
export declare enum TokenType {
    Character = 0,
    Identifier = 1,
    Keyword = 2,
    String = 3,
    Operator = 4,
    Number = 5,
}
export declare class Lexer {
    tokenize(text: string): any[];
}
export declare class Token {
    index: number;
    type: TokenType;
    numValue: number;
    strValue: string;
    constructor(index: number, type: TokenType, numValue: number, strValue: string);
    isCharacter(code: number): boolean;
    isNumber(): boolean;
    isString(): boolean;
    isOperator(operater: string): boolean;
    isIdentifier(): boolean;
    isKeyword(): boolean;
    isKeywordVar(): boolean;
    isKeywordNull(): boolean;
    isKeywordUndefined(): boolean;
    isKeywordTrue(): boolean;
    isKeywordFalse(): boolean;
    toNumber(): number;
    toString(): string;
}
export declare var EOF: Token;
export declare const $EOF: number;
export declare const $TAB: number;
export declare const $LF: number;
export declare const $VTAB: number;
export declare const $FF: number;
export declare const $CR: number;
export declare const $SPACE: number;
export declare const $BANG: number;
export declare const $DQ: number;
export declare const $HASH: number;
export declare const $$: number;
export declare const $PERCENT: number;
export declare const $AMPERSAND: number;
export declare const $SQ: number;
export declare const $LPAREN: number;
export declare const $RPAREN: number;
export declare const $STAR: number;
export declare const $PLUS: number;
export declare const $COMMA: number;
export declare const $MINUS: number;
export declare const $PERIOD: number;
export declare const $SLASH: number;
export declare const $COLON: number;
export declare const $SEMICOLON: number;
export declare const $LT: number;
export declare const $EQ: number;
export declare const $GT: number;
export declare const $QUESTION: number;
export declare const $LBRACKET: number;
export declare const $BACKSLASH: number;
export declare const $RBRACKET: number;
export declare const $LBRACE: number;
export declare const $BAR: number;
export declare const $RBRACE: number;
export declare class ScannerError extends BaseException {
    message: any;
    constructor(message: any);
    toString(): string;
}
