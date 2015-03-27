import {describe, it, expect, beforeEach, ddescribe, iit, xit, el,
  SpyObject, AsyncTestCompleter, inject, IS_DARTIUM} from 'angular2/test_lib';

import {ObservableWrapper, Observable, ObservableController, PromiseWrapper} from 'angular2/src/facade/async';

export function main() {
  describe('Observable', () => {
    var obs:Observable;
    var controller:ObservableController;

    beforeEach(() => {
      controller = ObservableWrapper.createController();
      obs = ObservableWrapper.createObservable(controller);
    });

    it("should call the next callback",  inject([AsyncTestCompleter], (async) => {
      ObservableWrapper.subscribe(obs, (value) => {
        expect(value).toEqual(99);
        async.done();
      });

      ObservableWrapper.callNext(controller, 99);
    }));

    it("should call the throw callback", inject([AsyncTestCompleter], (async) => {
      ObservableWrapper.subscribe(obs, (_) => {}, (error) => {
        expect(error).toEqual("Boom");
        async.done();
      });
      ObservableWrapper.callThrow(controller, "Boom");
    }));

    it("should call the return callback", inject([AsyncTestCompleter], (async) => {
      ObservableWrapper.subscribe(obs, (_) => {}, (_) => {}, () => {
        async.done();
      });

      ObservableWrapper.callReturn(controller);
    }));

    it("should subscribe to the wrapper asynchronously", () => {
      var called = false;
      ObservableWrapper.subscribe(obs, (value) => {
        called = true;
      });

      ObservableWrapper.callNext(controller, 99);
      expect(called).toBe(false);
    });

    if (!IS_DARTIUM) {
      // See here: https://github.com/jhusain/observable-spec
      describe("Generator", () => {
        var generator;

        beforeEach(() => {
          generator = new SpyObject();
          generator.spy("next");
          generator.spy("throw");
          generator.spy("return");
        });

        it("should call next on the given generator",  inject([AsyncTestCompleter], (async) => {
          generator.spy("next").andCallFake((value) => {
            expect(value).toEqual(99);
            async.done();
          });

          ObservableWrapper.subscribe(obs, generator);
          ObservableWrapper.callNext(controller, 99);
        }));

        it("should call throw on the given generator", inject([AsyncTestCompleter], (async) => {
          generator.spy("throw").andCallFake((error) => {
            expect(error).toEqual("Boom");
            async.done();
          });
          ObservableWrapper.subscribe(obs, generator);
          ObservableWrapper.callThrow(controller, "Boom");
        }));

        it("should call return on the given generator", inject([AsyncTestCompleter], (async) => {
          generator.spy("return").andCallFake(() => {
            async.done();
          });
          ObservableWrapper.subscribe(obs, generator);
          ObservableWrapper.callReturn(controller);
        }));
      });
    }

    //TODO: vsavkin: add tests cases
    //should call dispose on the subscription if generator returns {done:true}
    //should call dispose on the subscription on throw
    //should call dispose on the subscription on return
 });
}

//make sure rx observables are async