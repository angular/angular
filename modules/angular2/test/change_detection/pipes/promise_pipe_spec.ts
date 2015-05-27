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
import {IMPLEMENTS, isBlank} from 'angular2/src/facade/lang';
import {PromisePipe} from 'angular2/src/change_detection/pipes/promise_pipe';
import {WrappedValue} from 'angular2/src/change_detection/pipes/pipe';
import {ChangeDetectorRef} from 'angular2/src/change_detection/change_detector_ref';
import {PromiseWrapper, TimerWrapper} from 'angular2/src/facade/async';
import {DOM} from 'angular2/src/dom/dom_adapter';

export function main() {
  describe("PromisePipe", () => {
    var message = new Object();
    var pipe;
    var completer;
    var ref;
    // adds longer timers for passing tests in IE
    var timer = (!isBlank(DOM) && DOM.getUserAgent().indexOf("Trident") > -1) ? 50 : 0;

    beforeEach(() => {
      completer = PromiseWrapper.completer();
      ref = new SpyChangeDetectorRef();
      pipe = new PromisePipe(ref);
    });

    describe("supports", () => {
      it("should support promises", () => { expect(pipe.supports(completer.promise)).toBe(true); });

      it("should not support other objects", () => {
        expect(pipe.supports("string")).toBe(false);
        expect(pipe.supports(null)).toBe(false);
      });
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
           pipe.transform(completer.promise);
           completer.resolve(message);

           TimerWrapper.setTimeout(() => {
             expect(ref.spy('requestCheck')).toHaveBeenCalled();
             async.done();
           }, timer)
         }));

      describe("onDestroy", () => {
        it("should do nothing when no source",
           () => { expect(() => pipe.onDestroy()).not.toThrow(); });

        it("should dispose of the existing source", inject([AsyncTestCompleter], (async) => {
             pipe.transform(completer.promise);
             expect(pipe.transform(completer.promise)).toBe(null);
             completer.resolve(message)


                 TimerWrapper.setTimeout(() => {
                   expect(pipe.transform(completer.promise)).toEqual(new WrappedValue(message));
                   pipe.onDestroy();
                   expect(pipe.transform(completer.promise)).toBe(null);
                   async.done();
                 }, timer);
           }));
      });
    });
  });
}

@proxy
@IMPLEMENTS(ChangeDetectorRef)
class SpyChangeDetectorRef extends SpyObject {
  constructor() { super(ChangeDetectorRef); }
  noSuchMethod(m) { return super.noSuchMethod(m) }
}
