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
    deactivate() {
        if (this.activated) {
            this.activated.destroy();
            this.activated = null;
        }
    }
    activate(factory, providers, outletMap) {
        this.outletMap = outletMap;
        let inj = ReflectiveInjector.fromResolvedProviders(providers, this.location.parentInjector);
        this.activated = this.location.createComponent(factory, this.location.length, inj, []);
    }
};
RouterOutlet = __decorate([
    Directive({ selector: 'router-outlet' }),
    __param(2, Attribute('name')), 
    __metadata('design:paramtypes', [RouterOutletMap, ViewContainerRef, String])
], RouterOutlet);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyX291dGxldC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9kaXJlY3RpdmVzL3JvdXRlcl9vdXRsZXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O09BQU8sRUFBQyxTQUFTLEVBQUUsZ0JBQWdCLEVBQUUsU0FBUyxFQUE4RCxrQkFBa0IsRUFBQyxNQUFNLGVBQWU7T0FDN0ksRUFBQyxlQUFlLEVBQUMsTUFBTSxzQkFBc0I7T0FDN0MsRUFBQyxjQUFjLEVBQUMsTUFBTSxXQUFXO0FBR3hDO0lBSUUsWUFBWSxlQUErQixFQUFVLFFBQXlCLEVBQy9DLElBQVc7UUFEVyxhQUFRLEdBQVIsUUFBUSxDQUFpQjtRQUU1RSxlQUFlLENBQUMsY0FBYyxDQUFDLElBQUksR0FBRyxJQUFJLEdBQUcsY0FBYyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3JFLENBQUM7SUFFRCxJQUFJLFdBQVcsS0FBYyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO0lBRXZELFVBQVU7UUFDUixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUNuQixJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ3pCLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO1FBQ3hCLENBQUM7SUFDSCxDQUFDO0lBRUQsUUFBUSxDQUFDLE9BQThCLEVBQUUsU0FBdUMsRUFDdkUsU0FBMEI7UUFDakMsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7UUFDM0IsSUFBSSxHQUFHLEdBQUcsa0JBQWtCLENBQUMscUJBQXFCLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDNUYsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ3pGLENBQUM7QUFDSCxDQUFDO0FBekJEO0lBQUMsU0FBUyxDQUFDLEVBQUMsUUFBUSxFQUFFLGVBQWUsRUFBQyxDQUFDO2VBTXhCLFNBQVMsQ0FBQyxNQUFNLENBQUM7O2dCQU5PO0FBeUJ0QyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RGlyZWN0aXZlLCBWaWV3Q29udGFpbmVyUmVmLCBBdHRyaWJ1dGUsIENvbXBvbmVudFJlZiwgQ29tcG9uZW50RmFjdG9yeSwgUmVzb2x2ZWRSZWZsZWN0aXZlUHJvdmlkZXIsIFJlZmxlY3RpdmVJbmplY3Rvcn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge1JvdXRlck91dGxldE1hcH0gZnJvbSAnLi4vcm91dGVyX291dGxldF9tYXAnO1xuaW1wb3J0IHtQUklNQVJZX09VVExFVH0gZnJvbSAnLi4vc2hhcmVkJztcblxuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdyb3V0ZXItb3V0bGV0J30pXG5leHBvcnQgY2xhc3MgUm91dGVyT3V0bGV0IHtcbiAgcHJpdmF0ZSBhY3RpdmF0ZWQ6Q29tcG9uZW50UmVmPGFueT58bnVsbDtcbiAgcHVibGljIG91dGxldE1hcDpSb3V0ZXJPdXRsZXRNYXA7XG5cbiAgY29uc3RydWN0b3IocGFyZW50T3V0bGV0TWFwOlJvdXRlck91dGxldE1hcCwgcHJpdmF0ZSBsb2NhdGlvbjpWaWV3Q29udGFpbmVyUmVmLFxuICAgICAgICAgICAgICBAQXR0cmlidXRlKCduYW1lJykgbmFtZTpzdHJpbmcpIHtcbiAgICBwYXJlbnRPdXRsZXRNYXAucmVnaXN0ZXJPdXRsZXQobmFtZSA/IG5hbWUgOiBQUklNQVJZX09VVExFVCwgdGhpcyk7XG4gIH1cblxuICBnZXQgaXNBY3RpdmF0ZWQoKTogYm9vbGVhbiB7IHJldHVybiAhIXRoaXMuYWN0aXZhdGVkOyB9XG4gIFxuICBkZWFjdGl2YXRlKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLmFjdGl2YXRlZCkge1xuICAgICAgdGhpcy5hY3RpdmF0ZWQuZGVzdHJveSgpO1xuICAgICAgdGhpcy5hY3RpdmF0ZWQgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIGFjdGl2YXRlKGZhY3Rvcnk6IENvbXBvbmVudEZhY3Rvcnk8YW55PiwgcHJvdmlkZXJzOiBSZXNvbHZlZFJlZmxlY3RpdmVQcm92aWRlcltdLFxuICAgICAgICAgICBvdXRsZXRNYXA6IFJvdXRlck91dGxldE1hcCk6IHZvaWQge1xuICAgIHRoaXMub3V0bGV0TWFwID0gb3V0bGV0TWFwO1xuICAgIGxldCBpbmogPSBSZWZsZWN0aXZlSW5qZWN0b3IuZnJvbVJlc29sdmVkUHJvdmlkZXJzKHByb3ZpZGVycywgdGhpcy5sb2NhdGlvbi5wYXJlbnRJbmplY3Rvcik7XG4gICAgdGhpcy5hY3RpdmF0ZWQgPSB0aGlzLmxvY2F0aW9uLmNyZWF0ZUNvbXBvbmVudChmYWN0b3J5LCB0aGlzLmxvY2F0aW9uLmxlbmd0aCwgaW5qLCBbXSk7XG4gIH1cbn1cbiJdfQ==