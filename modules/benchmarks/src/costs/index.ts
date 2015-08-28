import {
  bootstrap,
  Component,
  Directive,
  DynamicComponentLoader,
  ElementRef,
  View
} from 'angular2/bootstrap';
import {LifeCycle} from 'angular2/src/core/life_cycle/life_cycle';
import {ListWrapper} from 'angular2/src/core/facade/collection';
import {getIntParameter, bindAction} from 'angular2/src/test_lib/benchmark_util';
import {NgIf, NgFor} from 'angular2/directives';

var testList = null;

export function main() {
  var size = getIntParameter('size');
  testList = ListWrapper.createFixedSize(size);

  bootstrap(AppComponent)
      .then((ref) => {
        var injector = ref.injector;
        var app: AppComponent = ref.hostComponent;
        var lifeCycle = injector.get(LifeCycle);

        bindAction('#reset', function() {
          app.reset();
          lifeCycle.tick();
        });

        // Baseline (plain components)
        bindAction('#createPlainComponents', function() {
          app.createPlainComponents();
          lifeCycle.tick();
        });

        // Components with decorators
        bindAction('#createComponentsWithDirectives', function() {
          app.createComponentsWithDirectives();
          lifeCycle.tick();
        });

        // Components with decorators
        bindAction('#createDynamicComponents', function() {
          app.createDynamicComponents();
          lifeCycle.tick();
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
