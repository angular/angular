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
