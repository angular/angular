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
var animation_builder_1 = require('angular2/src/animate/animation_builder');
var css_animation_builder_1 = require('angular2/src/animate/css_animation_builder');
var animation_1 = require('angular2/src/animate/animation');
var browser_details_1 = require('angular2/src/animate/browser_details');
var MockAnimationBuilder = (function (_super) {
    __extends(MockAnimationBuilder, _super);
    function MockAnimationBuilder() {
        _super.call(this, null);
    }
    MockAnimationBuilder.prototype.css = function () { return new MockCssAnimationBuilder(); };
    MockAnimationBuilder = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], MockAnimationBuilder);
    return MockAnimationBuilder;
})(animation_builder_1.AnimationBuilder);
exports.MockAnimationBuilder = MockAnimationBuilder;
var MockCssAnimationBuilder = (function (_super) {
    __extends(MockCssAnimationBuilder, _super);
    function MockCssAnimationBuilder() {
        _super.call(this, null);
    }
    MockCssAnimationBuilder.prototype.start = function (element) { return new MockAnimation(element, this.data); };
    return MockCssAnimationBuilder;
})(css_animation_builder_1.CssAnimationBuilder);
var MockBrowserAbstraction = (function (_super) {
    __extends(MockBrowserAbstraction, _super);
    function MockBrowserAbstraction() {
        _super.apply(this, arguments);
    }
    MockBrowserAbstraction.prototype.doesElapsedTimeIncludesDelay = function () { this.elapsedTimeIncludesDelay = false; };
    return MockBrowserAbstraction;
})(browser_details_1.BrowserDetails);
var MockAnimation = (function (_super) {
    __extends(MockAnimation, _super);
    function MockAnimation(element, data) {
        _super.call(this, element, data, new MockBrowserAbstraction());
    }
    MockAnimation.prototype.wait = function (callback) { this._callback = callback; };
    MockAnimation.prototype.flush = function () {
        this._callback(0);
        this._callback = null;
    };
    return MockAnimation;
})(animation_1.Animation);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uX2J1aWxkZXJfbW9jay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9tb2NrL2FuaW1hdGlvbl9idWlsZGVyX21vY2sudHMiXSwibmFtZXMiOlsiTW9ja0FuaW1hdGlvbkJ1aWxkZXIiLCJNb2NrQW5pbWF0aW9uQnVpbGRlci5jb25zdHJ1Y3RvciIsIk1vY2tBbmltYXRpb25CdWlsZGVyLmNzcyIsIk1vY2tDc3NBbmltYXRpb25CdWlsZGVyIiwiTW9ja0Nzc0FuaW1hdGlvbkJ1aWxkZXIuY29uc3RydWN0b3IiLCJNb2NrQ3NzQW5pbWF0aW9uQnVpbGRlci5zdGFydCIsIk1vY2tCcm93c2VyQWJzdHJhY3Rpb24iLCJNb2NrQnJvd3NlckFic3RyYWN0aW9uLmNvbnN0cnVjdG9yIiwiTW9ja0Jyb3dzZXJBYnN0cmFjdGlvbi5kb2VzRWxhcHNlZFRpbWVJbmNsdWRlc0RlbGF5IiwiTW9ja0FuaW1hdGlvbiIsIk1vY2tBbmltYXRpb24uY29uc3RydWN0b3IiLCJNb2NrQW5pbWF0aW9uLndhaXQiLCJNb2NrQW5pbWF0aW9uLmZsdXNoIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsbUJBQXlCLHNCQUFzQixDQUFDLENBQUE7QUFDaEQsa0NBQStCLHdDQUF3QyxDQUFDLENBQUE7QUFDeEUsc0NBQWtDLDRDQUE0QyxDQUFDLENBQUE7QUFFL0UsMEJBQXdCLGdDQUFnQyxDQUFDLENBQUE7QUFDekQsZ0NBQTZCLHNDQUFzQyxDQUFDLENBQUE7QUFFcEU7SUFDMENBLHdDQUFnQkE7SUFDeERBO1FBQWdCQyxrQkFBTUEsSUFBSUEsQ0FBQ0EsQ0FBQ0E7SUFBQ0EsQ0FBQ0E7SUFDOUJELGtDQUFHQSxHQUFIQSxjQUE2QkUsTUFBTUEsQ0FBQ0EsSUFBSUEsdUJBQXVCQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUh0RUY7UUFBQ0EsZUFBVUEsRUFBRUE7OzZCQUlaQTtJQUFEQSwyQkFBQ0E7QUFBREEsQ0FBQ0EsQUFKRCxFQUMwQyxvQ0FBZ0IsRUFHekQ7QUFIWSw0QkFBb0IsdUJBR2hDLENBQUE7QUFFRDtJQUFzQ0csMkNBQW1CQTtJQUN2REE7UUFBZ0JDLGtCQUFNQSxJQUFJQSxDQUFDQSxDQUFDQTtJQUFDQSxDQUFDQTtJQUM5QkQsdUNBQUtBLEdBQUxBLFVBQU1BLE9BQW9CQSxJQUFlRSxNQUFNQSxDQUFDQSxJQUFJQSxhQUFhQSxDQUFDQSxPQUFPQSxFQUFFQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUMxRkYsOEJBQUNBO0FBQURBLENBQUNBLEFBSEQsRUFBc0MsMkNBQW1CLEVBR3hEO0FBRUQ7SUFBcUNHLDBDQUFjQTtJQUFuREE7UUFBcUNDLDhCQUFjQTtJQUVuREEsQ0FBQ0E7SUFEQ0QsNkRBQTRCQSxHQUE1QkEsY0FBdUNFLElBQUlBLENBQUNBLHdCQUF3QkEsR0FBR0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDakZGLDZCQUFDQTtBQUFEQSxDQUFDQSxBQUZELEVBQXFDLGdDQUFjLEVBRWxEO0FBRUQ7SUFBNEJHLGlDQUFTQTtJQUVuQ0EsdUJBQVlBLE9BQW9CQSxFQUFFQSxJQUF5QkE7UUFDekRDLGtCQUFNQSxPQUFPQSxFQUFFQSxJQUFJQSxFQUFFQSxJQUFJQSxzQkFBc0JBLEVBQUVBLENBQUNBLENBQUNBO0lBQ3JEQSxDQUFDQTtJQUNERCw0QkFBSUEsR0FBSkEsVUFBS0EsUUFBa0JBLElBQUlFLElBQUlBLENBQUNBLFNBQVNBLEdBQUdBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBO0lBQ3ZERiw2QkFBS0EsR0FBTEE7UUFDRUcsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDbEJBLElBQUlBLENBQUNBLFNBQVNBLEdBQUdBLElBQUlBLENBQUNBO0lBQ3hCQSxDQUFDQTtJQUNISCxvQkFBQ0E7QUFBREEsQ0FBQ0EsQUFWRCxFQUE0QixxQkFBUyxFQVVwQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuaW1wb3J0IHtBbmltYXRpb25CdWlsZGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvYW5pbWF0ZS9hbmltYXRpb25fYnVpbGRlcic7XG5pbXBvcnQge0Nzc0FuaW1hdGlvbkJ1aWxkZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9hbmltYXRlL2Nzc19hbmltYXRpb25fYnVpbGRlcic7XG5pbXBvcnQge0Nzc0FuaW1hdGlvbk9wdGlvbnN9IGZyb20gJ2FuZ3VsYXIyL3NyYy9hbmltYXRlL2Nzc19hbmltYXRpb25fb3B0aW9ucyc7XG5pbXBvcnQge0FuaW1hdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2FuaW1hdGUvYW5pbWF0aW9uJztcbmltcG9ydCB7QnJvd3NlckRldGFpbHN9IGZyb20gJ2FuZ3VsYXIyL3NyYy9hbmltYXRlL2Jyb3dzZXJfZGV0YWlscyc7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBNb2NrQW5pbWF0aW9uQnVpbGRlciBleHRlbmRzIEFuaW1hdGlvbkJ1aWxkZXIge1xuICBjb25zdHJ1Y3RvcigpIHsgc3VwZXIobnVsbCk7IH1cbiAgY3NzKCk6IENzc0FuaW1hdGlvbkJ1aWxkZXIgeyByZXR1cm4gbmV3IE1vY2tDc3NBbmltYXRpb25CdWlsZGVyKCk7IH1cbn1cblxuY2xhc3MgTW9ja0Nzc0FuaW1hdGlvbkJ1aWxkZXIgZXh0ZW5kcyBDc3NBbmltYXRpb25CdWlsZGVyIHtcbiAgY29uc3RydWN0b3IoKSB7IHN1cGVyKG51bGwpOyB9XG4gIHN0YXJ0KGVsZW1lbnQ6IEhUTUxFbGVtZW50KTogQW5pbWF0aW9uIHsgcmV0dXJuIG5ldyBNb2NrQW5pbWF0aW9uKGVsZW1lbnQsIHRoaXMuZGF0YSk7IH1cbn1cblxuY2xhc3MgTW9ja0Jyb3dzZXJBYnN0cmFjdGlvbiBleHRlbmRzIEJyb3dzZXJEZXRhaWxzIHtcbiAgZG9lc0VsYXBzZWRUaW1lSW5jbHVkZXNEZWxheSgpOiB2b2lkIHsgdGhpcy5lbGFwc2VkVGltZUluY2x1ZGVzRGVsYXkgPSBmYWxzZTsgfVxufVxuXG5jbGFzcyBNb2NrQW5pbWF0aW9uIGV4dGVuZHMgQW5pbWF0aW9uIHtcbiAgcHJpdmF0ZSBfY2FsbGJhY2s6IEZ1bmN0aW9uO1xuICBjb25zdHJ1Y3RvcihlbGVtZW50OiBIVE1MRWxlbWVudCwgZGF0YTogQ3NzQW5pbWF0aW9uT3B0aW9ucykge1xuICAgIHN1cGVyKGVsZW1lbnQsIGRhdGEsIG5ldyBNb2NrQnJvd3NlckFic3RyYWN0aW9uKCkpO1xuICB9XG4gIHdhaXQoY2FsbGJhY2s6IEZ1bmN0aW9uKSB7IHRoaXMuX2NhbGxiYWNrID0gY2FsbGJhY2s7IH1cbiAgZmx1c2goKSB7XG4gICAgdGhpcy5fY2FsbGJhY2soMCk7XG4gICAgdGhpcy5fY2FsbGJhY2sgPSBudWxsO1xuICB9XG59XG4iXX0=