import {ProtoWatchGroup, WatchGroup} from './watch_group';
import {CONST, FIELD} from 'facade/lang';
import { FieldGetterFactory, MODE_MASK_NOTIFY, MODE_MASK_STATE, MODE_PLUGIN_DIRTY_CHECK, MODE_STATE_MARKER, MODE_STATE_PROPERTY, MODE_STATE_INVOKE_CLOSURE, MODE_STATE_INVOKE_METHOD, MODE_STATE_MAP, MODE_STATE_LIST, $EOF, $TAB, $LF, $VTAB, $FF, $CR, $SPACE, $BANG, $DQ, $$, $PERCENT, $AMPERSAND, $SQ, $LPAREN, $RPAREN, $STAR, $PLUS, $COMMA, $MINUS, $PERIOD, $SLASH, $COLON, $SEMICOLON, $LT, $EQ, $GT, $QUESTION, $0, $9, $A, $B, $C, $D, $E, $F, $G, $H, $I, $J, $K, $L, $M, $N, $O, $P, $Q, $R, $S, $T, $U, $V, $W, $X, $Y, $Z, $LBRACKET, $BACKSLASH, $RBRACKET, $CARET, $_, $a, $b, $c, $d, $e, $f, $g, $h, $i, $j, $k, $l, $m, $n, $o, $p, $q, $r, $s, $t, $u, $v, $w, $x, $y, $z, $LBRACE, $BAR, $RBRACE, $TILDE, $NBSP } from './facade';

/**
 * For now we are dropping expression coalescence. We can always add it later, but
 * real world numbers show that it does not provide significant benefits.
 */
export class ProtoRecord {
  @FIELD('final watchGroup:wg.ProtoWatchGroup')
  @FIELD('final fieldName:String')
  /// order list of all records. Including head/tail markers
  @FIELD('next:ProtoRecord')
  @FIELD('prev:ProtoRecord')
  // Opaque data which will be the target of notification.
  // If the object is instance of Record, than it it is directly processed
  // Otherwise it is the context used by  WatchGroupDispatcher.
  @FIELD('memento')
  constructor(watchGroup:ProtoWatchGroup, fieldName:string, dispatchMemento) {
    this.watchGroup = watchGroup;
    this.fieldName = fieldName;
    this.dispatchMemento = dispatchMemento;
    this.next = null;
    this.prev = null;
 }
}


/**
 * Represents a Record for keeping track of changes. A change is a difference between previous
 * and current value.
 *
 * By default changes are detected using dirty checking, but a notifier can be present which can
 * notify the records of changes by means other than dirty checking. For example Object.observe
 * or events on DOM elements.
 *
 * DESIGN NOTES:
 *  - No inheritance allowed so that code is monomorphic for performance.
 *  - Atomic watch operations
 *  - Defaults to dirty checking
 *  - Keep this object as lean as possible. (Lean in number of fields)
 */
export class Record {
  @FIELD('final watchGroup:WatchGroup')
  @FIELD('final protoRecord:ProtoRecord')
  /// order list of all records. Including head/tail markers
  @FIELD('next:Record')
  @FIELD('prev:Record')
  /// next record to dirty check
  @FIELD('checkNext:Record')
  @FIELD('checkPrev:Record')
  // next notifier
  @FIELD('notifierNext:Record')

  @FIELD('mode:int')
  @FIELD('context')
  @FIELD('getter')
  @FIELD('previousValue')
  @FIELD('currentValue')
  constructor(watchGroup/*:wg.WatchGroup*/, protoRecord:ProtoRecord) {
    this.protoRecord = protoRecord;
    this.watchGroup = watchGroup;
    this.next = null;
    this.prev = null;
    this.checkNext = null;
    this.checkPrev = null;
    this.notifierNext = null;

    this.mode = MODE_STATE_MARKER;
    this.context = null;
    this.getter = null;
    this.arguments = null;
    this.previousValue = null;
    // `this` means that the record is fresh
    this.currentValue = this;
  }

  check():boolean {
    var mode = this.mode;
    var state = mode & MODE_MASK_STATE;
    var notify = mode & MODE_MASK_NOTIFY;
    var newValue;
    switch (state) {
      case MODE_STATE_MARKER:
        return false;
      case MODE_STATE_PROPERTY:
        newValue = this.getter(this.context);
        break;
      case MODE_STATE_INVOKE_CLOSURE:
        newValue = this.context(this.arguments);
        break;
      case MODE_STATE_INVOKE_METHOD:
        newValue = this.getter(this.context, this.arguments);
        break;
      case MODE_STATE_MAP:
        throw 'not implemented';
      case MODE_STATE_LIST:
        throw 'not implemented';
      default:
        throw 'not implemented';
    }


    var previousValue = this.currentValue;
    if (previousValue === this) {
      // When the record is checked for the first time we should always notify
      this.currentValue = newValue;
      this.previousValue = previousValue = null;
    } else {
      this.currentValue = newValue;
      this.previousValue = previousValue;

      if (isSame(previousValue, newValue)) return false;

      // In Dart, we can have `str1 !== str2` but `str1 == str2`
      if (previousValue instanceof String &&
          newValue instanceof String &&
          previousValue == newValue) {
        return false
      }
    }

    // todo(vicb): compute this info only once in ctor ? (add a bit in mode not to grow the mem req)
    if (this.protoRecord.dispatchMemento === null) {
      this.next.setContext(this.currentValue);
    } else {
      // notify through dispatcher
      this.watchGroup.dispatcher.onRecordChange(this, this.protoRecord.dispatchMemento);
    }

    return true;
  }

  setContext(context) {
    this.mode = MODE_STATE_PROPERTY;
    this.context = context;
    var factory = new FieldGetterFactory();
    this.getter = factory.getter(context, this.protoRecord.fieldName);
  }

}

// The mode is divided into two parts. Which notification mechanism
// to use and which dereference mode to execute.

function isSame(a, b) {
  if (a === b) return true;
  if ((a !== a) && (b !== b)) return true;
  return false;
}
