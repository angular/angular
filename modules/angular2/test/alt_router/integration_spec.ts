import {
  ComponentFixture,
  AsyncTestCompleter,
  TestComponentBuilder,
  beforeEach,
  ddescribe,
  xdescribe,
  describe,
  el,
  expect,
  iit,
  inject,
  beforeEachProviders,
  it,
  xit,
  fakeAsync,
  tick
} from 'angular2/testing_internal';
import {provide, Component, ComponentResolver} from 'angular2/core';
import {PromiseWrapper} from 'angular2/src/facade/async';


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
} from 'angular2/alt_router';
import {SpyLocation} from 'angular2/src/mock/location_mock';
import {Location} from 'angular2/platform/common';
import {DOM} from 'angular2/src/platform/dom/dom_adapter';

export function main() {
  describe('navigation', () => {
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

    it('should update location when navigating',
       fakeAsync(inject([Router, TestComponentBuilder, Location], (router, tcb, location) => {
         let fixture = tcb.createFakeAsync(RootCmp);

         router.navigateByUrl('/team/22/user/victor');
         advance(fixture);
         expect(location.path()).toEqual('/team/22/user/victor');

         router.navigateByUrl('/team/33/simple');
         advance(fixture);

         expect(location.path()).toEqual('/team/33/simple');
       })));

    it('should navigate when locations changes',
       fakeAsync(inject([Router, TestComponentBuilder, Location], (router, tcb, location) => {
         let fixture = tcb.createFakeAsync(RootCmp);

         router.navigateByUrl('/team/22/user/victor');
         advance(fixture);

         location.simulateHashChange("/team/22/user/fedor");
         advance(fixture);

         expect(fixture.debugElement.nativeElement).toHaveText('team 22 { hello fedor, aux:  }');
       })));

    it('should support nested routes',
       fakeAsync(inject([Router, TestComponentBuilder], (router, tcb) => {
         let fixture = tcb.createFakeAsync(RootCmp);

         router.navigateByUrl('/team/22/user/victor');
         advance(fixture);

         expect(fixture.debugElement.nativeElement).toHaveText('team 22 { hello victor, aux:  }');
       })));

    it('should support aux routes',
       fakeAsync(inject([Router, TestComponentBuilder], (router, tcb) => {
         let fixture = tcb.createFakeAsync(RootCmp);

         router.navigateByUrl('/team/22/user/victor(/simple)');
         advance(fixture);

         expect(fixture.debugElement.nativeElement)
             .toHaveText('team 22 { hello victor, aux: simple }');
       })));

    it('should unload outlets', fakeAsync(inject([Router, TestComponentBuilder], (router, tcb) => {
         let fixture = tcb.createFakeAsync(RootCmp);

         router.navigateByUrl('/team/22/user/victor(/simple)');
         advance(fixture);

         router.navigateByUrl('/team/22/user/victor');
         advance(fixture);

         expect(fixture.debugElement.nativeElement).toHaveText('team 22 { hello victor, aux:  }');
       })));

    it('should unload nested outlets',
       fakeAsync(inject([Router, TestComponentBuilder], (router, tcb) => {
         let fixture = tcb.createFakeAsync(RootCmp);

         router.navigateByUrl('/team/22/user/victor(/simple)');
         advance(fixture);

         router.navigateByUrl('/');
         advance(fixture);

         expect(fixture.debugElement.nativeElement).toHaveText('');
       })));

    it('should update nested routes when url changes',
       fakeAsync(inject([Router, TestComponentBuilder], (router, tcb) => {
         let fixture = tcb.createFakeAsync(RootCmp);

         router.navigateByUrl('/team/22/user/victor');
         advance(fixture);
         let team1 = fixture.debugElement.children[1].componentInstance;

         router.navigateByUrl('/team/22/user/fedor');
         advance(fixture);
         let team2 = fixture.debugElement.children[1].componentInstance;

         expect(team1).toBe(team2);
         expect(fixture.debugElement.nativeElement).toHaveText('team 22 { hello fedor, aux:  }');
       })));

    it('should not unload the route if can deactivate returns false',
       fakeAsync(inject([Router, TestComponentBuilder, Location], (router, tcb, location) => {
         let fixture = tcb.createFakeAsync(RootCmp);

         router.navigateByUrl('/team/22/cannotDeactivate');
         advance(fixture);

         router.navigateByUrl('/team/22/user/fedor');
         advance(fixture);

         expect(fixture.debugElement.nativeElement)
             .toHaveText('team 22 { cannotDeactivate, aux:  }');

         expect(location.path()).toEqual('/team/22/cannotDeactivate');
       })));

    if (DOM.supportsDOMEvents()) {
      it("should support absolute router links",
         fakeAsync(inject([Router, TestComponentBuilder], (router, tcb) => {
           let fixture = tcb.createFakeAsync(RootCmp);
           advance(fixture);

           router.navigateByUrl('/team/22/link');
           advance(fixture);
           expect(fixture.debugElement.nativeElement).toHaveText('team 22 { link, aux:  }');

           let native = DOM.querySelector(fixture.debugElement.nativeElement, "a");
           expect(DOM.getAttribute(native, "href")).toEqual("/team/33/simple");
           DOM.dispatchEvent(native, DOM.createMouseEvent('click'));
           advance(fixture);

           expect(fixture.debugElement.nativeElement).toHaveText('team 33 { simple, aux:  }');
         })));

      it("should support relative router links",
         fakeAsync(inject([Router, TestComponentBuilder], (router, tcb) => {
           let fixture = tcb.createFakeAsync(RootCmp);
           advance(fixture);

           router.navigateByUrl('/team/22/relativelink');
           advance(fixture);
           expect(fixture.debugElement.nativeElement)
               .toHaveText('team 22 { relativelink {  }, aux:  }');

           let native = DOM.querySelector(fixture.debugElement.nativeElement, "a");
           expect(DOM.getAttribute(native, "href")).toEqual("/team/22/relativelink/simple");
           DOM.dispatchEvent(native, DOM.createMouseEvent('click'));
           advance(fixture);

           expect(fixture.debugElement.nativeElement)
               .toHaveText('team 22 { relativelink { simple }, aux:  }');
         })));

      it("should update router links when router changes",
         fakeAsync(inject([Router, TestComponentBuilder], (router, tcb) => {
           let fixture = tcb.createFakeAsync(RootCmp);
           advance(fixture);

           router.navigateByUrl('/team/22/link(simple)');
           advance(fixture);
           expect(fixture.debugElement.nativeElement).toHaveText('team 22 { link, aux: simple }');

           let native = DOM.querySelector(fixture.debugElement.nativeElement, "a");
           expect(DOM.getAttribute(native, "href")).toEqual("/team/33/simple(aux:simple)");

           router.navigateByUrl('/team/22/link(simple2)');
           advance(fixture);

           expect(DOM.getAttribute(native, "href")).toEqual("/team/33/simple(aux:simple2)");
         })));
    }
  });
}

