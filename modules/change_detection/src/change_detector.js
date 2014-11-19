import {ProtoWatchGroup, WatchGroup} from './watch_group';
import {ProtoRecord, Record} from './record';
import {FIELD, int, isPresent} from 'facade/lang';
export * from './record';
export * from './watch_group'

export class ChangeDetector {

  @FIELD('final _rootWatchGroup:WatchGroup')
  constructor(watchGroup:WatchGroup) {
    this._rootWatchGroup = watchGroup;
  }

  detectChanges():int {
    var count:int = 0;
    for (var record = this._rootWatchGroup.findFirstEnabledRecord();
         isPresent(record);
         record = record.nextEnabled) {
      if (record.check()) {
        count++;
      }
    }
    return count;
  }
}
