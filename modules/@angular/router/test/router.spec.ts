import {Component} from '@angular/core';
import {
  describe,
  it,
  iit,
  xit,
  expect,
  beforeEach,
  beforeEachProviders,
  inject,
  fakeAsync,
  tick
} from '@angular/core/testing';

import {TestComponentBuilder, ComponentFixture} from '@angular/compiler/testing';
import { ComponentResolver } from '@angular/core';
import { SpyLocation } from '@angular/common/testing';
import { UrlSerializer, DefaultUrlSerializer, RouterOutletMap, Router, ActivatedRoute, ROUTER_DIRECTIVES } from '../src/index';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

describe("Integration", () => {
  beforeEachProviders(() => [
    RouterOutletMap,
    {provide: UrlSerializer, useClass: DefaultUrlSerializer},
    {provide: Location, useClass: SpyLocation},
    {
      provide: Router,
      useFactory: (resolver, urlSerializer, outletMap, location) =>
        new Router(new RootCmp(), resolver, urlSerializer, outletMap, location),
      deps: [ComponentResolver, UrlSerializer, RouterOutletMap, Location]
    },
    {provide: ActivatedRoute, useFactory: (r) => r.routerState.root, deps: [Router]},
  ]);
  
  it('should update location when navigating',
    fakeAsync(inject([Router, TestComponentBuilder, Location], (router, tcb, location) => {
      router.resetConfig([
        { path: 'team/:id', component: TeamCmp }
      ]);
      
      const fixture = tcb.createFakeAsync(RootCmp);
      advance(fixture);

      router.navigateByUrl('/team/22');
      advance(fixture);
      expect(location.path()).toEqual('/team/22');

      router.navigateByUrl('/team/33');
      advance(fixture);

      expect(location.path()).toEqual('/team/33');
    })));

  xit('should navigate back and forward',
    fakeAsync(inject([Router, TestComponentBuilder, Location], (router, tcb, location) => {
      router.resetConfig([
        { path: 'team/:id', component: TeamCmp, children: [
          { path: 'simple', component: SimpleCmp },
          { path: 'user/:name', component: UserCmp }
        ] }
      ]);

      const fixture = tcb.createFakeAsync(RootCmp);

      router.navigateByUrl('/team/33/simple');
      advance(fixture);
      expect(location.path()).toEqual('/team/33/simple');

      router.navigateByUrl('/team/22/user/victor');
      advance(fixture);

      location.back();
      advance(fixture);
      expect(location.path()).toEqual('/team/33/simple');

      location.forward();
      advance(fixture);
      expect(location.path()).toEqual('/team/22/user/victor');
    })));

  it('should navigate when locations changes',
    fakeAsync(inject([Router, TestComponentBuilder, Location], (router, tcb, location) => {
      router.resetConfig([
        { path: 'team/:id', component: TeamCmp, children: [
          { path: 'user/:name', component: UserCmp }
        ] }
      ]);

      const fixture = tcb.createFakeAsync(RootCmp);

      router.navigateByUrl('/team/22/user/victor');
      advance(fixture);

      location.simulateHashChange("/team/22/user/fedor");
      advance(fixture);

      expect(fixture.debugElement.nativeElement).toHaveText('team 22 { user fedor, right:  }');
    })));

  it('should support secondary routes',
    fakeAsync(inject([Router, TestComponentBuilder], (router, tcb) => {
      router.resetConfig([
        { path: 'team/:id', component: TeamCmp, children: [
          { path: 'user/:name', component: UserCmp },
          { path: 'simple', component: SimpleCmp, outlet: 'right' }
        ] }
      ]);

      const fixture = tcb.createFakeAsync(RootCmp);

      router.navigateByUrl('/team/22/user/victor(right:simple)');
      advance(fixture);

      expect(fixture.debugElement.nativeElement)
        .toHaveText('team 22 { user victor, right: simple }');
    })));

  it('should deactivate outlets',
    fakeAsync(inject([Router, TestComponentBuilder], (router, tcb) => {
      router.resetConfig([
        { path: 'team/:id', component: TeamCmp, children: [
          { path: 'user/:name', component: UserCmp },
          { path: 'simple', component: SimpleCmp, outlet: 'right' }
        ] }
      ]);

      const fixture = tcb.createFakeAsync(RootCmp);

      router.navigateByUrl('/team/22/user/victor(right:simple)');
      advance(fixture);

      router.navigateByUrl('/team/22/user/victor');
      advance(fixture);

      expect(fixture.debugElement.nativeElement).toHaveText('team 22 { user victor, right:  }');
    })));

  it('should deactivate nested outlets',
    fakeAsync(inject([Router, TestComponentBuilder], (router, tcb) => {
      router.resetConfig([
        { path: 'team/:id', component: TeamCmp, children: [
          { path: 'user/:name', component: UserCmp },
          { path: 'simple', component: SimpleCmp, outlet: 'right' }
        ] }
      ]);

      const fixture = tcb.createFakeAsync(RootCmp);

      router.navigateByUrl('/team/22/user/victor(right:simple)');
      advance(fixture);

      router.navigateByUrl('/');
      advance(fixture);

      expect(fixture.debugElement.nativeElement).toHaveText('');
    })));

  describe("router links", () => {
    it("should support string router links",
      fakeAsync(inject([Router, TestComponentBuilder], (router, tcb) => {
        router.resetConfig([
          { path: 'team/:id', component: TeamCmp, children: [
            { path: 'link', component: StringLinkCmp },
            { path: 'simple', component: SimpleCmp }
          ] }
        ]);

        const fixture = tcb.createFakeAsync(RootCmp);
        advance(fixture);

        router.navigateByUrl('/team/22/link');
        advance(fixture);
        expect(fixture.debugElement.nativeElement).toHaveText('team 22 { link, right:  }');

        const native = fixture.debugElement.nativeElement.querySelector("a");
        expect(native.getAttribute("href")).toEqual("/team/33/simple");
        native.click();
        advance(fixture);

        expect(fixture.debugElement.nativeElement).toHaveText('team 33 { simple, right:  }');
      })));

    it("should support absolute router links",
      fakeAsync(inject([Router, TestComponentBuilder], (router, tcb) => {
        router.resetConfig([
          { path: 'team/:id', component: TeamCmp, children: [
            { path: 'link', component: AbsoluteLinkCmp },
            { path: 'simple', component: SimpleCmp }
          ] }
        ]);

        const fixture = tcb.createFakeAsync(RootCmp);
        advance(fixture);

        router.navigateByUrl('/team/22/link');
        advance(fixture);
        expect(fixture.debugElement.nativeElement).toHaveText('team 22 { link, right:  }');

        const native = fixture.debugElement.nativeElement.querySelector("a");
        expect(native.getAttribute("href")).toEqual("/team/33/simple");
        native.click();
        advance(fixture);

        expect(fixture.debugElement.nativeElement).toHaveText('team 33 { simple, right:  }');
      })));

    it("should support relative router links",
      fakeAsync(inject([Router, TestComponentBuilder], (router, tcb) => {
        router.resetConfig([
          { path: 'team/:id', component: TeamCmp, children: [
            { path: 'link', component: RelativeLinkCmp },
            { path: 'simple', component: SimpleCmp }
          ] }
        ]);

        const fixture = tcb.createFakeAsync(RootCmp);
        advance(fixture);

        router.navigateByUrl('/team/22/link');
        advance(fixture);
        expect(fixture.debugElement.nativeElement)
          .toHaveText('team 22 { link, right:  }');

        const native = fixture.debugElement.nativeElement.querySelector("a");
        expect(native.getAttribute("href")).toEqual("/team/22/simple");
        native.click();
        advance(fixture);

        expect(fixture.debugElement.nativeElement)
          .toHaveText('team 22 { simple, right:  }');
      })));

    it("should support top-level link",
      fakeAsync(inject([Router, TestComponentBuilder], (router, tcb) => {
        let fixture = tcb.createFakeAsync(AbsoluteLinkCmp);
        advance(fixture);
        expect(fixture.debugElement.nativeElement).toHaveText('link');
      })));
  });
});

