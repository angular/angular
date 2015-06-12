import {
  AsyncTestCompleter,
  beforeEach,
  ddescribe,
  xdescribe,
  describe,
  el,
  dispatchEvent,
  expect,
  iit,
  inject,
  beforeEachBindings,
  it,
  xit,
  viewRootNodes
} from 'angular2/test_lib';

import {TestBed, ViewProxy} from 'angular2/src/test_lib/test_bed';
import {Injector} from 'angular2/di';
import {Component, View, onDestroy} from 'angular2/annotations';
import {Locals} from 'angular2/change_detection';
import * as viewAnn from 'angular2/src/core/annotations_impl/view';
import {DynamicComponentLoader} from 'angular2/src/core/compiler/dynamic_component_loader';
import {ElementRef} from 'angular2/src/core/compiler/element_ref';
import {NgIf} from 'angular2/src/directives/ng_if';
import {DomRenderer, DOCUMENT_TOKEN} from 'angular2/src/render/dom/dom_renderer';
import {DOM} from 'angular2/src/dom/dom_adapter';
import {AppViewManager} from 'angular2/src/core/compiler/view_manager';

export function main() {
  describe('DynamicComponentLoader', function() {
    describe("loading into existing location", () => {
      function ijTestBed(fn: (ts: TestBed, async: AsyncTestCompleter) => void) {
        return inject([TestBed, AsyncTestCompleter], fn);
      }

      it('should work', ijTestBed((tb: TestBed, async) => {
           tb.overrideView(MyComp, new viewAnn.View({
             template: '<dynamic-comp #dynamic></dynamic-comp>',
             directives: [DynamicComp]
           }));

           tb.createView(MyComp).then((view) => {
             var dynamicComponent = view.rawView.locals.get("dynamic");
             expect(dynamicComponent).toBeAnInstanceOf(DynamicComp);

             dynamicComponent.done.then((_) => {
               view.detectChanges();
               expect(view.rootNodes).toHaveText('hello');
               async.done();
             });
           });
         }));

      it('should inject dependencies of the dynamically-loaded component',
         ijTestBed((tb: TestBed, async) => {
           tb.overrideView(MyComp, new viewAnn.View({
             template: '<dynamic-comp #dynamic></dynamic-comp>',
             directives: [DynamicComp]
           }));

           tb.createView(MyComp).then((view) => {
             var dynamicComponent = view.rawView.locals.get("dynamic");
             dynamicComponent.done.then((ref) => {
               expect(ref.instance.dynamicallyCreatedComponentService)
                   .toBeAnInstanceOf(DynamicallyCreatedComponentService);
               async.done();
             });
           });
         }));

      it('should allow destroying dynamically-loaded components',
         inject([TestBed, AsyncTestCompleter], (tb, async) => {
           tb.overrideView(MyComp, new viewAnn.View({
             template: '<dynamic-comp #dynamic></dynamic-comp>',
             directives: [DynamicComp]
           }));

           tb.createView(MyComp).then((view) => {
             var dynamicComponent = (<Locals>view.rawView.locals).get("dynamic");
             dynamicComponent.done.then((ref) => {
               view.detectChanges();
               expect(view.rootNodes).toHaveText("hello");

               ref.dispose();

               expect(ref.instance.destroyed).toBe(true);
               expect(view.rootNodes).toHaveText("");
               async.done();
             });
           });
         }));

      it('should allow to destroy and create them via viewcontainer directives',
         ijTestBed((tb: TestBed, async) => {
           tb.overrideView(MyComp, new viewAnn.View({
             template:
                 '<div><dynamic-comp #dynamic template="ng-if: ctxBoolProp"></dynamic-comp></div>',
             directives: [DynamicComp, NgIf]
           }));

           tb.createView(MyComp).then((view) => {
             view.context.ctxBoolProp = true;
             view.detectChanges();
             var dynamicComponent = view.rawView.viewContainers[0].views[0].locals.get("dynamic");
             var promise = dynamicComponent.done.then((_) => {
               view.detectChanges();
               expect(view.rootNodes).toHaveText('hello');

               view.context.ctxBoolProp = false;
               view.detectChanges();

               expect(view.rawView.viewContainers[0].views.length).toBe(0);
               expect(view.rootNodes).toHaveText('');

               view.context.ctxBoolProp = true;
               view.detectChanges();

               var dynamicComponent = view.rawView.viewContainers[0].views[0].locals.get("dynamic");
               return dynamicComponent.done;
             });
             promise.then((_) => {
               view.detectChanges();
               expect(view.rootNodes).toHaveText('hello');
               async.done();
             });
           });
         }));
    });

    describe("loading next to an existing location", () => {
      it('should work',
         inject([DynamicComponentLoader, TestBed, AsyncTestCompleter], (loader, tb: TestBed,
                                                                        async) => {
           tb.overrideView(
               MyComp,
               new viewAnn.View(
                   {template: '<div><location #loc></location></div>', directives: [Location]}));

           tb.createView(MyComp).then((view) => {
             var location = view.rawView.locals.get("loc");

             loader.loadNextToExistingLocation(DynamicallyLoaded, location.elementRef)
                 .then(ref => {
                   expect(view.rootNodes).toHaveText("Location;DynamicallyLoaded;");
                   async.done();
                 });
           });
         }));

      it('should return a disposable component ref',
         inject([DynamicComponentLoader, TestBed, AsyncTestCompleter], (loader, tb: TestBed,
                                                                        async) => {
           tb.overrideView(
               MyComp,
               new viewAnn.View(
                   {template: '<div><location #loc></location></div>', directives: [Location]}));

           tb.createView(MyComp).then((view) => {
             var location = view.rawView.locals.get("loc");
             loader.loadNextToExistingLocation(DynamicallyLoaded, location.elementRef)
                 .then(ref => {
                   loader.loadNextToExistingLocation(DynamicallyLoaded2, location.elementRef)
                       .then(ref2 => {
                         expect(view.rootNodes)
                             .toHaveText("Location;DynamicallyLoaded;DynamicallyLoaded2;")

                                 ref2.dispose();

                         expect(view.rootNodes)
                             .toHaveText("Location;DynamicallyLoaded;")

                                 async.done();
                       });
                 });
           });
         }));

      it('should update host properties',
         inject([DynamicComponentLoader, TestBed, AsyncTestCompleter], (loader, tb: TestBed,
                                                                        async) => {
           tb.overrideView(
               MyComp,
               new viewAnn.View(
                   {template: '<div><location #loc></location></div>', directives: [Location]}));

           tb.createView(MyComp).then((view) => {
             var location = view.rawView.locals.get("loc");

             loader.loadNextToExistingLocation(DynamicallyLoadedWithHostProps, location.elementRef)
                 .then(ref => {
                   ref.instance.id = "new value";

                   view.detectChanges();

                   var newlyInsertedElement = DOM.childNodesAsList(view.rootNodes[0])[1];
                   expect(newlyInsertedElement.id)
                       .toEqual("new value")

                           async.done();
                 });
           });
         }));
    });

    describe('loading into a new location', () => {
      it('should allow to create, update and destroy components',
         inject([TestBed, AsyncTestCompleter], (tb: TestBed, async) => {
           tb.overrideView(MyComp, new viewAnn.View({
             template: '<imp-ng-cmp #impview></imp-ng-cmp>',
             directives: [ImperativeViewComponentUsingNgComponent]
           }));
           tb.createView(MyComp).then((view) => {
             var userViewComponent = view.rawView.locals.get("impview");

             userViewComponent.done.then((childComponentRef) => {
               view.detectChanges();

               expect(view.rootNodes).toHaveText('hello');

               childComponentRef.instance.ctxProp = 'new';

               view.detectChanges();

               expect(view.rootNodes).toHaveText('new');

               childComponentRef.dispose();

               expect(view.rootNodes).toHaveText('');

               async.done();
             });
           });
         }));

    });

    describe('loadAsRoot', () => {
      it('should allow to create, update and destroy components',
         inject([TestBed, AsyncTestCompleter, DynamicComponentLoader, DOCUMENT_TOKEN, Injector],
                (tb: TestBed, async, dcl, doc, injector) => {
                  var rootEl = el('<child-cmp></child-cmp>');
                  DOM.appendChild(doc.body, rootEl);
                  dcl.loadAsRoot(ChildComp, null, injector)
                      .then((componentRef) => {
                        var view = new ViewProxy(componentRef);
                        expect(rootEl.parentNode).toBe(doc.body);

                        view.detectChanges();

                        expect(rootEl).toHaveText('hello');

                        componentRef.instance.ctxProp = 'new';

                        view.detectChanges();

                        expect(rootEl).toHaveText('new');

                        componentRef.dispose();

                        expect(rootEl).toHaveText('');
                        expect(rootEl.parentNode).toBe(doc.body);

                        async.done();
                      });
                }));

    });

  });
}

