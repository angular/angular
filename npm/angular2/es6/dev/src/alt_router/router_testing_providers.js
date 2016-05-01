var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { SpyLocation } from 'angular2/src/mock/location_mock';
import { Location } from 'angular2/platform/common';
import { Router, RouterOutletMap } from './router';
import { RouterUrlSerializer, DefaultRouterUrlSerializer } from './router_url_serializer';
import { Component, ComponentResolver } from 'angular2/core';
let FakeAppRootCmp = class FakeAppRootCmp {
};
FakeAppRootCmp = __decorate([
    Component({ selector: 'fake-app-root-comp', template: `<span></span>` }), 
    __metadata('design:paramtypes', [])
], FakeAppRootCmp);
function routerFactory(componentResolver, urlSerializer, routerOutletMap, location) {
    return new Router(null, FakeAppRootCmp, componentResolver, urlSerializer, routerOutletMap, location);
}
export const ROUTER_FAKE_PROVIDERS = [
    RouterOutletMap,
    /* @ts2dart_Provider */ { provide: Location, useClass: SpyLocation },
    /* @ts2dart_Provider */ { provide: RouterUrlSerializer, useClass: DefaultRouterUrlSerializer },
    /* @ts2dart_Provider */ {
        provide: Router,
        useFactory: routerFactory,
        deps: /*@ts2dart_const*/ [ComponentResolver, RouterUrlSerializer, RouterOutletMap, Location]
    },
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyX3Rlc3RpbmdfcHJvdmlkZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1ndE03UWhFbi50bXAvYW5ndWxhcjIvc3JjL2FsdF9yb3V0ZXIvcm91dGVyX3Rlc3RpbmdfcHJvdmlkZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0saUNBQWlDO09BQ3BELEVBQUMsUUFBUSxFQUFDLE1BQU0sMEJBQTBCO09BQzFDLEVBQUMsTUFBTSxFQUFFLGVBQWUsRUFBQyxNQUFNLFVBQVU7T0FDekMsRUFBQyxtQkFBbUIsRUFBRSwwQkFBMEIsRUFBQyxNQUFNLHlCQUF5QjtPQUNoRixFQUFDLFNBQVMsRUFBRSxpQkFBaUIsRUFBQyxNQUFNLGVBQWU7QUFHMUQ7QUFDQSxDQUFDO0FBRkQ7SUFBQyxTQUFTLENBQUMsRUFBQyxRQUFRLEVBQUUsb0JBQW9CLEVBQUUsUUFBUSxFQUFFLGVBQWUsRUFBQyxDQUFDOztrQkFBQTtBQUl2RSx1QkFBdUIsaUJBQW9DLEVBQUUsYUFBa0MsRUFDeEUsZUFBZ0MsRUFBRSxRQUFrQjtJQUN6RSxNQUFNLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxFQUFFLGNBQWMsRUFBRSxpQkFBaUIsRUFBRSxhQUFhLEVBQUUsZUFBZSxFQUN2RSxRQUFRLENBQUMsQ0FBQztBQUM5QixDQUFDO0FBRUQsT0FBTyxNQUFNLHFCQUFxQixHQUE2QjtJQUM3RCxlQUFlO0lBQ2YsdUJBQXVCLENBQUMsRUFBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUM7SUFDbEUsdUJBQXVCLENBQUMsRUFBQyxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsUUFBUSxFQUFFLDBCQUEwQixFQUFDO0lBQzVGLHVCQUF1QixDQUFDO1FBQ3RCLE9BQU8sRUFBRSxNQUFNO1FBQ2YsVUFBVSxFQUFFLGFBQWE7UUFDekIsSUFBSSxFQUFFLGtCQUFrQixDQUNwQixDQUFDLGlCQUFpQixFQUFFLG1CQUFtQixFQUFFLGVBQWUsRUFBRSxRQUFRLENBQUM7S0FDeEU7Q0FDRixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtTcHlMb2NhdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL21vY2svbG9jYXRpb25fbW9jayc7XG5pbXBvcnQge0xvY2F0aW9ufSBmcm9tICdhbmd1bGFyMi9wbGF0Zm9ybS9jb21tb24nO1xuaW1wb3J0IHtSb3V0ZXIsIFJvdXRlck91dGxldE1hcH0gZnJvbSAnLi9yb3V0ZXInO1xuaW1wb3J0IHtSb3V0ZXJVcmxTZXJpYWxpemVyLCBEZWZhdWx0Um91dGVyVXJsU2VyaWFsaXplcn0gZnJvbSAnLi9yb3V0ZXJfdXJsX3NlcmlhbGl6ZXInO1xuaW1wb3J0IHtDb21wb25lbnQsIENvbXBvbmVudFJlc29sdmVyfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcblxuQENvbXBvbmVudCh7c2VsZWN0b3I6ICdmYWtlLWFwcC1yb290LWNvbXAnLCB0ZW1wbGF0ZTogYDxzcGFuPjwvc3Bhbj5gfSlcbmNsYXNzIEZha2VBcHBSb290Q21wIHtcbn1cblxuZnVuY3Rpb24gcm91dGVyRmFjdG9yeShjb21wb25lbnRSZXNvbHZlcjogQ29tcG9uZW50UmVzb2x2ZXIsIHVybFNlcmlhbGl6ZXI6IFJvdXRlclVybFNlcmlhbGl6ZXIsXG4gICAgICAgICAgICAgICAgICAgICAgIHJvdXRlck91dGxldE1hcDogUm91dGVyT3V0bGV0TWFwLCBsb2NhdGlvbjogTG9jYXRpb24pOiBSb3V0ZXIge1xuICByZXR1cm4gbmV3IFJvdXRlcihudWxsLCBGYWtlQXBwUm9vdENtcCwgY29tcG9uZW50UmVzb2x2ZXIsIHVybFNlcmlhbGl6ZXIsIHJvdXRlck91dGxldE1hcCxcbiAgICAgICAgICAgICAgICAgICAgbG9jYXRpb24pO1xufVxuXG5leHBvcnQgY29uc3QgUk9VVEVSX0ZBS0VfUFJPVklERVJTOiBhbnlbXSA9IC8qQHRzMmRhcnRfY29uc3QqLyBbXG4gIFJvdXRlck91dGxldE1hcCxcbiAgLyogQHRzMmRhcnRfUHJvdmlkZXIgKi8ge3Byb3ZpZGU6IExvY2F0aW9uLCB1c2VDbGFzczogU3B5TG9jYXRpb259LFxuICAvKiBAdHMyZGFydF9Qcm92aWRlciAqLyB7cHJvdmlkZTogUm91dGVyVXJsU2VyaWFsaXplciwgdXNlQ2xhc3M6IERlZmF1bHRSb3V0ZXJVcmxTZXJpYWxpemVyfSxcbiAgLyogQHRzMmRhcnRfUHJvdmlkZXIgKi8ge1xuICAgIHByb3ZpZGU6IFJvdXRlcixcbiAgICB1c2VGYWN0b3J5OiByb3V0ZXJGYWN0b3J5LFxuICAgIGRlcHM6IC8qQHRzMmRhcnRfY29uc3QqL1xuICAgICAgICBbQ29tcG9uZW50UmVzb2x2ZXIsIFJvdXRlclVybFNlcmlhbGl6ZXIsIFJvdXRlck91dGxldE1hcCwgTG9jYXRpb25dXG4gIH0sXG5dO1xuIl19