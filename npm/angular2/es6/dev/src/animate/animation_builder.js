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
import { CssAnimationBuilder } from './css_animation_builder';
import { BrowserDetails } from './browser_details';
export let AnimationBuilder = class AnimationBuilder {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uX2J1aWxkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLWd0TTdRaEVuLnRtcC9hbmd1bGFyMi9zcmMvYW5pbWF0ZS9hbmltYXRpb25fYnVpbGRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7T0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLHNCQUFzQjtPQUV4QyxFQUFDLG1CQUFtQixFQUFDLE1BQU0seUJBQXlCO09BQ3BELEVBQUMsY0FBYyxFQUFDLE1BQU0sbUJBQW1CO0FBR2hEO0lBQ0U7OztPQUdHO0lBQ0gsWUFBbUIsY0FBOEI7UUFBOUIsbUJBQWMsR0FBZCxjQUFjLENBQWdCO0lBQUcsQ0FBQztJQUVyRDs7O09BR0c7SUFDSCxHQUFHLEtBQTBCLE1BQU0sQ0FBQyxJQUFJLG1CQUFtQixDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDckYsQ0FBQztBQWJEO0lBQUMsVUFBVSxFQUFFOztvQkFBQTtBQWFaIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5cbmltcG9ydCB7Q3NzQW5pbWF0aW9uQnVpbGRlcn0gZnJvbSAnLi9jc3NfYW5pbWF0aW9uX2J1aWxkZXInO1xuaW1wb3J0IHtCcm93c2VyRGV0YWlsc30gZnJvbSAnLi9icm93c2VyX2RldGFpbHMnO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgQW5pbWF0aW9uQnVpbGRlciB7XG4gIC8qKlxuICAgKiBVc2VkIGZvciBESVxuICAgKiBAcGFyYW0gYnJvd3NlckRldGFpbHNcbiAgICovXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBicm93c2VyRGV0YWlsczogQnJvd3NlckRldGFpbHMpIHt9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgQ1NTIEFuaW1hdGlvblxuICAgKiBAcmV0dXJucyB7Q3NzQW5pbWF0aW9uQnVpbGRlcn1cbiAgICovXG4gIGNzcygpOiBDc3NBbmltYXRpb25CdWlsZGVyIHsgcmV0dXJuIG5ldyBDc3NBbmltYXRpb25CdWlsZGVyKHRoaXMuYnJvd3NlckRldGFpbHMpOyB9XG59XG4iXX0=