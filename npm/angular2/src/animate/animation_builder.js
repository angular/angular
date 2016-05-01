'use strict';"use strict";
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
}());
exports.AnimationBuilder = AnimationBuilder;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uX2J1aWxkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLXI1UHJKSzloLnRtcC9hbmd1bGFyMi9zcmMvYW5pbWF0ZS9hbmltYXRpb25fYnVpbGRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsbUJBQXlCLHNCQUFzQixDQUFDLENBQUE7QUFFaEQsc0NBQWtDLHlCQUF5QixDQUFDLENBQUE7QUFDNUQsZ0NBQTZCLG1CQUFtQixDQUFDLENBQUE7QUFHakQ7SUFDRTs7O09BR0c7SUFDSCwwQkFBbUIsY0FBOEI7UUFBOUIsbUJBQWMsR0FBZCxjQUFjLENBQWdCO0lBQUcsQ0FBQztJQUVyRDs7O09BR0c7SUFDSCw4QkFBRyxHQUFILGNBQTZCLE1BQU0sQ0FBQyxJQUFJLDJDQUFtQixDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFackY7UUFBQyxlQUFVLEVBQUU7O3dCQUFBO0lBYWIsdUJBQUM7QUFBRCxDQUFDLEFBWkQsSUFZQztBQVpZLHdCQUFnQixtQkFZNUIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuXG5pbXBvcnQge0Nzc0FuaW1hdGlvbkJ1aWxkZXJ9IGZyb20gJy4vY3NzX2FuaW1hdGlvbl9idWlsZGVyJztcbmltcG9ydCB7QnJvd3NlckRldGFpbHN9IGZyb20gJy4vYnJvd3Nlcl9kZXRhaWxzJztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEFuaW1hdGlvbkJ1aWxkZXIge1xuICAvKipcbiAgICogVXNlZCBmb3IgRElcbiAgICogQHBhcmFtIGJyb3dzZXJEZXRhaWxzXG4gICAqL1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgYnJvd3NlckRldGFpbHM6IEJyb3dzZXJEZXRhaWxzKSB7fVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IENTUyBBbmltYXRpb25cbiAgICogQHJldHVybnMge0Nzc0FuaW1hdGlvbkJ1aWxkZXJ9XG4gICAqL1xuICBjc3MoKTogQ3NzQW5pbWF0aW9uQnVpbGRlciB7IHJldHVybiBuZXcgQ3NzQW5pbWF0aW9uQnVpbGRlcih0aGlzLmJyb3dzZXJEZXRhaWxzKTsgfVxufVxuIl19