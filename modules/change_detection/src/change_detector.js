import {ProtoRecordRange, RecordRange} from './record_range';
import {ProtoRecord, Record} from './record';
import {int, isPresent, isBlank} from 'facade/lang';
import {ListWrapper, List} from 'facade/collection';

export * from './record';
export * from './record_range'

export class ChangeDetector {
  _rootRecordRange:RecordRange;

  constructor(recordRange:RecordRange) {
    this._rootRecordRange = recordRange;
  }

  detectChanges():int {
    var count = 0;
    var updatedRecords = null;
    var record = this._rootRecordRange.findFirstEnabledRecord();
    var currentRange, currentGroup;

    while (isPresent(record)) {
      if (record.check()) {
        count++;
        if (record.terminatesExpression()) {
          currentRange = record.recordRange;
          currentGroup = record.groupMemento();
          updatedRecords = this._addRecord(updatedRecords, record);
        }
      }

      if (isPresent(updatedRecords)) {
        var nextEnabled = record.nextEnabled;
        if (isBlank(nextEnabled) ||                       // we have reached the last enabled record
            currentRange != nextEnabled.recordRange ||    // the next record is in a different range
            currentGroup != nextEnabled.groupMemento()) { // the next record is in a different group
          currentRange.dispatcher.onRecordChange(currentGroup, updatedRecords);
          updatedRecords = null;
        }
      }

      record = record.findNextEnabled();
    }

    return count;
  }

  _addRecord(updatedRecords:List, record:Record) {
    if (isBlank(updatedRecords)) {
      updatedRecords = _singleElementList;
      updatedRecords[0] = record;

    } else if (updatedRecords === _singleElementList) {
      updatedRecords = [_singleElementList[0], record];

    } else {
      ListWrapper.push(updatedRecords, record);
    }
    return updatedRecords;
  }
}

var _singleElementList = [null];
