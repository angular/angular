import {ProtoWatchGroup, WatchGroup} from './watch_group';
import {ProtoRecord, Record} from './record';
import {FIELD, int} from 'facade/lang';
export * from './record';
export * from './watch_group'

export class ChangeDetector {

  @FIELD('final _rootWatchGroup:WatchGroup')
  constructor(watchGroup:WatchGroup) {
    this._rootWatchGroup = watchGroup;
  }

  detectChanges():int {
    var record:Record = this._rootWatchGroup.headRecord;
    var count:int = 0;
    for (record = this._rootWatchGroup.headRecord;
         record != null;
         record = record.next) {
      if (record.check()) {
        count++;
      }
    }
    return count;
  }
}
