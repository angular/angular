library angular2.test.web_workers.worker.xhr_impl_spec;

import "package:angular2/testing_internal.dart"
    show
        AsyncTestCompleter,
        inject,
        describe,
        it,
        expect,
        beforeEach,
        beforeEachProviders;
import "spies.dart" show SpyMessageBroker;
import "package:angular2/src/web_workers/worker/xhr_impl.dart"
    show WebWorkerXHRImpl;
import "package:angular2/src/facade/async.dart" show PromiseWrapper;
import "../shared/web_worker_test_util.dart"
    show MockMessageBrokerFactory, expectBrokerCall;

main() {
  describe("WebWorkerXHRImpl", () {
    it(
        "should pass requests through the broker and return the response",
        inject([AsyncTestCompleter], (async) {
          const URL = "http://www.example.com/test";
          const RESPONSE = "Example response text";
          var messageBroker = new SpyMessageBroker();
          expectBrokerCall(messageBroker, "get", [URL], (_) {
            return PromiseWrapper.wrap(() {
              return RESPONSE;
            });
          });
          var xhrImpl = new WebWorkerXHRImpl(
              new MockMessageBrokerFactory((messageBroker as dynamic)));
          xhrImpl.get(URL).then((response) {
            expect(response).toEqual(RESPONSE);
            async.done();
          });
        }));
  });
}
