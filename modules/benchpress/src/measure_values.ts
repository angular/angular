import {Date, DateWrapper} from '../../angular2/facade/lang';
import {Map} from '../../angular2/facade/collection';

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
