import {EventEmitter} from 'angular2/src/core/facade/async';

export class MockEventEmitter<T> extends EventEmitter<T> {
  private _nextFns: Function[] = [];

  constructor() { super(); }

  subscribe(next: any): any {
    this._nextFns.push(next);
    return new MockDisposable();
  }

  next(value: any) { this._nextFns.forEach(fn => fn(value)); }
}

class MockDisposable {
  isUnsubscribed: boolean = false;
  unsubscribe(): void {}
}
