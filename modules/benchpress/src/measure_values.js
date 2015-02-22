import { Date } from 'angular2/src/facade/lang';
import { StringMap } from 'angular2/src/facade/collection';

export class MeasureValues {
  timeStamp:Date;
  runIndex:number;
  values:StringMap;

  constructor(runIndex:number, timeStamp:Date, values:StringMap) {
    this.timeStamp = timeStamp;
    this.runIndex = runIndex;
    this.values = values;
  }
}
