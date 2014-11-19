import {ProtoRecord, Record, PROTO_RECORD_CONST, PROTO_RECORD_PURE_FUNCTION,
  PROTO_RECORD_PROPERTY, PROTO_RECORD_METHOD, PROTO_RECORD_CLOSURE, PROTO_RECORD_FORMATTTER} from './record';
import {FIELD, IMPLEMENTS, isBlank, isPresent, int, toBool, autoConvertAdd, BaseException} from 'facade/lang';
import {ListWrapper, MapWrapper} from 'facade/collection';
import {AST, AccessMember, ImplicitReceiver, AstVisitor, LiteralPrimitive,
  Binary, Formatter, MethodCall, FunctionCall, PrefixNot, Conditional,
  LiteralArray, LiteralMap, KeyedAccess, Chain, Assignment} from './parser/ast';

export class ProtoWatchGroup {
  @FIELD('headRecord:ProtoRecord')
  @FIELD('tailRecord:ProtoRecord')
  constructor() {
    this.headRecord = null;
    this.tailRecord = null;
  }

  /**
   * Parses [ast] into [ProtoRecord]s and adds them to [ProtoWatchGroup].
   *
   * @param ast The expression to watch
   * @param memento an opaque object which will be passed to WatchGroupDispatcher on
   *        detecting a change.
   * @param shallow Should collections be shallow watched
   */
  watch(ast:AST,
        memento,
        shallow = false)
  {
    var creator = new ProtoRecordCreator(this);
    creator.createRecordsFromAST(ast, memento);
    this._addRecords(creator.headRecord, creator.tailRecord);
  }

  // try to encapsulate this behavior in some class (e.g., LinkedList)
  // so we can say: group.appendList(creator.list);
  _addRecords(head:ProtoRecord, tail:ProtoRecord) {
    if (isBlank(this.headRecord)) {
      this.headRecord = head;
    } else {
      this.tailRecord.next = head;
      head.prev = this.tailRecord;
    }
    this.tailRecord = tail;
  }

  // TODO(rado): the type annotation should be dispatcher:WatchGroupDispatcher.
  // but @Implements is not ready yet.
  instantiate(dispatcher, formatters:Map):WatchGroup {
    var watchGroup:WatchGroup = new WatchGroup(this, dispatcher);
    if (this.headRecord !== null) {
      this._createRecords(watchGroup, formatters);
      this._setDestination();
    }
    return watchGroup;
  }

  _createRecords(watchGroup:WatchGroup, formatters:Map) {
    for (var proto = this.headRecord; proto != null; proto = proto.next) {
      var record = new Record(watchGroup, proto, formatters);
      proto.recordInConstruction = record;
      watchGroup.addRecord(record);
    }
  }

  _setDestination() {
    for (var proto = this.headRecord; proto != null; proto = proto.next) {
      if (proto.dest instanceof Destination) {
        proto.recordInConstruction.dest = proto.dest.record.recordInConstruction;
      }
      proto.recordInConstruction = null;
    }
  }
}

export class WatchGroup {
  @FIELD('final protoWatchGroup:ProtoWatchGroup')
  @FIELD('final dispatcher:WatchGroupDispatcher')
  @FIELD('final headRecord:Record')
  @FIELD('final tailRecord:Record')
  @FIELD('final disabled:boolean')
  // TODO(rado): the type annotation should be dispatcher:WatchGroupDispatcher.
  // but @Implements is not ready yet.
  constructor(protoWatchGroup:ProtoWatchGroup, dispatcher) {
    this.protoWatchGroup = protoWatchGroup;
    this.dispatcher = dispatcher;

    this.disabled = false;

    this.headRecord = Record.createMarker(this);
    this.tailRecord = Record.createMarker(this);

    this.headRecord.next = this.tailRecord;
    this.tailRecord.prev = this.headRecord;
  }

  /// addRecord assumes that all records are enabled
  addRecord(record:Record) {
    var lastRecord = this.tailRecord.prev;

    lastRecord.next = record;
    lastRecord.nextEnabled = record;

    record.prev = lastRecord;
    record.prevEnabled = lastRecord;

    record.next = this.tailRecord;
    this.tailRecord.prev = record;
  }

