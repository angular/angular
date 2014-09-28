import {ProtoWatchGroup, WatchGroup} from './watch_group';

export class ProtoRecord {

  @FIELD('final watchGroup:ProtoWatchGroup')
  @FIELD('final fieldName:String')
  /// order list of all records. Including head/tail markers
  @FIELD('next:ProtoRecord')
  @FIELD('prev:ProtoRecord')
  /// next record to dirty check
  @FIELD('_checkNext:ProtoRecord')
  @FIELD('_checkPrev:ProtoRecord')
  // next notifier
  @FIELD('_notifierNext:ProtoRecord')
  // Opeque data which will be presented to WatchGroupDispatcher
  @FIELD('dispatcherContext')
  // IF we detect change, we have to update the _context of the
  // next record.
  @FIELD('_updateContext:ProtoRecord')
  // May be removed if we don't support coelsence.
  @FIELD('_updateContextNext:ProtoRecord')
  @FIELD('_clone')
  constructor(watchGroup:ProtoWatchGroup, fieldName:String) {
    this.watchGroup = watchGroup;
    this.fieldName = fieldName;
    this.next = null;
    this.prev = null;
    this._checkNext = null;
    this._checkPrev = null;
    this._notifierNext = null;
    this.dispatcherContext = null;
    this._updateContext = null;
    this._updateContextNext = null;
    this._clone = null;
  }

  instantiate(watchGroup:WatchGroup):Record {
    var record = this._clone = new Record(watchGroup, this);
    record.prev = this.prev._clone;
    record._checkPrev = this._checkPrev._clone;
    return _clone;
  }

  instantiateComplete():Record {
    var record = this._clone;
    record.next = this.next._clone;
    record._checkNext = this._checkNext._clone;
    this._clone = null;
    return this.next;
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
 * 
 * MEMORY COST: 13 Words;
 */
export class Record {
  
  @FIELD('final watchGroup:WatchGroup')
  @FIELD('final protoRecord:ProtoRecord')
  /// order list of all records. Including head/tail markers
  @FIELD('_next:Record')
  @FIELD('_prev:Record')
  /// next record to dirty check 
  @FIELD('_checkNext:Record')
  @FIELD('_checkPrev:Record')
  // next notifier
  @FIELD('_notifierNext:Record')
  // notifier context will be present to the notifier to release
  // the object from notification/watching.
  @FIELD('_notifierContext')
  // IF we detect change, we have to update the _context of the
  // next record.
  @FIELD('_updateContext:Record')
  // May be removed if we don't support coelsence.
  @FIELD('_updateContextNext:Record')

  @FIELD('_mode:int')
  @FIELD('_context')
  @FIELD('_getter')
  @FIELD('_arguments')
  @FIELD('currentValue')
  @FIELD('previousValue')
  constructor(watchGroup:WatchGroup, protoRecord:ProtoRecord) {
    this.protoRecord = protoRecord;
    this.watchGroup = watchGroup;
    this.next = null;
    this.prev = null;
    this._checkNext = null;
    this._checkPrev = null;
    this._notifierNext = null;
    this._notifierContext = null;
    this._updateContext = null;
    this._updateContextNext = null;

    this._mode = MODE_STATE_MARKER;
    this._context = null;
    this._getter = null;
    this._arguments = null;
    this.currentValue = null;
    this.previousValue = null;
  }

  check():bool {
    var mode = this._mode;
    var state = mode & MODE_MASK_STATE;
    var notify = mode & MODE_MASK_NOTIFY;
    var currentValue;
    switch (state) {
      case MODE_STATE_MARKER: 
        return false;
      case MODE_STATE_PROPERTY:
        currentValue = this._getter(this._context);
        break;
      case MODE_STATE_INVOKE_CLOSURE:
        currentValue = this._context(this._arguments);
        break;
      case MODE_STATE_INVOKE_METHOD:
        currentValue = this._getter(this._context, this._arguments);
        break;
      case MODE_STATE_MAP:
      case MODE_STATE_LIST:
    }
    var previousValue = this.previousValue;
    if (isSame(previousValue, currentValue)) return false;
    if (previousValue instanceof String && currentValue instanceof String  
        && previousValue == currentValue) {
      this.previousValue = currentValue;
      return false
    }
    this.previousValue = currentValue;
    this.watchGroup.dispatcher.onRecordChange(this, this.protoRecord.dispatcherContext);
    return true;
  }
}

// The mode is devided into two partes. Which notification mechanism
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
const MODE_STATE_INVOKE_CLOSURE = 0x0002;
/// _getter(_context, _arguments)
const MODE_STATE_INVOKE_METHOD = 0x0003;

/// _context is Map => _previousValue is MapChangeRecord
const MODE_STATE_MAP = 0x0004;
/// _context is Array/List/Iterable => _previousValue = ListChangeRecord
const MODE_STATE_LIST = 0x0005;

function isSame(a, b) {
  if (a === b) {
    return true;
  } else if ((a !== a) && (b !== b)) {
    return true;
  } else {
    return false;
  }
} 
