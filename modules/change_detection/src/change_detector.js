import {ProtoRecordRange, RecordRange} from './record_range';
import {ProtoRecord, Record} from './record';
import {FIELD, int, isPresent} from 'facade/lang';

export * from './record';
export * from './record_range'

export class ChangeDetector {

  @FIELD('final _rootRecordRange:RecordRange')
  constructor(recordRange:RecordRange) {
    this._rootRecordRange = recordRange;
  }

  detectChanges():int {
    var count:int = 0;
    for (var record = this._rootRecordRange.findFirstEnabledRecord();
         isPresent(record);
         record = record.nextEnabled) {
      if (record.check()) {
        count++;
      }
    }
    return count;
  }
}
