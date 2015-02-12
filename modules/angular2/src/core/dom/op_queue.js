import {ListWrapper} from 'angular2/src/facade/collection';

export class DomOpQueue {
  _ops;
  constructor() {
    this._ops = [];
  }

  push(callback) {
    ListWrapper.push(this._ops, callback);
  }

  run() {
    for (var i = 0; i < this._ops.length; i++) {
      this._ops[i]();
    }
    this._ops = [];
  }
}
