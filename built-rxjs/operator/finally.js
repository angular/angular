var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Subscriber_1 = require('../Subscriber');
var Subscription_1 = require('../Subscription');
function _finally(finallySelector) {
    return this.lift(new FinallyOperator(finallySelector));
}
exports._finally = _finally;
var FinallyOperator = (function () {
    function FinallyOperator(finallySelector) {
        this.finallySelector = finallySelector;
    }
    FinallyOperator.prototype.call = function (subscriber) {
        return new FinallySubscriber(subscriber, this.finallySelector);
    };
    return FinallyOperator;
})();
var FinallySubscriber = (function (_super) {
    __extends(FinallySubscriber, _super);
    function FinallySubscriber(destination, finallySelector) {
        _super.call(this, destination);
        this.add(new Subscription_1.Subscription(finallySelector));
    }
    return FinallySubscriber;
})(Subscriber_1.Subscriber);
//# sourceMappingURL=finally.js.map