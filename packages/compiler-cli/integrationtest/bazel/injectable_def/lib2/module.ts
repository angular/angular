/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Injector, NgModule} from '@angular/core';
import {Lib1Module, Service} from 'lib1_built/module';

@Component({
  selector: 'lib2-cmp',
  template: '{{instance1}}:{{instance2}}',
})
export class Lib2Cmp {
  instance1: number = -1;
  instance2: number = -1;

  constructor(service: Service, injector: Injector) {
    this.instance1 = service.instance;
    this.instance2 = injector.get(Service).instance;
  }
}

@NgModule({
  declarations: [Lib2Cmp],
  exports: [Lib2Cmp],
  imports: [Lib1Module],
})
export class Lib2Module {
}
