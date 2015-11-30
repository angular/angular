library angular2.test.core.facade.async_spec;

import "package:angular2/testing_internal.dart"
    show
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
        inject;
import "package:angular2/src/facade/async.dart"
    show ObservableWrapper, Stream, Subject, EventEmitter, PromiseWrapper;

main() {
  describe("EventEmitter", () {
    EventEmitter<dynamic> emitter;
    beforeEach(() {
      emitter = new EventEmitter();
    });
    it(
        "should call the next callback",
        inject([AsyncTestCompleter], (async) {
          ObservableWrapper.subscribe(emitter, (value) {
            expect(value).toEqual(99);
            async.done();
          });
          ObservableWrapper.callEmit(emitter, 99);
        }));
    it(
        "should call the throw callback",
        inject([AsyncTestCompleter], (async) {
          ObservableWrapper.subscribe(emitter, (_) {}, (error) {
            expect(error).toEqual("Boom");
            async.done();
          });
          ObservableWrapper.callError(emitter, "Boom");
        }));
    it(
        "should work when no throw callback is provided",
        inject([AsyncTestCompleter], (async) {
          ObservableWrapper.subscribe(emitter, (_) {}, (_) {
            async.done();
          });
          ObservableWrapper.callError(emitter, "Boom");
        }));
    it(
        "should call the return callback",
        inject([AsyncTestCompleter], (async) {
          ObservableWrapper.subscribe(emitter, (_) {}, (_) {}, () {
            async.done();
          });
          ObservableWrapper.callComplete(emitter);
        }));
    it("should subscribe to the wrapper asynchronously", () {
      var called = false;
      ObservableWrapper.subscribe(emitter, (value) {
        called = true;
      });
      ObservableWrapper.callEmit(emitter, 99);
      expect(called).toBe(false);
    });
    it(
        "delivers next and error events asynchronously",
        inject([AsyncTestCompleter], (async) {
          var log = [];
          ObservableWrapper.subscribe(emitter, (x) {
            log.add(x);
            expect(log).toEqual([1, 3, 5, 2]);
          }, (err) {
            log.add(err);
            expect(log).toEqual([1, 3, 5, 2, 4]);
            async.done();
          });
          log.add(1);
          ObservableWrapper.callEmit(emitter, 2);
          log.add(3);
          ObservableWrapper.callError(emitter, 4);
          log.add(5);
        }));
    it(
        "delivers next and complete events asynchronously",
        inject([AsyncTestCompleter], (async) {
          var log = [];
          ObservableWrapper.subscribe(
              emitter,
              (x) {
                log.add(x);
                expect(log).toEqual([1, 3, 5, 2]);
              },
              null,
              () {
                log.add(4);
                expect(log).toEqual([1, 3, 5, 2, 4]);
                async.done();
              });
          log.add(1);
          ObservableWrapper.callEmit(emitter, 2);
          log.add(3);
          ObservableWrapper.callComplete(emitter);
          log.add(5);
        }));
    it("delivers events synchronously", () {
      var e = new EventEmitter(false);
      var log = [];
      ObservableWrapper.subscribe(e, (x) {
        log.add(x);
      });
      log.add(1);
      ObservableWrapper.callEmit(e, 2);
      log.add(3);
      expect(log).toEqual([1, 2, 3]);
    });
    it("reports whether it has subscribers", () {
      var e = new EventEmitter(false);
      expect(ObservableWrapper.hasSubscribers(e)).toBe(false);
      ObservableWrapper.subscribe(e, (_) {});
      expect(ObservableWrapper.hasSubscribers(e)).toBe(true);
    });
  });
  describe("ObservableWrapper", () {
    it("should correctly check isObservable for EventEmitter", () {
      var e = new EventEmitter(false);
      expect(ObservableWrapper.isObservable(e)).toBe(true);
    });
    it("should correctly check isObservable for Subject", () {
      var e = new Subject();
      expect(ObservableWrapper.isObservable(e)).toBe(true);
    });
    it("should subscribe to EventEmitters", () {
      var e = new EventEmitter(false);
      ObservableWrapper.subscribe(e, (val) {});
      ObservableWrapper.callEmit(e, 1);
      ObservableWrapper.callComplete(e);
    });
  });
  // See ECMAScript 6 Spec 25.4.4.1
  describe("PromiseWrapper", () {
    describe("#all", () {
      it(
          "should combine lists of Promises",
          inject([AsyncTestCompleter], (async) {
            var one = PromiseWrapper.completer();
            var two = PromiseWrapper.completer();
            var all = PromiseWrapper.all([one.promise, two.promise]);
            var allCalled = false;
            PromiseWrapper.then(one.promise, (_) {
              expect(allCalled).toBe(false);
              two.resolve("two");
              return null;
            });
            PromiseWrapper.then(all, (_) {
              allCalled = true;
              async.done();
              return null;
            });
            one.resolve("one");
          }));
      [null, true, false, 10, "thing", {}, []].forEach((abruptCompletion) {
        it(
            '''should treat "${ abruptCompletion}" as an "abrupt completion"''',
            inject([AsyncTestCompleter], (async) {
              var one = PromiseWrapper.completer();
              var all = PromiseWrapper.all([one.promise, abruptCompletion]);
              PromiseWrapper.then(all, (val) {
                expect(val[1]).toEqual(abruptCompletion);
                async.done();
              });
              one.resolve("one");
            }));
      });
    });
  });
}
