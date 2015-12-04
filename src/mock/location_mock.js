'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var di_1 = require('angular2/src/core/di');
var async_1 = require('angular2/src/facade/async');
var SpyLocation = (function () {
    function SpyLocation() {
        this.urlChanges = [];
        /** @internal */
        this._path = '';
        /** @internal */
        this._query = '';
        /** @internal */
        this._subject = new async_1.EventEmitter();
        /** @internal */
        this._baseHref = '';
        // TODO: remove these once Location is an interface, and can be implemented cleanly
        this.platformStrategy = null;
    }
    SpyLocation.prototype.setInitialPath = function (url) { this._path = url; };
    SpyLocation.prototype.setBaseHref = function (url) { this._baseHref = url; };
    SpyLocation.prototype.path = function () { return this._path; };
    SpyLocation.prototype.simulateUrlPop = function (pathname) { async_1.ObservableWrapper.callEmit(this._subject, { 'url': pathname }); };
    SpyLocation.prototype.prepareExternalUrl = function (url) {
        if (url.length > 0 && !url.startsWith('/')) {
            url = '/' + url;
        }
        return this._baseHref + url;
    };
    SpyLocation.prototype.go = function (path, query) {
        if (query === void 0) { query = ''; }
        path = this.prepareExternalUrl(path);
        if (this._path == path && this._query == query) {
            return;
        }
        this._path = path;
        this._query = query;
        var url = path + (query.length > 0 ? ('?' + query) : '');
        this.urlChanges.push(url);
    };
    SpyLocation.prototype.forward = function () {
        // TODO
    };
    SpyLocation.prototype.back = function () {
        // TODO
    };
    SpyLocation.prototype.subscribe = function (onNext, onThrow, onReturn) {
        if (onThrow === void 0) { onThrow = null; }
        if (onReturn === void 0) { onReturn = null; }
        return async_1.ObservableWrapper.subscribe(this._subject, onNext, onThrow, onReturn);
    };
    SpyLocation.prototype.normalize = function (url) { return null; };
    SpyLocation = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], SpyLocation);
    return SpyLocation;
})();
exports.SpyLocation = SpyLocation;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYXRpb25fbW9jay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9tb2NrL2xvY2F0aW9uX21vY2sudHMiXSwibmFtZXMiOlsiU3B5TG9jYXRpb24iLCJTcHlMb2NhdGlvbi5jb25zdHJ1Y3RvciIsIlNweUxvY2F0aW9uLnNldEluaXRpYWxQYXRoIiwiU3B5TG9jYXRpb24uc2V0QmFzZUhyZWYiLCJTcHlMb2NhdGlvbi5wYXRoIiwiU3B5TG9jYXRpb24uc2ltdWxhdGVVcmxQb3AiLCJTcHlMb2NhdGlvbi5wcmVwYXJlRXh0ZXJuYWxVcmwiLCJTcHlMb2NhdGlvbi5nbyIsIlNweUxvY2F0aW9uLmZvcndhcmQiLCJTcHlMb2NhdGlvbi5iYWNrIiwiU3B5TG9jYXRpb24uc3Vic2NyaWJlIiwiU3B5TG9jYXRpb24ubm9ybWFsaXplIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBLG1CQUF5QixzQkFBc0IsQ0FBQyxDQUFBO0FBQ2hELHNCQUE4QywyQkFBMkIsQ0FBQyxDQUFBO0FBSTFFO0lBQUFBO1FBRUVDLGVBQVVBLEdBQWFBLEVBQUVBLENBQUNBO1FBQzFCQSxnQkFBZ0JBO1FBQ2hCQSxVQUFLQSxHQUFXQSxFQUFFQSxDQUFDQTtRQUNuQkEsZ0JBQWdCQTtRQUNoQkEsV0FBTUEsR0FBV0EsRUFBRUEsQ0FBQ0E7UUFDcEJBLGdCQUFnQkE7UUFDaEJBLGFBQVFBLEdBQXNCQSxJQUFJQSxvQkFBWUEsRUFBRUEsQ0FBQ0E7UUFDakRBLGdCQUFnQkE7UUFDaEJBLGNBQVNBLEdBQVdBLEVBQUVBLENBQUNBO1FBMEN2QkEsbUZBQW1GQTtRQUNuRkEscUJBQWdCQSxHQUFRQSxJQUFJQSxDQUFDQTtJQUUvQkEsQ0FBQ0E7SUEzQ0NELG9DQUFjQSxHQUFkQSxVQUFlQSxHQUFXQSxJQUFJRSxJQUFJQSxDQUFDQSxLQUFLQSxHQUFHQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUVqREYsaUNBQVdBLEdBQVhBLFVBQVlBLEdBQVdBLElBQUlHLElBQUlBLENBQUNBLFNBQVNBLEdBQUdBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBO0lBRWxESCwwQkFBSUEsR0FBSkEsY0FBaUJJLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBO0lBRXJDSixvQ0FBY0EsR0FBZEEsVUFBZUEsUUFBZ0JBLElBQUlLLHlCQUFpQkEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsRUFBRUEsRUFBQ0EsS0FBS0EsRUFBRUEsUUFBUUEsRUFBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFbEdMLHdDQUFrQkEsR0FBbEJBLFVBQW1CQSxHQUFXQTtRQUM1Qk0sRUFBRUEsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsVUFBVUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDM0NBLEdBQUdBLEdBQUdBLEdBQUdBLEdBQUdBLEdBQUdBLENBQUNBO1FBQ2xCQSxDQUFDQTtRQUNEQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxHQUFHQSxHQUFHQSxDQUFDQTtJQUM5QkEsQ0FBQ0E7SUFFRE4sd0JBQUVBLEdBQUZBLFVBQUdBLElBQVlBLEVBQUVBLEtBQWtCQTtRQUFsQk8scUJBQWtCQSxHQUFsQkEsVUFBa0JBO1FBQ2pDQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQSxrQkFBa0JBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ3JDQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxJQUFJQSxJQUFJQSxJQUFJQSxJQUFJQSxDQUFDQSxNQUFNQSxJQUFJQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUMvQ0EsTUFBTUEsQ0FBQ0E7UUFDVEEsQ0FBQ0E7UUFDREEsSUFBSUEsQ0FBQ0EsS0FBS0EsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFDbEJBLElBQUlBLENBQUNBLE1BQU1BLEdBQUdBLEtBQUtBLENBQUNBO1FBRXBCQSxJQUFJQSxHQUFHQSxHQUFHQSxJQUFJQSxHQUFHQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxHQUFHQSxDQUFDQSxHQUFHQSxHQUFHQSxLQUFLQSxDQUFDQSxHQUFHQSxFQUFFQSxDQUFDQSxDQUFDQTtRQUN6REEsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7SUFDNUJBLENBQUNBO0lBRURQLDZCQUFPQSxHQUFQQTtRQUNFUSxPQUFPQTtJQUNUQSxDQUFDQTtJQUVEUiwwQkFBSUEsR0FBSkE7UUFDRVMsT0FBT0E7SUFDVEEsQ0FBQ0E7SUFFRFQsK0JBQVNBLEdBQVRBLFVBQVVBLE1BQTRCQSxFQUFFQSxPQUFvQ0EsRUFDbEVBLFFBQTJCQTtRQURHVSx1QkFBb0NBLEdBQXBDQSxjQUFvQ0E7UUFDbEVBLHdCQUEyQkEsR0FBM0JBLGVBQTJCQTtRQUNuQ0EsTUFBTUEsQ0FBQ0EseUJBQWlCQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxFQUFFQSxNQUFNQSxFQUFFQSxPQUFPQSxFQUFFQSxRQUFRQSxDQUFDQSxDQUFDQTtJQUMvRUEsQ0FBQ0E7SUFJRFYsK0JBQVNBLEdBQVRBLFVBQVVBLEdBQVdBLElBQVlXLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO0lBdERqRFg7UUFBQ0EsZUFBVUEsRUFBRUE7O29CQXVEWkE7SUFBREEsa0JBQUNBO0FBQURBLENBQUNBLEFBdkRELElBdURDO0FBdERZLG1CQUFXLGNBc0R2QixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5pbXBvcnQge0V2ZW50RW1pdHRlciwgT2JzZXJ2YWJsZVdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvYXN5bmMnO1xuaW1wb3J0IHtMaXN0V3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7TG9jYXRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9yb3V0ZXIvbG9jYXRpb24nO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgU3B5TG9jYXRpb24gaW1wbGVtZW50cyBMb2NhdGlvbiB7XG4gIHVybENoYW5nZXM6IHN0cmluZ1tdID0gW107XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3BhdGg6IHN0cmluZyA9ICcnO1xuICAvKiogQGludGVybmFsICovXG4gIF9xdWVyeTogc3RyaW5nID0gJyc7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3N1YmplY3Q6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICAvKiogQGludGVybmFsICovXG4gIF9iYXNlSHJlZjogc3RyaW5nID0gJyc7XG5cbiAgc2V0SW5pdGlhbFBhdGgodXJsOiBzdHJpbmcpIHsgdGhpcy5fcGF0aCA9IHVybDsgfVxuXG4gIHNldEJhc2VIcmVmKHVybDogc3RyaW5nKSB7IHRoaXMuX2Jhc2VIcmVmID0gdXJsOyB9XG5cbiAgcGF0aCgpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy5fcGF0aDsgfVxuXG4gIHNpbXVsYXRlVXJsUG9wKHBhdGhuYW1lOiBzdHJpbmcpIHsgT2JzZXJ2YWJsZVdyYXBwZXIuY2FsbEVtaXQodGhpcy5fc3ViamVjdCwgeyd1cmwnOiBwYXRobmFtZX0pOyB9XG5cbiAgcHJlcGFyZUV4dGVybmFsVXJsKHVybDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBpZiAodXJsLmxlbmd0aCA+IDAgJiYgIXVybC5zdGFydHNXaXRoKCcvJykpIHtcbiAgICAgIHVybCA9ICcvJyArIHVybDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2Jhc2VIcmVmICsgdXJsO1xuICB9XG5cbiAgZ28ocGF0aDogc3RyaW5nLCBxdWVyeTogc3RyaW5nID0gJycpIHtcbiAgICBwYXRoID0gdGhpcy5wcmVwYXJlRXh0ZXJuYWxVcmwocGF0aCk7XG4gICAgaWYgKHRoaXMuX3BhdGggPT0gcGF0aCAmJiB0aGlzLl9xdWVyeSA9PSBxdWVyeSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLl9wYXRoID0gcGF0aDtcbiAgICB0aGlzLl9xdWVyeSA9IHF1ZXJ5O1xuXG4gICAgdmFyIHVybCA9IHBhdGggKyAocXVlcnkubGVuZ3RoID4gMCA/ICgnPycgKyBxdWVyeSkgOiAnJyk7XG4gICAgdGhpcy51cmxDaGFuZ2VzLnB1c2godXJsKTtcbiAgfVxuXG4gIGZvcndhcmQoKSB7XG4gICAgLy8gVE9ET1xuICB9XG5cbiAgYmFjaygpIHtcbiAgICAvLyBUT0RPXG4gIH1cblxuICBzdWJzY3JpYmUob25OZXh0OiAodmFsdWU6IGFueSkgPT4gdm9pZCwgb25UaHJvdzogKGVycm9yOiBhbnkpID0+IHZvaWQgPSBudWxsLFxuICAgICAgICAgICAgb25SZXR1cm46ICgpID0+IHZvaWQgPSBudWxsKTogT2JqZWN0IHtcbiAgICByZXR1cm4gT2JzZXJ2YWJsZVdyYXBwZXIuc3Vic2NyaWJlKHRoaXMuX3N1YmplY3QsIG9uTmV4dCwgb25UaHJvdywgb25SZXR1cm4pO1xuICB9XG5cbiAgLy8gVE9ETzogcmVtb3ZlIHRoZXNlIG9uY2UgTG9jYXRpb24gaXMgYW4gaW50ZXJmYWNlLCBhbmQgY2FuIGJlIGltcGxlbWVudGVkIGNsZWFubHlcbiAgcGxhdGZvcm1TdHJhdGVneTogYW55ID0gbnVsbDtcbiAgbm9ybWFsaXplKHVybDogc3RyaW5nKTogc3RyaW5nIHsgcmV0dXJuIG51bGw7IH1cbn1cbiJdfQ==