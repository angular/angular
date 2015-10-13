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
} from 'angular2/testing_internal';
import {Serializer} from 'angular2/src/web_workers/shared/serializer';
import {ON_WEB_WORKER} from 'angular2/src/web_workers/shared/api';
import {provide} from 'angular2/core';
import {RenderProtoViewRefStore} from 'angular2/src/web_workers/shared/render_proto_view_ref_store';
import {
  RenderViewWithFragmentsStore,
  WebWorkerRenderViewRef
} from 'angular2/src/web_workers/shared/render_view_with_fragments_store';
import {RenderEventDispatcher, RenderViewRef} from 'angular2/src/core/render/api';
import {createPairedMessageBuses} from '../shared/web_worker_test_util';
import {WebWorkerEventDispatcher} from 'angular2/src/web_workers/worker/event_dispatcher';
import {ObservableWrapper} from 'angular2/src/core/facade/async';
import {EVENT_CHANNEL} from 'angular2/src/web_workers/shared/messaging_api';

export function main() {
  describe("EventDispatcher", () => {
    beforeEachBindings(() => [
      provide(ON_WEB_WORKER, {useValue: true}),
      RenderProtoViewRefStore,
      RenderViewWithFragmentsStore
    ]);

    it("should dispatch events", inject([Serializer, AsyncTestCompleter], (serializer, async) => {
         var messageBuses = createPairedMessageBuses();
         var webWorkerEventDispatcher =
             new WebWorkerEventDispatcher(messageBuses.worker, serializer);

         var elementIndex = 15;
         var eventName = 'click';

         var eventDispatcher = new SpyEventDispatcher((elementIndex, eventName, locals) => {
           expect(elementIndex).toEqual(elementIndex);
           expect(eventName).toEqual(eventName);
           async.done();
         });

         var viewRef = new WebWorkerRenderViewRef(0);
         serializer.allocateRenderViews(0);  // serialize the ref so it's in the store
         viewRef =
             serializer.deserialize(serializer.serialize(viewRef, RenderViewRef), RenderViewRef);
         webWorkerEventDispatcher.registerEventDispatcher(viewRef, eventDispatcher);

         ObservableWrapper.callNext(messageBuses.ui.to(EVENT_CHANNEL), {
           'viewRef': viewRef.serialize(),
           'elementIndex': elementIndex,
           'eventName': eventName,
           'locals': {'$event': {'target': {value: null}}}
         });
       }));
  });
}

class SpyEventDispatcher implements RenderEventDispatcher {
  constructor(private _callback: Function) {}

  dispatchRenderEvent(elementIndex: number, eventName: string, locals: Map<string, any>): boolean {
    this._callback(elementIndex, eventName, locals);
    return false;
  }
}
