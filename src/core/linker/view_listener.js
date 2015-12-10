'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var di_1 = require('angular2/src/core/di');
/**
 * Listener for view creation / destruction.
 */
var AppViewListener = (function () {
    function AppViewListener() {
    }
    AppViewListener.prototype.onViewCreated = function (view) { };
    AppViewListener.prototype.onViewDestroyed = function (view) { };
    AppViewListener = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], AppViewListener);
    return AppViewListener;
})();
exports.AppViewListener = AppViewListener;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld19saXN0ZW5lci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci92aWV3X2xpc3RlbmVyLnRzIl0sIm5hbWVzIjpbIkFwcFZpZXdMaXN0ZW5lciIsIkFwcFZpZXdMaXN0ZW5lci5jb25zdHJ1Y3RvciIsIkFwcFZpZXdMaXN0ZW5lci5vblZpZXdDcmVhdGVkIiwiQXBwVmlld0xpc3RlbmVyLm9uVmlld0Rlc3Ryb3llZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUEsbUJBQXlCLHNCQUFzQixDQUFDLENBQUE7QUFHaEQ7O0dBRUc7QUFDSDtJQUFBQTtJQUlBQyxDQUFDQTtJQUZDRCx1Q0FBYUEsR0FBYkEsVUFBY0EsSUFBd0JBLElBQUdFLENBQUNBO0lBQzFDRix5Q0FBZUEsR0FBZkEsVUFBZ0JBLElBQXdCQSxJQUFHRyxDQUFDQTtJQUg5Q0g7UUFBQ0EsZUFBVUEsRUFBRUE7O3dCQUlaQTtJQUFEQSxzQkFBQ0E7QUFBREEsQ0FBQ0EsQUFKRCxJQUlDO0FBSFksdUJBQWUsa0JBRzNCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0luamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCAqIGFzIHZpZXdNb2R1bGUgZnJvbSAnLi92aWV3JztcblxuLyoqXG4gKiBMaXN0ZW5lciBmb3IgdmlldyBjcmVhdGlvbiAvIGRlc3RydWN0aW9uLlxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgQXBwVmlld0xpc3RlbmVyIHtcbiAgb25WaWV3Q3JlYXRlZCh2aWV3OiB2aWV3TW9kdWxlLkFwcFZpZXcpIHt9XG4gIG9uVmlld0Rlc3Ryb3llZCh2aWV3OiB2aWV3TW9kdWxlLkFwcFZpZXcpIHt9XG59XG4iXX0=