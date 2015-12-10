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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uX2J1aWxkZXJfbW9jay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9tb2NrL2FuaW1hdGlvbl9idWlsZGVyX21vY2sudHMiXSwibmFtZXMiOlsiTW9ja0FuaW1hdGlvbkJ1aWxkZXIiLCJNb2NrQW5pbWF0aW9uQnVpbGRlci5jb25zdHJ1Y3RvciIsIk1vY2tBbmltYXRpb25CdWlsZGVyLmNzcyIsIk1vY2tDc3NBbmltYXRpb25CdWlsZGVyIiwiTW9ja0Nzc0FuaW1hdGlvbkJ1aWxkZXIuY29uc3RydWN0b3IiLCJNb2NrQ3NzQW5pbWF0aW9uQnVpbGRlci5zdGFydCIsIk1vY2tCcm93c2VyQWJzdHJhY3Rpb24iLCJNb2NrQnJvd3NlckFic3RyYWN0aW9uLmRvZXNFbGFwc2VkVGltZUluY2x1ZGVzRGVsYXkiLCJNb2NrQW5pbWF0aW9uIiwiTW9ja0FuaW1hdGlvbi5jb25zdHJ1Y3RvciIsIk1vY2tBbmltYXRpb24ud2FpdCIsIk1vY2tBbmltYXRpb24uZmx1c2giXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sc0JBQXNCO09BQ3hDLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSx3Q0FBd0M7T0FDaEUsRUFBQyxtQkFBbUIsRUFBQyxNQUFNLDRDQUE0QztPQUV2RSxFQUFDLFNBQVMsRUFBQyxNQUFNLGdDQUFnQztPQUNqRCxFQUFDLGNBQWMsRUFBQyxNQUFNLHNDQUFzQztBQUVuRSxnREFDMEMsZ0JBQWdCO0lBQ3hEQTtRQUFnQkMsTUFBTUEsSUFBSUEsQ0FBQ0EsQ0FBQ0E7SUFBQ0EsQ0FBQ0E7SUFDOUJELEdBQUdBLEtBQTBCRSxNQUFNQSxDQUFDQSxJQUFJQSx1QkFBdUJBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO0FBQ3RFRixDQUFDQTtBQUpEO0lBQUMsVUFBVSxFQUFFOzt5QkFJWjtBQUVELHNDQUFzQyxtQkFBbUI7SUFDdkRHO1FBQWdCQyxNQUFNQSxJQUFJQSxDQUFDQSxDQUFDQTtJQUFDQSxDQUFDQTtJQUM5QkQsS0FBS0EsQ0FBQ0EsT0FBb0JBLElBQWVFLE1BQU1BLENBQUNBLElBQUlBLGFBQWFBLENBQUNBLE9BQU9BLEVBQUVBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0FBQzFGRixDQUFDQTtBQUVELHFDQUFxQyxjQUFjO0lBQ2pERyw0QkFBNEJBLEtBQVdDLElBQUlBLENBQUNBLHdCQUF3QkEsR0FBR0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7QUFDakZELENBQUNBO0FBRUQsNEJBQTRCLFNBQVM7SUFFbkNFLFlBQVlBLE9BQW9CQSxFQUFFQSxJQUF5QkE7UUFDekRDLE1BQU1BLE9BQU9BLEVBQUVBLElBQUlBLEVBQUVBLElBQUlBLHNCQUFzQkEsRUFBRUEsQ0FBQ0EsQ0FBQ0E7SUFDckRBLENBQUNBO0lBQ0RELElBQUlBLENBQUNBLFFBQWtCQSxJQUFJRSxJQUFJQSxDQUFDQSxTQUFTQSxHQUFHQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUN2REYsS0FBS0E7UUFDSEcsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDbEJBLElBQUlBLENBQUNBLFNBQVNBLEdBQUdBLElBQUlBLENBQUNBO0lBQ3hCQSxDQUFDQTtBQUNISCxDQUFDQTtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5pbXBvcnQge0FuaW1hdGlvbkJ1aWxkZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9hbmltYXRlL2FuaW1hdGlvbl9idWlsZGVyJztcbmltcG9ydCB7Q3NzQW5pbWF0aW9uQnVpbGRlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2FuaW1hdGUvY3NzX2FuaW1hdGlvbl9idWlsZGVyJztcbmltcG9ydCB7Q3NzQW5pbWF0aW9uT3B0aW9uc30gZnJvbSAnYW5ndWxhcjIvc3JjL2FuaW1hdGUvY3NzX2FuaW1hdGlvbl9vcHRpb25zJztcbmltcG9ydCB7QW5pbWF0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvYW5pbWF0ZS9hbmltYXRpb24nO1xuaW1wb3J0IHtCcm93c2VyRGV0YWlsc30gZnJvbSAnYW5ndWxhcjIvc3JjL2FuaW1hdGUvYnJvd3Nlcl9kZXRhaWxzJztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIE1vY2tBbmltYXRpb25CdWlsZGVyIGV4dGVuZHMgQW5pbWF0aW9uQnVpbGRlciB7XG4gIGNvbnN0cnVjdG9yKCkgeyBzdXBlcihudWxsKTsgfVxuICBjc3MoKTogQ3NzQW5pbWF0aW9uQnVpbGRlciB7IHJldHVybiBuZXcgTW9ja0Nzc0FuaW1hdGlvbkJ1aWxkZXIoKTsgfVxufVxuXG5jbGFzcyBNb2NrQ3NzQW5pbWF0aW9uQnVpbGRlciBleHRlbmRzIENzc0FuaW1hdGlvbkJ1aWxkZXIge1xuICBjb25zdHJ1Y3RvcigpIHsgc3VwZXIobnVsbCk7IH1cbiAgc3RhcnQoZWxlbWVudDogSFRNTEVsZW1lbnQpOiBBbmltYXRpb24geyByZXR1cm4gbmV3IE1vY2tBbmltYXRpb24oZWxlbWVudCwgdGhpcy5kYXRhKTsgfVxufVxuXG5jbGFzcyBNb2NrQnJvd3NlckFic3RyYWN0aW9uIGV4dGVuZHMgQnJvd3NlckRldGFpbHMge1xuICBkb2VzRWxhcHNlZFRpbWVJbmNsdWRlc0RlbGF5KCk6IHZvaWQgeyB0aGlzLmVsYXBzZWRUaW1lSW5jbHVkZXNEZWxheSA9IGZhbHNlOyB9XG59XG5cbmNsYXNzIE1vY2tBbmltYXRpb24gZXh0ZW5kcyBBbmltYXRpb24ge1xuICBwcml2YXRlIF9jYWxsYmFjazogRnVuY3Rpb247XG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBkYXRhOiBDc3NBbmltYXRpb25PcHRpb25zKSB7XG4gICAgc3VwZXIoZWxlbWVudCwgZGF0YSwgbmV3IE1vY2tCcm93c2VyQWJzdHJhY3Rpb24oKSk7XG4gIH1cbiAgd2FpdChjYWxsYmFjazogRnVuY3Rpb24pIHsgdGhpcy5fY2FsbGJhY2sgPSBjYWxsYmFjazsgfVxuICBmbHVzaCgpIHtcbiAgICB0aGlzLl9jYWxsYmFjaygwKTtcbiAgICB0aGlzLl9jYWxsYmFjayA9IG51bGw7XG4gIH1cbn1cbiJdfQ==