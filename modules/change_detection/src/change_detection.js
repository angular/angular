import {ProtoWatchGrou, WatchGroup} from './watch_group';
import {ProtoRecord, Record} from './record';
import {FIELD} from 'facade/lang';
export * from './record';
export * from './watch_group'

export class ChangeDetection {

  @FIELD('final _rootWatchGroup:WatchGroup')
  constructor(watchGroup:WatchGroup) {
    this._rootWatchGroup = watchGroup;
  }

  detectChanges():int {
    var current:Record = _rootWatchGroup.headRecord;
    var count:number = 0;
    while (current != null) {
      if (current.check()) {
        count++;
      }
    }
    return count;
  }
}
