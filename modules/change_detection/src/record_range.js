import {
  ProtoRecord,
  Record,
  RECORD_FLAG_COLLECTION,
  RECORD_FLAG_IMPLICIT_RECEIVER,
  RECORD_TYPE_CONST,
  RECORD_TYPE_INVOKE_CLOSURE,
  RECORD_TYPE_INVOKE_FORMATTER,
  RECORD_TYPE_INVOKE_METHOD,
  RECORD_TYPE_INVOKE_PURE_FUNCTION,
  RECORD_TYPE_PROPERTY
} from './record';

import {FIELD, IMPLEMENTS, isBlank, isPresent, int, toBool, autoConvertAdd, BaseException,
  NumberWrapper} from 'facade/lang';
import {List, Map, ListWrapper, MapWrapper} from 'facade/collection';
import {ContextWithVariableBindings} from './parser/context_with_variable_bindings';
import {
  AccessMember,
  Assignment,
  AST,
  AstVisitor,
  Binary,
  Chain,
  Collection,
  Conditional,
  Formatter,
  FunctionCall,
  ImplicitReceiver,
  KeyedAccess,
  LiteralArray,
  LiteralMap,
  LiteralPrimitive,
  MethodCall,
  PrefixNot
} from './parser/ast';

export class ProtoRecordRange {
  recordCreator: ProtoRecordCreator;
  constructor() {
    this.recordCreator = null;
  }

  /**
   * Parses [ast] into [ProtoRecord]s and adds them to [ProtoRecordRange].
   *
   * @param astWithSource The expression to watch
   * @param expressionMemento an opaque object which will be passed to ChangeDispatcher on
   *        detecting a change.
   * @param groupMemento
   * @param content Whether to watch collection content (true) or reference (false, default)
   */
  addRecordsFromAST(ast:AST,
        expressionMemento,
        groupMemento,
        content:boolean = false)
  {
    if (this.recordCreator === null) {
      this.recordCreator = new ProtoRecordCreator(this);
    }

    if (content) {
      ast = new Collection(ast);
    }
    this.recordCreator.createRecordsFromAST(ast, expressionMemento, groupMemento);
  }

  // TODO(rado): the type annotation should be dispatcher:ChangeDispatcher.
  // but @Implements is not ready yet.
  instantiate(dispatcher, formatters:Map):RecordRange {
    var recordRange:RecordRange = new RecordRange(this, dispatcher);
    if (this.recordCreator !== null) {
      this._createRecords(recordRange, formatters);
      this._setDestination();
    }
    return recordRange;
  }

  _createRecords(recordRange:RecordRange, formatters:Map) {
    for (var proto = this.recordCreator.headRecord; proto != null; proto = proto.next) {
      var record = new Record(recordRange, proto, formatters);
      proto.recordInConstruction = record;
      recordRange.addRecord(record);
    }
  }

  _setDestination() {
    for (var proto = this.recordCreator.headRecord; proto != null; proto = proto.next) {
      if (proto.dest instanceof Destination) {
        proto.recordInConstruction.dest = proto.dest.record.recordInConstruction;
      } else {
        proto.recordInConstruction.dest = proto.dest;
      }
      proto.recordInConstruction = null;
    }
  }
}

export class RecordRange {
  protoRecordRange:ProtoRecordRange;
  dispatcher:any; //ChangeDispatcher
  headRecord:Record;
  tailRecord:Record;
  disabled:boolean;
  // TODO(rado): the type annotation should be dispatcher:ChangeDispatcher.
  // but @Implements is not ready yet.
  constructor(protoRecordRange:ProtoRecordRange, dispatcher) {
    this.protoRecordRange = protoRecordRange;
    this.dispatcher = dispatcher;

    this.disabled = false;

    this.headRecord = Record.createMarker(this);
    this.tailRecord = Record.createMarker(this);

    _link(this.headRecord, this.tailRecord);
  }

  /// addRecord assumes that the record is newly created, so it is enabled.
  addRecord(record:Record) {
    var lastRecord = this.tailRecord.prev;

    _link(lastRecord, record);
    if (!lastRecord.isDisabled()) {
      _linkEnabled(lastRecord, record);
    }
    _link(record, this.tailRecord);
  }

