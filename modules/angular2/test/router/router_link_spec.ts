import {
  AsyncTestCompleter,
  beforeEach,
  ddescribe,
  xdescribe,
  describe,
  dispatchEvent,
  expect,
  iit,
  inject,
  beforeEachBindings,
  it,
  xit,
  TestComponentBuilder,
  By
} from 'angular2/test_lib';

import {SpyRouter, SpyLocation} from './spies';

import {bind, Component, View} from 'angular2/angular2';

import {
  Location,
  Router,
  RootRouter,
  RouteRegistry,
  Pipeline,
  RouterLink,
  RouterOutlet,
  Route,
  RouteParams
} from 'angular2/router';
import {Instruction, ComponentInstruction} from 'angular2/src/router/instruction';

import {DOM} from 'angular2/src/core/dom/dom_adapter';

var dummyInstruction = new Instruction(new ComponentInstruction('detail', [], null), null, {});

export function main() {
  describe('router-link directive', function() {
    var tcb: TestComponentBuilder;

    beforeEachBindings(
        () =>
            [bind(Location).toValue(makeDummyLocation()), bind(Router).toValue(makeDummyRouter())]);

    beforeEach(inject([TestComponentBuilder], (tcBuilder) => { tcb = tcBuilder; }));

    it('should update a[href] attribute', inject([AsyncTestCompleter], (async) => {

         tcb.createAsync(TestComponent)
             .then((testComponent) => {
               testComponent.detectChanges();
               let anchorElement = testComponent.query(By.css('a')).nativeElement;
               expect(DOM.getAttribute(anchorElement, 'href')).toEqual('/detail');
               async.done();
             });
       }));


    it('should call router.navigate when a link is clicked',
       inject([AsyncTestCompleter, Router], (async, router) => {

         tcb.createAsync(TestComponent)
             .then((testComponent) => {
               testComponent.detectChanges();
               // TODO: shouldn't this be just 'click' rather than '^click'?
               testComponent.query(By.css('a')).triggerEventHandler('^click', null);
               expect(router.spy('navigateInstruction')).toHaveBeenCalledWith(dummyInstruction);
               async.done();
             });
       }));
  });
}

@Component({selector: 'my-comp'})
class MyComp {
  name;
}

@Component({selector: 'user-cmp'})
@View({template: "hello {{user}}"})
class UserCmp {
  user: string;
  constructor(params: RouteParams) { this.user = params.get('name'); }
}

@Component({selector: 'test-component'})
@View({
  template: `
    <div>
      <a [router-link]="['/detail']">detail view</a>
    </div>`,
  directives: [RouterLink]
})
class TestComponent {
}

function makeDummyLocation() {
  var dl = new SpyLocation();
  dl.spy('normalizeAbsolutely').andCallFake((url) => url);
  return dl;
}

function makeDummyRouter() {
  var dr = new SpyRouter();
  dr.spy('generate').andCallFake((routeParams) => dummyInstruction);
  dr.spy('navigateInstruction');
  return dr;
}
