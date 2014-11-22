import {ProtoRecordRange, RecordRange} from './record_range';
import {FIELD, isPresent, isBlank, int, StringWrapper, FunctionWrapper, BaseException} from 'facade/lang';
import {List, Map, ListWrapper, MapWrapper} from 'facade/collection';
import {ClosureMap} from 'change_detection/parser/closure_map';

var _fresh = new Object();

const RECORD_TYPE_MASK = 0x000f;
export const RECORD_TYPE_CONST = 0x0000;
export const RECORD_TYPE_INVOKE_CLOSURE = 0x0001;
export const RECORD_TYPE_INVOKE_FORMATTER = 0x0002;
export const RECORD_TYPE_INVOKE_METHOD = 0x0003;
export const RECORD_TYPE_INVOKE_PURE_FUNCTION = 0x0004;
export const RECORD_TYPE_LIST = 0x0005;
export const RECORD_TYPE_MAP = 0x0006;
export const RECORD_TYPE_MARKER = 0x0007;
export const RECORD_TYPE_PROPERTY = 0x0008;

const RECORD_FLAG_DISABLED = 0x0100;
export const RECORD_FLAG_IMPLICIT_RECEIVER = 0x0200;



/**
 * For now we are dropping expression coalescence. We can always add it later, but
 * real world numbers show that it does not provide significant benefits.
 */
export class ProtoRecord {
  recordRange:ProtoRecordRange;
  _mode:int;
  context:any;
  funcOrValue:any;
  arity:int;
  dest;

  next:ProtoRecord;
  prev:ProtoRecord;
  recordInConstruction:Record;
  constructor(recordRange:ProtoRecordRange,
              mode:int,
              funcOrValue,
              arity:int,
              dest) {

    this.recordRange = recordRange;
    this._mode = mode;
    this.funcOrValue = funcOrValue;
    this.arity = arity;
    this.dest = dest;

    this.next = null;
    this.prev = null;
    // The concrete Record instantiated from this ProtoRecord
    this.recordInConstruction = null;
  }

  setIsImplicitReceiver() {
    this._mode |= RECORD_FLAG_IMPLICIT_RECEIVER;
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
  recordRange:RecordRange;
  protoRecord:ProtoRecord;
  next:Record;
  prev:Record;

  /// This reference can change.
  nextEnabled:Record;

  /// This reference can change.
  prevEnabled:Record;

  previousValue;
  currentValue;

  _mode:int;
  context;
  funcOrValue;
  args:List;

  // Opaque data which will be the target of notification.
  // If the object is instance of Record, then it it is directly processed
  // Otherwise it is the context used by  WatchGroupDispatcher.
  dest;

  constructor(recordRange:RecordRange, protoRecord:ProtoRecord, formatters:Map) {
    this.recordRange = recordRange;
    this.protoRecord = protoRecord;

    this.next = null;
    this.prev = null;
    this.nextEnabled = null;
    this.prevEnabled = null;
    this.dest = null;

    this.previousValue = null;
    this.currentValue = _fresh;

    this.context = null;
    this.funcOrValue = null;
    this.args = null;

    if (isBlank(protoRecord)) {
      this._mode = RECORD_TYPE_MARKER | RECORD_FLAG_DISABLED;
      return;
    }

    this._mode = protoRecord._mode;

    var type = this.type;

    if (type === RECORD_TYPE_CONST) {
      this.funcOrValue = protoRecord.funcOrValue;

    } else if (type === RECORD_TYPE_INVOKE_PURE_FUNCTION) {
      this.funcOrValue = protoRecord.funcOrValue;
      this.args = ListWrapper.createFixedSize(protoRecord.arity);

    } else if (type === RECORD_TYPE_INVOKE_FORMATTER) {
      this.funcOrValue = MapWrapper.get(formatters, protoRecord.funcOrValue);
      this.args = ListWrapper.createFixedSize(protoRecord.arity);

    } else if (type === RECORD_TYPE_INVOKE_METHOD) {
      this.funcOrValue = protoRecord.funcOrValue;
      this.args = ListWrapper.createFixedSize(protoRecord.arity);

    } else if (type === RECORD_TYPE_INVOKE_CLOSURE) {
      this.args = ListWrapper.createFixedSize(protoRecord.arity);

    } else if (type === RECORD_TYPE_PROPERTY) {
      this.funcOrValue = protoRecord.funcOrValue;
    }
  }

  get type() {
    return this._mode & RECORD_TYPE_MASK;
  }

  get disabled() {
    return (this._mode & RECORD_FLAG_DISABLED) === RECORD_FLAG_DISABLED;
  }

  set disabled(value) {
    if (value) {
      this._mode |= RECORD_FLAG_DISABLED;
    } else {
      this._mode &= ~RECORD_FLAG_DISABLED;
    }
  }

  get isImplicitReceiver() {
    return (this._mode & RECORD_FLAG_IMPLICIT_RECEIVER) === RECORD_FLAG_IMPLICIT_RECEIVER;
  }

  static createMarker(rr:RecordRange) {
    return new Record(rr, null, null);
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
      this.recordRange.dispatcher.onRecordChange(this, this.protoRecord.dest);
    }
  }

  _calculateNewValue() {
    var type = this.type;
    switch (type) {
      case RECORD_TYPE_PROPERTY:
        return this.funcOrValue(this.context);

      case RECORD_TYPE_INVOKE_METHOD:
        return this.funcOrValue(this.context, this.args);

      case RECORD_TYPE_INVOKE_CLOSURE:
        return FunctionWrapper.apply(this.context, this.args);

      case RECORD_TYPE_INVOKE_PURE_FUNCTION:
      case RECORD_TYPE_INVOKE_FORMATTER:
        this.recordRange.disableRecord(this);
        return FunctionWrapper.apply(this.funcOrValue, this.args);

      case RECORD_TYPE_CONST:
        this.recordRange.disableRecord(this);
        return this.funcOrValue;

      case RECORD_TYPE_MARKER:
        throw new BaseException('Marker not implemented');

      case RECORD_TYPE_MAP:
        throw new BaseException('Map not implemented');

      case RECORD_TYPE_LIST:
        throw new BaseException('List not implemented');

      default:
        throw new BaseException(`Unsupported record type ($type)`);
    }
  }

  updateArg(value, position:int) {
    this.args[position] = value;
    this.recordRange.enableRecord(this);
  }

  updateContext(value) {
    this.context = value;
    if (!this.isMarkerRecord) {
      this.recordRange.enableRecord(this);
    }
  }

  get isMarkerRecord() {
    return this.type == RECORD_TYPE_MARKER;
  }
}

function isSame(a, b) {
  if (a === b) return true;
  if ((a !== a) && (b !== b)) return true;
  return false;
}