@Component({selector: 'imp-ng-cmp'})
@View({template: ''})
class ImperativeViewComponentUsingNgComponent {
  done;

  constructor(self: ElementRef, dynamicComponentLoader: DynamicComponentLoader,
              viewManager: AppViewManager, renderer: DomRenderer) {
    var div = el('<div id="impHost"></div>');
    var shadowViewRef = viewManager.getComponentView(self);
    renderer.setComponentViewRootNodes(shadowViewRef.render, [div]);
    this.done = dynamicComponentLoader.loadIntoNewLocation(ChildComp, self, null)
                    .then((componentRef) => {
                      var element = renderer.getRootNodes(componentRef.hostView.render)[0];
                      DOM.appendChild(div, element);
                      return componentRef;
                    });
  }
}

@Component({
  selector: 'child-cmp',
})
@View({template: '{{ctxProp}}'})
class ChildComp {
  ctxProp: string;
  constructor() { this.ctxProp = 'hello'; }
}


class DynamicallyCreatedComponentService {}

@Component({selector: 'dynamic-comp'})
class DynamicComp {
  done;

  constructor(loader: DynamicComponentLoader, location: ElementRef) {
    this.done = loader.loadIntoExistingLocation(DynamicallyCreatedCmp, location);
  }
}

@Component({
  selector: 'hello-cmp',
  appInjector: [DynamicallyCreatedComponentService],
  lifecycle: [onDestroy]
})
@View({template: "{{greeting}}"})
class DynamicallyCreatedCmp {
  greeting: string;
  dynamicallyCreatedComponentService: DynamicallyCreatedComponentService;
  destroyed: boolean = false;

  constructor(a: DynamicallyCreatedComponentService) {
    this.greeting = "hello";
    this.dynamicallyCreatedComponentService = a;
  }

  onDestroy() { this.destroyed = true; }
}

@Component({selector: 'dummy'})
@View({template: "DynamicallyLoaded;"})
class DynamicallyLoaded {
}

@Component({selector: 'dummy'})
@View({template: "DynamicallyLoaded2;"})
class DynamicallyLoaded2 {
}

@Component({selector: 'dummy', host: {'[id]': 'id'}})
@View({template: "DynamicallyLoadedWithHostProps;"})
class DynamicallyLoadedWithHostProps {
  id: string;

  constructor() { this.id = "default"; }
}

@Component({selector: 'location'})
@View({template: "Location;"})
class Location {
  elementRef: ElementRef;

  constructor(elementRef: ElementRef) { this.elementRef = elementRef; }
}

@Component({selector: 'my-comp'})
@View({directives: []})
class MyComp {
  ctxBoolProp: boolean;

  constructor() { this.ctxBoolProp = false; }
}
