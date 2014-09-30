import {ProtoRecord, Record} from './record';
import {FIELD} from 'facade/lang';

export class ProtoWatchGroup {
  @FIELD('final _headRecord:ProtoRecord')
  @FIELD('final _tailRecord:ProtoRecord')
  constructor() {
    this._headRecord = null;
    this._tailRecord = null;
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
    var proto:ProtoRecord = this._headRecord;

    while(proto != null) {
      tail = proto.instantiate(watchGroup);
      if (head == null) head = tail;
      proto = proto.next;
    }

    proto = this._headRecord;
    while(proto != null) {
      proto.instantiateComplete();
      proto = proto.next;
    }

    watchGroup._headRecord = head;
    watchGroup._tailRecord = tail;
    return watchGroup;
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

export class WatchGroup {
  @FIELD('final protoWatchGroup:ProtoWatchGroup')
  @FIELD('final dispatcher:WatchGroupDispatcher')
  @FIELD('final _headRecord:Record')
  @FIELD('final _tailRecord:Record')
  constructor(protoWatchGroup:ProtoWatchGroup, dispatcher:WatchGroupDispatcher) {
    this.protoWatchGroup = protoWatchGroup;
    this.dispatcher = dispatcher;
    this._headRecord = null;
    this._tailRecord = null;
  }

  insertChildGroup(newChild:WatchGroup, insertAfter:WatchGroup) {
    /// IMPLEMENT
  }

  remove() {
    /// IMPLEMENT
  }

}

export class WatchGroupDispatcher {
  onRecordChange(record:Record, context) {}
}
