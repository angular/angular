var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from 'angular2/src/core/di';
import { AnimationBuilder } from 'angular2/src/animate/animation_builder';
import { CssAnimationBuilder } from 'angular2/src/animate/css_animation_builder';
import { Animation } from 'angular2/src/animate/animation';
import { BrowserDetails } from 'angular2/src/animate/browser_details';
export let MockAnimationBuilder = class MockAnimationBuilder extends AnimationBuilder {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uX2J1aWxkZXJfbW9jay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtZ3RNN1FoRW4udG1wL2FuZ3VsYXIyL3NyYy9tb2NrL2FuaW1hdGlvbl9idWlsZGVyX21vY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O09BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxzQkFBc0I7T0FDeEMsRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLHdDQUF3QztPQUNoRSxFQUFDLG1CQUFtQixFQUFDLE1BQU0sNENBQTRDO09BRXZFLEVBQUMsU0FBUyxFQUFDLE1BQU0sZ0NBQWdDO09BQ2pELEVBQUMsY0FBYyxFQUFDLE1BQU0sc0NBQXNDO0FBR25FLHFFQUEwQyxnQkFBZ0I7SUFDeEQ7UUFBZ0IsTUFBTSxJQUFJLENBQUMsQ0FBQztJQUFDLENBQUM7SUFDOUIsR0FBRyxLQUEwQixNQUFNLENBQUMsSUFBSSx1QkFBdUIsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUN0RSxDQUFDO0FBSkQ7SUFBQyxVQUFVLEVBQUU7O3dCQUFBO0FBTWIsc0NBQXNDLG1CQUFtQjtJQUN2RDtRQUFnQixNQUFNLElBQUksQ0FBQyxDQUFDO0lBQUMsQ0FBQztJQUM5QixLQUFLLENBQUMsT0FBb0IsSUFBZSxNQUFNLENBQUMsSUFBSSxhQUFhLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDMUYsQ0FBQztBQUVELHFDQUFxQyxjQUFjO0lBQ2pELDRCQUE0QixLQUFXLElBQUksQ0FBQyx3QkFBd0IsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDO0FBQ2pGLENBQUM7QUFFRCw0QkFBNEIsU0FBUztJQUVuQyxZQUFZLE9BQW9CLEVBQUUsSUFBeUI7UUFDekQsTUFBTSxPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUksc0JBQXNCLEVBQUUsQ0FBQyxDQUFDO0lBQ3JELENBQUM7SUFDRCxJQUFJLENBQUMsUUFBa0IsSUFBSSxJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUM7SUFDdkQsS0FBSztRQUNILElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7SUFDeEIsQ0FBQztBQUNILENBQUM7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuaW1wb3J0IHtBbmltYXRpb25CdWlsZGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvYW5pbWF0ZS9hbmltYXRpb25fYnVpbGRlcic7XG5pbXBvcnQge0Nzc0FuaW1hdGlvbkJ1aWxkZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9hbmltYXRlL2Nzc19hbmltYXRpb25fYnVpbGRlcic7XG5pbXBvcnQge0Nzc0FuaW1hdGlvbk9wdGlvbnN9IGZyb20gJ2FuZ3VsYXIyL3NyYy9hbmltYXRlL2Nzc19hbmltYXRpb25fb3B0aW9ucyc7XG5pbXBvcnQge0FuaW1hdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2FuaW1hdGUvYW5pbWF0aW9uJztcbmltcG9ydCB7QnJvd3NlckRldGFpbHN9IGZyb20gJ2FuZ3VsYXIyL3NyYy9hbmltYXRlL2Jyb3dzZXJfZGV0YWlscyc7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBNb2NrQW5pbWF0aW9uQnVpbGRlciBleHRlbmRzIEFuaW1hdGlvbkJ1aWxkZXIge1xuICBjb25zdHJ1Y3RvcigpIHsgc3VwZXIobnVsbCk7IH1cbiAgY3NzKCk6IENzc0FuaW1hdGlvbkJ1aWxkZXIgeyByZXR1cm4gbmV3IE1vY2tDc3NBbmltYXRpb25CdWlsZGVyKCk7IH1cbn1cblxuY2xhc3MgTW9ja0Nzc0FuaW1hdGlvbkJ1aWxkZXIgZXh0ZW5kcyBDc3NBbmltYXRpb25CdWlsZGVyIHtcbiAgY29uc3RydWN0b3IoKSB7IHN1cGVyKG51bGwpOyB9XG4gIHN0YXJ0KGVsZW1lbnQ6IEhUTUxFbGVtZW50KTogQW5pbWF0aW9uIHsgcmV0dXJuIG5ldyBNb2NrQW5pbWF0aW9uKGVsZW1lbnQsIHRoaXMuZGF0YSk7IH1cbn1cblxuY2xhc3MgTW9ja0Jyb3dzZXJBYnN0cmFjdGlvbiBleHRlbmRzIEJyb3dzZXJEZXRhaWxzIHtcbiAgZG9lc0VsYXBzZWRUaW1lSW5jbHVkZXNEZWxheSgpOiB2b2lkIHsgdGhpcy5lbGFwc2VkVGltZUluY2x1ZGVzRGVsYXkgPSBmYWxzZTsgfVxufVxuXG5jbGFzcyBNb2NrQW5pbWF0aW9uIGV4dGVuZHMgQW5pbWF0aW9uIHtcbiAgcHJpdmF0ZSBfY2FsbGJhY2s6IEZ1bmN0aW9uO1xuICBjb25zdHJ1Y3RvcihlbGVtZW50OiBIVE1MRWxlbWVudCwgZGF0YTogQ3NzQW5pbWF0aW9uT3B0aW9ucykge1xuICAgIHN1cGVyKGVsZW1lbnQsIGRhdGEsIG5ldyBNb2NrQnJvd3NlckFic3RyYWN0aW9uKCkpO1xuICB9XG4gIHdhaXQoY2FsbGJhY2s6IEZ1bmN0aW9uKSB7IHRoaXMuX2NhbGxiYWNrID0gY2FsbGJhY2s7IH1cbiAgZmx1c2goKSB7XG4gICAgdGhpcy5fY2FsbGJhY2soMCk7XG4gICAgdGhpcy5fY2FsbGJhY2sgPSBudWxsO1xuICB9XG59XG4iXX0=