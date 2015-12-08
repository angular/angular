var QueueAction_1 = require('./QueueAction');
var FutureAction_1 = require('./FutureAction');
var QueueScheduler = (function () {
    function QueueScheduler() {
        this.actions = [];
        this.active = false;
        this.scheduled = false;
    }
    QueueScheduler.prototype.now = function () {
        return Date.now();
    };
    QueueScheduler.prototype.flush = function () {
        if (this.active || this.scheduled) {
            return;
        }
        this.active = true;
        var actions = this.actions;
        for (var action = void 0; action = actions.shift();) {
            action.execute();
        }
        this.active = false;
    };
    QueueScheduler.prototype.schedule = function (work, delay, state) {
        if (delay === void 0) { delay = 0; }
        return (delay <= 0) ?
            this.scheduleNow(work, state) :
            this.scheduleLater(work, delay, state);
    };
    QueueScheduler.prototype.scheduleNow = function (work, state) {
        return new QueueAction_1.QueueAction(this, work).schedule(state);
    };
    QueueScheduler.prototype.scheduleLater = function (work, delay, state) {
        return new FutureAction_1.FutureAction(this, work).schedule(state, delay);
    };
    return QueueScheduler;
})();
exports.QueueScheduler = QueueScheduler;
//# sourceMappingURL=QueueScheduler.js.map