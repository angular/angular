'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
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
        async_1.ObservableWrapper.callEmit(this._subject, null);
    };
    MockLocationStrategy.prototype.path = function () { return this.internalPath; };
    MockLocationStrategy.prototype.prepareExternalUrl = function (internal) {
        if (internal.startsWith('/') && this.internalBaseHref.endsWith('/')) {
            return this.internalBaseHref + internal.substring(1);
        }
        return this.internalBaseHref + internal;
    };
    MockLocationStrategy.prototype.simulateUrlPop = function (pathname) {
        async_1.ObservableWrapper.callEmit(this._subject, { 'url': pathname });
    };
    MockLocationStrategy.prototype.pushState = function (ctx, title, path, query) {
        this.internalTitle = title;
        var url = path + (query.length > 0 ? ('?' + query) : '');
        this.internalPath = url;
        var externalUrl = this.prepareExternalUrl(url);
        this.urlChanges.push(externalUrl);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9ja19sb2NhdGlvbl9zdHJhdGVneS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9tb2NrL21vY2tfbG9jYXRpb25fc3RyYXRlZ3kudHMiXSwibmFtZXMiOlsiTW9ja0xvY2F0aW9uU3RyYXRlZ3kiLCJNb2NrTG9jYXRpb25TdHJhdGVneS5jb25zdHJ1Y3RvciIsIk1vY2tMb2NhdGlvblN0cmF0ZWd5LnNpbXVsYXRlUG9wU3RhdGUiLCJNb2NrTG9jYXRpb25TdHJhdGVneS5wYXRoIiwiTW9ja0xvY2F0aW9uU3RyYXRlZ3kucHJlcGFyZUV4dGVybmFsVXJsIiwiTW9ja0xvY2F0aW9uU3RyYXRlZ3kuc2ltdWxhdGVVcmxQb3AiLCJNb2NrTG9jYXRpb25TdHJhdGVneS5wdXNoU3RhdGUiLCJNb2NrTG9jYXRpb25TdHJhdGVneS5vblBvcFN0YXRlIiwiTW9ja0xvY2F0aW9uU3RyYXRlZ3kuZ2V0QmFzZUhyZWYiLCJNb2NrTG9jYXRpb25TdHJhdGVneS5iYWNrIiwiTW9ja0xvY2F0aW9uU3RyYXRlZ3kuZm9yd2FyZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLG1CQUF5QixzQkFBc0IsQ0FBQyxDQUFBO0FBQ2hELHNCQUE4QywyQkFBMkIsQ0FBQyxDQUFBO0FBQzFFLGtDQUErQix1Q0FBdUMsQ0FBQyxDQUFBO0FBR3ZFO0lBQzBDQSx3Q0FBZ0JBO0lBT3hEQTtRQUFnQkMsaUJBQU9BLENBQUNBO1FBTnhCQSxxQkFBZ0JBLEdBQVdBLEdBQUdBLENBQUNBO1FBQy9CQSxpQkFBWUEsR0FBV0EsR0FBR0EsQ0FBQ0E7UUFDM0JBLGtCQUFhQSxHQUFXQSxFQUFFQSxDQUFDQTtRQUMzQkEsZUFBVUEsR0FBYUEsRUFBRUEsQ0FBQ0E7UUFDMUJBLGdCQUFnQkE7UUFDaEJBLGFBQVFBLEdBQXNCQSxJQUFJQSxvQkFBWUEsRUFBRUEsQ0FBQ0E7SUFDeEJBLENBQUNBO0lBRTFCRCwrQ0FBZ0JBLEdBQWhCQSxVQUFpQkEsR0FBV0E7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QURBLDJCQUFDQTtBQUFEQSxDQUFDQSxBQW5ERCxFQUMwQyxvQ0FBZ0IsRUFrRHpEO0FBbERZLDRCQUFvQix1QkFrRGhDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0luamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCB7RXZlbnRFbWl0dGVyLCBPYnNlcnZhYmxlV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5pbXBvcnQge0xvY2F0aW9uU3RyYXRlZ3l9IGZyb20gJ2FuZ3VsYXIyL3NyYy9yb3V0ZXIvbG9jYXRpb25fc3RyYXRlZ3knO1xuXG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBNb2NrTG9jYXRpb25TdHJhdGVneSBleHRlbmRzIExvY2F0aW9uU3RyYXRlZ3kge1xuICBpbnRlcm5hbEJhc2VIcmVmOiBzdHJpbmcgPSAnLyc7XG4gIGludGVybmFsUGF0aDogc3RyaW5nID0gJy8nO1xuICBpbnRlcm5hbFRpdGxlOiBzdHJpbmcgPSAnJztcbiAgdXJsQ2hhbmdlczogc3RyaW5nW10gPSBbXTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfc3ViamVjdDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gIGNvbnN0cnVjdG9yKCkgeyBzdXBlcigpOyB9XG5cbiAgc2ltdWxhdGVQb3BTdGF0ZSh1cmw6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuaW50ZXJuYWxQYXRoID0gdXJsO1xuICAgIE9ic2VydmFibGVXcmFwcGVyLmNhbGxFbWl0KHRoaXMuX3N1YmplY3QsIG51bGwpO1xuICB9XG5cbiAgcGF0aCgpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy5pbnRlcm5hbFBhdGg7IH1cblxuICBwcmVwYXJlRXh0ZXJuYWxVcmwoaW50ZXJuYWw6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgaWYgKGludGVybmFsLnN0YXJ0c1dpdGgoJy8nKSAmJiB0aGlzLmludGVybmFsQmFzZUhyZWYuZW5kc1dpdGgoJy8nKSkge1xuICAgICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxCYXNlSHJlZiArIGludGVybmFsLnN1YnN0cmluZygxKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuaW50ZXJuYWxCYXNlSHJlZiArIGludGVybmFsO1xuICB9XG5cbiAgc2ltdWxhdGVVcmxQb3AocGF0aG5hbWU6IHN0cmluZyk6IHZvaWQge1xuICAgIE9ic2VydmFibGVXcmFwcGVyLmNhbGxFbWl0KHRoaXMuX3N1YmplY3QsIHsndXJsJzogcGF0aG5hbWV9KTtcbiAgfVxuXG4gIHB1c2hTdGF0ZShjdHg6IGFueSwgdGl0bGU6IHN0cmluZywgcGF0aDogc3RyaW5nLCBxdWVyeTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5pbnRlcm5hbFRpdGxlID0gdGl0bGU7XG5cbiAgICB2YXIgdXJsID0gcGF0aCArIChxdWVyeS5sZW5ndGggPiAwID8gKCc/JyArIHF1ZXJ5KSA6ICcnKTtcbiAgICB0aGlzLmludGVybmFsUGF0aCA9IHVybDtcblxuICAgIHZhciBleHRlcm5hbFVybCA9IHRoaXMucHJlcGFyZUV4dGVybmFsVXJsKHVybCk7XG4gICAgdGhpcy51cmxDaGFuZ2VzLnB1c2goZXh0ZXJuYWxVcmwpO1xuICB9XG5cbiAgb25Qb3BTdGF0ZShmbjogKHZhbHVlOiBhbnkpID0+IHZvaWQpOiB2b2lkIHsgT2JzZXJ2YWJsZVdyYXBwZXIuc3Vic2NyaWJlKHRoaXMuX3N1YmplY3QsIGZuKTsgfVxuXG4gIGdldEJhc2VIcmVmKCk6IHN0cmluZyB7IHJldHVybiB0aGlzLmludGVybmFsQmFzZUhyZWY7IH1cblxuICBiYWNrKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLnVybENoYW5nZXMubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy51cmxDaGFuZ2VzLnBvcCgpO1xuICAgICAgdmFyIG5leHRVcmwgPSB0aGlzLnVybENoYW5nZXMubGVuZ3RoID4gMCA/IHRoaXMudXJsQ2hhbmdlc1t0aGlzLnVybENoYW5nZXMubGVuZ3RoIC0gMV0gOiAnJztcbiAgICAgIHRoaXMuc2ltdWxhdGVQb3BTdGF0ZShuZXh0VXJsKTtcbiAgICB9XG4gIH1cblxuICBmb3J3YXJkKCk6IHZvaWQgeyB0aHJvdyAnbm90IGltcGxlbWVudGVkJzsgfVxufVxuIl19