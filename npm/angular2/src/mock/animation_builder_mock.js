'use strict';"use strict";
var __extends = (this && this.__extends) || function (d, b) {
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
}(animation_builder_1.AnimationBuilder));
exports.MockAnimationBuilder = MockAnimationBuilder;
var MockCssAnimationBuilder = (function (_super) {
    __extends(MockCssAnimationBuilder, _super);
    function MockCssAnimationBuilder() {
        _super.call(this, null);
    }
    MockCssAnimationBuilder.prototype.start = function (element) { return new MockAnimation(element, this.data); };
    return MockCssAnimationBuilder;
}(css_animation_builder_1.CssAnimationBuilder));
var MockBrowserAbstraction = (function (_super) {
    __extends(MockBrowserAbstraction, _super);
    function MockBrowserAbstraction() {
        _super.apply(this, arguments);
    }
    MockBrowserAbstraction.prototype.doesElapsedTimeIncludesDelay = function () { this.elapsedTimeIncludesDelay = false; };
    return MockBrowserAbstraction;
}(browser_details_1.BrowserDetails));
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
}(animation_1.Animation));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uX2J1aWxkZXJfbW9jay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtcjVQckpLOWgudG1wL2FuZ3VsYXIyL3NyYy9tb2NrL2FuaW1hdGlvbl9idWlsZGVyX21vY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsbUJBQXlCLHNCQUFzQixDQUFDLENBQUE7QUFDaEQsa0NBQStCLHdDQUF3QyxDQUFDLENBQUE7QUFDeEUsc0NBQWtDLDRDQUE0QyxDQUFDLENBQUE7QUFFL0UsMEJBQXdCLGdDQUFnQyxDQUFDLENBQUE7QUFDekQsZ0NBQTZCLHNDQUFzQyxDQUFDLENBQUE7QUFHcEU7SUFBMEMsd0NBQWdCO0lBQ3hEO1FBQWdCLGtCQUFNLElBQUksQ0FBQyxDQUFDO0lBQUMsQ0FBQztJQUM5QixrQ0FBRyxHQUFILGNBQTZCLE1BQU0sQ0FBQyxJQUFJLHVCQUF1QixFQUFFLENBQUMsQ0FBQyxDQUFDO0lBSHRFO1FBQUMsZUFBVSxFQUFFOzs0QkFBQTtJQUliLDJCQUFDO0FBQUQsQ0FBQyxBQUhELENBQTBDLG9DQUFnQixHQUd6RDtBQUhZLDRCQUFvQix1QkFHaEMsQ0FBQTtBQUVEO0lBQXNDLDJDQUFtQjtJQUN2RDtRQUFnQixrQkFBTSxJQUFJLENBQUMsQ0FBQztJQUFDLENBQUM7SUFDOUIsdUNBQUssR0FBTCxVQUFNLE9BQW9CLElBQWUsTUFBTSxDQUFDLElBQUksYUFBYSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzFGLDhCQUFDO0FBQUQsQ0FBQyxBQUhELENBQXNDLDJDQUFtQixHQUd4RDtBQUVEO0lBQXFDLDBDQUFjO0lBQW5EO1FBQXFDLDhCQUFjO0lBRW5ELENBQUM7SUFEQyw2REFBNEIsR0FBNUIsY0FBdUMsSUFBSSxDQUFDLHdCQUF3QixHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDakYsNkJBQUM7QUFBRCxDQUFDLEFBRkQsQ0FBcUMsZ0NBQWMsR0FFbEQ7QUFFRDtJQUE0QixpQ0FBUztJQUVuQyx1QkFBWSxPQUFvQixFQUFFLElBQXlCO1FBQ3pELGtCQUFNLE9BQU8sRUFBRSxJQUFJLEVBQUUsSUFBSSxzQkFBc0IsRUFBRSxDQUFDLENBQUM7SUFDckQsQ0FBQztJQUNELDRCQUFJLEdBQUosVUFBSyxRQUFrQixJQUFJLElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQztJQUN2RCw2QkFBSyxHQUFMO1FBQ0UsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNsQixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztJQUN4QixDQUFDO0lBQ0gsb0JBQUM7QUFBRCxDQUFDLEFBVkQsQ0FBNEIscUJBQVMsR0FVcEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0luamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCB7QW5pbWF0aW9uQnVpbGRlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2FuaW1hdGUvYW5pbWF0aW9uX2J1aWxkZXInO1xuaW1wb3J0IHtDc3NBbmltYXRpb25CdWlsZGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvYW5pbWF0ZS9jc3NfYW5pbWF0aW9uX2J1aWxkZXInO1xuaW1wb3J0IHtDc3NBbmltYXRpb25PcHRpb25zfSBmcm9tICdhbmd1bGFyMi9zcmMvYW5pbWF0ZS9jc3NfYW5pbWF0aW9uX29wdGlvbnMnO1xuaW1wb3J0IHtBbmltYXRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9hbmltYXRlL2FuaW1hdGlvbic7XG5pbXBvcnQge0Jyb3dzZXJEZXRhaWxzfSBmcm9tICdhbmd1bGFyMi9zcmMvYW5pbWF0ZS9icm93c2VyX2RldGFpbHMnO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgTW9ja0FuaW1hdGlvbkJ1aWxkZXIgZXh0ZW5kcyBBbmltYXRpb25CdWlsZGVyIHtcbiAgY29uc3RydWN0b3IoKSB7IHN1cGVyKG51bGwpOyB9XG4gIGNzcygpOiBDc3NBbmltYXRpb25CdWlsZGVyIHsgcmV0dXJuIG5ldyBNb2NrQ3NzQW5pbWF0aW9uQnVpbGRlcigpOyB9XG59XG5cbmNsYXNzIE1vY2tDc3NBbmltYXRpb25CdWlsZGVyIGV4dGVuZHMgQ3NzQW5pbWF0aW9uQnVpbGRlciB7XG4gIGNvbnN0cnVjdG9yKCkgeyBzdXBlcihudWxsKTsgfVxuICBzdGFydChlbGVtZW50OiBIVE1MRWxlbWVudCk6IEFuaW1hdGlvbiB7IHJldHVybiBuZXcgTW9ja0FuaW1hdGlvbihlbGVtZW50LCB0aGlzLmRhdGEpOyB9XG59XG5cbmNsYXNzIE1vY2tCcm93c2VyQWJzdHJhY3Rpb24gZXh0ZW5kcyBCcm93c2VyRGV0YWlscyB7XG4gIGRvZXNFbGFwc2VkVGltZUluY2x1ZGVzRGVsYXkoKTogdm9pZCB7IHRoaXMuZWxhcHNlZFRpbWVJbmNsdWRlc0RlbGF5ID0gZmFsc2U7IH1cbn1cblxuY2xhc3MgTW9ja0FuaW1hdGlvbiBleHRlbmRzIEFuaW1hdGlvbiB7XG4gIHByaXZhdGUgX2NhbGxiYWNrOiBGdW5jdGlvbjtcbiAgY29uc3RydWN0b3IoZWxlbWVudDogSFRNTEVsZW1lbnQsIGRhdGE6IENzc0FuaW1hdGlvbk9wdGlvbnMpIHtcbiAgICBzdXBlcihlbGVtZW50LCBkYXRhLCBuZXcgTW9ja0Jyb3dzZXJBYnN0cmFjdGlvbigpKTtcbiAgfVxuICB3YWl0KGNhbGxiYWNrOiBGdW5jdGlvbikgeyB0aGlzLl9jYWxsYmFjayA9IGNhbGxiYWNrOyB9XG4gIGZsdXNoKCkge1xuICAgIHRoaXMuX2NhbGxiYWNrKDApO1xuICAgIHRoaXMuX2NhbGxiYWNrID0gbnVsbDtcbiAgfVxufVxuIl19