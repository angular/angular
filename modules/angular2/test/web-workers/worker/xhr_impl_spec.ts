import {
  AsyncTestCompleter,
  inject,
  describe,
  it,
  expect,
  beforeEach,
  createTestInjector,
  beforeEachBindings,
  SpyObject,
  proxy
} from 'angular2/test_lib';
import {IMPLEMENTS, Type} from 'angular2/src/facade/lang';
import {MessageBroker, UiArguments} from 'angular2/src/web-workers/worker/broker';
import {WebWorkerXHRImpl} from "angular2/src/web-workers/worker/xhr_impl";
import {PromiseWrapper} from "angular2/src/facade/async";

export function main() {
  describe("WebWorkerXHRImpl", () => {
    it("should pass requests through the broker and return the response",
       inject([AsyncTestCompleter], (async) => {
         const URL = "http://www.example.com/test";
         const RESPONSE = "Example response text";

         var messageBroker: any = new SpyMessageBroker();
         messageBroker.spy("runOnUiThread")
             .andCallFake((args: UiArguments, returnType: Type) => {
               expect(args.type).toEqual("xhr");
               expect(args.method).toEqual("get");
               expect(args.args.length).toEqual(1);
               expect(args.args[0].value).toEqual(URL);
               return PromiseWrapper.wrap(() => { return RESPONSE; });
             });

         var xhrImpl = new WebWorkerXHRImpl(messageBroker);
         xhrImpl.get(URL).then((response) => {
           expect(response).toEqual(RESPONSE);
           async.done();
         });
       }));
  });
}

@proxy
@IMPLEMENTS(MessageBroker)
class SpyMessageBroker extends SpyObject {
  constructor() { super(MessageBroker); }
  noSuchMethod(m) { return super.noSuchMethod(m); }
}
