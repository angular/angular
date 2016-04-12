import {
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
  browserDetection
} from 'angular2/testing_internal';
import {SpyChangeDetectorRef} from '../spies';

import {isBlank} from 'angular2/src/facade/lang';
import {AsyncPipe} from 'angular2/common';
import {WrappedValue} from 'angular2/core';
import {
  EventEmitter,
  ObservableWrapper,
  PromiseWrapper,
  TimerWrapper
} from 'angular2/src/facade/async';
import {DOM} from 'angular2/src/platform/dom/dom_adapter';
import {PromiseCompleter} from 'angular2/src/facade/promise';

export function main() {
  describe("AsyncPipe", () => {

    describe('Observable', () => {
      var emitter;
      var pipe;
      var ref;
      var message = new Object();

      beforeEach(() => {
        emitter = new EventEmitter();
        ref = new SpyChangeDetectorRef();
        pipe = new AsyncPipe(ref);
      });

      describe("transform", () => {
        it("should return null when subscribing to an observable",
           () => { expect(pipe.transform(emitter)).toBe(null); });

        it("should return the latest available value wrapped",
           inject([AsyncTestCompleter], (async) => {
             pipe.transform(emitter);

             ObservableWrapper.callEmit(emitter, message);

             TimerWrapper.setTimeout(() => {
               expect(pipe.transform(emitter)).toEqual(new WrappedValue(message));
               async.done();
             }, 0)
           }));


        it("should return same value when nothing has changed since the last call",
           inject([AsyncTestCompleter], (async) => {
             pipe.transform(emitter);
             ObservableWrapper.callEmit(emitter, message);

             TimerWrapper.setTimeout(() => {
               pipe.transform(emitter);
               expect(pipe.transform(emitter)).toBe(message);
               async.done();
             }, 0)
           }));

        it("should dispose of the existing subscription when subscribing to a new observable",
           inject([AsyncTestCompleter], (async) => {
             pipe.transform(emitter);

             var newEmitter = new EventEmitter();
             expect(pipe.transform(newEmitter)).toBe(null);

             // this should not affect the pipe
             ObservableWrapper.callEmit(emitter, message);

             TimerWrapper.setTimeout(() => {
               expect(pipe.transform(newEmitter)).toBe(null);
               async.done();
             }, 0)
           }));

        it("should request a change detection check upon receiving a new value",
           inject([AsyncTestCompleter], (async) => {
             pipe.transform(emitter);
             ObservableWrapper.callEmit(emitter, message);

             TimerWrapper.setTimeout(() => {
               expect(ref.spy('markForCheck')).toHaveBeenCalled();
               async.done();
             }, 10)
           }));
      });

      describe("ngOnDestroy", () => {
        it("should do nothing when no subscription",
           () => { expect(() => pipe.ngOnDestroy()).not.toThrow(); });

        it("should dispose of the existing subscription", inject([AsyncTestCompleter], (async) => {
             pipe.transform(emitter);
             pipe.ngOnDestroy();

             ObservableWrapper.callEmit(emitter, message);

             TimerWrapper.setTimeout(() => {
               expect(pipe.transform(emitter)).toBe(null);
               async.done();
             }, 0)
           }));
      });
    });

    describe("Promise", () => {
      var message = new Object();
      var pipe: AsyncPipe;
      var completer: PromiseCompleter<any>;
      var ref: SpyChangeDetectorRef;
      // adds longer timers for passing tests in IE
      var timer = (!isBlank(DOM) && browserDetection.isIE) ? 50 : 10;

      beforeEach(() => {
        completer = PromiseWrapper.completer();
        ref = new SpyChangeDetectorRef();
        pipe = new AsyncPipe(<any>ref);
      });

      describe("transform", () => {
        it("should return null when subscribing to a promise",
           () => { expect(pipe.transform(completer.promise)).toBe(null); });

        it("should return the latest available value", inject([AsyncTestCompleter], (async) => {
             pipe.transform(completer.promise);

             completer.resolve(message);

             TimerWrapper.setTimeout(() => {
               expect(pipe.transform(completer.promise)).toEqual(new WrappedValue(message));
               async.done();
             }, timer)
           }));

        it("should return unwrapped value when nothing has changed since the last call",
           inject([AsyncTestCompleter], (async) => {
             pipe.transform(completer.promise);
             completer.resolve(message);

             TimerWrapper.setTimeout(() => {
               pipe.transform(completer.promise);
               expect(pipe.transform(completer.promise)).toBe(message);
               async.done();
             }, timer)
           }));

        it("should dispose of the existing subscription when subscribing to a new promise",
           inject([AsyncTestCompleter], (async) => {
             pipe.transform(completer.promise);

             var newCompleter = PromiseWrapper.completer();
             expect(pipe.transform(newCompleter.promise)).toBe(null);

             // this should not affect the pipe, so it should return WrappedValue
             completer.resolve(message);

             TimerWrapper.setTimeout(() => {
               expect(pipe.transform(newCompleter.promise)).toBe(null);
               async.done();
             }, timer)
           }));

        it("should request a change detection check upon receiving a new value",
           inject([AsyncTestCompleter], (async) => {
             var markForCheck = ref.spy('markForCheck');
             pipe.transform(completer.promise);
             completer.resolve(message);

             TimerWrapper.setTimeout(() => {
               expect(markForCheck).toHaveBeenCalled();
               async.done();
             }, timer)
           }));

        describe("ngOnDestroy", () => {
          it("should do nothing when no source",
             () => { expect(() => pipe.ngOnDestroy()).not.toThrow(); });

          it("should dispose of the existing source", inject([AsyncTestCompleter], (async) => {
               pipe.transform(completer.promise);
               expect(pipe.transform(completer.promise)).toBe(null);
               completer.resolve(message)


                   TimerWrapper.setTimeout(() => {
                     expect(pipe.transform(completer.promise)).toEqual(new WrappedValue(message));
                     pipe.ngOnDestroy();
                     expect(pipe.transform(completer.promise)).toBe(null);
                     async.done();
                   }, timer);
             }));
        });
      });
    });

    describe('null', () => {
      it('should return null when given null', () => {
        var pipe = new AsyncPipe(null);
        expect(pipe.transform(null, [])).toEqual(null);
      });
    });

    describe('other types', () => {
      it('should throw when given an invalid object', () => {
        var pipe = new AsyncPipe(null);
        expect(() => pipe.transform(<any>"some bogus object", [])).toThrowError();
      });
    });
  });
}
