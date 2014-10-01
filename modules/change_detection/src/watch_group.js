import {ProtoRecord, Record} from './record';
import {FIELD} from 'facade/lang';

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
   * @param memento an opeque object which will be bassed to WatchGroupDispatcher on
   *        detecting a change.
   * @param shallow Should collections be shallow watched
   */
  watch(
    expression:String,
    memento,
    {shallow/*=false*/}:{shallow:bool})
  {
    /// IMPLEMENT
  }

  instantiate(dispatcher:WatchGroupDispatcher):WatchGroup {
    var watchGroup:WatchGroup = new WatchGroup(this, dispatcher);
    var head:Record = null;
    var tail:Record = null;
    var proto:ProtoRecord = this.headRecord;

    while(proto != null) {
      tail = proto.instantiate(watchGroup);
      if (head == null) head = tail;
      proto = proto.next;
    }

    proto = this.headRecord;
    while(proto != null) {
      proto.instantiateComplete();
      proto = proto.next;
    }

    watchGroup.headRecord = head;
    watchGroup.tailRecord = tail;
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
  }

  insertChildGroup(newChild:WatchGroup, insertAfter:WatchGroup) {
    /// IMPLEMENT
  }

  remove() {
    /// IMPLEMENT
  }

  /**
   * Sets the context (the object) on which the change detection expressions will
   * dereference themselves on. Since the WatchGroup can be reused the context
   * can be re-set many times during the lifetime of the WatchGroup.
   *
   * @param context the new context for change dection for the curren WatchGroup
   */
  setContext(context) {
  }
}

export class WatchGroupDispatcher {
  onRecordChange(record:Record, context) {}
}
