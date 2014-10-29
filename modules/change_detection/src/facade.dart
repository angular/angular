library change_detection.facade;

@MirrorsUsed(targets: const [FieldGetterFactory], metaTargets: const [] )
import 'dart:mirrors';

typedef SetterFn(Object obj, value);

class FieldGetterFactory {
  getter(Object object, String name) {
    Symbol symbol = new Symbol(name);
    InstanceMirror instanceMirror = reflect(object);
    return (Object object) => instanceMirror.getField(symbol).reflectee;
  }
}

// These are here only because we have no way to annotate Dart's compile-time
// export constant expressions. Keep in sync with facade.es6.
// TODO(rado): move back to .js file when we decide how to handle Dart's const.

// We use dirty checking aka no notification
const MODE_MASK_NOTIFY = 0xFF00;
// Encodes the state of dereference
const MODE_MASK_STATE = 0x00FF;

const MODE_PLUGIN_DIRTY_CHECK = 0x0000;
const MODE_STATE_MARKER = 0x0000;

/// _context[_protoRecord.propname] => _getter(_context)
const MODE_STATE_PROPERTY = 0x0001;
/// _context(_arguments)
const MODE_STATE_INVOKE_CLOSURE = 0x0002;
/// _getter(_context, _arguments)
const MODE_STATE_INVOKE_METHOD = 0x0003;

/// _context is Map => _previousValue is MapChangeRecord
const MODE_STATE_MAP = 0x0004;
/// _context is Array/List/Iterable => _previousValue = ListChangeRecord
const MODE_STATE_LIST = 0x0005;

const $EOF       = 0;
const $TAB       = 9;
const $LF        = 10;
const $VTAB      = 11;
const $FF        = 12;
const $CR        = 13;
const $SPACE     = 32;
const $BANG      = 33;
const $DQ        = 34;
const $$         = 36;
const $PERCENT   = 37;
const $AMPERSAND = 38;
const $SQ        = 39;
const $LPAREN    = 40;
const $RPAREN    = 41;
const $STAR      = 42;
const $PLUS      = 43;
const $COMMA     = 44;
const $MINUS     = 45;
const $PERIOD    = 46;
const $SLASH     = 47;
const $COLON     = 58;
const $SEMICOLON = 59;
const $LT        = 60;
const $EQ        = 61;
const $GT        = 62;
const $QUESTION  = 63;

const $0 = 48;
const $9 = 57;

const $A = 65, $B = 66, $C = 67, $D = 68, $E = 69, $F = 70, $G = 71, $H = 72,
      $I = 73, $J = 74, $K = 75, $L = 76, $M = 77, $N = 78, $O = 79, $P = 80,
      $Q = 81, $R = 82, $S = 83, $T = 84, $U = 85, $V = 86, $W = 87, $X = 88,
      $Y = 89, $Z = 90;

const $LBRACKET  = 91;
const $BACKSLASH = 92;
const $RBRACKET  = 93;
const $CARET     = 94;
const $_         = 95;

const $a =  97, $b =  98, $c =  99, $d = 100, $e = 101, $f = 102, $g = 103,
      $h = 104, $i = 105, $j = 106, $k = 107, $l = 108, $m = 109, $n = 110,
      $o = 111, $p = 112, $q = 113, $r = 114, $s = 115, $t = 116, $u = 117,
      $v = 118, $w = 119, $x = 120, $y = 121, $z = 122;

const $LBRACE = 123;
const $BAR    = 124;
const $RBRACE = 125;
const $TILDE  = 126;
const $NBSP   = 160;
