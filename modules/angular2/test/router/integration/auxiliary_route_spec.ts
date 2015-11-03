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

import {provide, Component, Injector, Inject} from 'angular2/core';

import {Router, ROUTER_DIRECTIVES, RouteParams, RouteData, Location} from 'angular2/router';
import {RouteConfig, Route, AuxRoute, Redirect} from 'angular2/src/router/route_config_decorator';

import {TEST_ROUTER_PROVIDERS, RootCmp, compile} from './util';

var cmpInstanceCount;
var childCmpInstanceCount;

export function main() {
  describe('auxiliary routes', () => {

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

    it('should recognize and navigate from the URL', inject([AsyncTestCompleter], (async) => {
         compile(tcb, `main {<router-outlet></router-outlet>} | aux {<router-outlet name="modal"></router-outlet>}`)
             .then((rtc) => {rootTC = rtc})
             .then((_) => rtr.config([
               new Route({path: '/hello', component: HelloCmp, name: 'Hello'}),
               new AuxRoute({path: '/modal', component: ModalCmp, name: 'Aux'})
             ]))
             .then((_) => rtr.navigateByUrl('/hello(modal)'))
             .then((_) => {
               rootTC.detectChanges();
               expect(rootTC.debugElement.nativeElement).toHaveText('main {hello} | aux {modal}');
               async.done();
             });
       }));

    it('should navigate via the link DSL', inject([AsyncTestCompleter], (async) => {
         compile(tcb, `main {<router-outlet></router-outlet>} | aux {<router-outlet name="modal"></router-outlet>}`)
             .then((rtc) => {rootTC = rtc})
             .then((_) => rtr.config([
               new Route({path: '/hello', component: HelloCmp, name: 'Hello'}),
               new AuxRoute({path: '/modal', component: ModalCmp, name: 'Modal'})
             ]))
             .then((_) => rtr.navigate(['/Hello', ['Modal']]))
             .then((_) => {
               rootTC.detectChanges();
               expect(rootTC.debugElement.nativeElement).toHaveText('main {hello} | aux {modal}');
               async.done();
             });
       }));
  });
}


@Component({selector: 'hello-cmp', template: `{{greeting}}`})
class HelloCmp {
  greeting: string;
  constructor() { this.greeting = 'hello'; }
}

@Component({selector: 'modal-cmp', template: `modal`})
class ModalCmp {
}

@Component({
  selector: 'aux-cmp',
  template: 'main {<router-outlet></router-outlet>} | ' +
                'aux {<router-outlet name="modal"></router-outlet>}',
  directives: [ROUTER_DIRECTIVES],
})
@RouteConfig([
  new Route({path: '/hello', component: HelloCmp, name: 'Hello'}),
  new AuxRoute({path: '/modal', component: ModalCmp, name: 'Aux'})
])
class AuxCmp {
}
