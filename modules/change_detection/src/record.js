import {ProtoRecordRange, RecordRange} from './record_range';
import {FIELD, isPresent, isBlank, int, StringWrapper, FunctionWrapper, BaseException} from 'facade/lang';
import {List, Map, ListWrapper, MapWrapper} from 'facade/collection';
import {ArrayChanges} from './array_changes';
import {KeyValueChanges} from './keyvalue_changes';

var _fresh = new Object();

const RECORD_TYPE_MASK = 0x000f;
export const RECORD_TYPE_CONST = 0x0000;
export const RECORD_TYPE_INVOKE_CLOSURE = 0x0001;
export const RECORD_TYPE_INVOKE_FORMATTER = 0x0002;
export const RECORD_TYPE_INVOKE_METHOD = 0x0003;
export const RECORD_TYPE_INVOKE_PURE_FUNCTION = 0x0004;
const RECORD_TYPE_ARRAY = 0x0005;
const RECORD_TYPE_KEY_VALUE = 0x0006;
const RECORD_TYPE_MARKER = 0x0007;
export const RECORD_TYPE_PROPERTY = 0x0008;
const RECORD_TYPE_NULL= 0x0009;

const RECORD_FLAG_DISABLED = 0x0100;
export const RECORD_FLAG_IMPLICIT_RECEIVER = 0x0200;
export const RECORD_FLAG_COLLECTION = 0x0400;

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
  name:string;
  dest:any;
  groupMemento:any;
  expressionAsString:string;

  next:ProtoRecord;

  recordInConstruction:Record;

  constructor(recordRange:ProtoRecordRange,
              mode:int,
              funcOrValue,
              arity:int,
              name:string,
              dest,
              groupMemento,
              expressionAsString:string) {

    this.recordRange = recordRange;
    this._mode = mode;
    this.funcOrValue = funcOrValue;
    this.arity = arity;
    this.name = name;
    this.dest = dest;
    this.groupMemento = groupMemento;
    this.expressionAsString = expressionAsString;

    this.next = null;
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
  // Otherwise it is the context used by ChangeDispatcher.
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

    this.context = null;
    this.funcOrValue = null;
    this.args = null;

    if (isBlank(protoRecord)) {
      this._mode = RECORD_TYPE_MARKER | RECORD_FLAG_DISABLED;
      return;
    }

    this._mode = protoRecord._mode;

    // Return early for collections, further init delayed until updateContext()
    if (this.isCollection()) return;

    this.currentValue = _fresh;

    var type = this.getType();

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

  // getters & setters perform much worse on some browsers
  // see http://jsperf.com/vicb-getter-vs-function
  getType():int {
    return this._mode & RECORD_TYPE_MASK;
  }

  setType(value:int) {
    this._mode = (this._mode & ~RECORD_TYPE_MASK) | value;
  }

  isDisabled():boolean {
    return (this._mode & RECORD_FLAG_DISABLED) === RECORD_FLAG_DISABLED;
  }

  isEnabled():boolean {
    return !this.isDisabled();
  }

  _setDisabled(value:boolean) {
    if (value) {
      this._mode |= RECORD_FLAG_DISABLED;
    } else {
      this._mode &= ~RECORD_FLAG_DISABLED;
    }
  }

  enable() {
    if (this.isEnabled()) return;

    var prevEnabled = this.findPrevEnabled();
    var nextEnabled = this.findNextEnabled();

    this.prevEnabled = prevEnabled;
    this.nextEnabled = nextEnabled;

    if (isPresent(prevEnabled)) prevEnabled.nextEnabled = this;
    if (isPresent(nextEnabled)) nextEnabled.prevEnabled = this;

    this._setDisabled(false);
  }

  disable() {
    var prevEnabled = this.prevEnabled;
    var nextEnabled = this.nextEnabled;

    if (isPresent(prevEnabled)) prevEnabled.nextEnabled = nextEnabled;
    if (isPresent(nextEnabled)) nextEnabled.prevEnabled = prevEnabled;

    this._setDisabled(true);
  }

  isImplicitReceiver():boolean {
    return (this._mode & RECORD_FLAG_IMPLICIT_RECEIVER) === RECORD_FLAG_IMPLICIT_RECEIVER;
  }

  isCollection():boolean {
    return (this._mode & RECORD_FLAG_COLLECTION) === RECORD_FLAG_COLLECTION;
  }

  static createMarker(rr:RecordRange):Record {
    return new Record(rr, null, null);
  }

  check():boolean {
    if (this.isCollection()) {
      return this._checkCollection();
    } else {
      return this._checkSingleRecord();
    }
  }

  _checkSingleRecord():boolean {
    this.previousValue = this.currentValue;
    this.currentValue = this._calculateNewValue();
    if (isSame(this.previousValue, this.currentValue)) return false;
    this._updateDestination();
    return true;
  }

  _updateDestination() {
    if (this.dest instanceof Record) {
      if (isPresent(this.protoRecord.dest.position)) {
        this.dest.updateArg(this.currentValue, this.protoRecord.dest.position);
      } else {
        this.dest.updateContext(this.currentValue);
      }
    }
  }

  // return whether the content has changed
  _checkCollection():boolean {
    switch(this.getType()) {
      case RECORD_TYPE_KEY_VALUE:
        var kvChangeDetector:KeyValueChanges = this.currentValue;
        return kvChangeDetector.check(this.context);

      case RECORD_TYPE_ARRAY:
        var arrayChangeDetector:ArrayChanges = this.currentValue;
        return arrayChangeDetector.check(this.context);

      case RECORD_TYPE_NULL:
        // no need to check the content again unless the context changes
        this.disable();
        this.currentValue = null;
        return true;

      default:
        throw new BaseException(`Unsupported record type (${this.getType()})`);
    }
  }

  _calculateNewValue() {
    try {
      return this.__calculateNewValue();
    } catch (e) {
      throw new ChangeDetectionError(this, e);
    }
  }

  __calculateNewValue() {
    switch (this.getType()) {
      case RECORD_TYPE_PROPERTY:
        var propertyGetter:Function = this.funcOrValue;
        return propertyGetter(this.context);

      case RECORD_TYPE_INVOKE_METHOD:
        var methodInvoker:Function = this.funcOrValue;
        return methodInvoker(this.context, this.args);

      case RECORD_TYPE_INVOKE_CLOSURE:
        return FunctionWrapper.apply(this.context, this.args);

      case RECORD_TYPE_INVOKE_PURE_FUNCTION:
      case RECORD_TYPE_INVOKE_FORMATTER:
        this.disable();
        return FunctionWrapper.apply(this.funcOrValue, this.args);

      case RECORD_TYPE_CONST:
        this.disable();
        return this.funcOrValue;

      default:
        throw new BaseException(`Unsupported record type (${this.getType()})`);
    }
  }

  updateArg(value, position:int) {
    this.args[position] = value;
    this.enable();
  }

  updateContext(value) {
    this.context = value;
    this.enable();

    if (this.isCollection()) {
      if (ArrayChanges.supports(value)) {
        if (this.getType() != RECORD_TYPE_ARRAY) {
          this.setType(RECORD_TYPE_ARRAY);
          this.currentValue = new ArrayChanges();
        }
        return;
      }

      if (KeyValueChanges.supports(value)) {
        if (this.getType() != RECORD_TYPE_KEY_VALUE) {
          this.setType(RECORD_TYPE_KEY_VALUE);
          this.currentValue = new KeyValueChanges();
        }
        return;
      }

      if (isBlank(value)) {
        this.setType(RECORD_TYPE_NULL);
      } else {
        throw new BaseException("Collection records must be array like, map like or null");
      }
    }
  }

  terminatesExpression():boolean {
    return !(this.dest instanceof Record);
  }

  isMarkerRecord():boolean {
    return this.getType() == RECORD_TYPE_MARKER;
  }

  expressionMemento() {
    return this.protoRecord.dest;
  }

  expressionAsString() {
    return this.protoRecord.expressionAsString;
  }

  groupMemento() {
    return isPresent(this.protoRecord) ? this.protoRecord.groupMemento : null;
  }


  /**
   * Returns the next enabled record. This search is not limited to the current range.
   *
   * [H ER1 T] [H ER2 T] _nextEnable(ER1) will return ER2
   *
   * The function skips disabled ranges.
   */
  findNextEnabled() {
    if (this.isEnabled()) return this.nextEnabled;

    var record = this.next;
    while (isPresent(record) && record.isDisabled()) {
      if (record.isMarkerRecord() && record.recordRange.disabled) {
        record = record.recordRange.tailRecord.next;
      } else {
        record = record.next;
      }
    }
    return record;
  }

  /**
   * Returns the prev enabled record. This search is not limited to the current range.
   *
   * [H ER1 T] [H ER2 T] _nextEnable(ER2) will return ER1
   *
   * The function skips disabled ranges.
   */
  findPrevEnabled() {
    if (this.isEnabled()) return this.prevEnabled;

    var record = this.prev;
    while (isPresent(record) && record.isDisabled()) {
      if (record.isMarkerRecord() && record.recordRange.disabled) {
        record = record.recordRange.headRecord.prev;
      } else {
        record = record.prev;
      }
    }
    return record;
  }

  inspect() {
    return _inspect(this);
  }

  inspectRange() {
    return this.recordRange.inspect();
  }
}

