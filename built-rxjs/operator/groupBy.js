var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Subscriber_1 = require('../Subscriber');
var Observable_1 = require('../Observable');
var Subject_1 = require('../Subject');
var Map_1 = require('../util/Map');
var FastMap_1 = require('../util/FastMap');
var groupBy_support_1 = require('./groupBy-support');
var tryCatch_1 = require('../util/tryCatch');
var errorObject_1 = require('../util/errorObject');
function groupBy(keySelector, elementSelector, durationSelector) {
    return new GroupByObservable(this, keySelector, elementSelector, durationSelector);
}
exports.groupBy = groupBy;
var GroupByObservable = (function (_super) {
    __extends(GroupByObservable, _super);
    function GroupByObservable(source, keySelector, elementSelector, durationSelector) {
        _super.call(this);
        this.source = source;
        this.keySelector = keySelector;
        this.elementSelector = elementSelector;
        this.durationSelector = durationSelector;
    }
    GroupByObservable.prototype._subscribe = function (subscriber) {
        var refCountSubscription = new groupBy_support_1.RefCountSubscription();
        var groupBySubscriber = new GroupBySubscriber(subscriber, refCountSubscription, this.keySelector, this.elementSelector, this.durationSelector);
        refCountSubscription.setPrimary(this.source.subscribe(groupBySubscriber));
        return refCountSubscription;
    };
    return GroupByObservable;
})(Observable_1.Observable);
exports.GroupByObservable = GroupByObservable;
var GroupBySubscriber = (function (_super) {
    __extends(GroupBySubscriber, _super);
    function GroupBySubscriber(destination, refCountSubscription, keySelector, elementSelector, durationSelector) {
        _super.call(this);
        this.refCountSubscription = refCountSubscription;
        this.keySelector = keySelector;
        this.elementSelector = elementSelector;
        this.durationSelector = durationSelector;
        this.groups = null;
        this.destination = destination;
        this.add(destination);
    }
    GroupBySubscriber.prototype._next = function (x) {
        var key = tryCatch_1.tryCatch(this.keySelector)(x);
        if (key === errorObject_1.errorObject) {
            this.error(key.e);
        }
        else {
            var groups = this.groups;
            var elementSelector = this.elementSelector;
            var durationSelector = this.durationSelector;
            if (!groups) {
                groups = this.groups = typeof key === 'string' ? new FastMap_1.FastMap() : new Map_1.Map();
            }
            var group = groups.get(key);
            if (!group) {
                groups.set(key, group = new Subject_1.Subject());
                var groupedObservable = new groupBy_support_1.GroupedObservable(key, group, this.refCountSubscription);
                if (durationSelector) {
                    var duration = tryCatch_1.tryCatch(durationSelector)(new groupBy_support_1.GroupedObservable(key, group));
                    if (duration === errorObject_1.errorObject) {
                        this.error(duration.e);
                    }
                    else {
                        this.add(duration._subscribe(new GroupDurationSubscriber(key, group, this)));
                    }
                }
                this.destination.next(groupedObservable);
            }
            if (elementSelector) {
                var value = tryCatch_1.tryCatch(elementSelector)(x);
                if (value === errorObject_1.errorObject) {
                    this.error(value.e);
                }
                else {
                    group.next(value);
                }
            }
            else {
                group.next(x);
            }
        }
    };
    GroupBySubscriber.prototype._error = function (err) {
        var _this = this;
        var groups = this.groups;
        if (groups) {
            groups.forEach(function (group, key) {
                group.error(err);
                _this.removeGroup(key);
            });
        }
        this.destination.error(err);
    };
    GroupBySubscriber.prototype._complete = function () {
        var _this = this;
        var groups = this.groups;
        if (groups) {
            groups.forEach(function (group, key) {
                group.complete();
                _this.removeGroup(group);
            });
        }
        this.destination.complete();
    };
    GroupBySubscriber.prototype.removeGroup = function (key) {
        this.groups.delete(key);
    };
    return GroupBySubscriber;
})(Subscriber_1.Subscriber);
var GroupDurationSubscriber = (function (_super) {
    __extends(GroupDurationSubscriber, _super);
    function GroupDurationSubscriber(key, group, parent) {
        _super.call(this, null);
        this.key = key;
        this.group = group;
        this.parent = parent;
    }
    GroupDurationSubscriber.prototype._next = function (value) {
        this.group.complete();
        this.parent.removeGroup(this.key);
    };
    GroupDurationSubscriber.prototype._error = function (err) {
        this.group.error(err);
        this.parent.removeGroup(this.key);
    };
    GroupDurationSubscriber.prototype._complete = function () {
        this.group.complete();
        this.parent.removeGroup(this.key);
    };
    return GroupDurationSubscriber;
})(Subscriber_1.Subscriber);
//# sourceMappingURL=groupBy.js.map