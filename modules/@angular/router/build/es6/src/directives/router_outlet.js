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
import { Directive, ViewContainerRef, Attribute, ReflectiveInjector } from '@angular/core';
import { RouterOutletMap } from '../router_outlet_map';
import { PRIMARY_OUTLET } from '../shared';
export let RouterOutlet = class RouterOutlet {
    constructor(parentOutletMap, location, name) {
        this.location = location;
        parentOutletMap.registerOutlet(name ? name : PRIMARY_OUTLET, this);
    }
    get isActivated() { return !!this.activated; }
    get component() {
        if (!this.activated)
            throw new Error("Outlet is not activated");
        return this.activated.instance;
    }
    deactivate() {
        if (this.activated) {
            this.activated.destroy();
            this.activated = null;
        }
    }
    activate(factory, providers, outletMap) {
        this.outletMap = outletMap;
        const inj = ReflectiveInjector.fromResolvedProviders(providers, this.location.parentInjector);
        this.activated = this.location.createComponent(factory, this.location.length, inj, []);
    }
};
RouterOutlet = __decorate([
    Directive({ selector: 'router-outlet' }),
    __param(2, Attribute('name')), 
    __metadata('design:paramtypes', [RouterOutletMap, ViewContainerRef, String])
], RouterOutlet);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyX291dGxldC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9kaXJlY3RpdmVzL3JvdXRlcl9vdXRsZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O09BQU8sRUFBVyxTQUFTLEVBQUUsZ0JBQWdCLEVBQUUsU0FBUyxFQUE4RCxrQkFBa0IsRUFBQyxNQUFNLGVBQWU7T0FDdkosRUFBQyxlQUFlLEVBQUMsTUFBTSxzQkFBc0I7T0FDN0MsRUFBQyxjQUFjLEVBQUMsTUFBTSxXQUFXO0FBR3hDO0lBT0UsWUFBWSxlQUErQixFQUFVLFFBQXlCLEVBQy9DLElBQVc7UUFEVyxhQUFRLEdBQVIsUUFBUSxDQUFpQjtRQUU1RSxlQUFlLENBQUMsY0FBYyxDQUFDLElBQUksR0FBRyxJQUFJLEdBQUcsY0FBYyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3JFLENBQUM7SUFFRCxJQUFJLFdBQVcsS0FBYyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO0lBQ3ZELElBQUksU0FBUztRQUNYLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQztZQUFDLE1BQU0sSUFBSSxLQUFLLENBQUMseUJBQXlCLENBQUMsQ0FBQztRQUNoRSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUM7SUFDakMsQ0FBQztJQUVELFVBQVU7UUFDUixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUNuQixJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ3pCLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO1FBQ3hCLENBQUM7SUFDSCxDQUFDO0lBRUQsUUFBUSxDQUFDLE9BQThCLEVBQUUsU0FBdUMsRUFDdkUsU0FBMEI7UUFDakMsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7UUFDM0IsTUFBTSxHQUFHLEdBQUcsa0JBQWtCLENBQUMscUJBQXFCLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDOUYsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ3pGLENBQUM7QUFDSCxDQUFDO0FBaENEO0lBQUMsU0FBUyxDQUFDLEVBQUMsUUFBUSxFQUFFLGVBQWUsRUFBQyxDQUFDO2VBU3hCLFNBQVMsQ0FBQyxNQUFNLENBQUM7O2dCQVRPO0FBZ0N0QyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW5qZWN0b3IsIERpcmVjdGl2ZSwgVmlld0NvbnRhaW5lclJlZiwgQXR0cmlidXRlLCBDb21wb25lbnRSZWYsIENvbXBvbmVudEZhY3RvcnksIFJlc29sdmVkUmVmbGVjdGl2ZVByb3ZpZGVyLCBSZWZsZWN0aXZlSW5qZWN0b3J9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtSb3V0ZXJPdXRsZXRNYXB9IGZyb20gJy4uL3JvdXRlcl9vdXRsZXRfbWFwJztcbmltcG9ydCB7UFJJTUFSWV9PVVRMRVR9IGZyb20gJy4uL3NoYXJlZCc7XG5cbkBEaXJlY3RpdmUoe3NlbGVjdG9yOiAncm91dGVyLW91dGxldCd9KVxuZXhwb3J0IGNsYXNzIFJvdXRlck91dGxldCB7XG4gIHByaXZhdGUgYWN0aXZhdGVkOkNvbXBvbmVudFJlZjxhbnk+fG51bGw7XG4gIHB1YmxpYyBvdXRsZXRNYXA6Um91dGVyT3V0bGV0TWFwO1xuXG4gIC8qKlxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIGNvbnN0cnVjdG9yKHBhcmVudE91dGxldE1hcDpSb3V0ZXJPdXRsZXRNYXAsIHByaXZhdGUgbG9jYXRpb246Vmlld0NvbnRhaW5lclJlZixcbiAgICAgICAgICAgICAgQEF0dHJpYnV0ZSgnbmFtZScpIG5hbWU6c3RyaW5nKSB7XG4gICAgcGFyZW50T3V0bGV0TWFwLnJlZ2lzdGVyT3V0bGV0KG5hbWUgPyBuYW1lIDogUFJJTUFSWV9PVVRMRVQsIHRoaXMpO1xuICB9XG5cbiAgZ2V0IGlzQWN0aXZhdGVkKCk6IGJvb2xlYW4geyByZXR1cm4gISF0aGlzLmFjdGl2YXRlZDsgfVxuICBnZXQgY29tcG9uZW50KCk6IE9iamVjdCB7XG4gICAgaWYgKCF0aGlzLmFjdGl2YXRlZCkgdGhyb3cgbmV3IEVycm9yKFwiT3V0bGV0IGlzIG5vdCBhY3RpdmF0ZWRcIik7XG4gICAgcmV0dXJuIHRoaXMuYWN0aXZhdGVkLmluc3RhbmNlO1xuICB9XG5cbiAgZGVhY3RpdmF0ZSgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5hY3RpdmF0ZWQpIHtcbiAgICAgIHRoaXMuYWN0aXZhdGVkLmRlc3Ryb3koKTtcbiAgICAgIHRoaXMuYWN0aXZhdGVkID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBhY3RpdmF0ZShmYWN0b3J5OiBDb21wb25lbnRGYWN0b3J5PGFueT4sIHByb3ZpZGVyczogUmVzb2x2ZWRSZWZsZWN0aXZlUHJvdmlkZXJbXSxcbiAgICAgICAgICAgb3V0bGV0TWFwOiBSb3V0ZXJPdXRsZXRNYXApOiB2b2lkIHtcbiAgICB0aGlzLm91dGxldE1hcCA9IG91dGxldE1hcDtcbiAgICBjb25zdCBpbmogPSBSZWZsZWN0aXZlSW5qZWN0b3IuZnJvbVJlc29sdmVkUHJvdmlkZXJzKHByb3ZpZGVycywgdGhpcy5sb2NhdGlvbi5wYXJlbnRJbmplY3Rvcik7XG4gICAgdGhpcy5hY3RpdmF0ZWQgPSB0aGlzLmxvY2F0aW9uLmNyZWF0ZUNvbXBvbmVudChmYWN0b3J5LCB0aGlzLmxvY2F0aW9uLmxlbmd0aCwgaW5qLCBbXSk7XG4gIH1cbn1cbiJdfQ==