export const $EOF = /*@ts2dart_const*/ 0;
export const $TAB = /*@ts2dart_const*/ 9;
export const $LF = /*@ts2dart_const*/ 10;
export const $VTAB = /*@ts2dart_const*/ 11;
export const $FF = /*@ts2dart_const*/ 12;
export const $CR = /*@ts2dart_const*/ 13;
export const $SPACE = /*@ts2dart_const*/ 32;
export const $BANG = /*@ts2dart_const*/ 33;
export const $DQ = /*@ts2dart_const*/ 34;
export const $HASH = /*@ts2dart_const*/ 35;
export const $$ = /*@ts2dart_const*/ 36;
export const $PERCENT = /*@ts2dart_const*/ 37;
export const $AMPERSAND = /*@ts2dart_const*/ 38;
export const $SQ = /*@ts2dart_const*/ 39;
export const $LPAREN = /*@ts2dart_const*/ 40;
export const $RPAREN = /*@ts2dart_const*/ 41;
export const $STAR = /*@ts2dart_const*/ 42;
export const $PLUS = /*@ts2dart_const*/ 43;
export const $COMMA = /*@ts2dart_const*/ 44;
export const $MINUS = /*@ts2dart_const*/ 45;
export const $PERIOD = /*@ts2dart_const*/ 46;
export const $SLASH = /*@ts2dart_const*/ 47;
export const $COLON = /*@ts2dart_const*/ 58;
export const $SEMICOLON = /*@ts2dart_const*/ 59;
export const $LT = /*@ts2dart_const*/ 60;
export const $EQ = /*@ts2dart_const*/ 61;
export const $GT = /*@ts2dart_const*/ 62;
export const $QUESTION = /*@ts2dart_const*/ 63;

export const $0 = /*@ts2dart_const*/ 48;
export const $9 = /*@ts2dart_const*/ 57;

export const $A = /*@ts2dart_const*/ 65;
export const $E = /*@ts2dart_const*/ 69;
export const $Z = /*@ts2dart_const*/ 90;

export const $LBRACKET = /*@ts2dart_const*/ 91;
export const $BACKSLASH = /*@ts2dart_const*/ 92;
export const $RBRACKET = /*@ts2dart_const*/ 93;
export const $CARET = /*@ts2dart_const*/ 94;
export const $_ = /*@ts2dart_const*/ 95;

export const $a = /*@ts2dart_const*/ 97;
export const $e = /*@ts2dart_const*/ 101;
export const $f = /*@ts2dart_const*/ 102;
export const $n = /*@ts2dart_const*/ 110;
export const $r = /*@ts2dart_const*/ 114;
export const $t = /*@ts2dart_const*/ 116;
export const $u = /*@ts2dart_const*/ 117;
export const $v = /*@ts2dart_const*/ 118;
export const $z = /*@ts2dart_const*/ 122;

export const $LBRACE = /*@ts2dart_const*/ 123;
export const $BAR = /*@ts2dart_const*/ 124;
export const $RBRACE = /*@ts2dart_const*/ 125;
export const $NBSP = /*@ts2dart_const*/ 160;

export const $PIPE = /*@ts2dart_const*/ 124;
export const $TILDA = /*@ts2dart_const*/ 126;
export const $AT = /*@ts2dart_const*/ 64;

export function isWhitespace(code: number): boolean {
  return (code >= $TAB && code <= $SPACE) || (code == $NBSP);
}
