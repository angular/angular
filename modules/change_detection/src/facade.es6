export var SetterFn = Function;

export class FieldGetterFactory {
  getter(object, name:string) {
    return new Function('o', 'return o["' + name + '"]');
  }
}

// These are here only because we have no way to annotate Dart's compile-time
// constant expressions. Keep in sync with facade.dart.
// TODO(rado): move back to .js file when we decide how to handle Dart's const.

// We use dirty checking aka no notification
export const MODE_MASK_NOTIFY = 0xFF00;
// Encodes the state of dereference
export const MODE_MASK_STATE = 0x00FF;

export const MODE_PLUGIN_DIRTY_CHECK = 0x0000;
export const MODE_STATE_MARKER = 0x0000;

/// _context[_protoRecord.propname] => _getter(_context)
export const MODE_STATE_PROPERTY = 0x0001;
/// _context(_arguments)
export const MODE_STATE_INVOKE_CLOSURE = 0x0002;
/// _getter(_context, _arguments)
export const MODE_STATE_INVOKE_METHOD = 0x0003;

/// _context is Map => _previousValue is MapChangeRecord
export const MODE_STATE_MAP = 0x0004;
/// _context is Array/List/Iterable => _previousValue = ListChangeRecord
export const MODE_STATE_LIST = 0x0005;

export const $EOF       = 0;
export const $TAB       = 9;
export const $LF        = 10;
export const $VTAB      = 11;
export const $FF        = 12;
export const $CR        = 13;
export const $SPACE     = 32;
export const $BANG      = 33;
export const $DQ        = 34;
export const $$         = 36;
export const $PERCENT   = 37;
export const $AMPERSAND = 38;
export const $SQ        = 39;
export const $LPAREN    = 40;
export const $RPAREN    = 41;
export const $STAR      = 42;
export const $PLUS      = 43;
export const $COMMA     = 44;
export const $MINUS     = 45;
export const $PERIOD    = 46;
export const $SLASH     = 47;
export const $COLON     = 58;
export const $SEMICOLON = 59;
export const $LT        = 60;
export const $EQ        = 61;
export const $GT        = 62;
export const $QUESTION  = 63;

export const $0 = 48;
export const $9 = 57;

export const $A = 65, $B = 66, $C = 67, $D = 68, $E = 69, $F = 70, $G = 71, $H = 72,
      $I = 73, $J = 74, $K = 75, $L = 76, $M = 77, $N = 78, $O = 79, $P = 80,
      $Q = 81, $R = 82, $S = 83, $T = 84, $U = 85, $V = 86, $W = 87, $X = 88,
      $Y = 89, $Z = 90;

export const $LBRACKET  = 91;
export const $BACKSLASH = 92;
export const $RBRACKET  = 93;
export const $CARET     = 94;
export const $_         = 95;

export const $a =  97, $b =  98, $c =  99, $d = 100, $e = 101, $f = 102, $g = 103,
      $h = 104, $i = 105, $j = 106, $k = 107, $l = 108, $m = 109, $n = 110,
      $o = 111, $p = 112, $q = 113, $r = 114, $s = 115, $t = 116, $u = 117,
      $v = 118, $w = 119, $x = 120, $y = 121, $z = 122;

export const $LBRACE = 123;
export const $BAR    = 124;
export const $RBRACE = 125;
export const $TILDE  = 126;
export const $NBSP   = 160;
