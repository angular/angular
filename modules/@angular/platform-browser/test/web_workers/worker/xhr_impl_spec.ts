import {
  AsyncTestCompleter,
  inject,
  describe,
  it,
  expect,
  beforeEach,
  beforeEachProviders
} from 'angular2/testing_internal';
import {SpyMessageBroker} from './spies';
import {WebWorkerXHRImpl} from "angular2/src/web_workers/worker/xhr_impl";
import {PromiseWrapper} from "angular2/src/facade/async";
import {MockMessageBrokerFactory, expectBrokerCall} from "../shared/web_worker_test_util";

export function main() {
  describe("WebWorkerXHRImpl", () => {
    it("should pass requests through the broker and return the response",
       inject([AsyncTestCompleter], (async) => {
         const URL = "http://www.example.com/test";
         const RESPONSE = "Example response text";

         var messageBroker = new SpyMessageBroker();
         expectBrokerCall(messageBroker, "get", [URL],
                          (_) => { return PromiseWrapper.wrap(() => { return RESPONSE; }); });
         var xhrImpl = new WebWorkerXHRImpl(new MockMessageBrokerFactory(<any>messageBroker));
         xhrImpl.get(URL).then((response) => {
           expect(response).toEqual(RESPONSE);
           async.done();
         });
       }));
  });
}
