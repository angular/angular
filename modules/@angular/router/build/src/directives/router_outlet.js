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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyX291dGxldC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9kaXJlY3RpdmVzL3JvdXRlcl9vdXRsZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztBQUFBLHFCQUFxSSxlQUFlLENBQUMsQ0FBQTtBQUNySixrQ0FBOEIsc0JBQXNCLENBQUMsQ0FBQTtBQUNyRCx1QkFBNkIsV0FBVyxDQUFDLENBQUE7QUFHekM7SUFJRSxzQkFBWSxlQUErQixFQUFVLFFBQXlCLEVBQy9DLElBQVc7UUFEVyxhQUFRLEdBQVIsUUFBUSxDQUFpQjtRQUU1RSxlQUFlLENBQUMsY0FBYyxDQUFDLElBQUksR0FBRyxJQUFJLEdBQUcsdUJBQWMsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNyRSxDQUFDO0lBRUQsc0JBQUkscUNBQVc7YUFBZixjQUE2QixNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDOzs7T0FBQTtJQUV2RCxpQ0FBVSxHQUFWO1FBQ0UsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDbkIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUN6QixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztRQUN4QixDQUFDO0lBQ0gsQ0FBQztJQUVELCtCQUFRLEdBQVIsVUFBUyxPQUE4QixFQUFFLFNBQXVDLEVBQ3ZFLFNBQTBCO1FBQ2pDLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1FBQzNCLElBQUksR0FBRyxHQUFHLHlCQUFrQixDQUFDLHFCQUFxQixDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQzVGLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUN6RixDQUFDO0lBeEJIO1FBQUMsZ0JBQVMsQ0FBQyxFQUFDLFFBQVEsRUFBRSxlQUFlLEVBQUMsQ0FBQzttQkFNeEIsZ0JBQVMsQ0FBQyxNQUFNLENBQUM7O29CQU5PO0lBeUJ2QyxtQkFBQztBQUFELENBQUMsQUF4QkQsSUF3QkM7QUF4Qlksb0JBQVksZUF3QnhCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0RpcmVjdGl2ZSwgVmlld0NvbnRhaW5lclJlZiwgQXR0cmlidXRlLCBDb21wb25lbnRSZWYsIENvbXBvbmVudEZhY3RvcnksIFJlc29sdmVkUmVmbGVjdGl2ZVByb3ZpZGVyLCBSZWZsZWN0aXZlSW5qZWN0b3J9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtSb3V0ZXJPdXRsZXRNYXB9IGZyb20gJy4uL3JvdXRlcl9vdXRsZXRfbWFwJztcbmltcG9ydCB7UFJJTUFSWV9PVVRMRVR9IGZyb20gJy4uL3NoYXJlZCc7XG5cbkBEaXJlY3RpdmUoe3NlbGVjdG9yOiAncm91dGVyLW91dGxldCd9KVxuZXhwb3J0IGNsYXNzIFJvdXRlck91dGxldCB7XG4gIHByaXZhdGUgYWN0aXZhdGVkOkNvbXBvbmVudFJlZjxhbnk+fG51bGw7XG4gIHB1YmxpYyBvdXRsZXRNYXA6Um91dGVyT3V0bGV0TWFwO1xuXG4gIGNvbnN0cnVjdG9yKHBhcmVudE91dGxldE1hcDpSb3V0ZXJPdXRsZXRNYXAsIHByaXZhdGUgbG9jYXRpb246Vmlld0NvbnRhaW5lclJlZixcbiAgICAgICAgICAgICAgQEF0dHJpYnV0ZSgnbmFtZScpIG5hbWU6c3RyaW5nKSB7XG4gICAgcGFyZW50T3V0bGV0TWFwLnJlZ2lzdGVyT3V0bGV0KG5hbWUgPyBuYW1lIDogUFJJTUFSWV9PVVRMRVQsIHRoaXMpO1xuICB9XG5cbiAgZ2V0IGlzQWN0aXZhdGVkKCk6IGJvb2xlYW4geyByZXR1cm4gISF0aGlzLmFjdGl2YXRlZDsgfVxuICBcbiAgZGVhY3RpdmF0ZSgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5hY3RpdmF0ZWQpIHtcbiAgICAgIHRoaXMuYWN0aXZhdGVkLmRlc3Ryb3koKTtcbiAgICAgIHRoaXMuYWN0aXZhdGVkID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBhY3RpdmF0ZShmYWN0b3J5OiBDb21wb25lbnRGYWN0b3J5PGFueT4sIHByb3ZpZGVyczogUmVzb2x2ZWRSZWZsZWN0aXZlUHJvdmlkZXJbXSxcbiAgICAgICAgICAgb3V0bGV0TWFwOiBSb3V0ZXJPdXRsZXRNYXApOiB2b2lkIHtcbiAgICB0aGlzLm91dGxldE1hcCA9IG91dGxldE1hcDtcbiAgICBsZXQgaW5qID0gUmVmbGVjdGl2ZUluamVjdG9yLmZyb21SZXNvbHZlZFByb3ZpZGVycyhwcm92aWRlcnMsIHRoaXMubG9jYXRpb24ucGFyZW50SW5qZWN0b3IpO1xuICAgIHRoaXMuYWN0aXZhdGVkID0gdGhpcy5sb2NhdGlvbi5jcmVhdGVDb21wb25lbnQoZmFjdG9yeSwgdGhpcy5sb2NhdGlvbi5sZW5ndGgsIGluaiwgW10pO1xuICB9XG59XG4iXX0=