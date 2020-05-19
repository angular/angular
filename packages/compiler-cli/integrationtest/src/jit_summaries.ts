/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Directive, Injectable, NgModule, Pipe} from '@angular/core';

const instances = new Map<any, Base>();

export function expectInstanceCreated(type: any) {
  const instance = instances.get(type)!;
  expect(instance).toBeDefined();
  expect(instance.dep instanceof SomeDep).toBe(true);
}

export class SomeDep {}

export class Base {
  constructor(public dep: SomeDep) {
    instances.set(Object.getPrototypeOf(this).constructor, this);
  }
}

@Component({templateUrl: './jit_summaries.html'})
export class SomePrivateComponent extends Base {
}

@Component({templateUrl: './jit_summaries.html'})
export class SomePublicComponent extends Base {
}

@Directive({selector: '[someDir]'})
export class SomeDirective extends Base {
}

@Pipe({name: 'somePipe'})
export class SomePipe extends Base {
  transform(value: any) {
    return value;
  }
}

@Injectable()
export class SomeService extends Base {
}

@NgModule({
  declarations: [SomePublicComponent, SomePrivateComponent, SomeDirective, SomePipe],
  exports: [SomeDirective, SomePipe, SomePublicComponent],
  providers: [SomeService]
})
export class SomeModule extends Base {
}
