import {EventEmitter} from 'angular2/src/facade/async';
import * as Rx from 'rx';
import {ListWrapper} from 'angular2/src/facade/collection';

export class MockEventEmitter extends EventEmitter {
  private _nextFns: List<Function> = [];

  constructor() { super(); }

  observer(generator: any): Rx.IDisposable {
    this._nextFns.push(generator.next);
    return null;
  }

  next(value: any) {
    ListWrapper.forEach(this._nextFns, (fn) => { fn(value); });
  }
}
