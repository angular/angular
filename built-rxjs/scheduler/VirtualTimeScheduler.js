var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Subscription_1 = require('../Subscription');
var VirtualTimeScheduler = (function () {
    function VirtualTimeScheduler() {
        this.actions = [];
        this.active = false;
        this.scheduled = false;
        this.index = 0;
        this.sorted = false;
        this.frame = 0;
        this.maxFrames = 750;
    }
    VirtualTimeScheduler.prototype.now = function () {
        return this.frame;
    };
    VirtualTimeScheduler.prototype.flush = function () {
        var actions = this.actions;
        var maxFrames = this.maxFrames;
        while (actions.length > 0) {
            var action = actions.shift();
            this.frame = action.delay;
            if (this.frame <= maxFrames) {
                action.execute();
            }
            else {
                break;
            }
        }
        actions.length = 0;
        this.frame = 0;
    };
    VirtualTimeScheduler.prototype.addAction = function (action) {
        var actions = this.actions;
        actions.push(action);
        actions.sort(function (a, b) {
            if (a.delay === b.delay) {
                if (a.index === b.index) {
                    return 0;
                }
                else if (a.index > b.index) {
                    return 1;
                }
                else {
                    return -1;
                }
            }
            else if (a.delay > b.delay) {
                return 1;
            }
            else {
                return -1;
            }
        });
    };
    VirtualTimeScheduler.prototype.schedule = function (work, delay, state) {
        if (delay === void 0) { delay = 0; }
        this.sorted = false;
        return new VirtualAction(this, work, this.index++).schedule(state, delay);
    };
    VirtualTimeScheduler.frameTimeFactor = 10;
    return VirtualTimeScheduler;
})();
exports.VirtualTimeScheduler = VirtualTimeScheduler;
var VirtualAction = (function (_super) {
    __extends(VirtualAction, _super);
    function VirtualAction(scheduler, work, index) {
        _super.call(this);
        this.scheduler = scheduler;
        this.work = work;
        this.index = index;
        this.calls = 0;
    }
    VirtualAction.prototype.schedule = function (state, delay) {
        if (delay === void 0) { delay = 0; }
        if (this.isUnsubscribed) {
            return this;
        }
        var scheduler = this.scheduler;
        var action;
        if (this.calls++ === 0) {
            // the action is not being rescheduled.
            action = this;
        }
        else {
            // the action is being rescheduled, and we can't mutate the one in the actions list
            // in the scheduler, so we'll create a new one.
            action = new VirtualAction(scheduler, this.work, scheduler.index += 1);
            this.add(action);
        }
        action.state = state;
        action.delay = scheduler.frame + delay;
        scheduler.addAction(action);
        return this;
    };
    VirtualAction.prototype.execute = function () {
        if (this.isUnsubscribed) {
            throw new Error('How did did we execute a canceled Action?');
        }
        this.work(this.state);
    };
    VirtualAction.prototype.unsubscribe = function () {
        var actions = this.scheduler.actions;
        var index = actions.indexOf(this);
        this.work = void 0;
        this.state = void 0;
        this.scheduler = void 0;
        if (index !== -1) {
            actions.splice(index, 1);
        }
        _super.prototype.unsubscribe.call(this);
    };
    return VirtualAction;
})(Subscription_1.Subscription);
//# sourceMappingURL=VirtualTimeScheduler.js.map