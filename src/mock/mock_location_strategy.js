'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var di_1 = require('angular2/src/core/di');
var async_1 = require('angular2/src/facade/async');
var location_strategy_1 = require('angular2/src/router/location_strategy');
var MockLocationStrategy = (function (_super) {
    __extends(MockLocationStrategy, _super);
    function MockLocationStrategy() {
        _super.call(this);
        this.internalBaseHref = '/';
        this.internalPath = '/';
        this.internalTitle = '';
        this.urlChanges = [];
        /** @internal */
        this._subject = new async_1.EventEmitter();
    }
    MockLocationStrategy.prototype.simulatePopState = function (url) {
        this.internalPath = url;
        async_1.ObservableWrapper.callEmit(this._subject, new MockPopStateEvent(this.path()));
    };
    MockLocationStrategy.prototype.path = function () { return this.internalPath; };
    MockLocationStrategy.prototype.prepareExternalUrl = function (internal) {
        if (internal.startsWith('/') && this.internalBaseHref.endsWith('/')) {
            return this.internalBaseHref + internal.substring(1);
        }
        return this.internalBaseHref + internal;
    };
    MockLocationStrategy.prototype.pushState = function (ctx, title, path, query) {
        this.internalTitle = title;
        var url = path + (query.length > 0 ? ('?' + query) : '');
        this.internalPath = url;
        var externalUrl = this.prepareExternalUrl(url);
        this.urlChanges.push(externalUrl);
    };
    MockLocationStrategy.prototype.replaceState = function (ctx, title, path, query) {
        this.internalTitle = title;
        var url = path + (query.length > 0 ? ('?' + query) : '');
        this.internalPath = url;
        var externalUrl = this.prepareExternalUrl(url);
        this.urlChanges.push('replace: ' + externalUrl);
    };
    MockLocationStrategy.prototype.onPopState = function (fn) { async_1.ObservableWrapper.subscribe(this._subject, fn); };
    MockLocationStrategy.prototype.getBaseHref = function () { return this.internalBaseHref; };
    MockLocationStrategy.prototype.back = function () {
        if (this.urlChanges.length > 0) {
            this.urlChanges.pop();
            var nextUrl = this.urlChanges.length > 0 ? this.urlChanges[this.urlChanges.length - 1] : '';
            this.simulatePopState(nextUrl);
        }
    };
    MockLocationStrategy.prototype.forward = function () { throw 'not implemented'; };
    MockLocationStrategy = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], MockLocationStrategy);
    return MockLocationStrategy;
})(location_strategy_1.LocationStrategy);
exports.MockLocationStrategy = MockLocationStrategy;
var MockPopStateEvent = (function () {
    function MockPopStateEvent(newUrl) {
        this.newUrl = newUrl;
        this.pop = true;
        this.type = 'popstate';
    }
    return MockPopStateEvent;
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9ja19sb2NhdGlvbl9zdHJhdGVneS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9tb2NrL21vY2tfbG9jYXRpb25fc3RyYXRlZ3kudHMiXSwibmFtZXMiOlsiTW9ja0xvY2F0aW9uU3RyYXRlZ3kiLCJNb2NrTG9jYXRpb25TdHJhdGVneS5jb25zdHJ1Y3RvciIsIk1vY2tMb2NhdGlvblN0cmF0ZWd5LnNpbXVsYXRlUG9wU3RhdGUiLCJNb2NrTG9jYXRpb25TdHJhdGVneS5wYXRoIiwiTW9ja0xvY2F0aW9uU3RyYXRlZ3kucHJlcGFyZUV4dGVybmFsVXJsIiwiTW9ja0xvY2F0aW9uU3RyYXRlZ3kucHVzaFN0YXRlIiwiTW9ja0xvY2F0aW9uU3RyYXRlZ3kucmVwbGFjZVN0YXRlIiwiTW9ja0xvY2F0aW9uU3RyYXRlZ3kub25Qb3BTdGF0ZSIsIk1vY2tMb2NhdGlvblN0cmF0ZWd5LmdldEJhc2VIcmVmIiwiTW9ja0xvY2F0aW9uU3RyYXRlZ3kuYmFjayIsIk1vY2tMb2NhdGlvblN0cmF0ZWd5LmZvcndhcmQiLCJNb2NrUG9wU3RhdGVFdmVudCIsIk1vY2tQb3BTdGF0ZUV2ZW50LmNvbnN0cnVjdG9yIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUFBLG1CQUF5QixzQkFBc0IsQ0FBQyxDQUFBO0FBQ2hELHNCQUE4QywyQkFBMkIsQ0FBQyxDQUFBO0FBQzFFLGtDQUErQix1Q0FBdUMsQ0FBQyxDQUFBO0FBR3ZFO0lBQzBDQSx3Q0FBZ0JBO0lBT3hEQTtRQUFnQkMsaUJBQU9BLENBQUNBO1FBTnhCQSxxQkFBZ0JBLEdBQVdBLEdBQUdBLENBQUNBO1FBQy9CQSxpQkFBWUEsR0FBV0EsR0FBR0EsQ0FBQ0E7UUFDM0JBLGtCQUFhQSxHQUFXQSxFQUFFQSxDQUFDQTtRQUMzQkEsZUFBVUEsR0FBYUEsRUFBRUEsQ0FBQ0E7UUFDMUJBLGdCQUFnQkE7UUFDaEJBLGFBQVFBLEdBQXNCQSxJQUFJQSxvQkFBWUEsRUFBRUEsQ0FBQ0E7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Q0FBQ0E7WUFDL0JBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLEdBQUdBLEVBQUVBLENBQUNBO1lBQ3RCQSxJQUFJQSxPQUFPQSxHQUFHQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxFQUFFQSxDQUFDQTtZQUM1RkEsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQTtRQUNqQ0EsQ0FBQ0E7SUFDSEEsQ0FBQ0E7SUFFRFQsc0NBQU9BLEdBQVBBLGNBQWtCVSxNQUFNQSxpQkFBaUJBLENBQUNBLENBQUNBLENBQUNBO0lBeEQ5Q1Y7UUFBQ0EsZUFBVUEsRUFBRUE7OzZCQXlEWkE7SUFBREEsMkJBQUNBO0FBQURBLENBQUNBLEFBekRELEVBQzBDLG9DQUFnQixFQXdEekQ7QUF4RFksNEJBQW9CLHVCQXdEaEMsQ0FBQTtBQUVEO0lBR0VXLDJCQUFtQkEsTUFBY0E7UUFBZEMsV0FBTUEsR0FBTkEsTUFBTUEsQ0FBUUE7UUFGakNBLFFBQUdBLEdBQVlBLElBQUlBLENBQUNBO1FBQ3BCQSxTQUFJQSxHQUFXQSxVQUFVQSxDQUFDQTtJQUNVQSxDQUFDQTtJQUN2Q0Qsd0JBQUNBO0FBQURBLENBQUNBLEFBSkQsSUFJQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuaW1wb3J0IHtFdmVudEVtaXR0ZXIsIE9ic2VydmFibGVXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcbmltcG9ydCB7TG9jYXRpb25TdHJhdGVneX0gZnJvbSAnYW5ndWxhcjIvc3JjL3JvdXRlci9sb2NhdGlvbl9zdHJhdGVneSc7XG5cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIE1vY2tMb2NhdGlvblN0cmF0ZWd5IGV4dGVuZHMgTG9jYXRpb25TdHJhdGVneSB7XG4gIGludGVybmFsQmFzZUhyZWY6IHN0cmluZyA9ICcvJztcbiAgaW50ZXJuYWxQYXRoOiBzdHJpbmcgPSAnLyc7XG4gIGludGVybmFsVGl0bGU6IHN0cmluZyA9ICcnO1xuICB1cmxDaGFuZ2VzOiBzdHJpbmdbXSA9IFtdO1xuICAvKiogQGludGVybmFsICovXG4gIF9zdWJqZWN0OiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgY29uc3RydWN0b3IoKSB7IHN1cGVyKCk7IH1cblxuICBzaW11bGF0ZVBvcFN0YXRlKHVybDogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5pbnRlcm5hbFBhdGggPSB1cmw7XG4gICAgT2JzZXJ2YWJsZVdyYXBwZXIuY2FsbEVtaXQodGhpcy5fc3ViamVjdCwgbmV3IE1vY2tQb3BTdGF0ZUV2ZW50KHRoaXMucGF0aCgpKSk7XG4gIH1cblxuICBwYXRoKCk6IHN0cmluZyB7IHJldHVybiB0aGlzLmludGVybmFsUGF0aDsgfVxuXG4gIHByZXBhcmVFeHRlcm5hbFVybChpbnRlcm5hbDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBpZiAoaW50ZXJuYWwuc3RhcnRzV2l0aCgnLycpICYmIHRoaXMuaW50ZXJuYWxCYXNlSHJlZi5lbmRzV2l0aCgnLycpKSB7XG4gICAgICByZXR1cm4gdGhpcy5pbnRlcm5hbEJhc2VIcmVmICsgaW50ZXJuYWwuc3Vic3RyaW5nKDEpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5pbnRlcm5hbEJhc2VIcmVmICsgaW50ZXJuYWw7XG4gIH1cblxuICBwdXNoU3RhdGUoY3R4OiBhbnksIHRpdGxlOiBzdHJpbmcsIHBhdGg6IHN0cmluZywgcXVlcnk6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuaW50ZXJuYWxUaXRsZSA9IHRpdGxlO1xuXG4gICAgdmFyIHVybCA9IHBhdGggKyAocXVlcnkubGVuZ3RoID4gMCA/ICgnPycgKyBxdWVyeSkgOiAnJyk7XG4gICAgdGhpcy5pbnRlcm5hbFBhdGggPSB1cmw7XG5cbiAgICB2YXIgZXh0ZXJuYWxVcmwgPSB0aGlzLnByZXBhcmVFeHRlcm5hbFVybCh1cmwpO1xuICAgIHRoaXMudXJsQ2hhbmdlcy5wdXNoKGV4dGVybmFsVXJsKTtcbiAgfVxuXG4gIHJlcGxhY2VTdGF0ZShjdHg6IGFueSwgdGl0bGU6IHN0cmluZywgcGF0aDogc3RyaW5nLCBxdWVyeTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5pbnRlcm5hbFRpdGxlID0gdGl0bGU7XG5cbiAgICB2YXIgdXJsID0gcGF0aCArIChxdWVyeS5sZW5ndGggPiAwID8gKCc/JyArIHF1ZXJ5KSA6ICcnKTtcbiAgICB0aGlzLmludGVybmFsUGF0aCA9IHVybDtcblxuICAgIHZhciBleHRlcm5hbFVybCA9IHRoaXMucHJlcGFyZUV4dGVybmFsVXJsKHVybCk7XG4gICAgdGhpcy51cmxDaGFuZ2VzLnB1c2goJ3JlcGxhY2U6ICcgKyBleHRlcm5hbFVybCk7XG4gIH1cblxuICBvblBvcFN0YXRlKGZuOiAodmFsdWU6IGFueSkgPT4gdm9pZCk6IHZvaWQgeyBPYnNlcnZhYmxlV3JhcHBlci5zdWJzY3JpYmUodGhpcy5fc3ViamVjdCwgZm4pOyB9XG5cbiAgZ2V0QmFzZUhyZWYoKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMuaW50ZXJuYWxCYXNlSHJlZjsgfVxuXG4gIGJhY2soKTogdm9pZCB7XG4gICAgaWYgKHRoaXMudXJsQ2hhbmdlcy5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLnVybENoYW5nZXMucG9wKCk7XG4gICAgICB2YXIgbmV4dFVybCA9IHRoaXMudXJsQ2hhbmdlcy5sZW5ndGggPiAwID8gdGhpcy51cmxDaGFuZ2VzW3RoaXMudXJsQ2hhbmdlcy5sZW5ndGggLSAxXSA6ICcnO1xuICAgICAgdGhpcy5zaW11bGF0ZVBvcFN0YXRlKG5leHRVcmwpO1xuICAgIH1cbiAgfVxuXG4gIGZvcndhcmQoKTogdm9pZCB7IHRocm93ICdub3QgaW1wbGVtZW50ZWQnOyB9XG59XG5cbmNsYXNzIE1vY2tQb3BTdGF0ZUV2ZW50IHtcbiAgcG9wOiBib29sZWFuID0gdHJ1ZTtcbiAgdHlwZTogc3RyaW5nID0gJ3BvcHN0YXRlJztcbiAgY29uc3RydWN0b3IocHVibGljIG5ld1VybDogc3RyaW5nKSB7fVxufVxuIl19