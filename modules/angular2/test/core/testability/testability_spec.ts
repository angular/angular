import {
  AsyncTestCompleter,
  inject,
  describe,
  ddescribe,
  it,
  iit,
  xit,
  xdescribe,
  expect,
  beforeEach,
  SpyObject
} from 'angular2/testing_internal';
import {Testability} from 'angular2/src/core/testability/testability';
import {NgZone} from 'angular2/src/core/zone/ng_zone';
import {normalizeBlank} from 'angular2/src/facade/lang';
import {PromiseWrapper, EventEmitter, ObservableWrapper} from 'angular2/src/facade/async';

// Schedules a microtasks (using a resolved promise .then())
function microTask(fn: Function): void {
  PromiseWrapper.resolve(null).then((_) => { fn(); });
}

class MockNgZone extends NgZone {
  _onTurnStartStream: EventEmitter<any>;
  get onTurnStart() { return this._onTurnStartStream; }

  _onEventDoneStream: EventEmitter<any>;
  get onEventDone() { return this._onEventDoneStream; }

  constructor() {
    super({enableLongStackTrace: false});
    this._onTurnStartStream = new EventEmitter(false);
    this._onEventDoneStream = new EventEmitter(false);
  }

  start(): void { ObservableWrapper.callNext(this._onTurnStartStream, null); }

  finish(): void { ObservableWrapper.callNext(this._onEventDoneStream, null); }
}

export function main() {
  describe('Testability', () => {
    var testability, execute, ngZone;

    beforeEach(() => {
      ngZone = new MockNgZone();
      testability = new Testability(ngZone);
      execute = new SpyObject().spy('execute');
    });

    describe('Pending count logic', () => {
      it('should start with a pending count of 0',
         () => { expect(testability.getPendingRequestCount()).toEqual(0); });

      it('should fire whenstable callbacks if pending count is 0',
         inject([AsyncTestCompleter], (async) => {
           testability.whenStable(execute);
           microTask(() => {
             expect(execute).toHaveBeenCalled();
             async.done();
           });
         }));

      it('should not fire whenstable callbacks synchronously if pending count is 0', () => {
        testability.whenStable(execute);
        expect(execute).not.toHaveBeenCalled();
      });

      it('should not call whenstable callbacks when there are pending counts',
         inject([AsyncTestCompleter], (async) => {
           testability.increasePendingRequestCount();
           testability.increasePendingRequestCount();
           testability.whenStable(execute);

           microTask(() => {
             expect(execute).not.toHaveBeenCalled();
             testability.decreasePendingRequestCount();

             microTask(() => {
               expect(execute).not.toHaveBeenCalled();
               async.done();
             });
           });
         }));

      it('should fire whenstable callbacks when pending drops to 0',
         inject([AsyncTestCompleter], (async) => {
           testability.increasePendingRequestCount();
           testability.whenStable(execute);

           microTask(() => {
             expect(execute).not.toHaveBeenCalled();
             testability.decreasePendingRequestCount();

             microTask(() => {
               expect(execute).toHaveBeenCalled();
               async.done();
             });
           });
         }));

      it('should not fire whenstable callbacks synchronously when pending drops to 0', () => {
        testability.increasePendingRequestCount();
        testability.whenStable(execute);
        testability.decreasePendingRequestCount();

        expect(execute).not.toHaveBeenCalled();
      });
    });

    describe('NgZone callback logic', () => {
      it('should start being ready',
         () => { expect(testability.isAngularEventPending()).toEqual(false); });

      it('should fire whenstable callback if event is already finished',
         inject([AsyncTestCompleter], (async) => {
           ngZone.start();
           ngZone.finish();
           testability.whenStable(execute);

           microTask(() => {
             expect(execute).toHaveBeenCalled();
             async.done();
           });
         }));

      it('should not fire whenstable callbacks synchronously if event is already finished', () => {
        ngZone.start();
        ngZone.finish();
        testability.whenStable(execute);

        expect(execute).not.toHaveBeenCalled();
      });

      it('should fire whenstable callback when event finishes',
         inject([AsyncTestCompleter], (async) => {
           ngZone.start();
           testability.whenStable(execute);

           microTask(() => {
             expect(execute).not.toHaveBeenCalled();
             ngZone.finish();

             microTask(() => {
               expect(execute).toHaveBeenCalled();
               async.done();
             });
           });
         }));

      it('should not fire whenstable callbacks synchronously when event finishes', () => {
        ngZone.start();
        testability.whenStable(execute);
        ngZone.finish();

        expect(execute).not.toHaveBeenCalled();
      });

      it('should not fire whenstable callback when event did not finish',
         inject([AsyncTestCompleter], (async) => {
           ngZone.start();
           testability.increasePendingRequestCount();
           testability.whenStable(execute);

           microTask(() => {
             expect(execute).not.toHaveBeenCalled();
             testability.decreasePendingRequestCount();

             microTask(() => {
               expect(execute).not.toHaveBeenCalled();
               ngZone.finish();

               microTask(() => {
                 expect(execute).toHaveBeenCalled();
                 async.done();
               });
             });
           });
         }));

      it('should not fire whenstable callback when there are pending counts',
         inject([AsyncTestCompleter], (async) => {
           ngZone.start();
           testability.increasePendingRequestCount();
           testability.increasePendingRequestCount();
           testability.whenStable(execute);

           microTask(() => {
             expect(execute).not.toHaveBeenCalled();
             ngZone.finish();

             microTask(() => {
               expect(execute).not.toHaveBeenCalled();
               testability.decreasePendingRequestCount();

               microTask(() => {
                 expect(execute).not.toHaveBeenCalled();
                 testability.decreasePendingRequestCount();

                 microTask(() => {
                   expect(execute).toHaveBeenCalled();
                   async.done();
                 });
               });
             });
           });
         }));
    });
  });
}