  addChild(child:WatchGroup) {
    var lastRecord = this.tailRecord.prev;
    var lastEnabledRecord = this.findLastEnabledRecord();
    var firstEnabledChildRecord = child.findFirstEnabledRecord();

    lastRecord.next = child.headRecord;
    child.headRecord.prev = lastRecord;

    child.tailRecord.next = this.tailRecord;
    this.tailRecord.prev = child.tailRecord;

    if (isPresent(lastEnabledRecord) && isPresent(firstEnabledChildRecord)) {
      lastEnabledRecord.nextEnabled = firstEnabledChildRecord;
      firstEnabledChildRecord.prevEnabled = lastEnabledRecord;
    }
  }

  removeChild(child:WatchGroup) {
    var firstEnabledChildRecord = child.findFirstEnabledRecord();
    var lastEnabledChildRecord = child.findLastEnabledRecord();

    var next = child.tailRecord.next;
    var prev = child.headRecord.prev;

    next.prev = prev;
    prev.next = next;

    var nextEnabled = lastEnabledChildRecord.nextEnabled;
    var prevEnabled = firstEnabledChildRecord.prevEnabled;

    if (isPresent(nextEnabled)) nextEnabled.prev = prevEnabled;
    if (isPresent(prevEnabled)) prevEnabled.next = nextEnabled;
  }

  findFirstEnabledRecord() {
    return this._nextEnabled(this.headRecord);
  }

  findLastEnabledRecord() {
    return this._prevEnabled(this.tailRecord);
  }

  disableRecord(record:Record) {
    var prevEnabled = record.prevEnabled;
    var nextEnabled = record.nextEnabled;

    if (isPresent(prevEnabled)) prevEnabled.nextEnabled = nextEnabled;
    if (isPresent(nextEnabled)) nextEnabled.prevEnabled = prevEnabled;

    record.disabled = true;
  }

  enableRecord(record:Record) {
    if (!record.disabled) return;

    var prevEnabled = this._prevEnabled(record);
    var nextEnabled = this._nextEnabled(record);

    record.prevEnabled = prevEnabled;
    record.nextEnabled = nextEnabled;

    if (isPresent(prevEnabled)) prevEnabled.nextEnabled = record;
    if (isPresent(nextEnabled)) nextEnabled.prevEnabled = record;

    record.disabled = false;
  }

  disableGroup(child:WatchGroup) {
    var firstEnabledChildRecord = child.findFirstEnabledRecord();
    var lastEnabledChildRecord = child.findLastEnabledRecord();

    var nextEnabled = lastEnabledChildRecord.nextEnabled;
    var prevEnabled = firstEnabledChildRecord.prevEnabled;

    if (isPresent(nextEnabled)) nextEnabled.prevEnabled = prevEnabled;
    if (isPresent(prevEnabled)) prevEnabled.nextEnabled = nextEnabled;

    child.disabled = true;
  }

  enableGroup(child:WatchGroup) {
    var prevEnabledRecord = this._prevEnabled(child.headRecord);
    var nextEnabledRecord = this._nextEnabled(child.tailRecord);

    var firstEnabledChildRecord = child.findFirstEnabledRecord();
    var lastEnabledChildRecord = child.findLastEnabledRecord();

    if (isPresent(firstEnabledChildRecord) && isPresent(prevEnabledRecord)){
      firstEnabledChildRecord.prevEnabled = prevEnabledRecord;
      prevEnabledRecord.nextEnabled = firstEnabledChildRecord;
    }

    if (isPresent(lastEnabledChildRecord) && isPresent(nextEnabledRecord)){
      lastEnabledChildRecord.nextEnabled = nextEnabledRecord;
      nextEnabledRecord.prevEnabled = lastEnabledChildRecord;
    }

    child.disabled = false;
  }

  _nextEnabled(record:Record) {
    record = record.next;
    while (isPresent(record) && record !== this.tailRecord && record.disabled) {
      if (record.isMarkerRecord && record.watchGroup.disabled) {
        record = record.watchGroup.tailRecord.next;
      } else {
        record = record.next;
      }
    }
    return record === this.tailRecord ? null : record;
  }

  _prevEnabled(record:Record) {
    record = record.prev;
    while (isPresent(record) && record !== this.headRecord && record.disabled) {
      if (record.isMarkerRecord && record.watchGroup.disabled) {
        record = record.watchGroup.headRecord.prev;
      } else {
        record = record.prev;
      }
    }
    return record === this.headRecord ? null : record;
  }

  /**
   * Sets the context (the object) on which the change detection expressions will
   * dereference themselves on. Since the WatchGroup can be reused the context
   * can be re-set many times during the lifetime of the WatchGroup.
   *
   * @param context the new context for change detection for the current WatchGroup
   */
  setContext(context) {
    for (var record:Record = this.headRecord;
         record != null;
         record = record.next) {

      record.updateContext(context);
    }
  }
}

