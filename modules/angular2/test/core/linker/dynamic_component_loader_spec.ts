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
  beforeEachProviders,
  it,
  xit,
  TestComponentBuilder,
  ComponentFixture
} from 'angular2/testing_internal';

import {Predicate} from 'angular2/src/facade/collection';
import {Injector, OnDestroy, DebugElement, Type} from 'angular2/core';
import {NgIf} from 'angular2/common';
import {Component, ViewMetadata} from 'angular2/src/core/metadata';
import {DynamicComponentLoader} from 'angular2/src/core/linker/dynamic_component_loader';
import {ElementRef, ElementRef_} from 'angular2/src/core/linker/element_ref';
import {DOCUMENT} from 'angular2/src/platform/dom/dom_tokens';
import {DOM} from 'angular2/src/platform/dom/dom_adapter';
import {ComponentFixture_} from "angular2/src/testing/test_component_builder";
import {BaseException} from 'angular2/src/facade/exceptions';
import {PromiseWrapper} from 'angular2/src/facade/promise';

export function main() {
  describe('DynamicComponentLoader', function() {
    describe("loading into a location", () => {
      it('should work',
         inject([DynamicComponentLoader, TestComponentBuilder, AsyncTestCompleter],
                (loader: DynamicComponentLoader, tcb: TestComponentBuilder, async) => {
                  tcb.overrideView(
                         MyComp,
                         new ViewMetadata(
                             {template: '<location #loc></location>', directives: [Location]}))
                      .createAsync(MyComp)
                      .then((tc) => {
                        loader.loadIntoLocation(DynamicallyLoaded, tc.elementRef, 'loc')
                            .then(ref => {
                              expect(tc.debugElement.nativeElement)
                                  .toHaveText("Location;DynamicallyLoaded;");
                              async.done();
                            });
                      });
                }));

      it('should return a disposable component ref',
         inject([DynamicComponentLoader, TestComponentBuilder, AsyncTestCompleter],
                (loader: DynamicComponentLoader, tcb: TestComponentBuilder, async) => {
                  tcb.overrideView(
                         MyComp,
                         new ViewMetadata(
                             {template: '<location #loc></location>', directives: [Location]}))
                      .createAsync(MyComp)
                      .then((tc) => {

                        loader.loadIntoLocation(DynamicallyLoaded, tc.elementRef, 'loc')
                            .then(ref => {
                              ref.dispose();
                              expect(tc.debugElement.nativeElement).toHaveText("Location;");
                              async.done();
                            });
                      });
                }));

      it('should allow to dispose even if the location has been removed',
         inject([DynamicComponentLoader, TestComponentBuilder, AsyncTestCompleter],
                (loader: DynamicComponentLoader, tcb: TestComponentBuilder, async) => {
                  tcb.overrideView(MyComp, new ViewMetadata({
                                     template: '<child-cmp *ngIf="ctxBoolProp"></child-cmp>',
                                     directives: [NgIf, ChildComp]
                                   }))
                      .overrideView(
                          ChildComp,
                          new ViewMetadata(
                              {template: '<location #loc></location>', directives: [Location]}))
                      .createAsync(MyComp)
                      .then((tc) => {
                        tc.debugElement.componentInstance.ctxBoolProp = true;
                        tc.detectChanges();
                        var childElementRef = tc.debugElement.query(filterByDirective(ChildComp))
                                                  .inject(ChildComp)
                                                  .elementRef;
                        loader.loadIntoLocation(DynamicallyLoaded, childElementRef, 'loc')
                            .then(ref => {
                              expect(tc.debugElement.nativeElement)
                                  .toHaveText("Location;DynamicallyLoaded;");

                              tc.debugElement.componentInstance.ctxBoolProp = false;
                              tc.detectChanges();
                              expect(tc.debugElement.nativeElement).toHaveText("");

                              ref.dispose();
                              expect(tc.debugElement.nativeElement).toHaveText("");
                              async.done();
                            });
                      });
                }));

      it('should update host properties',
         inject(
             [DynamicComponentLoader, TestComponentBuilder, AsyncTestCompleter],
             (loader: DynamicComponentLoader, tcb: TestComponentBuilder, async) => {
               tcb.overrideView(
                      MyComp, new ViewMetadata(
                                  {template: '<location #loc></location>', directives: [Location]}))
                   .createAsync(MyComp)
                   .then((tc) => {
                     loader.loadIntoLocation(DynamicallyLoadedWithHostProps, tc.elementRef, 'loc')
                         .then(ref => {
                           ref.instance.id = "new value";

                           tc.detectChanges();

                           var newlyInsertedElement =
                               DOM.childNodes(tc.debugElement.nativeElement)[1];
                           expect((<HTMLElement>newlyInsertedElement).id).toEqual("new value");
                           async.done();
                         });
                   });
             }));

      it('should leave the view tree in a consistent state if hydration fails',
         inject([DynamicComponentLoader, TestComponentBuilder, AsyncTestCompleter],
                (loader: DynamicComponentLoader, tcb: TestComponentBuilder, async) => {
                  tcb.overrideView(MyComp, new ViewMetadata({
                                     template: '<div><location #loc></location></div>',
                                     directives: [Location]
                                   }))
                      .createAsync(MyComp)
                      .then((tc: ComponentFixture) => {
                        PromiseWrapper.catchError(
                            loader.loadIntoLocation(DynamicallyLoadedThrows, tc.elementRef, 'loc'),
                            (error) => {
                              expect(error.message).toContain("ThrownInConstructor");
                              expect(() => tc.detectChanges()).not.toThrow();
                              async.done();
                              return null;
                            });
                      });
                }));

      it('should throw if the variable does not exist',
         inject([DynamicComponentLoader, TestComponentBuilder, AsyncTestCompleter],
                (loader: DynamicComponentLoader, tcb: TestComponentBuilder, async) => {
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

      it('should allow to pass projectable nodes',
         inject([DynamicComponentLoader, TestComponentBuilder, AsyncTestCompleter],
                (loader: DynamicComponentLoader, tcb: TestComponentBuilder, async) => {
                  tcb.overrideView(MyComp,
                                   new ViewMetadata({template: '<div #loc></div>', directives: []}))
                      .createAsync(MyComp)
                      .then((tc) => {
                        loader.loadIntoLocation(DynamicallyLoadedWithNgContent, tc.elementRef,
                                                'loc', null, [[DOM.createTextNode('hello')]])
                            .then(ref => {
                              tc.detectChanges();
                              expect(tc.nativeElement).toHaveText('dynamic(hello)');
                              async.done();
                            });
                      });
                }));

      it('should not throw if not enough projectable nodes are passed in',
         inject([DynamicComponentLoader, TestComponentBuilder, AsyncTestCompleter],
                (loader: DynamicComponentLoader, tcb: TestComponentBuilder, async) => {
                  tcb.overrideView(MyComp,
                                   new ViewMetadata({template: '<div #loc></div>', directives: []}))
                      .createAsync(MyComp)
                      .then((tc) => {
                        loader.loadIntoLocation(DynamicallyLoadedWithNgContent, tc.elementRef,
                                                'loc', null, [])
                            .then((_) => { async.done(); });
                      });
                }));

    });

    describe("loading next to a location", () => {
      it('should work',
         inject([DynamicComponentLoader, TestComponentBuilder, AsyncTestCompleter],
                (loader: DynamicComponentLoader, tcb: TestComponentBuilder, async) => {
                  tcb.overrideView(MyComp, new ViewMetadata({
                                     template: '<div><location #loc></location></div>',
                                     directives: [Location]
                                   }))
                      .createAsync(MyComp)
                      .then((tc) => {
                        loader.loadNextToLocation(DynamicallyLoaded, tc.elementRef)
                            .then(ref => {
                              expect(tc.debugElement.nativeElement).toHaveText("Location;");
                              expect(DOM.nextSibling(tc.debugElement.nativeElement))
                                  .toHaveText('DynamicallyLoaded;');

                              async.done();
                            });
                      });
                }));

      it('should return a disposable component ref',
         inject([DynamicComponentLoader, TestComponentBuilder, AsyncTestCompleter],
                (loader: DynamicComponentLoader, tcb: TestComponentBuilder, async) => {
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
                                    var firstSibling =
                                        DOM.nextSibling(tc.debugElement.nativeElement);
                                    var secondSibling = DOM.nextSibling(firstSibling);
                                    expect(tc.debugElement.nativeElement).toHaveText("Location;");
                                    expect(firstSibling).toHaveText("DynamicallyLoaded;");
                                    expect(secondSibling).toHaveText("DynamicallyLoaded2;");

                                    ref2.dispose();

                                    firstSibling = DOM.nextSibling(tc.debugElement.nativeElement);
                                    secondSibling = DOM.nextSibling(firstSibling);
                                    expect(secondSibling).toBeNull();

                                    async.done();
                                  });
                            });
                      });
                }));

      it('should update host properties',
         inject([DynamicComponentLoader, TestComponentBuilder, AsyncTestCompleter],
                (loader: DynamicComponentLoader, tcb: TestComponentBuilder, async) => {
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

                              var newlyInsertedElement =
                                  DOM.nextSibling(tc.debugElement.nativeElement);
                              expect((<HTMLElement>newlyInsertedElement).id).toEqual("new value");

                              async.done();
                            });
                      });
                }));

      it('should allow to pass projectable nodes',
         inject([DynamicComponentLoader, TestComponentBuilder, AsyncTestCompleter],
                (loader: DynamicComponentLoader, tcb: TestComponentBuilder, async) => {
                  tcb.overrideView(MyComp, new ViewMetadata({template: '', directives: [Location]}))
                      .createAsync(MyComp)
                      .then((tc) => {
                        loader.loadNextToLocation(DynamicallyLoadedWithNgContent, tc.elementRef,
                                                  null, [[DOM.createTextNode('hello')]])
                            .then(ref => {
                              tc.detectChanges();
                              var newlyInsertedElement =
                                  DOM.nextSibling(tc.debugElement.nativeElement);
                              expect(newlyInsertedElement).toHaveText('dynamic(hello)');
                              async.done();
                            });
                      });
                }));

    });

    describe('loadAsRoot', () => {
      it('should allow to create, update and destroy components',
         inject([AsyncTestCompleter, DynamicComponentLoader, DOCUMENT, Injector],
                (async, loader: DynamicComponentLoader, doc, injector: Injector) => {
                  var rootEl = createRootElement(doc, 'child-cmp');
                  DOM.appendChild(doc.body, rootEl);
                  loader.loadAsRoot(ChildComp, null, injector)
                      .then((componentRef) => {
                        var el = new ComponentFixture_(componentRef);

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

      it('should allow to pass projectable nodes',
         inject([AsyncTestCompleter, DynamicComponentLoader, DOCUMENT, Injector],
                (async, loader: DynamicComponentLoader, doc, injector: Injector) => {
                  var rootEl = createRootElement(doc, 'dummy');
                  DOM.appendChild(doc.body, rootEl);
                  loader.loadAsRoot(DynamicallyLoadedWithNgContent, null, injector, null,
                                    [[DOM.createTextNode('hello')]])
                      .then((_) => {
                        expect(rootEl).toHaveText('dynamic(hello)');

                        async.done();
                      });
                }));

    });

  });
}

function createRootElement(doc: any, name: string): any {
  var nodes = DOM.querySelectorAll(doc, name);
  for (var i = 0; i < nodes.length; i++) {
    DOM.remove(nodes[i]);
  }
  var rootEl = el(`<${name}></${name}>`);
  DOM.appendChild(doc.body, rootEl);
  return rootEl;
}

function filterByDirective(type: Type): Predicate<DebugElement> {
  return (debugElement) => { return debugElement.providerTokens.indexOf(type) !== -1; };
}

@Component({selector: 'child-cmp', template: '{{ctxProp}}'})
class ChildComp {
  ctxProp: string;
  constructor(public elementRef: ElementRef) { this.ctxProp = 'hello'; }
}


class DynamicallyCreatedComponentService {}

@Component({
  selector: 'hello-cmp',
  viewProviders: [DynamicallyCreatedComponentService],
  template: "{{greeting}}"
})
class DynamicallyCreatedCmp implements OnDestroy {
  greeting: string;
  dynamicallyCreatedComponentService: DynamicallyCreatedComponentService;
  destroyed: boolean = false;

  constructor(a: DynamicallyCreatedComponentService) {
    this.greeting = "hello";
    this.dynamicallyCreatedComponentService = a;
  }

  ngOnDestroy() { this.destroyed = true; }
}

@Component({selector: 'dummy', template: "DynamicallyLoaded;"})
class DynamicallyLoaded {
}

@Component({selector: 'dummy', template: "DynamicallyLoaded;"})
class DynamicallyLoadedThrows {
  constructor() { throw new BaseException("ThrownInConstructor"); }
}

@Component({selector: 'dummy', template: "DynamicallyLoaded2;"})
class DynamicallyLoaded2 {
}

@Component({selector: 'dummy', host: {'[id]': 'id'}, template: "DynamicallyLoadedWithHostProps;"})
class DynamicallyLoadedWithHostProps {
  id: string;

  constructor() { this.id = "default"; }
}

@Component({selector: 'dummy', template: "dynamic(<ng-content></ng-content>)"})
class DynamicallyLoadedWithNgContent {
  id: string;

  constructor() { this.id = "default"; }
}

@Component({selector: 'location', template: "Location;"})
class Location {
  elementRef: ElementRef;

  constructor(elementRef: ElementRef) { this.elementRef = elementRef; }
}

@Component({selector: 'my-comp', directives: []})
class MyComp {
  ctxBoolProp: boolean;

  constructor() { this.ctxBoolProp = false; }
}
