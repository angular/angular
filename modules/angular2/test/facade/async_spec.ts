import {
  describe,
  it,
  expect,
  beforeEach,
  ddescribe,
  iit,
  xit,
  el,
  SpyObject,
  AsyncTestCompleter,
  inject,
  IS_DARTIUM
} from 'angular2/test_lib';

import {ObservableWrapper, EventEmitter, PromiseWrapper} from 'angular2/src/facade/async';
import {ListWrapper} from 'angular2/src/facade/collection';

export function main() {
  describe('EventEmitter', () => {
    var emitter: EventEmitter;

    beforeEach(() => { emitter = new EventEmitter(); });

    it("should call the next callback", inject([AsyncTestCompleter], (async) => {
         ObservableWrapper.subscribe(emitter, (value) => {
           expect(value).toEqual(99);
           async.done();
         });

         ObservableWrapper.callNext(emitter, 99);
       }));

    it("should call the throw callback", inject([AsyncTestCompleter], (async) => {
         ObservableWrapper.subscribe(emitter, (_) => {}, (error) => {
           expect(error).toEqual("Boom");
           async.done();
         });
         ObservableWrapper.callThrow(emitter, "Boom");
       }));

    it("should work when no throw callback is provided", inject([AsyncTestCompleter], (async) => {
         ObservableWrapper.subscribe(emitter, (_) => {}, (_) => { async.done(); });
         ObservableWrapper.callThrow(emitter, "Boom");
       }));

    it("should call the return callback", inject([AsyncTestCompleter], (async) => {
         ObservableWrapper.subscribe(emitter, (_) => {}, (_) => {}, () => { async.done(); });

         ObservableWrapper.callReturn(emitter);
       }));

    it("should subscribe to the wrapper asynchronously", () => {
      var called = false;
      ObservableWrapper.subscribe(emitter, (value) => { called = true; });

      ObservableWrapper.callNext(emitter, 99);
      expect(called).toBe(false);
    });

    // TODO: vsavkin: add tests cases
    // should call dispose on the subscription if generator returns {done:true}
    // should call dispose on the subscription on throw
    // should call dispose on the subscription on return
  });

  // See ECMAScript 6 Spec 25.4.4.1
  describe("PromiseWrapper", () => {
    describe("#all", () => {
      it("should combine lists of Promises", inject([AsyncTestCompleter], (async) => {
           var one = PromiseWrapper.completer();
           var two = PromiseWrapper.completer();

           var all = PromiseWrapper.all([one.promise, two.promise]);
           var allCalled = false;

           PromiseWrapper.then(one.promise, (_) => {
             expect(allCalled).toBe(false);
             two.resolve('two');
           });

           PromiseWrapper.then(all, (_) => {
             allCalled = true;
             async.done();
           });

           one.resolve('one');
         }));

      ListWrapper.forEach([null, true, false, 10, 'thing', {}, []], (abruptCompletion) => {
        it(`should treat "${abruptCompletion}" as an "abrupt completion"`,
           inject([AsyncTestCompleter], (async) => {
             var one = PromiseWrapper.completer();

             var all = PromiseWrapper.all([one.promise, abruptCompletion]);

             PromiseWrapper.then(all, (val) => {
               expect(val[1]).toEqual(abruptCompletion);
               async.done();
             });

             one.resolve('one');
           }));
      });
    });
  });
}