@Component({
  selector: 'link-cmp',
  template: `<a routerLink="/team/33/simple">link</a>`,
  directives: ROUTER_DIRECTIVES
})
class StringLinkCmp {}

@Component({
  selector: 'link-cmp',
  template: `<a [routerLink]="['/team/33/simple']">link</a>`,
  directives: ROUTER_DIRECTIVES
})
class AbsoluteLinkCmp {}

@Component({
  selector: 'link-cmp',
  template: `<a [routerLink]="['../simple']">link</a>`,
  directives: ROUTER_DIRECTIVES
})
class RelativeLinkCmp {}

@Component({
  selector: 'simple-cmp',
  template: `simple`,
  directives: ROUTER_DIRECTIVES
})
class SimpleCmp {
}

@Component({
  selector: 'team-cmp',
  template: `team {{id | async}} { <router-outlet></router-outlet>, right: <router-outlet name="right"></router-outlet> }`,
  directives: ROUTER_DIRECTIVES
})
class TeamCmp {
  id: Observable<string>;

  constructor(route: ActivatedRoute) {
    this.id = route.params.map(p => p['id']);
  }
}

@Component({
  selector: 'user-cmp',
  template: `user {{name | async}}`,
  directives: [ROUTER_DIRECTIVES]
})
class UserCmp {
  name: Observable<string>;
  constructor(route: ActivatedRoute) {
    this.name = route.params.map(p => p['name']);
  }
}

@Component({
  selector: 'root-cmp',
  template: `<router-outlet></router-outlet>`,
  directives: [ROUTER_DIRECTIVES]
})
class RootCmp {}

function advance(fixture: ComponentFixture<any>): void {
  tick();
  fixture.detectChanges();
}