function advance(fixture: ComponentFixture<any>): void {
  tick();
  fixture.detectChanges();
}

function compileRoot(tcb: TestComponentBuilder): Promise<ComponentFixture<any>> {
  return tcb.createAsync(RootCmp);
}

@Component({selector: 'user-cmp', template: `hello {{user}}`})
class UserCmp implements OnActivate {
  user: string;
  routerOnActivate(s: RouteSegment, a?, b?, c?) { this.user = s.getParam('name'); }
}

@Component({selector: 'cannot-deactivate', template: `cannotDeactivate`})
class CanDeactivateCmp implements CanDeactivate {
  routerCanDeactivate(a?, b?): Promise<boolean> { return PromiseWrapper.resolve(false); }
}

@Component({selector: 'simple-cmp', template: `simple`})
class SimpleCmp {
}

@Component({selector: 'simple2-cmp', template: `simple2`})
class Simple2Cmp {
}

@Component({
  selector: 'link-cmp',
  template: `<a [routerLink]="['/team', '33', 'simple']">link</a>`,
  directives: ROUTER_DIRECTIVES
})
class LinkCmp {
}

@Component({
  selector: 'link-cmp',
  template: `<a [routerLink]="['./simple']">relativelink</a> { <router-outlet></router-outlet> }`,
  directives: ROUTER_DIRECTIVES
})
@Routes([new Route({path: 'simple', component: SimpleCmp})])
class RelativeLinkCmp {
}

@Component({
  selector: 'team-cmp',
  template: `team {{id}} { <router-outlet></router-outlet>, aux: <router-outlet name="aux"></router-outlet> }`,
  directives: [ROUTER_DIRECTIVES]
})
@Routes([
  new Route({path: 'user/:name', component: UserCmp}),
  new Route({path: 'simple', component: SimpleCmp}),
  new Route({path: 'simple2', component: Simple2Cmp}),
  new Route({path: 'link', component: LinkCmp}),
  new Route({path: 'relativelink', component: RelativeLinkCmp}),
  new Route({path: 'cannotDeactivate', component: CanDeactivateCmp})
])
class TeamCmp implements OnActivate {
  id: string;
  routerOnActivate(s: RouteSegment, a?, b?, c?) { this.id = s.getParam('id'); }
}

@Component({
  selector: 'root-cmp',
  template: `<router-outlet></router-outlet>`,
  directives: [ROUTER_DIRECTIVES]
})
@Routes([new Route({path: 'team/:id', component: TeamCmp})])
class RootCmp {
}
