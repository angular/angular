import {ProtoWatchGroup, WatchGroup} from './watch_group';
import {FIELD, isPresent, int, StringWrapper, FunctionWrapper, BaseException} from 'facade/lang';
import {ListWrapper} from 'facade/collection';
import {ClosureMap} from 'change_detection/parser/closure_map';

var _fresh = new Object();

export const PROTO_RECORD_CONST = 'const';
export const PROTO_RECORD_FUNC = 'func';
export const PROTO_RECORD_PROPERTY = 'property';

/**
 * For now we are dropping expression coalescence. We can always add it later, but
 * real world numbers show that it does not provide significant benefits.
 */
export class ProtoRecord {
  @FIELD('final watchGroup:wg.ProtoWatchGroup')
  @FIELD('final context:Object')
  @FIELD('final arity:int')
  @FIELD('final dest')

  @FIELD('next:ProtoRecord')
  @FIELD('prev:ProtoRecord')
  @FIELD('recordInConstruction:Record')
  constructor(watchGroup:ProtoWatchGroup,
              recordType:string,
              funcOrValue,
              arity:int,
              dest) {

    this.watchGroup = watchGroup;
    this.recordType = recordType;
    this.funcOrValue = funcOrValue;
    this.arity = arity;
    this.dest = dest;

    this.next = null;
    this.prev = null;

    this.recordInConstruction = null;
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
  @FIELD('next:Record')
  @FIELD('prev:Record')
  @FIELD('dest:Record')

  @FIELD('previousValue')
  @FIELD('currentValue')

  @FIELD('mode:int')
  @FIELD('context')
  @FIELD('funcOrValue')
  @FIELD('args:List')

  // Opaque data which will be the target of notification.
  // If the object is instance of Record, then it it is directly processed
  // Otherwise it is the context used by  WatchGroupDispatcher.
  @FIELD('dest')

  constructor(watchGroup:WatchGroup, protoRecord:ProtoRecord) {
    this.watchGroup = watchGroup;
    this.protoRecord = protoRecord;

    this.next = null;
    this.prev = null;
    this.dest = null;

    this.previousValue = null;
    this.currentValue = _fresh;

    this.mode = null;
    this.context = null;
    this.funcOrValue = null;
    this.args = null;

    if (protoRecord.recordType === PROTO_RECORD_CONST) {
      this.mode = MODE_STATE_CONST;
      this.funcOrValue = protoRecord.funcOrValue;

    } else if (protoRecord.recordType === PROTO_RECORD_FUNC) {
      this.mode = MODE_STATE_INVOKE_FUNCTION;
      this.funcOrValue = protoRecord.funcOrValue;
      this.args = ListWrapper.createFixedSize(protoRecord.arity);

    } else if (protoRecord.recordType === PROTO_RECORD_PROPERTY) {
      this.mode = MODE_STATE_PROPERTY;
      this.funcOrValue = protoRecord.funcOrValue;
    }
  }

  check():boolean {
    this.previousValue = this.currentValue;
    this.currentValue = this._calculateNewValue();

    if (isSame(this.previousValue, this.currentValue)) return false;

    this._updateDestination();

    return true;
  }

  _updateDestination() {
    // todo(vicb): compute this info only once in ctor ? (add a bit in mode not to grow the mem req)
    if (this.dest instanceof Record) {
      if (isPresent(this.protoRecord.dest.position)) {
        this.dest.updateArg(this.currentValue, this.protoRecord.dest.position);
      } else {
        this.dest.updateContext(this.currentValue);
      }
    } else {
      this.watchGroup.dispatcher.onRecordChange(this, this.protoRecord.dest);
    }
  }

  _calculateNewValue() {
    var state = this.mode;
    switch (state) {
      case MODE_STATE_PROPERTY:
        return this.funcOrValue(this.context);

      case MODE_STATE_INVOKE_FUNCTION:
        return FunctionWrapper.apply(this.funcOrValue, this.args);

      case MODE_STATE_CONST:
        return this.funcOrValue;

      case MODE_STATE_MARKER:
        throw new BaseException('MODE_STATE_MARKER not implemented');

      case MODE_STATE_INVOKE_METHOD:
        throw new BaseException('MODE_STATE_INVOKE_METHOD not implemented');

      case MODE_STATE_MAP:
        throw new BaseException('MODE_STATE_MAP not implemented');

      case MODE_STATE_LIST:
        throw new BaseException('MODE_STATE_LIST not implemented');

      default:
        throw new BaseException('DEFAULT not implemented');
    }
  }

  updateArg(value, position:int) {
    this.args[position] = value;
  }

  updateContext(value) {
    this.context = value;
  }
}

// The mode is divided into two parts. Which notification mechanism
// to use and which dereference mode to execute.

// We use dirty checking aka no notification
const MODE_MASK_NOTIFY = 0xFF00;
// Encodes the state of dereference
const MODE_MASK_STATE = 0x00FF;

const MODE_PLUGIN_DIRTY_CHECK = 0x0000;
const MODE_STATE_MARKER = 0x0000;

/// _context[_protoRecord.propname] => _getter(_context)
const MODE_STATE_PROPERTY = 0x0001;
/// _context(_arguments)
const MODE_STATE_INVOKE_FUNCTION = 0x0002;
/// _getter(_context, _arguments)
const MODE_STATE_INVOKE_METHOD = 0x0003;

/// _context is Map => _previousValue is MapChangeRecord
const MODE_STATE_MAP = 0x0004;
/// _context is Array/List/Iterable => _previousValue = ListChangeRecord
const MODE_STATE_LIST = 0x0005;

/// _context is number/string
const MODE_STATE_CONST = 0x0006;

function isSame(a, b) {
  if (a instanceof String && b instanceof String) return a == b;
  if (a === b) return true;
  if ((a !== a) && (b !== b)) return true;
  return false;
}
