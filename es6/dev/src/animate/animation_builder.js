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
import { CssAnimationBuilder } from './css_animation_builder';
import { BrowserDetails } from './browser_details';
export let AnimationBuilder = class {
    /**
     * Used for DI
     * @param browserDetails
     */
    constructor(browserDetails) {
        this.browserDetails = browserDetails;
    }
    /**
     * Creates a new CSS Animation
     * @returns {CssAnimationBuilder}
     */
    css() { return new CssAnimationBuilder(this.browserDetails); }
};
AnimationBuilder = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [BrowserDetails])
], AnimationBuilder);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uX2J1aWxkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvYW5pbWF0ZS9hbmltYXRpb25fYnVpbGRlci50cyJdLCJuYW1lcyI6WyJBbmltYXRpb25CdWlsZGVyIiwiQW5pbWF0aW9uQnVpbGRlci5jb25zdHJ1Y3RvciIsIkFuaW1hdGlvbkJ1aWxkZXIuY3NzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sc0JBQXNCO09BRXhDLEVBQUMsbUJBQW1CLEVBQUMsTUFBTSx5QkFBeUI7T0FDcEQsRUFBQyxjQUFjLEVBQUMsTUFBTSxtQkFBbUI7QUFFaEQ7SUFFRUE7OztPQUdHQTtJQUNIQSxZQUFtQkEsY0FBOEJBO1FBQTlCQyxtQkFBY0EsR0FBZEEsY0FBY0EsQ0FBZ0JBO0lBQUdBLENBQUNBO0lBRXJERDs7O09BR0dBO0lBQ0hBLEdBQUdBLEtBQTBCRSxNQUFNQSxDQUFDQSxJQUFJQSxtQkFBbUJBLENBQUNBLElBQUlBLENBQUNBLGNBQWNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0FBQ3JGRixDQUFDQTtBQWJEO0lBQUMsVUFBVSxFQUFFOztxQkFhWjtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5cbmltcG9ydCB7Q3NzQW5pbWF0aW9uQnVpbGRlcn0gZnJvbSAnLi9jc3NfYW5pbWF0aW9uX2J1aWxkZXInO1xuaW1wb3J0IHtCcm93c2VyRGV0YWlsc30gZnJvbSAnLi9icm93c2VyX2RldGFpbHMnO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgQW5pbWF0aW9uQnVpbGRlciB7XG4gIC8qKlxuICAgKiBVc2VkIGZvciBESVxuICAgKiBAcGFyYW0gYnJvd3NlckRldGFpbHNcbiAgICovXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBicm93c2VyRGV0YWlsczogQnJvd3NlckRldGFpbHMpIHt9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgQ1NTIEFuaW1hdGlvblxuICAgKiBAcmV0dXJucyB7Q3NzQW5pbWF0aW9uQnVpbGRlcn1cbiAgICovXG4gIGNzcygpOiBDc3NBbmltYXRpb25CdWlsZGVyIHsgcmV0dXJuIG5ldyBDc3NBbmltYXRpb25CdWlsZGVyKHRoaXMuYnJvd3NlckRldGFpbHMpOyB9XG59XG4iXX0=