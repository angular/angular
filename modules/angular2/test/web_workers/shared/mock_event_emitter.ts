import {EventEmitter} from 'angular2/src/core/facade/async';
import * as RxNext from '@reactivex/rxjs';
import {ListWrapper} from 'angular2/src/core/facade/collection';

export class MockEventEmitter extends EventEmitter {
  private _nextFns: Function[] = [];

  constructor() { super(); }

  observer(generator: any): RxNext.Subscription<any> {
    this._nextFns.push(generator.next);
    return new MockDisposable();
  }

  next(value: any) {
    ListWrapper.forEach(this._nextFns, (fn) => { fn(value); });
  }
}

class MockDisposable implements RxNext.Subscription<any> {
  isUnsubscribed: boolean = false;
  unsubscribe(): void {}
}
