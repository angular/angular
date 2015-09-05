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
  TestComponentBuilder,
  RootTestComponent
} from 'angular2/test_lib';

import {OnDestroy} from 'angular2/lifecycle_hooks';
import {Injector, NgIf} from 'angular2/core';
import {inspectElement, By} from 'angular2/src/core/debug';
import {Component, View, ViewMetadata} from 'angular2/src/core/metadata';
import {DynamicComponentLoader} from 'angular2/src/core/compiler/dynamic_component_loader';
import {ElementRef} from 'angular2/src/core/compiler/element_ref';
import {DOCUMENT} from 'angular2/src/core/render/render';
import {DOM} from 'angular2/src/core/dom/dom_adapter';

export function main() {
  describe('DynamicComponentLoader', function() {
    describe("loading into a location", () => {
      it('should work',
         inject([DynamicComponentLoader, TestComponentBuilder, AsyncTestCompleter],
                (loader, tcb: TestComponentBuilder, async) => {
                  tcb.overrideView(
                         MyComp,
                         new ViewMetadata(
                             {template: '<location #loc></location>', directives: [Location]}))
                      .createAsync(MyComp)
                      .then((tc) => {

                        loader.loadIntoLocation(DynamicallyLoaded, tc.elementRef, 'loc')
                            .then(ref => {
                              expect(tc.nativeElement).toHaveText("Location;DynamicallyLoaded;");
                              async.done();
                            });
                      });
                }));

      it('should return a disposable component ref',
         inject([DynamicComponentLoader, TestComponentBuilder, AsyncTestCompleter],
                (loader, tcb: TestComponentBuilder, async) => {
                  tcb.overrideView(
                         MyComp,
                         new ViewMetadata(
                             {template: '<location #loc></location>', directives: [Location]}))
                      .createAsync(MyComp)
                      .then((tc) => {

                        loader.loadIntoLocation(DynamicallyLoaded, tc.elementRef, 'loc')
                            .then(ref => {
                              ref.dispose();
                              expect(tc.nativeElement).toHaveText("Location;");
                              async.done();
                            });
                      });
                }));

      it('should allow to dispose even if the location has been removed',
         inject([DynamicComponentLoader, TestComponentBuilder, AsyncTestCompleter],
                (loader, tcb: TestComponentBuilder, async) => {
                  tcb.overrideView(MyComp, new ViewMetadata({
                                     template: '<child-cmp *ng-if="ctxBoolProp"></child-cmp>',
                                     directives: [NgIf, ChildComp]
                                   }))
                      .overrideView(
                          ChildComp,
                          new ViewMetadata(
                              {template: '<location #loc></location>', directives: [Location]}))
                      .createAsync(MyComp)
                      .then((tc) => {
                        tc.componentInstance.ctxBoolProp = true;
                        tc.detectChanges();
                        var childCompEl = tc.query(By.css('child-cmp'));
                        loader.loadIntoLocation(DynamicallyLoaded, childCompEl.elementRef, 'loc')
                            .then(ref => {
                              expect(tc.nativeElement).toHaveText("Location;DynamicallyLoaded;");

                              tc.componentInstance.ctxBoolProp = false;
                              tc.detectChanges();
                              expect(tc.nativeElement).toHaveText("");

                              ref.dispose();
                              expect(tc.nativeElement).toHaveText("");
                              async.done();
                            });
                      });
                }));

      it('should update host properties',
         inject(
             [DynamicComponentLoader, TestComponentBuilder, AsyncTestCompleter],
             (loader, tcb: TestComponentBuilder, async) => {
               tcb.overrideView(
                      MyComp, new ViewMetadata(
                                  {template: '<location #loc></location>', directives: [Location]}))
                   .createAsync(MyComp)
                   .then((tc) => {
                     loader.loadIntoLocation(DynamicallyLoadedWithHostProps, tc.elementRef, 'loc')
                         .then(ref => {
                           ref.instance.id = "new value";

                           tc.detectChanges();

                           var newlyInsertedElement = DOM.childNodes(tc.nativeElement)[1];
                           expect((<HTMLElement>newlyInsertedElement).id).toEqual("new value");
                           async.done();
                         });
                   });
             }));

      it('should throw if the variable does not exist',
         inject([DynamicComponentLoader, TestComponentBuilder, AsyncTestCompleter],
                (loader, tcb: TestComponentBuilder, async) => {
                  tcb.overrideView(
                         MyComp,
                         new ViewMetadata(
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
      it('should work', inject([DynamicComponentLoader, TestComponentBuilder, AsyncTestCompleter],
                               (loader, tcb: TestComponentBuilder, async) => {
                                 tcb.overrideView(
                                        MyComp, new ViewMetadata({
                                          template: '<div><location #loc></location></div>',
                                          directives: [Location]
                                        }))
                                     .createAsync(MyComp)
                                     .then((tc) => {
                                       loader.loadNextToLocation(DynamicallyLoaded, tc.elementRef)
                                           .then(ref => {
                                             expect(tc.nativeElement).toHaveText("Location;");
                                             expect(DOM.nextSibling(tc.nativeElement))
                                                 .toHaveText('DynamicallyLoaded;');

                                             async.done();
                                           });
                                     });
                               }));

      it('should return a disposable component ref',
         inject([DynamicComponentLoader, TestComponentBuilder, AsyncTestCompleter],
                (loader, tcb: TestComponentBuilder, async) => {
                  tcb.overrideView(MyComp, new ViewMetadata({
                                     template: '<div><location #loc></location></div>',
                                     directives: [Location]
                                   }))
                      .

                      createAsync(MyComp)
                      .then((tc) => {
                        loader.loadNextToLocation(DynamicallyLoaded, tc.elementRef)
                            .then(ref => {
                              loader.loadNextToLocation(DynamicallyLoaded2, tc.elementRef)
                                  .then(ref2 => {
                                    var firstSibling = DOM.nextSibling(tc.nativeElement);
                                    var secondSibling = DOM.nextSibling(firstSibling);
                                    expect(tc.nativeElement).toHaveText("Location;");
                                    expect(firstSibling).toHaveText("DynamicallyLoaded;");
                                    expect(secondSibling).toHaveText("DynamicallyLoaded2;");

                                    ref2.dispose();

                                    firstSibling = DOM.nextSibling(tc.nativeElement);
                                    secondSibling = DOM.nextSibling(firstSibling);
                                    expect(secondSibling).toBeNull();

                                    async.done();
                                  });
                            });
                      });
                }));

      it('should update host properties',
         inject([DynamicComponentLoader, TestComponentBuilder, AsyncTestCompleter],
                (loader, tcb: TestComponentBuilder, async) => {
                  tcb.overrideView(MyComp, new ViewMetadata({
                                     template: '<div><location #loc></location></div>',
                                     directives: [Location]
                                   }))

                      .createAsync(MyComp)
                      .then((tc) => {

                        loader.loadNextToLocation(DynamicallyLoadedWithHostProps, tc.elementRef)
                            .then(ref => {
                              ref.instance.id = "new value";

                              tc.detectChanges();

                              var newlyInsertedElement = DOM.nextSibling(tc.nativeElement);
                              expect((<HTMLElement>newlyInsertedElement).id).toEqual("new value");

                              async.done();
                            });
                      });
                }));
    });

    describe('loadAsRoot', () => {
      it('should allow to create, update and destroy components',
         inject([AsyncTestCompleter, DynamicComponentLoader, DOCUMENT, Injector],
                (async, loader, doc, injector) => {
                  var rootEl = el('<child-cmp></child-cmp>');
                  DOM.appendChild(doc.body, rootEl);
                  loader.loadAsRoot(ChildComp, null, injector)
                      .then((componentRef) => {
                        var el = new RootTestComponent(componentRef);
                        expect(rootEl.parentNode).toBe(doc.body);

                        el.detectChanges();

                        expect(rootEl).toHaveText('hello');

                        componentRef.instance.ctxProp = 'new';

                        el.detectChanges();

                        expect(rootEl).toHaveText('new');

                        componentRef.dispose();

                        expect(rootEl.parentNode).toBeFalsy();

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

@Component({selector: 'hello-cmp', viewBindings: [DynamicallyCreatedComponentService]})
@View({template: "{{greeting}}"})
class DynamicallyCreatedCmp implements OnDestroy {
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
