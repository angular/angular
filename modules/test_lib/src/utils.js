import {List, ListWrapper} from 'facade/src/collection';

export class Log {
  _result:List;

  constructor() {
    this._result = [];
  }

  add(value) {
    ListWrapper.push(this._result, value);
  }

  fn(value) {
    return () => {
      ListWrapper.push(this._result, value);
    }
  }

  result() {
    return ListWrapper.join(this._result, "; ");
  }
}
