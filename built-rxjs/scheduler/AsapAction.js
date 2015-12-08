var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Immediate_1 = require('../util/Immediate');
var QueueAction_1 = require('./QueueAction');
var AsapAction = (function (_super) {
    __extends(AsapAction, _super);
    function AsapAction() {
        _super.apply(this, arguments);
    }
    AsapAction.prototype.schedule = function (state) {
        var _this = this;
        if (this.isUnsubscribed) {
            return this;
        }
        this.state = state;
        var scheduler = this.scheduler;
        scheduler.actions.push(this);
        if (!scheduler.scheduled) {
            scheduler.scheduled = true;
            this.id = Immediate_1.Immediate.setImmediate(function () {
                _this.id = null;
                _this.scheduler.scheduled = false;
                _this.scheduler.flush();
            });
        }
        return this;
    };
    AsapAction.prototype.unsubscribe = function () {
        var id = this.id;
        var scheduler = this.scheduler;
        _super.prototype.unsubscribe.call(this);
        if (scheduler.actions.length === 0) {
            scheduler.active = false;
            scheduler.scheduled = false;
        }
        if (id) {
            this.id = null;
            Immediate_1.Immediate.clearImmediate(id);
        }
    };
    return AsapAction;
})(QueueAction_1.QueueAction);
exports.AsapAction = AsapAction;
//# sourceMappingURL=AsapAction.js.map