import { Date } from 'angular2/src/facade/lang';

export class MeasureValues {
  timeStamp:Date;
  runIndex:number;
  values:any;

  constructor(runIndex:number, timeStamp:Date, values:any) {
    this.timeStamp = timeStamp;
    this.runIndex = runIndex;
    this.values = values;
  }
}
