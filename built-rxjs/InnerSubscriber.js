var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Subscriber_1 = require('./Subscriber');
var InnerSubscriber = (function (_super) {
    __extends(InnerSubscriber, _super);
    function InnerSubscriber(parent, outerValue, outerIndex) {
        _super.call(this);
        this.parent = parent;
        this.outerValue = outerValue;
        this.outerIndex = outerIndex;
        this.index = 0;
    }
    InnerSubscriber.prototype._next = function (value) {
        var index = this.index++;
        this.parent.notifyNext(this.outerValue, value, this.outerIndex, index);
    };
    InnerSubscriber.prototype._error = function (error) {
        this.parent.notifyError(error, this);
    };
    InnerSubscriber.prototype._complete = function () {
        this.parent.notifyComplete(this);
    };
    return InnerSubscriber;
})(Subscriber_1.Subscriber);
exports.InnerSubscriber = InnerSubscriber;
//# sourceMappingURL=InnerSubscriber.js.map