  addRange(child:RecordRange) {
    var lastRecord = this.tailRecord.prev;
    var prevEnabledRecord = this.tailRecord.findPrevEnabled();
    var nextEnabledRerord = this.tailRecord.findNextEnabled();

    var firstEnabledChildRecord = child.findFirstEnabledRecord();
    var lastEnabledChildRecord = child.findLastEnabledRecord();

    _link(lastRecord, child.headRecord);
    _link(child.tailRecord, this.tailRecord);

    if (isPresent(prevEnabledRecord) && isPresent(firstEnabledChildRecord)) {
      _linkEnabled(prevEnabledRecord, firstEnabledChildRecord);
    }

    if (isPresent(nextEnabledRerord) && isPresent(lastEnabledChildRecord)) {
      _linkEnabled(lastEnabledChildRecord, nextEnabledRerord);
    }
  }

  remove() {
    var firstEnabledChildRecord = this.findFirstEnabledRecord();
    var next = this.tailRecord.next;
    var prev = this.headRecord.prev;

    _link(prev, next);

    if (isPresent(firstEnabledChildRecord)) {
      var lastEnabledChildRecord = this.findLastEnabledRecord();
      var nextEnabled = lastEnabledChildRecord.nextEnabled;
      var prevEnabled = firstEnabledChildRecord.prevEnabled;
      if (isPresent(nextEnabled)) nextEnabled.prevEnabled = prevEnabled;
      if (isPresent(prevEnabled)) prevEnabled.nextEnabled = nextEnabled;
    }
  }

  disable() {
    var firstEnabledChildRecord = this.findFirstEnabledRecord();
    if (isPresent(firstEnabledChildRecord)) {
      // There could be a last enabled record only if first enabled exists
      var lastEnabledChildRecord = this.findLastEnabledRecord();
      var nextEnabled = lastEnabledChildRecord.nextEnabled;
      var prevEnabled = firstEnabledChildRecord.prevEnabled;
      if (isPresent(nextEnabled)) nextEnabled.prevEnabled = prevEnabled;
      if (isPresent(prevEnabled)) prevEnabled.nextEnabled = nextEnabled;
    }

    this.disabled = true;
  }

  enable() {
    var prevEnabledRecord = this.headRecord.findPrevEnabled();
    var nextEnabledRecord = this.tailRecord.findNextEnabled();

    var firstEnabledthisRecord = this.findFirstEnabledRecord();
    var lastEnabledthisRecord = this.findLastEnabledRecord();

    if (isPresent(firstEnabledthisRecord) && isPresent(prevEnabledRecord)){
      _linkEnabled(prevEnabledRecord, firstEnabledthisRecord);
    }

    if (isPresent(lastEnabledthisRecord) && isPresent(nextEnabledRecord)){
      _linkEnabled(lastEnabledthisRecord, nextEnabledRecord);
    }

    this.disabled = false;
  }

  /**
   * Returns the first enabled record in the current range.
   *
   * [H ER1 ER2 R3 T] returns ER1
   * [H R1 ER2 R3 T] returns ER2
   *
   * If no enabled records, returns null.
   *
   * [H R1 R2 R3 T] returns null
   *
   * The function skips disabled sub ranges.
   */
  findFirstEnabledRecord() {
    var record = this.headRecord.next;
    while (record !== this.tailRecord && record.isDisabled()) {
      if (record.isMarkerRecord() && record.recordRange.disabled) {
        record = record.recordRange.tailRecord.next;
      } else {
        record = record.next;
      }
    }
    return record === this.tailRecord ? null : record;
  }

  /**
   * Returns the last enabled record in the current range.
   *
   * [H ER1 ER2 R3 T] returns ER2
   * [H R1 ER2 R3 T] returns ER2
   *
   * If no enabled records, returns null.
   *
   * [H R1 R2 R3 T] returns null
   *
   * The function skips disabled sub ranges.
   */
  findLastEnabledRecord() {
    var record = this.tailRecord.prev;
    while (record !== this.headRecord && record.isDisabled()) {
      if (record.isMarkerRecord() && record.recordRange.disabled) {
        record = record.recordRange.headRecord.prev;
      } else {
        record = record.prev;
      }
    }
    return record === this.headRecord ? null : record;
  }

