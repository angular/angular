library angular2.test.common.pipes.async_pipe_spec;

import "package:angular2/testing_internal.dart"
    show
        ddescribe,
        describe,
        it,
        iit,
        xit,
        expect,
        beforeEach,
        afterEach,
        AsyncTestCompleter,
        inject,
        browserDetection;
import "../spies.dart" show SpyChangeDetectorRef;
import "package:angular2/src/facade/lang.dart" show isBlank;
import "package:angular2/core.dart" show AsyncPipe, WrappedValue;
import "package:angular2/src/facade/async.dart"
    show EventEmitter, ObservableWrapper, PromiseWrapper, TimerWrapper;
import "package:angular2/src/core/dom/dom_adapter.dart" show DOM;

main() {
  describe("AsyncPipe", () {
    describe("Observable", () {
      var emitter;
      var pipe;
      var ref;
      var message = new Object();
      beforeEach(() {
        emitter = new EventEmitter();
        ref = new SpyChangeDetectorRef();
        pipe = new AsyncPipe(ref);
      });
      describe("transform", () {
        it("should return null when subscribing to an observable", () {
          expect(pipe.transform(emitter)).toBe(null);
        });
        it(
            "should return the latest available value wrapped",
            inject([AsyncTestCompleter], (async) {
              pipe.transform(emitter);
              ObservableWrapper.callNext(emitter, message);
              TimerWrapper.setTimeout(() {
                expect(pipe.transform(emitter))
                    .toEqual(new WrappedValue(message));
                async.done();
              }, 0);
            }));
        it(
            "should return same value when nothing has changed since the last call",
            inject([AsyncTestCompleter], (async) {
              pipe.transform(emitter);
              ObservableWrapper.callNext(emitter, message);
              TimerWrapper.setTimeout(() {
                pipe.transform(emitter);
                expect(pipe.transform(emitter)).toBe(message);
                async.done();
              }, 0);
            }));
        it(
            "should dispose of the existing subscription when subscribing to a new observable",
            inject([AsyncTestCompleter], (async) {
              pipe.transform(emitter);
              var newEmitter = new EventEmitter();
              expect(pipe.transform(newEmitter)).toBe(null);
              // this should not affect the pipe
              ObservableWrapper.callNext(emitter, message);
              TimerWrapper.setTimeout(() {
                expect(pipe.transform(newEmitter)).toBe(null);
                async.done();
              }, 0);
            }));
        it(
            "should request a change detection check upon receiving a new value",
            inject([AsyncTestCompleter], (async) {
              pipe.transform(emitter);
              ObservableWrapper.callNext(emitter, message);
              TimerWrapper.setTimeout(() {
                expect(ref.spy("markForCheck")).toHaveBeenCalled();
                async.done();
              }, 0);
            }));
      });
      describe("onDestroy", () {
        it("should do nothing when no subscription", () {
          expect(() => pipe.onDestroy()).not.toThrow();
        });
        it(
            "should dispose of the existing subscription",
            inject([AsyncTestCompleter], (async) {
              pipe.transform(emitter);
              pipe.onDestroy();
              ObservableWrapper.callNext(emitter, message);
              TimerWrapper.setTimeout(() {
                expect(pipe.transform(emitter)).toBe(null);
                async.done();
              }, 0);
            }));
      });
    });
    describe("Promise", () {
      var message = new Object();
      var pipe;
      var completer;
      var ref;
      // adds longer timers for passing tests in IE
      var timer = (!isBlank(DOM) && browserDetection.isIE) ? 50 : 0;
      beforeEach(() {
        completer = PromiseWrapper.completer();
        ref = new SpyChangeDetectorRef();
        pipe = new AsyncPipe(ref);
      });
      describe("transform", () {
        it("should return null when subscribing to a promise", () {
          expect(pipe.transform(completer.promise)).toBe(null);
        });
        it(
            "should return the latest available value",
            inject([AsyncTestCompleter], (async) {
              pipe.transform(completer.promise);
              completer.resolve(message);
              TimerWrapper.setTimeout(() {
                expect(pipe.transform(completer.promise))
                    .toEqual(new WrappedValue(message));
                async.done();
              }, timer);
            }));
        it(
            "should return unwrapped value when nothing has changed since the last call",
            inject([AsyncTestCompleter], (async) {
              pipe.transform(completer.promise);
              completer.resolve(message);
              TimerWrapper.setTimeout(() {
                pipe.transform(completer.promise);
                expect(pipe.transform(completer.promise)).toBe(message);
                async.done();
              }, timer);
            }));
        it(
            "should dispose of the existing subscription when subscribing to a new promise",
            inject([AsyncTestCompleter], (async) {
              pipe.transform(completer.promise);
              var newCompleter = PromiseWrapper.completer();
              expect(pipe.transform(newCompleter.promise)).toBe(null);
              // this should not affect the pipe, so it should return WrappedValue
              completer.resolve(message);
              TimerWrapper.setTimeout(() {
                expect(pipe.transform(newCompleter.promise)).toBe(null);
                async.done();
              }, timer);
            }));
        it(
            "should request a change detection check upon receiving a new value",
            inject([AsyncTestCompleter], (async) {
              pipe.transform(completer.promise);
              completer.resolve(message);
              TimerWrapper.setTimeout(() {
                expect(ref.spy("markForCheck")).toHaveBeenCalled();
                async.done();
              }, timer);
            }));
        describe("onDestroy", () {
          it("should do nothing when no source", () {
            expect(() => pipe.onDestroy()).not.toThrow();
          });
          it(
              "should dispose of the existing source",
              inject([AsyncTestCompleter], (async) {
                pipe.transform(completer.promise);
                expect(pipe.transform(completer.promise)).toBe(null);
                completer.resolve(message);
                TimerWrapper.setTimeout(() {
                  expect(pipe.transform(completer.promise))
                      .toEqual(new WrappedValue(message));
                  pipe.onDestroy();
                  expect(pipe.transform(completer.promise)).toBe(null);
                  async.done();
                }, timer);
              }));
        });
      });
    });
    describe("null", () {
      it("should return null when given null", () {
        var pipe = new AsyncPipe(null);
        expect(pipe.transform(null, [])).toEqual(null);
      });
    });
    describe("other types", () {
      it("should throw when given an invalid object", () {
        var pipe = new AsyncPipe(null);
        expect(() => pipe.transform(("some bogus object" as dynamic), []))
            .toThrowError();
      });
    });
  });
}