export class WatchGroupDispatcher {
  // The record holds the previous value at the time of the call
  onRecordChange(record:Record, context) {}
}

//todo: vsavkin: Create Array and Context destinations?
class Destination {
  constructor(record:ProtoRecord, position:int) {
    this.record = record;
    this.position = position;
  }
}


@IMPLEMENTS(AstVisitor)
class ProtoRecordCreator {
  @FIELD('final protoWatchGroup:ProtoWatchGroup')
  @FIELD('headRecord:ProtoRecord')
  @FIELD('tailRecord:ProtoRecord')
  constructor(protoWatchGroup) {
    this.protoWatchGroup = protoWatchGroup;
    this.headRecord = null;
    this.tailRecord = null;
  }

  visitImplicitReceiver(ast:ImplicitReceiver, args) {
    //do nothing
  }

  visitLiteralPrimitive(ast:LiteralPrimitive, dest) {
    this.add(this.construct(PROTO_RECORD_CONST, ast.value, 0, dest));
  }

  visitBinary(ast:Binary, dest) {
    var record = this.construct(PROTO_RECORD_PURE_FUNCTION, _operationToFunction(ast.operation), 2, dest);
    ast.left.visit(this, new Destination(record, 0));
    ast.right.visit(this, new Destination(record, 1));
    this.add(record);
  }

  visitPrefixNot(ast:PrefixNot, dest) {
    var record = this.construct(PROTO_RECORD_PURE_FUNCTION, _operation_negate, 1, dest);
    ast.expression.visit(this, new Destination(record, 0));
    this.add(record);
  }

  visitAccessMember(ast:AccessMember, dest) {
    var record = this.construct(PROTO_RECORD_PROPERTY, ast.getter, 0, dest);
    ast.receiver.visit(this, new Destination(record, null));
    this.add(record);
  }

  visitFormatter(ast:Formatter, dest) {
    var record = this.construct(PROTO_RECORD_FORMATTTER, ast.name, ast.allArgs.length, dest);
    for (var i = 0; i < ast.allArgs.length; ++i) {
      ast.allArgs[i].visit(this, new Destination(record, i));
    }
    this.add(record);
  }

  visitMethodCall(ast:MethodCall, dest) {
    var record = this.construct(PROTO_RECORD_METHOD, ast.fn, ast.args.length, dest);
    ast.receiver.visit(this, new Destination(record, null));
    for (var i = 0; i < ast.args.length; ++i) {
      ast.args[i].visit(this, new Destination(record, i));
    }
    this.add(record);
  }

  visitFunctionCall(ast:FunctionCall, dest) {
    var record = this.construct(PROTO_RECORD_CLOSURE, null, ast.args.length, dest);
    ast.target.visit(this, new Destination(record, null));
    for (var i = 0; i < ast.args.length; ++i) {
      ast.args[i].visit(this, new Destination(record, i));
    }
    this.add(record);
  }

  visitConditional(ast:Conditional, dest) {
    var record = this.construct(PROTO_RECORD_PURE_FUNCTION, _cond, 3, dest);
    ast.condition.visit(this, new Destination(record, 0));
    ast.trueExp.visit(this, new Destination(record, 1));
    ast.falseExp.visit(this, new Destination(record, 2));
    this.add(record);
  }

  visitKeyedAccess(ast:KeyedAccess, dest) {}

  visitLiteralArray(ast:LiteralArray, dest) {
    var length = ast.expressions.length;
    var record = this.construct(PROTO_RECORD_PURE_FUNCTION, _arrayFn(length), length, dest);
    for (var i = 0; i < length; ++i) {
      ast.expressions[i].visit(this, new Destination(record, i));
    }
    this.add(record);
  }

  visitLiteralMap(ast:LiteralMap, dest) {
    var length = ast.values.length;
    var record = this.construct(PROTO_RECORD_PURE_FUNCTION, _mapFn(ast.keys, length), length, dest);
    for (var i = 0; i < length; ++i) {
      ast.values[i].visit(this, new Destination(record, i));
    }
    this.add(record);
  }

  visitChain(ast:Chain, dest){this.unsupported();}

  visitAssignment(ast:Assignment, dest) {this.unsupported();}

  visitTemplateBindings(ast, dest) {this.unsupported();}

  createRecordsFromAST(ast:AST, memento){
    ast.visit(this, memento);
  }

  construct(recordType, funcOrValue, arity, dest) {
    return new ProtoRecord(this.protoWatchGroup, recordType, funcOrValue, arity, dest);
  }

