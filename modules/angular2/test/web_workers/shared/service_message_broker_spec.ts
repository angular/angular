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
import {createPairedMessageBuses} from '../shared/web_worker_test_util';
import {Serializer, PRIMITIVE} from 'angular2/src/web_workers/shared/serializer';
import {
  ServiceMessageBroker,
  ServiceMessageBroker_
} from 'angular2/src/web_workers/shared/service_message_broker';
import {ObservableWrapper, PromiseWrapper} from 'angular2/src/facade/async';
import {provide} from 'angular2/core';
import {ON_WEB_WORKER} from 'angular2/src/web_workers/shared/api';
import {RenderProtoViewRefStore} from 'angular2/src/web_workers/shared/render_proto_view_ref_store';
import {
  RenderViewWithFragmentsStore
} from 'angular2/src/web_workers/shared/render_view_with_fragments_store';

export function main() {
  const CHANNEL = "UIMessageBroker Test Channel";
  const TEST_METHOD = "TEST_METHOD";
  const PASSED_ARG_1 = 5;
  const PASSED_ARG_2 = 'TEST';
  const RESULT = 20;
  const ID = "methodId";

  beforeEachBindings(() => [
    provide(ON_WEB_WORKER, {useValue: true}),
    RenderProtoViewRefStore,
    RenderViewWithFragmentsStore
  ]);

  describe("UIMessageBroker", () => {
    var messageBuses;

    beforeEach(() => {
      messageBuses = createPairedMessageBuses();
      messageBuses.ui.initChannel(CHANNEL);
      messageBuses.worker.initChannel(CHANNEL);
    });
    it("should call registered method with correct arguments",
       inject([Serializer], (serializer) => {
         var broker = new ServiceMessageBroker_(messageBuses.ui, serializer, CHANNEL);
         broker.registerMethod(TEST_METHOD, [PRIMITIVE, PRIMITIVE], (arg1, arg2) => {
           expect(arg1).toEqual(PASSED_ARG_1);
           expect(arg2).toEqual(PASSED_ARG_2);
         });
         ObservableWrapper.callEmit(messageBuses.worker.to(CHANNEL),
                                    {'method': TEST_METHOD, 'args': [PASSED_ARG_1, PASSED_ARG_2]});
       }));

    it("should return promises to the worker", inject([Serializer], (serializer) => {
         var broker = new ServiceMessageBroker_(messageBuses.ui, serializer, CHANNEL);
         broker.registerMethod(TEST_METHOD, [PRIMITIVE], (arg1) => {
           expect(arg1).toEqual(PASSED_ARG_1);
           return PromiseWrapper.wrap(() => { return RESULT; });
         });
         ObservableWrapper.callEmit(messageBuses.worker.to(CHANNEL),
                                    {'method': TEST_METHOD, 'id': ID, 'args': [PASSED_ARG_1]});
         ObservableWrapper.subscribe(messageBuses.worker.from(CHANNEL), (data: any) => {
           expect(data.type).toEqual("result");
           expect(data.id).toEqual(ID);
           expect(data.value).toEqual(RESULT);
         });
       }));
  });
}
