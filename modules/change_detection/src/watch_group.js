import {ProtoRecord, Record} from './record';
import {FIELD} from 'facade/lang';
import {ListWrapper} from 'facade/collection';

export class ProtoWatchGroup {
  @FIELD('final headRecord:ProtoRecord')
  @FIELD('final tailRecord:ProtoRecord')
  constructor() {
    this.headRecord = null;
    this.tailRecord = null;
  }

  /**
   * Parses [expression] into [ProtoRecord]s and adds them to [ProtoWatchGroup].
   *
   * @param expression The expression to watch
   * @param memento an opaque object which will be passed to WatchGroupDispatcher on
   *        detecting a change.
   * @param shallow Should collections be shallow watched
   */
  watch(expression:string,
        memento,
        shallow = false)
  {
    var parts = expression.split('.');
    var protoRecords = ListWrapper.createFixedSize(parts.length);

    for (var i = parts.length - 1; i >= 0; i--) {
      protoRecords[i] = new ProtoRecord(this, parts[i], memento);
      memento = null;
    }

    for (var i = 0; i < parts.length; i++) {
      var protoRecord = protoRecords[i];
      if (this.headRecord === null) {
        this.headRecord = this.tailRecord = protoRecord;
      } else {
        this.tailRecord.next = protoRecord;
        protoRecord.prev = this.tailRecord;
        this.tailRecord = protoRecord;
      }
    }
  }

  instantiate(dispatcher:WatchGroupDispatcher):WatchGroup {
    var watchGroup:WatchGroup = new WatchGroup(this, dispatcher);
    var tail:Record = null;
    var proto:ProtoRecord;
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
  constructor(protoWatchGroup:ProtoWatchGroup, dispatcher:WatchGroupDispatcher) {
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
