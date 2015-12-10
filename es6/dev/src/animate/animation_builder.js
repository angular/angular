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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5pbWF0aW9uX2J1aWxkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvYW5pbWF0ZS9hbmltYXRpb25fYnVpbGRlci50cyJdLCJuYW1lcyI6WyJBbmltYXRpb25CdWlsZGVyIiwiQW5pbWF0aW9uQnVpbGRlci5jb25zdHJ1Y3RvciIsIkFuaW1hdGlvbkJ1aWxkZXIuY3NzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7T0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLHNCQUFzQjtPQUV4QyxFQUFDLG1CQUFtQixFQUFDLE1BQU0seUJBQXlCO09BQ3BELEVBQUMsY0FBYyxFQUFDLE1BQU0sbUJBQW1CO0FBRWhEO0lBRUVBOzs7T0FHR0E7SUFDSEEsWUFBbUJBLGNBQThCQTtRQUE5QkMsbUJBQWNBLEdBQWRBLGNBQWNBLENBQWdCQTtJQUFHQSxDQUFDQTtJQUVyREQ7OztPQUdHQTtJQUNIQSxHQUFHQSxLQUEwQkUsTUFBTUEsQ0FBQ0EsSUFBSUEsbUJBQW1CQSxDQUFDQSxJQUFJQSxDQUFDQSxjQUFjQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtBQUNyRkYsQ0FBQ0E7QUFiRDtJQUFDLFVBQVUsRUFBRTs7cUJBYVo7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuXG5pbXBvcnQge0Nzc0FuaW1hdGlvbkJ1aWxkZXJ9IGZyb20gJy4vY3NzX2FuaW1hdGlvbl9idWlsZGVyJztcbmltcG9ydCB7QnJvd3NlckRldGFpbHN9IGZyb20gJy4vYnJvd3Nlcl9kZXRhaWxzJztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEFuaW1hdGlvbkJ1aWxkZXIge1xuICAvKipcbiAgICogVXNlZCBmb3IgRElcbiAgICogQHBhcmFtIGJyb3dzZXJEZXRhaWxzXG4gICAqL1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgYnJvd3NlckRldGFpbHM6IEJyb3dzZXJEZXRhaWxzKSB7fVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IENTUyBBbmltYXRpb25cbiAgICogQHJldHVybnMge0Nzc0FuaW1hdGlvbkJ1aWxkZXJ9XG4gICAqL1xuICBjc3MoKTogQ3NzQW5pbWF0aW9uQnVpbGRlciB7IHJldHVybiBuZXcgQ3NzQW5pbWF0aW9uQnVpbGRlcih0aGlzLmJyb3dzZXJEZXRhaWxzKTsgfVxufVxuIl19