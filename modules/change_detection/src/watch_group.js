import {ProtoRecord, Record, PROTO_RECORD_CONST, PROTO_RECORD_FUNC, PROTO_RECORD_PROPERTY} from './record';
import {FIELD, IMPLEMENTS, isBlank, isPresent, int, toBool, autoConvertAdd, BaseException} from 'facade/lang';
import {ListWrapper} from 'facade/collection';
import {AST, AccessMember, ImplicitReceiver, AstVisitor, LiteralPrimitive, Binary, Formatter} from './parser/ast';

export class ProtoWatchGroup {
  @FIELD('headRecord:ProtoRecord')
  @FIELD('tailRecord:ProtoRecord')
  constructor(formatters) {
    this.formatters = formatters;

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
  instantiate(dispatcher):WatchGroup {
    var watchGroup:WatchGroup = new WatchGroup(this, dispatcher);
    if (this.headRecord !== null) {
      this._createRecords(watchGroup);
      this._setDestination();

    }
    return watchGroup;
  }

  _createRecords(watchGroup:WatchGroup) {
    var tail, prevRecord;
    watchGroup.headRecord = tail = new Record(watchGroup, this.headRecord);
    this.headRecord.recordInConstruction = watchGroup.headRecord;

    for (var proto = this.headRecord.next; proto != null; proto = proto.next) {
      prevRecord = tail;

      tail = new Record(watchGroup, proto);
      proto.recordInConstruction = tail;

      tail.prev = prevRecord;
      prevRecord.next = tail;
    }

    watchGroup.tailRecord = tail;
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
  // TODO(rado): the type annotation should be dispatcher:WatchGroupDispatcher.
  // but @Implements is not ready yet.
  constructor(protoWatchGroup:ProtoWatchGroup, dispatcher) {
    this.protoWatchGroup = protoWatchGroup;
    this.dispatcher = dispatcher;
    this.headRecord = null;
    this.tailRecord = null;
    this.context = null;
  }

  insertChildGroup(newChild:WatchGroup, insertAfter:WatchGroup) {
    throw 'not implemented';
  }

  remove() {
    throw 'not implemented';
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

  // TODO: add tests for this method!
  visitLiteralPrimitive(ast:LiteralPrimitive) {
    // do nothing
  }

  // TODO: add tests for this method!
  visitBinary(ast:Binary) {
    ast.left.visit(this);
    ast.right.visit(this);
  }

  visitLiteralPrimitive(ast:LiteralPrimitive, dest) {
    this.add(this.construct(PROTO_RECORD_CONST, ast.value, 0, dest));
  }

  visitBinary(ast:Binary, dest) {
    var record = this.construct(PROTO_RECORD_FUNC, _operationToFunction(ast.operation), 2, dest);

    ast.left.visit(this, new Destination(record, 0));
    ast.right.visit(this, new Destination(record, 1));

    this.add(record);
  }

  visitAccessMember(ast:AccessMember, dest) {
    var record = this.construct(PROTO_RECORD_PROPERTY, ast.getter, 0, dest);
    ast.receiver.visit(this, new Destination(record, null));
    this.add(record);
  }

  visitFormatter(ast:Formatter, dest) {
    var formatter = this.protoWatchGroup.formatters[ast.name];
    var record = this.construct(PROTO_RECORD_FUNC, formatter, ast.allArgs.length, dest);
    for (var i = 0; i < ast.allArgs.length; ++i) {
      ast.allArgs[i].visit(this, new Destination(record, i));
    }
    this.add(record);
  }

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
}


function _operationToFunction(operation:string):Function {
  switch(operation) {
    case '!'  : return _operation_negate;
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

