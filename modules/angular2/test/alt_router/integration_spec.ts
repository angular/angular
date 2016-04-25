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
  xit
} from 'angular2/testing_internal';
import {provide, Component, ComponentResolver} from 'angular2/core';

import {
  Router,
  RouterOutletMap,
  RouteSegment,
  Route,
  ROUTER_DIRECTIVES,
  Routes,
  RouterUrlParser,
  DefaultRouterUrlParser,
  OnActivate
} from 'angular2/alt_router';

export function main() {
  describe('navigation', () => {
    beforeEachProviders(() => [
      provide(RouterUrlParser, {useClass: DefaultRouterUrlParser}),
      RouterOutletMap,
      provide(Router,
              {
                useFactory: (resolver, urlParser, outletMap) =>
                                new Router(RootCmp, resolver, urlParser, outletMap),
                deps: [ComponentResolver, RouterUrlParser, RouterOutletMap]
              })
    ]);

    it('should support nested routes',
       inject([AsyncTestCompleter, Router, TestComponentBuilder], (async, router, tcb) => {
         let fixture;
         compileRoot(tcb)
             .then((rtc) => {fixture = rtc})
             .then((_) => router.navigateByUrl('/team/22/user/victor'))
             .then((_) => {
               fixture.detectChanges();
               expect(fixture.debugElement.nativeElement)
                   .toHaveText('team 22 { hello victor, aux:  }');
               async.done();
             });
       }));

    it('should support aux routes',
       inject([AsyncTestCompleter, Router, TestComponentBuilder], (async, router, tcb) => {
         let fixture;
         compileRoot(tcb)
             .then((rtc) => {fixture = rtc})
             .then((_) => router.navigateByUrl('/team/22/user/victor(/simple)'))
             .then((_) => {
               fixture.detectChanges();
               expect(fixture.debugElement.nativeElement)
                   .toHaveText('team 22 { hello victor, aux: simple }');
               async.done();
             });
       }));

    it('should unload outlets',
       inject([AsyncTestCompleter, Router, TestComponentBuilder], (async, router, tcb) => {
         let fixture;
         compileRoot(tcb)
             .then((rtc) => {fixture = rtc})
             .then((_) => router.navigateByUrl('/team/22/user/victor(/simple)'))
             .then((_) => router.navigateByUrl('/team/22/user/victor'))
             .then((_) => {
               fixture.detectChanges();
               expect(fixture.debugElement.nativeElement)
                   .toHaveText('team 22 { hello victor, aux:  }');
               async.done();
             });
       }));

    it('should unload nested outlets',
       inject([AsyncTestCompleter, Router, TestComponentBuilder], (async, router, tcb) => {
         let fixture;
         compileRoot(tcb)
             .then((rtc) => {fixture = rtc})
             .then((_) => router.navigateByUrl('/team/22/user/victor(/simple)'))
             .then((_) => router.navigateByUrl('/'))
             .then((_) => {
               fixture.detectChanges();
               expect(fixture.debugElement.nativeElement).toHaveText('');
               async.done();
             });
       }));

    it('should update nested routes when url changes',
       inject([AsyncTestCompleter, Router, TestComponentBuilder], (async, router, tcb) => {
         let fixture;
         let team1;
         let team2;
         compileRoot(tcb)
             .then((rtc) => {fixture = rtc})
             .then((_) => router.navigateByUrl('/team/22/user/victor'))
             .then((_) => { team1 = fixture.debugElement.children[1].componentInstance; })
             .then((_) => router.navigateByUrl('/team/22/user/fedor'))
             .then((_) => { team2 = fixture.debugElement.children[1].componentInstance; })
             .then((_) => {
               fixture.detectChanges();
               expect(team1).toBe(team2);
               expect(fixture.debugElement.nativeElement)
                   .toHaveText('team 22 { hello fedor, aux:  }');
               async.done();
             });
       }));

    // unload unused nodes
  });
}

function compileRoot(tcb: TestComponentBuilder): Promise<ComponentFixture> {
  return tcb.createAsync(RootCmp);
}

@Component({selector: 'user-cmp', template: `hello {{user}}`})
class UserCmp implements OnActivate {
  user: string;
  routerOnActivate(s: RouteSegment, a?, b?, c?) { this.user = s.getParam('name'); }
}

@Component({selector: 'simple-cmp', template: `simple`})
class SimpleCmp {
}

@Component({
  selector: 'team-cmp',
  template: `team {{id}} { <router-outlet></router-outlet>, aux: <router-outlet name="aux"></router-outlet> }`,
  directives: [ROUTER_DIRECTIVES]
})
@Routes([
  new Route({path: 'user/:name', component: UserCmp}),
  new Route({path: 'simple', component: SimpleCmp})
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
