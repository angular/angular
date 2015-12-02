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

import {provide, Component, Injector, Inject} from 'angular2/core';

import {Router, ROUTER_DIRECTIVES, RouteParams, RouteData, Location} from 'angular2/router';
import {RouteConfig, Route, AuxRoute, Redirect} from 'angular2/src/router/route_config_decorator';

import {TEST_ROUTER_PROVIDERS, RootCmp, compile, clickOnElement, getHref} from './util';

function getLinkElement(rtc: ComponentFixture) {
  return rtc.debugElement.componentViewChildren[0].nativeElement;
}

var cmpInstanceCount;
var childCmpInstanceCount;

export function main() {
  describe('auxiliary routes', () => {

    var tcb: TestComponentBuilder;
    var fixture: ComponentFixture;
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
             .then((rtc) => {fixture = rtc})
             .then((_) => rtr.config([
               new Route({path: '/hello', component: HelloCmp, name: 'Hello'}),
               new AuxRoute({path: '/modal', component: ModalCmp, name: 'Aux'})
             ]))
             .then((_) => rtr.navigateByUrl('/hello(modal)'))
             .then((_) => {
               fixture.detectChanges();
               expect(fixture.debugElement.nativeElement).toHaveText('main {hello} | aux {modal}');
               async.done();
             });
       }));

    it('should navigate via the link DSL', inject([AsyncTestCompleter], (async) => {
         compile(tcb, `main {<router-outlet></router-outlet>} | aux {<router-outlet name="modal"></router-outlet>}`)
             .then((rtc) => {fixture = rtc})
             .then((_) => rtr.config([
               new Route({path: '/hello', component: HelloCmp, name: 'Hello'}),
               new AuxRoute({path: '/modal', component: ModalCmp, name: 'Modal'})
             ]))
             .then((_) => rtr.navigate(['/Hello', ['Modal']]))
             .then((_) => {
               fixture.detectChanges();
               expect(fixture.debugElement.nativeElement).toHaveText('main {hello} | aux {modal}');
               async.done();
             });
       }));

    it('should generate a link URL', inject([AsyncTestCompleter], (async) => {
         compile(
             tcb,
             `<a [router-link]="['/Hello', ['Modal']]">open modal</a> | main {<router-outlet></router-outlet>} | aux {<router-outlet name="modal"></router-outlet>}`)
             .then((rtc) => {fixture = rtc})
             .then((_) => rtr.config([
               new Route({path: '/hello', component: HelloCmp, name: 'Hello'}),
               new AuxRoute({path: '/modal', component: ModalCmp, name: 'Modal'})
             ]))
             .then((_) => {
               fixture.detectChanges();
               expect(getHref(getLinkElement(fixture))).toEqual('/hello(modal)');
               async.done();
             });
       }));

    it('should navigate from a link click',
       inject([AsyncTestCompleter, Location], (async, location) => {
         compile(
             tcb,
             `<a [router-link]="['/Hello', ['Modal']]">open modal</a> | main {<router-outlet></router-outlet>} | aux {<router-outlet name="modal"></router-outlet>}`)
             .then((rtc) => {fixture = rtc})
             .then((_) => rtr.config([
               new Route({path: '/hello', component: HelloCmp, name: 'Hello'}),
               new AuxRoute({path: '/modal', component: ModalCmp, name: 'Modal'})
             ]))
             .then((_) => {
               fixture.detectChanges();
               expect(fixture.debugElement.nativeElement)
                   .toHaveText('open modal | main {} | aux {}');

               rtr.subscribe((_) => {
                 fixture.detectChanges();
                 expect(fixture.debugElement.nativeElement)
                     .toHaveText('open modal | main {hello} | aux {modal}');
                 expect(location.urlChanges).toEqual(['/hello(modal)']);
                 async.done();
               });

               clickOnElement(getLinkElement(fixture));
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
