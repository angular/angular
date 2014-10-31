import {ProtoRecord, Record} from './record';
import {FIELD, IMPLEMENTS, isBlank, isPresent} from 'facade/lang';
import {AST, FieldRead, ImplicitReceiver, AstVisitor} from './parser/ast';

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
    var tail:Record = watchGroup.headRecord = new Record(watchGroup, null);
    var proto:ProtoRecord = null;
    var tmpRecord:Record;

    for (proto = this.headRecord; proto != null; proto = proto.next) {
      tmpRecord = tail;
      tail = new Record(watchGroup, proto);
      tail.prev = tmpRecord;
      tmpRecord.next = tail;
      tail.checkPrev = tmpRecord;
      tmpRecord.checkNext = tail;
    }

    // Create and link the tail marker
    tmpRecord = new Record(watchGroup, null);
    tail.next = tmpRecord;
    tmpRecord.prev = tail;
    tail.checkNext = tmpRecord;
    tmpRecord.checkPrev = tail;
    watchGroup.tailRecord = tmpRecord;

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
    this.childHead = null;
    this.childTail = null;
    this.next = null;
    this.prev = null;
    this.parent = null;
  }

  // todo(vicb): check records should not include the markers for perf
  addChild(child:WatchGroup, insertAfter:WatchGroup) {
    child.parent = this;
    if (this.childHead === null) {
      // groups
      //todo(vicb)
      //assert(this.childTail === null);
      this.childHead = this.childTail = child;
      // records
      this.tailRecord.next = child.headRecord;
      child.headRecord.prev = this.tailRecord;
      this.tailRecord.checkNext = child.headRecord;
      child.headRecord.checkPrev = this.tailRecord;
    } else {
      if (insertAfter === null) {
        // insert as first child
        var childHead = this.childHead;
        // groups
        childHead.prev = child;
        child.next = childHead;
        this.childHead = child;
        // records
        childHead.headRecord.prev = child.tailRecord;
        child.tailRecord.next = childHead.headRecord;
        childHead.headRecord.checkPrev = child.tailRecord;
        child.tailRecord.checkNext = childHead.headRecord;
        this.headRecord = child.headRecord;
        var prevGroupTailRecord = this._tailRecordIncludingChildren;
        child.headRecord.prev = prevGroupTailRecord;
        prevGroupTailRecord.next = child;
        child.headRecord.checkPrev = prevGroupTailRecord;
        prevGroupTailRecord.checkNext = child;

      } else {
        // groups
        child.prev = insertAfter;
        child.next = insertAfter.next;
        insertAfter.next = child;
        if (child.next === null) {
          this.childTail == child;
        }
        // records
        var prevGroupTailRecord = insertAfter._tailRecordIncludingChildren;
        child.headRecord.prev = prevGroupTailRecord;
        prevGroupTailRecord.next = child.headRecord;
        child.headRecord.checkPrev = prevGroupTailRecord;
        prevGroupTailRecord.checkNext = child.headRecord;
        if (child.next !== null) {
          child.tailRecord.next = this.childTail.headRecord;
          this.childTail.tailRecord.prev = child.headRecord;
          child.tailRecord.checkNext = this.childTail.headRecord;
          this.childTail.tailRecord.checkPrev = child.headRecord;
        }
      }
    }
  }

  remove() {
    var prev = this.prev;
    var next = this.next;

    // todo(vicb) unregister releasable records from plugins

    // Unlink the records
    var nextGroupHeadRecord = this._tailRecordIncludingChildren.next;
    var prevGroupTailRecord = this.headRecord.prev;

    if (prevGroupTailRecord !== null) {
      prevGroupTail.next = nextGroupHeadRecord;
      prevGroupTail.checkNext = nextGroupHeadRecord;
    }

    if (nextGroupHeadRecord !== null) {
      nextGroupHeadRecord.prev = prevGroupTailRecord;
      nextGroupHeadRecord.checkPrev = prevGroupTailRecord;
    }

    // unlink the group
    if (prev === null) {
      this.parent.childHead = next;
    } else {
      prev.next = next;
    }

    if (next === null) {
      this.parent.childTail = prev;
    } else {
      next.prev = prev;
    }

    this.dispatcher = null;
    this.headRecord = null;
    this.tailRecord = null;
    this.context = null;
    this.childHead = null;
    this.childTail = null;
    this.next = null;
    this.prev = null;
    this.parent = null;
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

  get _tailRecordIncludingChildren():Record {
    var lastGroup = this;
    while (lastGroup.childTail !== null) {
      lastGroup = lastGroup.childTail;
    }
    return lastGroup.tailRecord;
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

  visitFieldRead(ast:FieldRead) {
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
