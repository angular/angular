import {Component, Injector, NgModule} from '@angular/core';
import {Lib1Module, Service} from 'lib1_built';

@Component({
  selector: 'test-cmp',
  template: '{{instance1}}:{{instance2}}',
})
export class TestCmp {
  instance1: number;
  instance2: number;

  constructor(service: Service, injector: Injector) {
    this.instance1 = service.instance;
    this.instance2 = injector.get(Service).instance;
  }
}

@NgModule({
  declarations: [TestCmp],
  exports: [TestCmp],
  imports: [Lib1Module],
})
export class Lib2Module {}
