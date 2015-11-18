library angular2.test.web_workers.shared.service_message_broker_spec;

import "package:angular2/testing_internal.dart"
    show
        AsyncTestCompleter,
        inject,
        describe,
        it,
        expect,
        beforeEach,
        createTestInjector,
        beforeEachBindings,
        SpyObject,
        proxy;
import "../shared/web_worker_test_util.dart" show createPairedMessageBuses;
import "package:angular2/src/web_workers/shared/serializer.dart"
    show Serializer, PRIMITIVE;
import "package:angular2/src/web_workers/shared/service_message_broker.dart"
    show ServiceMessageBroker, ServiceMessageBroker_;
import "package:angular2/src/facade/async.dart"
    show ObservableWrapper, PromiseWrapper;
import "package:angular2/core.dart" show provide;
import "package:angular2/src/web_workers/shared/api.dart" show ON_WEB_WORKER;
import "package:angular2/src/web_workers/shared/render_proto_view_ref_store.dart"
    show RenderProtoViewRefStore;
import "package:angular2/src/web_workers/shared/render_view_with_fragments_store.dart"
    show RenderViewWithFragmentsStore;

main() {
  const CHANNEL = "UIMessageBroker Test Channel";
  const TEST_METHOD = "TEST_METHOD";
  const PASSED_ARG_1 = 5;
  const PASSED_ARG_2 = "TEST";
  const RESULT = 20;
  const ID = "methodId";
  beforeEachBindings(() => [
        provide(ON_WEB_WORKER, useValue: true),
        RenderProtoViewRefStore,
        RenderViewWithFragmentsStore
      ]);
  describe("UIMessageBroker", () {
    var messageBuses;
    beforeEach(() {
      messageBuses = createPairedMessageBuses();
      messageBuses.ui.initChannel(CHANNEL);
      messageBuses.worker.initChannel(CHANNEL);
    });
    it(
        "should call registered method with correct arguments",
        inject([Serializer], (serializer) {
          var broker =
              new ServiceMessageBroker_(messageBuses.ui, serializer, CHANNEL);
          broker.registerMethod(TEST_METHOD, [PRIMITIVE, PRIMITIVE],
              (arg1, arg2) {
            expect(arg1).toEqual(PASSED_ARG_1);
            expect(arg2).toEqual(PASSED_ARG_2);
          });
          ObservableWrapper.callEmit(messageBuses.worker.to(CHANNEL), {
            "method": TEST_METHOD,
            "args": [PASSED_ARG_1, PASSED_ARG_2]
          });
        }));
    it(
        "should return promises to the worker",
        inject([Serializer], (serializer) {
          var broker =
              new ServiceMessageBroker_(messageBuses.ui, serializer, CHANNEL);
          broker.registerMethod(TEST_METHOD, [PRIMITIVE], (arg1) {
            expect(arg1).toEqual(PASSED_ARG_1);
            return PromiseWrapper.wrap(() {
              return RESULT;
            });
          });
          ObservableWrapper.callEmit(messageBuses.worker.to(CHANNEL), {
            "method": TEST_METHOD,
            "id": ID,
            "args": [PASSED_ARG_1]
          });
          ObservableWrapper.subscribe(messageBuses.worker.from(CHANNEL),
              (dynamic data) {
            expect(data.type).toEqual("result");
            expect(data.id).toEqual(ID);
            expect(data.value).toEqual(RESULT);
          });
        }));
  });
}
