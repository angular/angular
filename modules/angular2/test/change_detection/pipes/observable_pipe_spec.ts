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
  proxy,
  SpyObject
} from 'angular2/test_lib';

import {IMPLEMENTS} from 'angular2/src/facade/lang';
import {WrappedValue} from 'angular2/src/change_detection/pipes/pipe';
import {ObservablePipe} from 'angular2/src/change_detection/pipes/observable_pipe';
import {ChangeDetectorRef} from 'angular2/src/change_detection/change_detector_ref';
import {EventEmitter, ObservableWrapper, TimerWrapper} from 'angular2/src/facade/async';

export function main() {
  describe("ObservablePipe", () => {
    var emitter;
    var pipe;
    var ref;
    var message = new Object();

    beforeEach(() => {
      emitter = new EventEmitter();
      ref = new SpyChangeDetectorRef();
      pipe = new ObservablePipe(ref);
    });

    describe("supports", () => {
      it("should support observables", () => { expect(pipe.supports(emitter)).toBe(true); });

      it("should not support other objects", () => {
        expect(pipe.supports("string")).toBe(false);
        expect(pipe.supports(null)).toBe(false);
      });
    });

    describe("transform", () => {
      it("should return null when subscribing to an observable",
         () => { expect(pipe.transform(emitter)).toBe(null); });

      it("should return the latest available value wrapped",
         inject([AsyncTestCompleter], (async) => {
           pipe.transform(emitter);

           ObservableWrapper.callNext(emitter, message);

           TimerWrapper.setTimeout(() => {
             expect(pipe.transform(emitter)).toEqual(new WrappedValue(message));
             async.done();
           }, 0)
         }));


      it("should return same value when nothing has changed since the last call",
         inject([AsyncTestCompleter], (async) => {
           pipe.transform(emitter);
           ObservableWrapper.callNext(emitter, message);

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
           ObservableWrapper.callNext(emitter, message);

           TimerWrapper.setTimeout(() => {
             expect(pipe.transform(newEmitter)).toBe(null);
             async.done();
           }, 0)
         }));

      it("should request a change detection check upon receiving a new value",
         inject([AsyncTestCompleter], (async) => {
           pipe.transform(emitter);
           ObservableWrapper.callNext(emitter, message);

           TimerWrapper.setTimeout(() => {
             expect(ref.spy('requestCheck')).toHaveBeenCalled();
             async.done();
           }, 0)
         }));
    });

    describe("onDestroy", () => {
      it("should do nothing when no subscription",
         () => { expect(() => pipe.onDestroy()).not.toThrow(); });

      it("should dispose of the existing subscription", inject([AsyncTestCompleter], (async) => {
           pipe.transform(emitter);
           pipe.onDestroy();

           ObservableWrapper.callNext(emitter, message);

           TimerWrapper.setTimeout(() => {
             expect(pipe.transform(emitter)).toBe(null);
             async.done();
           }, 0)
         }));
    });
  });
}

@proxy
@IMPLEMENTS(ChangeDetectorRef)
class SpyChangeDetectorRef extends SpyObject {
  constructor() { super(ChangeDetectorRef); }
  noSuchMethod(m) { return super.noSuchMethod(m) }
}
