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
  inject
} from 'angular2/testing_internal';

import {ObservableWrapper, EventEmitter, PromiseWrapper} from 'angular2/src/core/facade/async';

export function main() {
  describe('EventEmitter', () => {
    var emitter: EventEmitter<any>;

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
         ObservableWrapper.callError(emitter, "Boom");
       }));

    it("should work when no throw callback is provided", inject([AsyncTestCompleter], (async) => {
         ObservableWrapper.subscribe(emitter, (_) => {}, (_) => { async.done(); });
         ObservableWrapper.callError(emitter, "Boom");
       }));

    it("should call the return callback", inject([AsyncTestCompleter], (async) => {
         ObservableWrapper.subscribe(emitter, (_) => {}, (_) => {}, () => { async.done(); });

         ObservableWrapper.callComplete(emitter);
       }));

    it("should subscribe to the wrapper asynchronously", () => {
      var called = false;
      ObservableWrapper.subscribe(emitter, (value) => { called = true; });

      ObservableWrapper.callNext(emitter, 99);
      expect(called).toBe(false);
    });

    it('delivers events asynchronously', inject([AsyncTestCompleter], (async) => {
         var e = new EventEmitter();
         var log = [];
         ObservableWrapper.subscribe(e, (x) => {
           log.push(x);
           expect(log).toEqual([1, 3, 2]);
           async.done();
         });
         log.push(1);
         ObservableWrapper.callNext(e, 2);
         log.push(3);
       }));

    it('delivers events synchronously', () => {
      var e = new EventEmitter(false);
      var log = [];
      ObservableWrapper.subscribe(e, (x) => { log.push(x); });
      log.push(1);
      ObservableWrapper.callNext(e, 2);
      log.push(3);
      expect(log).toEqual([1, 2, 3]);
    });

    it('reports whether it has subscribers', () => {
      var e = new EventEmitter(false);
      expect(ObservableWrapper.hasSubscribers(e)).toBe(false);
      ObservableWrapper.subscribe(e, (_) => {});
      expect(ObservableWrapper.hasSubscribers(e)).toBe(true);
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
             return null;
           });

           PromiseWrapper.then(all, (_) => {
             allCalled = true;
             async.done();
             return null;
           });

           one.resolve('one');
         }));

      [null, true, false, 10, 'thing', {}, []].forEach(abruptCompletion => {
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
