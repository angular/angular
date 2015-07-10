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
import {IMPLEMENTS} from 'angular2/src/facade/lang';
import {Serializer} from 'angular2/src/web-workers/shared/serializer';
import {NgZone} from 'angular2/src/core/zone/ng_zone';
import {MessageBroker} from 'angular2/src/web-workers/worker/broker';
import {MockMessageBus, MockMessageBusSink, MockMessageBusSource} from './worker_test_util';
import {ON_WEBWORKER} from 'angular2/src/web-workers/shared/api';
import {bind} from 'angular2/di';
import {RenderProtoViewRefStore} from 'angular2/src/web-workers/shared/render_proto_view_ref_store';
import {
  RenderViewWithFragmentsStore,
  WorkerRenderViewRef
} from 'angular2/src/web-workers/shared/render_view_with_fragments_store';
import {RenderEventDispatcher, RenderViewRef} from 'angular2/src/render/api';

export function main() {
  describe("MessageBroker", () => {
    beforeEachBindings(() => [
      bind(ON_WEBWORKER)
          .toValue(true),
      RenderProtoViewRefStore,
      RenderViewWithFragmentsStore
    ]);

    it("should dispatch events", inject([Serializer, NgZone], (serializer, zone) => {
         var bus = new MockMessageBus(new MockMessageBusSink(), new MockMessageBusSource());
         var broker = new MessageBroker(bus, serializer, zone);

         var eventDispatcher = new SpyEventDispatcher();
         var viewRef = new WorkerRenderViewRef(0);
         serializer.allocateRenderViews(0);  // serialize the ref so it's in the store
         viewRef =
             serializer.deserialize(serializer.serialize(viewRef, RenderViewRef), RenderViewRef);
         broker.registerEventDispatcher(viewRef, eventDispatcher);

         var elementIndex = 15;
         var eventName = 'click';

         bus.source.receive({
           'data': {
             'type': 'event',
             'value': {
               'viewRef': viewRef.serialize(),
               'elementIndex': elementIndex,
               'eventName': eventName
             }
           }
         });

         expect(eventDispatcher.wasDispatched).toBeTruthy();
         expect(eventDispatcher.elementIndex).toEqual(elementIndex);
         expect(eventDispatcher.eventName).toEqual(eventName);
       }));
  });
}

class SpyEventDispatcher implements RenderEventDispatcher {
  wasDispatched: boolean = false;
  elementIndex: number;
  eventName: string;

  dispatchRenderEvent(elementIndex: number, eventName: string, locals: Map<string, any>) {
    this.wasDispatched = true;
    this.elementIndex = elementIndex;
    this.eventName = eventName;
  }
}
