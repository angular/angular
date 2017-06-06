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
}