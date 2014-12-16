import {ProtoRecordRange, RecordRange} from './record_range';
import {ProtoRecord, Record} from './record';
import {int, isPresent, isBlank} from 'facade/lang';
import {ListWrapper, List} from 'facade/collection';

export * from './record';
export * from './record_range'

class ExpressionChangedAfterItHasBeenChecked extends Error {
  message:string;

  constructor(record:Record) {
    this.message = `Expression '${record.expressionAsString()}' has changed after it was checked. ` +
      `Previous value: '${record.previousValue}'. Current value: '${record.currentValue}'`;
  }

  toString():string {
    return this.message;
  }
}

export class ChangeDetectionError extends Error {
  message:string;
  originalException:any;
  location:string;

  constructor(record:Record, originalException:any) {
    this.originalException = originalException;
    this.location = record.protoRecord.expressionAsString;
    this.message = `${this.originalException} in [${this.location}]`;
  }

  toString():string {
    return this.message;
  }
}

export class ChangeDetector {
  _rootRecordRange:RecordRange;
  _enforceNoNewChanges:boolean;

  constructor(recordRange:RecordRange, enforceNoNewChanges:boolean = false) {
    this._rootRecordRange = recordRange;
    this._enforceNoNewChanges = enforceNoNewChanges;
  }

  detectChanges():int {
    var count = this._detectChanges(false);
    if (this._enforceNoNewChanges) {
      this._detectChanges(true)
    }
    return count;
  }

  _detectChanges(throwOnChange:boolean):int {
    var count = 0;
    var updatedRecords = null;
    var record = this._rootRecordRange.findFirstEnabledRecord();
    var currentRange, currentGroup;

    try {
      while (isPresent(record)) {
        if (record.check()) {
          count++;
          if (record.terminatesExpression()) {
            if (throwOnChange) throw new ExpressionChangedAfterItHasBeenChecked(record);
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
    } catch(e) {
      throw new ChangeDetectionError(record, e);
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
