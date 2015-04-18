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
  xit
  } from 'angular2/test_lib';

import {TestBed} from 'angular2/src/test_lib/test_bed';

import {Decorator, Component, Viewport, DynamicComponent} from 'angular2/src/core/annotations/annotations';
import {View} from 'angular2/src/core/annotations/view';
import {DynamicComponentLoader} from 'angular2/src/core/compiler/dynamic_component_loader';
import {ElementRef} from 'angular2/src/core/compiler/element_injector';
import {If} from 'angular2/src/directives/if';

export function main() {
  describe('DynamicComponentLoader', function () {
    describe("loading into existing location", () => {
      it('should work', inject([TestBed, AsyncTestCompleter], (tb, async) => {
        tb.overrideView(MyComp, new View({
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

      it('should inject dependencies of the dynamically-loaded component', inject([TestBed, AsyncTestCompleter], (tb, async) => {
        tb.overrideView(MyComp, new View({
          template: '<dynamic-comp #dynamic></dynamic-comp>',
          directives: [DynamicComp]
        }));

        tb.createView(MyComp).then((view) => {
          var dynamicComponent = view.rawView.locals.get("dynamic");
          dynamicComponent.done.then((ref) => {
            expect(ref.instance.dynamicallyCreatedComponentService).toBeAnInstanceOf(DynamicallyCreatedComponentService);
            async.done();
          });
        });
      }));

      it('should allow to destroy and create them via viewport directives',
        inject([TestBed, AsyncTestCompleter], (tb, async) => {
          tb.overrideView(MyComp, new View({
            template: '<div><dynamic-comp #dynamic template="if: ctxBoolProp"></dynamic-comp></div>',
            directives: [DynamicComp, If]
          }));

          tb.createView(MyComp).then((view) => {
            view.context.ctxBoolProp = true;
            view.detectChanges();
            var dynamicComponent = view.rawView.viewContainers[0].get(0).locals.get("dynamic");
            dynamicComponent.done.then((_) => {
              view.detectChanges();
              expect(view.rootNodes).toHaveText('hello');

              view.context.ctxBoolProp = false;
              view.detectChanges();

              expect(view.rawView.viewContainers[0].length).toBe(0);
              expect(view.rootNodes).toHaveText('');

              view.context.ctxBoolProp = true;
              view.detectChanges();

              var dynamicComponent = view.rawView.viewContainers[0].get(0).locals.get("dynamic");
              return dynamicComponent.done;
            }).then((_) => {
              view.detectChanges();
              expect(view.rootNodes).toHaveText('hello');
              async.done();
            });
          });
        }));
    });

    describe("loading next to an existing location", () => {
      it('should work', inject([DynamicComponentLoader, TestBed, AsyncTestCompleter],
        (loader, tb, async) => {
          tb.overrideView(MyComp, new View({
            template: '<div><location #loc></location></div>',
            directives: [Location]
          }));

          tb.createView(MyComp).then((view) => {
            var location = view.rawView.locals.get("loc");

            loader.loadNextToExistingLocation(DynamicallyLoaded, location.elementRef).then(ref => {
              expect(view.rootNodes).toHaveText("Location;DynamicallyLoaded;")
              async.done();
            });
          });
        }));

      it('should return a disposable component ref', inject([DynamicComponentLoader, TestBed, AsyncTestCompleter],
        (loader, tb, async) => {
          tb.overrideView(MyComp, new View({
            template: '<div><location #loc></location></div>',
            directives: [Location]
          }));

          tb.createView(MyComp).then((view) => {
            var location = view.rawView.locals.get("loc");
            loader.loadNextToExistingLocation(DynamicallyLoaded, location.elementRef).then(ref => {
              loader.loadNextToExistingLocation(DynamicallyLoaded2, location.elementRef).then(ref2 => {
                expect(view.rootNodes).toHaveText("Location;DynamicallyLoaded;DynamicallyLoaded2;")

                ref2.dispose();

                expect(view.rootNodes).toHaveText("Location;DynamicallyLoaded;")

                async.done();
              });
            });
          });
        }));
    });
  });
}


class DynamicallyCreatedComponentService {
}

@DynamicComponent({
  selector: 'dynamic-comp'
})
class DynamicComp {
  done;

  constructor(loader:DynamicComponentLoader, location:ElementRef) {
    this.done = loader.loadIntoExistingLocation(DynamicallyCreatedCmp, location);
  }
}

@Component({
  selector: 'hello-cmp',
  injectables: [DynamicallyCreatedComponentService]
})
@View({
  template: "{{greeting}}"
})
class DynamicallyCreatedCmp {
  greeting:string;
  dynamicallyCreatedComponentService:DynamicallyCreatedComponentService;

  constructor(a:DynamicallyCreatedComponentService) {
    this.greeting = "hello";
    this.dynamicallyCreatedComponentService = a;
  }
}

@Component({selector: 'dummy'})
@View({template: "DynamicallyLoaded;"})
class DynamicallyLoaded {
}

@Component({selector: 'dummy'})
@View({template: "DynamicallyLoaded2;"})
class DynamicallyLoaded2 {
}

@Component({
  selector: 'location'
})
@View({template: "Location;"})
class Location {
  elementRef:ElementRef;

  constructor(elementRef:ElementRef) {
    this.elementRef = elementRef;
  }
}

@Component()
@View({
  directives: []
})
class MyComp {
  ctxBoolProp:boolean;

  constructor() {
    this.ctxBoolProp = false;
  }
}