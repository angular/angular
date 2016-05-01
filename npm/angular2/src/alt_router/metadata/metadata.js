'use strict';"use strict";
var lang_1 = require("angular2/src/facade/lang");
var RouteMetadata = (function () {
    function RouteMetadata() {
    }
    Object.defineProperty(RouteMetadata.prototype, "path", {
        get: function () { },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RouteMetadata.prototype, "component", {
        get: function () { },
        enumerable: true,
        configurable: true
    });
    return RouteMetadata;
}());
exports.RouteMetadata = RouteMetadata;
/* @ts2dart_const */
var Route = (function () {
    function Route(_a) {
        var _b = _a === void 0 ? {} : _a, path = _b.path, component = _b.component;
        this.path = path;
        this.component = component;
    }
    Route.prototype.toString = function () { return "@Route(" + this.path + ", " + lang_1.stringify(this.component) + ")"; };
    return Route;
}());
exports.Route = Route;
/* @ts2dart_const */
var RoutesMetadata = (function () {
    function RoutesMetadata(routes) {
        this.routes = routes;
    }
    RoutesMetadata.prototype.toString = function () { return "@Routes(" + this.routes + ")"; };
    return RoutesMetadata;
}());
exports.RoutesMetadata = RoutesMetadata;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0YWRhdGEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLXI1UHJKSzloLnRtcC9hbmd1bGFyMi9zcmMvYWx0X3JvdXRlci9tZXRhZGF0YS9tZXRhZGF0YS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEscUJBQThCLDBCQUEwQixDQUFDLENBQUE7QUFFekQ7SUFBQTtJQUdBLENBQUM7SUFGQyxzQkFBYSwrQkFBSTthQUFqQixlQUE0Qjs7O09BQUE7SUFDNUIsc0JBQWEsb0NBQVM7YUFBdEIsZUFBK0I7OztPQUFBO0lBQ2pDLG9CQUFDO0FBQUQsQ0FBQyxBQUhELElBR0M7QUFIcUIscUJBQWEsZ0JBR2xDLENBQUE7QUFFRCxvQkFBb0I7QUFDcEI7SUFHRSxlQUFZLEVBQXlEO1lBQXpELDRCQUF5RCxFQUF4RCxjQUFJLEVBQUUsd0JBQVM7UUFDMUIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDakIsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7SUFDN0IsQ0FBQztJQUNELHdCQUFRLEdBQVIsY0FBcUIsTUFBTSxDQUFDLFlBQVUsSUFBSSxDQUFDLElBQUksVUFBSyxnQkFBUyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBRyxDQUFDLENBQUMsQ0FBQztJQUNyRixZQUFDO0FBQUQsQ0FBQyxBQVJELElBUUM7QUFSWSxhQUFLLFFBUWpCLENBQUE7QUFFRCxvQkFBb0I7QUFDcEI7SUFDRSx3QkFBbUIsTUFBdUI7UUFBdkIsV0FBTSxHQUFOLE1BQU0sQ0FBaUI7SUFBRyxDQUFDO0lBQzlDLGlDQUFRLEdBQVIsY0FBcUIsTUFBTSxDQUFDLGFBQVcsSUFBSSxDQUFDLE1BQU0sTUFBRyxDQUFDLENBQUMsQ0FBQztJQUMxRCxxQkFBQztBQUFELENBQUMsQUFIRCxJQUdDO0FBSFksc0JBQWMsaUJBRzFCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1R5cGUsIHN0cmluZ2lmeX0gZnJvbSBcImFuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZ1wiO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgUm91dGVNZXRhZGF0YSB7XG4gIGFic3RyYWN0IGdldCBwYXRoKCk6IHN0cmluZztcbiAgYWJzdHJhY3QgZ2V0IGNvbXBvbmVudCgpOiBUeXBlO1xufVxuXG4vKiBAdHMyZGFydF9jb25zdCAqL1xuZXhwb3J0IGNsYXNzIFJvdXRlIGltcGxlbWVudHMgUm91dGVNZXRhZGF0YSB7XG4gIHBhdGg6IHN0cmluZztcbiAgY29tcG9uZW50OiBUeXBlO1xuICBjb25zdHJ1Y3Rvcih7cGF0aCwgY29tcG9uZW50fToge3BhdGg/OiBzdHJpbmcsIGNvbXBvbmVudD86IFR5cGV9ID0ge30pIHtcbiAgICB0aGlzLnBhdGggPSBwYXRoO1xuICAgIHRoaXMuY29tcG9uZW50ID0gY29tcG9uZW50O1xuICB9XG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7IHJldHVybiBgQFJvdXRlKCR7dGhpcy5wYXRofSwgJHtzdHJpbmdpZnkodGhpcy5jb21wb25lbnQpfSlgOyB9XG59XG5cbi8qIEB0czJkYXJ0X2NvbnN0ICovXG5leHBvcnQgY2xhc3MgUm91dGVzTWV0YWRhdGEge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgcm91dGVzOiBSb3V0ZU1ldGFkYXRhW10pIHt9XG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7IHJldHVybiBgQFJvdXRlcygke3RoaXMucm91dGVzfSlgOyB9XG59XG4iXX0=