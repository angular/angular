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
import {fakeAsync, tick} from '@angular/core/testing';
import {ComponentFixture, TestComponentBuilder} from '@angular/compiler/testing';
import {provide, Component, ComponentResolver} from '@angular/core';
import {PromiseWrapper} from '../src/facade/async';


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
  OnDeactivate,
  CanDeactivate,
  CanReuse
} from '@angular/router';
import {SpyLocation} from '@angular/common/testing';
import {Location} from '@angular/common';
import {getDOM} from '../platform_browser_private';

export function main() {
  describe('navigation', () => {
    beforeEachProviders(() => [
      provide(RouterUrlSerializer, {useClass: DefaultRouterUrlSerializer}),
      RouterOutletMap,
      provide(Location, {useClass: SpyLocation}),
      provide(RouteSegment, {useFactory: (r) => r.routeTree.root, deps: [Router]}),
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

    it('should deactivate outlets',
       fakeAsync(inject([Router, TestComponentBuilder], (router, tcb) => {
         let fixture = tcb.createFakeAsync(RootCmp);

         router.navigateByUrl('/team/22/user/victor(/simple)');
         advance(fixture);

         router.navigateByUrl('/team/22/user/victor');
         advance(fixture);

         expect(fixture.debugElement.nativeElement).toHaveText('team 22 { hello victor, aux:  }');
       })));

    it('should deactivate nested outlets',
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

    it('should not deactivate the route if can deactivate returns false',
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

    it('should call routerOnDeactivate when deactivating a component',
       fakeAsync(inject([Router, TestComponentBuilder, Location], (router, tcb, location) => {
         let fixture = tcb.createFakeAsync(RootCmp);

         router.navigateByUrl('/deactivatable');
         advance(fixture);
         let deactivatable = fixture.debugElement.children[1].componentInstance;

         router.navigateByUrl('/team/22/user/fedor');
         advance(fixture);

         expect(deactivatable.recorded[0][0].stringifiedUrlSegments).toEqual("deactivatable");
       })));

    it('should reuse components when implement CanReuse and return true',
       fakeAsync(inject([Router, TestComponentBuilder, Location], (router, tcb, location) => {
         let fixture = tcb.createFakeAsync(RootCmp);

         router.navigateByUrl('/reusable/1');
         advance(fixture);
         let reusable1 = fixture.debugElement.children[1].componentInstance;
         expect(reusable1.id).toEqual("1");

         router.navigateByUrl('/reusable/2');
         advance(fixture);
         let reusable2 = fixture.debugElement.children[1].componentInstance;
         expect(reusable2).toBe(reusable1);
         expect(reusable2.id).toEqual("2");

         reusable2.canReuseValue = false;
         router.navigateByUrl('/reusable/3');
         advance(fixture);
         let reusable3 = fixture.debugElement.children[1].componentInstance;
         expect(reusable2).not.toBe(reusable3);
       })));

    it('should not reuse components when switching component types',
       fakeAsync(inject([Router, TestComponentBuilder, Location], (router, tcb, location) => {
         let fixture = tcb.createFakeAsync(RootCmp);

         router.navigateByUrl('/reusable/1');
         advance(fixture);
         let reusable = fixture.debugElement.children[1].componentInstance;

         router.navigateByUrl('/team/33/user/john');
         advance(fixture);
         let team = fixture.debugElement.children[1].componentInstance;

         expect(team).not.toBe(reusable);
       })));

    if (getDOM().supportsDOMEvents()) {
      it("should support absolute router links",
         fakeAsync(inject([Router, TestComponentBuilder], (router, tcb) => {
           let fixture = tcb.createFakeAsync(RootCmp);
           advance(fixture);

           router.navigateByUrl('/team/22/link');
           advance(fixture);
           expect(fixture.debugElement.nativeElement).toHaveText('team 22 { link, aux:  }');

           let native = getDOM().querySelector(fixture.debugElement.nativeElement, "a");
           expect(getDOM().getAttribute(native, "href")).toEqual("/team/33/simple");
           getDOM().dispatchEvent(native, getDOM().createMouseEvent('click'));
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

           let native = getDOM().querySelector(fixture.debugElement.nativeElement, "a");
           expect(getDOM().getAttribute(native, "href")).toEqual("/team/22/relativelink/simple");
           getDOM().dispatchEvent(native, getDOM().createMouseEvent('click'));
           advance(fixture);

           expect(fixture.debugElement.nativeElement)
               .toHaveText('team 22 { relativelink { simple }, aux:  }');
         })));

      it("should set the router-link-active class",
         fakeAsync(inject([Router, TestComponentBuilder], (router, tcb) => {
           let fixture = tcb.createFakeAsync(RootCmp);
           advance(fixture);

           router.navigateByUrl('/team/22/relativelink');
           advance(fixture);
           expect(fixture.debugElement.nativeElement)
               .toHaveText('team 22 { relativelink {  }, aux:  }');
           let link = getDOM().querySelector(fixture.debugElement.nativeElement, "a");
           expect(getDOM().hasClass(link, "router-link-active")).toEqual(false);

           getDOM().dispatchEvent(link, getDOM().createMouseEvent('click'));
           advance(fixture);

           expect(getDOM().hasClass(link, "router-link-active")).toEqual(true);
         })));

      it("should update router links when router changes",
         fakeAsync(inject([Router, TestComponentBuilder], (router, tcb) => {
           let fixture = tcb.createFakeAsync(RootCmp);
           advance(fixture);

           router.navigateByUrl('/team/22/link(simple)');
           advance(fixture);
           expect(fixture.debugElement.nativeElement).toHaveText('team 22 { link, aux: simple }');

           let native = getDOM().querySelector(fixture.debugElement.nativeElement, "a");
           expect(getDOM().getAttribute(native, "href")).toEqual("/team/33/simple(aux:simple)");

           router.navigateByUrl('/team/22/link(simple2)');
           advance(fixture);

           expect(getDOM().getAttribute(native, "href")).toEqual("/team/33/simple(aux:simple2)");
         })));

      it("should support top-level link",
         fakeAsync(inject([Router, TestComponentBuilder], (router, tcb) => {
           let fixture = tcb.createFakeAsync(LinkCmp);
           advance(fixture);
           expect(fixture.debugElement.nativeElement).toHaveText('link');
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
  recorded = [];
  routerCanDeactivate(a?, b?, c?): Promise<boolean> {
    this.recorded.push([a, b, c]);
    return PromiseWrapper.resolve(false);
  }
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

@Component({selector: 'deactivatable-cmp', template: ``})
class DeactivatableCmp implements OnDeactivate {
  recorded = [];

  routerOnDeactivate(a?, b?, c?): void { this.recorded.push([a, b, c]); }
}

@Component({selector: 'reusable-cmp', template: ``})
class ReusableCmp implements CanReuse {
  canReuseValue: boolean = true;

  id: string;
  routerOnActivate(s: RouteSegment, a?, b?, c?) { this.id = s.getParam('id'); }

  routerCanReuse(s: RouteSegment, a?, b?, c?): boolean { return this.canReuseValue; }
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
@Routes([
  new Route({path: 'team/:id', component: TeamCmp}),
  new Route({path: 'deactivatable', component: DeactivatableCmp}),
  new Route({path: 'reusable/:id', component: ReusableCmp})
])
class RootCmp {
}
