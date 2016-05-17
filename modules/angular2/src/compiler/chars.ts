import {CONST_EXPR} from 'angular2/src/facade/lang';

export const $EOF = CONST_EXPR(0);
export const $TAB = CONST_EXPR(9);
export const $LF = CONST_EXPR(10);
export const $VTAB = CONST_EXPR(11);
export const $FF = CONST_EXPR(12);
export const $CR = CONST_EXPR(13);
export const $SPACE = CONST_EXPR(32);
export const $BANG = CONST_EXPR(33);
export const $DQ = CONST_EXPR(34);
export const $HASH = CONST_EXPR(35);
export const $$ = CONST_EXPR(36);
export const $PERCENT = CONST_EXPR(37);
export const $AMPERSAND = CONST_EXPR(38);
export const $SQ = CONST_EXPR(39);
export const $LPAREN = CONST_EXPR(40);
export const $RPAREN = CONST_EXPR(41);
export const $STAR = CONST_EXPR(42);
export const $PLUS = CONST_EXPR(43);
export const $COMMA = CONST_EXPR(44);
export const $MINUS = CONST_EXPR(45);
export const $PERIOD = CONST_EXPR(46);
export const $SLASH = CONST_EXPR(47);
export const $COLON = CONST_EXPR(58);
export const $SEMICOLON = CONST_EXPR(59);
export const $LT = CONST_EXPR(60);
export const $EQ = CONST_EXPR(61);
export const $GT = CONST_EXPR(62);
export const $QUESTION = CONST_EXPR(63);

export const $0 = CONST_EXPR(48);
export const $9 = CONST_EXPR(57);

export const $A = CONST_EXPR(65);
export const $E = CONST_EXPR(69);
export const $Z = CONST_EXPR(90);

export const $LBRACKET = CONST_EXPR(91);
export const $BACKSLASH = CONST_EXPR(92);
export const $RBRACKET = CONST_EXPR(93);
export const $CARET = CONST_EXPR(94);
export const $_ = CONST_EXPR(95);

export const $a = CONST_EXPR(97);
export const $e = CONST_EXPR(101);
export const $f = CONST_EXPR(102);
export const $n = CONST_EXPR(110);
export const $r = CONST_EXPR(114);
export const $t = CONST_EXPR(116);
export const $u = CONST_EXPR(117);
export const $v = CONST_EXPR(118);
export const $z = CONST_EXPR(122);

export const $LBRACE = CONST_EXPR(123);
export const $BAR = CONST_EXPR(124);
export const $RBRACE = CONST_EXPR(125);
export const $NBSP = CONST_EXPR(160);

export const $PIPE = CONST_EXPR(124);
export const $TILDA = CONST_EXPR(126);
export const $AT = CONST_EXPR(64);

export function isWhitespace(code: number): boolean {
  return (code >= $TAB && code <= $SPACE) || (code == $NBSP);
}
