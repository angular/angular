import {Date, DateWrapper} from 'angular2/src/core/facade/lang';
import {Map} from 'angular2/src/core/facade/collection';

export class MeasureValues {
  constructor(public runIndex: number, public timeStamp: Date,
              public values: {[key: string]: any}) {}

  toJson() {
    return {
      'timeStamp': DateWrapper.toJson(this.timeStamp),
      'runIndex': this.runIndex,
      'values': this.values
    };
  }
}
