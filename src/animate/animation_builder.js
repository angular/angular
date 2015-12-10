'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uX2J1aWxkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvYW5pbWF0ZS9hbmltYXRpb25fYnVpbGRlci50cyJdLCJuYW1lcyI6WyJBbmltYXRpb25CdWlsZGVyIiwiQW5pbWF0aW9uQnVpbGRlci5jb25zdHJ1Y3RvciIsIkFuaW1hdGlvbkJ1aWxkZXIuY3NzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBLG1CQUF5QixzQkFBc0IsQ0FBQyxDQUFBO0FBRWhELHNDQUFrQyx5QkFBeUIsQ0FBQyxDQUFBO0FBQzVELGdDQUE2QixtQkFBbUIsQ0FBQyxDQUFBO0FBRWpEO0lBRUVBOzs7T0FHR0E7SUFDSEEsMEJBQW1CQSxjQUE4QkE7UUFBOUJDLG1CQUFjQSxHQUFkQSxjQUFjQSxDQUFnQkE7SUFBR0EsQ0FBQ0E7SUFFckREOzs7T0FHR0E7SUFDSEEsOEJBQUdBLEdBQUhBLGNBQTZCRSxNQUFNQSxDQUFDQSxJQUFJQSwyQ0FBbUJBLENBQUNBLElBQUlBLENBQUNBLGNBQWNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBWnJGRjtRQUFDQSxlQUFVQSxFQUFFQTs7eUJBYVpBO0lBQURBLHVCQUFDQTtBQUFEQSxDQUFDQSxBQWJELElBYUM7QUFaWSx3QkFBZ0IsbUJBWTVCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0luamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcblxuaW1wb3J0IHtDc3NBbmltYXRpb25CdWlsZGVyfSBmcm9tICcuL2Nzc19hbmltYXRpb25fYnVpbGRlcic7XG5pbXBvcnQge0Jyb3dzZXJEZXRhaWxzfSBmcm9tICcuL2Jyb3dzZXJfZGV0YWlscyc7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBBbmltYXRpb25CdWlsZGVyIHtcbiAgLyoqXG4gICAqIFVzZWQgZm9yIERJXG4gICAqIEBwYXJhbSBicm93c2VyRGV0YWlsc1xuICAgKi9cbiAgY29uc3RydWN0b3IocHVibGljIGJyb3dzZXJEZXRhaWxzOiBCcm93c2VyRGV0YWlscykge31cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBDU1MgQW5pbWF0aW9uXG4gICAqIEByZXR1cm5zIHtDc3NBbmltYXRpb25CdWlsZGVyfVxuICAgKi9cbiAgY3NzKCk6IENzc0FuaW1hdGlvbkJ1aWxkZXIgeyByZXR1cm4gbmV3IENzc0FuaW1hdGlvbkJ1aWxkZXIodGhpcy5icm93c2VyRGV0YWlscyk7IH1cbn1cbiJdfQ==