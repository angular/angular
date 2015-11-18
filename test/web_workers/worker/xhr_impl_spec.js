var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var testing_internal_1 = require('angular2/testing_internal');
var spies_1 = require('./spies');
var client_message_broker_1 = require('angular2/src/web_workers/shared/client_message_broker');
var xhr_impl_1 = require("angular2/src/web_workers/worker/xhr_impl");
var async_1 = require("angular2/src/facade/async");
function main() {
    testing_internal_1.describe("WebWorkerXHRImpl", function () {
        testing_internal_1.it("should pass requests through the broker and return the response", testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            var URL = "http://www.example.com/test";
            var RESPONSE = "Example response text";
            var messageBroker = new spies_1.SpyMessageBroker();
            messageBroker.spy("runOnService")
                .andCallFake(function (args, returnType) {
                testing_internal_1.expect(args.method).toEqual("get");
                testing_internal_1.expect(args.args.length).toEqual(1);
                testing_internal_1.expect(args.args[0].value).toEqual(URL);
                return async_1.PromiseWrapper.wrap(function () { return RESPONSE; });
            });
            var xhrImpl = new xhr_impl_1.WebWorkerXHRImpl(new MockMessageBrokerFactory(messageBroker));
            xhrImpl.get(URL).then(function (response) {
                testing_internal_1.expect(response).toEqual(RESPONSE);
                async.done();
            });
        }));
    });
}
exports.main = main;
var MockMessageBrokerFactory = (function (_super) {
    __extends(MockMessageBrokerFactory, _super);
    function MockMessageBrokerFactory(_messageBroker) {
        _super.call(this, null, null);
        this._messageBroker = _messageBroker;
    }
    MockMessageBrokerFactory.prototype.createMessageBroker = function (channel, runInZone) {
        if (runInZone === void 0) { runInZone = true; }
        return this._messageBroker;
    };
    return MockMessageBrokerFactory;
})(client_message_broker_1.ClientMessageBrokerFactory_);
//# sourceMappingURL=xhr_impl_spec.js.map