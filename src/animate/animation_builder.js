'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var di_1 = require('angular2/src/core/di');
var css_animation_builder_1 = require('./css_animation_builder');
var browser_details_1 = require('./browser_details');
var AnimationBuilder = (function () {
    /**
     * Used for DI
     * @param browserDetails
     */
    function AnimationBuilder(browserDetails) {
        this.browserDetails = browserDetails;
    }
    /**
     * Creates a new CSS Animation
     * @returns {CssAnimationBuilder}
     */
    AnimationBuilder.prototype.css = function () { return new css_animation_builder_1.CssAnimationBuilder(this.browserDetails); };
    AnimationBuilder = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [browser_details_1.BrowserDetails])
    ], AnimationBuilder);
    return AnimationBuilder;
})();
exports.AnimationBuilder = AnimationBuilder;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uX2J1aWxkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvYW5pbWF0ZS9hbmltYXRpb25fYnVpbGRlci50cyJdLCJuYW1lcyI6WyJBbmltYXRpb25CdWlsZGVyIiwiQW5pbWF0aW9uQnVpbGRlci5jb25zdHJ1Y3RvciIsIkFuaW1hdGlvbkJ1aWxkZXIuY3NzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQSxtQkFBeUIsc0JBQXNCLENBQUMsQ0FBQTtBQUVoRCxzQ0FBa0MseUJBQXlCLENBQUMsQ0FBQTtBQUM1RCxnQ0FBNkIsbUJBQW1CLENBQUMsQ0FBQTtBQUVqRDtJQUVFQTs7O09BR0dBO0lBQ0hBLDBCQUFtQkEsY0FBOEJBO1FBQTlCQyxtQkFBY0EsR0FBZEEsY0FBY0EsQ0FBZ0JBO0lBQUdBLENBQUNBO0lBRXJERDs7O09BR0dBO0lBQ0hBLDhCQUFHQSxHQUFIQSxjQUE2QkUsTUFBTUEsQ0FBQ0EsSUFBSUEsMkNBQW1CQSxDQUFDQSxJQUFJQSxDQUFDQSxjQUFjQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQVpyRkY7UUFBQ0EsZUFBVUEsRUFBRUE7O3lCQWFaQTtJQUFEQSx1QkFBQ0E7QUFBREEsQ0FBQ0EsQUFiRCxJQWFDO0FBWlksd0JBQWdCLG1CQVk1QixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5cbmltcG9ydCB7Q3NzQW5pbWF0aW9uQnVpbGRlcn0gZnJvbSAnLi9jc3NfYW5pbWF0aW9uX2J1aWxkZXInO1xuaW1wb3J0IHtCcm93c2VyRGV0YWlsc30gZnJvbSAnLi9icm93c2VyX2RldGFpbHMnO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgQW5pbWF0aW9uQnVpbGRlciB7XG4gIC8qKlxuICAgKiBVc2VkIGZvciBESVxuICAgKiBAcGFyYW0gYnJvd3NlckRldGFpbHNcbiAgICovXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBicm93c2VyRGV0YWlsczogQnJvd3NlckRldGFpbHMpIHt9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgQ1NTIEFuaW1hdGlvblxuICAgKiBAcmV0dXJucyB7Q3NzQW5pbWF0aW9uQnVpbGRlcn1cbiAgICovXG4gIGNzcygpOiBDc3NBbmltYXRpb25CdWlsZGVyIHsgcmV0dXJuIG5ldyBDc3NBbmltYXRpb25CdWlsZGVyKHRoaXMuYnJvd3NlckRldGFpbHMpOyB9XG59XG4iXX0=