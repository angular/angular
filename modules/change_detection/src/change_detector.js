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

    while (isPresent(record)) {
      var currentRange = record.recordRange;
      var currentGroup = record.groupMemento();

      if (record.check()) {
        count++;
        if (record.terminatesExpression()) {
          updatedRecords = this._addRecord(updatedRecords, record);
        }
      }

      if (isPresent(updatedRecords)) {
        var nextEnabled = record.nextEnabled;
        var nextRange = isPresent(nextEnabled) ? nextEnabled.recordRange : null;
        var nextGroup = isPresent(nextEnabled) ? nextEnabled.groupMemento() : null;

        if (currentRange != nextRange || currentGroup != nextGroup) {
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
