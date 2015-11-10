library angular2.test.web_workers.worker.xhr_impl_spec;

import "package:angular2/testing_internal.dart"
    show
        AsyncTestCompleter,
        inject,
        describe,
        it,
        expect,
        beforeEach,
        createTestInjector,
        beforeEachBindings;
import "spies.dart" show SpyMessageBroker;
import "package:angular2/src/facade/lang.dart" show Type;
import "package:angular2/src/web_workers/shared/client_message_broker.dart"
    show
        ClientMessageBroker,
        UiArguments,
        ClientMessageBrokerFactory,
        ClientMessageBrokerFactory_;
import "package:angular2/src/web_workers/worker/xhr_impl.dart"
    show WebWorkerXHRImpl;
import "package:angular2/src/facade/async.dart" show PromiseWrapper;

main() {
  describe("WebWorkerXHRImpl", () {
    it(
        "should pass requests through the broker and return the response",
        inject([AsyncTestCompleter], (async) {
          const URL = "http://www.example.com/test";
          const RESPONSE = "Example response text";
          dynamic messageBroker = new SpyMessageBroker();
          messageBroker
              .spy("runOnService")
              .andCallFake((UiArguments args, Type returnType) {
            expect(args.method).toEqual("get");
            expect(args.args.length).toEqual(1);
            expect(args.args[0].value).toEqual(URL);
            return PromiseWrapper.wrap(() {
              return RESPONSE;
            });
          });
          var xhrImpl =
              new WebWorkerXHRImpl(new MockMessageBrokerFactory(messageBroker));
          xhrImpl.get(URL).then((response) {
            expect(response).toEqual(RESPONSE);
            async.done();
          });
        }));
  });
}

class MockMessageBrokerFactory extends ClientMessageBrokerFactory_ {
  ClientMessageBroker _messageBroker;
  MockMessageBrokerFactory(this._messageBroker) : super(null, null) {
    /* super call moved to initializer */;
  }
  createMessageBroker(String channel, [runInZone = true]) {
    return this._messageBroker;
  }
}
