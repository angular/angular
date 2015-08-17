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
  proxy,
  SpyObject,
  By
} from 'angular2/test_lib';

import {IMPLEMENTS} from 'angular2/src/facade/lang';

import {bind, Component, BaseView} from 'angular2/angular2';

import {Location, Router, RouterLink} from 'angular2/router';
import {Instruction, ComponentInstruction} from 'angular2/src/router/instruction';

import {DOM} from 'angular2/src/dom/dom_adapter';

var dummyInstruction = new Instruction(new ComponentInstruction('detail', [], null), null, {});

export function main() {
  describe('router-link directive', function() {

    beforeEachBindings(
        () =>
            [bind(Location).toValue(makeDummyLocation()), bind(Router).toValue(makeDummyRouter())]);


    it('should update a[href] attribute',
       inject([TestComponentBuilder, AsyncTestCompleter], (tcb, async) => {

         tcb.createAsync(TestComponent)
             .then((testComponent) => {
               testComponent.detectChanges();
               let anchorElement = testComponent.query(By.css('a')).nativeElement;
               expect(DOM.getAttribute(anchorElement, 'href')).toEqual('/detail');
               async.done();
             });
       }));


    it('should call router.navigate when a link is clicked',
       inject([TestComponentBuilder, AsyncTestCompleter, Router], (tcb, async, router) => {

         tcb.createAsync(TestComponent)
             .then((testComponent) => {
               testComponent.detectChanges();
               // TODO: shouldn't this be just 'click' rather than '^click'?
               testComponent.query(By.css('a')).triggerEventHandler('^click', {});
               expect(router.spy('navigateInstruction')).toHaveBeenCalledWith(dummyInstruction);
               async.done();
             });
       }));
  });
}


@Component({selector: 'test-component'})
@BaseView({
  template: `
    <div>
      <a [router-link]="['/detail']">detail view</a>
    </div>`,
  directives: [RouterLink]
})
class TestComponent {
}


@proxy
@IMPLEMENTS(Location)
class DummyLocation extends SpyObject {
  noSuchMethod(m) { return super.noSuchMethod(m) }
}

function makeDummyLocation() {
  var dl = new DummyLocation();
  dl.spy('normalizeAbsolutely').andCallFake((url) => url);
  return dl;
}


@proxy
@IMPLEMENTS(Router)
class DummyRouter extends SpyObject {
  noSuchMethod(m) { return super.noSuchMethod(m) }
}

function makeDummyRouter() {
  var dr = new DummyRouter();
  dr.spy('generate').andCallFake((routeParams) => dummyInstruction);
  dr.spy('navigateInstruction');
  return dr;
}
