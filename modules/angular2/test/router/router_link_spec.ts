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
  TestComponentBuilder
} from 'angular2/testing_internal';

import {SpyRouter, SpyLocation} from './spies';

import {provide, Component, View} from 'angular2/core';
import {By} from 'angular2/src/core/debug';

import {
  Location,
  Router,
  RouteRegistry,
  RouterLink,
  RouterOutlet,
  Route,
  RouteParams,
  Instruction,
  ComponentInstruction
} from 'angular2/router';

import {DOM} from 'angular2/src/core/dom/dom_adapter';
import {ComponentInstruction_} from 'angular2/src/router/instruction';
import {PathRecognizer} from 'angular2/src/router/path_recognizer';
import {SyncRouteHandler} from 'angular2/src/router/sync_route_handler';

let dummyPathRecognizer = new PathRecognizer('', new SyncRouteHandler(null));
let dummyInstruction =
    new Instruction(new ComponentInstruction_('detail', [], dummyPathRecognizer), null, {});

export function main() {
  describe('router-link directive', function() {
    var tcb: TestComponentBuilder;

    beforeEachBindings(() => [
      provide(Location, {useValue: makeDummyLocation()}),
      provide(Router, {useValue: makeDummyRouter()})
    ]);

    beforeEach(inject([TestComponentBuilder], (tcBuilder) => { tcb = tcBuilder; }));

    it('should update a[href] attribute', inject([AsyncTestCompleter], (async) => {

         tcb.createAsync(TestComponent)
             .then((testComponent) => {
               testComponent.detectChanges();
               let anchorElement =
                   testComponent.debugElement.query(By.css('a.detail-view')).nativeElement;
               expect(DOM.getAttribute(anchorElement, 'href')).toEqual('detail');
               async.done();
             });
       }));


    it('should call router.navigate when a link is clicked',
       inject([AsyncTestCompleter, Router], (async, router) => {

         tcb.createAsync(TestComponent)
             .then((testComponent) => {
               testComponent.detectChanges();
               // TODO: shouldn't this be just 'click' rather than '^click'?
               testComponent.debugElement.query(By.css('a.detail-view'))
                   .triggerEventHandler('click', null);
               expect(router.spy('navigateByInstruction')).toHaveBeenCalledWith(dummyInstruction);
               async.done();
             });
       }));

    it('should call router.navigate when a link is clicked if target is _self',
       inject([AsyncTestCompleter, Router], (async, router) => {

         tcb.createAsync(TestComponent)
             .then((testComponent) => {
               testComponent.detectChanges();
               testComponent.debugElement.query(By.css('a.detail-view-self'))
                   .triggerEventHandler('click', null);
               expect(router.spy('navigateByInstruction')).toHaveBeenCalledWith(dummyInstruction);
               async.done();
             });
       }));

    it('should NOT call router.navigate when a link is clicked if target is set to other than _self',
       inject([AsyncTestCompleter, Router], (async, router) => {

         tcb.createAsync(TestComponent)
             .then((testComponent) => {
               testComponent.detectChanges();
               testComponent.debugElement.query(By.css('a.detail-view-blank'))
                   .triggerEventHandler('click', null);
               expect(router.spy('navigateByInstruction')).not.toHaveBeenCalled();
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
      <a [router-link]="['/Detail']"
         class="detail-view">
           detail view
      </a>
      <a [router-link]="['/Detail']"
         class="detail-view-self"
         target="_self">
           detail view with _self target
      </a>
      <a [router-link]="['/Detail']"
         class="detail-view-blank"
         target="_blank">
           detail view with _blank target
      </a>
    </div>`,
  directives: [RouterLink]
})
class TestComponent {
}

function makeDummyLocation() {
  var dl = new SpyLocation();
  dl.spy('prepareExternalUrl').andCallFake((url) => url);
  return dl;
}

function makeDummyRouter() {
  var dr = new SpyRouter();
  dr.spy('generate').andCallFake((routeParams) => dummyInstruction);
  dr.spy('isRouteActive').andCallFake((_) => false);
  dr.spy('navigateInstruction');
  return dr;
}
