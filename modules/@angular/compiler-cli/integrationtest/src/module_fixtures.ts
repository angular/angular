/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {LowerCasePipe, NgIf} from '@angular/common';
import {ANALYZE_FOR_PRECOMPILE, AppModule, Component, ComponentFactoryResolver, Inject, Injectable, OpaqueToken} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

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
  modules: [NestedModule, BrowserModule]
})
export class SomeModule {
}

@AppModule({
  directives: [NgIf],
  pipes: [LowerCasePipe],
  precompile: [ParentComp],
  modules: [BrowserModule]
})
export class SomeModuleUsingParentComp {
}

export const SOME_TOKEN = new OpaqueToken('someToken');

export function provideValueWithPrecompile(value: any) {
  return [
    {provide: SOME_TOKEN, useValue: value},
    {provide: ANALYZE_FOR_PRECOMPILE, useValue: value, multi: true},
  ];
}

@AppModule({providers: [provideValueWithPrecompile([{a: 'b', component: SomeComp}])]})
export class SomeModuleWithAnalyzePrecompileProvider {
  constructor(@Inject(SOME_TOKEN) public providedValue: any) {}
}
