import {
  RootTestComponent,
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

import {Router, RouterOutlet, RouterLink, RouteParams, RouteData, Location} from 'angular2/router';
import {
  RouteConfig,
  Route,
  AuxRoute,
  AsyncRoute,
  Redirect
} from 'angular2/src/router/route_config_decorator';

import {TEST_ROUTER_PROVIDERS, RootCmp, compile} from './util';
import {HelloCmp, RedirectToParentCmp} from './impl/fixture_components';

var cmpInstanceCount;
var childCmpInstanceCount;

export function main() {
  describe('redirects', () => {

    var tcb: TestComponentBuilder;
    var rootTC: RootTestComponent;
    var rtr;

    beforeEachProviders(() => TEST_ROUTER_PROVIDERS);

    beforeEach(inject([TestComponentBuilder, Router], (tcBuilder, router) => {
      tcb = tcBuilder;
      rtr = router;
      childCmpInstanceCount = 0;
      cmpInstanceCount = 0;
    }));


    it('should apply when navigating by URL',
       inject([AsyncTestCompleter, Location], (async, location) => {
         compile(tcb)
             .then((rtc) => {rootTC = rtc})
             .then((_) => rtr.config([
               new Redirect({path: '/original', redirectTo: ['Hello']}),
               new Route({path: '/redirected', component: HelloCmp, name: 'Hello'})
             ]))
             .then((_) => rtr.navigateByUrl('/original'))
             .then((_) => {
               rootTC.detectChanges();
               expect(rootTC.debugElement.nativeElement).toHaveText('hello');
               expect(location.urlChanges).toEqual(['/redirected']);
               async.done();
             });
       }));


    it('should recognize and apply absolute redirects',
       inject([AsyncTestCompleter, Location], (async, location) => {
         compile(tcb)
             .then((rtc) => {rootTC = rtc})
             .then((_) => rtr.config([
               new Redirect({path: '/original', redirectTo: ['/Hello']}),
               new Route({path: '/redirected', component: HelloCmp, name: 'Hello'})
             ]))
             .then((_) => rtr.navigateByUrl('/original'))
             .then((_) => {
               rootTC.detectChanges();
               expect(rootTC.debugElement.nativeElement).toHaveText('hello');
               expect(location.urlChanges).toEqual(['/redirected']);
               async.done();
             });
       }));


    it('should recognize and apply relative child redirects',
       inject([AsyncTestCompleter, Location], (async, location) => {
         compile(tcb)
             .then((rtc) => {rootTC = rtc})
             .then((_) => rtr.config([
               new Redirect({path: '/original', redirectTo: ['./Hello']}),
               new Route({path: '/redirected', component: HelloCmp, name: 'Hello'})
             ]))
             .then((_) => rtr.navigateByUrl('/original'))
             .then((_) => {
               rootTC.detectChanges();
               expect(rootTC.debugElement.nativeElement).toHaveText('hello');
               expect(location.urlChanges).toEqual(['/redirected']);
               async.done();
             });
       }));


    it('should recognize and apply relative parent redirects',
       inject([AsyncTestCompleter, Location], (async, location) => {
         compile(tcb)
             .then((rtc) => {rootTC = rtc})
             .then((_) => rtr.config([
               new Route({path: '/original/...', component: RedirectToParentCmp}),
               new Route({path: '/redirected', component: HelloCmp, name: 'HelloSib'})
             ]))
             .then((_) => rtr.navigateByUrl('/original/child-redirect'))
             .then((_) => {
               rootTC.detectChanges();
               expect(rootTC.debugElement.nativeElement).toHaveText('hello');
               expect(location.urlChanges).toEqual(['/redirected']);
               async.done();
             });
       }));
  });
}
