'use strict';"use strict";
var promise_1 = require('angular2/src/facade/promise');
/**
 * Injectable completer that allows signaling completion of an asynchronous test. Used internally.
 */
var AsyncTestCompleter = (function () {
    function AsyncTestCompleter() {
        this._completer = new promise_1.PromiseCompleter();
    }
    AsyncTestCompleter.prototype.done = function (value) { this._completer.resolve(value); };
    AsyncTestCompleter.prototype.fail = function (error, stackTrace) { this._completer.reject(error, stackTrace); };
    Object.defineProperty(AsyncTestCompleter.prototype, "promise", {
        get: function () { return this._completer.promise; },
        enumerable: true,
        configurable: true
    });
    return AsyncTestCompleter;
}());
exports.AsyncTestCompleter = AsyncTestCompleter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXN5bmNfdGVzdF9jb21wbGV0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLVhjdW9mUHhHLnRtcC9hbmd1bGFyMi9zcmMvdGVzdGluZy9hc3luY190ZXN0X2NvbXBsZXRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsd0JBQStCLDZCQUE2QixDQUFDLENBQUE7QUFFN0Q7O0dBRUc7QUFDSDtJQUFBO1FBQ1UsZUFBVSxHQUFHLElBQUksMEJBQWdCLEVBQU8sQ0FBQztJQU1uRCxDQUFDO0lBTEMsaUNBQUksR0FBSixVQUFLLEtBQVcsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFckQsaUNBQUksR0FBSixVQUFLLEtBQVcsRUFBRSxVQUFtQixJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFckYsc0JBQUksdUNBQU87YUFBWCxjQUE4QixNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDOzs7T0FBQTtJQUNqRSx5QkFBQztBQUFELENBQUMsQUFQRCxJQU9DO0FBUFksMEJBQWtCLHFCQU85QixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtQcm9taXNlQ29tcGxldGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL3Byb21pc2UnO1xuXG4vKipcbiAqIEluamVjdGFibGUgY29tcGxldGVyIHRoYXQgYWxsb3dzIHNpZ25hbGluZyBjb21wbGV0aW9uIG9mIGFuIGFzeW5jaHJvbm91cyB0ZXN0LiBVc2VkIGludGVybmFsbHkuXG4gKi9cbmV4cG9ydCBjbGFzcyBBc3luY1Rlc3RDb21wbGV0ZXIge1xuICBwcml2YXRlIF9jb21wbGV0ZXIgPSBuZXcgUHJvbWlzZUNvbXBsZXRlcjxhbnk+KCk7XG4gIGRvbmUodmFsdWU/OiBhbnkpIHsgdGhpcy5fY29tcGxldGVyLnJlc29sdmUodmFsdWUpOyB9XG5cbiAgZmFpbChlcnJvcj86IGFueSwgc3RhY2tUcmFjZT86IHN0cmluZykgeyB0aGlzLl9jb21wbGV0ZXIucmVqZWN0KGVycm9yLCBzdGFja1RyYWNlKTsgfVxuXG4gIGdldCBwcm9taXNlKCk6IFByb21pc2U8YW55PiB7IHJldHVybiB0aGlzLl9jb21wbGV0ZXIucHJvbWlzZTsgfVxufVxuIl19