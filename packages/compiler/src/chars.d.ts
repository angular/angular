/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
export declare const $EOF = 0;
export declare const $BSPACE = 8;
export declare const $TAB = 9;
export declare const $LF = 10;
export declare const $VTAB = 11;
export declare const $FF = 12;
export declare const $CR = 13;
export declare const $SPACE = 32;
export declare const $BANG = 33;
export declare const $DQ = 34;
export declare const $HASH = 35;
export declare const $$ = 36;
export declare const $PERCENT = 37;
export declare const $AMPERSAND = 38;
export declare const $SQ = 39;
export declare const $LPAREN = 40;
export declare const $RPAREN = 41;
export declare const $STAR = 42;
export declare const $PLUS = 43;
export declare const $COMMA = 44;
export declare const $MINUS = 45;
export declare const $PERIOD = 46;
export declare const $SLASH = 47;
export declare const $COLON = 58;
export declare const $SEMICOLON = 59;
export declare const $LT = 60;
export declare const $EQ = 61;
export declare const $GT = 62;
export declare const $QUESTION = 63;
export declare const $0 = 48;
export declare const $7 = 55;
export declare const $9 = 57;
export declare const $A = 65;
export declare const $E = 69;
export declare const $F = 70;
export declare const $X = 88;
export declare const $Z = 90;
export declare const $LBRACKET = 91;
export declare const $BACKSLASH = 92;
export declare const $RBRACKET = 93;
export declare const $CARET = 94;
export declare const $_ = 95;
export declare const $a = 97;
export declare const $b = 98;
export declare const $e = 101;
export declare const $f = 102;
export declare const $n = 110;
export declare const $r = 114;
export declare const $t = 116;
export declare const $u = 117;
export declare const $v = 118;
export declare const $x = 120;
export declare const $z = 122;
export declare const $LBRACE = 123;
export declare const $BAR = 124;
export declare const $RBRACE = 125;
export declare const $NBSP = 160;
export declare const $PIPE = 124;
export declare const $TILDA = 126;
export declare const $AT = 64;
export declare const $BT = 96;
export declare function isWhitespace(code: number): boolean;
export declare function isDigit(code: number): boolean;
export declare function isAsciiLetter(code: number): boolean;
export declare function isAsciiHexDigit(code: number): boolean;
export declare function isNewLine(code: number): boolean;
export declare function isOctalDigit(code: number): boolean;
export declare function isQuote(code: number): boolean;
