var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Observable_1 = require('../Observable');
var root_1 = require('../util/root');
var SymbolShim_1 = require('../util/SymbolShim');
var tryCatch_1 = require('../util/tryCatch');
var errorObject_1 = require('../util/errorObject');
var IteratorObservable = (function (_super) {
    __extends(IteratorObservable, _super);
    function IteratorObservable(iterator, project, thisArg, scheduler) {
        _super.call(this);
        this.project = project;
        this.thisArg = thisArg;
        this.scheduler = scheduler;
        if (iterator == null) {
            throw new Error('iterator cannot be null.');
        }
        if (project && typeof project !== 'function') {
            throw new Error('When provided, `project` must be a function.');
        }
        this.iterator = getIterator(iterator);
    }
    IteratorObservable.create = function (iterator, project, thisArg, scheduler) {
        return new IteratorObservable(iterator, project, thisArg, scheduler);
    };
    IteratorObservable.dispatch = function (state) {
        var index = state.index, hasError = state.hasError, thisArg = state.thisArg, project = state.project, iterator = state.iterator, subscriber = state.subscriber;
        if (hasError) {
            subscriber.error(state.error);
            return;
        }
        var result = iterator.next();
        if (result.done) {
            subscriber.complete();
            return;
        }
        if (project) {
            result = tryCatch_1.tryCatch(project).call(thisArg, result.value, index);
            if (result === errorObject_1.errorObject) {
                state.error = errorObject_1.errorObject.e;
                state.hasError = true;
            }
            else {
                subscriber.next(result);
                state.index = index + 1;
            }
        }
        else {
            subscriber.next(result.value);
            state.index = index + 1;
        }
        if (subscriber.isUnsubscribed) {
            return;
        }
        this.schedule(state);
    };
    IteratorObservable.prototype._subscribe = function (subscriber) {
        var index = 0;
        var _a = this, iterator = _a.iterator, project = _a.project, thisArg = _a.thisArg, scheduler = _a.scheduler;
        if (scheduler) {
            subscriber.add(scheduler.schedule(IteratorObservable.dispatch, 0, {
                index: index, thisArg: thisArg, project: project, iterator: iterator, subscriber: subscriber
            }));
        }
        else {
            do {
                var result = iterator.next();
                if (result.done) {
                    subscriber.complete();
                    break;
                }
                else if (project) {
                    result = tryCatch_1.tryCatch(project).call(thisArg, result.value, index++);
                    if (result === errorObject_1.errorObject) {
                        subscriber.error(errorObject_1.errorObject.e);
                        break;
                    }
                    subscriber.next(result);
                }
                else {
                    subscriber.next(result.value);
                }
                if (subscriber.isUnsubscribed) {
                    break;
                }
            } while (true);
        }
    };
    return IteratorObservable;
})(Observable_1.Observable);
exports.IteratorObservable = IteratorObservable;
var StringIterator = (function () {
    function StringIterator(str, idx, len) {
        if (idx === void 0) { idx = 0; }
        if (len === void 0) { len = str.length; }
        this.str = str;
        this.idx = idx;
        this.len = len;
    }
    StringIterator.prototype[SymbolShim_1.SymbolShim.iterator] = function () { return (this); };
    StringIterator.prototype.next = function () {
        return this.idx < this.len ? {
            done: false,
            value: this.str.charAt(this.idx++)
        } : {
            done: true,
            value: undefined
        };
    };
    return StringIterator;
})();
var ArrayIterator = (function () {
    function ArrayIterator(arr, idx, len) {
        if (idx === void 0) { idx = 0; }
        if (len === void 0) { len = toLength(arr); }
        this.arr = arr;
        this.idx = idx;
        this.len = len;
    }
    ArrayIterator.prototype[SymbolShim_1.SymbolShim.iterator] = function () { return this; };
    ArrayIterator.prototype.next = function () {
        return this.idx < this.len ? {
            done: false,
            value: this.arr[this.idx++]
        } : {
            done: true,
            value: undefined
        };
    };
    return ArrayIterator;
})();
function getIterator(obj) {
    var i = obj[SymbolShim_1.SymbolShim.iterator];
    if (!i && typeof obj === 'string') {
        return new StringIterator(obj);
    }
    if (!i && obj.length !== undefined) {
        return new ArrayIterator(obj);
    }
    if (!i) {
        throw new TypeError('Object is not iterable');
    }
    return obj[SymbolShim_1.SymbolShim.iterator]();
}
var maxSafeInteger = Math.pow(2, 53) - 1;
function toLength(o) {
    var len = +o.length;
    if (isNaN(len)) {
        return 0;
    }
    if (len === 0 || !numberIsFinite(len)) {
        return len;
    }
    len = sign(len) * Math.floor(Math.abs(len));
    if (len <= 0) {
        return 0;
    }
    if (len > maxSafeInteger) {
        return maxSafeInteger;
    }
    return len;
}
function numberIsFinite(value) {
    return typeof value === 'number' && root_1.root.isFinite(value);
}
function sign(value) {
    var valueAsNumber = +value;
    if (valueAsNumber === 0) {
        return valueAsNumber;
    }
    if (isNaN(valueAsNumber)) {
        return valueAsNumber;
    }
    return valueAsNumber < 0 ? -1 : 1;
}
//# sourceMappingURL=IteratorObservable.js.map