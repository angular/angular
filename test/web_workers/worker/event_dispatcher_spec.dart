library angular2.test.web_workers.worker.event_dispatcher_spec;

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
import "package:angular2/src/web_workers/shared/serializer.dart"
    show Serializer;
import "package:angular2/src/web_workers/shared/api.dart" show ON_WEB_WORKER;
import "package:angular2/core.dart" show provide;
import "package:angular2/src/web_workers/shared/render_proto_view_ref_store.dart"
    show RenderProtoViewRefStore;
import "package:angular2/src/web_workers/shared/render_view_with_fragments_store.dart"
    show RenderViewWithFragmentsStore, WebWorkerRenderViewRef;
import "package:angular2/src/core/render/api.dart"
    show RenderEventDispatcher, RenderViewRef;
import "../shared/web_worker_test_util.dart" show createPairedMessageBuses;
import "package:angular2/src/web_workers/worker/event_dispatcher.dart"
    show WebWorkerEventDispatcher;
import "package:angular2/src/facade/async.dart" show ObservableWrapper;
import "package:angular2/src/web_workers/shared/messaging_api.dart"
    show EVENT_CHANNEL;

main() {
  describe("EventDispatcher", () {
    beforeEachBindings(() => [
          provide(ON_WEB_WORKER, useValue: true),
          RenderProtoViewRefStore,
          RenderViewWithFragmentsStore
        ]);
    it(
        "should dispatch events",
        inject([Serializer, AsyncTestCompleter], (serializer, async) {
          var messageBuses = createPairedMessageBuses();
          var webWorkerEventDispatcher =
              new WebWorkerEventDispatcher(messageBuses.worker, serializer);
          var elementIndex = 15;
          var eventName = "click";
          var eventDispatcher =
              new SpyEventDispatcher((elementIndex, eventName, locals) {
            expect(elementIndex).toEqual(elementIndex);
            expect(eventName).toEqual(eventName);
            async.done();
          });
          var viewRef = new WebWorkerRenderViewRef(0);
          serializer.allocateRenderViews(0);
          viewRef = serializer.deserialize(
              serializer.serialize(viewRef, RenderViewRef), RenderViewRef);
          webWorkerEventDispatcher.registerEventDispatcher(
              viewRef, eventDispatcher);
          ObservableWrapper.callNext(messageBuses.ui.to(EVENT_CHANNEL), {
            "viewRef": viewRef.serialize(),
            "elementIndex": elementIndex,
            "eventName": eventName,
            "locals": {
              "\$event": {
                "target": {"value": null}
              }
            }
          });
        }));
  });
}

class SpyEventDispatcher implements RenderEventDispatcher {
  Function _callback;
  SpyEventDispatcher(this._callback) {}
  bool dispatchRenderEvent(
      num elementIndex, String eventName, Map<String, dynamic> locals) {
    this._callback(elementIndex, eventName, locals);
    return false;
  }
}
