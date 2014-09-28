import {WatchGroup} from './watch_group';
import {Record} from './record';
import {FIELD} from 'facade/lang';

export class ChangeDetection {

  @FIELD('final _rootWatchGroup:WatchGroup')
  constructor(watchGroup:WatchGroup) {
    this._rootWatchGroup = watchGroup;
  }

  detectChanges():int {
    var current:Record = _rootWatchGroup._headRecord;
    var count:number = 0;
    while (current != null) {
      if (current.check()) {
        count++;
      }
    }
    return count;
  }
}
