import {
  AsyncTestCompleter,
  beforeEach,
  ddescribe,
  xdescribe,
  describe,
  expect,
  iit,
  inject,
  beforeEachProviders,
  it,
  xit
} from '@angular/core/testing/testing_internal';

import {provide, Component, ComponentResolver} from '@angular/core';
import {RouterLink} from '../src/directives/router_link';
import {
  Router,
  RouterOutletMap,
  RouteSegment,
  Route,
  ROUTER_DIRECTIVES,
  Routes,
  RouterUrlSerializer,
  DefaultRouterUrlSerializer,
  OnActivate,
  CanDeactivate
} from '@angular/router';
import {Location} from '@angular/common';
import {SpyLocation} from '@angular/common/testing';

export function main() {
  describe('RouterLink', () => {
    beforeEachProviders(() => [
      provide(RouterUrlSerializer, {useClass: DefaultRouterUrlSerializer}),
      RouterOutletMap,
      provide(Location, {useClass: SpyLocation}),
      provide(Router,
        {
          useFactory: (resolver, urlParser, outletMap, location) => new Router(
            "RootComponent", RootCmp, resolver, urlParser, outletMap, location),
          deps: [ComponentResolver, RouterUrlSerializer, RouterOutletMap, Location]
        })
    ]);

    describe("routerLink=", () => {
      it("should accept an array of commands", inject([Router], (router) => {
        let link = new RouterLink(null, router);
        link.routerLink = ['/one', 11];
        expect(link.href).toEqual("/one/11");
      }));

      it("should accept a single command", inject([Router], (router) => {
        let link = new RouterLink(null, router);
        link.routerLink = '/one/11';
        expect(link.href).toEqual("/one/11");
      }));
    });
  });
}

@Component({template: ''})
class RootCmp {
}