  /**
   * Sets the context (the object) on which the change detection expressions will
   * dereference themselves on. Since the RecordRange can be reused the context
   * can be re-set many times during the lifetime of the RecordRange.
   *
   * @param context the new context for change detection for the current RecordRange
   */
  setContext(context) {
    for (var record:Record = this.headRecord;
         record != null;
         record = record.next) {

      if (record.isImplicitReceiver()) {
        this._setContextForRecord(context, record);
      }
    }
  }

  _setContextForRecord(context, record:Record) {
    var proto = record.protoRecord;

    while (context instanceof ContextWithVariableBindings) {
      if (context.hasBinding(proto.name)) {
        this._setVarBindingGetter(context, record, proto);
        return;
      }
      context = context.parent;
    }

    this._setRegularGetter(context, record, proto);
  }

  _setVarBindingGetter(context, record:Record, proto:ProtoRecord) {
    record.funcOrValue = _mapGetter(proto.name);
    record.updateContext(context.varBindings);
  }

  _setRegularGetter(context, record:Record, proto:ProtoRecord) {
    record.funcOrValue = proto.funcOrValue;
    record.updateContext(context);
  }

  inspect() {
    return _inspect(this);
  }
}

function _inspect(recordRange:RecordRange) {
  var res = [];
  for(var r = recordRange.headRecord.next; r != recordRange.tailRecord; r = r.next){
    ListWrapper.push(res, r.inspect().description);
  }
  return res;
}

function _link(a:Record, b:Record) {
  a.next = b;
  b.prev = a;
}

function _linkEnabled(a:Record, b:Record) {
  a.nextEnabled = b;
  b.prevEnabled = a;
}

export class ChangeDispatcher {
  onRecordChange(record:Record, context) {}
}

//todo: vsavkin: Create Array and Context destinations?
class Destination {
  record:ProtoRecord;
  position:int;
  constructor(record:ProtoRecord, position:int) {
    this.record = record;
    this.position = position;
  }
}


@IMPLEMENTS(AstVisitor)
class ProtoRecordCreator {
  protoRecordRange:ProtoRecordRange;
  headRecord:ProtoRecord;
  tailRecord:ProtoRecord;
  groupMemento:any;
  expressionAsString:string;

  constructor(protoRecordRange) {
    this.protoRecordRange = protoRecordRange;
    this.headRecord = null;
    this.tailRecord = null;
    this.expressionAsString = null;
  }

  visitImplicitReceiver(ast:ImplicitReceiver, args) {
    throw new BaseException('Should never visit an implicit receiver');
  }

  visitLiteralPrimitive(ast:LiteralPrimitive, dest) {
    this.add(this.construct(RECORD_TYPE_CONST, ast.value, 0, null, dest));
  }

  visitBinary(ast:Binary, dest) {
    var record = this.construct(RECORD_TYPE_INVOKE_PURE_FUNCTION,
                                _operationToFunction(ast.operation), 2, ast.operation, dest);
    ast.left.visit(this, new Destination(record, 0));
    ast.right.visit(this, new Destination(record, 1));
    this.add(record);
  }

  visitPrefixNot(ast:PrefixNot, dest) {
    var record = this.construct(RECORD_TYPE_INVOKE_PURE_FUNCTION, _operation_negate, 1, "-", dest);
    ast.expression.visit(this, new Destination(record, 0));
    this.add(record);
  }

  visitAccessMember(ast:AccessMember, dest) {
    var record = this.construct(RECORD_TYPE_PROPERTY, ast.getter, 0, ast.name, dest);
    if (ast.receiver instanceof ImplicitReceiver) {
      record.setIsImplicitReceiver();
    } else {
      ast.receiver.visit(this, new Destination(record, null));
    }
    this.add(record);
  }

