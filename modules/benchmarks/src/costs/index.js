import {
  bootstrap,
  DynamicComponentLoader,
  ElementRef
  } from 'angular2/angular2';
import {LifeCycle} from 'angular2/src/core/life_cycle/life_cycle';
import {List, ListWrapper} from 'angular2/src/facade/collection';
import {reflector} from 'angular2/src/reflection/reflection';
import {ReflectionCapabilities} from 'angular2/src/reflection/reflection_capabilities';
import {getIntParameter, bindAction} from 'angular2/src/test_lib/benchmark_util';
import {If, For} from 'angular2/directives';

// TODO(radokirov): Once the application is transpiled by TS instead of Traceur,
// add those imports back into 'angular2/angular2';
import {Component, Decorator} from 'angular2/src/core/annotations_impl/annotations';
import {View} from 'angular2/src/core/annotations_impl/view';

var testList = null;

export function main() {
  reflector.reflectionCapabilities = new ReflectionCapabilities();
  var size = getIntParameter('size');
  testList = ListWrapper.createFixedSize(size);

  bootstrap(AppComponent).then((ref) => {
    var injector = ref.injector;
    var app:AppComponent = injector.get(AppComponent);
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
    bindAction('#createComponentsWithDecorators', function() {
      app.createComponentsWithDecorators();
      lifeCycle.tick();
    });

    // Components with decorators
    bindAction('#createDynamicComponents', function() {
      app.createDynamicComponents();
      lifeCycle.tick();
    });
  });
}

@Component({selector: 'app'})
@View({
  directives: [If, For, DummyComponent, DummyDecorator, DynamicDummy],
  template: `
    <div *if="testingPlainComponents">
      <dummy *for="#i of list"></dummy>
    </div>

    <div *if="testingWithDecorators">
      <dummy dummy-decorator *for="#i of list"></dummy>
    </div>

    <div *if="testingDynamicComponents">
      <dynamic-dummy *for="#i of list"></dynamic-dummy>
    </div>
  `
})
class AppComponent {
  list:List;
  testingPlainComponents:boolean;
  testingWithDecorators:boolean;
  testingDynamicComponents:boolean;

  constructor() {
    this.reset();
  }

  reset():void {
    this.list = [];
    this.testingPlainComponents = false;
    this.testingWithDecorators = false;
    this.testingDynamicComponents = false;
  }

  createPlainComponents():void {
    this.list = testList;
    this.testingPlainComponents = true;
  }

  createComponentsWithDecorators():void {
    this.list = testList;
    this.testingWithDecorators = true;
  }

  createDynamicComponents():void {
    this.list = testList;
    this.testingDynamicComponents = true;
  }
}

@Component({selector: 'dummy'})
@View({template: `<div></div>`})
class DummyComponent {}

@Decorator({selector: '[dummy-decorator]'})
class DummyDecorator {}

@Component({selector: 'dynamic-dummy'})
class DynamicDummy {
  constructor(loader:DynamicComponentLoader, location:ElementRef) {
    loader.loadIntoExistingLocation(DummyComponent, location);
  }
}