  add(protoRecord:ProtoRecord) {
    if (this.headRecord === null) {
      this.headRecord = this.tailRecord = protoRecord;
    } else {
      this.tailRecord.next = protoRecord;
      protoRecord.prev = this.tailRecord;
      this.tailRecord = protoRecord;
    }
  }

  unsupported() {
    throw new BaseException("Unsupported");
  }
}


function _operationToFunction(operation:string):Function {
  switch(operation) {
    case '+'  : return _operation_add;
    case '-'  : return _operation_subtract;
    case '*'  : return _operation_multiply;
    case '/'  : return _operation_divide;
    case '%'  : return _operation_remainder;
    case '==' : return _operation_equals;
    case '!=' : return _operation_not_equals;
    case '<'  : return _operation_less_then;
    case '>'  : return _operation_greater_then;
    case '<=' : return _operation_less_or_equals_then;
    case '>=' : return _operation_greater_or_equals_then;
    case '&&' : return _operation_logical_and;
    case '||' : return _operation_logical_or;
    default: throw new BaseException(`Unsupported operation ${operation}`);
  }
}

function _operation_negate(value)                       {return !value;}
function _operation_add(left, right)                    {return left + right;}
function _operation_subtract(left, right)               {return left - right;}
function _operation_multiply(left, right)               {return left * right;}
function _operation_divide(left, right)                 {return left / right;}
function _operation_remainder(left, right)              {return left % right;}
function _operation_equals(left, right)                 {return left == right;}
function _operation_not_equals(left, right)             {return left != right;}
function _operation_less_then(left, right)              {return left < right;}
function _operation_greater_then(left, right)           {return left > right;}
function _operation_less_or_equals_then(left, right)    {return left <= right;}
function _operation_greater_or_equals_then(left, right) {return left >= right;}
function _operation_logical_and(left, right)            {return left && right;}
function _operation_logical_or(left, right)             {return left || right;}
function _cond(cond, trueVal, falseVal)                 {return cond ? trueVal : falseVal;}
function _arrayFn(length:int) {
  switch (length) {
    case 0: return () => [];
    case 1: return (a1) => [a1];
    case 2: return (a1, a2) => [a1, a2];
    case 3: return (a1, a2, a3) => [a1, a2, a3];
    case 4: return (a1, a2, a3, a4) => [a1, a2, a3, a4];
    case 5: return (a1, a2, a3, a4, a5) => [a1, a2, a3, a4, a5];
    case 6: return (a1, a2, a3, a4, a5, a6) => [a1, a2, a3, a4, a5, a6];
    case 7: return (a1, a2, a3, a4, a5, a6, a7) => [a1, a2, a3, a4, a5, a6, a7];
    case 8: return (a1, a2, a3, a4, a5, a6, a7, a8) => [a1, a2, a3, a4, a5, a6, a7, a8];
    case 9: return (a1, a2, a3, a4, a5, a6, a7, a8, a9) => [a1, a2, a3, a4, a5, a6, a7, a8, a9];
    default: throw new BaseException(`Does not support literal arrays with more than 9 elements`);
  }
}
function _mapFn(keys:List, length:int) {
  function buildMap(values) {
    var res = MapWrapper.create();
    for(var i = 0; i < keys.length; ++i) {
      MapWrapper.set(res, keys[i], values[i]);
    }
    return res;
  }

  switch (length) {
    case 0: return () => [];
    case 1: return (a1) => buildMap([a1]);
    case 2: return (a1, a2) => buildMap([a1, a2]);
    case 3: return (a1, a2, a3) => buildMap([a1, a2, a3]);
    case 4: return (a1, a2, a3, a4) => buildMap([a1, a2, a3, a4]);
    case 5: return (a1, a2, a3, a4, a5) => buildMap([a1, a2, a3, a4, a5]);
    case 6: return (a1, a2, a3, a4, a5, a6) => buildMap([a1, a2, a3, a4, a5, a6]);
    case 7: return (a1, a2, a3, a4, a5, a6, a7) => buildMap([a1, a2, a3, a4, a5, a6, a7]);
    case 8: return (a1, a2, a3, a4, a5, a6, a7, a8) => buildMap([a1, a2, a3, a4, a5, a6, a7, a8]);
    case 9: return (a1, a2, a3, a4, a5, a6, a7, a8, a9) => buildMap([a1, a2, a3, a4, a5, a6, a7, a8, a9]);
    default: throw new BaseException(`Does not support literal maps with more than 9 elements`);
  }
}