  visitFormatter(ast:Formatter, dest) {
    var record = this.construct(RECORD_TYPE_INVOKE_FORMATTER, ast.name, ast.allArgs.length, ast.name, dest);
    for (var i = 0; i < ast.allArgs.length; ++i) {
      ast.allArgs[i].visit(this, new Destination(record, i));
    }
    this.add(record);
  }

  visitMethodCall(ast:MethodCall, dest) {
    var record = this.construct(RECORD_TYPE_INVOKE_METHOD, ast.fn, ast.args.length, ast.name, dest);
    for (var i = 0; i < ast.args.length; ++i) {
      ast.args[i].visit(this, new Destination(record, i));
    }
    if (ast.receiver instanceof ImplicitReceiver) {
      record.setIsImplicitReceiver();
    } else {
      ast.receiver.visit(this, new Destination(record, null));
    }
    this.add(record);
  }

  visitFunctionCall(ast:FunctionCall, dest) {
    var record = this.construct(RECORD_TYPE_INVOKE_CLOSURE, null, ast.args.length, null, dest);
    ast.target.visit(this, new Destination(record, null));
    for (var i = 0; i < ast.args.length; ++i) {
      ast.args[i].visit(this, new Destination(record, i));
    }
    this.add(record);
  }

  visitCollection(ast: Collection, dest) {
    var record = this.construct(RECORD_FLAG_COLLECTION, null, null, null, dest);
    ast.value.visit(this, new Destination(record, null));
    this.add(record);
  }

  visitConditional(ast:Conditional, dest) {
    var record = this.construct(RECORD_TYPE_INVOKE_PURE_FUNCTION, _cond, 3, "?:", dest);
    ast.condition.visit(this, new Destination(record, 0));
    ast.trueExp.visit(this, new Destination(record, 1));
    ast.falseExp.visit(this, new Destination(record, 2));
    this.add(record);
  }

  visitKeyedAccess(ast:KeyedAccess, dest) {
    var record = this.construct(RECORD_TYPE_INVOKE_METHOD, _keyedAccess, 1, "[]", dest);
    ast.obj.visit(this, new Destination(record, null));
    ast.key.visit(this, new Destination(record, 0));
    this.add(record);
  }

  visitLiteralArray(ast:LiteralArray, dest) {
    var length = ast.expressions.length;
    var record = this.construct(RECORD_TYPE_INVOKE_PURE_FUNCTION, _arrayFn(length), length, "Array()", dest);
    for (var i = 0; i < length; ++i) {
      ast.expressions[i].visit(this, new Destination(record, i));
    }
    this.add(record);
  }

  visitLiteralMap(ast:LiteralMap, dest) {
    var length = ast.values.length;
    var record = this.construct(RECORD_TYPE_INVOKE_PURE_FUNCTION, _mapFn(ast.keys, length), length, "Map()", dest);
    for (var i = 0; i < length; ++i) {
      ast.values[i].visit(this, new Destination(record, i));
    }
    this.add(record);
  }

  visitChain(ast:Chain, dest){this._unsupported();}

  visitAssignment(ast:Assignment, dest) {this._unsupported();}

  visitTemplateBindings(ast, dest) {this._unsupported();}

  createRecordsFromAST(ast:AST, expressionMemento:any, groupMemento:any){
    this.groupMemento = groupMemento;
    this.expressionAsString = ast.toString();
    ast.visit(this, expressionMemento);
  }

  construct(recordType, funcOrValue, arity, name, dest) {
    return new ProtoRecord(this.protoRecordRange, recordType, funcOrValue, arity,
        name, dest, this.groupMemento, this.expressionAsString);
  }

  add(protoRecord:ProtoRecord) {
    if (this.headRecord === null) {
      this.headRecord = this.tailRecord = protoRecord;
    } else {
      this.tailRecord.next = protoRecord;
      this.tailRecord = protoRecord;
    }
  }

  _unsupported() {
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

//TODO: cache the getters
function _mapGetter(key) {
  return function(map) {
    return MapWrapper.get(map, key);
  }
}

function _keyedAccess(obj, args) {
  var key = args[0];
  return obj instanceof Map ? MapWrapper.get(obj, key):obj[key];
}
