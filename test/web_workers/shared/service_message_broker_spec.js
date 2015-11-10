var testing_internal_1 = require('angular2/testing_internal');
var web_worker_test_util_1 = require('../shared/web_worker_test_util');
var serializer_1 = require('angular2/src/web_workers/shared/serializer');
var service_message_broker_1 = require('angular2/src/web_workers/shared/service_message_broker');
var async_1 = require('angular2/src/facade/async');
var core_1 = require('angular2/core');
var api_1 = require('angular2/src/web_workers/shared/api');
var render_proto_view_ref_store_1 = require('angular2/src/web_workers/shared/render_proto_view_ref_store');
var render_view_with_fragments_store_1 = require('angular2/src/web_workers/shared/render_view_with_fragments_store');
function main() {
    var CHANNEL = "UIMessageBroker Test Channel";
    var TEST_METHOD = "TEST_METHOD";
    var PASSED_ARG_1 = 5;
    var PASSED_ARG_2 = 'TEST';
    var RESULT = 20;
    var ID = "methodId";
    testing_internal_1.beforeEachBindings(function () { return [
        core_1.provide(api_1.ON_WEB_WORKER, { useValue: true }),
        render_proto_view_ref_store_1.RenderProtoViewRefStore,
        render_view_with_fragments_store_1.RenderViewWithFragmentsStore
    ]; });
    testing_internal_1.describe("UIMessageBroker", function () {
        var messageBuses;
        testing_internal_1.beforeEach(function () {
            messageBuses = web_worker_test_util_1.createPairedMessageBuses();
            messageBuses.ui.initChannel(CHANNEL);
            messageBuses.worker.initChannel(CHANNEL);
        });
        testing_internal_1.it("should call registered method with correct arguments", testing_internal_1.inject([serializer_1.Serializer], function (serializer) {
            var broker = new service_message_broker_1.ServiceMessageBroker_(messageBuses.ui, serializer, CHANNEL);
            broker.registerMethod(TEST_METHOD, [serializer_1.PRIMITIVE, serializer_1.PRIMITIVE], function (arg1, arg2) {
                testing_internal_1.expect(arg1).toEqual(PASSED_ARG_1);
                testing_internal_1.expect(arg2).toEqual(PASSED_ARG_2);
            });
            async_1.ObservableWrapper.callNext(messageBuses.worker.to(CHANNEL), { 'method': TEST_METHOD, 'args': [PASSED_ARG_1, PASSED_ARG_2] });
        }));
        testing_internal_1.it("should return promises to the worker", testing_internal_1.inject([serializer_1.Serializer], function (serializer) {
            var broker = new service_message_broker_1.ServiceMessageBroker_(messageBuses.ui, serializer, CHANNEL);
            broker.registerMethod(TEST_METHOD, [serializer_1.PRIMITIVE], function (arg1) {
                testing_internal_1.expect(arg1).toEqual(PASSED_ARG_1);
                return async_1.PromiseWrapper.wrap(function () { return RESULT; });
            });
            async_1.ObservableWrapper.callNext(messageBuses.worker.to(CHANNEL), { 'method': TEST_METHOD, 'id': ID, 'args': [PASSED_ARG_1] });
            async_1.ObservableWrapper.subscribe(messageBuses.worker.from(CHANNEL), function (data) {
                testing_internal_1.expect(data.type).toEqual("result");
                testing_internal_1.expect(data.id).toEqual(ID);
                testing_internal_1.expect(data.value).toEqual(RESULT);
            });
        }));
    });
}
exports.main = main;
//# sourceMappingURL=service_message_broker_spec.js.map