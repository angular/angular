"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var core_1 = require('@angular/core');
var router_outlet_map_1 = require('../router_outlet_map');
var shared_1 = require('../shared');
var RouterOutlet = (function () {
    function RouterOutlet(parentOutletMap, location, name) {
        this.location = location;
        parentOutletMap.registerOutlet(name ? name : shared_1.PRIMARY_OUTLET, this);
    }
    Object.defineProperty(RouterOutlet.prototype, "isActivated", {
        get: function () { return !!this.activated; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RouterOutlet.prototype, "component", {
        get: function () {
            if (!this.activated)
                throw new Error("Outlet is not activated");
            return this.activated.instance;
        },
        enumerable: true,
        configurable: true
    });
    RouterOutlet.prototype.deactivate = function () {
        if (this.activated) {
            this.activated.destroy();
            this.activated = null;
        }
    };
    RouterOutlet.prototype.activate = function (factory, providers, outletMap) {
        this.outletMap = outletMap;
        var inj = core_1.ReflectiveInjector.fromResolvedProviders(providers, this.location.parentInjector);
        this.activated = this.location.createComponent(factory, this.location.length, inj, []);
    };
    RouterOutlet = __decorate([
        core_1.Directive({ selector: 'router-outlet' }),
        __param(2, core_1.Attribute('name')), 
        __metadata('design:paramtypes', [router_outlet_map_1.RouterOutletMap, core_1.ViewContainerRef, String])
    ], RouterOutlet);
    return RouterOutlet;
}());
exports.RouterOutlet = RouterOutlet;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyX291dGxldC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9kaXJlY3RpdmVzL3JvdXRlcl9vdXRsZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQUFBLHFCQUErSSxlQUFlLENBQUMsQ0FBQTtBQUMvSixrQ0FBOEIsc0JBQXNCLENBQUMsQ0FBQTtBQUNyRCx1QkFBNkIsV0FBVyxDQUFDLENBQUE7QUFHekM7SUFPRSxzQkFBWSxlQUErQixFQUFVLFFBQXlCLEVBQy9DLElBQVc7UUFEVyxhQUFRLEdBQVIsUUFBUSxDQUFpQjtRQUU1RSxlQUFlLENBQUMsY0FBYyxDQUFDLElBQUksR0FBRyxJQUFJLEdBQUcsdUJBQWMsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNyRSxDQUFDO0lBRUQsc0JBQUkscUNBQVc7YUFBZixjQUE2QixNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDOzs7T0FBQTtJQUN2RCxzQkFBSSxtQ0FBUzthQUFiO1lBQ0UsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDO2dCQUFDLE1BQU0sSUFBSSxLQUFLLENBQUMseUJBQXlCLENBQUMsQ0FBQztZQUNoRSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUM7UUFDakMsQ0FBQzs7O09BQUE7SUFFRCxpQ0FBVSxHQUFWO1FBQ0UsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDbkIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUN6QixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztRQUN4QixDQUFDO0lBQ0gsQ0FBQztJQUVELCtCQUFRLEdBQVIsVUFBUyxPQUE4QixFQUFFLFNBQXVDLEVBQ3ZFLFNBQTBCO1FBQ2pDLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1FBQzNCLElBQU0sR0FBRyxHQUFHLHlCQUFrQixDQUFDLHFCQUFxQixDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQzlGLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUN6RixDQUFDO0lBL0JIO1FBQUMsZ0JBQVMsQ0FBQyxFQUFDLFFBQVEsRUFBRSxlQUFlLEVBQUMsQ0FBQzttQkFTeEIsZ0JBQVMsQ0FBQyxNQUFNLENBQUM7O29CQVRPO0lBZ0N2QyxtQkFBQztBQUFELENBQUMsQUEvQkQsSUErQkM7QUEvQlksb0JBQVksZUErQnhCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0luamVjdG9yLCBEaXJlY3RpdmUsIFZpZXdDb250YWluZXJSZWYsIEF0dHJpYnV0ZSwgQ29tcG9uZW50UmVmLCBDb21wb25lbnRGYWN0b3J5LCBSZXNvbHZlZFJlZmxlY3RpdmVQcm92aWRlciwgUmVmbGVjdGl2ZUluamVjdG9yfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7Um91dGVyT3V0bGV0TWFwfSBmcm9tICcuLi9yb3V0ZXJfb3V0bGV0X21hcCc7XG5pbXBvcnQge1BSSU1BUllfT1VUTEVUfSBmcm9tICcuLi9zaGFyZWQnO1xuXG5ARGlyZWN0aXZlKHtzZWxlY3RvcjogJ3JvdXRlci1vdXRsZXQnfSlcbmV4cG9ydCBjbGFzcyBSb3V0ZXJPdXRsZXQge1xuICBwcml2YXRlIGFjdGl2YXRlZDpDb21wb25lbnRSZWY8YW55PnxudWxsO1xuICBwdWJsaWMgb3V0bGV0TWFwOlJvdXRlck91dGxldE1hcDtcblxuICAvKipcbiAgICogQGludGVybmFsXG4gICAqL1xuICBjb25zdHJ1Y3RvcihwYXJlbnRPdXRsZXRNYXA6Um91dGVyT3V0bGV0TWFwLCBwcml2YXRlIGxvY2F0aW9uOlZpZXdDb250YWluZXJSZWYsXG4gICAgICAgICAgICAgIEBBdHRyaWJ1dGUoJ25hbWUnKSBuYW1lOnN0cmluZykge1xuICAgIHBhcmVudE91dGxldE1hcC5yZWdpc3Rlck91dGxldChuYW1lID8gbmFtZSA6IFBSSU1BUllfT1VUTEVULCB0aGlzKTtcbiAgfVxuXG4gIGdldCBpc0FjdGl2YXRlZCgpOiBib29sZWFuIHsgcmV0dXJuICEhdGhpcy5hY3RpdmF0ZWQ7IH1cbiAgZ2V0IGNvbXBvbmVudCgpOiBPYmplY3Qge1xuICAgIGlmICghdGhpcy5hY3RpdmF0ZWQpIHRocm93IG5ldyBFcnJvcihcIk91dGxldCBpcyBub3QgYWN0aXZhdGVkXCIpO1xuICAgIHJldHVybiB0aGlzLmFjdGl2YXRlZC5pbnN0YW5jZTtcbiAgfVxuXG4gIGRlYWN0aXZhdGUoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuYWN0aXZhdGVkKSB7XG4gICAgICB0aGlzLmFjdGl2YXRlZC5kZXN0cm95KCk7XG4gICAgICB0aGlzLmFjdGl2YXRlZCA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgYWN0aXZhdGUoZmFjdG9yeTogQ29tcG9uZW50RmFjdG9yeTxhbnk+LCBwcm92aWRlcnM6IFJlc29sdmVkUmVmbGVjdGl2ZVByb3ZpZGVyW10sXG4gICAgICAgICAgIG91dGxldE1hcDogUm91dGVyT3V0bGV0TWFwKTogdm9pZCB7XG4gICAgdGhpcy5vdXRsZXRNYXAgPSBvdXRsZXRNYXA7XG4gICAgY29uc3QgaW5qID0gUmVmbGVjdGl2ZUluamVjdG9yLmZyb21SZXNvbHZlZFByb3ZpZGVycyhwcm92aWRlcnMsIHRoaXMubG9jYXRpb24ucGFyZW50SW5qZWN0b3IpO1xuICAgIHRoaXMuYWN0aXZhdGVkID0gdGhpcy5sb2NhdGlvbi5jcmVhdGVDb21wb25lbnQoZmFjdG9yeSwgdGhpcy5sb2NhdGlvbi5sZW5ndGgsIGluaiwgW10pO1xuICB9XG59XG4iXX0=