function _inspect(record:Record) {
  function mode() {
    switch (record.getType()) {
      case RECORD_TYPE_PROPERTY:
        return "property";
      case RECORD_TYPE_INVOKE_METHOD:
        return "invoke_method";
      case RECORD_TYPE_INVOKE_CLOSURE:
        return "invoke_closure";
      case RECORD_TYPE_INVOKE_PURE_FUNCTION:
        return "pure_function";
      case RECORD_TYPE_INVOKE_FORMATTER:
        return "invoke_formatter";
      case RECORD_TYPE_CONST:
        return "const";
      case RECORD_TYPE_KEY_VALUE:
        return "key_value";
      case RECORD_TYPE_ARRAY:
        return "array";
      case RECORD_TYPE_NULL:
        return "null";
      case RECORD_TYPE_MARKER:
        return "marker";
      default:
        return "unexpected type!";
    }
  }

  function disabled() {
    return record.isDisabled() ? "disabled" : "enabled";
  }

  function description() {
    var name = isPresent(record.protoRecord) ? record.protoRecord.name : "";
    var exp = isPresent(record.protoRecord) ? record.protoRecord.expressionAsString : "";
    var currValue = record.currentValue;
    var context = record.context;

    return `${mode()}, ${name}, ${disabled()} ` +
      ` Current: ${currValue}, Context: ${context} in [${exp}]`;
  }

  if (isBlank(record)) return null;
  if (!(record instanceof Record)) return record;

  return new _RecordInspect(description(), record);
}

class _RecordInspect {
  description:string;
  record:Record;

  constructor(description:string,record:Record) {
    this.description = description;
    this.record = record;
  }

  get next() {
    return _inspect(this.record.next);
  }
  get nextEnabled() {
    return _inspect(this.record.nextEnabled);
  }
  get dest() {
    return _inspect(this.record.dest);
  }
}

function isSame(a, b) {
  if (a === b) return true;
  if ((a !== a) && (b !== b)) return true;
  return false;
}

export class ChangeDetectionError extends Error {
  message:string;
  originalException:any;
  location:string;

  constructor(record:Record, originalException:any) {
    this.originalException = originalException;
    this.location = record.protoRecord.expressionAsString;
    this.message = `${this.originalException} in [${this.location}]`;
  }

  toString():string {
    return this.message;
  }
}
