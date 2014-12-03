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

      var nextEnabled = record.nextEnabled;
      var nextRange = isPresent(nextEnabled) ? nextEnabled.recordRange : null;
      var nextGroup = isPresent(nextEnabled) ? nextEnabled.groupMemento() : null;

      if (record.check()) {
        count ++;
        if (record.terminatesExpression()) {
          updatedRecords = this._addRecord(updatedRecords, record);
        }
      }

      if (this._shouldNotifyDispatcher(currentRange, nextRange, currentGroup, nextGroup, updatedRecords)) {
        currentRange.dispatcher.onRecordChange(currentGroup, updatedRecords);
        updatedRecords = null;
      }

      record = record.nextEnabled;
    }

    return count;
  }

  _groupChanged(currentRange, nextRange, currentGroup, nextGroup) {
    return currentRange != nextRange || currentGroup != nextGroup;
  }

  _shouldNotifyDispatcher(currentRange, nextRange, currentGroup, nextGroup, updatedRecords) {
    return this._groupChanged(currentRange, nextRange, currentGroup, nextGroup) && isPresent(updatedRecords);
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
