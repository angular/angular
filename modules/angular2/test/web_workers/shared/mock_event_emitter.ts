import {EventEmitter} from 'angular2/src/core/facade/async';
import {ListWrapper} from 'angular2/src/core/facade/collection';

export class MockEventEmitter extends EventEmitter {
  private _nextFns: Function[] = [];

  constructor() { super(); }

  observer(generator: any): any {
    this._nextFns.push(generator.next);
    return new MockDisposable();
  }

  next(value: any) {
    ListWrapper.forEach(this._nextFns, (fn) => { fn(value); });
  }
}

class MockDisposable {
  isUnsubscribed: boolean = false;
  unsubscribe(): void {}
}
