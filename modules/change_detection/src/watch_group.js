import {ProtoRecord, Record} from './record';
import {FIELD, IMPLEMENTS, isBlank, isPresent} from 'facade/lang';
import {AST, AccessMember, ImplicitReceiver, AstVisitor, Binary, LiteralPrimitive} from './parser/ast';

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
  instantiate(dispatcher):WatchGroup {
    var watchGroup:WatchGroup = new WatchGroup(this, dispatcher);
    var tail:Record = null;
    var proto:ProtoRecord = null;
    var prevRecord:Record = null;

    if (this.headRecord !== null) {
      watchGroup.headRecord = tail = new Record(watchGroup, this.headRecord);

      for (proto = this.headRecord.next; proto != null; proto = proto.next) {
        prevRecord = tail;
        tail = new Record(watchGroup, proto);
        tail.prev = prevRecord;
        prevRecord.next = tail;
        tail.checkPrev = prevRecord;
        prevRecord.checkNext = tail;
      }

      watchGroup.tailRecord = tail;
    }

    return watchGroup;
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
      record.setContext(context);
    }
  }
}

export class WatchGroupDispatcher {
  // The record holds the previous value at the time of the call
  onRecordChange(record:Record, context) {}
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

  visitImplicitReceiver(ast:ImplicitReceiver) {
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

  visitAccessMember(ast:AccessMember) {
    ast.receiver.visit(this);
    this.add(new ProtoRecord(this.protoWatchGroup, ast.name, null));
  }

  createRecordsFromAST(ast:AST, memento){
    ast.visit(this);
    if (isPresent(this.tailRecord)) {
      this.tailRecord.dispatchMemento = memento;
    }
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