var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var QueueAction_1 = require('./QueueAction');
var FutureAction = (function (_super) {
    __extends(FutureAction, _super);
    function FutureAction(scheduler, work) {
        _super.call(this, scheduler, work);
        this.scheduler = scheduler;
        this.work = work;
    }
    FutureAction.prototype.schedule = function (state, delay) {
        var _this = this;
        if (delay === void 0) { delay = 0; }
        if (this.isUnsubscribed) {
            return this;
        }
        this.delay = delay;
        this.state = state;
        var id = this.id;
        if (id != null) {
            this.id = undefined;
            clearTimeout(id);
        }
        var scheduler = this.scheduler;
        this.id = setTimeout(function () {
            _this.id = void 0;
            scheduler.actions.push(_this);
            scheduler.flush();
        }, this.delay);
        return this;
    };
    FutureAction.prototype.unsubscribe = function () {
        var id = this.id;
        if (id != null) {
            this.id = void 0;
            clearTimeout(id);
        }
        _super.prototype.unsubscribe.call(this);
    };
    return FutureAction;
})(QueueAction_1.QueueAction);
exports.FutureAction = FutureAction;
//# sourceMappingURL=FutureAction.js.map