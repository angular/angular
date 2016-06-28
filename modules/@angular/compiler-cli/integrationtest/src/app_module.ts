/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {LowerCasePipe, NgIf} from '@angular/common';
import {AppModule, Component, ComponentFactoryResolver, Injectable} from '@angular/core';

@Injectable()
export class SomeService {
  public prop = 'someValue';
}

@Injectable()
export class NestedService {
}

@Component({
  selector: 'cmp',
  template: `<div  [title]="'HELLO' | lowercase"></div><div *ngIf="true"></div>`
})
export class SomeComp {
  constructor() {}
}

@Component({selector: 'parent', template: `<cmp></cmp>`, directives: [SomeComp]})
export class ParentComp {
}

@AppModule({providers: [NestedService]})
export class NestedModule {
}

@AppModule({
  directives: [NgIf],
  pipes: [LowerCasePipe],
  providers: [SomeService],
  precompile: [SomeComp],
  modules: [NestedModule]
})
export class SomeModule {
}

@AppModule({
  directives: [NgIf],
  pipes: [LowerCasePipe],
  precompile: [ParentComp],
})
export class SomeModuleUsingParentComp {
}
