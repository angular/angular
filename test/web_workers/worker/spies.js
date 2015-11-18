var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var client_message_broker_1 = require('angular2/src/web_workers/shared/client_message_broker');
var testing_internal_1 = require('angular2/testing_internal');
var SpyMessageBroker = (function (_super) {
    __extends(SpyMessageBroker, _super);
    function SpyMessageBroker() {
        _super.call(this, client_message_broker_1.ClientMessageBroker);
    }
    return SpyMessageBroker;
})(testing_internal_1.SpyObject);
exports.SpyMessageBroker = SpyMessageBroker;
//# sourceMappingURL=spies.js.map