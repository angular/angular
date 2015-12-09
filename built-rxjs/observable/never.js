var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Observable_1 = require('../Observable');
var noop_1 = require('../util/noop');
var InfiniteObservable = (function (_super) {
    __extends(InfiniteObservable, _super);
    function InfiniteObservable() {
        _super.call(this);
    }
    InfiniteObservable.create = function () {
        return new InfiniteObservable();
    };
    InfiniteObservable.prototype._subscribe = function (subscriber) {
        noop_1.noop();
    };
    return InfiniteObservable;
})(Observable_1.Observable);
exports.InfiniteObservable = InfiniteObservable;
//# sourceMappingURL=never.js.map