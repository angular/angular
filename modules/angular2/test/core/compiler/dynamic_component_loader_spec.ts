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
  viewRootNodes,
  TestComponentBuilder
} from 'angular2/test_lib';

import {TestBed, ViewProxy} from 'angular2/src/test_lib/test_bed';
import {Injector} from 'angular2/di';
import {Component, View, onDestroy} from 'angular2/annotations';
import * as viewAnn from 'angular2/src/core/annotations_impl/view';
import {DynamicComponentLoader} from 'angular2/src/core/compiler/dynamic_component_loader';
import {ElementRef} from 'angular2/src/core/compiler/element_ref';
import {DOCUMENT_TOKEN} from 'angular2/src/render/dom/dom_renderer';
import {DOM} from 'angular2/src/dom/dom_adapter';

export function main() {
  describe('DynamicComponentLoader', function() {
    describe("loading into a location", () => {
      it('should work',
         inject([DynamicComponentLoader, TestComponentBuilder, AsyncTestCompleter],
                (loader, tcb: TestComponentBuilder, async) => {
                  tcb.overrideView(
                         MyComp,
                         new viewAnn.View(
                             {template: '<location #loc></location>', directives: [Location]}))
                      .createAsync(MyComp)
                      .then((tc) => {

                        loader.loadIntoLocation(DynamicallyLoaded, tc.elementRef, 'loc')
                            .then(ref => {
                              expect(tc.domElement).toHaveText("Location;DynamicallyLoaded;");
                              async.done();
                            });
                      });
                }));

      it('should return a disposable component ref',
         inject([DynamicComponentLoader, TestComponentBuilder, AsyncTestCompleter],
                (loader, tcb: TestComponentBuilder, async) => {
                  tcb.overrideView(
                         MyComp,
                         new viewAnn.View(
                             {template: '<location #loc></location>', directives: [Location]}))
                      .createAsync(MyComp)
                      .then((tc) => {

                        loader.loadIntoLocation(DynamicallyLoaded, tc.elementRef, 'loc')
                            .then(ref => {
                              ref.dispose();
                              expect(tc.domElement).toHaveText("Location;");
                              async.done();
                            });
                      });
                }));

      it('should update host properties',
         inject(
             [DynamicComponentLoader, TestComponentBuilder, AsyncTestCompleter],
             (loader, tcb: TestComponentBuilder, async) => {
               tcb.overrideView(
                      MyComp, new viewAnn.View(
                                  {template: '<location #loc></location>', directives: [Location]}))
                   .createAsync(MyComp)
                   .then((tc) => {
                     loader.loadIntoLocation(DynamicallyLoadedWithHostProps, tc.elementRef, 'loc')
                         .then(ref => {
                           ref.instance.id = "new value";

                           tc.detectChanges();

                           var newlyInsertedElement = DOM.childNodes(tc.domElement)[1];
                           expect(newlyInsertedElement.id)
                               .toEqual("new value")

                                   async.done();
                         });
                   });
             }));

      it('should throw if the variable does not exist',
         inject([DynamicComponentLoader, TestComponentBuilder, AsyncTestCompleter],
                (loader, tcb: TestComponentBuilder, async) => {
                  tcb.overrideView(
                         MyComp,
                         new viewAnn.View(
                             {template: '<location #loc></location>', directives: [Location]}))
                      .createAsync(MyComp)
                      .then((tc) => {
                        expect(() => loader.loadIntoLocation(DynamicallyLoadedWithHostProps,
                                                             tc.elementRef, 'someUnknownVariable'))
                            .toThrowError('Could not find variable someUnknownVariable');
                        async.done();
                      });
                }));
    });

    describe("loading next to a location", () => {
      it('should work',
         inject([DynamicComponentLoader, TestBed, AsyncTestCompleter], (loader, tb: TestBed,
                                                                        async) => {
           tb.overrideView(
               MyComp,
               new viewAnn.View(
                   {template: '<div><location #loc></location></div>', directives: [Location]}));

           tb.createView(MyComp).then((view) => {
             var location = view.rawView.locals.get("loc");

             loader.loadNextToLocation(DynamicallyLoaded, location.elementRef)
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
             loader.loadNextToLocation(DynamicallyLoaded, location.elementRef)
                 .then(ref => {
                   loader.loadNextToLocation(DynamicallyLoaded2, location.elementRef)
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

             loader.loadNextToLocation(DynamicallyLoadedWithHostProps, location.elementRef)
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

@Component({
  selector: 'child-cmp',
})
@View({template: '{{ctxProp}}'})
class ChildComp {
  ctxProp: string;
  constructor() { this.ctxProp = 'hello'; }
}


class DynamicallyCreatedComponentService {}

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
