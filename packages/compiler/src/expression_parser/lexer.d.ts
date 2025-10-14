/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
export declare enum TokenType {
    Character = 0,
    Identifier = 1,
    PrivateIdentifier = 2,
    Keyword = 3,
    String = 4,
    Operator = 5,
    Number = 6,
    RegExpBody = 7,
    RegExpFlags = 8,
    Error = 9
}
export declare enum StringTokenKind {
    Plain = 0,
    TemplateLiteralPart = 1,
    TemplateLiteralEnd = 2
}
export declare class Lexer {
    tokenize(text: string): Token[];
}
export declare class Token {
    index: number;
    end: number;
    type: TokenType;
    numValue: number;
    strValue: string;
    constructor(index: number, end: number, type: TokenType, numValue: number, strValue: string);
    isCharacter(code: number): boolean;
    isNumber(): boolean;
    isString(): this is StringToken;
    isOperator(operator: string): boolean;
    isIdentifier(): boolean;
    isPrivateIdentifier(): boolean;
    isKeyword(): boolean;
    isKeywordLet(): boolean;
    isKeywordAs(): boolean;
    isKeywordNull(): boolean;
    isKeywordUndefined(): boolean;
    isKeywordTrue(): boolean;
    isKeywordFalse(): boolean;
    isKeywordThis(): boolean;
    isKeywordTypeof(): boolean;
    isKeywordVoid(): boolean;
    isKeywordIn(): boolean;
    isError(): boolean;
    isRegExpBody(): boolean;
    isRegExpFlags(): boolean;
    toNumber(): number;
    isTemplateLiteralPart(): this is StringToken;
    isTemplateLiteralEnd(): this is StringToken;
    isTemplateLiteralInterpolationStart(): boolean;
    isTemplateLiteralInterpolationEnd(): boolean;
    toString(): string | null;
}
export declare class StringToken extends Token {
    readonly kind: StringTokenKind;
    constructor(index: number, end: number, strValue: string, kind: StringTokenKind);
}
export declare const EOF: Token;
