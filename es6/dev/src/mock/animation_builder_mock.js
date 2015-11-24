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
import { Injectable } from 'angular2/src/core/di';
import { AnimationBuilder } from 'angular2/src/animate/animation_builder';
import { CssAnimationBuilder } from 'angular2/src/animate/css_animation_builder';
import { Animation } from 'angular2/src/animate/animation';
import { BrowserDetails } from 'angular2/src/animate/browser_details';
export let MockAnimationBuilder = class extends AnimationBuilder {
    constructor() {
        super(null);
    }
    css() { return new MockCssAnimationBuilder(); }
};
MockAnimationBuilder = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [])
], MockAnimationBuilder);
class MockCssAnimationBuilder extends CssAnimationBuilder {
    constructor() {
        super(null);
    }
    start(element) { return new MockAnimation(element, this.data); }
}
class MockBrowserAbstraction extends BrowserDetails {
    doesElapsedTimeIncludesDelay() { this.elapsedTimeIncludesDelay = false; }
}
class MockAnimation extends Animation {
    constructor(element, data) {
        super(element, data, new MockBrowserAbstraction());
    }
    wait(callback) { this._callback = callback; }
    flush() {
        this._callback(0);
        this._callback = null;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uX2J1aWxkZXJfbW9jay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9tb2NrL2FuaW1hdGlvbl9idWlsZGVyX21vY2sudHMiXSwibmFtZXMiOlsiTW9ja0FuaW1hdGlvbkJ1aWxkZXIiLCJNb2NrQW5pbWF0aW9uQnVpbGRlci5jb25zdHJ1Y3RvciIsIk1vY2tBbmltYXRpb25CdWlsZGVyLmNzcyIsIk1vY2tDc3NBbmltYXRpb25CdWlsZGVyIiwiTW9ja0Nzc0FuaW1hdGlvbkJ1aWxkZXIuY29uc3RydWN0b3IiLCJNb2NrQ3NzQW5pbWF0aW9uQnVpbGRlci5zdGFydCIsIk1vY2tCcm93c2VyQWJzdHJhY3Rpb24iLCJNb2NrQnJvd3NlckFic3RyYWN0aW9uLmRvZXNFbGFwc2VkVGltZUluY2x1ZGVzRGVsYXkiLCJNb2NrQW5pbWF0aW9uIiwiTW9ja0FuaW1hdGlvbi5jb25zdHJ1Y3RvciIsIk1vY2tBbmltYXRpb24ud2FpdCIsIk1vY2tBbmltYXRpb24uZmx1c2giXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O09BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxzQkFBc0I7T0FDeEMsRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLHdDQUF3QztPQUNoRSxFQUFDLG1CQUFtQixFQUFDLE1BQU0sNENBQTRDO09BRXZFLEVBQUMsU0FBUyxFQUFDLE1BQU0sZ0NBQWdDO09BQ2pELEVBQUMsY0FBYyxFQUFDLE1BQU0sc0NBQXNDO0FBRW5FLGdEQUMwQyxnQkFBZ0I7SUFDeERBO1FBQWdCQyxNQUFNQSxJQUFJQSxDQUFDQSxDQUFDQTtJQUFDQSxDQUFDQTtJQUM5QkQsR0FBR0EsS0FBMEJFLE1BQU1BLENBQUNBLElBQUlBLHVCQUF1QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7QUFDdEVGLENBQUNBO0FBSkQ7SUFBQyxVQUFVLEVBQUU7O3lCQUlaO0FBRUQsc0NBQXNDLG1CQUFtQjtJQUN2REc7UUFBZ0JDLE1BQU1BLElBQUlBLENBQUNBLENBQUNBO0lBQUNBLENBQUNBO0lBQzlCRCxLQUFLQSxDQUFDQSxPQUFvQkEsSUFBZUUsTUFBTUEsQ0FBQ0EsSUFBSUEsYUFBYUEsQ0FBQ0EsT0FBT0EsRUFBRUEsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7QUFDMUZGLENBQUNBO0FBRUQscUNBQXFDLGNBQWM7SUFDakRHLDRCQUE0QkEsS0FBV0MsSUFBSUEsQ0FBQ0Esd0JBQXdCQSxHQUFHQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQTtBQUNqRkQsQ0FBQ0E7QUFFRCw0QkFBNEIsU0FBUztJQUVuQ0UsWUFBWUEsT0FBb0JBLEVBQUVBLElBQXlCQTtRQUN6REMsTUFBTUEsT0FBT0EsRUFBRUEsSUFBSUEsRUFBRUEsSUFBSUEsc0JBQXNCQSxFQUFFQSxDQUFDQSxDQUFDQTtJQUNyREEsQ0FBQ0E7SUFDREQsSUFBSUEsQ0FBQ0EsUUFBa0JBLElBQUlFLElBQUlBLENBQUNBLFNBQVNBLEdBQUdBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBO0lBQ3ZERixLQUFLQTtRQUNIRyxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNsQkEsSUFBSUEsQ0FBQ0EsU0FBU0EsR0FBR0EsSUFBSUEsQ0FBQ0E7SUFDeEJBLENBQUNBO0FBQ0hILENBQUNBO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0luamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCB7QW5pbWF0aW9uQnVpbGRlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2FuaW1hdGUvYW5pbWF0aW9uX2J1aWxkZXInO1xuaW1wb3J0IHtDc3NBbmltYXRpb25CdWlsZGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvYW5pbWF0ZS9jc3NfYW5pbWF0aW9uX2J1aWxkZXInO1xuaW1wb3J0IHtDc3NBbmltYXRpb25PcHRpb25zfSBmcm9tICdhbmd1bGFyMi9zcmMvYW5pbWF0ZS9jc3NfYW5pbWF0aW9uX29wdGlvbnMnO1xuaW1wb3J0IHtBbmltYXRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9hbmltYXRlL2FuaW1hdGlvbic7XG5pbXBvcnQge0Jyb3dzZXJEZXRhaWxzfSBmcm9tICdhbmd1bGFyMi9zcmMvYW5pbWF0ZS9icm93c2VyX2RldGFpbHMnO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgTW9ja0FuaW1hdGlvbkJ1aWxkZXIgZXh0ZW5kcyBBbmltYXRpb25CdWlsZGVyIHtcbiAgY29uc3RydWN0b3IoKSB7IHN1cGVyKG51bGwpOyB9XG4gIGNzcygpOiBDc3NBbmltYXRpb25CdWlsZGVyIHsgcmV0dXJuIG5ldyBNb2NrQ3NzQW5pbWF0aW9uQnVpbGRlcigpOyB9XG59XG5cbmNsYXNzIE1vY2tDc3NBbmltYXRpb25CdWlsZGVyIGV4dGVuZHMgQ3NzQW5pbWF0aW9uQnVpbGRlciB7XG4gIGNvbnN0cnVjdG9yKCkgeyBzdXBlcihudWxsKTsgfVxuICBzdGFydChlbGVtZW50OiBIVE1MRWxlbWVudCk6IEFuaW1hdGlvbiB7IHJldHVybiBuZXcgTW9ja0FuaW1hdGlvbihlbGVtZW50LCB0aGlzLmRhdGEpOyB9XG59XG5cbmNsYXNzIE1vY2tCcm93c2VyQWJzdHJhY3Rpb24gZXh0ZW5kcyBCcm93c2VyRGV0YWlscyB7XG4gIGRvZXNFbGFwc2VkVGltZUluY2x1ZGVzRGVsYXkoKTogdm9pZCB7IHRoaXMuZWxhcHNlZFRpbWVJbmNsdWRlc0RlbGF5ID0gZmFsc2U7IH1cbn1cblxuY2xhc3MgTW9ja0FuaW1hdGlvbiBleHRlbmRzIEFuaW1hdGlvbiB7XG4gIHByaXZhdGUgX2NhbGxiYWNrOiBGdW5jdGlvbjtcbiAgY29uc3RydWN0b3IoZWxlbWVudDogSFRNTEVsZW1lbnQsIGRhdGE6IENzc0FuaW1hdGlvbk9wdGlvbnMpIHtcbiAgICBzdXBlcihlbGVtZW50LCBkYXRhLCBuZXcgTW9ja0Jyb3dzZXJBYnN0cmFjdGlvbigpKTtcbiAgfVxuICB3YWl0KGNhbGxiYWNrOiBGdW5jdGlvbikgeyB0aGlzLl9jYWxsYmFjayA9IGNhbGxiYWNrOyB9XG4gIGZsdXNoKCkge1xuICAgIHRoaXMuX2NhbGxiYWNrKDApO1xuICAgIHRoaXMuX2NhbGxiYWNrID0gbnVsbDtcbiAgfVxufVxuIl19