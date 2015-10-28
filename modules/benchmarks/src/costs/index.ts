import {bootstrap} from 'angular2/bootstrap';
import {
  Component,
  Directive,
  DynamicComponentLoader,
  ElementRef,
  View,
  NgIf,
  NgFor
} from 'angular2/core';
import {ApplicationRef} from 'angular2/src/core/application_ref';
import {ListWrapper} from 'angular2/src/core/facade/collection';
import {getIntParameter, bindAction} from 'angular2/src/testing/benchmark_util';

var testList = null;

export function main() {
  var size = getIntParameter('size');
  testList = ListWrapper.createFixedSize(size);

  bootstrap(AppComponent)
      .then((ref) => {
        var injector = ref.injector;
        var app: AppComponent = ref.hostComponent;
        var appRef = injector.get(ApplicationRef);

        bindAction('#reset', function() {
          app.reset();
          appRef.tick();
        });

        // Baseline (plain components)
        bindAction('#createPlainComponents', function() {
          app.createPlainComponents();
          appRef.tick();
        });

        // Components with decorators
        bindAction('#createComponentsWithDirectives', function() {
          app.createComponentsWithDirectives();
          appRef.tick();
        });

        // Components with decorators
        bindAction('#createDynamicComponents', function() {
          app.createDynamicComponents();
          appRef.tick();
        });
      });
}


@Component({selector: 'dummy'})
@View({template: `<div></div>`})
class DummyComponent {
}

@Directive({selector: '[dummy-decorator]'})
class DummyDirective {
}

@Directive({selector: 'dynamic-dummy'})
class DynamicDummy {
  constructor(loader: DynamicComponentLoader, location: ElementRef) {
    loader.loadNextToLocation(DummyComponent, location);
  }
}

@Component({selector: 'app'})
@View({
  directives: [NgIf, NgFor, DummyComponent, DummyDirective, DynamicDummy],
  template: `
    <div *ng-if="testingPlainComponents">
      <dummy *ng-for="#i of list"></dummy>
    </div>

    <div *ng-if="testingWithDirectives">
      <dummy dummy-decorator *ng-for="#i of list"></dummy>
    </div>

    <div *ng-if="testingDynamicComponents">
      <dynamic-dummy *ng-for="#i of list"></dynamic-dummy>
    </div>
  `
})
class AppComponent {
  list: any[];
  testingPlainComponents: boolean;
  testingWithDirectives: boolean;
  testingDynamicComponents: boolean;

  constructor() { this.reset(); }

  reset(): void {
    this.list = [];
    this.testingPlainComponents = false;
    this.testingWithDirectives = false;
    this.testingDynamicComponents = false;
  }

  createPlainComponents(): void {
    this.list = testList;
    this.testingPlainComponents = true;
  }

  createComponentsWithDirectives(): void {
    this.list = testList;
    this.testingWithDirectives = true;
  }

  createDynamicComponents(): void {
    this.list = testList;
    this.testingDynamicComponents = true;
  }
}
